import { CertificationQuestion, QuestionOption, ExamCode, CloudProvider } from '../types';

// ==========================================
// 1. ANCHOR HAND-CRAFTED CORE QUESTIONS
// ==========================================
const anchorQuestions: CertificationQuestion[] = [
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
        explanation: 'Doğru. BigLake, Cloud Storage üzerinde duran dosyalara kopyalamadan BigQuery erişim kontrolü, satır düzeyinde filtreleme (RLS) ve dinamik sütun maskeleme yeteneklerini eksiksiz uygular.',
        tradeoffs: {
          latency: '< 1 Saniye (BigQuery Meta-Cache & BI Engine)',
          cost: 'Sıfır Egress & Sadece GCS + Sorgu Maliyeti',
          ops: 'Merkezi IAM & Dataplex Politika Yönetimi',
          scalability: 'Petabayt Düzeyinde Sorunsuz'
        }
      },
      {
        id: 'opt-gcp-02-b',
        letter: 'B',
        text: 'Her ülke için ayrı bir Cloud Storage bucket\'ı açmak. Cloud Functions ile veriyi ülkelere göre kopyalayıp hassas sütunları hash\'leyerek yeni CSV dosyaları üretmek.',
        isCorrect: false,
        antiPatternType: 'cost_explosion',
        affectedNodes: ['storage'],
        explanation: 'Hatalı. Veriyi onlarca ülkeye göre kopyalamak depolama faturasını katlar, veri senkronizasyonunu bozar ve geri döndürülemez hash\'leme analitik ihtiyaçları kısıtlar.',
        tradeoffs: {
          latency: 'Saatler Süren Batch Kopyalama',
          cost: '3x - 5x Fazladan Depolama Maliyeti',
          ops: 'Yüksek Operasyonel Risk ve Güvenlik Açığı',
          scalability: 'Ülke Sayısı Arttıkça Yönetilemez'
        }
      },
      {
        id: 'opt-gcp-02-c',
        letter: 'C',
        text: 'GCS\'deki tüm verileri BigQuery yerel tablolarına yüklemek (ingest). Yetkisiz kullanıcılar için her ülkeye özel SQL VIEW\'lar oluşturup izinleri view bazında vermek.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['storage', 'warehouse'],
        explanation: 'Hatalı. Soru kökündeki "Veri kesinlikle GCS dışına kopyalanmamalıdır (Zero-Copy)" kuralını doğrudan ihlal eder ve 80 TB BigQuery aktif depolama maliyeti doğurur.',
        tradeoffs: {
          latency: 'Hızlı',
          cost: 'Yüksek BigQuery Storage Faturası',
          ops: 'Yüzlerce SQL View Bakım Yükü',
          scalability: 'Orta'
        }
      },
      {
        id: 'opt-gcp-02-d',
        letter: 'D',
        text: 'Veriyi Dataproc Spark kümesinde okuyup maskelemeyi Python kodunda yapmak ve analistlerin sorgularını sadece Spark Thrift Server üzerinden çalıştırmalarını zorunlu kılmak.',
        isCorrect: false,
        antiPatternType: 'manual_devops',
        affectedNodes: ['compute'],
        explanation: 'Hatalı. Sürekli ayakta kalan Dataproc kümesi aşırı maliyetlidir ve BigQuery yerel SQL arayüzünün kolaylığını ortadan kaldırır.',
        tradeoffs: {
          latency: 'Spark Başlatma Gecikmesi',
          cost: 'Sürekli Çalışan VM Maliyeti',
          ops: 'Yüksek Küme ve Güvenlik Yönetimi',
          scalability: 'Küme Boyutuna Bağımlı'
        }
      }
    ]
  },

  // 3. Azure: OneLake Direct Lake & Cross-Cloud Analytics
  {
    id: 'az-dp700-003',
    exam: 'AZURE_DP_700',
    examTitle: 'Microsoft Azure Data Engineer / Fabric DP-700',
    domain: 'Implement and Manage Data Storage & OneLake Architecture',
    difficulty: 'İleri Seviye',
    cloudTarget: 'azure',
    pipelineTemplateId: 'lakehouse_etl',
    primaryServices: ['Azure Data Lake Storage Gen2', 'Microsoft Fabric', 'OneLake Shortcuts', 'Delta Lake', 'Power BI Direct Lake'],
    scenario: 'Büyük ölçekli bir perakende şirketi, AWS S3 ve Google Cloud Storage üzerinde bulunan kurumsal satış verilerini Azure ekosistemine fiziksel olarak taşımadan birleşik bir semantik model oluşturmak istemektedir. Raporlar Power BI üzerinde milyonlarca kullanıcı tarafından milisaniye düzeyinde gecikmeyle (Direct Lake) sorgulanmalı, çift depolama (duplicate storage) ve veri taşıma (egress) maliyeti oluşmamalıdır.',
    prompt: 'Bu gereksinimi en düşük maliyet ve en yüksek performansla sağlayan Microsoft Fabric mimarisi hangisidir?',
    keyTakeaway: 'Microsoft Fabric OneLake Shortcuts, AWS S3 ve GCS üzerindeki Delta Lake / Parquet verilerine sıfır kopya ile anlık bağlanır; Power BI Direct Lake modu ile belleğe doğrudan parquet okur.',
    options: [
      {
        id: 'opt-az-03-a',
        letter: 'A',
        text: 'Microsoft Fabric Lakehouse içinde AWS S3 ve GCS klasörlerini hedefleyen "OneLake Shortcuts" (Kısayollar) oluşturmak. Delta Parquet dosyalarını kopyalamadan OneLake kataloguna bağlamak ve Power BI semantik modelini Direct Lake modunda bu tablolara bağlamak.',
        isCorrect: true,
        antiPatternType: 'none',
        affectedNodes: ['storage', 'warehouse'],
        explanation: 'Doğru. OneLake Shortcuts, harici bulutlardaki (S3, GCS) Delta/Parquet dosyalarını kopyalamadan tek bir mantıksal gölde birleştirir. Power BI Direct Lake modu ise veriyi Import yapmadan doğrudan bellek içi VertiPaq hızında sorgular.',
        tradeoffs: {
          latency: 'Milisaniye (Direct Lake Memory Paging)',
          cost: 'Sıfır Azure Ek Depolama Maliyeti (Zero-Copy)',
          ops: 'Sıfır ETL Pipeline Bakımı',
          scalability: 'Fabric Kapasitesine Bağlı Otomatik Ölçekleme'
        }
      },
      {
        id: 'opt-az-03-b',
        letter: 'B',
        text: 'Azure Data Factory ile her gece AWS S3 ve GCS\'ten ADLS Gen2\'ye tam veri kopyalama (Full Copy) pipeline\'ı kurmak ve Power BI Import modunu kullanmak.',
        isCorrect: false,
        antiPatternType: 'cost_explosion',
        affectedNodes: ['ingestion', 'storage'],
        explanation: 'Hatalı. Soru kökündeki "çift depolama ve egress maliyeti olmamalı" şartını tamamen ihlal eder. Her gece terabaytlarca veri transferi yüksek bulut çıkış (egress) faturalarına yol açar.',
        tradeoffs: {
          latency: '24 Saat Gecikme (Günlük Batch)',
          cost: 'Çift Depolama & Ağ Egress Maliyeti',
          ops: 'Kırılgan ADF Pipeline Yönetimi',
          scalability: 'Veri Hacmi Büyüdükçe Kopyalama Süresi Uzayacaktır'
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

// ==========================================
// 2. PROCEDURAL QUESTION GENERATOR ENGINE (1000 TOTAL)
// ==========================================

interface ScenarioTemplate {
  industry: string;
  topic: string;
  domainName: string;
  templateId: string;
  challenge: string;
  optimalService: string;
  optimalSolution: string;
  optimalExplanation: string;
  antiPattern1: { title: string; type: QuestionOption['antiPatternType']; explanation: string; latency: string; cost: string };
  antiPattern2: { title: string; type: QuestionOption['antiPatternType']; explanation: string; latency: string; cost: string };
  antiPattern3: { title: string; type: QuestionOption['antiPatternType']; explanation: string; latency: string; cost: string };
  takeaway: string;
  primaryServices: string[];
}

const awsTemplates: ScenarioTemplate[] = [
  {
    industry: 'FinTech & Bankacılık',
    topic: 'Kinesis Hot Shards & Partition Key Tasarımı',
    domainName: 'Domain 1: Ingestion & Transformation',
    templateId: 'streaming_iot',
    challenge: 'Milyonlarca kredi kartı işleminin Kinesis Data Streams içine aktarılması sırasında belirli satıcıların işlem yoğunluğu nedeniyle "ProvisionedThroughputExceededException" hatası alınmaktadır.',
    optimalService: 'Kinesis Data Streams + Synthetic Hash Key',
    optimalSolution: 'Partition key olarak tek başına sabit satıcı kodu yerine yüksek kardinaliteye sahip rastgele bir UUID veya işlem zaman damgası eklenmiş sentetik anahtar (vendor_id + uuid) kullanmak.',
    optimalExplanation: 'Kinesis partition key hash değeri 128-bit MD5 ile shard\'lara dağıtılır. Yüksek kardinalite verinin tüm shard\'lara homojen dağılmasını sağlayarak sıcak shard (hot sharding) kilitlenmelerini önler.',
    antiPattern1: {
      title: 'Tüm kayıtlar için sabit "TRANSACTION" partition key değeri atamak',
      type: 'hot_shard',
      explanation: 'Tüm mesajların tek bir shard\'a yönlenmesine ve 1 MB/sn limitine çarparak pipeline\'ın kilitlenmesine neden olur.',
      latency: 'Yüksek Kuyruk Gecikmesi',
      cost: 'Veri Kaybı Riski'
    },
    antiPattern2: {
      title: 'Hata aldıkça her 10 saniyede bir shard sayısını 10 katına çıkaran Lambda yazmak',
      type: 'cost_explosion',
      explanation: 'Sıcak shard sorununu çözmez çünkü verinin anahtarı değişmediği sürece yeni açılan shard\'lar boş kalır ve fatura katlanır.',
      latency: 'Gecikme Devam Eder',
      cost: 'Aşırı Yüksek Kinesis Shard Maliyeti'
    },
    antiPattern3: {
      title: 'Kinesis akışının önüne bir EC2 proxy sunucusu koyup bellekte kuyruklamak',
      type: 'manual_devops',
      explanation: 'Sunucusuz mimarinin dayanıklılık ve ölçeklenebilirlik avantajını ortadan kaldırır; tek hata noktası (SPOF) yaratır.',
      latency: 'Yavaş & Kırılgan',
      cost: 'Gereksiz EC2 Bakımı'
    },
    takeaway: 'Kinesis Streams\'de hot-shard hatalarının çözümü shard artırmak değil, partition key kardinalitesini maksimize etmektir.',
    primaryServices: ['Amazon Kinesis Data Streams', 'AWS Lambda', 'Amazon CloudWatch']
  },
  {
    industry: 'Sağlık & Biyomedikal',
    topic: 'S3 Lake Formation Fine-Grained Access Control',
    domainName: 'Domain 4: Data Security & Governance',
    templateId: 'lakehouse_etl',
    challenge: 'Amazon S3 üzerindeki hasta tahlil sonuçlarını içeren Parquet veri gölünde, araştırmacıların sadece anonimleştirilmiş sütunları görmesi ve teşhis kodlarını içeren hassas hücrelerin gizlenmesi gerekmektedir.',
    optimalService: 'AWS Lake Formation Cell-Level Security',
    optimalSolution: 'AWS Lake Formation kullanarak veri filtresi (data filter) tanımlamak; araştırmacı IAM rolüne yalnızca izin verilen sütunları ve satır filtrelerini kapsayan hücre düzeyinde (cell-level) yetki vermek.',
    optimalExplanation: 'Lake Formation, S3 üzerindeki veriyi çoğaltmadan Athena ve Redshift sorgularında sütun ve hücre bazında dinamik yetkilendirme sağlar.',
    antiPattern1: {
      title: 'Her araştırmacı grubu için verinin filtrelenmiş kopyalarını ayrı S3 bucket\'larına kopyalamak',
      type: 'cost_explosion',
      explanation: 'Veri çoğaltma (duplication) depolama maliyetini artırır ve KVKK/HIPAA regülasyonlarında veri senkronizasyon riskleri doğurur.',
      latency: 'Gecikmeli Güncelleme',
      cost: 'Katlanan S3 Depolama Maliyeti'
    },
    antiPattern2: {
      title: 'Yetkilendirmeyi araştırmacıların istemci tarafındaki Python/Pandas kodunda yapmak',
      type: 'manual_devops',
      explanation: 'Kritik güvenlik açığıdır; araştırmacılar ham S3 verisine doğrudan erişerek filtrelemeyi atlayabilir.',
      latency: 'Sıfır Güvenlik',
      cost: 'Yasal Ceza Riski'
    },
    antiPattern3: {
      title: 'Tüm S3 verisini tek bir EC2 üzerindeki MySQL veritabanına import etmek',
      type: 'oom_crash',
      explanation: 'Terabaytlarca analitik veriyi ilişkisel tekil veritabanına taşımak bellek taşmasına ve sorgu kilitlenmelerine neden olur.',
      latency: 'Aşırı Yavaş',
      cost: 'Yüksek Donanım Faturası'
    },
    takeaway: 'AWS veri göllerinde sütun ve satır bazlı erişim kontrolü S3 bucket politikalarıyla değil, Lake Formation ile yönetilir.',
    primaryServices: ['AWS Lake Formation', 'Amazon S3', 'Amazon Athena', 'AWS IAM']
  },
  {
    industry: 'E-Ticaret & Lojistik',
    topic: 'Redshift Serverless vs Auto-WLM Concurrency Scaling',
    domainName: 'Domain 2: Data Store Management',
    templateId: 'datamart_agg',
    challenge: 'Ay sonu finansal mutabakat saatlerinde eşzamanlı 500 analistin karmaşık analitik SQL sorguları çalıştırması Amazon Redshift kümesinde kuyruk beklemelerine (queuing) yol açmaktadır.',
    optimalService: 'Amazon Redshift Concurrency Scaling & Workload Management',
    optimalSolution: 'Redshift Workload Management (WLM) üzerinde Concurrency Scaling özelliğini etkinleştirmek ve kısa süren analitik sorgular için Short Query Acceleration (SQA) açmak.',
    optimalExplanation: 'Concurrency Scaling, ana küme kuyrukları dolduğunda otomatik olarak geçici işlem kapasitesi ekleyerek sınırsız sayıda eşzamanlı sorguyu sıfır bekleme süresiyle çalıştırır.',
    antiPattern1: {
      title: 'Kümeyi sürekli olarak en büyük dc2.8xlarge düğüm boyutunda 10 katı sunucuyla çalıştırmak',
      type: 'cost_explosion',
      explanation: 'Ayın 29 günü atıl kalacak sunucular için on binlerce dolar gereksiz fatura ödenmesine sebep olur.',
      latency: 'Hızlı ama İsraf',
      cost: 'Aşırı Sabit Maliyet'
    },
    antiPattern2: {
      title: 'Analistlerin sorgularını S3\'e boşaltıp tek bir t3.micro makinede SQLite ile sorgulatmak',
      type: 'oom_crash',
      explanation: 'Küçük sunucunun belleği ilk sorguda tükenir ve analitik süreç tamamen çöker.',
      latency: 'Çökme',
      cost: 'Operasyonel Felaket'
    },
    antiPattern3: {
      title: 'Tüm analistlerin sorgularını sıraya sokup tekil çalıştırmak (Queue timeout: 6 saat)',
      type: 'manual_devops',
      explanation: 'İş biriminin karar alma süreçlerini felce uğratır ve SLA şartlarını ihlal eder.',
      latency: 'Saatler Süren Bekleme',
      cost: 'Düşük ama Kullanılamaz'
    },
    takeaway: 'Redshift üzerinde ani eşzamanlılık patlamaları için daimi düğüm büyütmek yerine Concurrency Scaling kullanılır.',
    primaryServices: ['Amazon Redshift', 'Redshift Serverless', 'Amazon CloudWatch']
  },
  {
    industry: 'Telekomünikasyon',
    topic: 'Glue ETL vs Glue Python Shell Maliyet Optimizasyonu',
    domainName: 'Domain 1: Ingestion & Transformation',
    templateId: 'lakehouse_etl',
    challenge: 'Günde 200 kez çalışan ve her seferinde sadece birkaç megabaytlık lookup meta-verisini güncelleyen hafif Python işleri için AWS Glue Spark DPU maliyetleri bütçeyi aşmaktadır.',
    optimalService: 'AWS Glue Python Shell Jobs (0.0625 DPU)',
    optimalSolution: 'Küçük boyutlu veri dönüşümleri için tam Spark kümesi başlatan Glue ETL yerine 0.0625 DPU kullanan "Glue Python Shell" iş tipine geçiş yapmak.',
    optimalExplanation: 'Glue Python Shell, Spark kümesi ayağa kaldırma süresini (cold start ~2 dk) beklemez ve saniyeler içinde 16 kat daha düşük DPU maliyetiyle çalışır.',
    antiPattern1: {
      title: '1 MB veri için 10 DPU\'luk Glue Spark işi çalıştırmaya devam etmek',
      type: 'cost_explosion',
      explanation: 'Her minik dosya için tam Spark kümesi başlatmak faturaları anlamsız şekilde şişirir.',
      latency: 'Gereksiz Başlatma Beklemesi',
      cost: '16x Fazla Harcama'
    },
    antiPattern2: {
      title: 'Dönüşümleri veritabanı içinde triger (trigger) yazarak veritabanı işlemcisine yüklemek',
      type: 'hot_shard',
      explanation: 'Operasyonel OLTP veritabanının CPU\'sunu tüketerek canlı işlemleri yavaşlatır.',
      latency: 'OLTP Çökme Riski',
      cost: 'Yüksek Lisans Maliyeti'
    },
    antiPattern3: {
      title: 'Python script\'ini geliştiricinin dizüstü bilgisayarında cron ile çalıştırmak',
      type: 'manual_devops',
      explanation: 'Kurumsal veri mühendisliği standartlarına aykırı, izlenemez ve güvenilmez bir yöntemdir.',
      latency: 'Belirsiz',
      cost: 'Sıfır Güvenlik'
    },
    takeaway: 'Megabayt seviyesindeki hafif ETL işleri için Glue Spark değil, Glue Python Shell veya AWS Lambda tercih edilmelidir.',
    primaryServices: ['AWS Glue Python Shell', 'AWS Glue Data Catalog', 'Amazon S3']
  }
];

const gcpTemplates: ScenarioTemplate[] = [
  {
    industry: 'AdTech & Reklamcılık',
    topic: 'BigQuery Partitioning & Clustering ile Slot Tasarrufu',
    domainName: 'Section 4: Data Analytics & BigQuery',
    templateId: 'datamart_agg',
    challenge: 'Günde 5 milyar tıklama olayının toplandığı BigQuery tablosunda sorguların tüm tabloyu taraması (full scan) nedeniyle sorgu başına yüzlerce dolar maliyet oluşmaktadır. Sorgular genellikle belirli bir tarih aralığı ve "campaign_id" filtresi kullanmaktadır.',
    optimalService: 'BigQuery Partitioning (Day) + Clustering (campaign_id)',
    optimalSolution: 'Tabloyu "event_timestamp" gününe göre PARTITION BY yapmak ve sık filtrelenen "campaign_id" ve "country" sütunlarına göre CLUSTER BY tanımlamak.',
    optimalExplanation: 'Bölümleme (partitioning) taranan gün sayısını izole eder; kümeleme (clustering) ise o gün içindeki ilgili blokları hedefleyerek taranan veri miktarını ve slot harcamasını %90+ azaltır.',
    antiPattern1: {
      title: 'Her kampanya için dinamik yeni bir BigQuery tablosu oluşturmak (tbl_campaign_1, tbl_campaign_2)',
      type: 'manual_devops',
      explanation: 'Tablo şema sınırlarına takılır, sorgularda yüzlerce tabloyu UNION yapmak sistemi kilitler.',
      latency: 'Karmaşık Sorgular',
      cost: 'Yönetilemez Şema'
    },
    antiPattern2: {
      title: 'Tabloyu hiçbir kısıtlama olmadan tutup her sorguda "LIMIT 100" eklemek',
      type: 'cost_explosion',
      explanation: 'BigQuery sütun tabanlı mimarisinde LIMIT ifadesi taranan bayt miktarını azaltmaz, tüm sütun yine de taranır ve faturalandırılır.',
      latency: 'Gereksiz Tarama',
      cost: 'Maksimum Fatura'
    },
    antiPattern3: {
      title: 'Veriyi BigQuery yerine Google Sheets içine aktarıp orada filtrelemek',
      type: 'oom_crash',
      explanation: 'Milyarlarca satır veriyi elektronik tabloya aktarmak imkansızdır ve tarayıcıyı anında çökertir.',
      latency: 'Çökme',
      cost: 'İmkansız Mimari'
    },
    takeaway: 'BigQuery\'de taranan bayt miktarını düşürmenin iki altın anahtarı: Tarihe göre Partitioning ve filtre kolonlarına göre Clustering\'dir.',
    primaryServices: ['Google BigQuery', 'Cloud Storage', 'Looker Studio']
  },
  {
    industry: 'IoT & Akıllı Ulaşım',
    topic: 'Cloud Dataflow Sliding Windows & Late Data Watermarks',
    domainName: 'Section 2: Stream Ingestion & Processing',
    templateId: 'streaming_iot',
    challenge: 'Tünellerden geçen bağlı araçlardan gelen GPS verileri şebeke kesintisi nedeniyle 15 dakikaya kadar gecikmeli (late data) ulaşmaktadır. Sistem son 5 dakikalık ortalama hızları hesaplamalı ve geç gelen verileri de sonuca dahil etmelidir.',
    optimalService: 'Apache Beam / Cloud Dataflow Watermark & Allowed Lateness',
    optimalSolution: 'Cloud Dataflow üzerinde 5 dakikalık kayan pencere (sliding window) tanımlamak; "withAllowedLateness(Duration.standardMinutes(15))" ve birikimli tetikleyiciler (accumulating triggers) kullanmak.',
    optimalExplanation: 'Apache Beam su seviyesi (watermark) mekanizması olay zamanını (event time) takip eder ve izin verilen gecikme penceresi içindeki geç veriler geldiğinde pencere sonucunu güncelleyerek doğru hesaplama yapar.',
    antiPattern1: {
      title: 'Geç gelen tüm verileri anında çöpe atmak (Drop late data)',
      type: 'manual_devops',
      explanation: 'Veri kaybına ve eksik trafik analiz raporlarına neden olur.',
      latency: 'Eksik Veri',
      cost: 'Kalitesiz Raporlama'
    },
    antiPattern2: {
      title: 'Tüm araç verilerini işlenmeden önce 1 saat boyunca bir kuyrukta bekletmek',
      type: 'manual_devops',
      explanation: 'Gerçek zamanlı trafik uyarı sisteminin amacını ortadan kaldırır; 1 saatlik gecikme kaza uyarılarını engeller.',
      latency: '1 Saat Gecikme (SLA İhlali)',
      cost: 'Gereksiz Kuyruk Maliyeti'
    },
    antiPattern3: {
      title: 'Dataflow yerine her saniye Cloud Function tetikleyip Cloud SQL üzerinde UPDATE çalıştırmak',
      type: 'hot_shard',
      explanation: 'Saniyede on binlerce UPDATE ilişkisel veritabanı satır kilitlerine (row locking) ve veritabanı kilitlenmesine yol açar.',
      latency: 'Kilitlenme',
      cost: 'Yüksek Cloud SQL Faturası'
    },
    takeaway: 'Streaming verilerde ağ gecikmelerini yönetmek için processing time değil, event time tabanlı Allowed Lateness kullanılır.',
    primaryServices: ['Google Cloud Dataflow', 'Cloud Pub/Sub', 'BigQuery']
  },
  {
    industry: 'Oyun & Eğlence',
    topic: 'Cloud Bigtable Row Key Hotspotting Önleme',
    domainName: 'Section 3: Storage & NoSQL Systems',
    templateId: 'streaming_iot',
    challenge: 'Milyonlarca oyuncunun anlık skorlarının kaydedildiği Cloud Bigtable kümesinde tek bir tablet sunucusunun aşırı yüklenmesi (hotspotting) nedeniyle gecikmeler 800 ms üzerine çıkmaktadır. Mevcut row key formatı: "TIMESTAMP#USER_ID".',
    optimalService: 'Cloud Bigtable Row Key Salt / Hash Prefix',
    optimalSolution: 'Row key yapısını sıralı zaman damgası yerine tersine çevrilmiş zaman damgası veya kullanıcı ID karması ile ön-eklemek (örnek: "HASH(USER_ID)#TIMESTAMP").',
    optimalExplanation: 'Bigtable satır anahtarlarını leksikografik (alfabetik) sıralar. Zaman damgasıyla başlayan anahtarlar tüm yeni yazmaları hep en sondaki tek bir tablet sunucusuna yönlendirir. Hash ön-eki yazmaları tüm düğümlere eşit dağıtır.',
    antiPattern1: {
      title: 'Row key formatını değiştirmeden Bigtable düğüm sayısını 3 katına çıkarmak',
      type: 'cost_explosion',
      explanation: 'Yeni düğümler açılsın açılmasın, sıralı anahtarlar yine sadece tek bir düğüme gideceğinden darboğaz çözülmez; maliyet katlanır.',
      latency: 'Yüksek Gecikme Devam Eder',
      cost: '3x Fazla Bigtable Maliyeti'
    },
    antiPattern2: {
      title: 'Tüm skorları tek bir satırda JSON dizisi olarak güncellemek',
      type: 'oom_crash',
      explanation: 'Satır boyutu Bigtable limitini aşar ve tekil satır kilitlenmesi yaşanır.',
      latency: 'Zaman Aşımı',
      cost: 'Kullanılamaz'
    },
    antiPattern3: {
      title: 'Bigtable yerine CSV dosyası olarak Cloud Storage\'a yazmak',
      type: 'small_files',
      explanation: 'Milisaniyelik oyuncu skor güncellemeleri nesne deposu üzerinde yönetilemez.',
      latency: 'Saniyeler Süren Gecikme',
      cost: 'S3/GCS PUT Maliyet Patlaması'
    },
    takeaway: 'Bigtable\'da asla sıralı artan zaman damgası tek başına row key ön-eki yapılmaz; hash veya salt kullanılmalıdır.',
    primaryServices: ['Cloud Bigtable', 'Cloud Monitoring', 'Compute Engine']
  }
];

const azureTemplates: ScenarioTemplate[] = [
  {
    industry: 'Kurumsal Üretim',
    topic: 'Azure Synapse Dedicated SQL Hash Distribution',
    domainName: 'Design and develop data processing',
    templateId: 'datamart_agg',
    challenge: 'Azure Synapse Analytics Dedicated SQL havuzunda 2 milyar satırlık "FactSales" tablosu ile 50 milyon satırlık "DimCustomer" tablosunun JOIN sorgusu "Data Movement Service (DMS) Shuffle" nedeniyle çok yavaş çalışmaktadır.',
    optimalService: 'Synapse Hash Distribution + Replicated Dimension',
    optimalSolution: '"FactSales" tablosunu ortak katılan "CustomerId" sütununa göre HASH dağıtmak, küçük boyutlu "DimCustomer" tablosunu ise tüm 60 işlem birimine REPLICATED olarak dağıtmak.',
    optimalExplanation: 'Replicated boyut tabloları her compute düğümünde yerel olarak bulunur. Büyük olgu tablosu da aynı anahtara göre hash dağıtıldığında sorgu sırasında ağ üzerinden veri taşıma (shuffle) sıfıra iner.',
    antiPattern1: {
      title: 'Her iki büyük tabloyu da ROUND_ROBIN olarak tanımlamak',
      type: 'oom_crash',
      explanation: 'Round Robin dağıtım her JOIN işleminde verinin tüm düğümler arasında ağ üzerinden karıştırılmasını (DMS Shuffle) zorunlu kılar ve performansı düşürür.',
      latency: 'Ağır Veri Hareketi',
      cost: 'Yüksek DWU Harcaması'
    },
    antiPattern2: {
      title: 'Tüm tabloları tek bir Azure SQL Database Basic katmanına taşımak',
      type: 'cost_explosion',
      explanation: 'Milyarlarca satırlık analitik yük ilişkisel tek veritabanının DTU limitlerini anında tüketir.',
      latency: 'Sistem Kilitlenmesi',
      cost: 'Düşük Performans'
    },
    antiPattern3: {
      title: 'JOIN sorgularını tamamen kaldırıp analistlere ham veriyi Excel ile dağıtmak',
      type: 'manual_devops',
      explanation: 'İş zekası süreçlerini tamamen işlevsiz kılan kabul edilemez bir anti-pattern.',
      latency: 'İmkansız',
      cost: 'Zaman Kaybı'
    },
    takeaway: 'Synapse DW üzerinde büyük Fact tabloları Hash, küçük Dimension tabloları Replicated dağıtılmalıdır.',
    primaryServices: ['Azure Synapse Analytics', 'Azure Data Lake Storage Gen2', 'Power BI']
  },
  {
    industry: 'Sigortacılık & Risk',
    topic: 'ADF Tumbling Window Triggers ile Idempotent Backfill',
    domainName: 'Manage Data Pipelines & Orchestration',
    templateId: 'lakehouse_etl',
    challenge: 'Azure Data Factory (ADF) üzerinde geçmiş 6 aya dönük veri tamamlama (backfill) çalıştırıldığında başarısız olan saatlik dilimler tüm süreci durdurmakta ve tekrar çalıştırıldığında hedef tabloda mükerrer (duplicate) kayıtlar oluşmaktadır.',
    optimalService: 'ADF Tumbling Window Trigger + Idempotent Upsert',
    optimalSolution: 'Zaman serisi boru hatları için "Tumbling Window Trigger" kullanmak, maksimum eşzamanlılık tanımlamak ve hedef tabloda MERGE / UPSERT kullanarak işlemi tekilleştirilebilir (idempotent) kılmak.',
    optimalExplanation: 'Tumbling Window tetikleyicileri geçmişe dönük pencereleri bağımsız ele alır; başarısız dilimler kendi içinde yeniden denenebilir (retry). Idempotent MERGE ise tekrar çalıştırmalarda çift yazmayı engeller.',
    antiPattern1: {
      title: 'Klasik Schedule Trigger kullanıp başarısız olunca elle 180 kez manuel tetikleme yapmak',
      type: 'manual_devops',
      explanation: 'İnsan hatasına açık, saatler süren ve izlenmesi imkansız bir operasyonel kabustur.',
      latency: 'Günler Süren Müdahale',
      cost: 'Yüksek İnsan Emeği'
    },
    antiPattern2: {
      title: 'Her çalıştırmada hedef tablodaki tüm veriyi DROP TABLE yapıp sıfırdan doldurmak',
      type: 'cost_explosion',
      explanation: 'Geriye dönük 6 ayı her saat için baştan silip yazmak terabaytlarca gereksiz işlem ve canlı raporlarda veri kesintisi yaratır.',
      latency: 'Canlı Raporlar Boş Görünür',
      cost: 'Aşırı I/O Tüketimi'
    },
    antiPattern3: {
      title: 'Hata veren saatleri yok sayıp pipeline\'a "ignore_errors=true" eklemek',
      type: 'manual_devops',
      explanation: 'Finansal denetimlerde tespit edilecek sessiz veri kaybına (silent data loss) neden olur.',
      latency: 'Bozuk Veri',
      cost: 'Denetim Cezaları'
    },
    takeaway: 'Tarih dilimli backfill işlerinde Schedule Trigger değil, Tumbling Window Trigger kullanılır.',
    primaryServices: ['Azure Data Factory', 'Azure Data Lake Storage Gen2', 'Azure Databricks']
  }
];

const databricksTemplates: ScenarioTemplate[] = [
  {
    industry: 'Perakende & Tedarik Zinciri',
    topic: 'Delta Lake Liquid Clustering vs Z-ORDER Optimizasyonu',
    domainName: 'Delta Lake Architecture & Performance Tuning',
    templateId: 'lakehouse_etl',
    challenge: 'Günde 20 TB yeni veri eklenen bir Delta Lake tablosunda, tarih bazlı partition yapılmasına rağmen analistler sık sık mağaza ID ve ürün kategorisine göre sorgu atmaktadır. Z-ORDER işlemi saatler sürmekte ve write amplification yaratmaktadır.',
    optimalService: 'Delta Lake Liquid Clustering (CLUSTER BY)',
    optimalSolution: 'Sabit fiziksel bölümleme ve periyodik Z-ORDER yerine, tablonun DDL tanımında "CLUSTER BY (order_date, store_id, product_category)" kullanarak Liquid Clustering etkinleştirmek.',
    optimalExplanation: 'Databricks Liquid Clustering, veriyi dinamik olarak kümeleyerek geleneksel partitioning ve Z-ORDER\'ın getirdiği dosya katılıklarını ve yeniden yazma maliyetlerini ortadan kaldırır.',
    antiPattern1: {
      title: 'Tabloyu 10 farklı sütuna göre aynı anda PARTITIONED BY yapmak',
      type: 'small_files',
      explanation: 'Aşırı bölümleme (over-partitioning) gölde milyonlarca kilobaytlık dosya oluşturarak gölün metadata motorunu kilitler.',
      latency: 'Sorgular Açılamaz',
      cost: 'Depolama Metadata Patlaması'
    },
    antiPattern2: {
      title: 'Her 5 dakikada bir tüm tabloya "OPTIMIZE ... ZORDER BY" komutunu zorlamak',
      type: 'cost_explosion',
      explanation: 'Her 5 dakikada tüm 20 TB veriyi baştan okuyup yazmak devasa işlemci (DBU) faturaları üretir.',
      latency: 'Sürekli Küme Meşguliyeti',
      cost: 'On Binlerce Dolar DBU İsrafı'
    },
    antiPattern3: {
      title: 'Delta Lake formatını bırakıp düz gzip sıkıştırmalı CSV dosyalarına dönmek',
      type: 'manual_devops',
      explanation: 'ACID işlemlerini, time travel özelliğini ve indekslemeyi yok eder; sorguları 50 kat yavaşlatır.',
      latency: 'Aşırı Yavaş',
      cost: 'Kabul Edilemez'
    },
    takeaway: 'Modern Delta tablolarında çok kolonlu yüksek kardinalite optimizasyonu için Z-ORDER yerine Liquid Clustering kullanılır.',
    primaryServices: ['Databricks Delta Lake', 'Apache Spark', 'Unity Catalog']
  },
  {
    industry: 'Medya & Dijital Yayıncılık',
    topic: 'Delta Live Tables (DLT) Expectations ile Veri Kalitesi',
    domainName: 'Incremental Data Processing with Auto Loader & DLT',
    templateId: 'lakehouse_etl',
    challenge: 'Streaming pipeline üzerinden gelen video izleme loglarında kullanıcı ID alanı boş (NULL) olan veya süresi negatif çıkan bozuk kayıtlar Gold analitik tablolarına sızmakta ve reklam faturalandırma raporlarını bozmaktadır.',
    optimalService: 'Delta Live Tables Expectations (@dlt.expect)',
    optimalSolution: 'Delta Live Tables pipeline\'ında bildirimsel kalite kuralı tanımlamak: "@dlt.expect_or_drop(\'valid_user\', \'user_id IS NOT NULL AND duration > 0\')" kuralı ile bozuk kayıtları Gold aşamasından önce otomatik ayıklamak.',
    optimalExplanation: 'DLT Expectations, veri kalitesi kurallarını deklaratif olarak uygular; ihlal durumunda satırı atma (drop), uyarı kaydetme (warn) veya hattı durdurma (fail) aksiyonlarını yerleşik izleme metrikleriyle yönetir.',
    antiPattern1: {
      title: 'Veri kalitesi kontrollerini haftada bir kez SQL sorgusuyla manuel kontrol edip elle silmek',
      type: 'manual_devops',
      explanation: 'Bozuk veriler bir hafta boyunca analistlerin raporlarında kalır ve yanlış iş kararlarına yol açar.',
      latency: 'Günler Süren Kalite Açığı',
      cost: 'Güvenilmez Veri'
    },
    antiPattern2: {
      title: 'Tek bir bozuk satır geldiğinde tüm kurumsal kümenin sunucusunu kapatmak',
      type: 'manual_devops',
      explanation: 'Sistemin çalışma süresini (uptime) yerle bir eder; tek bir önemsiz hata için tüm veri akışı kesilir.',
      latency: 'Sürekli Pipeline Kesintisi',
      cost: 'Operasyonel Kriz'
    },
    antiPattern3: {
      title: 'Bozuk verileri düzeltmek için yapay zeka ile otomatik rastgele kullanıcı ID uydurmak',
      type: 'manual_devops',
      explanation: 'Finansal raporlara sahte veri enjekte eder ve denetimlerde cezai sorumluluk yaratır.',
      latency: 'Veri Bütünlüğü Bozulur',
      cost: 'Yasal Risk'
    },
    takeaway: 'Delta Live Tables içinde veri hijyeni `expect_or_drop` veya `expect_or_fail` bildirimleriyle otomatik yönetilir.',
    primaryServices: ['Databricks Delta Live Tables', 'Unity Catalog', 'Apache Spark']
  }
];

// Helper to assemble full question bank
function generateComprehensiveQuestionBank(): CertificationQuestion[] {
  const allQuestions: CertificationQuestion[] = [...anchorQuestions];

  // Target: exactly 250 questions for each of the 4 exams (1000 total)
  const examConfigs: {
    examCode: ExamCode;
    examTitle: string;
    cloudTarget: CloudProvider;
    templates: ScenarioTemplate[];
  }[] = [
    {
      examCode: 'AWS_DEA_C01',
      examTitle: 'AWS Certified Data Engineer - Associate',
      cloudTarget: 'aws',
      templates: awsTemplates,
    },
    {
      examCode: 'GCP_PDE',
      examTitle: 'Google Cloud Professional Data Engineer',
      cloudTarget: 'gcp',
      templates: gcpTemplates,
    },
    {
      examCode: 'AZURE_DP_700',
      examTitle: 'Microsoft Azure Data Engineer / Fabric DP-700',
      cloudTarget: 'azure',
      templates: azureTemplates,
    },
    {
      examCode: 'DATABRICKS_DE_ASSOC',
      examTitle: 'Databricks Certified Data Engineer Associate',
      cloudTarget: 'oss',
      templates: databricksTemplates,
    },
  ];

  examConfigs.forEach((cfg) => {
    // Current anchor count for this exam
    const existingCount = allQuestions.filter((q) => q.exam === cfg.examCode).length;
    const neededCount = 250 - existingCount;

    for (let i = 0; i < neededCount; i++) {
      const template = cfg.templates[i % cfg.templates.length];
      const qNum = existingCount + i + 1;
      const formattedNum = String(qNum).padStart(3, '0');
      const questionId = `${cfg.cloudTarget}-de-${formattedNum}`;

      const difficulties: ('Temel' | 'Orta' | 'İleri Seviye')[] = ['Temel', 'Orta', 'İleri Seviye'];
      const difficulty = difficulties[i % difficulties.length];

      // Soru seçeneklerinin harflerini ve doğruluğunu belirleme
      // Karışık sırada A, B, C, D dağılımı
      const correctIndex = i % 4; // 0=A, 1=B, 2=C, 3=D

      const rawOptions = [
        {
          text: template.optimalSolution,
          isCorrect: true,
          antiPatternType: 'none' as const,
          explanation: template.optimalExplanation,
          tradeoffs: {
            latency: '< 1 Saniye / Optimize',
            cost: 'En Optimize TCO (Maliyet Avantajı)',
            ops: 'Tam Yönetilen / Sıfır Yük',
            scalability: 'Elastik Otomatik Ölçekleme',
          },
        },
        {
          text: template.antiPattern1.title,
          isCorrect: false,
          antiPatternType: template.antiPattern1.type,
          explanation: template.antiPattern1.explanation,
          tradeoffs: {
            latency: template.antiPattern1.latency,
            cost: template.antiPattern1.cost,
            ops: 'Yüksek Operasyonel Risk',
            scalability: 'Sınırlı & Kırılgan',
          },
        },
        {
          text: template.antiPattern2.title,
          isCorrect: false,
          antiPatternType: template.antiPattern2.type,
          explanation: template.antiPattern2.explanation,
          tradeoffs: {
            latency: template.antiPattern2.latency,
            cost: template.antiPattern2.cost,
            ops: 'Ağır Bakım Gerektirir',
            scalability: 'Veri Büyüdükçe Kilitlenir',
          },
        },
        {
          text: template.antiPattern3.title,
          isCorrect: false,
          antiPatternType: template.antiPattern3.type,
          explanation: template.antiPattern3.explanation,
          tradeoffs: {
            latency: template.antiPattern3.latency,
            cost: template.antiPattern3.cost,
            ops: 'Manuel Müdahale Zorunlu',
            scalability: 'Ölçeklenemez',
          },
        },
      ];

      // Correct option'ı doğru pozisyona yerleştir
      const shuffledOptions = [...rawOptions];
      if (correctIndex !== 0) {
        const temp = shuffledOptions[0];
        shuffledOptions[0] = shuffledOptions[correctIndex];
        shuffledOptions[correctIndex] = temp;
      }

      const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      const finalOptions: QuestionOption[] = shuffledOptions.map((opt, idx) => ({
        id: `opt-${questionId}-${letters[idx].toLowerCase()}`,
        letter: letters[idx],
        text: opt.text,
        isCorrect: opt.isCorrect,
        antiPatternType: opt.antiPatternType,
        explanation: opt.explanation,
        tradeoffs: opt.tradeoffs,
        affectedNodes: ['ingestion', 'compute', 'storage', 'warehouse'],
      }));

      allQuestions.push({
        id: questionId,
        exam: cfg.examCode,
        examTitle: cfg.examTitle,
        domain: `${template.domainName} · Senaryo #${qNum}`,
        difficulty,
        cloudTarget: cfg.cloudTarget,
        pipelineTemplateId: template.templateId,
        primaryServices: template.primaryServices,
        scenario: `[${template.industry}] Senaryo #${qNum}: ${template.challenge}`,
        prompt: `Bu mimari problemi en yüksek verimlilik, SLA garantisi ve en düşük bulut maliyeti ile çözmek için hangi yaklaşım uygulanmalıdır?`,
        keyTakeaway: template.takeaway,
        options: finalOptions,
      });
    }
  });

  return allQuestions;
}

export const certificationQuestions: CertificationQuestion[] = generateComprehensiveQuestionBank();
