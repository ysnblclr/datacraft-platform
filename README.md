# DataCraft · Multi-Cloud Data Engineering Playground & Certification Simulator

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ysnblclr/datacraft-platform)

Veri mühendisleri için çoklu bulut mimari simülasyonu, 1.000+ senaryolu sertifikasyon sınav laboratuvarı (AWS DEA-C01, GCP PDE, Azure DP-700/DP-203, Databricks DE Associate) ve Netflix, Uber, Airbnb, Stripe gibi teknoloji devlerinin canlı prodüksiyon mimari desenlerini (Best Practices) içeren interaktif eğitim ve tasarım platformu.

---

## 🚀 Render ile 1-Tıkla Canlıya Alma (Deploy to Render)

1. Yukarıdaki **"Deploy to Render"** butonuna tıklayın (veya [bu bağlantıyı açın](https://render.com/deploy?repo=https://github.com/ysnblclr/datacraft-platform)).
2. Render paneli `render.yaml` dosyasını otomatik olarak algılar:
   - **Service Type**: Static Site
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
   - **Routing**: `/* -> /index.html` (SPA Rewrite)
3. **"Apply"** butonuna basarak anında ücretsiz HTTPS ve CDN ile yayına alın.

---

## 🛠️ Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev -- --host

# Üretim derlemesi
npm run build
```

---

## ✨ Özellikler

- **Multi-Cloud Architecture Canvas**: AWS, GCP, Azure ve Açık Kaynak eşdeğerleri arasında anlık geçiş ve interaktif veri akışı.
- **Sertifikasyon Laboratuvarı**: Her şık için gecikme (latency), maliyet (cost), operasyonel yük (ops) ve ölçeklenebilirlik (scalability) trade-off analizi.
- **Gerçek Dünya Best Practices**: Lakehouse compaction, Airflow backfill idempotent DAG, Kafka DLQ, Stripe Data Contracts, Debezium CDC Outbox ve FinOps maliyet optimizasyonları.
- **What-If Kapasite & TCO Simülatörü**: EPS, kayıt boyutu ve mikro-batch pencerelerine göre canlı darboğaz ("Small files problem") ve bulutlar arası maliyet karşılaştırması.
- **Lakehouse SQL Workbench**: In-memory motor ile Bronze, Silver, Gold deduplication ve Apache Iceberg time-travel test alanı.
- **%100 Mobil ve Masaüstü Uyumlu**: Duyarlı tasarım ve mobil liste/tuval akıllı modları.
