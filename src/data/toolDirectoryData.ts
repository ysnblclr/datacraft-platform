import { ExamToolDeepDive } from '../types';

export const examToolsDirectory: ExamToolDeepDive[] = [
  // ==========================================
  // AWS TOOLS
  // ==========================================
  {
    id: 'aws-kinesis-streams',
    name: 'Amazon Kinesis Data Streams',
    provider: 'aws',
    category: 'Streaming & Ingestion',
    badge: 'AWS Streaming Core',
    summary: 'Yüksek hacimli, gerçek zamanlı veri akışlarını (IoT, loglar, clickstream) milisaniye düzeyinde gecikmeyle toplamak, tamponlamak ve birden fazla bağımsız tüketiciye (fan-out) sıralı olarak dağıtmak için kullanılan tam yönetilen akış servisidir.',
    coreFeatures: [
      'Shard Tabanlı Mimari: 1 Shard = 1 MB/sn (1.000 kayıt/sn) yazma, 2 MB/sn okuma kapasitesi sunar.',
      'Kapasite Modları: Provisioned (tahmin edilebilir yükler) ve On-Demand (ani spike ve öngörülemeyen trafik) modları.',
      'Veri Saklama: Varsayılan 24 saat; 365 güne kadar uzatılabilir (Replay yeteneği).',
      'Enhanced Fan-Out (EFO): Her tüketiciye özel 2 MB/sn atanmış bant genişliği ve HTTP/2 push mimarisi.',
      'Sıralı İşleme: Partition Key bazında shard içinde katı sıralı (in-order) teslimat garantisi.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Binlerce cihazdan gelen ve belirli satıcı kodlarında yoğunlaşan akışta "ProvisionedThroughputExceededException" hatası alınması ve verinin birden fazla bağımsız analitik motor tarafından milisaniyeler içinde tüketilmesi.',
        whenItIsCorrect: 'Alt-saniye (sub-second) gecikme istendiğinde, verinin birden fazla analitik iş (Lambda, Flink, Spark) tarafından aynı anda okunması gerektiğinde ve katı sıralama (order guarantee) şart koşulduğunda doğru cevaptır.',
        whenItFails: 'Veri doğrudan S3 veya Redshift\'e sadece arşivlenecekse Kinesis Streams operasyonel olarak fazla gelir (Firehose seçilmelidir). Mesajlar tekil işlenecek ve sıralama önemsizse SQS tercih edilmelidir.',
        keyHeuristic: 'Sıcak Shard (Hot Shard) hatasının sınavdaki çözümü shard artırmak değil; Partition Key\'e UUID/Timestamp ekleyerek kardinaliteyi (sentetik anahtar) artırmaktır.'
      }
    ],
    alternatives: [
      { name: 'Amazon SQS FIFO', provider: 'aws', comparison: 'SQS tek tüketiciye yöneliktir ve max 3.000 msg/s ile sınırlıdır; Kinesis çoklu tüketici ve milyonlarca TPS destekler.' },
      { name: 'Google Cloud Pub/Sub', provider: 'gcp', comparison: 'Pub/Sub shard yönetimi gerektirmez; partition key yerine ordering key kullanır.' },
      { name: 'Azure Event Hubs', provider: 'azure', comparison: 'Event Hubs TUs (Throughput Units) ile ölçeklenir; mimari ve partition yapısı Kinesis ile birebir eştir.' }
    ],
    primaryUseCases: ['Gerçek zamanlı dolandırıcılık tespiti (Fraud Detection)', 'IoT telemetri tamponlama', 'Canlı tıklama akışı (Clickstream) analitiği'],
    pricingTip: 'Trafik öngörülemiyorsa On-Demand; sabit ve 7/24 bilinen yüklerde Provisioned Shard %50+ daha ucuzdur.'
  },
  {
    id: 'aws-firehose',
    name: 'Amazon Data Firehose',
    provider: 'aws',
    category: 'Streaming & Ingestion',
    badge: 'Serverless Delivery',
    summary: 'Akış verilerini yakalayan, dönüştüren ve neredeyse gerçek zamanlı (near-real-time) olarak Amazon S3, Redshift, OpenSearch, Apache Iceberg ve Snowflake gibi hedeflere sunucusuz teslim eden boru hattı servisidir.',
    coreFeatures: [
      'Tamamen Sunucusuz: Shard, küme veya sunucu yönetimi yoktur; aktarılan veri hacmine göre (GB başına) ücretlendirilir.',
      'Mikro-Batch Tamponlama: Buffer Size (1 MB - 128 MB) ve Buffer Interval (60 sn - 900 sn) kurallarıyla çalışır.',
      'Format Dönüşümü: Ham JSON verisini akış anında Apache Parquet veya ORC sütunlu formatına dönüştürebilir.',
      'Apache Iceberg Desteği: AWS Glue Data Catalog entegrasyonu ile S3 Iceberg tablolarına doğrudan ACID teslimat.',
      'Dinamik Bölümleme (Dynamic Partitioning): Veri içeriğindeki JSON alanlarına göre S3 anahtar yapısını (prefix) otomatik böler.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Saniyede 20.000 JSON kaydının en düşük operasyonel yükle ve sunucusuz olarak S3 üzerindeki Iceberg tablolarına 3 dakikanın altında gecikmeyle yüklenmesi talebi.',
        whenItIsCorrect: 'Sıfır kod / sıfır sunucu yönetimiyle S3, Redshift veya Splunk/OpenSearch hedeflerine 1-5 dakika gecikmeli akış teslimatı istendiğinde her zaman doğru yanıttır.',
        whenItFails: '1 saniyenin altında (sub-second) gecikme gerekiyorsa elenir (Firehose minimum tamponlama süresi 60 saniyedir).',
        keyHeuristic: 'Sınavda tampon süresi 5 saniyeye indirilirse S3\'te "Small Files Problem" oluşur. Çözüm: Buffer süresini en az 60-120 saniyeye çıkarmaktır.'
      }
    ],
    alternatives: [
      { name: 'Kinesis Data Streams', provider: 'aws', comparison: 'Firehose doğrudan depolamaya yazar; Kinesis Streams ise okuyucu uygulamalar için geçici veri tamponudur.' },
      { name: 'Google Cloud Dataflow', provider: 'gcp', comparison: 'Dataflow karmaşık stream-stream JOIN ve windowing yaparken, Firehose sadece hedefe teslimat yapar.' }
    ],
    primaryUseCases: ['S3 Data Lake yüklemeleri (Parquet dönüşümlü)', 'Apache Iceberg tablolarına sunucusuz ingest', 'WAF ve VPC akış loglarının arşivlenmesi'],
    pricingTip: 'Gelen veriyi sıkıştırıp doğrudan Parquet\'ye çevirerek S3 depolama ve Athena sorgu maliyetini %80 düşürür.'
  },
  {
    id: 'aws-glue',
    name: 'AWS Glue (ETL, Catalog, Crawlers, Python Shell)',
    provider: 'aws',
    category: 'Compute & Transform',
    badge: 'Serverless Data Integration',
    summary: 'Büyük veri analitiği için sunucusuz veri hazırlama, Apache Spark tabanlı dağıtık ETL, merkezi metaveri kataloğu (Data Catalog) ve Python tabanlı hafif iş motorunu içeren bütünleşik veri entegrasyon ekosistemidir.',
    coreFeatures: [
      'Glue Data Catalog: S3, RDS ve Redshift tablolarının Hive Metastore uyumlu şema ve bölüm (partition) metaveri deposu.',
      'Glue Spark ETL: Apache Spark altyapısında DPU (Data Processing Unit) bazlı sunucusuz dağıtık işlemci.',
      'Glue Python Shell: 0.0625 DPU ile Spark başlatma gecikmesi olmadan hafif Python (Pandas, PyIceberg) işleri.',
      'Glue DynamicFrame: Şema evrimini ve iç içe JSON (nested structs) yapılarını kolayca düzleştiren (relationalize) veri yapısı.',
      'Glue Crawlers: S3 bucket\'larını otomatik tarayarak şema ve yeni partition\'ları kataloğa ekleyen mekanizma.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Günde 100 kez çalışan ve yalnızca birkaç megabaytlık lookup tablosunu güncelleyen bir ETL işinde maliyetlerin çok yüksek gelmesi.',
        whenItIsCorrect: 'Megabayt seviyesindeki ufak veri dönüşümlerinde Glue Spark ETL yerine "Glue Python Shell" seçilmesi veya sunucusuz Spark gereksinimlerinde Glue ETL doğru cevaptır.',
        whenItFails: 'Günde binlerce kez mikrosaniyelik çalışacak fonksiyonlar için Lambda daha uygundur; saatlerce süren devasa EMR kümesi gerektiren özel C++ kütüphanelerinde Glue kısıtlı kalabilir.',
        keyHeuristic: 'Sürekli S3\'ü baştan sona tarayan Crawler çalıştırmak anti-pattern\'dır. S3 Event Notifications -> EventBridge -> Lambda/Glue Catalog API tetiklenmelidir.'
      }
    ],
    alternatives: [
      { name: 'Google Cloud Dataproc Serverless', provider: 'gcp', comparison: 'Dataproc Serverless açık kaynak Spark işlerini benzer şekilde DPU/vCPU bazında sunucusuz çalıştırır.' },
      { name: 'Azure Data Factory (ADF)', provider: 'azure', comparison: 'ADF daha çok orkestrasyon ve görsel Mapping Data Flow sunarken; Glue, kod tabanlı (PySpark/Python) veri mühendisliğine odaklanır.' }
    ],
    primaryUseCases: ['S3 ham verilerini Silver/Gold Parquet katmanlarına dönüştürme', 'Merkezi şema ve metaveri yönetimi', 'Günlük küçük veri zenginleştirme (Python Shell)'],
    pricingTip: 'Glue ETL minimum 2 DPU ve 1 dakika başlatma maliyeti alır; küçük işlerde Python Shell kullanarak maliyeti 16 kat düşürebilirsiniz.'
  },
  {
    id: 'aws-lake-formation',
    name: 'AWS Lake Formation',
    provider: 'aws',
    category: 'Orchestration & Governance',
    badge: 'Fine-Grained Security',
    summary: 'Amazon S3 üzerindeki veri göllerinde merkezi güvenlik, erişim yönetimi, sütun/satır/hücre düzeyinde yetkilendirme ve hesaplar arası (cross-account) sıfır kopyalı veri paylaşımı sağlayan yönetim katmanıdır.',
    coreFeatures: [
      'Fine-Grained Access Control: Sütun, satır (Row-Level) ve hücre düzeyinde (Cell-Level) dinamik veri filtreleri.',
      'Sıfır Kopya (Zero-Copy): Veriyi farklı departmanlar için kopyalamadan tek bir S3 tablosu üzerinde farklı yetkiler tanımlama.',
      'Merkezi İzin Modeli: S3 bucket politikaları yerine IAM kullanıcı ve rollerine basit GRANT/REVOKE SQL benzeri yetkilendirme.',
      'Sanal Tablo Paylaşımı (Cross-Account): AWS RAM (Resource Access Manager) ile hesaplar arası anında veri paylaşımı.',
      'Athena & Redshift Spectrum Entegrasyonu: Kullanıcı sorgu attığında filtreler otomatik devralınır.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Yüksek',
        typicalQuestion: 'Finans analistlerinin yalnızca kendi ülkelerine ait satırları görebilmesi ve kredi kartı kolonunun dinamik maskelenmesi, ancak verinin S3 dışına kopyalanmaması talebi.',
        whenItIsCorrect: 'S3 üzerindeki tablolarda satır (row-level) veya sütun (column-level) düzeyinde güvenlik kuralı gerektiğinde S3 Bucket Politikaları yetersizdir; doğru cevap mutlaka Lake Formation\'dır.',
        whenItFails: 'Veri nesne düzeyinde (tüm dosya bazında) herkese açık veya tamamen kapalıysa standart S3 Bucket Policy ve IAM yeterlidir, Lake Formation ek operasyonel yük oluşturur.',
        keyHeuristic: 'Sınavda "farklı departmanlar için veriyi filtreleyip ayrı S3 bucket\'larına kopyalamak" her zaman bir anti-pattern\'dır; doğru yanıt Lake Formation Data Filters\'tır.'
      }
    ],
    alternatives: [
      { name: 'Google BigLake & Dataplex', provider: 'gcp', comparison: 'GCP tarafında GCS dosyalarına satır/sütun güvenliğini BigLake ve Policy Tag maskelemesi sağlar.' },
      { name: 'Microsoft Purview', provider: 'azure', comparison: 'Purview yönetişim ve etiketleme sağlarken erişim kontrolü için Fabric/ADLS ACL\'leri ile entegre olur.' },
      { name: 'Databricks Unity Catalog', provider: 'oss', comparison: 'Unity Catalog benzer şekilde catalog.schema.table üzerinde satır ve sütun maskeleri tanımlar.' }
    ],
    primaryUseCases: ['Regüle edilen bankacılık ve sağlık verisi gölleri', 'Çok kiracılı (Multi-tenant) SaaS veri platformları', 'Hesaplar arası güvenli veri paylaşımı'],
    pricingTip: 'Lake Formation servisi ücretsizdir; yalnızca altındaki S3 ve Athena/Glue tüketimi ücretlendirilir.'
  },
  {
    id: 'aws-redshift',
    name: 'Amazon Redshift & Redshift Serverless',
    provider: 'aws',
    category: 'Warehouse & Serving',
    badge: 'MPP Cloud Data Warehouse',
    summary: 'Petabaytlarca yapılandırılmış ve yarı yapılandırılmış veriyi karmaşık SQL analitik sorguları ve iş zekası araçları için optimize eden, MPP (Massively Parallel Processing) mimarili kurumsal veri ambarıdır.',
    coreFeatures: [
      'MPP Sütun Tabanlı Mimari: Veriyi sütun sütun depolar ve düğümler arasında paralel işler.',
      'Dağıtım Stilleri (Distribution Styles): KEY/HASH (JOIN optimizasyonu), ALL (küçük boyut tabloları kopyalama), EVEN (yuvarlak dağıtım).',
      'Concurrency Scaling: Ani sorgu patlamalarında otomatik olarak arka planda geçici kümeler açarak kuyrukta beklemeyi sıfırlar.',
      'Short Query Acceleration (SQA): Uzun süren raporların arkasında bekleyen hızlı sorguları öne alır.',
      'Redshift Spectrum: Veriyi ambar içine almadan (ETL yapmadan) doğrudan S3 açık formatları üzerinden SQL çalıştırma.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: '2 milyar satırlık Satış olgu tablosu ile 5 milyon satırlık Müşteri tablosunun JOIN sorgusunda yüksek ağ veri hareketi (Network Redistribution) yaşanması.',
        whenItIsCorrect: 'Büyük Fact tablosu ile büyük Dimension tablosu ortak anahtarda `DISTSTYLE KEY` ile eşleştirildiğinde ve küçük tablolar `DISTSTYLE ALL` yapıldığında doğru cevaptır.',
        whenItFails: 'Hafif sorgular veya günde 1-2 kez çalışan raporlar için provisioned Redshift kümesi pahalıdır (Athena veya Redshift Serverless tercih edilmelidir).',
        keyHeuristic: 'Kuyruk beklemelerinde sunucuyu daimi büyütmek anti-pattern\'dır; WLM Concurrency Scaling açmak sınavın doğru çözümüdür.'
      }
    ],
    alternatives: [
      { name: 'Google BigQuery', provider: 'gcp', comparison: 'BigQuery tamamen sunucusuzdur ve düğüm/dağıtım stili yönetimi gerektirmez.' },
      { name: 'Snowflake', provider: 'oss', comparison: 'Snowflake depolama ve sanal ambar işlemcilerini tamamen bağımsız faturalandırır.' },
      { name: 'Azure Synapse Dedicated SQL', provider: 'azure', comparison: 'Synapse 60 dağıtım birimi ile benzer Hash/Replicated dağıtım modelleri kullanır.' }
    ],
    primaryUseCases: ['Kurumsal İş Zekası (BI) ve Raporlama', 'Karmaşık çoklu JOIN analitik sorguları', 'Veri ambarı konsolidasyonu'],
    pricingTip: 'Redshift Serverless 8 RPU taban kapasitesiyle başlar ve boşta durduğunda otomatik durarak sabit küme masrafını engeller.'
  },
  {
    id: 'aws-athena',
    name: 'Amazon Athena',
    provider: 'aws',
    category: 'Warehouse & Serving',
    badge: 'Serverless SQL Query Engine',
    summary: 'Amazon S3 üzerindeki verileri hiçbir sunucu kurmadan doğrudan açık kaynaklı Presto/Trino motoru ve standart ANSI SQL ile sorgulayan sunucusuz interaktif sorgu servisidir.',
    coreFeatures: [
      'Taranan Veri Başına Ücretlendirme: Çalıştırılan sorgularda S3\'ten taranan her 1 TB veri için $5.00 ücret alır.',
      'Açık Format Desteği: Apache Iceberg, Delta Lake, Apache Hudi, Parquet, ORC, JSON ve CSV dosyalarını doğrudan okur.',
      'Partition Projection: On binlerce partition bulunan tablolarda Glue Catalog sorgu yükünü atlayarak anında dosya hedefleme.',
      'CTAS (Create Table As Select): Sorgu sonucunu doğrudan sıkıştırılmış Parquet olarak yeni bir S3 tablosuna yazabilme.',
      'Athena Federated Query: DynamoDB, RDS, CloudWatch gibi harici veri kaynaklarını tek bir SQL içinde JOIN edebilme.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'S3\'te biriken terabaytlarca ham CSV dosyasını en düşük maliyetle ve hiçbir altyapı yönetmeden ad-hoc SQL ile sorgulama talebi.',
        whenItIsCorrect: 'Düşük sıklıkta yapılan keşifsel (ad-hoc) analizlerde, S3 log incelemelerinde ve sıfır sunucu maliyeti hedeflendiğinde doğru cevaptır.',
        whenItFails: 'Milisaniyelik yanıt süresi gereken web uygulamaları veya saniyede yüzlerce eşzamanlı BI sorgusu için uygun değildir (Redshift veya ElastiCache gerekir).',
        keyHeuristic: 'Athena maliyetini düşürmek için: 1) CSV yerine Parquet kullan, 2) Sıkıştırma (Snappy/Gzip) aç, 3) PARTITION BY uygula, 4) SELECT * yerine sadece gereken sütunları seç.'
      }
    ],
    alternatives: [
      { name: 'Azure Synapse Serverless SQL', provider: 'azure', comparison: 'Synapse Serverless da benzer şekilde $5/TB taranan veri üzerinden T-SQL ile Parquet/Delta sorgular.' },
      { name: 'Google BigQuery', provider: 'gcp', comparison: 'BigQuery harici GCS sorgulaması (BigLake) yapabildiği gibi kendi optimize dahili depolamasını da yönetir.' }
    ],
    primaryUseCases: ['S3 veri gölünde ad-hoc veri keşfi', 'Güvenlik ve VPC akış loglarının denetlenmesi', 'ETL öncesi ham veri incelemesi'],
    pricingTip: 'Parquet formatına geçildiğinde sütun tabanlı tarama sayesinde taranan bayt miktarı ve dolayısıyla Athena faturası %90\'a varan oranda azalır.'
  },
  {
    id: 'aws-s3-storage',
    name: 'Amazon S3 & S3 Glacier Tiering',
    provider: 'aws',
    category: 'Storage & Lakehouse',
    badge: 'Cloud Object Storage Standard',
    summary: 'Bulut veri mimarilerinin temel taşı olan; %99.999999999 (11 dokuz) dayanıklılık sunan, sınırsız ölçeklenebilir ve katmanlı (tiering) nesne depolama servisidir.',
    coreFeatures: [
      'Depolama Katmanları: S3 Standard, S3 Intelligent-Tiering (otomatik tasarruf), S3 Glacier Instant Retrieval, Glacier Flexible ve Deep Archive.',
      'Lifecycle Policies: Verileri yaşlandıkça otomatik olarak daha ucuz soğuk depolama katmanlarına taşıma veya silme kuralları.',
      'Önek (Prefix) Ölçekleme: Her S3 prefix\'i için saniyede 3.500 PUT/POST ve 5.500 GET isteği throughput desteği.',
      'Event Notifications: Dosya yüklendiğinde EventBridge, SNS, SQS veya Lambda tetikleyebilme.',
      'S3 Object Lock & WORM: Değiştirilemez veri saklama ile regülasyon uyumluluğu.'
    ],
    examAppearances: [
      {
        exam: 'AWS Certified Data Engineer - Associate (DEA-C01)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Erişim örüntüsü bilinmeyen veya yılda birkaç kez milisaniye gecikmeyle acil erişilmesi gereken tarihi logların saklanması.',
        whenItIsCorrect: 'Erişim modeli bilinmiyorsa "S3 Intelligent-Tiering"; acil milisaniye erişimli arşiv gerekiyorsa "S3 Glacier Instant Retrieval" sınavın doğru cevabıdır.',
        whenItFails: 'Veri hemen silinecekse veya dosyalar 128 KB\'tan küçükse Intelligent-Tiering ek izleme ücreti nedeniyle zararlıdır (Small Files anti-pattern).',
        keyHeuristic: 'S3 Glacier Flexible 3-5 saat, Deep Archive 12 saat sürer; sınav sorusu "milisaniyede açılmalı" diyorsa tek cevap Glacier Instant Retrieval\'dır.'
      }
    ],
    alternatives: [
      { name: 'Google Cloud Storage (GCS)', provider: 'gcp', comparison: 'GCS Standard, Nearline, Coldline ve Archive katmanları sunar; tüm katmanlarda milisaniye ilk bayt süresi verir.' },
      { name: 'Azure Data Lake Storage Gen2', provider: 'azure', comparison: 'ADLS Gen2 nesne deposuna ek olarak hiyerarşik dosya dizin ağacı (POSIX ACL) ekler.' }
    ],
    primaryUseCases: ['Modern Data Lake birincil depolama katmanı', 'Tarihsel veri arşivleme ve yedekleme', 'Statik web sitesi ve medya barındırma'],
    pricingTip: 'S3 Standard $0.023/GB iken Glacier Deep Archive $0.00099/GB ile yaklaşık 23 kat daha ucuzdur.'
  },

  // ==========================================
  // GCP TOOLS
  // ==========================================
  {
    id: 'gcp-bigquery',
    name: 'Google Cloud BigQuery',
    provider: 'gcp',
    category: 'Warehouse & Serving',
    badge: 'Serverless Enterprise DW',
    summary: 'Google altyapısında çalışan, sıfır altyapı yönetimi gerektiren, Capacitor sütunlu formatı ve Dremel yürütme motoruyla petabaytları saniyeler içinde tarayan kurumsal veri ambarıdır.',
    coreFeatures: [
      'Partitioning (Bölümleme): Günlük, saatlik veya tamsayı aralıklı bölümleme ile sorgularda taranan bayt miktarını filtreler.',
      'Clustering (Kümeleme): 4 sütuna kadar sıralı bloklama yaparak taranan blokları atlar (block pruning).',
      'BI Engine: Bellek içi (in-memory) önbellekleme ile Looker/Tableau gösterge panellerinde alt-saniye yanıt.',
      'Materialized Views: Arka planda otomatik tazelenen ve temel tablo sorgularını akıllıca yönlendiren (smart tuning) görünümler.',
      'BigQuery ML: SQL komutlarıyla doğrudan ambar içinde makine öğrenmesi modelleri eğitebilme.'
    ],
    examAppearances: [
      {
        exam: 'Google Cloud Professional Data Engineer (GCP PDE)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Milyarlarca satırlık tabloda sorguların çok pahalıya gelmesi ve belirli tarih ve kampanya ID filtrelerinin sık kullanılması.',
        whenItIsCorrect: 'Tarihe göre PARTITION BY ve kampanya ID\'ye göre CLUSTER BY tanımlanması taranan veriyi %90 azaltarak sınavda daima en yüksek puanlı çözümdür.',
        whenItFails: 'Milisaniyelik satır bazlı operasyonel ekleme/güncelleme (OLTP) için uygun değildir (Cloud SQL veya Spanner gerekir).',
        keyHeuristic: 'Sınav Tuzağı: `SELECT * FROM tbl LIMIT 10` sorgusu BigQuery\'de taranan bayt miktarını DÜŞÜRMEZ! Sütun tabanlı okunduğu için tüm sütun ücretlendirilir.'
      }
    ],
    alternatives: [
      { name: 'Amazon Redshift', provider: 'aws', comparison: 'Redshift küme boyutu ve düğüm yönetimi isterken, BigQuery tamamen sunucusuz slot tahsisi yapar.' },
      { name: 'Snowflake', provider: 'oss', comparison: 'Her ikisi de sunucusuz ambarlardır; BigQuery GCP IAM ve servisleriyle daha sıkı entegredir.' }
    ],
    primaryUseCases: ['Büyük ölçekli kurumsal veri ambarı', 'Milyonlarca satırlık ad-hoc SQL analitiği', 'Looker ve Tableau analitik gösterge panelleri'],
    pricingTip: 'On-Demand modelinde taranan TB başına $6.25 ödenir; partitioning ve clustering kullanımı faturayı doğrudan düşürür.'
  },
  {
    id: 'gcp-dataflow',
    name: 'Google Cloud Dataflow (Apache Beam)',
    provider: 'gcp',
    category: 'Compute & Transform',
    badge: 'Unified Stream & Batch',
    summary: 'Apache Beam açık kaynak programlama modelini temel alan, hem akış (streaming) hem de toplu (batch) verileri sunucusuz ve otomatik ölçeklenebilir şekilde işleyen veri boru hattı servisidir.',
    coreFeatures: [
      'Birleşik Model (Unified): Aynı kod tabanı hem geçmiş batch dosyalarını hem de canlı Pub/Sub akışlarını işleyebilir.',
      'Gelişmiş Pencereleme (Windowing): Tumbling (sabit), Hopping (kayan) ve Session (oturum) pencereleri.',
      'Watermark & Allowed Lateness: Olay zamanını (event-time) takip ederek geç gelen verileri kayıpsız yönetebilme.',
      'Dataflow Shuffle & Streaming Engine: İşlemci belleğini tüketmeden disk/ağ dışı yüksek hızlı veri birleştirme.',
      'Exactly-Once Processing: Her mesajın hedefe tam olarak bir kez işlenmesini garanti eden yerleşik mekanizma.'
    ],
    examAppearances: [
      {
        exam: 'Google Cloud Professional Data Engineer (GCP PDE)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Tünellerden geçen araçlardan gelen telemetrinin şebeke kopması sebebiyle 20 dakika geç gelmesi ve bu verilerin ortalama hız hesabına doğru dahil edilmesi talebi.',
        whenItIsCorrect: 'Akış verilerinde geç gelen veri (late data), seans pencereleme (session windowing) ve kesinlikle tekil işleme (exactly-once) arandığında tek doğru çözümdür.',
        whenItFails: 'Mevcut bir Hadoop/Spark kümesini minimum kod değişikliğiyle buluta taşımak isteniyorsa Dataflow değil, Cloud Dataproc seçilmelidir.',
        keyHeuristic: 'Sınavda sistem saati (processing time) değil, cihazın ürettiği saat (event time) baz alınmalıdır; geç veriler için `withAllowedLateness()` şarttır.'
      }
    ],
    alternatives: [
      { name: 'AWS Glue Streaming / EMR', provider: 'aws', comparison: 'AWS tarafında Spark Structured Streaming veya Managed Flink (Kinesis Data Analytics) muadilidir.' },
      { name: 'Azure Stream Analytics', provider: 'azure', comparison: 'Stream Analytics SQL tabanlıyken, Dataflow Java/Python Apache Beam SDK ile zengin kodlama sunar.' }
    ],
    primaryUseCases: ['Gerçek zamanlı IoT ve telemetri boru hatları', 'Tıklama akışı oturum analizi (Sessionization)', 'Büyük ölçekli ETL/ELT dönüşümleri'],
    pricingTip: 'Dataflow Streaming Engine açılarak worker VM CPU ihtiyacı ve fatura %40 azaltılabilir.'
  },
  {
    id: 'gcp-pubsub',
    name: 'Google Cloud Pub/Sub & Pub/Sub Lite',
    provider: 'gcp',
    category: 'Streaming & Ingestion',
    badge: 'Global Event Bus',
    summary: 'Global ölçekte yüksek kullanılabilirlik sunan, mesaj üretenler ile tüketenleri birbirinden tamamen bağımsız kılan, sunucusuz olay akışı ve mesajlaşma omurgasıdır.',
    coreFeatures: [
      'Global Mimari: Tek bir topic dünyadaki tüm GCP bölgelerinden gelen mesajları yerel gecikmeyle kabul eder.',
      'Ordering Keys: Belirli bir anahtara sahip mesajların (örneğin müşteri ID) alıcıya kesinlikle sıralı iletilmesi.',
      'Dead-Letter Topics: Başarısız olan ve sürekli hata fırlatan zehirli mesajları izole eden ikincil konu.',
      'Push & Pull Abonelikleri: HTTP webhook\'lara otomatik itme (push) veya istemcinin kendi hızında çekmesi (pull).',
      'Pub/Sub Lite: Bölgesel (zonal), önceden kapasite kiralanabilen ve standart Pub/Sub\'a göre %80 daha ucuz olan varyant.'
    ],
    examAppearances: [
      {
        exam: 'Google Cloud Professional Data Engineer (GCP PDE)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Milyonlarca cihazdan gelen olayların sıralı işlenmesi ve hata veren mesajların pipeline\'ı kilitlemeden incelenmek üzere ayrılması.',
        whenItIsCorrect: 'Global olay kabulü, sıralı teslimat (`Ordering Key`) ve hatalı mesajların ayrılması (`Dead Letter Topic`) istendiğinde doğru cevaptır.',
        whenItFails: 'Sabit, yüksek hacimli ve maliyetin en kritik olduğu senaryolarda standart Pub/Sub pahalı gelebilir; bu durumda "Pub/Sub Lite" doğru yanıttır.',
        keyHeuristic: 'Pub/Sub varsayılan olarak sırasızdır. Sıralama gerektiğinde üretici tarafında mutlaka `Ordering Key` tanımlanmalıdır.'
      }
    ],
    alternatives: [
      { name: 'Amazon Kinesis / MSK', provider: 'aws', comparison: 'Kinesis shard yönetimi gerektirirken, Pub/Sub shard\'sız tamamen elastik ölçeklenir.' },
      { name: 'Apache Kafka', provider: 'oss', comparison: 'Kafka partition ve broker yönetimi gerektirir; Pub/Sub sıfır altyapı bakımıyla çalışır.' }
    ],
    primaryUseCases: ['Dağıtık mikroservis olay omurgası', 'Dataflow ve Cloud Functions veri besleme hattı', 'Log ve telemetri ingest platformu'],
    pricingTip: 'Bölge içi sabit yüksek akışlarda Pub/Sub Lite kullanmak veri aktarım maliyetini %80\'e kadar düşürür.'
  },
  {
    id: 'gcp-bigtable',
    name: 'Google Cloud Bigtable',
    provider: 'gcp',
    category: 'NoSQL & Operational',
    badge: 'Sub-10ms High Throughput NoSQL',
    summary: 'Milyonlarca işlem/saniye ve petabaytlarca veri için tasarlanmış, tek haneli milisaniye (sub-10ms) gecikme sunan, NoSQL geniş sütunlu (wide-column) depolama motorudur.',
    coreFeatures: [
      'Geniş Sütunlu (Wide-Column) Veri Modeli: Seyrek (sparse) verileri depolayan sütun aileleri (column families).',
      'HBase API Uyumluluğu: Mevcut Apache HBase uygulamaları kod değiştirmeden Bigtable\'a taşınabilir.',
      'Dinamik Yeniden Dengeleme: Tablet sunucuları arasında veri parçalarını otomatik dengeleyerek yüksek verim sağlar.',
      'Sıralı Anahtar Yapısı: Satır anahtarları (row keys) leksikografik sıralıdır; aralık (range) taramalarını çok hızlı yapar.',
      'Replikasyon: Çoklu bölge (multi-cluster) replikasyonu ile %99.999 SLA ve felaket kurtarma.'
    ],
    examAppearances: [
      {
        exam: 'Google Cloud Professional Data Engineer (GCP PDE)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Zaman serisi IoT verilerinin kaydedildiği Bigtable kümesinde yazma gecikmelerinin aniden 800 ms üzerine çıkması ve tek bir düğümün CPU\'sunun %100 olması (Hotspotting).',
        whenItIsCorrect: 'Sub-10ms okuma/yazma, saniyede yüzbinlerce QPS ve zaman serisi/finansal işlem akışlarında doğru cevaptır. Hotspotting çözümü olarak satır anahtarına (row key) hash veya salt eklenmelidir.',
        whenItFails: 'Karmaşık SQL JOIN sorguları, ilişkisel tablolar veya 1 TB altındaki küçük veriler için Bigtable uygun değildir (Cloud SQL veya Firestore seçilmelidir).',
        keyHeuristic: 'Bigtable\'da satır anahtarı ASLA artan sıralı zaman damgasıyla (`2026-10-18#ID`) başlamamalıdır. Mutlaka hash ön-eki veya `ID#TIMESTAMP` formatı seçilmelidir.'
      }
    ],
    alternatives: [
      { name: 'Amazon DynamoDB', provider: 'aws', comparison: 'DynamoDB doküman/anahtar-değer modelidir; Bigtable ise analitik zaman serisi ve geniş sütunlara daha uygundur.' },
      { name: 'Apache Cassandra / HBase', provider: 'oss', comparison: 'Cassandra ve HBase küme bakımı gerektirirken, Bigtable depolama ile işlemciyi ayıran Google altyapısıdır.' }
    ],
    primaryUseCases: ['Yüksek hacimli zaman serisi ve IoT telemetrisi', 'Finansal refleks ve piyasa ticker verileri', 'Kullanıcı profil ve kişiselleştirme motorları'],
    pricingTip: 'Prodüksiyonda en az 3 düğüm önerilir; 1 TB altındaki veriler için Bigtable açmak minimum küme maliyeti nedeniyle maliyet-etkin değildir.'
  },
  {
    id: 'gcp-biglake',
    name: 'Google BigLake',
    provider: 'gcp',
    category: 'Storage & Lakehouse',
    badge: 'Multi-Cloud Lakehouse Storage',
    summary: 'Cloud Storage (GCS), AWS S3 ve Azure Data Lake üzerindeki açık formatlı (Parquet, ORC, Iceberg) tablolara BigQuery\'nin kurumsal güvenlik, erişim denetimi ve hızlandırma motorunu genişleten Lakehouse depolama motorudur.',
    coreFeatures: [
      'Sıfır Kopya Güvenlik: Nesne deposundaki dosyalara BigQuery Row-Level Security ve Column Masking uygulama.',
      'Açık Format Desteği: Apache Iceberg, Delta Lake ve Parquet nesne tablolarını şeffaf şekilde yönetir.',
      'Çoklu Bulut Sorgulama (BigQuery Omni): AWS S3 ve Azure Blob verilerini taşımadan yerel bölgelerinde sorgular.',
      'Metadata Caching: Parquet ve Iceberg dosya üstverilerini önbelleğe alarak sorgu planlama süresini kat kat hızlandırır.'
    ],
    examAppearances: [
      {
        exam: 'Google Cloud Professional Data Engineer (GCP PDE)',
        frequency: 'Yüksek',
        typicalQuestion: 'GCS üzerinde duran 80 TB Parquet log dosyasının kopyalanmadan BigQuery ile analiz edilmesi ve kredi kartı kolonunun hassas maskelenmesi.',
        whenItIsCorrect: 'Veriyi BigQuery dahili depolamasına kopyalamadan Cloud Storage üzerinde satır/sütun güvenliği ve Dataplex politikası istendiğinde doğru cevaptır.',
        whenItFails: 'Veri zaten BigQuery native tablolarında duracaksa BigLake gerekmez, standart BigQuery özellikleri yeterlidir.',
        keyHeuristic: 'Sınavda harici dosyalara Zero-Copy ile satır/sütun güvenliği uygulama sorusunun GCP\'deki tek karşılığı BigLake\'tir.'
      }
    ],
    alternatives: [
      { name: 'AWS Lake Formation', provider: 'aws', comparison: 'Lake Formation S3 üzerinde benzer veri filtreleri ve hücre düzeyi güvenlik sunar.' },
      { name: 'Microsoft Fabric OneLake Shortcuts', provider: 'azure', comparison: 'OneLake Shortcuts harici bulut dosyalarını Azure ambarında kopyalamadan birleştirir.' }
    ],
    primaryUseCases: ['Açık formatlı kurumsal Lakehouse mimarileri', 'Çoklu bulut veri analitiği (BigQuery Omni)', 'GCS veri gölü erişim denetimi'],
    pricingTip: 'BigLake tabloları BigQuery saklama ücreti üretmez; yalnızca GCS saklama ve BigQuery sorgu slotu harcar.'
  },

  // ==========================================
  // AZURE TOOLS
  // ==========================================
  {
    id: 'azure-fabric',
    name: 'Microsoft Fabric (OneLake & Direct Lake)',
    provider: 'azure',
    category: 'Storage & Lakehouse',
    badge: 'Unified SaaS Data Platform',
    summary: 'Veri ambarı, göl mimarisi, gerçek zamanlı analitik ve Power BI iş zekasını "OneLake" mantıksal gölü etrafında tek bir SaaS çatı altında toplayan uçtan uca veri analitik platformudur.',
    coreFeatures: [
      'OneLake ("Verinin OneDrive\'ı"): Tüm kurumsal veriyi Delta Parquet formatında tek bir mantıksal gölde tutar.',
      'OneLake Shortcuts: AWS S3, Google Cloud Storage veya ADLS Gen2 üzerindeki verileri kopyalamadan anında OneLake\'e bağlama.',
      'Power BI Direct Lake Modu: Verileri Power BI belleğine Import yapmadan doğrudan OneLake Delta dosyalarından milisaniyede sorgulama.',
      'Lakehouse & Warehouse İkilisi: Aynı veriye hem PySpark ile (Lakehouse) hem de T-SQL ile (Warehouse) sıfır kopya erişim.',
      'Tek Kapasite Modeli: Tüm servislerin (Spark, SQL, KQL, Power BI) tek bir Fabric F-SKU kapasitesinden beslenmesi.'
    ],
    examAppearances: [
      {
        exam: 'Microsoft Azure Data Engineer / Fabric (DP-700 / DP-203)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'AWS S3 ve GCS\'te bulunan analitik verilerin Azure\'a taşınmadan birleşik bir Power BI raporlama modeline bağlanması ve milisaniyelik rapor performansı.',
        whenItIsCorrect: 'Çapraz bulut verilerini kopyalamadan bağlamak için `OneLake Shortcuts` ve Power BI\'da Import gecikmesini kaldırmak için `Direct Lake Mode` doğru çözümdür.',
        whenItFails: 'Veri kaynağı Delta/Parquet değil de eski ilişkisel tablolar ise Direct Lake doğrudan çalışmaz, DirectQuery veya Import gerekir.',
        keyHeuristic: 'Sınavda Power BI rapor hızlandırma sorusunda "Import yapıp her saat yenilemek" anti-pattern\'dır; doğru yanıt OneLake Direct Lake modudur.'
      }
    ],
    alternatives: [
      { name: 'Google BigLake & Omni', provider: 'gcp', comparison: 'GCP tarafında çapraz bulut sıfır kopya sorgulamayı BigLake Omni yürütür.' },
      { name: 'AWS Lake Formation & Athena', provider: 'aws', comparison: 'AWS tarafında açık S3 gölleri üzerinde benzer yetkilendirme sağlar.' }
    ],
    primaryUseCases: ['Yeni nesil kurumsal analitik ve Power BI semantik modelleri', 'Çoklu bulut veri gölü konsolidasyonu (Shortcuts)', 'Birleşik SQL ve Spark analitiği'],
    pricingTip: 'Direct Lake modu Power BI modelleri için ayrı Analysis Services veya ek bellek maliyeti üretmez; OneLake dosyalarından beslenir.'
  },
  {
    id: 'azure-event-hubs',
    name: 'Azure Event Hubs & Event Hubs Capture',
    provider: 'azure',
    category: 'Streaming & Ingestion',
    badge: 'Big Data Streaming Bus',
    summary: 'Saniyede milyonlarca olayı alabilen, düşük gecikmeli, Apache Kafka istemcileriyle uyumlu ve otomatik olarak ADLS Gen2\'ye veri yazabilen büyük veri akış servisidir.',
    coreFeatures: [
      'Throughput Units (TUs) & Auto-Inflate: İhtiyaç duyulan işlem gücüne göre TU kiralama ve trafiğe göre otomatik büyütme (Auto-Inflate).',
      'Event Hubs Capture: Sıfır kod ile akış verisini doğrudan ADLS Gen2 veya Azure Blob\'a Avro/Parquet formatında arşivleme.',
      'Kafka API Uyumluluğu: Mevcut Apache Kafka 1.0+ üretici ve tüketicileri kod değiştirmeden Event Hubs\'a bağlanabilir.',
      'Bölümleme (Partitions): Paralel işlem için veriyi bağımsız bölümlere ayırma (tipik 4-32 partition).',
      'Dedicated Clusters: Büyük kurumsal yükler için kiracı izolasyonlu ayrılmış kümeler.'
    ],
    examAppearances: [
      {
        exam: 'Azure Data Engineer Associate (DP-203 / DP-700)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'IoT cihazlarından gelen akış verisinin hiçbir ETL kodu yazmadan, en ucuz şekilde ve otomatik olarak ADLS Gen2 veri gölüne saklanması talebi.',
        whenItIsCorrect: 'Sıfır kod ile göle arşivleme istendiğinde `Event Hubs Capture` ve mevcut Kafka uygulamalarını yönetilen buluta taşırken doğru cevaptır.',
        whenItFails: 'Mesajlar arasında iki yönlü RPC veya oturum yönetimi gerekiyorsa IoT Hub veya Azure Service Bus seçilmelidir.',
        keyHeuristic: 'Akış verisini depolamak için araya Azure Function veya Stream Analytics koyup Blob\'a yazmak pahalıdır; yerleşik `Event Hubs Capture` açılmalıdır.'
      }
    ],
    alternatives: [
      { name: 'Amazon Kinesis Data Streams', provider: 'aws', comparison: 'Kinesis shard bazlı çalışır; Event Hubs TU ve partition modeliyle ölçeklenir.' },
      { name: 'Google Cloud Pub/Sub', provider: 'gcp', comparison: 'Pub/Sub globaldir; Event Hubs ise partition bazlı mesaj tutma sunar.' }
    ],
    primaryUseCases: ['Büyük veri telemetri ve log toplama', 'Kafka tabanlı uygulamaların buluta göçü', 'Gerçek zamanlı Stream Analytics akış beslemesi'],
    pricingTip: 'Auto-Inflate açılarak ani trafik artışlarında throttling (429) engellenir ve trafik düşünce TU tabanına geri inilir.'
  },
  {
    id: 'azure-data-factory',
    name: 'Azure Data Factory (ADF)',
    provider: 'azure',
    category: 'Compute & Transform',
    badge: 'Hybrid ETL/ELT Orchestrator',
    summary: 'Bulut ölçeğinde veri entegrasyonu sağlayan, 100\'den fazla yerel bağlayıcıya sahip, görsel veri akışları (Mapping Data Flows) ve karmaşık iş akışı orkestrasyonu sunan ETL/ELT servisidir.',
    coreFeatures: [
      'Copy Activity: İlişkisel veritabanları, SaaS araçları ve nesne depoları arasında yüksek hızlı paralel veri transferi.',
      'Tumbling Window Triggers: Zaman serisi verileri için geçmişe dönük pencereli (backfill) ve bağımlılık zincirli tetikleyici.',
      'Self-Hosted Integration Runtime (SHIR): Şirket içi (on-premise) kurumsal ağdaki veritabanlarına güvenli şekilde erişim.',
      'Mapping Data Flows: Kod yazmadan Apache Spark altyapısında veri temizleme, birleştirme ve dönüştürme.',
      'Monitoring & Alerting: Azure Monitor entegrasyonu ile pipeline çalışma süreleri ve hata bildirimleri.'
    ],
    examAppearances: [
      {
        exam: 'Azure Data Engineer Associate (DP-203)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Geçmiş 12 aya ait saatlik verilerin sırayla yeniden işlenmesi (backfill) ve başarısız olan saatlik dilimlerin bağımsız olarak yeniden denenmesi (retry).',
        whenItIsCorrect: 'Zaman pencereli backfill ve bağımlılık yönetiminde `Tumbling Window Trigger` seçilmeli; şirket içi SQL Server\'a bağlanırken `Self-Hosted IR` kurulmalıdır.',
        whenItFails: 'Klasik Schedule Trigger ile geçmişe dönük pencereli bağımlılık yönetilemez (anti-pattern).',
        keyHeuristic: 'On-premise veritabanından buluta veri çekerken tek güvenli ve sınavda doğru olan köprü Self-Hosted Integration Runtime\'dır.'
      }
    ],
    alternatives: [
      { name: 'AWS Step Functions & Glue', provider: 'aws', comparison: 'AWS\'te orkestrasyon Step Functions, veri taşıma ise Glue veya AppFlow ile yapılır.' },
      { name: 'Apache Airflow / Cloud Composer', provider: 'gcp', comparison: 'Airflow Python kodu ile DAG tanımlarken; ADF JSON ve görsel tuval arayüzü sunar.' }
    ],
    primaryUseCases: ['Şirket içi sistemlerden Azure Data Lake\'e veri kopyalama', 'Görsel veri dönüşüm boru hatları', 'Kurumsal veri ambarı besleme orkestrasyonu'],
    pricingTip: 'Mapping Data Flow Spark kümelerini çalıştırdığı için maliyetlidir; yalnızca veri taşıma yapılacaksa hafif Copy Activity kullanılmalıdır.'
  },
  {
    id: 'azure-synapse',
    name: 'Azure Synapse Analytics (Dedicated vs Serverless SQL)',
    provider: 'azure',
    category: 'Warehouse & Serving',
    badge: 'Enterprise Analytics Service',
    summary: 'Büyük veri analitiği ile kurumsal veri ambarını tek çatı altında birleştiren; 60 dağıtımlı MPP Dedicated havuzları ve göldeki dosyaları anında sorgulayan Serverless SQL motoruna sahip analitik platformudur.',
    coreFeatures: [
      'Dedicated SQL Pools: DWU (Data Warehouse Unit) bazlı, 60 düğüme bölünmüş MPP ilişkisel analitik ambar.',
      'Tablo Dağıtım Stilleri: HASH (JOIN optimizasyonu), REPLICATED (boyut tablolarını kopyalama), ROUND_ROBIN (hızlı staging).',
      'Serverless SQL Pools: Taranan TB başına $5 ödeyen, S3/ADLS üzerindeki Parquet/Delta dosyalarını `OPENROWSET` ile sorgulayan motor.',
      'Synapse Link: Cosmos DB ve Dataverse verilerini ETL yapmadan doğrudan analitik motoruna bağlayan HTAP mimarisi.',
      'Synapse Studio: SQL betikleri, Spark not defterleri ve ADF pipeline\'larını tek arayüzde birleştirme.'
    ],
    examAppearances: [
      {
        exam: 'Azure Data Engineer Associate (DP-203)',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Büyük bir olgu tablosu ile boyut tablolarının JOIN sorgularında aşırı Data Movement Service (DMS) Shuffle yaşanması ve göldeki ad-hoc dosyaların ucuz incelenmesi.',
        whenItIsCorrect: 'JOIN optimizasyonu için büyük tabloya `HASH(id)` ve küçük tabloya `REPLICATED` atanmalıdır. Göldeki dosyaları incelemek için Dedicated havuz değil `Serverless SQL` seçilmelidir.',
        whenItFails: 'Tüm tabloları ROUND_ROBIN bırakmak JOIN\'lerde ağ karıştırmasını (DMS Shuffle) patlatır ve sorguları kilitler.',
        keyHeuristic: 'Sadece arada sırada göldeki Parquet dosyalarını SQL ile okumak için Dedicated SQL Pool açmak faturayı boşuna şişirir; Serverless SQL kullanılmalıdır.'
      }
    ],
    alternatives: [
      { name: 'Amazon Redshift & Athena', provider: 'aws', comparison: 'Synapse Dedicated Redshift\'e, Synapse Serverless SQL ise doğrudan Athena\'ya denktir.' },
      { name: 'Google BigQuery', provider: 'gcp', comparison: 'BigQuery tek motorda hem ambar hem sunucusuz göl sorgusunu birleştirir.' }
    ],
    primaryUseCases: ['Petabayt ölçeğinde kurumsal veri ambarı (Dedicated)', 'Göldeki Parquet dosyalarında ad-hoc SQL analizi (Serverless)', 'Cosmos DB canlı analitik raporlama (Synapse Link)'],
    pricingTip: 'Dedicated havuz kullanılmadığı saatlerde duraklatılabilir (pause); Serverless SQL ise boşta dururken $0 maliyet üretir.'
  },

  // ==========================================
  // DATABRICKS & LAKEHOUSE TOOLS
  // ==========================================
  {
    id: 'dbx-autoloader',
    name: 'Databricks Auto Loader (cloudFiles)',
    provider: 'oss',
    category: 'Streaming & Ingestion',
    badge: 'Databricks Ingestion Engine',
    summary: 'Bulut nesne depolarına (S3, ADLS Gen2, GCS) sürekli akan milyonlarca yeni dosyayı otomatik bildirimlerle, şema evrimini yöneterek ve bozuk verileri izole ederek Delta tablosuna artımlı (incremental) yükleyen motordur.',
    coreFeatures: [
      '`cloudFiles` Formatı: Apache Spark Structured Streaming içinde yerel kaynak formatı olarak kullanılır.',
      'İkili Keşif Modu: Directory Listing (küçük/orta veri) ve File Notification (SQS/Event Grid ile milyonlarca dosya).',
      'Şema Çıkarımı ve Evrimi: `schemaEvolutionMode = "addNewColumns"` ile yeni kolonları pipeline kesilmeden ekler.',
      '`_rescued_data` Kolonu: Hedef şema ile eşleşmeyen, tipi bozuk veya parse edilemeyen verileri saklayarak veri kaybını önler.',
      'Exactly-Once Garantisi: Checkpoint ve RocksDB tabanlı durum deposu ile dosyaların çift işlenmesini engeller.'
    ],
    examAppearances: [
      {
        exam: 'Databricks Certified Data Engineer Associate',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Göl deposuna sürekli JSON dosyaları inen bir senaryoda ara sıra beklenmedik yeni kolonlar ve bozuk kayıtlar gelmesi, ancak akışın ASLA durmaması ve bozuk kayıtların saklanması talebi.',
        whenItIsCorrect: 'Milyonlarca dosyanın akış halinde Bronz katmanına yüklenmesi, şema evrimi (`addNewColumns`) ve bozuk verilerin kurtarılması (`_rescued_data`) istendiğinde tek doğru cevaptır.',
        whenItFails: 'Klasik `spark.read.json()` ile her seferinde klasörü baştan taramak milyonlarca dosyada çöker ve S3/ADLS API kotasını tüketir.',
        keyHeuristic: 'Sınavda bozuk veriyi yakalamak için try-catch UDF yazmak anti-pattern\'dır; Auto Loader\'ın yerleşik `_rescued_data` sütunu kullanılmalıdır.'
      }
    ],
    alternatives: [
      { name: 'AWS Snowpipe / COPY INTO', provider: 'aws', comparison: 'Snowpipe benzer şekilde SQS ile dosyaları yükler; Auto Loader ise Spark ve Delta Lake ile tam entegredir.' },
      { name: 'Delta Lake COPY INTO', provider: 'oss', comparison: '`COPY INTO` basit batch yüklemeler içindir; Auto Loader ise milyonlarca dosyada ve streaming akışlarda kat kat üstündür.' }
    ],
    primaryUseCases: ['Ham JSON/CSV/Parquet verilerini Delta Bronz katmanına alma', 'Göldeki dosyaları streaming pipeline\'ına besleme', 'Otomatik şema evrimi ve veri kurtarma'],
    pricingTip: 'Milyonlarca dosya olan klasörlerde File Notification modunu açarak S3/ADLS dizin tarama API masraflarından tasarruf edilir.'
  },
  {
    id: 'dbx-delta-lake',
    name: 'Delta Lake & Liquid Clustering (CLUSTER BY)',
    provider: 'oss',
    category: 'Storage & Lakehouse',
    badge: 'ACID Lakehouse Storage',
    summary: 'Açık kaynaklı Parquet dosyaları üzerine ACID işlem günlüğü (`_delta_log`), zaman yolculuğu (Time Travel), satır bazlı CDC (MERGE) ve modern dinamik Liquid Clustering optimizasyonu ekleyen depolama katmanıdır.',
    coreFeatures: [
      'ACID İşlem Günlüğü: Eşzamanlı okuma ve yazmalarda veri bozulmasını engelleyen seri hale getirilebilir (serializable) izolasyon.',
      'Liquid Clustering (`CLUSTER BY`): Geleneksel fiziksel bölümleme ve Z-ORDER yerine çok sütunlu dinamik veri kümeleme.',
      'Zaman Yolculuğu (Time Travel): `VERSION AS OF` veya `TIMESTAMP AS OF` ile tablonun geçmişteki haline anında geri dönebilme.',
      'OPTIMIZE & Compaction: Küçük dosyaları birleştirerek 1 GB boyutunda ideal Parquet dosyaları oluşturma.',
      'VACUUM: Eski dosya sürümlerini fiziksel olarak temizleyerek depolama maliyetini düşürme.'
    ],
    examAppearances: [
      {
        exam: 'Databricks Certified Data Engineer Associate',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Günde 20 TB veri eklenen tabloda hem tarih hem mağaza hem müşteri kolonuna göre filtreleme yapılması ve Z-ORDER işleminin saatlerce sürmesi.',
        whenItIsCorrect: 'Aşırı bölümleme (over-partitioning) sorununu çözmek ve birden fazla yüksek kardinaliteli kolonu optimize etmek için modern `CLUSTER BY` (Liquid Clustering) doğru cevaptır.',
        whenItFails: '`VACUUM` süresini 0 güne çekmek anti-pattern\'dır; geçmişe dönük Time Travel sorgularını patlatır (`FileNotFoundException`).',
        keyHeuristic: 'Modern Databricks sınavlarında geleneksel PARTITIONED BY ve Z-ORDER yerine Liquid Clustering (`CLUSTER BY`) altın kuraldır.'
      }
    ],
    alternatives: [
      { name: 'Apache Iceberg', provider: 'oss', comparison: 'Iceberg Hidden Partitioning ve bağımsız manifest ağacı sunar; Delta Lake ise Spark/Databricks ile en derin entegrasyona sahiptir.' },
      { name: 'Apache Hudi', provider: 'oss', comparison: 'Hudi özellikle hızlı satır düzeyinde güncelleme (Merge-on-Read) için geliştirilmiştir.' }
    ],
    primaryUseCases: ['Medallion (Bronz, Gümüş, Altın) veri gölü mimarisi', 'Boyutlu veri ambarı tabloları (SCD Type 2 MERGE)', 'Geriye dönük denetim ve zaman yolculuğu analitiği'],
    pricingTip: 'Periyodik `OPTIMIZE` çalıştırarak küçük dosya sayısını azaltmak, sorgu tarama süresini ve DBU tüketimini %70 düşürür.'
  },
  {
    id: 'dbx-dlt',
    name: 'Delta Live Tables (DLT Expectations)',
    provider: 'oss',
    category: 'Compute & Transform',
    badge: 'Declarative ETL Framework',
    summary: 'Delta Lake üzerinde güvenilir, test edilebilir ve izlenebilir veri boru hatları inşa etmek için SQL veya Python ile yazılan bildirimsel (declarative) ETL çerçevesidir.',
    coreFeatures: [
      'Bildirimsel Sözdizimi: Pipeline altyapısını, küme boyutunu ve yeniden denemeleri Databricks otomatik yönetir.',
      'Veri Kalitesi Kuralları (Expectations): `@dlt.expect`, `@dlt.expect_or_drop`, `@dlt.expect_or_fail`.',
      'Akış ve Materyalize Görünümler: Streaming Tables (artımlı ekleme) ve Materialized Views (otomatik tazelemeli agregasyon).',
      'Otomatik Veri Soykütüğü (Lineage): Tablolar arasındaki bağımlılık grafiğini görsel olarak çıkarır.',
      'Gelişmiş Hata Yönetimi: Bozuk veri metriklerini sistem olay günlüğüne (event log) kaydederek canlı izleme sunar.'
    ],
    examAppearances: [
      {
        exam: 'Databricks Certified Data Engineer Associate',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Gelen akışta kullanıcı ID\'si boş olan kayıtların Gold tablosuna sızmaması, bu satırların otomatik filtrelenmesi ancak pipeline\'ın durdurulmaması talebi.',
        whenItIsCorrect: 'Hatalı satırları eleyip temiz satırları geçirmek için `@dlt.expect_or_drop`; kritik finansal süreçlerde hattı durdurmak için `@dlt.expect_or_fail` doğru yanıttır.',
        whenItFails: 'Hatalı satırları elle haftalık SQL ile silmek veya pipeline\'ı her hatada manuel kapatmak sınavın en ağır anti-pattern\'larıdır.',
        keyHeuristic: 'Soru kökünde "satır atılsın ama hat devam etsin" deniyorsa cevap `expect_or_drop`tur; "kesinlikle hata verip dursun" deniyorsa `expect_or_fail`dir.'
      }
    ],
    alternatives: [
      { name: 'dbt (data build tool)', provider: 'oss', comparison: 'dbt SQL modelleri ve testleri derler; DLT ise hem batch hem streaming ETL\'i doğrudan Databricks Spark kümesinde çalıştırır.' },
      { name: 'Apache Airflow', provider: 'oss', comparison: 'Airflow genel orkestratördür; DLT ise veri hattının durumunu ve kalitesini deklaratif yönetir.' }
    ],
    primaryUseCases: ['Medallion mimarisi boru hattı otomasyonu', 'Üretim veri kalitesi ve SLA denetimi', 'Streaming ve batch dönüşümlerinin birleştirilmesi'],
    pricingTip: 'Geliştirme aşamasında "Development Mode" açılarak kümenin sürekli ayakta kalması sağlanır ve her çalıştırmada 5 dk küme bekleme masrafı sıfırlanır.'
  },
  {
    id: 'dbx-unity-catalog',
    name: 'Databricks Unity Catalog',
    provider: 'oss',
    category: 'Orchestration & Governance',
    badge: 'Universal Data Governance',
    summary: 'Databricks ekosistemindeki tüm çalışma alanları (workspaces) için dosyalar, tablolar, hacimler (volumes), modeller ve paneller üzerinde birleşik yönetişim, veri soykütüğü ve erişim kontrolü sağlayan merkezi katalogdur.',
    coreFeatures: [
      '3 Seviyeli Ad Alanı (3-Level Namespace): `catalog.schema.table` formatıyla çok kiracılı ve organize veri hiyerarşisi.',
      'Merkezi Erişim Kontrolü: Standart ANSI SQL `GRANT / REVOKE` komutlarıyla tüm çalışma alanlarında geçerli yetki tanımlama.',
      'Otomatik Veri Soykütüğü (Lineage): Sütun düzeyinde hangi verinin hangi tablodan üretildiğini otomatik takip eder.',
      'Sütun Maskeleme ve Satır Filtreleme: SQL kullanıcı tanımlı fonksiyonlar (UDF) ile dinamik veri maskeleme.',
      'Hacimler (Volumes): Parquet/Delta dışındaki yapılandırılmamış dosyaları (PDF, görsel, model ağırlıkları) yönetme.'
    ],
    examAppearances: [
      {
        exam: 'Databricks Certified Data Engineer Associate',
        frequency: 'Yüksek',
        typicalQuestion: 'Birden fazla Databricks çalışma alanı (workspace) arasında aynı Delta tablosuna merkezi izin verme ve sütun bazında kimlik bilgilerini dinamik maskeleme.',
        whenItIsCorrect: 'Eski Hive Metastore yerine merkezi çoklu çalışma alanı yönetimi ve 3 seviyeli ad alanı (`catalog.schema.table`) sorulduğunda Unity Catalog doğru cevaptır.',
        whenItFails: 'Veriyi çalışma alanlarına göre kopyalamak veya her çalışma alanında ayrı lokal Hive metastore açmak anti-pattern\'dır.',
        keyHeuristic: 'Unity Catalog ile artık tablolar iki seviyeli (`schema.table`) değil; mutlaka üç seviyelidir: `catalog.schema.table`.'
      }
    ],
    alternatives: [
      { name: 'AWS Glue Data Catalog', provider: 'aws', comparison: 'Glue AWS IAM ile çalışır; Unity Catalog ise Databricks üzerinde çapraz bulut (AWS/Azure/GCP) tek tip güvenlik sağlar.' },
      { name: 'Microsoft Purview', provider: 'azure', comparison: 'Purview kurumsal genişlikte veri kataloğudur; Unity Catalog Databricks çalışma alanının kalbidir.' }
    ],
    primaryUseCases: ['Kurumsal çoklu çalışma alanı yönetişimi', 'Sütun düzeyinde veri soykütüğü (Data Lineage)', 'Yapılandırılmamış veri hacimlerinin (Volumes) yönetimi'],
    pricingTip: 'Unity Catalog yerleşik bir özelliktir; ekstra servis lisans maliyeti yoktur ve metastore yönetimi sunucusuzdur.'
  },
  {
    id: 'oss-iceberg',
    name: 'Apache Iceberg',
    provider: 'oss',
    category: 'Storage & Lakehouse',
    badge: 'Open Table Format Standard',
    summary: 'Amazon S3, GCS ve MinIO gibi nesne depolarını yüksek performanslı ilişkisel analitik tablolara dönüştüren; gizli bölümleme (Hidden Partitioning), şema evrimi ve anlık görüntü (snapshot) izolasyonu sunan açık tablo formatıdır.',
    coreFeatures: [
      'Metadata Ağacı Mimarisi: Iceberg Catalog -> Metadata JSON -> Manifest List -> Manifest File -> Data Files (Parquet).',
      'Hidden Partitioning (Gizli Bölümleme): Kullanıcılar fiziksel partition yapısını bilmeden (ör: `event_date`) sorgu attığında Iceberg otomatik filtreleme yapar.',
      'In-Place Schema Evolution: Kolon ekleme, silme, yeniden adlandırma veya tür yükseltme işlemlerinde veriyi yeniden yazmaz.',
      'Snapshot Isolation: Yazıcılar ve okuyucular birbirini kilitlemez (ACID garantisi).',
      'Time Travel & Rollback: Her işlem yeni bir snapshot üretir; istenen eski bir snapshot ID\'sine anında dönülebilir.'
    ],
    examAppearances: [
      {
        exam: 'AWS DEA-C01 & Modern Lakehouse Exams',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'S3 üzerindeki açık veri gölünde analistlerin yanlış partition filtresi yazması yüzünden sorguların tüm tabloyu taraması ve şema değişimlerinde tabloların bozulması.',
        whenItIsCorrect: 'Gizli bölümleme (Hidden Partitioning) ile kullanıcı hatalarını önlemek ve açık formatta ACID time-travel sağlamak istendiğinde doğru çözümdür.',
        whenItFails: 'Milyonlarca küçük dosya periyodik olarak compact edilmezse manifest dosyaları şişer ve sorgu planlama süresi uzar.',
        keyHeuristic: 'Iceberg\'de partition değiştirmek tabloyu baştan yaratmayı veya veriyi taşımayı gerektirmez; `Partition Evolution` özelliğiyle geriye dönük uyumludur.'
      }
    ],
    alternatives: [
      { name: 'Delta Lake', provider: 'oss', comparison: 'Delta Lake JSON tabanlı `_delta_log` tutar; Iceberg ise hiyerarşik Avro manifest ağacı kullanır.' },
      { name: 'Apache Hudi', provider: 'oss', comparison: 'Hudi özellikle stream upsert işlemlerinde güçlüdür; Iceberg ise analitik okuma optimizasyonu ve motor bağımsızlığıyla öne çıkar.' }
    ],
    primaryUseCases: ['Çoklu motorlu göl mimarileri (Athena, Spark, Snowflake, Trino)', 'Büyük ölçekli veri gölü standardizasyonu', 'Regüle edilen finansal ACID gölleri'],
    pricingTip: 'Periyodik `expire_snapshots` ve `rewrite_data_files` işlemleri çalıştırılarak ölü manifest ve küçük dosya depolama maliyeti engellenmelidir.'
  },
  {
    id: 'oss-kafka',
    name: 'Apache Kafka & Dead Letter Queue (DLQ)',
    provider: 'oss',
    category: 'Streaming & Ingestion',
    badge: 'Distributed Event Streaming',
    summary: 'Yüksek verimli, düşük gecikmeli, hata toleranslı ve dağıtık olay akışı (event streaming) platformu; kurumsal mikroservislerin ve veri mühendisliği hatlarının merkezi omurgasıdır.',
    coreFeatures: [
      'Topic & Partition Yapısı: Veriler partition bazında diskte sıralı (append-only commit log) saklanır.',
      'Consumer Groups: Birden fazla tüketici grubunun aynı konuyu kendi hızlarında paralel ve bağımsız okuyabilmesi.',
      'Producer ACKs (0, 1, all): `acks=all` ve `min.insync.replicas=2` ile sıfır veri kaybı garantisi.',
      'Dead Letter Queue (DLQ): Ayrıştırılamayan veya iş kuralı hatası veren bozuk mesajların ana akışı tıkamadan yönlendirildiği konu.',
      'Log Compaction: Her anahtarın (key) yalnızca en güncel değerini saklayarak CDC ve durum tablosu oluşturabilme.'
    ],
    examAppearances: [
      {
        exam: 'AWS DEA-C01 (MSK) & GCP PDE & Databricks',
        frequency: 'Çok Yüksek',
        typicalQuestion: 'Streaming pipeline\'da tek bir bozuk JSON mesajı yüzünden tüm tüketici grubunun hata verip kilitlenmesi ve gecikmenin (consumer lag) artması.',
        whenItIsCorrect: 'Zehirli mesajları yakalayıp ana akışın devam etmesini sağlamak için `Dead Letter Queue (DLQ)` mimarisi doğru cevaptır. Sıfır veri kaybı için `acks=all` seçilmelidir.',
        whenItFails: 'Hata veren mesajları yakalamayıp akışı durdurmak veya hatalı mesajları anında silmek sınavın en ağır anti-pattern\'larıdır.',
        keyHeuristic: 'Consumer processing süresi `max.poll.interval.ms` limitini aşarsa consumer gruptan atılır ve rebalance fırtınası çıkar. Batch boyutu küçültülmelidir.'
      }
    ],
    alternatives: [
      { name: 'Amazon MSK', provider: 'aws', comparison: 'AWS\'in tam yönetilen Kafka servisidir; küme bakımını otomatikleştirir.' },
      { name: 'Google Cloud Pub/Sub', provider: 'gcp', comparison: 'Pub/Sub partition yönetimi istemez; Kafka ise katı partition sıralaması ve log compaction sunar.' }
    ],
    primaryUseCases: ['Kurumsal olay güdümlü (event-driven) mimariler', 'Gerçek zamanlı CDC (Debezium) veri akışı', 'Yüksek hacimli log ve telemetri omurgası'],
    pricingTip: 'Kullanılmayan eski partition verileri için `retention.ms` veya `retention.bytes` doğru ayarlanarak disk maliyet patlamaları önlenmelidir.'
  }
];
