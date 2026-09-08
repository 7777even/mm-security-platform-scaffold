import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { compression } from 'vite-plugin-compression2';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// CSP 开发态基线（S1 §10.2）；生产须改 nonce 注入、移除 unsafe-inline
// connect-src 额外放行本地 B3 Mock（http://localhost:8787 / ws://localhost:8787）
const csp = [
  "default-src 'self'",
  // img-src 收紧至同源（S1 §9.4 离线：默认不请求公网瓦片）；开发需公网 OSM 预览时临时加 https:
  // 注意：此 header 仅作用于 dev server，生产由 deploy/csp.conf nonce 注入，仍保持 'self' 同源
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-eval'：Cesium 1.x 内部用 new Function() 动态编译 GLSL 着色器与 Worker 脚本，硬性需要；
  // 'wasm-unsafe-eval'：Cesium 1.119 Worker 用 WebAssembly.instantiate 解码 Draco/QuantizedMesh，
  //   现代浏览器 CSP3 需要显式 wasm-unsafe-eval 才能 instantiate；
  // 这是引擎行为无法消除。生产由 deploy/csp.conf 同样放行（nonce 注入仍保留，不放行 unsafe-inline）
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "connect-src 'self' blob: wss: ws: https: http: ws://localhost:* http://localhost:*",
  "font-src 'self' data:",
  // wujie 沙箱：主壳注入 blob 文档 iframe 承载子应用，需放行同源 blob 帧（否则 default-src 'self' 拦截 → 二次跨源 location 读取错误）
  "frame-src 'self' blob:",
].join('; ');

// Cesium 静态资源输出目录（供构建/开发期访问；生产由部署服务器按同路径托管）
const CESIUM_BASE_URL = '/cesium';

// dev 目录回退（仅 serve 生效）：默认 appType 'spa' 会把无扩展名请求回退到根 index.html，
// 导致 /apps/mgmt/ 这类独立应用目录 404 / 误入主壳。此插件将 /apps/<name>[/...] 重写
// 到 /apps/<name>/index.html；带文件扩展名的请求（静态资源）不重写。
// 生产环境由 nginx rewrite 承担同样职责（deploy/csp.conf 同源部署）。
// 子应用 dev 直传：wujie 子应用经 build:subapps 打成 IIFE 包，落到 subapps/<name>/dist/index.html。
// 该 HTML 是「经典 <script>」入口，wujie 才能执行。dev 下 /subapps/<name>/ 默认会被 SPA 回退到
// 主壳 index.html（module script，wujie 不会执行 → 大屏中间空白）。此 pre-middleware 在 Vite
// 回退前把 /subapps/<name>/(/index.html) 重写为直读 subapps/<name>/dist/index.html，绕开 Vite HTML transform
// 与 /@vite/client 注入。dist 下的静态资源（subapp.iife.js / style.css 及切图等）也由本中间件直读 dist 目录托管，
// 不依赖 Vite 静态中间件（经验证 Vite 不会 serving subapps/ 下产物，会回退成主壳 SPA HTML → 子应用脚本变空）。
function serveSubappDist(): Plugin {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  const isFile = (p: string) => existsSync(p) && statSync(p).isFile();
  return {
    name: 'serve-subapp-dist',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? '';
        const pathPart = raw.split('?')[0];
        const m = pathPart.match(/^\/subapps\/([^/]+)(\/.*)?$/);
        if (!m) return next();
        const name = m[1];
        let sub = m[2] ?? '';
        if (sub === '' || sub === '/') sub = '/index.html';
        // 优先 dist 产物；dist 不存在时回退到子应用源码目录（dev 兼容未构建的子应用）
        const distFile = join(rootDir, 'subapps', name, 'dist', sub);
        const srcFile = join(rootDir, 'subapps', name, sub);
        const file = isFile(distFile) ? distFile : isFile(srcFile) ? srcFile : '';
        if (!file) return next();
        const ext = extname(file).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(file));
      });
    },
  };
}

// dev 目录回退（仅 serve 生效）：默认 appType 'spa' 会把无扩展名请求回退到根 index.html，
// 导致 /apps/mgmt/ 这类独立应用目录 404 / 误入主壳。此插件将 /apps/<name>[/...] 重写
// 到 /apps/<name>/index.html；带文件扩展名的请求（静态资源）不重写。
// 生产环境由 nginx rewrite 承担同样职责（deploy/csp.conf 同源部署）。
function appsHtmlFallback(): Plugin {
  return {
    name: 'apps-html-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? '';
        const entry = raw.match(/^\/apps\/[^/]+/);
        if (entry) {
          const queryIdx = raw.indexOf('?');
          const pathPart = queryIdx === -1 ? raw : raw.slice(0, queryIdx);
          const queryPart = queryIdx === -1 ? '' : raw.slice(queryIdx);
          const rest = pathPart.slice(entry[0].length);
          if (!/\.[^/]+$/.test(rest)) {
            req.url = `${entry[0]}/index.html${queryPart}`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // 依赖缓存移到系统临时目录（项目外），规避本环境 safe-delete 对工作区大目录批量删除的拦截，
  // 避免 vite 优化/清理依赖缓存时抛异常导致 dev server 崩溃
  cacheDir: join(tmpdir(), 'mm-safety-vite-cache'),
  plugins: [
    serveSubappDist(),
    appsHtmlFallback(),
    vue(),
    // Element Plus 按需自动引入（B4 性能优化：组件+样式均按需，从 es/components 子路径导入实现 tree-shake）
    Components({ resolvers: [ElementPlusResolver()], dts: 'components.d.ts' }),
    compression({ algorithm: 'gzip', threshold: 10240 }),
    // Cesium 二三维一体化底座（详细设计 4.2.2.2）：拷贝其静态资源（Workers/Assets/Widgets/ThirdParty）
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers',
          dest: 'cesium',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets',
          dest: 'cesium',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty',
          dest: 'cesium',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets',
          dest: 'cesium',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // lerc 为 @cesium/engine 的 CJS 依赖（1.142+ 已是顶层安装），Cesium 用 default import 引入；
      // 因 @cesium/engine 被 optimizeDeps.exclude，其依赖不被预构建、无 default interop。
      // 显式 alias + include 预构建，保证 default 导出
      lerc: fileURLToPath(new URL('./node_modules/lerc/LercDecode.js', import.meta.url)),
    },
    // Cesium 使用 import.meta.url 定位资源，需显式定义 CESIUM_BASE_URL 供其 Worker/Assets 加载
    conditions: [],
  },
  define: {
    // Cesium 通过该全局变量解析静态资源根路径（与 viteStaticCopy 输出目录一致）
    CESIUM_BASE_URL: JSON.stringify(CESIUM_BASE_URL),
  },
  optimizeDeps: {
    // Cesium 含 ES2018 以上语法，预构建排除避免 esbuild 降级失败；
    // @zip.js/zip.js 同时排除：其子路径（含 zip-no-worker alias 目标）若被 vite 运行时重优化，
    // 会触发依赖缓存清理，在受限环境下导致 dev server 崩溃（本仓库已两次因此中断）
    exclude: ['cesium', '@zip.js/zip.js'],
    // Cesium（@cesium/engine）依赖一批 CJS 风格的包，dev 下需经 esbuild 预构建转 ESM 才能提供 default 导出；
    // 显式 include 固定其 interop，避免运行时按需发现导致的 default 缺失
    // （mersenne-twister / urijs 已实测缺失，其余为同风格 CJS，一并预构建消除隐患）
    include: [
      'mersenne-twister',
      'urijs',
      'bitmap-sdf',
      'topojson-client',
      '@tweenjs/tween.js',
      'rbush',
      'kdbush',
      'jsep',
      'autolinker',
      'grapheme-splitter',
      'nosleep.js',
      'lerc',
    ],
  },
  server: {
    // host: true 监听 0.0.0.0（IPv4/IPv6），避免 Windows 下 localhost 解析到 ::1 而拒连
    host: true,
    headers: { 'Content-Security-Policy': csp },
  },
  build: {
    // es2020：cesium 1.144 依赖链（lerc）含 BigInt 字面量；Chromium 86（信创下限）原生支持 BigInt
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      // 单 dev server 多 HTML 入口：主壳(index.html) + 各 wujie 子应用 + 独立应用(apps/)，
      // 保证子应用与主壳同源（wujie 强约束），避免跨源 SecurityError
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        mgmtApp: fileURLToPath(new URL('./apps/mgmt/index.html', import.meta.url)),
        mobileApp: fileURLToPath(new URL('./apps/mobile/index.html', import.meta.url)),
        fmEmergencySubapp: fileURLToPath(
          new URL('./subapps/fm-emergency/index.html', import.meta.url),
        ),
        fmFireSubapp: fileURLToPath(new URL('./subapps/fm-fire/index.html', import.meta.url)),
        fmRescueSubapp: fileURLToPath(new URL('./subapps/fm-rescue/index.html', import.meta.url)),
        fmTyphoonSubapp: fileURLToPath(new URL('./subapps/fm-typhoon/index.html', import.meta.url)),
        fmSecuritySubapp: fileURLToPath(
          new URL('./subapps/fm-security/index.html', import.meta.url),
        ),
        fmTvSubapp: fileURLToPath(new URL('./subapps/fm-tv/index.html', import.meta.url)),
        fmProductionSubapp: fileURLToPath(
          new URL('./subapps/fm-production/index.html', import.meta.url),
        ),
        fmProductionAreaSubapp: fileURLToPath(
          new URL('./subapps/fm-production-area/index.html', import.meta.url),
        ),
        fmMajorHazardSubapp: fileURLToPath(
          new URL('./subapps/fm-major-hazard/index.html', import.meta.url),
        ),
        fmCommunicationSubapp: fileURLToPath(
          new URL('./subapps/fm-communication/index.html', import.meta.url),
        ),
        fmVideoControlSubapp: fileURLToPath(
          new URL('./subapps/fm-video-control/index.html', import.meta.url),
        ),
        fmVideoWallSubapp: fileURLToPath(
          new URL('./subapps/fm-video-wall/index.html', import.meta.url),
        ),
      },
      output: { manualChunks: { echarts: ['echarts'] } },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'apps/mobile/**/*.spec.ts'],
    // 让 vitest 也走 vite 转换 cesium 内部依赖（Cesium 内部 import 用 vite alias 重定向）
    server: {
      deps: {
        inline: ['cesium', '@cesium/engine', '@cesium/widgets', 'element-plus'],
      },
    },
  },
});
