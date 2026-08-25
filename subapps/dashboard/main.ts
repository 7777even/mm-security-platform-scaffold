import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import 'element-plus/theme-chalk/base.css';
import Dashboard from '@/views/dashboard/index.vue';
// 设计 token 由主壳经 wujie 沙箱注入（src/shell/wujieTokens.ts），子应用无需再打包 tokens.css。
import '@/styles/global.css';
import http from '@/services/http';
import { installDevMock } from '@/mocks/devMock';
import { useAuthStore } from '@/stores/auth';

// dashboard 子应用入口（wujie-shell 试点）。
// 复用主壳已验证的 views/dashboard/index.vue，独立 Pinia 挂载；
// 共享态（auth/perm/theme）由主壳经 window.$wujie.props 下传，详见 src/shared。
// 空 router 仅为兜底 useRouter()（避免子应用内调用 router 报错），跨应用导航经 wujieBridge。
const app = createApp(Dashboard);
const pinia = createPinia();
app.use(pinia);

// 与主壳一致：VITE_USE_DEV_MOCK=true 时启用自包含 mock（无需外部 8787 后端），
// 经由 @/services/http 单例的 adapter 拦截子应用地图点位等请求，避免跨源/无后端 Network Error。
// （同一 http 实例被主壳与子应用共享，故装一次即对该子应用生效。）
if (import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true') {
  // Mock 登录：写入内存令牌，使请求拦截注入 Authorization（§5.3；正式环境由 IDP SSO 替换）
  useAuthStore().login();
  installDevMock(http, pinia);
}

app.use(createRouter({ history: createWebHistory(), routes: [] }));
app.mount('#app');
