import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

// 移动端独立测试配置：不复用 uni 的 vite.config（被 @dcloudio/vite-plugin-uni 接管，会强制走 uni 编译模式），
// 这里用标准 @vitejs/plugin-vue 仅做 SFC 编译，配合 happy-dom 在 Node 下跑组件单测。
// 显式 root + 绝对路径 setupFiles：避免 vitest 上溯到仓库根 vite.config.ts 导致路径错位。
export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
    include: ['src/**/*.spec.ts'],
    exclude: [
      'node_modules',
      'dist',
      'dist-h5-verify',
      'dist-mp-verify',
      'dist-app-verify',
      '**/node_modules/**',
    ],
    globals: true,
  },
});
