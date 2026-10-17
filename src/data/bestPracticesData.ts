import { ProductionBestPractice } from '../types';

export const productionBestPractices: ProductionBestPractice[] = [
  // 1. Netflix: Automated Lakehouse Compaction & Metadata Lifecycle
  {
    id: 'netflix-iceberg-compaction',
    title: 'Otonom Tablo Bakımı: Compaction, Snapshot Süresi & Orphan Temizliği',
    category: 'lakehouse',
    categoryLabel: 'Lakehouse & Tablo Bakımı',
    provenance: 'Netflix Data Platform Engineering',
    githubSource: 'github.com/apache/iceberg & Netflix Maestro Workflows',
    problemSummary: 'Yüksek frekanslı akış (streaming) veya micro-batch yazımları S3/GCS üzerinde milyonlarca küçük Parquet dosyası (100KB-5MB) üretir. Bu durum S3 503 Slow Down rate limitlerine, Trino/Spark sorgu planlama aşamasında Coordinator OOM çökmelerine ve eski snapshot\'lar yüzünden devasa hayalet depolama faturalarına yol açar.',
    impactMetrics: 'Trino sorgu planlama süresi 45 sn -> 350 ms, S3 API maliyeti %85 düşüş, sıfır 503 throttling',
    architectureFlow: `[Streaming / Micro-Batch Writers]
       │ (writes small files continuously)
       ▼
[Amazon S3 / GCS Data Lake]
       ▲
       │ (Decoupled Nightly Maintenance Cluster)
┌──────┴────────────────────────────────────────────────────────┐
│ 1. rewrite_data_files: Bin-pack small files into 512 MB       │
│ 2. rewrite_manifests: Defragment metadata manifests           │
│ 3. expire_snapshots: Purge history older than 7 days          │
│ 4. remove_orphan_files: Delete uncommitted files (> 3 days)   │
└───────────────────────────────────────────────────────────────┘`,
    codeTitle: 'iceberg_table_maintenance.py (PySpark)',
    codeLanguage: 'python',
    codeSnippet: `"""
Production Apache Iceberg Table Maintenance Job
Orchestrated nightly via Airflow/Dagster on a dedicated maintenance cluster.
"""
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("IcebergAutonomousMaintenance")
    .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions")
    .config("spark.sql.catalog.prod_catalog", "org.apache.iceberg.spark.SparkCatalog")
    .config("spark.sql.catalog.prod_catalog.type", "glue")
    .config("spark.sql.catalog.prod_catalog.warehouse", "s3://prod-lakehouse-data/warehouse/")
    .getOrCreate()
)

target_table = "prod_catalog.core_domain.fact_customer_events"

# 1. COMPACTION: Küçük dosyaları birleştirip 512MB Parquet haline getirir
# Zaten ideal boyutta olan dosyaları atlayarak hesaplama maliyetini düşürür
print("Adım 1: Bin-pack Compaction çalıştırılıyor...")
spark.sql(f"""
    CALL prod_catalog.system.rewrite_data_files(
        table => '{target_table}',
        strategy => 'binpack',
        options => map(
            'target-file-size-bytes', '536870912',       -- 512 MB hedef boyut
            'min-file-size-bytes',    '134217728',       -- < 128 MB dosyalar birleştirilir
            'max-file-size-bytes',    '1073741824',      -- > 1 GB dosyalar bölünür
            'min-input-files',        '5',               -- Bölümde 5'ten az dosya varsa dokunma
            'max-concurrent-file-group-rewrites', '10'   -- Paralellik sınırı
        )
    )
""").show()

# 2. MANIFEST REWRITE: Metadata manifest dosyalarını birleştirir (Hızlı Planlama)
print("Adım 2: Manifest defragmentation...")
spark.sql(f"""
    CALL prod_catalog.system.rewrite_manifests(
        table => '{target_table}',
        use_caching => true
    )
""").show()

# 3. EXPIRE SNAPSHOTS: 7 günden eski snapshot'ları ve geçmiş versiyonları temizler
print("Adım 3: Eski snapshot'lar temizleniyor...")
spark.sql(f"""
    CALL prod_catalog.system.expire_snapshots(
        table => '{target_table}',
        older_than => TIMESTAMPADD(DAY, -7, CURRENT_TIMESTAMP()),
        retain_last => 10
    )
""").show()

# 4. ORPHAN FILE CLEANUP: Yazma hatası sonucu kalmış yetim dosyaları siler
# DİKKAT: older_than süresi çalışan en uzun yazma işleminden daha uzun olmalıdır!
print("Adım 4: Yetim dosyalar (orphan files) siliniyor...")
spark.sql(f"""
    CALL prod_catalog.system.remove_orphan_files(
        table => '{target_table}',
        older_than => TIMESTAMPADD(DAY, -3, CURRENT_TIMESTAMP())
    )
""").show()`,
    dos: [
      'remove_orphan_files için older_than eşiğini en az 24-72 saat öncesi olarak ayarlayın; in-flight yazımların silinmesini önler.',
      'Büyük toplu yüklemelerden (bulk load) sonra mutlaka rewrite_manifests çalıştırın.',
      'Sık sorgulanan belirli kolonlar varsa (user_id, event_time) binpack yerine Z-Order sort stratejisini tercih edin.',
      'Tablo bakımını canlı akış boru hattından ayırıp gece çalışan ayrı bir kümede çalıştırın.'
    ],
    donts: [
      'Compaction işlemini canlı streaming akışının içine (inline) koymayın; işlem çakışmalarına (OCC conflicts) yol açar.',
      'Snapshot silerken retain_last parametresini asla boş bırakmayın; tablonun son snapshot\'larının silinmesini engelleyin.',
      'Yetim dosya temizliğini (orphan cleanup) sıfır saniye eşiğiyle çalıştırmayın; o an veri yazan işlerin dosyaları silinir.'
    ],
    antiPatternWarning: 'Compaction yapılmayan göllerde 6 ay içinde milyonlarca 100 KB dosya birikir; Trino veya Athena sorguları "Query Timeout" hatası verir.',
    tags: ['Apache Iceberg', 'Delta Lake', 'Compaction', 'Netflix', 'S3 Optimization', 'Small Files']
  },

  // 2. Airbnb: Idempotent Date Partitioning & Atomic Exchange
  {
    id: 'airbnb-idempotent-dag',
    title: 'İdempotent Tarih Bölümleme & Atomik Değişim (Atomic Swap)',
    category: 'orchestration',
    categoryLabel: 'Orkestrasyon & Backfill',
    provenance: 'Airbnb Engineering (Airflow Origins)',
    githubSource: 'github.com/apache/airflow & Airbnb Tech Blog',
    problemSummary: 'Klasik veri boru hatları hata alıp otomatik retry yaptığında veya geçmişe dönük backfill çalıştırıldığında veriyi iki kez (duplicate) yazar. Ayrıca saatler süren backfill sırasında son kullanıcılar yarım hesaplanmış eksik tablolar görür.',
    impactMetrics: '%100 deterministik backfill, sıfır yinelenen veri (zero duplicate), sıfır kesintiyle anlık veri değişimi',
    architectureFlow: `[Airflow DAG: {{ data_interval_start }}]
       │
       ▼
[Spark Compute: Dynamic Partition Overwrite]
       │
       ▼ (Writes ONLY to isolated staging partition)
[Staging Table: staging.fact_bookings_staging]
       │
       ▼ (Circuit Breaker: Row count > threshold & Data Quality Pass)
[Data Quality Gate] ──(Passes)──> [Atomic Swap: ALTER TABLE ... REPLACE PARTITION]
                                             │
                                             ▼
                                  [Production Analytics Table]`,
    codeTitle: 'idempotent_airflow_dag.py (Airflow 2.x)',
    codeLanguage: 'python',
    codeSnippet: `"""
Airbnb-style Idempotent Airflow DAG
- Dynamic partition overwrite: Retry edildiğinde asla satır çoğaltmaz
- Staging table + Kalite kapısı ile atomik üretim değişimi
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.operators.empty import EmptyOperator

DEFAULT_ARGS = {
    "owner": "data_platform",
    "depends_on_past": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
}

def run_quality_gate(**context):
    """Devre Kesici (Circuit Breaker): Üretime almadan önce veriyi doğrular."""
    target_date = context["data_interval_start"].strftime("%Y-%m-%d")
    print(f"Validating staging partition for date: {target_date}")
    
    # Simüle edilmiş kontrol: Satır sayısı > 0 ve anomali kontrolü
    staging_row_count = 1250000 
    if staging_row_count < 100000:
        raise ValueError(f"Quality Gate FAILED: Beklenmedik düşük hacim {staging_row_count}")
    print("Kalite kontrolü başarıyla geçti.")

with DAG(
    dag_id="core_fact_bookings_daily_idempotent",
    default_args=DEFAULT_ARGS,
    schedule="0 3 * * *",  # Her gün 03:00 UTC
    start_date=datetime(2025, 1, 1),
    catchup=False,         # Kontrolsüz backfill'i engeller
    max_active_runs=3,     # Eşzamanlı güvenli backfill sınırı
    tags=["airbnb", "idempotent", "production"],
) as dag:

    start = EmptyOperator(task_id="start")

    # Adım 1: Sadece ilgili güne ait veriyi dinamik overwrite ile staging'e yaz
    compute_staging = SparkSubmitOperator(
        task_id="compute_staging_partition",
        application="/opt/spark/jobs/compute_bookings.py",
        conf={
            # Spark yalnızca ilgili günün dizinini ezer, tüm tabloyu silmez!
            "spark.sql.sources.partitionOverwriteMode": "dynamic",
        },
        application_args=[
            "--target-date", "{{ data_interval_start.strftime('%Y-%m-%d') }}",
            "--output-table", "staging.fact_bookings_staging"
        ],
    )

    # Adım 2: Kalite Kontrol Devre Kesicisi
    quality_gate = PythonOperator(
        task_id="quality_gate_circuit_breaker",
        python_callable=run_quality_gate,
    )

    # Adım 3: Atomik Partisyon Takası (Production Swap)
    publish_prod = SparkSubmitOperator(
        task_id="atomic_publish_to_prod",
        application="/opt/spark/jobs/atomic_swap.py",
        application_args=[
            "--partition-date", "{{ data_interval_start.strftime('%Y-%m-%d') }}",
            "--staging-table", "staging.fact_bookings_staging",
            "--target-table", "analytics.fact_bookings"
        ],
    )

    end = EmptyOperator(task_id="end")

    start >> compute_staging >> quality_gate >> publish_prod >> end`,
    dos: [
      'Tarihsel filtrelerde her zaman {{ data_interval_start }} kullanın; asla datetime.now() veya CURRENT_DATE kullanmayın.',
      'Spark tarafında spark.sql.sources.partitionOverwriteMode = dynamic parametresini zorunlu kılın.',
      'Üretime yazmadan önce bir staging tablosunda veri kalite kontrollerini çalıştırın; hata varsa üretim verisi bozulmaz.'
    ],
    donts: [
      'SQL içinde datetime.now() çağırmayın; bu sorgu 1 yıl önceki veriyi backfill yaparken bugünün tarihini alarak bozulur.',
      'max_active_runs limiti koymadan catchup=True yapmayın; 3 yıllık geçmiş için aynı anda 1000 DAG açılıp küme kilitlenir.',
      'INSERT INTO yerine idempotent olmayan eklemeler yapmayın; retry anında kayıtlar 2 katına çıkar.'
    ],
    antiPatternWarning: 'Pipeline retry aldığında müşteri siparişleri iki kez toplanır ve finansal raporlarda ciro iki katı görünür.',
    tags: ['Apache Airflow', 'Idempotency', 'Backfill', 'Airbnb', 'Spark', 'Circuit Breakers']
  },

  // 3. Stripe & PayPal: Open Data Contracts & CI/CD Shift-Left Schema Enforcement
  {
    id: 'stripe-data-contracts',
    title: 'Üretici Taraflı Veri Sözleşmeleri (Data Contracts) & CI/CD Doğrulaması',
    category: 'contracts',
    categoryLabel: 'Veri Sözleşmeleri (Contracts)',
    provenance: 'Stripe & PayPal / Bitol Open Data Contract Standard (ODCS)',
    githubSource: 'github.com/bitol-io/open-data-contract-standard & Stripe Tech',
    problemSummary: 'Backend yazılım mühendisleri mikroservis veritabanında kolon adını değiştirdiğinde (ör. customer_id -> account_uuid), veri mühendisliği boru hatları gece saat 02:00\'de çöker. Analitik ekipleri verinin çöplüğe dönmesini engellemek için üreticilerle resmi sözleşmelere ihtiyaç duyar.',
    impactMetrics: 'Sıfır beklenmedik şema kırılması, PR aşamasında engellenen breaking changes, %100 SLA uyumu',
    architectureFlow: `[Backend App PR (GitHub/GitLab)]
       │ (Developer touches orders schema)
       ▼
[CI/CD Pipeline: GitHub Actions]
       │
       ▼ (Runs: datacontract test against ODCS Specification)
┌────────────────────────────────────────────────────────┐
│ - Lint Contract Syntax                                │
│ - Verify Backward Compatibility                        │
│ - Block PR if breaking change without major version bump│
└────────────────────────────────────────────────────────┘
       │ (Merged)
       ▼
[Kafka Topic / Lakehouse Sink] ──(Enforces: dbt model contract)──> [Analytics Ready]`,
    codeTitle: 'orders_data_contract.yaml (ODCS v3.0)',
    codeLanguage: 'yaml',
    codeSnippet: `dataContractSpecification: 3.0.0
id: urn:datacontract:checkout:orders
info:
  title: Checkout Orders Domain Contract
  version: 2.1.0
  description: Onaylanmış e-ticaret siparişleri için kurumsal veri sözleşmesi.
  owner: team-checkout-backend@company.com
  contact:
    slack: "#checkout-data-eng"

servers:
  production:
    type: kafka
    cluster: prod-us-east-1.kafka.internal:9092
    topic: checkout.orders.v2
  lakehouse:
    type: s3
    format: iceberg
    table: prod_catalog.checkout.orders_v2

models:
  order_event:
    description: Tekil sipariş işlem kaydı
    type: table
    fields:
      order_id:
        type: string
        format: uuid
        required: true
        unique: true
        description: Checkout servisi tarafından üretilen tekil anahtar.
      customer_id:
        type: string
        format: uuid
        required: true
        tags: ["pii:pseudonymized"]
      total_amount_cents:
        type: long
        required: true
        minimum: 0
        description: Kuruş cinsinden sipariş tutarı (float yuvarlama hatasını önler).
      payment_status:
        type: string
        required: true
        enum: ["PENDING", "AUTHORIZED", "SETTLED", "REFUNDED", "FAILED"]
      created_at:
        type: timestamp
        required: true

serviceLevelAgreement:
  freshness:
    threshold: 15m
    description: Veri siparişten sonra 15 dakika içinde Kafka'ya teslim edilmelidir.
  availability:
    percentage: 99.9%
  retention:
    period: 7 years

quality:
  type: SodaCL
  rules:
    - row_count > 0
    - duplicate_count(order_id) = 0
    - missing_count(total_amount_cents) = 0
    - invalid_count(payment_status) = 0`,
    dos: [
      'Veri sözleşmelerini üretici servisin kaynak kod deposunda tutun ve PR testlerinde (CI/CD) otomatik denetleyin.',
      'Sözleşmelerde Semantic Versioning (SemVer) kullanın: Kırıcı değişikliklerde (breaking changes) MAJOR versiyonu artırın ve paralel v2 topic açın.',
      'dbt tarafında fact tablolarında contract: {enforced: true} konfigürasyonunu zorunlu kılın.'
    ],
    donts: [
      'Üretici ekiplerin ham OLTP veritabanı tablolarını doğrudan sözleşmesiz göle aktarmasına izin vermeyin.',
      'Veri sözleşmelerini sadece statik dokümantasyon (wiki sayfası) olarak bırakmayın; CI/CD ve testlerle entegre edin.',
      'Finansal verilerde float/double tipi kullanmayın; her zaman long/integer (kuruş/cent) kullanın.'
    ],
    antiPatternWarning: 'Backend ekibinin yaptığı sessiz bir schema değişikliği yüzünden raporlama tablolarında 1 ay boyunca cirolar hatalı hesaplanır.',
    tags: ['Data Contracts', 'Stripe', 'PayPal', 'ODCS', 'Data Quality', 'CI/CD']
  },

  // 4. Uber: Multi-Tiered Kafka Dead Letter Queue (DLQ) & Non-Blocking Retry
  {
    id: 'uber-kafka-dlq',
    title: 'Kilitlenmeyen Kademeli Gecikmeli Retry & Dead Letter Queue (DLQ)',
    category: 'streaming',
    categoryLabel: 'Streaming & DLQ',
    provenance: 'Uber Engineering (uForwarder Architecture)',
    githubSource: 'github.com/uber/uForwarder & Uber Engineering Blog',
    problemSummary: 'Gerçek zamanlı Kafka tüketicisinde (consumer) hatalı tek bir bozuk mesaj (poison pill) geldiğinde tüketici durur ve aynı mesajı tekrar tekrar dener. Bu durum tüm Kafka partition\'ını kilitler (Head-of-Line Blocking); arkadaki milyonlarca geçerli işlem saatlerce gecikir.',
    impactMetrics: '%99.999 kesintisiz partition tüketimi, sıfır kilitlenme, bozuk mesajların otomatik izolasyonu ve yeniden oynatılabilirlik',
    architectureFlow: `[Main Ingest Topic: orders]
       │
       ├─(Success)──> [Database / Lakehouse Commit]
       │
      (Failure)
       ▼
[Retry Topic 1: orders-retry-1m] (Waits 60 seconds with backoff)
       │
       ├─(Success)──> Done
       │
      (Failure)
       ▼
[Retry Topic 2: orders-retry-5m] (Waits 5 minutes)
       │
       ├─(Success)──> Done
       │
      (Failure / Max Retries Exceeded)
       ▼
[Dead Letter Queue: orders-dlq] ──(Alerts PagerDuty + Saved for CLI Replay)`,
    codeTitle: 'uber_tiered_retry_consumer.py (Python)',
    codeLanguage: 'python',
    codeSnippet: `"""
Uber-style Non-blocking Tiered Kafka Retry Consumer
Handles transient network/DB errors without blocking the primary partition offset.
"""
import json
import time
from confluent_kafka import Consumer, Producer, KafkaException

KAFKA_BROKER = "localhost:9092"
RETRY_TOPICS = {
    1: "orders-retry-1m",
    2: "orders-retry-5m",
}
DLQ_TOPIC = "orders-dlq"

producer = Producer({"bootstrap.servers": KAFKA_BROKER})
consumer = Consumer({
    "bootstrap.servers": KAFKA_BROKER,
    "group.id": "orders-processor-group",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False # Elle commit ederek at-least-once garantisi
})
consumer.subscribe(["orders", "orders-retry-1m", "orders-retry-5m"])

def route_failed_message(msg, current_retries: int, error_str: str):
    """Bozuk mesajı bir sonraki gecikmeli retry topic'ine veya nihai DLQ'ya yönlendirir."""
    new_retries = current_retries + 1
    
    headers = [
        ("retry_count", str(new_retries).encode("utf-8")),
        ("failed_ts", str(int(time.time())).encode("utf-8")),
        ("error_reason", str(error_str).encode("utf-8")),
        ("original_topic", msg.topic().encode("utf-8"))
    ]

    target_topic = RETRY_TOPICS.get(new_retries, DLQ_TOPIC)
    if target_topic == DLQ_TOPIC:
        print(f"KRİTİK: Mesaj {msg.key()} retry sınırını aştı! DLQ'ya aktarılıyor.")
    else:
        print(f"Geçici Hata: Mesaj {msg.key()} -> {target_topic} yönlendirildi.")

    producer.produce(
        topic=target_topic,
        key=msg.key(),
        value=msg.value(),
        headers=headers
    )
    producer.flush()

def process_transaction(payload: dict):
    # İş mantığı: Negatif tutar gelirse poison pill hatası fırlat
    if payload.get("amount_cents", 0) < 0:
        raise ValueError("Poison Pill: Geçersiz negatif sipariş tutarı!")
    # Başarılı kayıt işlemleri...

while True:
    msg = consumer.poll(timeout=1.0)
    if msg is None:
        continue
    if msg.error():
        raise KafkaException(msg.error())

    headers = dict(msg.headers() or [])
    retries = int(headers.get(b"retry_count", b"0").decode("utf-8"))

    try:
        data = json.loads(msg.value().decode("utf-8"))
        process_transaction(data)
        # Başarılı: Asıl mesajın offset'ini commit et
        consumer.commit(msg, asynchronous=False)
    except Exception as exc:
        # Hata durumunda mesajı retry/DLQ'ya yolla ve ASIL OFFSET'İ COMMIT ET!
        # Böylece arkadaki sağlıklı mesajlar beklemeden akmaya devam eder!
        route_failed_message(msg, retries, str(exc))
        consumer.commit(msg, asynchronous=False)`,
    dos: [
      'DLQ\'ya yazarken mutlaka hata mesajını (stack trace), orijinal partition ve offset bilgilerini header\'a ekleyin.',
      'Sözdizimi bozuk (JSON parse hatası) mesajları gecikmeli retry kuyruklarına göndermeyin; doğrudan DLQ\'ya yönlendirin.',
      'DLQ kuyruğundaki mesajları hata düzeltildikten sonra ana akışa geri besleyen (DLQ Replayer) araçlar geliştirin.'
    ],
    donts: [
      'Tüketici döngüsü içinde sonsuz while(retry) yapmayın; tüm partition lag tavan yapar.',
      'Hatalı mesajı log dosyasına yazıp mesajı yok saymayın; denetlenemez veri kaybına yol açar.',
      'Retry topic\'lerinden gelen mesajları anında işlemeyin; gecikme zaman damgasına göre bekletin.'
    ],
    antiPatternWarning: 'Tek bir bozuk JSON mesajı yüzünden Kafka tüketicisi kilitlenir; 4 saat boyunca 500.000 işlem bekler.',
    tags: ['Apache Kafka', 'Uber', 'Dead Letter Queue', 'Fault Tolerance', 'Streaming Resiliency']
  },

  // 5. Databricks: Liquid Clustering & Medallion Change Data Feed
  {
    id: 'databricks-liquid-clustering',
    title: 'Liquid Clustering & Değişim Veri Akışı (Change Data Feed) Medallion Mimarisi',
    category: 'lakehouse',
    categoryLabel: 'Lakehouse & Tablo Bakımı',
    provenance: 'Databricks Engineering',
    githubSource: 'github.com/delta-io/delta & Databricks Lakehouse Documentation',
    problemSummary: 'Geleneksel dizin tabanlı bölümleme (Hive partitioning: year/month/day/country) yüksek kardinaliteli kolonlarda binlerce küçük dizin açarak sorguları yavaşlatır. Ayrıca Bronze\'dan Silver\'a geçerken tüm tabloyu baştan taramak faturayı patlatır.',
    impactMetrics: 'Sorgu hızında 3-5x artış, Bronze->Silver okuma maliyetinde %90 tasarruf, sıfır partisyon dengesizliği',
    architectureFlow: `[Raw Streaming Ingestion]
       │
       ▼
[Bronze Table: CLUSTER BY (user_id, event_timestamp)]
       │ (TBLPROPERTIES: delta.enableChangeDataFeed = true)
       ▼ (Reads ONLY row-level inserts & updates via CDF)
[PySpark Streaming MERGE INTO Silver]
       │
       ▼
[Silver Canonical Table: CLUSTER BY (country, user_id)]
       │
       ▼ (Periodic Non-blocking OPTIMIZE)
[Gold Analytical Marts]`,
    codeTitle: 'delta_liquid_clustering_cdf.sql & python',
    codeLanguage: 'sql',
    codeSnippet: `-- DDL: Liquid Clustering ile Partisyon Dengesizliğini Çözen Delta Tablosu
CREATE TABLE prod_lakehouse.bronze.user_activity_stream (
    event_id STRING NOT NULL,
    user_id STRING NOT NULL,
    country STRING,
    event_timestamp TIMESTAMP,
    payload STRING
)
USING DELTA
CLUSTER BY (country, event_timestamp) -- Geleneksel partitioning yerine dinamik Liquid Clustering
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',          -- Sadece değişen satırları yayınlar
    'delta.autoOptimize.optimizeWrite' = 'true',   -- Yazma anında küçük dosyaları birleştirir
    'delta.autoOptimize.autoCompact' = 'true'
);

-- Python Streaming: CDF okuyarak Silver tablosuna atomik MERGE uygulaması
"""
streaming_cdf_df = (
    spark.readStream
    .format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("prod_lakehouse.bronze.user_activity_stream")
    .filter("_change_type IN ('insert', 'update_postimage')")
)

def upsert_to_silver(micro_batch_df, batch_id):
    if micro_batch_df.isEmpty():
        return
        
    silver_table = DeltaTable.forName(spark, "prod_lakehouse.silver.dim_users")
    
    (silver_table.alias("t")
     .merge(micro_batch_df.alias("s"), "t.user_id = s.user_id AND t.country = s.country")
     .whenMatchedUpdateAll()
     .whenNotMatchedInsertAll()
     .execute())

query = (
    streaming_cdf_df.writeStream
    .format("delta")
    .foreachBatch(upsert_to_silver)
    .option("checkpointLocation", "s3://checkpoints/silver_dim_users")
    .start()
)
"""`,
    dos: [
      'Yeni tablolarda PARTITIONED BY yerine CLUSTER BY (Liquid Clustering) kullanın; sorgu modellerine göre kendini dinamik dengeler.',
      'Tüm Bronze tablolarda delta.enableChangeDataFeed = true açın; alt katmanların tam tablo taraması yapmasını engelleyin.',
      'MERGE sorgularında condition ifadesine ilk önce cluster kolonlarını yazın (t.country = s.country); gereksiz dosyaları atlar (data skipping).'
    ],
    donts: [
      'CLUSTER BY ile klasik PARTITIONED BY komutunu aynı tabloda karıştırmayın; uyumsuzdur.',
      'Streaming işinin her micro-batch\'inde OPTIMIZE çalıştırmayın; saatlik veya N batch\'te bir zamanlayın.',
      'Change Data Feed açıkken retention süresini çok kısa tutmayın; downstream tüketicilerin okuma penceresini koruyun.'
    ],
    antiPatternWarning: 'Klasik partition ile 50.000 klasör açılır; her sorguda metadata okuma süresi asıl veri okuma süresini 10\'a katlar.',
    tags: ['Delta Lake', 'Databricks', 'Liquid Clustering', 'Medallion Architecture', 'Change Data Feed']
  },

  // 6. Debezium: Transactional Outbox Pattern for CDC
  {
    id: 'debezium-outbox-pattern',
    title: 'İlişkisel Veritabanlarında Sıfır Kayıplı CDC: Transactional Outbox Deseni',
    category: 'cdc',
    categoryLabel: 'Change Data Capture (CDC)',
    provenance: 'Debezium & Red Hat (Gunnar Morling)',
    githubSource: 'github.com/debezium/debezium & Debezium Outbox SMT',
    problemSummary: 'Mikroservisler veritabanına kayıt atıp hemen ardından Kafka\'ya mesaj göndermeye (Dual-Write) çalıştığında ağ hatası veya çökme anında veritabanı ile Kafka tutarsızlaşır (biri commit olur diğeri olmaz). Doğrudan tüm veritabanı tablolarını CDC ile açmak ise iç veritabanı modelini dış dünyaya ifşa eder.',
    impactMetrics: 'Çift yazma (dual-write) hatalarında %100 önleme, ACID güvenceli domain event üretimi, güvenli mikroservis refactoring',
    architectureFlow: `[Microservice Application Code]
       │ (Executes in ONE Single ACID DB Transaction)
       ▼
┌────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                    │
│ ┌──────────────────────────┐ ┌───────────────────────┐ │
│ │ orders (Entity Table)    │ │ outbox (Events Table) │ │
│ └──────────────────────────┘ └───────────┬───────────┘ │
└──────────────────────────────────────────┼─────────────┘
                                           │ (Reads WAL Log)
                                           ▼
                               [Debezium Kafka Connect]
                                           │ (EventRouter SMT: Unwraps JSON)
                                           ▼
                               [Kafka: order.events Topic]`,
    codeTitle: 'debezium_outbox_ddl_and_config.sql & json',
    codeLanguage: 'sql',
    codeSnippet: `-- 1. PostgreSQL Outbox Tablosu DDL
CREATE TABLE public.outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(255) NOT NULL,   -- 'Order' -> Hedef Kafka Topic: order.events olur
    aggregate_id VARCHAR(255) NOT NULL,     -- 'ORD-9821' -> Kafka Partition Key olur (sıra garantisi)
    event_type VARCHAR(255) NOT NULL,       -- 'OrderCreated', 'OrderCancelled'
    payload JSONB NOT NULL,                 -- İşlem yükü
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Python Backend Kodu: Tek bir ACID Transaction içinde yazım
"""
with db.transaction():
    # Asıl iş tablosunu güncelle
    db.execute("INSERT INTO orders (id, total) VALUES (:id, :total)", {"id": order_id, "total": 450})
    
    # AYNI TRANSACTION İÇİNDE outbox tablosuna yaz!
    # DB çökerse ikisi birden rollback olur; commit olursa ikisi birden kalıcı olur!
    db.execute(
        "INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload) "
        "VALUES (gen_random_uuid(), 'order', :id, 'OrderCreated', :payload)",
        {"id": order_id, "payload": json.dumps(payload)}
    )
"""

-- 3. Debezium Kafka Connect Konfigürasyonu (SMT EventRouter)
/*
{
  "name": "debezium-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "table.include.list": "public.outbox_events",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.by.field": "aggregate_type",
    "transforms.outbox.route.topic.replacement": "\${routedByValue}.events",
    "transforms.outbox.table.field.event.key": "aggregate_id"
  }
}
*/`,
    dos: [
      'Domain olayını ve iş tablosunu mutlaka aynı ilişkisel transaction bloğu içinde commit edin.',
      'aggregate_id değerini Kafka message key olarak ayarlayın; aynı siparişin olayları aynı partition\'a sıralı gider.',
      'Outbox tablosunu periyodik olarak temizleyen (ör. pg_partman veya 7 günlük TTL) bir temizlik mekanizması kurun.'
    ],
    donts: [
      'Asla veritabanına commit edip hemen ardından Python/Java kodundan Kafka Producer çağırmayın (Dual-write anti-pattern).',
      'Tüm dahili veritabanı tablolarını CDC ile göle aktarmayın; iç tablo şeması değiştiğinde göldeki tüm boru hatları çöker.',
      'Outbox tablosunda temizlik yapmayı unutmayın; PostgreSQL WAL şişmesi disk dolmasına sebep olur.'
    ],
    antiPatternWarning: 'Veritabanı commit olur fakat Kafka çöker; analitik ekibi siparişi hiç göremez ve envanter tutarsızlaşır.',
    tags: ['Debezium', 'Change Data Capture', 'PostgreSQL', 'Transactional Outbox', 'Event-Driven']
  },

  // 7. Pinterest & GitLab: FinOps Anti-Scan Partition Pruning & Warehouse Cost Governors
  {
    id: 'finops-warehouse-governors',
    title: 'FinOps Koruma Kalkanı: Zorunlu Partisyon Filtreleri & Otomatik Maliyet Freni',
    category: 'finops',
    categoryLabel: 'FinOps & Maliyet',
    provenance: 'Pinterest / GitLab / Uber FinOps Engineering',
    githubSource: 'github.com/dbt-labs/dbt-core & Snowflake Resource Monitors',
    problemSummary: 'Bulut analitik ambarlarında (BigQuery on-demand, Snowflake credit, Athena) tek bir analistin yanlışlıkla WHERE filtresi koymadan 50 TB tabloda `SELECT *` çalıştırması tek sorguda 300$+ yakabilir. Hafta sonu açık unutulan cluster\'lar şirketlere binlerce dolar fatura çıkarır.',
    impactMetrics: 'Tekil sorgu maliyetlerinde %95 tasarruf, plansız fatura şoklarında %100 önleme, atıl cluster maliyetlerinde sıfırlama',
    architectureFlow: `[Analyst / BI SQL Query]
       │
       ▼
[BigQuery / Snowflake FinOps Policy Gate]
       │
       ├─(Lacks partition filter?)──> [REJECT QUERY IMMEDIATELY: Error 400]
       │
       ├─(Exceeds monthly credit?)──> [SUSPEND WAREHOUSE AUTOMATICALLY]
       │
       ▼ (Passes)
[Optimized Columnar Execution (< 30 seconds Timeout)]`,
    codeTitle: 'finops_cost_governors.sql (BigQuery & Snowflake)',
    codeLanguage: 'sql',
    codeSnippet: `-- 1. BigQuery: Zorunlu Bölümleme Filtresi (Filtresiz Sorguyu Çalıştırmadan Reddeder)
CREATE OR REPLACE TABLE prod_warehouse.core.fact_ad_impressions (
    impression_id STRING NOT NULL,
    campaign_id STRING NOT NULL,
    country_code STRING NOT NULL,
    bid_amount INT64,
    impression_timestamp TIMESTAMP NOT NULL
)
PARTITION BY DATE(impression_timestamp)
CLUSTER BY country_code, campaign_id
OPTIONS (
    -- FİNOPS KORUMA KALKANI: Filtresiz sorguları veritabanı motoru doğrudan reddeder!
    require_partition_filter = TRUE,
    partition_expiration_days = 730 -- 2 yıldan eski verileri otomatik soğuk depoya arşivler
);

-- 2. Snowflake: Otomatik Kredi Limiti ve Zaman Aşımı İle Maliyet Freni
CREATE OR REPLACE RESOURCE MONITOR rm_bi_analytics_cap
WITH 
    CREDIT_QUOTA = 500                    -- Aylık maksimum kredi sınırı
    FREQUENCY = MONTHLY
    START_TIMESTAMP = IMMEDIATELY
TRIGGERS
    ON 80 PERCENT DO NOTIFY              -- %80'de Slack uyarısı gönder
    ON 100 PERCENT DO SUSPEND            -- %100'de yeni sorguları durdur
    ON 110 PERCENT DO SUSPEND_IMMEDIATE; -- %110'da çalışan tüm sorguları anında öldür!

-- Ambar Ayarları: 60 saniye hareketsizlikte uyut, 30 dakikayı geçen sorguyu iptal et
ALTER WAREHOUSE bi_reporting_wh SET
    RESOURCE_MONITOR = rm_bi_analytics_cap
    AUTO_SUSPEND = 60                     -- 60 saniye sorgu gelmezse kapat
    AUTO_RESUME = TRUE
    STATEMENT_TIMEOUT_IN_SECONDS = 1800;  -- 30 dakikadan uzun çalışan rogue sorguları öldür`,
    dos: [
      '100 GB üzerindeki tüm BigQuery fact tablolarında require_partition_filter = true açın.',
      'Snowflake ve Redshift üzerinde AUTO_SUSPEND süresini 60 saniye olarak ayarlayın ve agresif STATEMENT_TIMEOUT koyun.',
      'dbt incremental modellerinde sınırlı bakış penceresi (INTERVAL 3 DAY) koyarak sadece son günleri taratın.'
    ],
    donts: [
      'Sütunsal (columnar) veri ambarlarında üretim sorgularında SELECT * kullanmayın; sütun sayısı kadar fatura ödersiniz.',
      'S3 bucket\'larında Lifecycle kuralı olmadan veri tutmayın; 90 günden eski veriyi Glacier\'a geçirin.',
      'FinOps bütçe uyarılarını (Resource Monitors) tanımlamadan geliştirici ekiplere sınırsız ambar yetkisi vermeyin.'
    ],
    antiPatternWarning: 'Filtresiz bir sorgu 100 TB veri tarar ve şirkete tek bir yanlış tıklamayla 625$ anlık fatura çıkarır.',
    tags: ['FinOps', 'BigQuery', 'Snowflake', 'Cost Optimization', 'Resource Governance']
  }
];
