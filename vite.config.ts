import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { compression } from 'vite-plugin-compression2'

// CSP 开发态基线（S1 §10.2）；生产须改 nonce 注入、移除 unsafe-inline
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' wss: https:",
  "font-src 'self' data:",
].join('; ')

export default defineConfig({
  plugins: [vue(), compression({ algorithm: 'gzip', threshold: 10240 })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { headers: { 'Content-Security-Policy': csp } },
  build: {
    target: 'es2018',
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: { echarts: ['echarts'], 'element-plus': ['element-plus'] } },
    },
  },
  test: { environment: 'node', include: ['src/**/*.spec.ts'] },
})
