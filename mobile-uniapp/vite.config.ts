import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// uni-app 独立工程（从原 Vite 多入口 mobileApp 剥离）。
// 注意：本工程不再参与根 frontend-scaffold 的 Vite 多入口构建。
//
// ⚠️ Vue 实例口径（2026-10-10 浏览器+HTTP 模块图双重取证）：
// @dcloudio/uni-h5-vite 的 resolveId 会把所有 `import 'vue'` 默认重映射到
// @dcloudio/uni-h5-vue（uni 基于 Vue 3.4.21 的 fork，reactivity 核心内联其中）。
// 已逐个验证 main.ts / vue-router / pinia(vue-demi) 的 vue 导入**全部**归一到同一
// `.../uni-h5-vue/dist/vue.runtime.esm.js` URL —— 即单实例。
// 故：不要再手动加resolve.alias / optimizeDeps.exclude 去干预，否则反而制造双实例。
export default defineConfig({
  plugins: [uni()],
  // 关闭依赖预构建（pre-bundling）。
  // 原因：uni 走的是 @dcloudio/uni-h5-vue 这份 Vue fork，依赖预构建会把它和
  // vue-router / pinia 各自打包成独立 chunk，破坏 uni 默认的单一 vue 解析链路；
  // 同时每次 lockfile 变化后 vite 都要整目录删除旧 deps 缓存（50+ 文件），
  // 会被沙箱 safe-delete 批量守卫拦死，导致 dev server 起不来。
  // H5 dev 直读node_modules 源码即可，无需预构建。
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  server: {
    port: 5180,
    // 端口被占用时直接报错而非静默漂移到 5181；否则根 vite 的 /apps/mobile 重定向(target 写死 5180)会失配 → /apps/mobile/src/* 404
    strictPort: true,
  },
});
