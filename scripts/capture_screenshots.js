import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('🚀 Chrome başlatılıyor...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 920, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  const captures = [
    {
      name: '01_mimari_tuval_aws.png',
      url: 'http://localhost:5173/?tab=canvas&theme=dark',
      waitSelector: '.react-flow',
      delay: 1500
    },
    {
      name: '02_sinav_simulatoru_1000q.png',
      url: 'http://localhost:5173/?tab=exam&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '03_gcp_pde_master_hub.png',
      url: 'http://localhost:5173/?tab=gcp_guide&theme=dark',
      waitSelector: 'h2',
      delay: 1500
    },
    {
      name: '04_sinav_araclari_ansiklopedisi.png',
      url: 'http://localhost:5173/?tab=tools&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '05_production_best_practices.png',
      url: 'http://localhost:5173/?tab=practices&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '06_cross_cloud_rosetta_stone.png',
      url: 'http://localhost:5173/?tab=rosetta&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '07_what_if_maliyet_simulatoru.png',
      url: 'http://localhost:5173/?tab=whatif&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '08_sql_lakehouse_workbench.png',
      url: 'http://localhost:5173/?tab=workbench&theme=dark',
      waitSelector: 'h3',
      delay: 1500
    },
    {
      name: '09_krem_tema_gorunumu.png',
      url: 'http://localhost:5173/?tab=canvas&theme=cream',
      waitSelector: '.react-flow',
      delay: 1500
    },
    {
      name: '10_krem_tema_gcp_rehberi.png',
      url: 'http://localhost:5173/?tab=gcp_guide&theme=cream',
      waitSelector: 'h2',
      delay: 1500
    }
  ];

  for (const item of captures) {
    console.log(`📸 Yakalanıyor: ${item.name} -> ${item.url}`);
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
    if (item.waitSelector) {
      await page.waitForSelector(item.waitSelector, { timeout: 10000 }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, item.delay));
    const outPath = path.join(screenshotsDir, item.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✅ Kaydedildi: ${item.name}`);
  }

  await browser.close();
  console.log('🎉 Tüm ekran görüntüleri başarıyla kaydedildi!');
}

run().catch((err) => {
  console.error('Hata oluştu:', err);
  process.exit(1);
});
