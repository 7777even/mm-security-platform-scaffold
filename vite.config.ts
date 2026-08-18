import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import { compression } from 'vite-plugin-compression2'

// CSP 开发态基线（S1 §10.2）；生产须改 nonce 注入、移除 unsafe-inline
// connect-src 额外放行本地 B3 Mock（http://localhost:8787 / ws://localhost:8787）
const csp = [
  "default-src 'self'",
  // img-src 放行 https:（OSM 瓦片外域，开发占位；生产替换天地图离线瓦片后收紧）
  "img-src 'self' data: blob: https: http:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' wss: ws: https: http: ws://localhost:* http://localhost:*",
  "font-src 'self' data:",
].join('; ')

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 按需自动引入（B4 性能优化：组件+样式均按需，从 es/components 子路径导入实现 tree-shake）
    Components({ resolvers: [ElementPlusResolver()], dts: 'components.d.ts' }),
    compression({ algorithm: 'gzip', threshold: 10240 }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
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
  },
})
