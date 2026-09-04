import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const OUT = 'engineering/qa/evidence';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));

  const countIframes = () =>
    page.evaluate(() => document.querySelectorAll('iframe').length);

  // 1) 初始挂载二级子应用页
  await page
    .goto(`${BASE}/fire/rescue?eventId=6`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    .catch((e) => console.log('goto-init-err', e.message));
  await sleep(6000);
  const n1 = await countIframes();
  await page.screenshot({ path: `${OUT}/switch-race-initial-mount.png` });

  // 2) 切走到一级页（建立浏览器历史栈）
  await page
    .goto(`${BASE}/fire`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    .catch((e) => console.log('goto-away-err', e.message));
  await sleep(3000);

  // 3) 浏览器后退 = SPA 内 popstate 导航回 /fire/rescue（等价于真实"切回"）
  await page
    .goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
    .catch((e) => console.log('goback-err', e.message));
  await sleep(6000);
  const n2 = await countIframes();
  await page.screenshot({ path: `${OUT}/switch-race-after-return.png` });

  console.log(
    JSON.stringify({ n1, n2, pass: n2 >= 1, errors: errors.slice(0, 8) }, null, 2),
  );
  await browser.close();
})();
