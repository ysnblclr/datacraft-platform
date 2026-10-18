import { GcpPdeServiceGuide, GcpDecisionScenario, GcpPdePublicationReview } from '../types';

// =========================================================================
// 2024 / 2025 / 2026 EXAM TRENDS & ARCHITECTURAL EVOLUTION
// =========================================================================
export const gcpPdeExamTrends = {
  examTitle: 'Google Cloud Professional Data Engineer (PDE) - 2024/2025/2026 Edition',
  examLength: '2 Saat (120 Dakika)',
  questionCount: '~50-55 Çoktan Seçmeli ve Çoklu Yanıtlı Senaryo Sorusu',
  passingScore: 'Puan açıklanmaz (Pass / Fail mantığı, tahmini ~%70 doğru)',
  majorShifts: [
    {
      title: 'Klasik ML Soruları Büyük Ölçüde Çıkarıldı / Azaltıldı',
      description: 'Eski sınavlardaki derin TensorFlow, model hiperparametre optimizasyonu (L1/L2 regularization, learning rate), CNN/RNN mimarileri ve overfitting soruları ayrı olan Google ML Engineer sınavına kaydırıldı. Yeni PDE sınavında ML sadece "Ne zaman BigQuery ML, ne zaman Vertex AI hazır API, ne zaman özel model?" düzeyinde üst seviye mimari seçim olarak soruluyor.'
    },
    {
      title: 'Modern Data Governance & Data Mesh (Dataplex) Zirvede',
      description: 'Veriyi fiziksel olarak taşımadan merkezi yönetişim (Lakes, Zones, Assets), otomatik veri kalitesi denetimi (Dataplex Auto Data Quality YAML) ve merkezi politika etiketleri (Policy Tags) soruların %15-20\'sini oluşturuyor.'
    },
    {
      title: 'BigQuery Modernleşmesi (BigLake & Storage Write API & Editions)',
      description: 'Klasik flat-rate sorgu modeli yerine BigQuery Editions (Standard, Enterprise, Enterprise Plus) ve Baseline vs Autoscaling Slots soruları; ayrıca S3/ADLS üzerindeki Parquet dosyalarını kopyalamadan sorgulayan BigLake ve alt-saniye atomik veri yükleyen Storage Write API sınavın odak noktasında.'
    },
    {
      title: 'Dataform ve Datastream Yükselişi',
      description: 'Eski Dataprep ve Data Fusion sorularının yerini modern veri ambarı içi ELT dönüşümü yapan Dataform ve operasyonel veritabanlarından sıfır kesintiyle CDC (Change Data Capture) yapan Datastream senaryoları aldı.'
    },
    {
      title: 'Cloud Storage Yenilikleri: Autoclass ve Turbo Replication',
      description: 'Dual-Region mimarilerinde 15 dakikalık RPO garantisi sunan Turbo Replication ve erişim sıklığına göre nesneleri otomatik soğuk katmana aktaran Autoclass sınavın en popüler maliyet ve felaket kurtarma soruları haline geldi.'
    }
  ],
  domains: [
    { name: 'Domain 1: Veri İşleme Sistemleri Tasarımı', weight: '22%', topics: ['Storage & Compute ayrımı', 'BigQuery Partitioning & Clustering', 'Bigtable Row Key tasarımı', 'Spanner TrueTime & Transactions'] },
    { name: 'Domain 2: Veri Hatları Oluşturma ve Operasyon', weight: '25%', topics: ['Dataflow (Apache Beam, Windowing, Watermarks, DLQ)', 'Pub/Sub & Pub/Sub Lite', 'Dataproc Ephemeral Clusters', 'Datastream CDC'] },
    { name: 'Domain 3: Veri Çözümlerinin Güvenliği ve Uyumluluğu', weight: '21%', topics: ['Dataplex & Data Catalog', 'Sensitive Data Protection (DLP)', 'CMEK & Cloud KMS', 'Satır/Sütun Yetkilendirme (Policy Tags)'] },
    { name: 'Domain 4: Veri Sistemlerinin Ölçeklenmesi ve Optimizasyonu', weight: '32%', topics: ['BigQuery Slot Tahsisi & Reservations', 'Bigtable Key Visualizer & Hotspotting', 'Maliyet Optimizasyonu (FinOps)', 'Storage Transfer vs Transfer Appliance'] }
  ]
};

// =========================================================================
// 19 COMPREHENSIVE SERVICE DEEP DIVES (DERIVED FROM JANAOM & SATHISHVJ)
// =========================================================================
export const gcpPdeServiceGuides: GcpPdeServiceGuide[] = [
  // 1. Cloud Storage
  {
    id: 'gcs-deepdive',
    name: 'Google Cloud Storage (GCS)',
    category: 'storage_formats',
    categoryLabel: 'Depolama & Formatlar',
    officialDocLink: 'https://cloud.google.com/storage/docs',
    summary: 'Sınırsız kapasiteli nesne depolama; veri göllerinin ham (Bronze) iniş alanı, analitik yedekleme ve felaket kurtarma için kullanılan temel omurga.',
    deepDiveSections: [
      {
        title: 'Konum Türleri & Replikasyon',
        points: [
          'Region: Tek bir coğrafi konum (örn. europe-west3 - Frankfurt). En düşük depolama ve ağ gecikmesi.',
          'Dual-Region: İki belirli bölge çifti (örn. Frankfurt ve Hollanda). Otomatik coğrafi yük devretme sağlar.',
          'Multi-Region: Geniş bir kıta alanı (örn. EU veya US). 100 milden fazla mesafeyle ayrılmış en az 2 veri merkezinde yedeklilik.',
          'Strong Consistency: GCS tüm okuma, yazma ve metaveri işlemlerinde anında güçlü tutarlılık (strong consistency) garanti eder.'
        ]
      },
      {
        title: 'Turbo Replication (Dual-Region)',
        points: [
          'Dual-Region bucket\'larda 15 dakikalık RPO (Recovery Point Objective) garantisi sunar.',
          'Yeni yazılan tüm nesnelerin %100\'ü boyutuna bakılmaksızın 15 dakika içinde ikincil bölgeye replike edilir.',
          'Varsayılan (default) replikasyon da genellikle dakikalar sürer ancak SLA taahhüdü vermez.'
        ],
        gotchasOrLimitations: [
          'Turbo Replication sadece Dual-Region bucket\'larda açılabilir.',
          'XML API üzerinden yönetilemez.'
        ]
      },
      {
        title: 'Autoclass Akıllı Katmanlama',
        points: [
          'Nesneleri erişim sıklığına göre otomatik olarak Standard, Nearline, Coldline ve Archive sınıfları arasında taşır.',
          'Erişilen nesne anında Standard depolamaya yükseltilir.',
          '30 gün erişilmeyen nesneler Nearline, 90 gün erişilmeyenler Coldline sınıfına iner.',
          'Yalnızca 128 KiB ve üzeri nesneler için çalışır.'
        ],
        gotchasOrLimitations: [
          'Eğer bucket içeriği düzenli olarak DLP (Sensitive Data Protection) tarafından taranıyorsa Autoclass KULLANILMAMALIDIR (tarama tüm nesneleri Standard\'a çeker ve maliyeti fırlatır!).'
        ]
      }
    ],
    examTraps: [
      'GCS Archive sınıfı AWS Glacier gibi saatler süren bekleme istemez; milisaniyeler içinde anında ilk baytı okutur!',
      'Erken silme cezaları (Early Deletion Fee): Nearline 30 gün, Coldline 90 gün, Archive 365 gün dolmadan silinirse tam süre faturası kesilir.'
    ],
    goldenHeuristic: 'Felaket anında RPO = 15 dakika dendiğinde Dual-Region + Turbo Replication; erişim sıklığı bilinmeyen değişken yüklerde Autoclass seçilir.',
    year20242025Updates: [
      'Autoclass artık terminal storage class olarak Nearline veya Archive seçimine izin veriyor.',
      'BigLake bağlantıları ile Cloud Storage nesneleri BigQuery tarafından doğrudan satır/sütun güvenliğiyle okunabiliyor.'
    ]
  },

  // 2. File Formats (Avro, Parquet, CSV, JSON)
  {
    id: 'formats-deepdive',
    name: 'Dosya Formatları (Avro, Parquet, CSV, JSON)',
    category: 'storage_formats',
    categoryLabel: 'Depolama & Formatlar',
    officialDocLink: 'https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-avro',
    summary: 'Büyük veri boru hatlarında I/O verimliliğini, sıkıştırma oranını ve sorgu performansını doğrudan belirleyen dosya formatı mimarisi.',
    deepDiveSections: [
      {
        title: 'Neden Avro BigQuery Yüklemelerinde 1 Numaradır?',
        points: [
          'Şema dosyanın başlığında (self-describing) saklanır; tip dönüşümü veya şema tahmin işlemi gerektirmez.',
          'Sıkıştırılmış olsa bile bloklar paralel olarak okunabilir (splittable compressed blocks).',
          'BigQuery\'nin dahili Capacitor sütunlu formatına sıfır dönüştürme maliyetiyle doğrudan eşlenir.'
        ]
      },
      {
        title: 'CSV ve JSON Format Tuzakları',
        points: [
          'CSV iç içe (nested) veya tekrarlayan (repeated - ARRAY/STRUCT) veriyi desteklemez.',
          'gzip ile sıkıştırılmış CSV/JSON dosyaları PARALEL OKUNAMAZ! Tek bir CPU çekirdeğine takılır ve devasa dosyalarda yükleme saatler sürer.',
          'BOM (Byte Order Mark) karakterleri varsa CSV yüklemeleri sessizce bozulabilir veya hata verir.',
          'Tarih kolonlarında tire (-) kullanılmalı (YYYY-MM-DD); Timestamp için tire veya eğik çizgi kullanılmalıdır.'
        ],
        gotchasOrLimitations: [
          'Aynı yükleme işi içinde hem sıkıştırılmış hem sıkıştırılmamış CSV dosyaları birleştirilemez.'
        ]
      }
    ],
    examTraps: [
      'Soru "BigQuery\'ye en hızlı ve minimum kaynakla veri yükleme formatı hangisidir?" diyorsa cevap PARQUET DEĞİL, AVRO\'dur! (Parquet sütunludur, Avro satır bazlı serileştirme ile yüklemede daha hızlıdır).',
      'gzip ile sıkıştırılmış 100 GB CSV dosyasını hızlandırmak için CPU artırmak işe yaramaz; dosya ya uncompressed yüklenmeli ya da Avro/Snappy formatına çevrilmelidir.'
    ],
    goldenHeuristic: 'BigQuery\'ye ham veri yükleme = Avro. Veri gölü üzerinde yerinde (in-place) analitik sorgulama = Parquet.',
    year20242025Updates: [
      'BigLake Object Tables ile PDF, MP3 ve görsel gibi yapılandırılmamış dosyalar SQL ile sorgulanabilir hale geldi.'
    ]
  },

  // 3. Analytics Hub
  {
    id: 'analytics-hub-deepdive',
    name: 'Analytics Hub (BigQuery Data Exchange)',
    category: 'warehouse_analytics',
    categoryLabel: 'Veri Ambarı & Analitik',
    officialDocLink: 'https://cloud.google.com/bigquery/docs/analytics-hub-introduction',
    summary: 'Şirketler veya departmanlar arasında veriyi kopyalamadan veya taşımadan gerçek zamanlı ve güvenli paylaşım sağlayan veri değişim platformu.',
    deepDiveSections: [
      {
        title: 'Yayımcı (Publisher) ve Abone (Subscriber) Mimarisi',
        points: [
          'Publisher: Veriyi kopyalamadan bir "Listing" (İlan) oluşturur. Veri tek bir yerde durur.',
          'Subscriber: İlanı görüntüleyip kendi projesinde "Linked Dataset" (Bağlantılı Veri Kümesi) oluşturur.',
          'Veri kopyalanmadığı için publisher veriyi güncellediği anda subscriber anında güncel veriyi görür (Zero-copy architecture).'
        ]
      },
      {
        title: 'Kritik Limitler ve İzin Modeli',
        points: [
          'Paylaşılan bir dataset en fazla 1.000 bağlantılı (linked) dataset\'e abone edilebilir.',
          'Paylaşılan bir Pub/Sub konusu maksimum 10.000 aboneliğe bağlanabilir.',
          'Bağlantılı dataset içindeki tekil tablolara IAM rolü VERİLEMEZ; izinler dataset düzeyinde tanımlanır.'
        ]
      }
    ],
    examTraps: [
      'Üçüncü taraf ortaklarla büyük veri kümelerini paylaşırken veriyi Cloud Storage\'a export edip SFTP ile aktarmak sınavın en büyük anti-pattern\'ıdır; doğru çözüm Analytics Hub Listing oluşturmaktır.'
    ],
    goldenHeuristic: 'Veriyi taşımadan / kopyalamadan harici şirket veya departmanlarla gerçek zamanlı veri paylaşımı = Analytics Hub.',
    year20242025Updates: [
      'Analytics Hub artık Pub/Sub konularını da gerçek zamanlı veri akışı ilanı olarak paylaşabiliyor.'
    ]
  },

  // 4. Cloud Bigtable
  {
    id: 'bigtable-deepdive',
    name: 'Google Cloud Bigtable',
    category: 'databases',
    categoryLabel: 'Veritabanları & NoSQL',
    officialDocLink: 'https://cloud.google.com/bigtable/docs',
    summary: 'Milisaniyenin altında gecikmeyle milyarlarca satır ve petabaytlarca zaman serisi, IoT ve finansal telemetri verisini işleyen NoSQL geniş sütunlu (wide-column) veritabanı.',
    deepDiveSections: [
      {
        title: 'Depolama ve Tablo Modeli',
        points: [
          'Veriler Row Key\'e göre alfabetik/sözlükbilimsel (lexicographically) sıralı tek bir indeks üzerinden saklanır.',
          'Her satır birden çok Column Family (sütun ailesi) ve her aile altında Column Qualifier barındırır.',
          'Tek bir değer boyutu maksimum 10 MB ile sınırlıdır (ideali < 1 MB).',
          'Garbage Collection (Çöp Toplama) politikaları ile eski sürümler (Max Versions) veya gün aşımı (Max Age) otomatik temizlenir.'
        ]
      },
      {
        title: 'Yavaşlık Nedenleri & Troubleshooting',
        points: [
          'Row Key başında ardışık zaman damgası (Timestamp) veya monoton artan sayaç kullanılması -> HOTSPOTTING!',
          'Tek bir okuma sorgusunda ardışık olmayan (non-contiguous) rastgele satırların taranması.',
          'Üretim ortamında SSD yerine HDD disk tercih edilmesi (HDD sadece 10 TB+ soğuk arşiv ve toplu batch taramalarda önerilir).',
          'Kümenin henüz yeni açılmış veya yeni küçültülmüş olması (Bigtable düğümleri yükü dengelemek için birkaç saat adaptasyon süresine ihtiyaç duyar).'
        ]
      },
      {
        title: 'Key Visualizer',
        points: [
          'Erişim desenlerini ısı haritası (heat map) şeklinde görselleştirir.',
          'Yatay parlak çizgiler tek bir satır anahtarında aşırı yoğunlaşmayı (Hotspotting) gösterir.',
          'Dikey parlak çizgiler ise belirli bir anda gelen trafik patlamasını (traffic spike) işaret eder.'
        ]
      }
    ],
    examTraps: [
      'Bigtable şemasında ikincil indeks (Secondary Index) YOKTUR! Tüm sorgular tekil Row Key veya Row Key aralığı (Range Scan) ile yapılmalıdır.',
      'Timestamp başa yazılmaz; anahtarın önüne `CustomerID` veya hash öneki (`hash(user_id) + timestamp`) eklenerek satırlar tüm düğümlere saçılır.'
    ],
    goldenHeuristic: 'Sub-10ms gecikme + Terabayt/Petabayt boyut + Zaman serisi / IoT / Finansal borsa telemetrisi = Cloud Bigtable.',
    year20242025Updates: [
      'Bigtable artık GoogleSQL desteği ile SELECT sorgularına izin veriyor (ancak arkadaki Row Key prensibi değişmedi).'
    ]
  },

  // 5. Cloud Spanner
  {
    id: 'spanner-deepdive',
    name: 'Google Cloud Spanner',
    category: 'databases',
    categoryLabel: 'Veritabanları & NoSQL',
    officialDocLink: 'https://cloud.google.com/spanner/docs',
    summary: 'Küresel ölçekte (multi-region) tam ACID garantisi, harici tutarlılık (External Consistency) ve %99.999 SLA sunan dağıtık ilişkisel SQL veritabanı.',
    deepDiveSections: [
      {
        title: 'TrueTime API & İşlem Türleri',
        points: [
          'GPS alıcıları ve atomik saatlerle senkronize TrueTime API kullanılarak küresel işlem zaman damgası atanır.',
          'Locking Read-Write: Kilit mekanizması ve iki aşamalı tamamlama (2PC) ile çalışır. Çakışma durumunda işlem abort edilir ve yeniden denenir (retry).',
          'Read-Only: Hiçbir kilit almaz, yazma işlemlerini bekletmez. Belirli bir geçmiş zaman damgasında (Snapshot Read / Stale Read) mükemmel tutarlılıkla sorgu çalıştırır.'
        ]
      },
      {
        title: 'Şema Tasarımı & Split Hotspotting',
        points: [
          'Spanner tabloları boyut ve yük arttıkça "Split" adı verilen parçalara ayrılır.',
          'Ardışık artan Primary Key (AUTO_INCREMENT, Timestamp) kullanılırsa tüm yazmalar en sondaki tek bir Split\'e yığılır.',
          'Çözüm: UUID v4 kullanmak veya anahtarın önüne shard id / hash eklemektir (Natural Hash Prefix).',
          'Interleaved Tables: Ebeveyn-çocuk ilişkisi olan tabloları (örn. Customers -> Orders) fiziksel olarak aynı Split üzerinde yan yana saklayarak JOIN maliyetini sıfıra indirir.'
        ]
      }
    ],
    examTraps: [
      'Spanner tek seferlik bir işlemde maksimum 40.000 mutasyon (satır x sütun sayısı) sınırına sahiptir. Milyonlarca satırlık toplu yazmalar küçük batch\'lere bölünmelidir.',
      'Sadece bir bölgede çalışan standart ilişkisel CRUD için Spanner seçmek devasa bir maliyet israfıdır (Cloud SQL kullanılmalıdır).'
    ],
    goldenHeuristic: 'Küresel (Global / Multi-region) + İlişkisel SQL + Katı ACID / %99.999 SLA = Cloud Spanner.',
    year20242025Updates: [
      'PostgreSQL arayüz uyumluluğu ve Spanner Graph (ilişkisel tablolar üzerinde Property Graph sorguları) eklendi.'
    ]
  },

  // 6. BigQuery & BigLake
  {
    id: 'bigquery-deepdive',
    name: 'Google BigQuery & BigLake',
    category: 'warehouse_analytics',
    categoryLabel: 'Veri Ambarı & Analitik',
    officialDocLink: 'https://cloud.google.com/bigquery/docs',
    summary: 'Sunucusuz, petabayt ölçeğinde SQL analitiği sunan sütunlu veri ambarı ve hibrit bulut veri gölü sorgulama motoru.',
    deepDiveSections: [
      {
        title: 'Storage Write API',
        points: [
          'Eski `tabledata.insertAll` akış API\'sinin yerini alan modern veri alma protokolü.',
          'Kesinlikle bir kez (Exactly-Once) teslimat garantisi sunar.',
          'Stream-level ve cross-stream işlem (transactions) desteği vardır.',
          'Protokol gRPC tabanlıdır ve maliyeti eski streaming API\'ye göre %50 daha düşüktür.'
        ]
      },
      {
        title: 'Materialized Views vs Standart Views',
        points: [
          'Standart View: Sanal tablodur, her sorgulandığında alttaki sorguyu baştan çalıştırır (hesaplama maliyeti yaratır).',
          'Materialized View: Sorgu sonucunu periyodik önbelleğe alır. Ana tabloya sadece eklenen (delta) verileri okuyarak akıllı güncelleme yapar.',
          'BigQuery Optimizer sorguyu otomatik olarak Materialized View\'a yönlendirir (Smart Tuning).'
        ],
        gotchasOrLimitations: [
          'BigLake tabloları üzerindeki Materialized View\'larda bölümleme (partitioning) desteklenmez.',
          'BigQuery yönetilen tabloları ile BigLake tabloları tek bir Materialized View içinde JOIN EDİLEMEZ!'
        ]
      },
      {
        title: 'Bölümleme (Partitioning) & Kümeleme (Clustering)',
        points: [
          'Partitioning: Tabloyu tarih, timestamp veya tamsayı aralığına göre fiziksel bloklara böler. Taranan veri hacmini (ve dolayısıyla sorgu faturasını) doğrudan düşürür.',
          'Clustering: Veriyi belirtilen sütunların (en fazla 4 sütun) değer sırasına göre bloklar içinde sıralar. Filtreleme ve JOIN operasyonlarını hızlandırır.',
          'Her zaman önce Partitioning, ardından en çok WHERE/GROUP BY yapılan sütunlarda Clustering uygulanır.'
        ]
      },
      {
        title: 'Slots & Reservations (Editions)',
        points: [
          'Slot: BigQuery\'de SQL sorgularını paralel yürüten sanal CPU/bellek hesaplama birimidir.',
          'On-Demand: Taranan veri miktarı (TB başına $6.25) üzerinden ücretlendirilir.',
          'Editions (Standard, Enterprise, Enterprise Plus): Tahmin edilebilir FinOps bütçesi için Baseline Slots + gerektiğinde otomatik ölçeklenen Autoscaling Slots tahsis edilir.'
        ]
      }
    ],
    examTraps: [
      'Sorgunun sonuna `LIMIT 10` eklemek BigQuery\'de taranan veri miktarını ve maliyeti ASLA AZALTMAZ! Sütunlu mimari tüm kolonu okur. Maliyeti düşürmenin tek yolu Partitioning ve Clustering ile doğru bölümleri budamaktır (Partition Pruning).',
      '`SELECT *` kullanmak sınavın en ağır maliyet günahıdır; daima sadece ihtiyaç duyulan sütunlar seçilmelidir.'
    ],
    goldenHeuristic: 'Sorgu maliyetini düşürmek = Partition + Cluster. Sıfır veri kaybıyla gerçek zamanlı BigQuery akışı = Storage Write API.',
    year20242025Updates: [
      'BigQuery Studio entegre Python notebook desteği sundu.',
      'BigLake Iceberg ve Delta Lake açık tablo formatlarını yerel olarak desteklemeye başladı.'
    ]
  },

  // 7. Cloud Dataflow
  {
    id: 'dataflow-deepdive',
    name: 'Google Cloud Dataflow (Apache Beam)',
    category: 'streaming_processing',
    categoryLabel: 'Akış & Hesaplama',
    officialDocLink: 'https://cloud.google.com/dataflow/docs',
    summary: 'Hem batch hem de streaming veri hatlarını Apache Beam programlama modeliyle sunucusuz, otomatik ölçeklenen ve kesinlikle bir kez işleyen birleşik motor.',
    deepDiveSections: [
      {
        title: 'Apache Beam Temel Kavramları',
        points: [
          'Pipeline: Veri akışının uçtan uca yönlü döngüsüz grafiği (DAG).',
          'PCollection: Boru hattı içindeki bölünmüş, paralel işlenebilir veri kümesi (sınırlı batch veya sınırsız stream).',
          'PTransform: Veri üzerinde yapılan dönüşüm işlemi (Map, Filter, GroupByKey).',
          'DoFn: `ParDo` transformasyonu içinde her bir elemana uygulanan özel kullanıcı kodu.'
        ]
      },
      {
        title: 'Veri Kümelerini Birleştirme (JOIN Stratejileri)',
        points: [
          'Side Inputs: Devasa bir PCollection akışını, hafızaya sığabilen küçük bir referans/arama tablosuyla (örn. ülke kodları tablosu) zenginleştirirken kullanılır.',
          'CoGroupByKey: Her iki veri kümesi de terabaytlarca büyükse ortak bir anahtar üzerinden dağıtık JOIN yapmak için tercih edilir.'
        ]
      },
      {
        title: 'Hata Yönetimi: Dead Letter Queue (DLQ)',
        points: [
          'Bozuk, şemaya uymayan veya JSON parse hatası veren "zehirli mesajlar" (poison pills) try/catch bloğuna alınır.',
          'Hatalı kayıtlar ana boru hattını kilitlemeden ikincil bir PCollection üzerinden Dead-Letter Queue (Cloud Storage veya Pub/Sub) hedefine yönlendirilir.'
        ]
      },
      {
        title: 'Pencereleme (Windowing) & Watermarks',
        points: [
          'Fixed (Tumbling): Kesişmeyen sabit zaman blokları (örn. 5 dakikalık pencereler).',
          'Sliding (Hopping): Birbirinin üzerine binen pencereler (örn. her 1 dakikada bir son 10 dakikanın verisi).',
          'Session: Kullanıcı aktivitesi devam ettiği sürece açık kalan pencereler.',
          'Watermark: Olay zamanı (Event Time) bazında o ana kadarki tüm verilerin geldiğini varsayan zaman sınırı.',
          'Late Data: Watermark geçtikten sonra gelen gecikmiş veriler `allowedLateness` ile kabul edilebilir veya DLQ\'ya atılır.'
        ]
      }
    ],
    examTraps: [
      'Dataflow worker düğümleri internete açık IP alamazsa veya güvenlik gereği private IP ile çalıştırılıyorsa, Cloud NAT veya Private Google Access aktif edilmelidir; aksi takdirde boru hattı başlayamaz.',
      'Tek bir bozuk mesaj yüzünden akışı exception ile patlatıp yeniden başlatmak döngüye sokar (CrashLoop); çözüm daima DLQ\'dur.'
    ],
    goldenHeuristic: 'Akışta küçük referans verisiyle birleştirme = Side Input. Büyük iki veri kümesini birleştirme = CoGroupByKey. Bozuk kayıtları ayıklama = Dead Letter Queue.',
    year20242025Updates: [
      'Dataflow Prime: Bellek ve CPU kaynaklarını otomatik dikey ölçekleyen ve OOM (Out-of-Memory) hatalarını engelleyen yeni nesil altyapı.'
    ]
  },

  // 8. Dataplex
  {
    id: 'dataplex-deepdive',
    name: 'Google Dataplex (Data Fabric & Mesh)',
    category: 'governance_security',
    categoryLabel: 'Yönetişim & Güvenlik',
    officialDocLink: 'https://cloud.google.com/dataplex/docs/introduction',
    summary: 'Çoklu Google Cloud projelerine yayılmış Cloud Storage ve BigQuery varlıklarını veriyi taşımadan tek bir mantıksal Lake ve Zone altında merkezileştiren Data Fabric platformu.',
    deepDiveSections: [
      {
        title: 'Hiyerarşik Mimari',
        points: [
          'Lake: İş alanına özgü en üst mantıksal kapsayıcı (örn. Satış Veri Gölü, Finans Veri Gölü).',
          'Zone: Veri gölü içindeki olgunluk seviyesi: Raw Zone (ham veri) veya Curated Zone (temizlenmiş, analitiğe hazır veri).',
          'Asset: Zone altındaki fiziksel depolama kaynağı (GCS bucket veya BigQuery dataset).'
        ]
      },
      {
        title: 'Otomatik Veri Kalitesi (Auto Data Quality)',
        points: [
          'Kod yazmadan bildirimsel YAML kuralları ile çalışır.',
          'Örnek: `row_count > 0`, `column_not_null`, `value_in_set`, `regex_match`.',
          'BigQuery veya Cloud Storage üzerinde otomatik çalışarak kalite skorları ve uyarılar üretir.'
        ]
      }
    ],
    examTraps: [
      'Dataplex bir veri dönüştürme (ETL compute) motoru DEĞİLDİR; sadece mantıksal yönetişim, kataloglama ve veri kalitesi sağlar (dönüşüm BigQuery veya Dataflow ile yapılır).'
    ],
    goldenHeuristic: 'Veriyi fiziksel olarak taşımadan çoklu projelerdeki gölleri mantıksal olarak yönetmek (Data Mesh) ve otomatik YAML veri kalitesi = Google Dataplex.',
    year20242025Updates: [
      'Google Data Catalog tamamen Dataplex içine entegre edildi; policy tag ve metadata aramaları artık Dataplex çatısı altından yönetiliyor.'
    ]
  },

  // 9. Data Catalog
  {
    id: 'data-catalog-deepdive',
    name: 'Google Data Catalog & Policy Tags',
    category: 'governance_security',
    categoryLabel: 'Yönetişim & Güvenlik',
    officialDocLink: 'https://cloud.google.com/data-catalog/docs/concepts/overview',
    summary: 'Büyük veri varlıklarını hızlıca aramak, etiketlemek ve sütun düzeyinde erişim denetimi (Column-level security) sağlamak için kullanılan metaveri yönetim servisi.',
    deepDiveSections: [
      {
        title: 'Sütun Düzeyinde Güvenlik (Policy Tags)',
        points: [
          'Taksonomi (Taxonomy) oluşturulur (örn. Data_Classification).',
          'Altında Policy Tag\'ler tanımlanır (örn. PII, Finansal, Gizli).',
          'Politika etiketleri BigQuery tablosundaki belirli sütunlara (örn. `credit_card_number`) atanır.',
          'Yalnızca `Fine-Grained Reader` rolüne sahip kullanıcılar o sütunu düz metin okuyabilir; diğerleri erişemez veya maskelenmiş görür.'
        ]
      },
      {
        title: 'Dinamik Veri Maskeleme (Dynamic Data Masking)',
        points: [
          'Veriyi fiziksel olarak değiştirmeden sorgu anında maskeleme yapar (Nullify, Hash, Partial Mask).',
          'Analist verinin var olduğunu ve dağılımını analiz edebilir ancak kredi kartının ilk 12 hanesini göremez.'
        ]
      }
    ],
    examTraps: [
      'Kullanıcıya BigQuery Data Viewer verilmiş olsa bile, tabloda Policy Tag varsa ve kullanıcıda Fine-Grained Reader rolü yoksa sorgu `Access Denied` hatasıyla başarısız olur!'
    ],
    goldenHeuristic: 'Belirli sütunları (TC Kimlik, Kredi Kartı) sadece yetkili personele açmak = Data Catalog Policy Tags + Fine-Grained Reader.',
    year20242025Updates: [
      'Dataplex Universal Catalog altında birleştirildi.'
    ]
  },

  // 10. Cloud Pub/Sub
  {
    id: 'pubsub-deepdive',
    name: 'Google Cloud Pub/Sub & Subscriptions',
    category: 'streaming_processing',
    categoryLabel: 'Akış & Hesaplama',
    officialDocLink: 'https://cloud.google.com/pubsub/docs/overview',
    summary: 'Saniyede milyonlarca olayı küresel ölçekte tamponlayan, tamamen sunucusuz ve ölçeklenebilir mesaj kuyruğu servisi.',
    deepDiveSections: [
      {
        title: 'Abonelik Türleri',
        points: [
          'Pull Subscription: Tüketici kendi hızında mesajları çeker (`pull`). Büyük ve değişken işlem süreleri olan worker\'lar için idealdir.',
          'Push Subscription: Pub/Sub mesajları doğrudan bir HTTP/HTTPS webhook uç noktasına veya Cloud Run/Cloud Function servisine POST eder.',
          'BigQuery Subscription: Araya Dataflow koymadan Pub/Sub konusundaki JSON veya Avro mesajlarını doğrudan BigQuery tablosuna sunucusuz yazar (Maliyeti ve karmaşıklığı %70 azaltır!).',
          'Cloud Storage Subscription: Mesajları doğrudan GCS dosyaları halinde depolar.'
        ]
      },
      {
        title: 'Sıralama ve Hata Yönetimi',
        points: [
          'Ordering Key: Belirli bir anahtara sahip mesajların gönderildiği sırayla teslim edilmesini garanti eder.',
          'Dead Letter Topic: Belirli sayıda (`max_delivery_attempts`) denemeden sonra işlenemeyen mesajlar otomatik ölü mektup konusuna aktarılır.',
          'Exactly-Once Delivery: Yeniden iletimleri engelleyen etkin teslimat filtresi.'
        ]
      }
    ],
    examTraps: [
      'Eski sorularda Pub/Sub -> Dataflow -> BigQuery zinciri standart yanıttı. 2024-2025 sınavlarında basit dönüşümsüz yüklemeler için Dataflow kullanmak gereksiz karmaşıklık sayılır; doğru yanıt doğrudan `BigQuery Subscription` kullanmaktır!'
    ],
    goldenHeuristic: 'Akış mesajlarını kod yazmadan doğrudan BigQuery\'ye aktarma = Pub/Sub BigQuery Subscription. Sıralı teslimat = Ordering Key.',
    year20242025Updates: [
      'BigQuery ve Cloud Storage export abonelikleri tam GA oldu.'
    ]
  },

  // 11. Dataform
  {
    id: 'dataform-deepdive',
    name: 'Google Dataform',
    category: 'warehouse_analytics',
    categoryLabel: 'Veri Ambarı & Analitik',
    officialDocLink: 'https://cloud.google.com/dataform/docs/overview',
    summary: 'BigQuery içinde SQL dönüşümlerini (ELT) versiyon kontrollü, modüler, test edilebilir ve otomatik bağımlılık grafikleriyle (DAG) yöneten modern veri aracı.',
    deepDiveSections: [
      {
        title: 'Dataform Mimarisi & SQLX',
        points: [
          'SQLX: Standart SQL sorgularına `config {}` blokları ve JavaScript fonksiyonları ekleyerek dinamik tablolar ve görünümler oluşturur.',
          '`ref()` Fonksiyonu: Tablolar arasındaki bağımlılığı otomatik çözer; çalışma sırasını manuel ayarlamaya gerek bırakmaz.',
          'Assertions: Veri kalitesi testleri tanımlar (örn. `nonNull: ["id"]`, `uniqueKey: ["email"]`). Test başarısız olursa boru hattı durdurulabilir.'
        ]
      }
    ],
    examTraps: [
      'Dataform veri ambarının dışından veri çekme (Extract) aracı DEĞİLDİR; ambar içine yüklenmiş veriyi BigQuery SQL ile dönüştürme (Transform) aracıdır.'
    ],
    goldenHeuristic: 'BigQuery içinde SQL tabanlı ELT dönüşümü, sürüm kontrolü (Git) ve otomatik bağımlılık grafiği = Dataform.',
    year20242025Updates: [
      'BigQuery Studio konsoluna doğrudan entegre edildi.'
    ]
  },

  // 12. Datastream
  {
    id: 'datastream-deepdive',
    name: 'Google Datastream (CDC Replication)',
    category: 'streaming_processing',
    categoryLabel: 'Akış & Hesaplama',
    officialDocLink: 'https://cloud.google.com/datastream/docs/overview',
    summary: 'İlişkisel veritabanlarından (Oracle, MySQL, PostgreSQL, SQL Server) BigQuery veya Cloud Storage\'a gerçek zamanlı ve sunucusuz Değişiklik Verisi Yakalama (CDC) servisi.',
    deepDiveSections: [
      {
        title: 'CDC Mimarisi',
        points: [
          'Veritabanı işlem günlüklerini (transaction log - Oracle Redo Log, MySQL Binlog, Postgres WAL) okur.',
          'Kaynak veritabanına ek yük bindirmez, kilit (lock) almaz.',
          'BigQuery doğrudan hedefi seçildiğinde satır güncellemelerini (UPSERT/DELETE) otomatik olarak BigQuery tablosuna yansıtır.'
        ]
      }
    ],
    examTraps: [
      'Canlı üretim veritabanından saatlik batch sorgularla (`SELECT * WHERE updated_at > ...`) veri çekmek performansı bozar; doğru çözüm daima Datastream CDC\'dir.'
    ],
    goldenHeuristic: 'Operasyonel veritabanlarından sıfır kesinti ve minimum gecikmeyle BigQuery\'ye sürekli veri kopyalama = Datastream CDC.',
    year20242025Updates: [
      'PostgreSQL ve SQL Server doğrudan BigQuery sürekli replikasyon yetenekleri güçlendirildi.'
    ]
  },

  // 13. Data Fusion
  {
    id: 'data-fusion-deepdive',
    name: 'Google Cloud Data Fusion',
    category: 'warehouse_analytics',
    categoryLabel: 'Veri Ambarı & Analitik',
    officialDocLink: 'https://cloud.google.com/data-fusion/docs/concepts/overview',
    summary: 'Açık kaynak CDAP üzerine kurulu, kod yazmadan görsel arayüzle sürükle-bırak ETL boru hatları oluşturan kurumsal entegrasyon servisi.',
    deepDiveSections: [
      {
        title: 'Çalışma Mantığı',
        points: [
          'Görsel olarak tasarlanan boru hatları arka planda otomatik olarak Apache Spark koduna dönüştürülür ve geçici (ephemeral) bir Dataproc kümesinde çalıştırılır.',
          'Wrangler eklentisi ile interaktif veri temizleme ve dönüşüm kuralları uygulanır.'
        ]
      }
    ],
    examTraps: [
      'Data Fusion bir hesaplama motoru değildir; arayüz ve orkestrasyondur, ağır işi Dataproc kümesine yıkar.'
    ],
    goldenHeuristic: 'Kodlama bilmeyen iş analistleri için görsel sürükle-bırak kurumsal ETL = Cloud Data Fusion.',
    year20242025Updates: [
      'Yerini yeni projelerde ağırlıklı olarak Dataform ve Dataplex kombinasyonuna bırakmaktadır.'
    ]
  },

  // 14. Cloud Dataproc
  {
    id: 'dataproc-deepdive',
    name: 'Google Cloud Dataproc',
    category: 'streaming_processing',
    categoryLabel: 'Akış & Hesaplama',
    officialDocLink: 'https://cloud.google.com/dataproc/docs/concepts/overview',
    summary: 'Apache Spark, Hadoop, Hive ve Presto kümelerini 90 saniyede açıp kapatabilen, açık kaynak büyük veri hesaplama servisi.',
    deepDiveSections: [
      {
        title: 'Graceful Decommissioning & Ephemeral Kümeler',
        points: [
          'Graceful Decommissioning: Küme küçültülürken (downscale) üzerinde çalışan Spark görevlerinin ve ara verilerin (shuffle data) bitmesini bekler; işin çökmesini engeller.',
          'Ephemeral Clusters: Veri kalıcı HDFS\'te değil Cloud Storage\'da (`gs://`) saklanır; küme iş başlamadan açılır, iş bitince yok edilir.',
          'Preemptible/Spot VM: İkincil worker düğümlerinde %80 indirim sağlar. HDFS verisi taşımadığı için kapansa bile iş aksamaz.'
        ]
      },
      {
        title: 'Dataproc Workflow Templates',
        points: [
          'Küme oluşturma, işleri sıralı yürütme ve küme silme adımlarını tek bir bildirimsel YAML/CLI şablonuyla otomatikleştirir.'
        ]
      }
    ],
    examTraps: [
      'GCP sınavında Dataproc üzerinde kalıcı HDFS tutmak en bilinen anti-pattern\'dır; veri Cloud Storage\'a taşınmalı, küme geçici olmalıdır.'
    ],
    goldenHeuristic: 'Mevcut Spark/Hadoop kodunu değiştirmeden en ucuz maliyetle taşımak = Dataproc Ephemeral Cluster + Spot VM + GCS.',
    year20242025Updates: [
      'Dataproc Serverless Spark ile küme yönetimi tamamen arka plana itilebiliyor.'
    ]
  },

  // 15. Memorystore for Redis
  {
    id: 'memorystore-deepdive',
    name: 'Google Cloud Memorystore (Redis & Memcached)',
    category: 'databases',
    categoryLabel: 'Veritabanları & NoSQL',
    officialDocLink: 'https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview',
    summary: 'Uygulamaların ve veri analitik panolarının yanıt sürelerini mikrosaniye seviyesine indiren tam yönetilen bellek içi (in-memory) önbellek servisi.',
    deepDiveSections: [
      {
        title: 'Manual Failover & Veri Koruma',
        points: [
          'Standard Tier: Otomatik yük devretme (failover) sağlayan birincil ve replika düğümlü yüksek erişilebilirlik mimarisi.',
          'Manual Failover: Felaket kurtarma testleri için birincilden replikaya kontrollü geçiş tetikleme.',
          'RDB Snapshots ve AOF (Append Only File) ile bellek içi verinin diske yedeklenmesi.'
        ]
      }
    ],
    examTraps: [
      'Analitik büyük veri sorguları için Memorystore seçilmez; sık tekrarlanan API yanıtları ve oturum önbellekleme için kullanılır.'
    ],
    goldenHeuristic: 'Mikrosaniye (sub-millisecond) gecikmeli anahtar-değer önbelleği = Memorystore for Redis.',
    year20242025Updates: [
      'Cluster mod ile yüzlerce GB bellek içi veri yatay sharding ile ölçeklenebiliyor.'
    ]
  },

  // 16. Cloud Dataprep
  {
    id: 'dataprep-deepdive',
    name: 'Google Cloud Dataprep (by Trifacta)',
    category: 'warehouse_analytics',
    categoryLabel: 'Veri Ambarı & Analitik',
    officialDocLink: 'https://docs.trifacta.com/Dataprep/en/product-overview.html',
    summary: 'İş analistleri için akıllı görsel veri keşfi, temizleme ve anomali analizi platformu; arka planda otomatik Dataflow işleri üretir.',
    deepDiveSections: [
      {
        title: 'Özellikler',
        points: [
          'Eksik değerleri, format uyumsuzluklarını ve uç değerleri (outliers) sütun histogramları üzerinden otomatik renklendirir.',
          'Kullanıcının yaptığı görsel adımları bir tarif (Recipe) olarak kaydeder.'
        ]
      }
    ],
    examTraps: [
      'Büyük kurumsal üretim boru hatlarında Dataprep doğrudan compute yapmaz, Dataflow işi oluşturur.'
    ],
    goldenHeuristic: 'Görsel veri temizleme, anomali tespiti ve hızlı profil çıkarma = Cloud Dataprep.',
    year20242025Updates: [
      'Yeni sınavlarda ağırlığı azalarak yerini Dataplex Auto Data Quality\'ye bırakmıştır.'
    ]
  },

  // 17. Security & Privacy (DLP & KMS)
  {
    id: 'security-deepdive',
    name: 'Security: DLP (Sensitive Data Protection) & Cloud KMS',
    category: 'governance_security',
    categoryLabel: 'Yönetişim & Güvenlik',
    officialDocLink: 'https://cloud.google.com/sensitive-data-protection/docs',
    summary: 'Hassas verilerin (PII, PCI-DSS, HIPAA) taranması, maskelenmesi ve şifreleme anahtarlarının merkezi yönetimi.',
    deepDiveSections: [
      {
        title: 'Sensitive Data Protection (DLP API)',
        points: [
          'Otomatik Tespit: Kredi kartı, pasaport, e-posta, IP adresi gibi 150+ yerleşik infoType dedektörü.',
          'De-identification (Anonimleştirme): Maskeleme (Masking), Kriptografik Sahteleştirme (Crypto-hash tokenization), Gruplama (Bucketing - yaşları 20-30 aralığına çevirme).',
          'Tersine Çevrilebilir Tokenizasyon: Anahtarla tekrar orijinal değere döndürülebilen şifreli belirteç üretimi.'
        ]
      },
      {
        title: 'Cloud KMS Şifreleme Seviyeleri',
        points: [
          'Google-managed Keys (Varsayılan): Sıfır yapılandırmayla donanım seviyesinde otomatik AES-256 şifreleme.',
          'Customer-Managed Encryption Keys (CMEK): Anahtar rotasyonunu ve politikasını müşterinin belirlediği anahtarlar.',
          'Customer-Supplied Encryption Keys (CSEK): Anahtarın Google\'a hiç kaydedilmediği, her API çağrısında müşterinin ilettiği en katı model.'
        ]
      }
    ],
    examTraps: [
      'Regülasyon uyumluluğu için "şirketin kendi anahtarını rotasyona sokması zorunludur" dendiğinde cevap Customer-Managed Encryption Keys (CMEK)\'tir.',
      'DLP taramalarını her gün tüm Cloud Storage kovalarına kontrolsüz çalıştırmak devasa API faturalarına yol açar; periyodik örneklem (sampling) kullanılmalıdır.'
    ],
    goldenHeuristic: 'Hassas verileri (PII) otomatik maskeleme/anonimleştirme = Sensitive Data Protection (DLP). Kendi anahtarını yönetme = CMEK.',
    year20242025Updates: [
      'DLP servisinin adı "Sensitive Data Protection" olarak güncellendi ve Dataplex ile doğrudan entegre edildi.'
    ]
  },

  // 18. Cloud SQL
  {
    id: 'cloud-sql-deepdive',
    name: 'Google Cloud SQL',
    category: 'databases',
    categoryLabel: 'Veritabanları & NoSQL',
    officialDocLink: 'https://cloud.google.com/sql/docs',
    summary: 'MySQL, PostgreSQL ve SQL Server için tam yönetilen ilişkisel veritabanı; bölgesel otomatik yük devretme ve okuma replikasyon desteği.',
    deepDiveSections: [
      {
        title: 'Yüksek Erişilebilirlik (HA) & Replikasyon',
        points: [
          'High Availability (HA): Aynı bölge içindeki farklı bir kullanılabilirlik alanında (standby zone) senkronize replika tutar. Birincil düğüm çökerse dakikalar içinde otomatik geçiş yapar.',
          'Cross-Region Read Replicas: Okuma trafiğini bölge dışına dağıtır ve felaket kurtarma için terfi ettirilebilir (promote).',
          'Cloud SQL Auth Proxy: Statik IP veya SSL sertifika yönetimine gerek kalmadan IAM ile şifrelenmiş güvenli tünel açar.'
        ]
      }
    ],
    examTraps: [
      'Cloud SQL petabaytlarca analitik veri ambarı veya küresel yatay ölçeklenen ilişkisel sistem için uygun DEĞİLDİR; dikey ölçeklenir ve maksimum ~64 TB disk sınırı vardır.'
    ],
    goldenHeuristic: 'Tek bölgede standart ilişkisel MySQL/PostgreSQL iş yükü = Cloud SQL. Sınırsız yatay ölçeklenen küresel ilişkisel = Cloud Spanner.',
    year20242025Updates: [
      'Cloud SQL Enterprise Plus sürümü ile %99.99 SLA ve 3 kat daha yüksek okuma performansı sunuldu.'
    ]
  },

  // 19. Migration & Data Transfer
  {
    id: 'migration-deepdive',
    name: 'Veri Taşıma: Transfer Appliance vs STS vs BigQuery DTS',
    category: 'migration_ops',
    categoryLabel: 'Taşıma & Operasyon',
    officialDocLink: 'https://cloud.google.com/storage-transfer/docs',
    summary: 'Veri merkezinden veya diğer bulut sağlayıcılarından (AWS, Azure) GCP\'ye büyük veri taşıma stratejileri.',
    deepDiveSections: [
      {
        title: 'Üç Kritik Taşıma Servisinin Ayrımı',
        points: [
          'Transfer Appliance: Fiziksel donanım cihazı. Şirket içi veri merkezine kargolanır, veriler yüklenip şifrelenir ve Google yükleme merkezine geri gönderilir. Ağ bant genişliğinin yetersiz veya pahalı olduğu 20 TB - 1 PB+ senaryolar için idealdir.',
          'Storage Transfer Service (STS): Bulutlar arası (AWS S3 -> GCS, Azure Blob -> GCS) veya on-premise NFS/POSIX depolamadan GCS\'e yüksek hızlı çevrimiçi (online) veri aktarımı.',
          'BigQuery Data Transfer Service (DTS): SaaS platformlarından (Google Ads, YouTube, Salesforce) veya AWS S3/Cloud Storage\'dan BigQuery\'ye zamanlanmış, otomatik tablo yüklemeleri.'
        ]
      }
    ],
    examTraps: [
      'Ağ bağlantısı zayıfken (örn. 100 Mbps) 50 TB veriyi internet üzerinden `gsutil rsync` ile taşımaya çalışmak aylar sürer ve sınavda kesinlikle elenir; cevap Transfer Appliance\'tır!',
      'AWS S3\'ten GCS\'e veri taşırken sunucu ayağa kaldırıp script yazmak yerine yönetilen `Storage Transfer Service` seçilmelidir.'
    ],
    goldenHeuristic: 'Zayıf ağ bağlantısı ve >20 TB çevrimdışı taşıma = Transfer Appliance. S3/Azure\'dan GCS\'e online aktarım = Storage Transfer Service. SaaS\'tan BigQuery\'ye zamanlanmış yükleme = BigQuery DTS.',
    year20242025Updates: [
      'Storage Transfer Service artık doğrudan dosya seviyesi filtreler ve VPC Service Controls ile tam entegre çalışıyor.'
    ]
  }
];

// =========================================================================
// INTERACTIVE EXAM DECISION MATRIX (DECISION TREE SCENARIOS)
// =========================================================================
export const gcpDecisionScenarios: GcpDecisionScenario[] = [
  {
    id: 'scenario-1',
    scenario: 'Şirketiniz, milyonlarca IoT cihazından saniyede 100.000 telemetri okuması almaktadır. Verilerin sub-10ms gecikmeyle yazılması, zaman serisi grafikleri için tek bir anahtar üzerinden taranması ve aylık 50 TB büyümesi beklenmektedir.',
    criteriaBadge: 'Sub-10ms Gecikme + Zaman Serisi + Terabayt Boyut',
    chosenService: 'Google Cloud Bigtable',
    serviceCategory: 'NoSQL / Operational',
    whyCorrect: 'Bigtable, tek haneli milisaniye yazma/okuma gecikmesi sunan, Row Key bazında alfabetik sıralı tarama yapabilen ve petabayt ölçeğinde genişleyen en optimal zaman serisi veritabanıdır.',
    distractors: [
      { service: 'Cloud Spanner', reason: 'Spanner ilişkisel ve güçlü ACID garantisi sunar; saf zaman serisi telemetrisi için gereksiz pahalıdır ve işlem gecikmesi Bigtable\'a göre daha yüksektir.' },
      { service: 'BigQuery', reason: 'BigQuery analitik ambar olarak mükemmeldir ancak sub-10ms operasyonel tekil anahtar okumalarında yetersizdir.' },
      { service: 'Cloud SQL', reason: 'Dikey ölçeklenir; saniyede 100.000 yazma trafiğinde ve 50 TB aylık büyümede depolama ve CPU darboğazına girer.' }
    ],
    goldenRule: 'Sub-10ms + Key-Value / Wide-Column + Zaman Serisi IoT = Cloud Bigtable.'
  },
  {
    id: 'scenario-2',
    scenario: 'Global çapta e-ticaret hizmeti veren bir bankacılık uygulaması, tüm dünyadaki şubelerde eşzamanlı bakiye transferi yapmaktadır. Sıfır veri kaybı (%99.999 SLA) ve katı ilişkisel ACID bütünlüğü şart koşulmaktadır.',
    criteriaBadge: 'Küresel (Global) + İlişkisel SQL + %99.999 SLA',
    chosenService: 'Google Cloud Spanner',
    serviceCategory: 'İlişkisel Veritabanı',
    whyCorrect: 'Spanner, donanımsal atomik saatler (TrueTime API) kullanarak küresel çapta harici tutarlılık (External Consistency), tam ACID ve %99.999 kullanılabilirlik SLA\'sı sunan dünyadaki tek ilişkisel bulut veritabanıdır.',
    distractors: [
      { service: 'Cloud SQL (HA)', reason: 'Cloud SQL tek bir bölge içinde yüksek erişilebilirlik sunar; global multi-region aktif-aktif ilişkisel yazma yapamaz.' },
      { service: 'Cloud Bigtable', reason: 'NoSQL modelindedir; çoklu tablolar arasında ACID transfer garantisi ve ilişkisel JOIN desteği yoktur.' },
      { service: 'Firestore', reason: 'Belge tabanlı NoSQL\'dir; karmaşık bankacılık şemaları ve küresel ilişkisel bütünlük için uygun değildir.' }
    ],
    goldenRule: 'Küresel ACID + İlişkisel SQL + %99.999 SLA = Cloud Spanner.'
  },
  {
    id: 'scenario-3',
    scenario: 'On-premise veri merkezinizde 80 TB boyutunda kritik arşiv veriniz bulunmaktadır. Şirketinizin mevcut dış internet bağlantı hızı 50 Mbps ile sınırlıdır ve operasyonel işleri aksatmamak için ağ bant genişliği kullanılamamaktadır. Veriyi 2 hafta içinde Cloud Storage\'a aktarmanız gerekmektedir.',
    criteriaBadge: 'Zayıf Bant Genişliği + >20 TB + Çevrimdışı (Offline) Transfer',
    chosenService: 'Google Cloud Transfer Appliance',
    serviceCategory: 'Veri Taşıma',
    whyCorrect: '50 Mbps hat ile 80 TB veriyi internet üzerinden taşımak matematiksel olarak yaklaşık 5-6 ay sürer! Transfer Appliance, fiziksel şifreli depolama donanımının adrese gelmesi, verinin yerel ağdan gigabit hızında yüklenmesi ve Google tesisine kargolanmasıyla gün içinde tamamlanır.',
    distractors: [
      { service: 'Storage Transfer Service (STS)', reason: 'STS çevrimiçi bir servistir; internet hattı zayıf olduğu için istenen 2 haftalık süreye yetişemez.' },
      { service: 'gsutil rsync / gcloud storage', reason: 'İnternet bant genişliğini tüketeceği için operasyonel işleri kilitler ve aylar sürer.' },
      { service: 'BigQuery Data Transfer Service', reason: 'SaaS ve ambar içi veri yüklemeleri içindir; on-premise dosya taşıma aracı değildir.' }
    ],
    goldenRule: 'Zayıf internet hattı + >20 TB = Transfer Appliance.'
  },
  {
    id: 'scenario-4',
    scenario: 'Streaming veri hattınızda Pub/Sub üzerinden gelen JSON kayıtlarını Apache Beam ile işliyorsunuz. Gelen mesajların %1\'i bozuk biçimlendirilmiş veya eksik alanlıdır. Bu bozuk mesajların boru hattını çökertmeden izole edilmesi ve hata analizi için saklanması istenmektedir.',
    criteriaBadge: 'Hata Yönetimi + Zehirli Mesajlar (Poison Pills)',
    chosenService: 'Dataflow Dead Letter Queue (DLQ) Deseni',
    serviceCategory: 'Veri İşleme (Streaming)',
    whyCorrect: 'Dataflow içinde try/catch bloğunda parse hatası veren kayıtlar bir yan çıktıya (Side Output) yönlendirilir ve ikincil bir PCollection üzerinden Dead Letter Queue (GCS veya Pub/Sub) hedefine yazılarak ana hattın kesintisiz akması sağlanır.',
    distractors: [
      { service: 'Mesajları anında yoksayıp (Drop) loglamak', reason: 'Finansal veya denetim gerektiren sistemlerde veri kaybı kabul edilemez; kayıtlar saklanmalıdır.' },
      { service: 'Dataflow pipeline\'ını Exception ile durdurmak', reason: 'Her bozuk kayıtta pipeline çöker ve CrashLoop fırtınası çıkar.' },
      { service: 'Pub/Sub nack() çağrısı yapmak', reason: 'Mesaj tekrar tekrar geri döner ve kuyruğu tıkar.' }
    ],
    goldenRule: 'Bozuk veya ayrıştırılamayan mesajları ana akışı tıkamadan ayıklamak = Dead Letter Queue (DLQ).'
  },
  {
    id: 'scenario-5',
    scenario: 'Farklı Google Cloud projelerinde bulunan pazarlama, finans ve lojistik departmanlarına ait Cloud Storage bucket\'ları ve BigQuery dataset\'leri bulunmaktadır. Şirket, verileri kopyalamadan tek bir mantıksal veri gölü altında birleştirmek, ortak veri kalitesi (Data Quality) kuralları işletmek ve merkezi güvenlik politikası uygulamak istemektedir.',
    criteriaBadge: 'Data Mesh + Sıfır Veri Hareketi + Otomatik Kalite',
    chosenService: 'Google Dataplex',
    serviceCategory: 'Yönetişim & Güvenlik',
    whyCorrect: 'Dataplex, verileri fiziksel olarak taşımadan Lake -> Zone -> Asset hiyerarşisinde mantıksal olarak birleştiren, otomatik veri kalitesi YAML kuralları çalıştıran ve merkezi IAM sağlayan Data Mesh servisidir.',
    distractors: [
      { service: 'Tüm verileri tek bir devasa BigQuery dataset\'ine kopyalamak', reason: 'Depolama maliyetini ikiye katlar, veri tazeliğini bozar ve Data Mesh ilkelerine aykırıdır.' },
      { service: 'Cloud Data Fusion', reason: 'Bir ETL dönüşüm aracıdır; merkezi yönetişim ve metaveri platformu değildir.' },
      { service: 'Cloud Composer', reason: 'İş akışı orkestratörüdür; mantıksal veri kataloğu ve yönetişim sağlamaz.' }
    ],
    goldenRule: 'Veriyi taşımadan çoklu projelerde mantıksal göl mimarisi (Data Mesh) = Google Dataplex.'
  }
];

// =========================================================================
// SATHISH VJ 2024-2025 CURATED PUBLICATION REVIEWS & EXAM STRATEGIES
// =========================================================================
export const gcpPublicationReviews: GcpPdePublicationReview[] = [
  {
    id: 'carmel-wenga-2025',
    title: 'Decoding the Google Cloud Professional Data Engineer Certification Exam (2025)',
    author: 'Carmel Wenga (Data Engineer Things)',
    date: 'Şubat 2025',
    url: 'https://blog.dataengineerthings.org/decoding-the-google-cloud-professional-data-engineer-certification-exam-c1b8ab84a3f2',
    focusArea: 'Sınav Müfredat Değişimi & Modern GCP Mimarisi',
    summary: '2025 yılında güncellenen sınav formatını derinlemesine inceleyen en güncel rehber. Klasik ML mühendisliği sorularının kalktığını, ağırlığın Dataplex Data Mesh, BigLake cross-cloud sorguları, Dataform ve Storage Write API mimarisine kaydığını kanıtlarıyla açıklar.',
    actionableExamTips: [
      'BigQuery Storage Write API akış türlerini (Committed, Buffered, Pending) mutlaka öğrenin.',
      'Dataflow pencerelerinde Watermark gecikmelerini ve Side Inputs kullanımını iyi kavrayın.',
      'Eski sorularda sıkça çıkan Dataprep ve Data Fusion yerine modern Dataform çözümlerini arayın.'
    ]
  },
  {
    id: 'manojkumar-2025',
    title: 'New GCP PDE Renewal Exam (2026 Edition): What Changed and What to Expect',
    author: 'Manojkumar Vadivel',
    date: 'Aralık 2025',
    url: 'https://medium.com/@manojkumar.vadivel/i-took-the-new-google-cloud-professional-data-engineer-renewal-exam-dec-2025-5b90d68f8dac',
    focusArea: 'FinOps, BigQuery Editions ve CDC Mimarileri',
    summary: 'Sertifika yenileme (Renewal) sınavına giren yazar, BigQuery Editions (Standard, Enterprise, Enterprise Plus) kapasite fiyatlandırması ve Datastream ile operasyonel veritabanlarından sıfır kesintili CDC akışlarının ağırlık kazandığını vurgulamaktadır.',
    actionableExamTips: [
      'BigQuery On-Demand ile Editions (Capacity pricing) arasındaki bütçe seçim sorularına hazırlıklı olun.',
      'Datastream CDC\'nin kaynak veritabanına kilit atmadan transaction log okuma prensibini bilin.',
      'Cloud Storage Turbo Replication\'ın 15 dakikalık RPO garantisi en garanti sorulardan biridir.'
    ]
  },
  {
    id: 'siddharth-ghosh-2025',
    title: 'How to Clear the GCP PDE Exam — Strategy Without Hands-on Experience',
    author: 'Siddharth Ghosh',
    date: 'Ocak 2025',
    url: 'https://medium.com/@ghoshsiddharth25/ultimate-guide-to-clear-the-google-cloud-professional-data-engineer-certification-exam-december-f4e8dbd1272f',
    focusArea: 'Soru Eleme Teknikleri & Hızlı Karar Matrisleri',
    summary: 'Soruları okurken anahtar kelimelerden (triggers) doğru servisi bulma ve yanlış seçenekleri (distractors) anında eleme yöntemini açıklar.',
    actionableExamTips: [
      '"Sub-10ms ve Key-Value" = Bigtable; "Global ACID ve SQL" = Spanner; "SQL analitik" = BigQuery.',
      'gzip ile sıkıştırılmış CSV paralel okunamadığı için yükleme hızı darboğazına girer; çözüm uncompressed veya Avro\'dur.',
      'Dataproc kümesinde kalıcı HDFS tutmak her zaman yanlış cevaptır; veri Cloud Storage\'da olmalıdır.'
    ]
  },
  {
    id: 'david-regalado-2025',
    title: 'How to Prepare for the Google Cloud Professional Data Engineer Exam',
    author: 'David Regalado',
    date: 'Ocak 2025',
    url: 'https://medium.com/google-cloud/how-to-prepare-for-the-google-cloud-professional-data-engineer-certification-exam-3f77ee3e4389',
    focusArea: 'Uçtan Uca Veri Yaşam Döngüsü',
    summary: 'Verinin GCP\'ye girişinden raporlamaya kadar olan 5 aşamasını (Ingestion -> Storage -> Processing -> Serving -> Governance) sistematik olarak şablonlaştırır.',
    actionableExamTips: [
      'Veri alımında (Ingestion) basit aktarımlar için Pub/Sub BigQuery Subscription\'ı Dataflow\'a tercih edin.',
      'Güvenlikte Policy Tags ve Sensitive Data Protection (DLP) ayrımlarını iyi öğrenin.',
      'Büyük offline veri taşımada Transfer Appliance limitlerini (>20 TB) ezberleyin.'
    ]
  }
];
