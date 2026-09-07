// 实证：/emergency/typhoon 打开卫星云图弹窗 → 分别验证“卫星云图”（FY4B 整图）与
// “降雨雷达”（SWAN 拼图）两个模式的 imageOverlay 加载与控制台错误，并截图。
// 用法：node scripts/shoot-china-radar.mjs [port]
import { chromium } from 'playwright';

const port = process.argv[2] || '5174';
const base = `http://localhost:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

const nmcResponses = { ok: 0, fail: 0, urls: [] };
page.on('response', (res) => {
  if (res.url().includes('image.nmc.cn')) {
    if (res.status() >= 200 && res.status() < 400) nmcResponses.ok += 1;
    else nmcResponses.fail += 1;
    if (nmcResponses.urls.length < 8) nmcResponses.urls.push(`${res.status()} ${res.url()}`);
  }
});

await page.goto(`${base}/emergency/typhoon`, { waitUntil: 'networkidle', timeout: 60000 });

const trigger = page.locator('button', { hasText: '卫星云图' }).first();
await trigger.click();
await page.waitForTimeout(2500);

// 模式一：卫星云图（默认打开即 satellite）
await page.waitForTimeout(8000);
const probeSatellite = await page.evaluate(() => {
  function deepQueryAll(selector) {
    const out = [];
    const walk = (root) => {
      root.querySelectorAll(selector).forEach((n) => out.push(n));
      root.querySelectorAll('*').forEach((el) => {
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    };
    walk(document);
    return out;
  }
  const imgs = deepQueryAll('img.leaflet-image-layer');
  return {
    imageLayers: imgs.length,
    loadedImgs: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
    srcs: imgs.map((i) => i.src),
  };
});
await page.screenshot({ path: 'engineering/qa/scm-fy4b-satellite.png' });

// 模式二：降雨雷达
const radarBtn = page.locator('.scm-float--mode button', { hasText: '降雨雷达' }).first();
if (!(await radarBtn.count())) {
  console.log(JSON.stringify({ port, fatal: 'mode buttons not found', consoleErrors }, null, 2));
  await browser.close();
  process.exit(1);
}
await radarBtn.click();
await page.waitForTimeout(9000);
const probeRadar = await page.evaluate(() => {
  function deepQueryAll(selector) {
    const out = [];
    const walk = (root) => {
      root.querySelectorAll(selector).forEach((n) => out.push(n));
      root.querySelectorAll('*').forEach((el) => {
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    };
    walk(document);
    return out;
  }
  const imgs = deepQueryAll('img.leaflet-image-layer');
  return {
    imageLayers: imgs.length,
    loadedImgs: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
    srcs: imgs.map((i) => i.src).filter((s) => s.includes('RDCP')),
    radarsrcButtons: deepQueryAll('.scm-float--radarsrc button').map(
      (b) => `${b.textContent?.trim()}${b.disabled ? '(disabled)' : ''}`,
    ),
  };
});
await page.screenshot({ path: 'engineering/qa/scm-swan-radar.png' });

console.log(
  JSON.stringify({ port, probeSatellite, probeRadar, nmcResponses, consoleErrors }, null, 2),
);
await browser.close();
