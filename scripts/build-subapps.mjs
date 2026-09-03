// build-subapps.mjs — 把各 wujie 子应用（subapps/<name>/main.ts）构建为
// wujie 可加载的 IIFE 包，输出到 subapps/<name>/dist/{index.html, subapp.iife.js, style.css}。
//
// 为什么不直接用 vite build 的多 HTML 入口：vite build 对子应用产出的是 ESM module script，
// 而 wujie（import-html-entry）不会把 module script 当作可执行入口执行，子应用 #app 永远不挂载
// （表现为大屏中间空白、只显示主壳 header/footer）。因此子应用必须打成 IIFE（经典 <script>），
// 由 wujie 直接执行。dist 输出在 subapps/<name>/dist/ 下（已被 .gitignore 忽略，属构建产物，
// 不入库；dev 由 vite.config 的 serveSubappDist 中间件直传该 HTML）。
//
// 运行：node scripts/build-subapps.mjs   （或 npm run build:subapps）

import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

// build-subapps.mjs 位于 <root>/scripts/ 下，项目根是 scripts/ 的父目录
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptDir);
const subappsDir = join(projectRoot, 'subapps');

// 收集所有含 main.ts 的子应用目录
let names = readdirSync(subappsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(subappsDir, d.name, 'main.ts')))
  .map((d) => d.name);

// 可选：SUBAPP=xxx 只构建单个子应用（开发联调时省时）
const onlyOne = process.env.SUBAPP;
if (onlyOne) {
  if (!names.includes(onlyOne)) {
    console.error(`[build-subapps] SUBAPP=${onlyOne} 不存在，可用: ${names.join(', ')}`);
    process.exit(1);
  }
  names = [onlyOne];
}

if (names.length === 0) {
  console.error('[build-subapps] 未找到任何子应用（subapps/*/main.ts）');
  process.exit(1);
}

const PROCESS_SHIM = `window.process = window.process || { env: { NODE_ENV: 'production' } };`;

async function buildOne(name) {
  const subappRoot = join(subappsDir, name);
  const outDir = join(subappRoot, 'dist');
  console.log(`[build-subapps] → ${name}`);

  await build({
    root: subappRoot,
    configFile: false,
    envDir: projectRoot, // 让 .env / .env.local（如 VITE_CESIUM_ION_TOKEN）参与构建
    logLevel: 'warn',
    plugins: [vue()],
    // ⚠️ define 必须是 Vite 顶层配置项。Vite 5 已移除 build.define 别名，
    // 放在 build 下会被静默忽略 —— 曾导致 CESIUM_BASE_URL 未注入子应用 IIFE 包，
    // 子应用内 Cesium 回退到「子应用自身路径」(/subapps/<name>/) 加载 Workers/Assets，
    // dev 下被 SPA 回退成 index.html → JSON.parse 报错、Worker MIME 报错。
    // 必须与 vite.config 顶层 define 及 viteStaticCopy 输出目录 (/cesium) 保持一致。
    define: {
      // CJS 依赖残留 process.env 引用 → 沙箱无 process 全局时首行 ReferenceError；
      // 双保险：htmlWrapper 注入 window.process shim + 此处把 process.env 整体替换为 {}。
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
      // Cesium 资源根路径（同在 /cesium 下，由 viteStaticCopy 在 dev/build 拷贝）
      CESIUM_BASE_URL: JSON.stringify('/cesium'),
    },
    build: {
      outDir: 'dist',
      // 默认 true。设 SUBAPP_NO_EMPTY=1 时改为 false —— 绕过 WorkBuddy safe-delete
      // 批量删除守卫（清空 dist 超过 50 文件会触发 SAFE_DELETE_BULK_CONFIRM_REQUIRED
      // 导致构建被拦截）。false 仅覆盖不删除，旧产物会被新文件覆盖，结果等价且更安全。
      emptyOutDir: process.env.SUBAPP_NO_EMPTY === '1' ? false : true,
      cssCodeSplit: false,
      reportCompressedSize: false,
      minify: false,
      target: 'es2020',
      lib: {
        entry: join(subappRoot, 'main.ts'),
        formats: ['iife'],
        fileName: () => 'subapp.iife.js',
        name: 'FMSubApp',
      },
      rollupOptions: {
        output: { extend: true },
      },
    },
    resolve: {
      alias: {
        '@': join(projectRoot, 'src'),
        lerc: join(projectRoot, 'node_modules/lerc/LercDecode.js'),
      },
      conditions: [],
    },
  });

  // lib 模式不产出 index.html，自行写一份「经典 script」入口（绕过 Vite dev 的 /@vite/client 注入）
  const files = readdirSync(outDir);
  const cssFile = files.find((f) => f.endsWith('.css'));
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
${cssFile ? `    <link rel="stylesheet" href="./${cssFile}" />\n` : ''}  </head>
  <body>
    <div id="app"></div>
    <script>${PROCESS_SHIM}</script>
    <script src="./subapp.iife.js"></script>
  </body>
</html>
`;
  writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
  console.log(`[build-subapps] ✓ ${name} -> dist/{index.html, subapp.iife.js${cssFile ? ', ' + cssFile : ''}}`);
}

const failed = [];
for (const name of names) {
  try {
    await buildOne(name);
  } catch (err) {
    console.error(`[build-subapps] ✗ ${name} 构建失败:`, err?.message || err);
    failed.push(name);
  }
}

if (failed.length > 0) {
  console.error(`[build-subapps] 失败 ${failed.length} 个: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`[build-subapps] 全部完成（${names.length} 个）`);
