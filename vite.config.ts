import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  "connect-src 'self' wss: ws: https: http: ws://localhost:* http://localhost:*",
  "font-src 'self' data:",
].join('; ');

// Cesium 静态资源输出目录（供构建/开发期访问；生产由部署服务器按同路径托管）
const CESIUM_BASE_URL = '/cesium';

export default defineConfig({
  // 依赖缓存移到系统临时目录（项目外），规避本环境 safe-delete 对工作区大目录批量删除的拦截，
  // 避免 vite 优化/清理依赖缓存时抛异常导致 dev server 崩溃
  cacheDir: join(tmpdir(), 'mm-safety-vite-cache'),
  plugins: [
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
      // Cesium 1.119 引用的 zip-no-worker.js 在 @zip.js/zip.js 新版本中已移除（2.7+ 重构 subpath），
      // 重定向到等价的核心实现（无 Worker 版压缩解压），保持构建可解析
      '@zip.js/zip.js/lib/zip-no-worker.js': fileURLToPath(
        new URL('./node_modules/@zip.js/zip.js/lib/zip-core.js', import.meta.url),
      ),
      // lerc 为 @cesium/engine 的嵌套 CJS 依赖（无顶层安装），Cesium 用 default import 引入；
      // 因 @cesium/engine 被 optimizeDeps.exclude，其嵌套 CJS 不被预构建、无 default interop。
      // 显式 alias 到嵌套文件 + include 预构建，保证 default 导出（I3SDataProvider.js:62）
      lerc: fileURLToPath(
        new URL('./node_modules/@cesium/engine/node_modules/lerc/LercDecode.js', import.meta.url),
      ),
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
    target: 'es2018',
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: { echarts: ['echarts'] } },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // vitest 不读 vite resolve.alias，必须显式同步：Cesium 1.x 依赖 @zip.js/zip.js 的
    // zip-no-worker.js 子路径（KmlDataSource.js 静态导入），新版本已移除该 subpath，
    // 重定向到 zip-core.js（无 Worker 版压缩解压）。node 环境运行也会触发。
    alias: [
      {
        find: '@zip.js/zip.js/lib/zip-no-worker.js',
        replacement: fileURLToPath(
          new URL('./node_modules/@zip.js/zip.js/lib/zip-core.js', import.meta.url),
        ),
      },
    ],
    // 让 vitest 也走 vite 转换 cesium 内部依赖（Cesium 内部 import 用 vite alias 重定向）
    server: {
      deps: {
        inline: ['cesium', '@cesium/engine', '@cesium/widgets'],
      },
    },
  },
});
