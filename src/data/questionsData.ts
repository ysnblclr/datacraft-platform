import { CertificationQuestion } from '../types';

export const certificationQuestions: CertificationQuestion[] = [
  // 1. AWS DEA-C01: Real-Time Streaming Ingestion & Schema Evolution
  {
    id: 'aws-dea-001',
    exam: 'AWS_DEA_C01',
    examTitle: 'AWS Certified Data Engineer - Associate',
    domain: 'Domain 1: Data Ingestion and Transformation (34%)',
    difficulty: 'İleri Seviye',
    cloudTarget: 'aws',
    pipelineTemplateId: 'streaming_iot',
    primaryServices: ['Amazon Kinesis Data Streams', 'Amazon Data Firehose', 'AWS Glue Data Catalog', 'Amazon S3', 'Apache Iceberg'],
    scenario: 'Bir e-ticaret şirketi, binlerce POS cihazından saniyede 25.000 JSON olayı alan bir veri akış boru hattı tasarlamaktadır. Analitik ekibi, ACID işlemlerini desteklemek ve geriye dönük zaman yolculuğu (time-travel) yapabilmek amacıyla verinin Amazon S3 üzerindeki Apache Iceberg tablolarına 3 dakikanın altında gecikmeyle kaydedilmesini talep etmektedir. JSON şeması zaman zaman yeni opsiyonel alanlar eklemektedir. Çözüm sunucusuz olmalı ve sıfır operasyonel yönetim gerektirmelidir.',
    prompt: 'Hangi mimari kombinasyonu en düşük operasyonel yük ve en optimize maliyetle bu gereksinimi karşılar?',
    keyTakeaway: 'Amazon Data Firehose, AWS Glue Data Catalog entegrasyonu ile S3 üzerindeki Apache Iceberg tablolarına doğrudan sunucusuz teslimat yapar ve şema evrimini otomatik yönetir.',
    options: [
      {
        id: 'opt-aws-01-a',
        letter: 'A',
        text: 'Olayları Amazon Kinesis Data Streams içine aktarmak. Kinesis Data Firehose akışını bu kaynağa bağlayıp teslimat formatı olarak AWS Glue Data Catalog ile entegre Apache Iceberg tablosunu seçmek ve şema evrimini AWS Glue Schema Registry ile otomatikleştirmek.',
        isCorrect: true,
        antiPatternType: 'none',
        affectedNodes: ['ingestion', 'compute', 'storage'],
        explanation: 'Doğru. Amazon Data Firehose, Apache Iceberg formatını yerel olarak destekler. Kinesis Data Streams ile tamponlanan olaylar, Firehose tarafından micro-batch halinde S3 Iceberg tablosuna yazılır; şema evrimi Glue Schema Registry ile yönetilir ve sıfır EC2/EMR yönetimi gerektirir.',
        tradeoffs: {
          latency: '< 2 Dakika (Tam SLA Uyumlu)',
          cost: 'Tamamen Sunucusuz & GB Başına Billed',
          ops: 'Sıfır Sunucu Bakımı (Tam Yönetilen)',
          scalability: 'Kinesis On-Demand ile Otomatik Şeffaf Ölçekleme'
        }
      },
      {
        id: 'opt-aws-01-b',
        letter: 'B',
        text: 'Olayları Amazon MSK (Kafka) içine göndermek. EC2 üzerinde çalışan Apache EMR kümesinde Spark Structured Streaming işi açıp her 5 saniyede bir S3 Iceberg tablosuna yazmak ve şema göçleri için Lambda ile EventBridge tetikleyicisi yazmak.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['compute'],
        explanation: 'Hatalı. EC2 üzerinde EMR kümesi çalıştırmak sürekli sunucu yönetimi, yama yükleme ve maliyet gerektirir. Soru kökündeki "sunucu yönetimi olmamalı ve sıfır operasyonel yük" şartını doğrudan ihlal eder.',
        tradeoffs: {
          latency: 'Sub-second (Gereksiz Yüksek Hız)',
          cost: '4x - 6x Daha Yüksek Sabit Küme Maliyeti',
          ops: 'Ağır DevOps ve Küme Bakımı Gerekir',
          scalability: 'EMR Worker Düğümlerine Bağımlı'
        }
      },
      {
        id: 'opt-aws-01-c',
        letter: 'C',
        text: 'Olayları Amazon SQS FIFO kuyruğuna yönlendirmek. Her mesaj için bir AWS Lambda fonksiyonu tetikleyip tekil Parquet dosyası olarak S3\'e yazmak ve şema güncellemeleri için Amazon Athena üzerinde ALTER TABLE sorguları çalıştırmak.',
        isCorrect: false,
        antiPatternType: 'small_files',
        affectedNodes: ['ingestion', 'compute', 'storage'],
        explanation: 'Hatalı. Saniyede 25.000 olay için tek tek Lambda tetiklemek günde 2.16 milyar çağrı demektir (aşırı maliyet!). Milyonlarca tek kayıtlık minik dosya üretmek S3 "Small Files Problem" yaratır ve Athena DDL eşzamanlılık limitlerini kilitler.',
        tradeoffs: {
          latency: 'Yüksek Kuyruk Gecikmesi & Throttling',
          cost: 'Aşırı Yüksek Lambda & S3 PUT API Faturası',
          ops: 'Kırılgan & Hata Üretmeye Yatkın',
          scalability: 'Athena DDL Limitlerine ve S3 API Sınırlarına Takılır'
        }
      },
      {
        id: 'opt-aws-01-d',
        letter: 'D',
        text: 'Olayları Kinesis Firehose ile doğrudan S3\'e ham JSON olarak yazmak. Her 2 saatte bir çalışan AWS Glue Python Shell işiyle bu JSON dosyalarını PyIceberg kullanarak Iceberg formatına dönüştürmek.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['compute', 'storage'],
        explanation: 'Hatalı. İki saatlik toplu iş (batch) çalıştırmak, analitik ekibinin talep ettiği "3 dakikanın altında gecikme" SLA şartını doğrudan ihlal eder.',
        tradeoffs: {
          latency: '2 Saat Gecikme (SLA İhlali)',
          cost: 'Orta Seviye',
          ops: 'Yarı Manuel İş Çizelgeleme',
          scalability: 'Toplu İş Dönemlerinde Bellek Baskısı'
        }
      }
    ]
  },

  // 2. GCP PDE: Multi-Region BigLake Security & Row/Column Masking
  {
    id: 'gcp-pde-002',
    exam: 'GCP_PDE',
    examTitle: 'Google Cloud Professional Data Engineer',
    domain: 'Section 3: Storing the Data & BigLake Governance (~25%)',
    difficulty: 'İleri Seviye',
    cloudTarget: 'gcp',
    pipelineTemplateId: 'streaming_iot',
    primaryServices: ['Google Cloud Storage', 'BigLake', 'BigQuery', 'Cloud DLP', 'Policy Tags'],
    scenario: 'Global bir bankacılık kuruluşu, Cloud Storage (GCS) üzerindeki 80 TB boyutundaki müşteri işlem loglarını BigQuery üzerinden analiz etmek istemektedir. Regülasyon gereği: 1) Veri kesinlikle GCS dışına kopyalanmamalıdır (Zero-Copy), 2) Finans analistleri sadece kendi ülkelerine ait satırları görebilmeli, 3) Kredi kartı ve kimlik numarası gibi sütunlar yetkisiz kullanıcılara dinamik olarak maskelenmiş görünmelidir.',
    prompt: 'En yüksek güvenlik seviyesini ve en düşük sorgu maliyetini sağlayan GCP mimarisi hangisidir?',
    keyTakeaway: 'BigLake tabloları, GCS üzerindeki açık dosyalara (Parquet/Iceberg) BigQuery Row-Level Security ve Policy Tag Dynamic Masking yetkilendirmesini veri taşımadan uygular.',
    options: [
      {
        id: 'opt-gcp-02-a',
        letter: 'A',
        text: 'Cloud Storage üzerinde BigLake tabloları tanımlamak. Ülke bazlı satır filtreleme için BigQuery Row-Level Security (RLS) kuralları eklemek; hassas sütunlar için Dataplex / Policy Tags oluşturarak Dinamik Veri Maskeleme (Dynamic Data Masking) yetkileri atamak.',
        isCorrect: true,
        antiPatternType: 'none',
        affectedNodes: ['storage', 'warehouse'],
        explanation: 'Doğru. BigLake, Cloud Storage üzerinde duran dosyalara BigQuery güvenlik motorunu genişletir. Veriyi kopyalamadan (Zero-Copy) satır seviyesi filtreleme (RLS) ve sütun seviyesi SHA-256 veya maskeleme (Policy Tags) sağlar.',
        tradeoffs: {
          latency: 'Doğrudan SQL Analizi (< 2 sn)',
          cost: 'Sıfır Veri Çoğaltma, Yalnızca Taranan Veri Ücreti',
          ops: 'Merkezi IAM & Dataplex İlkesi (Serverless)',
          scalability: 'Petabayt Ölçekli Colossus/Borg Uyumu'
        }
      },
      {
        id: 'opt-gcp-02-b',
        letter: 'B',
        text: 'Her ülke ve her departman için ayrı Cloud Storage bucket\'ları açmak. Cloud Functions ile gelen verileri filtreleyip ilgili bucket\'lara çoğaltmak ve her bucket için ayrı IAM izinleri tanımlamak.',
        isCorrect: false,
        antiPatternType: 'cost_explosion',
        affectedNodes: ['storage'],
        explanation: 'Hatalı. Veriyi düzinelerce ayrı bucket\'a kopyalamak depolama maliyetini katlar, veri senkronizasyon hataları üretir ve sütun bazlı dinamik maskelemeyi sağlamaz.',
        tradeoffs: {
          latency: 'Kopyalama Gecikmesi & Veri Uyuşmazlığı',
          cost: 'Depolama ve Ağ Maliyetlerinde Patlama',
          ops: 'Yüzlerce Bucket ve IAM Kuralı Yönetimi',
          scalability: 'Yeni Ülke Eklendikçe Çöken Mimari'
        }
      },
      {
        id: 'opt-gcp-02-c',
        letter: 'C',
        text: 'Tüm 80 TB veriyi Cloud SQL PostgreSQL kümesine yüklemek ve yetkilendirmeyi PostgreSQL görünümleri (Views) üzerinden sağlamak.',
        isCorrect: false,
        antiPatternType: 'oom_crash',
        affectedNodes: ['warehouse'],
        explanation: 'Hatalı. Cloud SQL bir OLTP ilişkisel veritabanıdır. 80 TB analitik veri için uygun değildir; disk limitlerine çarpar ve analitik sorgularda bellek yetersizliğiyle çöker.',
        tradeoffs: {
          latency: 'Analitik Sorgularda Zaman Aşımı (Timeout)',
          cost: 'Aşırı Yüksek Disk ve VM Maliyeti',
          ops: 'Veritabanı Bakımı ve İndeksleme Yükü',
          scalability: 'Dikey Sınırlara Çarpar (Ölçeklenemez)'
        }
      },
      {
        id: 'opt-gcp-02-d',
        letter: 'D',
        text: 'BigQuery\'de yetkilendirilmiş görünümler (Authorized Views) oluşturup tüm maskeleme mantığını bu view\'lar içine gömmek ve kullanıcıların doğrudan tablolara erişimini engellemek.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['warehouse'],
        explanation: 'Eksik ve verimsiz. Authorized Views temel filtreleme sağlasa da yüzlerce kombinasyon için ayrı view yönetimi gerektirir; modern Policy Tag Dynamic Data Masking ve BigLake satır seviyesi güvenliğin yerini tutmaz.',
        tradeoffs: {
          latency: 'Kabul Edilebilir',
          cost: 'Yüksek View Bakımı',
          ops: 'Yüzlerce Statik View Bakımı',
          scalability: 'Kullanıcı Rolleri Arttıkça Yönetilemez'
        }
      }
    ]
  },

  // 3. Azure DP-700 Fabric: Multi-Cloud Zero-Copy Lakehouse with OneLake
  {
    id: 'az-dp700-003',
    exam: 'AZURE_DP_700',
    examTitle: 'Microsoft Certified: Fabric Data Engineer Associate',
    domain: 'Implement & Manage Analytics Solutions (OneLake & Direct Lake)',
    difficulty: 'Orta',
    cloudTarget: 'azure',
    pipelineTemplateId: 'medallion_elt',
    primaryServices: ['Microsoft Fabric', 'OneLake Shortcuts', 'Direct Lake', 'Power BI', 'ADLS Gen2'],
    scenario: 'Büyük bir perakende şirketi, analitik verilerinin bir kısmını AWS S3 ve Google Cloud Storage üzerinde tutmaktadır. Şirketin yönetim kurulu, tüm bu verileri Azure ortamına veri taşıma (ETL/kopyalama) maliyetine girmeden Power BI ve T-SQL ile birleştirilmiş olarak raporlamak istemektedir. Raporların import modu gibi bellek hızında açılması ve ağ transfer (egress) ücretlerinin en aza indirilmesi istenmektedir.',
    prompt: 'Microsoft Fabric ekosisteminde hangi özellik kombinasyonu bu gereksinimi eksiksiz sağlar?',
    keyTakeaway: 'Fabric OneLake Shortcuts harici S3/GCS verilerine veri kopyalamadan işaretçi açar; Power BI Direct Lake modu ise Delta Parquet dosyalarını bellekten doğrudan okur.',
    options: [
      {
        id: 'opt-az-03-a',
        letter: 'A',
        text: 'Fabric OneLake içinde AWS S3 ve GCS için OneLake Shortcuts (Kestirmeler) oluşturmak. Raporlama katmanında Delta Parquet dosyalarını bellekten doğrudan okuyan Power BI Direct Lake modunu kullanmak.',
        isCorrect: true,
        antiPatternType: 'none',
        affectedNodes: ['ingestion', 'storage', 'warehouse'],
        explanation: 'Doğru. OneLake Shortcuts, AWS S3 ve Google Cloud Storage üzerindeki verilere tek bir satır veri kopyalamadan sanal bağlantı kurar. Direct Lake ise Power BI semantic modellerinin veriyi içeri aktarmadan (import gerekmeden) Delta tablolarını bellek hızında sorgulamasını sağlar.',
        tradeoffs: {
          latency: 'Anlık Raporlama (Direct Lake Bellek Hızı)',
          cost: 'Sıfır ETL Depolama Kopyası & Düşük Egress',
          ops: 'Tek Noktadan Yönetilen OneLake',
          scalability: 'SaaS Düzeyinde Küresel Ölçekleme'
        }
      },
      {
        id: 'opt-az-03-b',
        letter: 'B',
        text: 'Azure Data Factory (ADF) ile her gece çalışan saatlik Copy Activity tanımlayıp S3 ve GCS verilerini ADLS Gen2 deposuna kopyalamak; Power BI\'da Import moduyla her sabah yenileme yapmak.',
        isCorrect: false,
        antiPatternType: 'cost_explosion',
        affectedNodes: ['ingestion', 'storage'],
        explanation: 'Hatalı. Soru kökündeki "veri taşıma/kopyalama yapmadan" şartını bozar. Sürekli bulut dışına veri aktarımı (Egress fees) devasa ağ maliyetleri üretir ve güncelliği saatlerce geciktirir.',
        tradeoffs: {
          latency: '24 Saat Gecikmeli Veri',
          cost: 'Sürekli ADF Çalıştırma ve Bulut Egress Faturaları',
          ops: 'Hata Takibi Gerektiren Boru Hatları',
          scalability: 'Veri Hacmi Büyüdükçe Kopyalama Süresi Uzar'
        }
      },
      {
        id: 'opt-az-03-c',
        letter: 'C',
        text: 'Azure Synapse Analytics üzerinde PolyBase kullanarak harici tablolar tanımlamak ve her sorguda harici bulut API\'lerine doğrudan REST çağrısı yaptırmak.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['compute', 'warehouse'],
        explanation: 'Hatalı. Klasik PolyBase ve harici bağlantılar Fabric Direct Lake hızını ve OneLake birleşik modelini sunmaz; analitik raporlarda yüksek gecikmeye yol açar.',
        tradeoffs: {
          latency: 'Yüksek Sorgu Bekleme Süresi',
          cost: 'Yüksek Synapse DWU Maliyeti',
          ops: 'Karmaşık Harici Kimlik Doğrulama',
          scalability: 'Geniş Ölçekli Eşzamanlılıkta Yetersiz'
        }
      },
      {
        id: 'opt-az-03-d',
        letter: 'D',
        text: 'AWS ve GCP üzerinde sanal makineler açıp veriyi Spark ile bellek içinde birleştirip JDBC bağlantısı ile Azure SQL Veritabanına yazmak.',
        isCorrect: false,
        antiPatternType: 'cost_explosion',
        affectedNodes: ['compute'],
        explanation: 'Hatalı. Aşırı karmaşık, pahalı ve sıfır kopya gereksinimini tamamen ihlal eden bir anti-pattern.',
        tradeoffs: {
          latency: 'Aşırı Yüksek',
          cost: 'Çoklu Bulut Sunucu Faturaları',
          ops: 'Kritik Düzeyde Karmaşık',
          scalability: 'Kırılgan'
        }
      }
    ]
  },

  // 4. Databricks: Streaming Ingestion & Schema Rescue
  {
    id: 'dbx-de-004',
    exam: 'DATABRICKS_DE_ASSOC',
    examTitle: 'Databricks Certified Data Engineer Associate',
    domain: 'Data Ingestion & Structured Streaming (Auto Loader)',
    difficulty: 'Orta',
    cloudTarget: 'oss',
    pipelineTemplateId: 'streaming_iot',
    primaryServices: ['Databricks Auto Loader', 'Delta Lake', 'Delta Live Tables', 'Apache Spark'],
    scenario: 'Bir lojistik platformu, bulut nesne deposuna sürekli inen milyonlarca JSON dosyasını akış halinde Delta Lake Bronz tablosuna yüklemektedir. Gelen dosyalarda beklenmedik yeni alanlar eklenmekte ve ara sıra veri tipi uyuşmazlığı olan bozuk kayıtlar (corrupted records) gelmektedir. Sistem bozuk kayıtlar yüzünden akışı DURDURMAMALI, yeni kolonları otomatik eklemeli ve bozuk veriyi analiz için izole bir alanda saklamalıdır.',
    prompt: 'Hangi Databricks Structured Streaming çözümü en doğru yaklaşımdır?',
    keyTakeaway: 'Databricks Auto Loader (`cloudFiles`), `schemaEvolutionMode = addNewColumns` ile yeni alanları otomatik ekler ve bozuk veriyi `_rescued_data` kolonunda izole ederek akışın durmasını önler.',
    options: [
      {
        id: 'opt-dbx-04-a',
        letter: 'A',
        text: 'Databricks Auto Loader (`cloudFiles` formatı) kullanmak; `schemaEvolutionMode` değerini `addNewColumns` olarak ayarlamak ve bozuk veya uyuşmayan verileri izole etmek için yerleşik `_rescued_data` sütununu kullanmak.',
        isCorrect: true,
        antiPatternType: 'none',
        affectedNodes: ['ingestion', 'compute', 'storage'],
        explanation: 'Doğru. Auto Loader, milyonlarca dosyayı bulut bildirim servisleri (SQS/SNS) ile verimli okur. `addNewColumns` ile şema evrimini yönetirken, hedef şemayla eşleşmeyen veya bozuk kayıtları `_rescued_data` kolonuna yazarak veri kaybını ve pipeline kesintisini önler.',
        tradeoffs: {
          latency: 'Sürekli Akış (Düşük Gecikme)',
          cost: 'Optimize Edilmiş DBU Tüketimi',
          ops: 'Tam Otomatik Şema ve Hata Yönetimi',
          scalability: 'Milyarlarca Dosyaya Kadar Ölçeklenebilir'
        }
      },
      {
        id: 'opt-dbx-04-b',
        letter: 'B',
        text: 'Klasik `spark.read.format("json").load()` komutuyla her 5 dakikada bir klasörü baştan taramak ve bozuk verileri yakalamak için try-catch blokları içeren Python UDF yazmak.',
        isCorrect: false,
        antiPatternType: 'oom_crash',
        affectedNodes: ['compute'],
        explanation: 'Hatalı. Milyonlarca dosya içeren bir klasörde klasik dizin taraması (directory listing) aşırı yavaştır ve S3/GCS API kotalarını tüketir. Python UDF ise Spark optimizasyonlarını devre dışı bırakıp bellek taşması yaratır.',
        tradeoffs: {
          latency: 'Her Çalıştırmada Uzayan Dizin Taraması',
          cost: 'Aşırı Yüksek API Listeleme Faturaları',
          ops: 'Manuel Hata Yakalama Kodları',
          scalability: 'Dosya Sayısı Arttıkça Çöker'
        }
      },
      {
        id: 'opt-dbx-04-c',
        letter: 'C',
        text: '`COPY INTO` SQL komutunu kullanıp `VALIDATE` parametresini çalıştırmak ve hata aldığında tüm batch yüklemesini iptal etmek.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['ingestion', 'compute'],
        explanation: 'Hatalı. Soru kökünde "akış durmamalı ve bozuk veriler analiz için saklanmalı" denmektedir. Tüm batch\'i iptal etmek pipeline\'ı kilitler ve veri akışını engeller.',
        tradeoffs: {
          latency: 'Kesintili Toplu İşleme',
          cost: 'Tekrarlayan Hata Maliyeti',
          ops: 'Sürekli İnsan Müdahalesi Gerektirir',
          scalability: 'Sınırlı'
        }
      },
      {
        id: 'opt-dbx-04-d',
        letter: 'D',
        text: 'Tüm JSON dosyalarını önce EC2 üzerindeki bir Python script\'i ile parse edip bozuk satırları metin dosyasına yazmak, ardından kalanları Spark\'a aktarmak.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['compute'],
        explanation: 'Hatalı. Dağıtık veri işleme prensiplerine aykırı, tek düğümlü ve ölçeklenemez bir anti-pattern.',
        tradeoffs: {
          latency: 'Çok Yavaş',
          cost: 'Gereksiz Sunucu Maliyeti',
          ops: 'Yüksek',
          scalability: 'Ölçeklenemez'
        }
      }
    ]
  }
];
