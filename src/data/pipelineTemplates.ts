import { PipelineTemplate } from '../types';

export const pipelineTemplates: PipelineTemplate[] = [
  // 1. STREAMING IOT & LAKEHOUSE
  {
    id: 'streaming_iot',
    title: 'Gerçek Zamanlı Streaming & IoT Lakehouse',
    description: 'Yüksek hacimli telemetri ve IoT olaylarının mikrosaniye gecikmeyle alınıp açık göl mimarisinde depolanması ve analize sunulması.',
    domain: 'Real-Time Streaming / Lakehouse',
    defaultCloud: 'aws',
    flowGoal: '25.000 JSON/sn IoT Olayını Kayıpsız Alıp Iceberg ACID Göle Yazmak ve SQL Analizine Sunmak',
    flowMotivation: 'Sunucu yönetimi olmadan (Serverless), <3 dk gecikmeyle, otomatik şema evrimiyle ve "Small Files" riski olmadan çalışmak.',
    flowSolution: 'Ingestion Buffer -> Serverless Micro-batch Sink -> S3 Iceberg Open Lakehouse -> Serverless Distributed SQL Engine',
    flowAntiPatterns: '❌ SQS+Lambda (Günde 2B çağrı, faturayı patlatır ve Small Files yaratır) | ❌ EMR+EC2 (Kalıcı sunucu yönetimi ve 4x maliyet)',
    edgeLabels: [
      'HTTPS / SDK (25k eps, 50 MB/s)',
      '120s / 64MB Micro-batch Sink',
      'Parquet + ACID Metadata Pointer',
    ],
    clouds: {
      aws: {
        badge: 'AWS DATA STREAMING',
        description: 'Kinesis On-Demand + Data Firehose + S3 Iceberg + Athena',
        baseCost: 35,
        costPer10kEps: 65,
        nodes: {
          ingestion: {
            serviceName: 'Amazon Kinesis Data Streams',
            subText: 'On-Demand Sharding (25 MB/s)',
            icon: '📥',
            latency: '~75 ms',
            throughput: '25,000 eps',
            purpose: 'Yüksek hacimli akış verisini shard bazında sıralı tamponlamak (buffer).',
            whySelected: 'Sunucusuz On-Demand modu ile ani yük artışlarında otomatik ölçeklenir; Firehose ile yerel entegredir.',
            whyAlternativeFailed: 'SQS FIFO elendi: Saniyede 3.000 mesaj sınırı vardır, 25k hacmi taşıyamaz.',
            costHint: '$0.015 / shard-saat + istek ücreti',
            protocol: 'Kinesis PutRecords API / HTTPS'
          },
          compute: {
            serviceName: 'Amazon Data Firehose',
            subText: 'Iceberg Delivery Table Sink',
            icon: '⚙️',
            latency: '120 sn / 64MB buffer',
            throughput: 'Micro-batch',
            purpose: 'Akıştaki JSON kayıtları toplayıp sıkıştırılmış Parquet Iceberg formatında S3\'e dökmek.',
            whySelected: 'Kod veya cluster açmadan doğrudan Iceberg tablolarına yazar ve Glue Schema Registry ile şemayı otomatik günceller.',
            whyAlternativeFailed: 'EC2 üzerinde Spark elendi: Sunucu yamalama ve cluster bakım yükü getirir.',
            costHint: 'İşlenen GB başına $0.029 (Sıfır sabit ücret)',
            protocol: 'Zero-Code Managed Delivery'
          },
          storage: {
            serviceName: 'Amazon S3 (Apache Iceberg)',
            subText: 'AWS Glue Data Catalog ile ACID',
            icon: '🗄️',
            latency: 'Parquet + Metadata',
            throughput: 'Depolama',
            purpose: 'Veriyi ACID garantisi ve zaman yolculuğu (time-travel) desteğiyle açık formatta saklamak.',
            whySelected: 'Apache Iceberg gizli partisyonlama (hidden partitioning) sunar ve S3 prefix sınırlamalarını aşar.',
            whyAlternativeFailed: 'Ham JSON dosyası elendi: Sütunsal sıkıştırma ve metadata indekslemesi olmadan sorgular 10x yavaşlar.',
            costHint: '$0.023 / GB / ay (Snappy Parquet ile %75 tasarruf)',
            protocol: 'S3 REST API / Iceberg v2'
          },
          warehouse: {
            serviceName: 'Amazon Athena / Redshift Serverless',
            subText: 'Sunucusuz SQL Analitik Motoru',
            icon: '📊',
            latency: '< 2.8 sn',
            throughput: 'Ad-hoc SQL',
            purpose: 'İş zekası panoları ve analistler için S3 üzerindeki Iceberg tablolarına SQL sorgusu çalıştırmak.',
            whySelected: 'Altyapı provizyonu gerektirmez; taranan veri başına ödenir; Iceberg metadata\'sı sayesinde gereksiz dosyaları atlar.',
            whyAlternativeFailed: 'RDS PostgreSQL elendi: OLTP veritabanıdır, analitik petabayt ölçekli sorgularda çöker.',
            costHint: 'Taranan TB başına $5.00 (Partition pruning ile minimum scan)',
            protocol: 'Presto/Trino SQL / JDBC / ODBC'
          }
        }
      },
      gcp: {
        badge: 'GOOGLE CLOUD STREAMING',
        description: 'Cloud Pub/Sub + Dataflow (Apache Beam) + Cloud Storage BigLake + BigQuery',
        baseCost: 30,
        costPer10kEps: 58,
        nodes: {
          ingestion: {
            serviceName: 'Google Cloud Pub/Sub',
            subText: 'Global Yönetilen Topic',
            icon: '📥',
            latency: '~40 ms',
            throughput: '25,000 eps',
            purpose: 'Dünya genelinden gelen akış verilerini partition yönetimi olmadan küresel tamponlamak.',
            whySelected: 'Shard/partition ölçekleme derdi yoktur; tamamen sunucusuzdur ve otomatik ölçeklenir.',
            whyAlternativeFailed: 'Self-hosted Kafka elendi: Broker, Zookeeper/KRaft ve OS yönetimi gerektirir.',
            costHint: '$40 / TB aktarılan veri (ilk 10 TB)',
            protocol: 'gRPC / HTTPS Pub/Sub API'
          },
          compute: {
            serviceName: 'Google Cloud Dataflow',
            subText: 'Apache Beam Windowed Aggregation',
            icon: '⚙️',
            latency: 'Sliding Window',
            throughput: 'Continuous',
            purpose: 'Gelen olayları Apache Beam modeliyle pencerelemek, geç gelen verileri (late data) yönetmek ve zenginleştirmek.',
            whySelected: 'Exactly-once garantisi sunar ve dinamik iş yeniden dengeleme (Dynamic Work Rebalancing) ile gecikmeleri önler.',
            whyAlternativeFailed: 'Cloud Functions elendi: 25k eps hacimde concurrency kotasına takılır ve stateful pencereleme yapamaz.',
            costHint: 'vCPU saat ($0.056) + RAM GB saat ($0.0035)',
            protocol: 'Apache Beam Streaming Runner'
          },
          storage: {
            serviceName: 'Cloud Storage & BigLake',
            subText: 'Dataplex Yönetimli Güvenlik',
            icon: '🗄️',
            latency: 'Colossus Storage',
            throughput: 'Depolama',
            purpose: 'GCS nesneleri üzerinde veriyi taşımadan satır ve sütun bazlı dinamik maskeleme uygulamak.',
            whySelected: 'BigLake, GCS dosyalarına BigQuery güvenlik ilkelerini (Policy Tags & Row-Level Security) doğrudan uygular.',
            whyAlternativeFailed: 'Departman bazlı ayrı bucket\'lar elendi: Veri kopyalama ve senkronizasyon maliyetini katlar.',
            costHint: '$0.020 / GB / ay (Autoclass ile otomatik soğuk arşivleme)',
            protocol: 'GCS XML/JSON API / BigLake Driver'
          },
          warehouse: {
            serviceName: 'Google BigQuery',
            subText: 'BI Engine Hızlandırması & SQL',
            icon: '📊',
            latency: '< 1.5 sn',
            throughput: 'Serverless SQL',
            purpose: 'Petabayt ölçekli analitik sorguları alt-saniye gecikmeyle çalıştırmak.',
            whySelected: 'Depolama ve işlem tamamen ayrıktır; BI Engine ile sık kullanılan tabloları bellekte milisaniye hızında çalıştırır.',
            whyAlternativeFailed: 'Cloud SQL elendi: Dikey ölçekleme sınırına çarpar ve analitik sorgularda bellek taşması verir.',
            costHint: 'On-Demand $6.25 / TB taranan veri veya Slot-saat modeli',
            protocol: 'GoogleSQL / BigQuery Storage Read API'
          }
        }
      },
      azure: {
        badge: 'AZURE FABRIC STREAMING',
        description: 'Azure Event Hubs + Fabric Real-Time Eventstreams + OneLake Delta + Fabric Warehouse',
        baseCost: 38,
        costPer10kEps: 70,
        nodes: {
          ingestion: {
            serviceName: 'Azure Event Hubs',
            subText: 'Kafka 1.0+ Uyumlu Uç Nokta',
            icon: '📥',
            latency: '~50 ms',
            throughput: '25,000 eps',
            purpose: 'Kafka protokolüyle uyumlu olarak yüksek hızlı olayları Azure ortamına almak.',
            whySelected: 'Auto-inflate ile Throughput Unit\'leri otomatik artırır ve Capture ile doğrudan depoya yazabilir.',
            whyAlternativeFailed: 'Azure Service Bus elendi: Kurumsal mesajlaşma içindir, büyük veri akışında ölçeklenemez.',
            costHint: 'Throughput Unit (TU) saat başına ~$0.03',
            protocol: 'AMQP / Kafka 1.0+ Protokolü'
          },
          compute: {
            serviceName: 'Fabric Eventstreams / Spark',
            subText: 'KQL Motoru & Akış Dönüştürme',
            icon: '⚙️',
            latency: 'Sub-second',
            throughput: 'Kapasite Birimi (CU)',
            purpose: 'Akış verisini KQL ile filtrelemek ve V-Order optimize Delta Parquet formatında OneLake\'e yazmak.',
            whySelected: 'Fabric içinde tekilleştirilmiş SaaS deneyimi; cluster açma bekleme süresi olmadan doğrudan başlar.',
            whyAlternativeFailed: 'Ağır Databricks cluster elendi: Geliştirme aşamasında yüksek DBU maliyeti üretir.',
            costHint: 'Fabric Capacity Units (F-SKU) üzerinden tüketim',
            protocol: 'Real-Time Intelligence KQL Engine'
          },
          storage: {
            serviceName: 'OneLake Delta Lake',
            subText: 'V-Order Parquet Optimizasyonu',
            icon: '🗄️',
            latency: 'SaaS Lakehouse',
            throughput: 'Depolama',
            purpose: 'Açık Delta Lake formatında, tekilleştirilmiş kurumsal SaaS gölü sağlamak.',
            whySelected: 'OneLake Shortcuts ile AWS ve GCP verilerine sıfır kopya ile doğrudan sanal işaretçi koyar.',
            whyAlternativeFailed: 'Klasik Blob Storage elendi: Hiyerarşik isim alanı (HNS) olmadan atomik yeniden adlandırma yapılamaz.',
            costHint: '$0.018 / GB / ay',
            protocol: 'OneLake REST API / Delta Transaction Log'
          },
          warehouse: {
            serviceName: 'Microsoft Fabric Warehouse',
            subText: 'Direct Lake Power BI Bağlantısı',
            icon: '📊',
            latency: '< 2.0 sn',
            throughput: 'T-SQL Endpoint',
            purpose: 'T-SQL sorguları ve Power BI raporları için veriyi bellek hızında sunmak.',
            whySelected: 'Direct Lake modu, veriyi içeri aktarmadan (import gerekmeden) Delta Parquet\'yi bellekten doğrudan okur.',
            whyAlternativeFailed: 'Power BI Import modu elendi: 25k eps akışta her saat veri yenileme (refresh) kuyruğa takılır.',
            costHint: 'Kapasite bazlı düz ücret (Sorgu başı scan ücreti yok)',
            protocol: 'TDC / T-SQL / Power BI Direct Lake'
          }
        }
      },
      oss: {
        badge: 'OPEN SOURCE STREAMING',
        description: 'Apache Kafka + Apache Flink + MinIO Apache Iceberg + ClickHouse / Trino',
        baseCost: 45,
        costPer10kEps: 32,
        nodes: {
          ingestion: {
            serviceName: 'Apache Kafka (KRaft)',
            subText: '3-Broker Küme, 16 Partition',
            icon: '📥',
            latency: '< 10 ms',
            throughput: '25,000 eps',
            purpose: 'Dağıtık, dayanıklı ve log tabanlı akış alım omurgası oluşturmak.',
            whySelected: 'Sub-10ms gecikme ve KRaft ile ZooKeeper bağımlılığı olmadan yüksek verim sağlar.',
            whyAlternativeFailed: 'RabbitMQ elendi: Mesaj tüketildikten sonra silinir; çoklu analitik tüketiciler için log mimarisi değildir.',
            costHint: 'Sunucu altyapı maliyeti ($0 yazılım lisansı)',
            protocol: 'Kafka TCP Binary Protocol'
          },
          compute: {
            serviceName: 'Apache Flink',
            subText: 'Exactly-Once Checkpointing',
            icon: '⚙️',
            latency: '< 25 ms',
            throughput: 'Event-driven',
            purpose: 'Chandy-Lamport dağıtık checkpointing ile tam olarak bir kez (Exactly-Once) akış işleme.',
            whySelected: 'Gerçek olay-zamanı (event-time) durum yönetimi ve RocksDB state backend ile milisaniye gecikme sağlar.',
            whyAlternativeFailed: 'Geleneksel batch Spark elendi: Mikrosaniye akış verisinde micro-batch gecikmesi yaratır.',
            costHint: 'Worker VM CPU ve RAM maliyeti',
            protocol: 'Flink DataStream API'
          },
          storage: {
            serviceName: 'MinIO + Apache Iceberg',
            subText: 'REST Catalog / Nessie Sürümleme',
            icon: '🗄️',
            latency: 'S3-Uyumlu Depo',
            throughput: 'Depolama',
            purpose: 'Bulut bağımsız, açık formatlı, ACID uyumlu göl depolama katmanı sağlamak.',
            whySelected: 'S3 API uyumlu MinIO üzerinde Iceberg açık tablo formatı ile satır güncellemeleri ve zaman yolculuğu.',
            whyAlternativeFailed: 'Düz dosya sistemi (NFS) elendi: Eşzamanlı yazmalarda bozulma ve atomik taahhüt eksikliği.',
            costHint: 'NVMe disk / Blok depolama maliyeti',
            protocol: 'S3 REST API / Iceberg REST Catalog'
          },
          warehouse: {
            serviceName: 'ClickHouse / Trino',
            subText: 'Yüksek Eşzamanlı Dağıtık SQL',
            icon: '📊',
            latency: '< 0.8 sn',
            throughput: 'Vektörize SQL',
            purpose: 'Saniyede binlerce eşzamanlı analitik sorguyu alt-saniye yanıtlamak.',
            whySelected: 'Vektörize SIMD işlem motoru ile petabayt veride dünya rekoru hızında toplama (aggregation) yapar.',
            whyAlternativeFailed: 'PostgreSQL elendi: Milyarlarca satır üzerinde analitik taramalarda disk I/O darboğazına girer.',
            costHint: 'Sunucu donanım maliyeti ($0 sorgu başı tarama ücreti)',
            protocol: 'Native ClickHouse TCP / Trino JDBC'
          }
        }
      }
    }
  },

  // 2. MEDALLION BATCH ELT
  {
    id: 'medallion_elt',
    title: 'Medallion Batch ELT (Bronze -> Silver -> Gold)',
    description: 'Ham verilerin katmanlı olarak doğrulanması, temizlenmesi ve zenginleştirilerek analitik boyut modellerine dönüştürülmesi.',
    domain: 'Lakehouse Medallion Architecture',
    defaultCloud: 'aws',
    flowGoal: 'Günlük 500 GB Ham Veriyi Doğrulayıp Temizleyerek (Silver) ve İş Boyutlarına Agrege Ederek (Gold) Raporlamaya Sunmak',
    flowMotivation: 'Veri kalitesini garanti etmek, bozuk satırları ana tablolardan izole etmek ve analistlere yıldız şema (Star Schema) sunmak.',
    flowSolution: 'Raw Landing (Bronze) -> DynamicFrame / Spark Deduplication (Silver) -> Compacted Marts (Gold) -> Dimensional Warehouse',
    flowAntiPatterns: '❌ Tek bir monolitik script\'te tüm işlemi yapmak (Hata anında nerede koptuğu bilinemez) | ❌ Ham veriyi direkt ambarına basmak',
    edgeLabels: [
      'Raw Batch Landing (JSON/CSV)',
      'Schema Validation & Deduplication',
      'Curated Dimensional Aggregations',
    ],
    clouds: {
      aws: {
        badge: 'AWS MEDALLION LAKEHOUSE',
        description: 'S3 Bronze Raw -> AWS Glue ETL Spark -> S3 Silver/Gold -> Redshift Serverless',
        baseCost: 40,
        costPer10kEps: 55,
        nodes: {
          ingestion: {
            serviceName: 'Amazon S3 (Bronze Bucket)',
            subText: 'Ham JSON/CSV Kaynak Dosyaları',
            icon: '📥',
            latency: 'Batch Landing',
            throughput: '500 GB / gün',
            purpose: 'Kaynak sistemlerden gelen ham verileri orijinal haliyle (fidelity) saklamak.',
            whySelected: 'Düşük maliyetli nesne deposu; veride hata olursa geçmişe dönük yeniden çalıştırma (replay) olanağı sağlar.',
            whyAlternativeFailed: 'Doğrudan veritabanına yazmak elendi: Kaynak bozuk veri gönderirse veri ambarı kilitlenir.',
            costHint: '$0.023 / GB',
            protocol: 'S3 Standard'
          },
          compute: {
            serviceName: 'AWS Glue ETL (Spark Engine)',
            subText: 'DynamicFrame Şema Temizleme & Doğrulama',
            icon: '⚙️',
            latency: 'Zamanlanmış (Saatlik)',
            throughput: '10 DPU İş Gücü',
            purpose: 'Bozuk tipleri temizlemek, yinelenen kayıtları ayıklamak ve Job Bookmarks ile sadece yenileri işlemek.',
            whySelected: 'Sunucusuzdur; Job Bookmarks ile hangi dosyaların daha önce işlendiğini otomatik hatırlar.',
            whyAlternativeFailed: 'Python Shell elendi: 500 GB hacimde tek makine hafızası (RAM) yetersiz kalır.',
            costHint: 'DPU-saat başına $0.44',
            protocol: 'Apache Spark / Glue DynamicFrame'
          },
          storage: {
            serviceName: 'Amazon S3 (Silver / Gold Iceberg)',
            subText: 'Bölümlenmiş ve Sıkıştırılmış Parquet',
            icon: '🗄️',
            latency: 'ACID Güvencesi',
            throughput: 'Küratörlü Göl',
            purpose: 'Temizlenmiş kurumsal verileri ve iş KPI tablolarını bölümlenmiş Parquet olarak tutmak.',
            whySelected: 'Iceberg formatı ile şema değişiklikleri güvenlidir ve zaman yolculuğu ile denetlenebilir.',
            whyAlternativeFailed: 'Ham CSV formatı elendi: Sıkıştırma yoktur, 4 kat fazla yer kaplar ve sorguları felç eder.',
            costHint: '$0.023 / GB (Sıkıştırma ile %75 tasarruf)',
            protocol: 'Iceberg on S3'
          },
          warehouse: {
            serviceName: 'Amazon Redshift RA3',
            subText: 'Maddeleştirilmiş Görünümler (MVs)',
            icon: '📊',
            latency: '< 1.8 sn',
            throughput: 'Boyutsal Veri Ambarı',
            purpose: 'Yönetim kurullarına ve analistlere yıldız şema üzerinden saniyeler içinde rapor üretmek.',
            whySelected: 'RA3 ayrık depolama kullanır; Concurrency Scaling ile pazartesi sabahı yüklerinde otomatik genişler.',
            whyAlternativeFailed: 'Athena elendi: Sık tekrarlanan karmaşık raporlarda scan maliyeti RA3 sabit fiyatından yüksek olabilir.',
            costHint: 'RA3 Node-saat veya Serverless RPU-saat',
            protocol: 'PostgreSQL uyumlu Redshift SQL'
          }
        }
      },
      gcp: {
        badge: 'GCP MEDALLION PIPELINE',
        description: 'Cloud Storage Bronze -> Dataproc Serverless -> BigLake Gold -> BigQuery',
        baseCost: 35,
        costPer10kEps: 50,
        nodes: {
          ingestion: {
            serviceName: 'Cloud Storage (Bronze Zone)',
            subText: 'Ham Veri Depolama Alanı',
            icon: '📥',
            latency: 'Toplu Yükleme',
            throughput: '500 GB / gün',
            purpose: 'Tüm kaynak verileri değiştirmeden ham bölgede arşivlemek.',
            whySelected: 'Çift bölge (Dual-Region) desteğiyle yüksek erişilebilirlik sunar.',
            whyAlternativeFailed: 'Lokal sunucu diski elendi: Donanım arızalarında veri kaybı riski yüksektir.',
            costHint: '$0.020 / GB',
            protocol: 'GCS Standard'
          },
          compute: {
            serviceName: 'Dataproc Serverless PySpark',
            subText: 'Sunucusuz Dağıtık Dönüştürme',
            icon: '⚙️',
            latency: 'Tetiklemeli İş',
            throughput: 'Otomatik vCPU',
            purpose: 'Cluster yönetimi olmadan PySpark işleri ile ham veriyi Silver tablolara taşımak.',
            whySelected: 'Saniyeler içinde ayağa kalkar, iş bitince kapanır; atıl küme maliyeti sıfırdır.',
            whyAlternativeFailed: 'Kalıcı Dataproc VM elendi: İş bitse de açık kalarak gece faturayı şişirir.',
            costHint: 'vCPU ve bellek süresi',
            protocol: 'PySpark Job API'
          },
          storage: {
            serviceName: 'BigLake & Dataplex Silver/Gold',
            subText: 'Merkezi Veri Kalitesi Kuralları',
            icon: '🗄️',
            latency: 'Bölümlenmiş Depo',
            throughput: 'Yönetilen Varlıklar',
            purpose: 'Veri kalitesi testlerinden geçmiş modelleri Dataplex veri gölünde güvenli saklamak.',
            whySelected: 'Veri kalitesi görevlerini (Data Quality Tasks) otomatik çalıştırır.',
            whyAlternativeFailed: 'Yönetilmeyen bucket elendi: Hangi verinin nerede olduğu ve veri soyu (lineage) kaybolur.',
            costHint: 'GCS depolama ücreti',
            protocol: 'BigLake Storage'
          },
          warehouse: {
            serviceName: 'BigQuery Analitik Ambar',
            subText: 'BI Engine & Star Schema Modelleri',
            icon: '📊',
            latency: '< 1.2 sn',
            throughput: 'Petabayt Ölçek',
            purpose: 'Looker ve kurumsal panolara alt-saniyede yıldız şema sorguları sunmak.',
            whySelected: 'BI Engine ile sık kullanılan tabloları otomatik önbellekler.',
            whyAlternativeFailed: 'OLTP Cloud SQL elendi: Analitik olgu-boyut birleşimlerinde (JOIN) kilitlenir.',
            costHint: 'On-Demand veya Slot Rezervasyonu',
            protocol: 'BigQuery SQL'
          }
        }
      },
      azure: {
        badge: 'FABRIC LAKEHOUSE MEDALLION',
        description: 'OneLake Bronze -> Fabric Spark Notebooks -> OneLake Gold -> Power BI Direct Lake',
        baseCost: 42,
        costPer10kEps: 52,
        nodes: {
          ingestion: {
            serviceName: 'OneLake File Staging (Bronze)',
            subText: 'Dataflows Gen2 ile Alım',
            icon: '📥',
            latency: 'Zamanlanmış Alım',
            throughput: '500 GB / gün',
            purpose: 'Farklı kaynaklardan gelen verileri OneLake içine aktarmak.',
            whySelected: 'Power Query çevrimiçi deneyimi ile sıfır kodlu hızlı alım konnektörleri sunar.',
            whyAlternativeFailed: 'FTP sunucusu elendi: Güvenlik açıkları ve modern analitik entegrasyon eksikliği.',
            costHint: '$0.018 / GB',
            protocol: 'OneLake Landing'
          },
          compute: {
            serviceName: 'Fabric Spark Notebooks',
            subText: 'Delta Change Data Feed & V-Order',
            icon: '⚙️',
            latency: 'Pipelines ile DAG',
            throughput: 'Kapasite Havuzu',
            purpose: 'Veri temizleme, doğrulama ve V-Order algoritması ile Parquet satırlarını sıralı yazma.',
            whySelected: 'V-Order sıralaması, downstream Power BI okumalarını 3 kat hızlandırır.',
            whyAlternativeFailed: 'Standart Python script elendi: Büyük veri hacminde tek makineye sıkışır.',
            costHint: 'Fabric Capacity Units',
            protocol: 'Fabric Spark Engine'
          },
          storage: {
            serviceName: 'OneLake Delta Lakehouse (Gold)',
            subText: 'ACID İşlemler & Zaman Yolculuğu',
            icon: '🗄️',
            latency: 'Açık Delta Standardı',
            throughput: 'Tablo Katmanı',
            purpose: 'Kurumsal tek gerçek kaynağı (Single Source of Truth) Delta tablolarında tutmak.',
            whySelected: 'Açık Delta Lake standardı ile vendor lock-in olmadan güvenli depolama sunar.',
            whyAlternativeFailed: 'CSV/Excel dosyaları elendi: ACID desteği yoktur, eşzamanlı okumada bozulur.',
            costHint: '$0.018 / GB',
            protocol: 'Delta Table on OneLake'
          },
          warehouse: {
            serviceName: 'Power BI Direct Lake + Warehouse',
            subText: 'Bellekten Sıfır Kopyalı Okuma',
            icon: '📊',
            latency: 'Anlık Raporlama',
            throughput: 'Semantik Model',
            purpose: 'İş kullanıcılarına gecikmesiz, anlık açılan panolar sunmak.',
            whySelected: 'Direct Lake modu, Power BI\'ın Delta dosyalarını bellek hızında doğrudan okumasını sağlar.',
            whyAlternativeFailed: 'Klasik Import Refresh elendi: Her sabah saatlerce veri çekmeyi bekletir.',
            costHint: 'Fabric Paylaşılan Kapasite',
            protocol: 'Direct Lake Semantic Model'
          }
        }
      },
      oss: {
        badge: 'OSS MODERN DATA STACK',
        description: 'Airbyte Ingestion -> dbt Core + DuckDB -> MinIO Parquet -> Superset / Trino',
        baseCost: 28,
        costPer10kEps: 20,
        nodes: {
          ingestion: {
            serviceName: 'Airbyte / Meltano',
            subText: 'Açık Kaynak Konnektör Alımı',
            icon: '📥',
            latency: 'Batch Sync',
            throughput: '500 GB / gün',
            purpose: '300\'den fazla açık kaynak konnektör ile veritabanı ve API\'lerden veri çekmek.',
            whySelected: 'Sıfır lisans maliyeti ve geniş topluluk konnektör desteği.',
            whyAlternativeFailed: 'Özel yazılmış bash script\'ler elendi: Hata takibi ve şema değişikliklerinde sürdürülemez.',
            costHint: 'VM donanım maliyeti',
            protocol: 'Airbyte Singer Standard'
          },
          compute: {
            serviceName: 'dbt Core + DuckDB / Spark',
            subText: 'SQL Tabanlı Veri Dönüştürme & Testler',
            icon: '⚙️',
            latency: 'Airflow DAG',
            throughput: 'CPU / RAM',
            purpose: 'Dönüşümleri modüler SQL ile yönetmek ve otomatik şema/veri testleri çalıştırmak.',
            whySelected: 'Veri soyunu (lineage) otomatik çıkarır, dokümantasyon üretir ve dbt testleri ile kaliteyi güvenceye alır.',
            whyAlternativeFailed: 'Düz SQL dosyaları elendi: Bağımlılık yönetimi (DAG) ve otomatik test desteği yoktur.',
            costHint: 'İşlemci / Sunucu maliyeti',
            protocol: 'dbt Core CLI'
          },
          storage: {
            serviceName: 'MinIO + Delta / Iceberg',
            subText: 'Silver & Gold Marts',
            icon: '🗄️',
            latency: 'Parquet Sıkıştırma',
            throughput: 'Açık Formatlar',
            purpose: 'Küratörlü modelleri S3 uyumlu açık nesne deposunda tutmak.',
            whySelected: 'S3 API\'sini yerel olarak taklit eder; buluta geçiş anında sıfır kod değişikliği gerektirir.',
            whyAlternativeFailed: 'Lokal SQLite elendi: Dağıtık analitik motorlar (Trino) tarafından paralel okunamaz.',
            costHint: 'Disk maliyeti',
            protocol: 'S3 REST API'
          },
          warehouse: {
            serviceName: 'Trino / Apache Superset',
            subText: 'Açık Kaynak İş Zekası ve Sorgulama',
            icon: '📊',
            latency: '< 1.5 sn',
            throughput: 'SQL Görselleştirme',
            purpose: 'Açık kaynak görselleştirme panoları sunmak.',
            whySelected: 'Trino, açık göl dosyalarını hiçbir yere taşımadan yüksek eşzamanlılıkla sorgular.',
            whyAlternativeFailed: 'Statik CSV dışa aktarımı elendi: Güvenlik açığı ve manuel süreçler yaratır.',
            costHint: 'Açık kaynak ($0 lisans)',
            protocol: 'Presto/Trino SQL'
          }
        }
      }
    }
  },

  // 3. CDC REPLICATION
  {
    id: 'cdc_replication',
    title: 'Gerçek Zamanlı Change Data Capture (CDC)',
    description: 'İlişkisel veritabanlarının (PostgreSQL, MySQL) işlem kayıtlarından (WAL/Binlog) anlık veri yakalama ve analitik replikasyon.',
    domain: 'Database Replication & CDC',
    defaultCloud: 'aws',
    flowGoal: 'İlişkisel Veritabanındaki Satır Seviyesi Değişimleri (INSERT/UPDATE/DELETE) Sıfır Kayıpla Lakehouse Tablolarına Yansıtmak',
    flowMotivation: 'İşlem veritabanını (OLTP) yormadan, <3 sn gecikmeyle analitik gölde en güncel tablo durumunu (UPSERT) tutmak.',
    flowSolution: 'WAL Log Okuma -> Akış Tamponu -> Satır Seviyesi ACID Upsert (Iceberg/Hudi/Delta) -> Gerçek Zamanlı Raporlama',
    flowAntiPatterns: '❌ 5 dakikada bir SELECT * FROM orders WHERE updated_at > now() çekmek (Veritabanını kilitler ve silinen satırları göremez)',
    edgeLabels: [
      'Logical Decoding (WAL Log)',
      'Row-level Change Stream (Debezium JSON)',
      'ACID Row-level Merge / UPSERT',
    ],
    clouds: {
      aws: {
        badge: 'AWS CDC PIPELINE',
        description: 'Aurora Postgres -> AWS DMS CDC -> Kinesis -> S3 Apache Hudi / Iceberg',
        baseCost: 55,
        costPer10kEps: 75,
        nodes: {
          ingestion: {
            serviceName: 'AWS Database Migration Service (DMS)',
            subText: 'PostgreSQL WAL Günlük Okuma',
            icon: '📥',
            latency: '< 2 sn',
            throughput: '10,000 tx/sn',
            purpose: 'Veritabanı işlem günlüklerini (WAL) okuyup satır seviyesi değişimleri yakalamak.',
            whySelected: 'Kaynak veritabanına sorgu atmaz; WAL dosyasını okuyarak veritabanı CPU\'sunu yormaz.',
            whyAlternativeFailed: 'Batch SQL sorgulama elendi: Silinen (DELETE) kayıtları yakalayamaz ve veritabanını kilitler.',
            costHint: 'DMS Replikasyon Instance saati',
            protocol: 'PostgreSQL Logical Replication'
          },
          compute: {
            serviceName: 'Amazon Kinesis Data Streams',
            subText: 'Debezium Biçimli Olay Tamponu',
            icon: '⚙️',
            latency: 'Sürekli Akış',
            throughput: 'Partitioned',
            purpose: 'Değişim olaylarını birincil anahtar (Primary Key) bazında sıralı tutmak.',
            whySelected: 'Aynı siparişe ait INSERT ve UPDATE olaylarının aynı shard\'a giderek sıra kaybetmemesini sağlar.',
            whyAlternativeFailed: 'Standart SQS elendi: Mesaj sırasını garanti etmez; UPDATE işleminden önce DELETE gelebilir.',
            costHint: 'Shard-saat ücreti',
            protocol: 'Kinesis API'
          },
          storage: {
            serviceName: 'Amazon S3 (Apache Hudi / Iceberg)',
            subText: 'Satır Seviyesi UPSERT & Merge-on-Read',
            icon: '🗄️',
            latency: 'Noktasal Snapshot',
            throughput: 'ACID Güncelleme',
            purpose: 'S3 üzerindeki dosyalarda tüm tabloyu yeniden yazmadan satır bazlı güncelleme (UPSERT) yapmak.',
            whySelected: 'Iceberg v2 Equality Deletes ve Hudi Merge-on-Read ile dosya yazma yükünü en aza indirir.',
            whyAlternativeFailed: 'Düz Parquet formatı elendi: 1 satır güncellemek için 500 MB dosyanın tamamını yeniden yazmak gerekir.',
            costHint: '$0.023 / GB',
            protocol: 'Iceberg / Hudi ACID Engine'
          },
          warehouse: {
            serviceName: 'Amazon Redshift Auto-Copy',
            subText: 'CDC Olaylarının Ambarla Eşitlenmesi',
            icon: '📊',
            latency: '< 5 sn',
            throughput: 'Canlı Replikasyon',
            purpose: 'Analitik ambarında veritabanının anlık bir kopyasını sorgulamak.',
            whySelected: 'S3\'e gelen değişiklikleri otomatik olarak Redshift tablolarıyla eşitler.',
            whyAlternativeFailed: 'Canlı üretim veritabanına doğrudan raporlama elendi: Analistlerin ağır sorguları üretim sunucusunu çökertir.',
            costHint: 'Redshift RPU / Node saati',
            protocol: 'Redshift Data API'
          }
        }
      },
      gcp: {
        badge: 'GCP CDC DATASTREAM',
        description: 'Cloud SQL Postgres -> Datastream -> BigQuery Storage Write API (Committed)',
        baseCost: 48,
        costPer10kEps: 68,
        nodes: {
          ingestion: {
            serviceName: 'Google Cloud Datastream',
            subText: 'Sunucusuz CDC Replikasyon Motoru',
            icon: '📥',
            latency: '< 1.5 sn',
            throughput: '10,000 tx/sn',
            purpose: 'PostgreSQL ve Oracle\'dan sunucusuz olarak anlık değişimleri çekmek.',
            whySelected: 'Altyapı yönetimi sıfırdır; doğrudan BigQuery ile yerel entegredir.',
            whyAlternativeFailed: 'Custom Python script elendi: Replikasyon slot yönetimi çökerse WAL diski şişip DB çöker.',
            costHint: 'İşlenen GB başına ücret',
            protocol: 'PostgreSQL pgoutput'
          },
          compute: {
            serviceName: 'BigQuery Storage Write API',
            subText: 'Committed Stream Doğrudan Yazım',
            icon: '⚙️',
            latency: 'Saniyeler İçinde',
            throughput: 'Tam Yönetilen',
            purpose: 'Değişimleri doğrudan BigQuery tablolarına atomik taahhüt ile yazmak.',
            whySelected: 'Eski Streaming Buffer\'a göre %50 daha ucuzdur ve iki aşamalı taahhüt (two-phase commit) sunar.',
            whyAlternativeFailed: 'Legacy Streaming Insert API elendi: Pahalıdır ve satır bazlı atomik taahhüt sunmaz.',
            costHint: 'GB başına $0.025 alım ücreti',
            protocol: 'Storage Write API (gRPC)'
          },
          storage: {
            serviceName: 'BigQuery Değişiklik Geçmişi Tabloları',
            subText: 'CDC Append & Snapshot Yönetimi',
            icon: '🗄️',
            latency: 'Otomatik Bölümleme',
            throughput: 'BigQuery Yerel',
            purpose: 'Tüm satır değişimlerini zaman damgasıyla biriktirip noktasal durum üretmek.',
            whySelected: 'BigQuery yerel CDC tabloları, en son geçerli durumu veren otomatik görünüm üretir.',
            whyAlternativeFailed: 'Manuel ETL job elendi: Her 5 dakikada bir merge yazmak yüksek slot maliyeti yaratır.',
            costHint: 'BigQuery aktif depolama',
            protocol: 'BigQuery Managed Storage'
          },
          warehouse: {
            serviceName: 'BigQuery Canlı Görünümler',
            subText: 'En Son Satır Durumunu Veren SQL View',
            icon: '📊',
            latency: '< 1.0 sn',
            throughput: 'Anlık Analiz',
            purpose: 'Analistlerin sanki canlı veritabanındaymış gibi en güncel satırları görmesini sağlamak.',
            whySelected: 'QUALIFY ROW_NUMBER() OVER(PARTITION BY id ORDER BY change_time DESC) mantığını optimize çalıştırır.',
            whyAlternativeFailed: 'Üretim DB replikası elendi: Yüksek analitik sorgularda replika gecikmesi (lag) patlar.',
            costHint: 'Taranan veri başına',
            protocol: 'BigQuery SQL'
          }
        }
      },
      azure: {
        badge: 'AZURE CDC FABRIC',
        description: 'Azure SQL DB CDC -> Event Hubs -> Fabric Real-Time Intelligence -> Fabric Warehouse',
        baseCost: 52,
        costPer10kEps: 72,
        nodes: {
          ingestion: {
            serviceName: 'Fabric Database CDC Connector',
            subText: 'Satır Seviyesi Değişim Yakalama',
            icon: '📥',
            latency: '< 2 sn',
            throughput: '10,000 tx/sn',
            purpose: 'Azure SQL DB değişim tablolarından (cdc.fn_cdc_get_all_changes) veriyi çekmek.',
            whySelected: 'Fabric ile yerleşik SaaS entegrasyonu sunar.',
            whyAlternativeFailed: 'Tablo taraması elendi: Kilitlenme ve yüksek DTU tüketimi yaratır.',
            costHint: 'Fabric Kapasitesi',
            protocol: 'Azure SQL CDC Driver'
          },
          compute: {
            serviceName: 'Fabric Eventstreams Engine',
            subText: 'KQL ile Gerçek Zamanlı Filtreleme',
            icon: '⚙️',
            latency: 'Sub-second',
            throughput: 'Continuous',
            purpose: 'Olayları dönüştürüp OneLake üzerindeki hedef Delta tablolarına yönlendirmek.',
            whySelected: 'KQL ile akış anında filtreleme ve satır zenginleştirmesi yapar.',
            whyAlternativeFailed: 'Ayrı VM elendi: Yönetim karmaşıklığı getirir.',
            costHint: 'Fabric CU',
            protocol: 'Eventstreams KQL'
          },
          storage: {
            serviceName: 'OneLake Delta Table (Liquid Clustering)',
            subText: 'Hızlı UPSERT ve Veri Atlamalı İndeks',
            icon: '🗄️',
            latency: 'ACID İşlem Günlüğü',
            throughput: 'Parquet',
            purpose: 'Birincil anahtar üzerinde hızlı satır eşleşmesi ve güncelleme sağlamak.',
            whySelected: 'Liquid Clustering, sık güncellenen anahtarları otomatik kümeleyerek merge süresini %80 azaltır.',
            whyAlternativeFailed: 'Düz dizin bölümleme elendi: CDC tablolarında partisyon dengesizliği yaratır.',
            costHint: '$0.018 / GB',
            protocol: 'OneLake Delta'
          },
          warehouse: {
            serviceName: 'Microsoft Fabric Warehouse',
            subText: 'T-SQL ile Anlık Durum Raporlama',
            icon: '📊',
            latency: '< 2.2 sn',
            throughput: 'İş Zekası',
            purpose: 'T-SQL ile raporlama yapmak.',
            whySelected: 'SQL Server yetkinlikleri korunur; Power BI doğrudan Delta dosyalarını okur.',
            whyAlternativeFailed: 'OLTP Azure SQL elendi: Analitik sorgularda kilitlenir.',
            costHint: 'Fabric Kapasite Birimi',
            protocol: 'T-SQL Endpoint'
          }
        }
      },
      oss: {
        badge: 'OSS DEBEZIUM + KAFKA CDC',
        description: 'Postgres WAL -> Debezium Kafka Connect -> Apache Iceberg Upsert -> StarRocks',
        baseCost: 40,
        costPer10kEps: 28,
        nodes: {
          ingestion: {
            serviceName: 'Debezium Connector for Postgres',
            subText: 'Mantıksal Çözümleme (Logical Decoding)',
            icon: '📥',
            latency: '< 400 ms',
            throughput: '10,000 tx/sn',
            purpose: 'PostgreSQL WAL günlüğünden atomik işlem bazında satır değişimlerini yakalamak.',
            whySelected: 'Endüstri standardı açık kaynak CDC aracıdır; Transactional Outbox deseniyle sıfır veri kaybı sunar.',
            whyAlternativeFailed: 'Poller script elendi: Silinen kayıtları yakalayamaz ve veritabanını yorar.',
            costHint: 'Açık kaynak ($0 lisans)',
            protocol: 'Postgres pgoutput'
          },
          compute: {
            serviceName: 'Kafka Connect Cluster',
            subText: 'Iceberg Sink ile Paralel Yazım',
            icon: '⚙️',
            latency: 'Akış Boyunca',
            throughput: 'Dağıtık Worker',
            purpose: 'Debezium olaylarını JSON\'dan çıkarıp (SMT EventRouter) doğrudan hedefe yönlendirmek.',
            whySelected: 'Dağıtık worker mimarisi ile çöken worker\'ları otomatik yeniden başlatır.',
            whyAlternativeFailed: 'Tek thread Python consumer elendi: 10.000 işlem/sn hacimde darboğaza girer.',
            costHint: 'VM donanım maliyeti',
            protocol: 'Kafka Connect REST / Java'
          },
          storage: {
            serviceName: 'Apache Iceberg v2 Tabloları',
            subText: 'Equality Delete Dosyaları ile Satır Güncelleme',
            icon: '🗄️',
            latency: 'ACID Garantisi',
            throughput: 'Açık Lakehouse',
            purpose: 'S3 veya MinIO üzerinde satır bazlı silme ve güncelleme uygulamak.',
            whySelected: 'Equality Delete dosyaları sayesinde 1 satırı silmek için tüm Parquet dosyasını baştan yazmaz.',
            whyAlternativeFailed: 'Ham CSV dosyaları elendi: Satır silme/güncelleme imkansızdır.',
            costHint: 'MinIO depolama maliyeti',
            protocol: 'Iceberg v2 Format'
          },
          warehouse: {
            serviceName: 'StarRocks / ClickHouse',
            subText: 'Primary Key Motoru ile Anlık Replikasyon',
            icon: '📊',
            latency: '< 300 ms',
            throughput: 'Ultra Hızlı OLAP',
            purpose: 'Gerçek zamanlı olgu tabloları üzerinde anlık alt-saniye dashboard\'lar sunmak.',
            whySelected: 'Primary Key depolama motoru bellek içinde anlık UPSERT yapar; dünyanın en hızlı OLAP motorlarından biridir.',
            whyAlternativeFailed: 'Geleneksel veri tabanları elendi: Yüksek eşzamanlı analitikte kilitlenir.',
            costHint: 'Açık kaynak donanım maliyeti',
            protocol: 'MySQL uyumlu StarRocks Protokolü'
          }
        }
      }
    }
  }
];
