import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// uni-app 独立工程（从原 Vite 多入口 mobileApp 剥离）。
// 注意：本工程不再参与根 frontend-scaffold 的 Vite 多入口构建。
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5180,
  },
});
