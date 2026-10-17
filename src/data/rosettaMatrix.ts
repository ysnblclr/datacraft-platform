import { ToolItem } from '../types';

export const rosettaMatrix: ToolItem[] = [
  // 1. Ingestion / Streaming
  {
    id: 'kinesis-streams',
    name: 'Amazon Kinesis Data Streams',
    provider: 'aws',
    role: 'ingestion',
    category: 'Streaming Buffer',
    shortDesc: 'AWS yönetilen, shard tabanlı yüksek verimli veri akış servisi.',
    latencyProfile: 'Standart: ~200-1000ms | Enhanced Fan-Out (HTTP/2): ~70ms',
    costModel: 'Shard-saat ($0.015/saat) + PUT payload birimleri (25KB)',
    scalingMechanism: 'Shard bölme/birleştirme (Split/Merge) veya On-Demand mod',
    strengths: ['AWS ekosistemiyle derin entegrasyon', 'Enhanced Fan-Out ile sıfır okuyucu darboğazı', 'Kinesis Agent ve SDK desteği'],
    antiPatterns: ['Yanlış shard key seçimi sonucu Hot-Shard darboğazı', '1KB altındaki kayıtları paketlemeden göndermek'],
    certGotchas: 'Sıralama kesinlikle Shard Key bazındadır. Tüm akış genelinde sıra garantisi yoktur.',
    equivalents: {
      aws: 'Amazon Kinesis Data Streams',
      gcp: 'Google Cloud Pub/Sub',
      azure: 'Azure Event Hubs',
      oss: 'Apache Kafka'
    }
  },
  {
    id: 'gcp-pubsub',
    name: 'Google Cloud Pub/Sub',
    provider: 'gcp',
    role: 'ingestion',
    category: 'Streaming Buffer',
    shortDesc: 'Google Cloud global, tam sunucusuz ve otomatik ölçeklenen mesajlaşma servisi.',
    latencyProfile: 'Global ortalama: ~30-100ms',
    costModel: 'Aktarılan veri hacmi ($40 / TB)',
    scalingMechanism: 'Tamamen şeffaf ve otomatik (partition yönetimi gerekmez)',
    strengths: ['Partition/shard yönetimi sıfırdır', 'Global tek bir topic ile dünya genelinden alım', 'BigQuery Subscription ile sıfır kod yazımı'],
    antiPatterns: ['Ordering key olmadan sıra garantisi beklemek', 'ACK timeout sürelerini yanlış ayarlayıp çift mesaj patlaması yaşamak'],
    certGotchas: 'Sıralı teslimat için mutlaka "Ordering Key" etkinleştirilmeli ve publisher sıralı göndermelidir.',
    equivalents: {
      aws: 'Amazon Kinesis Data Streams / SQS',
      gcp: 'Google Cloud Pub/Sub',
      azure: 'Azure Event Hubs',
      oss: 'Apache Kafka'
    }
  },
  {
    id: 'azure-event-hubs',
    name: 'Azure Event Hubs',
    provider: 'azure',
    role: 'ingestion',
    category: 'Streaming Buffer',
    shortDesc: 'Azure üzerinde Kafka API uyumlu, büyük veri akış alım servisi.',
    latencyProfile: '~20-50ms AMQP/Kafka protokolü',
    costModel: 'Throughput Unit (TU) saatlik ücret (~$0.03/saat) + ingress olayları',
    scalingMechanism: 'Auto-Inflate özellikli Throughput Units (TU) veya Processing Units (PU)',
    strengths: ['Mevcut Kafka istemcileriyle kod değiştirmeden çalışma', 'Capture özelliğiyle Blob/ADLS deposuna otomatik micro-batch arşivleme'],
    antiPatterns: ['Oluşturulduktan sonra partition sayısını düşürmeye çalışmak', 'Capture penceresini çok kısa tutup dosya sayısını şişirmek'],
    certGotchas: 'Event Hubs Capture doğrudan Avro veya Parquet formatında ADLS deposuna sıfır kod ile yazar.',
    equivalents: {
      aws: 'Amazon Kinesis Data Streams',
      gcp: 'Google Cloud Pub/Sub',
      azure: 'Azure Event Hubs',
      oss: 'Apache Kafka'
    }
  },
  {
    id: 'apache-kafka',
    name: 'Apache Kafka (KRaft)',
    provider: 'oss',
    role: 'ingestion',
    category: 'Streaming Buffer',
    shortDesc: 'Açık kaynak, dağıtık, dayanıklı ve log tabanlı endüstri standardı akış platformu.',
    latencyProfile: 'Sub-10ms (1-5ms çekirdek seviyesi zero-copy ile)',
    costModel: 'Altyapı sunucu/disk maliyeti veya Confluent/MSK yönetilen ücreti',
    scalingMechanism: 'Partition ekleme ve consumer group rebalancing',
    strengths: ['Son derece yüksek verim ve ultra düşük gecikme', 'Zengin Kafka Connect & KSQL ekosistemi', 'KRaft ile ZooKeeper bağımlılığının kalkması'],
    antiPatterns: ['JVM Garbage Collection duraklamaları nedeniyle Consumer Rebalance fırtınası', 'Under-replicated partition riskleri'],
    certGotchas: 'Kafka idempotent producer (`enable.idempotence=true`) ile partition içinde tekil yazım (EOS) garanti eder.',
    equivalents: {
      aws: 'Amazon MSK / Kinesis',
      gcp: 'Cloud Pub/Sub / Managed Kafka',
      azure: 'Azure Event Hubs Kafka Endpoint',
      oss: 'Apache Kafka'
    }
  },

  // 2. Storage / Lakehouse
  {
    id: 'aws-s3',
    name: 'Amazon S3 & Apache Iceberg',
    provider: 'aws',
    role: 'storage',
    category: 'Object Storage & Lakehouse',
    shortDesc: 'AWS nesne depolama standardı; güçlü tutarlılık ve açık tablo formatı desteği.',
    latencyProfile: 'Standart GET/PUT: 20-50ms | S3 Express OneZone: <10ms tek haneli',
    costModel: 'GB başına aylık depolama ($0.023/GB) + API çağrı ücretleri (PUT/GET)',
    scalingMechanism: 'Prefix başına 3,500 PUT / 5,500 GET saniye başı istek kapasitesi',
    strengths: ['11 dokuz (99.999999999%) dayanıklılık', 'Akıllı katmanlama (Intelligent-Tiering)', 'Apache Iceberg/Delta Lake ACID desteği'],
    antiPatterns: ['Milyonlarca küçük dosya yazarak (Small Files Problem) API maliyetini ve sorgu süresini patlatmak'],
    certGotchas: 'Aralık 2020\'den beri S3 tüm yeni nesnelerde ve güncellemelerde "Strong Read-After-Write Consistency" sunar.',
    equivalents: {
      aws: 'Amazon S3',
      gcp: 'Google Cloud Storage (GCS)',
      azure: 'Azure Data Lake Storage Gen2 (ADLS Gen2)',
      oss: 'MinIO'
    }
  },
  {
    id: 'gcp-gcs',
    name: 'Google Cloud Storage (GCS) & BigLake',
    provider: 'gcp',
    role: 'storage',
    category: 'Object Storage & Lakehouse',
    shortDesc: 'GCP birleşik nesne deposu ve BigLake ile çoklu bulut satır/sütun güvenlik katmanı.',
    latencyProfile: 'Global tutarlı erişim (~30-60ms)',
    costModel: 'Standart $0.020/GB/ay + İşlem sınıfı maliyetleri (Autoclass desteği)',
    scalingMechanism: 'Önek başına otomatik ölçekleme (prefix sharding)',
    strengths: ['Multi-Region ve Dual-Region yüksek erişilebilirlik', 'BigLake ile veriyi taşımadan BigQuery güvenlik kuralları'],
    antiPatterns: ['Nearline/Coldline saklama süre dolmadan silme cezasına (early deletion) yakalanmak'],
    certGotchas: 'BigLake tabloları, GCS üzerindeki Parquet/Iceberg verilerini BigQuery erişim kontrolü ve yetkilendirmesiyle okutur.',
    equivalents: {
      aws: 'Amazon S3',
      gcp: 'Google Cloud Storage',
      azure: 'ADLS Gen2 / OneLake',
      oss: 'MinIO'
    }
  },
  {
    id: 'azure-adls2',
    name: 'Azure Data Lake Storage Gen2 / OneLake',
    provider: 'azure',
    role: 'storage',
    category: 'Object Storage & Lakehouse',
    shortDesc: 'Blob depolama üzerine inşa edilmiş Hiyerarşik İsim Alanı (HNS) ve Fabric OneLake.',
    latencyProfile: 'POSIX dizin hızıyla anlık taşıma/yeniden adlandırma',
    costModel: 'Hot $0.018/GB + HNS okuma/yazma işlem ücretleri',
    scalingMechanism: 'Hesap düzeyinde IOPS ve bant genişliği ölçekleme',
    strengths: ['Gerçek dizin yapısı ile atomik rename (ETL işlerinde devasa hız)', 'OneLake Shortcuts ile AWS ve GCP verilerine sıfır kopya erişim'],
    antiPatterns: ['Büyük veri kümelerinde düzensiz izin kontrolleri (POSIX ACL aşırı kullanımı)'],
    certGotchas: 'OneLake Shortcuts, veriyi Azure içine kopyalamadan S3 ve GCS bucket\'larına sanal işaretçi (pointer) koyar.',
    equivalents: {
      aws: 'Amazon S3',
      gcp: 'Google Cloud Storage',
      azure: 'ADLS Gen2 / OneLake',
      oss: 'MinIO / Ceph'
    }
  },

  // 3. Compute & Transformation
  {
    id: 'aws-glue',
    name: 'AWS Glue ETL & Data Catalog',
    provider: 'aws',
    role: 'compute',
    category: 'Serverless Batch/Stream Compute',
    shortDesc: 'Sunucusuz Apache Spark tabanlı ETL motoru ve Hive uyumlu veri kataloğu.',
    latencyProfile: 'Başlatma süresi: 10-30 saniye | İş çalıştırma süresi: dakika bazlı',
    costModel: 'DPU (Data Processing Unit) saat başına $0.44 (saniye hassasiyetli)',
    scalingMechanism: 'İş yüküne göre DPU ölçekleme (G.1X, G.2X, G.8X çalışan tipleri)',
    strengths: ['Sunucu yönetimi yok', 'Glue Job Bookmarks ile sadece yeni gelen veriyi otomatik işleme', 'Glue DynamicFrame desteği'],
    antiPatterns: ['Driver üzerinde `collect()` çağırarak hafıza aşımı (OOM) yaratmak', 'Non-SLA işlerde Glue Flex yerine pahalı standart worker kullanmak'],
    certGotchas: 'Job Bookmarks yalnızca S3 kaynaklarında ve desteklenen formatlarda önceki çalıştırmanın kaldığı yeri hatırlar.',
    equivalents: {
      aws: 'AWS Glue ETL',
      gcp: 'Google Cloud Dataflow / Dataproc Serverless',
      azure: 'Azure Data Factory / Fabric Spark',
      oss: 'Apache Spark / dbt Core'
    }
  },
  {
    id: 'gcp-dataflow',
    name: 'Google Cloud Dataflow',
    provider: 'gcp',
    role: 'compute',
    category: 'Unified Stream & Batch Compute',
    shortDesc: 'Apache Beam tabanlı, tam otomatik ölçeklenen sunucusuz akış ve toplu veri işleme.',
    latencyProfile: 'Streaming: Milisaniyeler/Saniyeler | Batch: Dakikalar',
    costModel: 'vCPU saat, RAM GB saat ve işlenen veri hacmi',
    scalingMechanism: 'Otomatik worker ölçekleme ve çalışma anında dinamik iş yeniden dengeleme (Dynamic Work Rebalancing)',
    strengths: ['Aynı kodla hem streaming hem batch çalışabilme', 'Gelişmiş pencereleme (Session, Sliding, Fixed) ve Watermark yönetimi'],
    antiPatterns: ['Birleştirici (Combiner) kullanmadan yüksek kardinaliteli GroupByKey yaparak bellek tüketmek'],
    certGotchas: 'Dataflow, geciken verileri yönetmek için "Allowed Lateness" ve tetikleyiciler (Triggers) modelini kullanır.',
    equivalents: {
      aws: 'Kinesis Data Analytics (Flink) / AWS Glue',
      gcp: 'Google Cloud Dataflow',
      azure: 'Azure Stream Analytics / Fabric Spark',
      oss: 'Apache Beam / Apache Flink'
    }
  },
  {
    id: 'databricks-spark',
    name: 'Databricks Lakehouse & Photon',
    provider: 'oss',
    role: 'compute',
    category: 'Lakehouse Compute Engine',
    shortDesc: 'C++ ile optimize edilmiş Photon vektörize motor ve Apache Spark platformu.',
    latencyProfile: 'Serverless Jobs: Saniyeler | Standart cluster: 2-3 dakika başlatma',
    costModel: 'DBU (Databricks Unit) tüketimi + Altyapı VM maliyeti',
    scalingMechanism: 'Otomatik cluster ölçekleme ve serverless havuzlar',
    strengths: ['Vektörize Photon motoru ile 3-5x daha hızlı Spark sorguları', 'Delta Live Tables (DLT) ile deklaratif ETL ve veri kalitesi beklentileri'],
    antiPatterns: ['Geliştirici cluster\'larında otomatik durdurmayı (Auto-termination) kapatıp faturayı şişirmek'],
    certGotchas: 'Auto Loader (`cloudFiles`), dizin tarama darboğazını aşmak için bulut bildirim servislerini (SQS/Event Grid) kullanır.',
    equivalents: {
      aws: 'Amazon EMR / Glue',
      gcp: 'Dataproc Serverless',
      azure: 'Azure Synapse Spark / Fabric Notebooks',
      oss: 'Apache Spark'
    }
  },

  // 4. Warehouse & Serving
  {
    id: 'aws-redshift',
    name: 'Amazon Redshift (RA3 / Serverless)',
    provider: 'aws',
    role: 'warehouse',
    category: 'Cloud Data Warehouse',
    shortDesc: 'S3 ayrık depolamalı RA3 mimarisi ve RPU bazlı sunucusuz analitik veri ambarı.',
    latencyProfile: 'Analitik karmaşık sorgularda: 100ms - birkaç saniye',
    costModel: 'RA3 node saati veya Serverless RPU-saat ($0.375/RPU-saat)',
    scalingMechanism: 'Concurrency Scaling ile yoğun saatlerde otomatik cluster ekleme',
    strengths: ['Redshift Spectrum ile S3 göl tablolarını doğrudan birleştirme', 'Donanım hızlandırmalı AQUA önbellek'],
    antiPatterns: ['Hatalı Distribution Key seçip tek bir dilimde (slice) çarpıklık ve darboğaz yaratmak'],
    certGotchas: 'Küçük boyutlu boyut tabloları için `DISTSTYLE ALL`, büyük olgu tablolarında join anahtarı için `DISTSTYLE KEY` tercih edilir.',
    equivalents: {
      aws: 'Amazon Redshift',
      gcp: 'Google BigQuery',
      azure: 'Microsoft Fabric Warehouse / Synapse Dedicated',
      oss: 'ClickHouse / StarRocks'
    }
  },
  {
    id: 'gcp-bigquery',
    name: 'Google BigQuery',
    provider: 'gcp',
    role: 'warehouse',
    category: 'Serverless Data Warehouse',
    shortDesc: 'Tamamen sunucusuz, Borg ve Colossus üzerinde çalışan petabayt ölçekli analitik motor.',
    latencyProfile: 'Hızlı sorgularda sub-second; BI Engine ile milisaniye',
    costModel: 'On-Demand ($6.25 / TB taranan veri) VEYA Capacity Editions (Slot-saat)',
    scalingMechanism: 'Tamamen otomatik dinamik slot tahsisi (binlerce eşzamanlı worker)',
    strengths: ['Sıfır altyapı yönetimi', 'BigQuery ML (BQML) ile SQL içinde makine öğrenmesi modeli eğitme', 'Zaman damgası ve integer aralık bölümleme'],
    antiPatterns: ['Bölümleme (partition) filtresi koymadan 50 TB tabloda `SELECT *` çalıştırıp tek sorguda yüzlerce dolar yakmak'],
    certGotchas: 'BigQuery tabloları 4.000 partisyona kadar bölümlenebilir ve en fazla 4 sütun üzerinde kümelenebilir (clustering).',
    equivalents: {
      aws: 'Amazon Redshift / Athena',
      gcp: 'Google BigQuery',
      azure: 'Microsoft Fabric Warehouse / Synapse',
      oss: 'Snowflake / ClickHouse'
    }
  },
  {
    id: 'azure-fabric-wh',
    name: 'Microsoft Fabric Data Warehouse',
    provider: 'azure',
    role: 'warehouse',
    category: 'Lakehouse Unified Warehouse',
    shortDesc: 'OneLake üzerindeki Delta Parquet dosyalarını T-SQL ile sorgulayan modern veri ambarı.',
    latencyProfile: '< 2 saniye analitik sorgular; Direct Lake ile anlık Power BI',
    costModel: 'Paylaşılan Fabric Capacity Units (F-SKU) üzerinden tüketim',
    scalingMechanism: 'Kapasite yumuşatma (Smoothing) algoritması ile iş yükünü zamana yayma',
    strengths: ['T-SQL desteği ile mevcut SQL Server yetkinliğini koruma', 'Power BI için veri kopyalama olmadan Direct Lake okuma'],
    antiPatterns: ['Aşırı eşzamanlı DDL işlemleri ile kilitlenme (lock escalation) yaratmak'],
    certGotchas: 'Direct Lake modu, Power BI\'ın Import modundaki gibi veri kopyalamadan Delta Parquet dosyalarını bellekten okumasını sağlar.',
    equivalents: {
      aws: 'Amazon Redshift',
      gcp: 'Google BigQuery',
      azure: 'Microsoft Fabric Warehouse',
      oss: 'Snowflake'
    }
  }
];
