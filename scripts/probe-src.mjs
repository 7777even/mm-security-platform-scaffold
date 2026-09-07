const JMA = 'https://www.jma.go.jp/bosai/himawari/data/satimg';
const RV = 'https://api.rainviewer.com/public/weather-maps.json';

function tileXY(lat, lon, z) {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const r = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  return { x, y };
}

async function head(url, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const buf = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get('content-type');
      return { status: res.status, ct, bytes: buf.byteLength, buf, ok: true };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 900));
    }
  }
  return { status: 'ERR', ct: '-', bytes: 0, error: String(lastErr?.cause?.code || lastErr), ok: false };
}

const crypto = await import('node:crypto');
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex').slice(0, 10);

// ---------- 1. JMA 时次表 ----------
const raw = await (await fetch(`${JMA}/targetTimes_fd.json`)).json();
console.log('JMA frames:', raw.length);
console.log('basetime==validtime:', raw.filter((f) => f.basetime === f.validtime).length, '/', raw.length);
console.log('distinct basetimes:', new Set(raw.map((f) => f.basetime)).size);
console.log('first3', JSON.stringify(raw.slice(0, 3)));

// ---------- 2. 24h 时间轴上取历史帧瓦片 ----------
const { x: mx5, y: my5 } = tileXY(21.67, 110.92, 5);
console.log('\n--- JMA 历史帧 z5 瓦片 (茂名 25/14) ---');
for (const off of [0, 6, 24, 60, 120, 143]) {
  const f = raw[raw.length - 1 - off];
  if (!f) continue;
  const r = await head(`${JMA}/${f.basetime}/fd/${f.validtime}/B13/TBB/5/${mx5}/${my5}.jpg`);
  console.log(`  -${String(off).padStart(3)} ${f.validtime} base=${f.basetime} -> ${r.status} ${r.ct} ${r.bytes}B`);
}

console.log('\n--- 24h 前相邻帧内容差异 (z4) ---');
for (const off of [143, 142, 141]) {
  const f = raw[raw.length - 1 - off];
  const r = await head(`${JMA}/${f.basetime}/fd/${f.validtime}/B13/TBB/4/13/6.jpg`);
  console.log(`  ${f.validtime} ${r.status} ${r.bytes}B md5=${r.buf ? md5(r.buf) : '-'}`);
}

// ---------- 3. RainViewer ----------
console.log('\n--- RainViewer ---');
const rv = await (await fetch(RV)).json();
const past = rv.radar.past;
const now = Math.floor(Date.now() / 1000);
console.log('past 帧数:', past.length, '覆盖', ((now - past[0].time) / 3600).toFixed(2), 'h; host=', rv.host);
const latest = past[past.length - 1];
console.log('path 样例:', latest.path);
for (const z of [4, 5, 6, 7]) {
  const { x, y } = tileXY(21.67, 110.92, z);
  const r = await head(`${rv.host}${latest.path}/512/${z}/${x}/${y}/2/1_1.png`);
  console.log(`  茂名 z${z} ${x}/${y} -> ${r.status} ${r.bytes}B md5=${r.buf ? md5(r.buf) : '-'}`);
}
for (const [name, lat, lon] of [['东京', 35.68, 139.69], ['广州', 23.13, 113.26], ['首尔', 37.57, 126.98]]) {
  const { x, y } = tileXY(lat, lon, 5);
  const r = await head(`${rv.host}${latest.path}/512/5/${x}/${y}/2/1_1.png`);
  console.log(`  对照 ${name} z5 ${x}/${y} -> ${r.status} ${r.bytes}B md5=${r.buf ? md5(r.buf) : '-'}`);
}
