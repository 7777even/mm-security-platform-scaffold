import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'element-plus/theme-chalk/base.css';
import '@/styles/element-dark.css';
import View from '@/views/fire-alarm/index.vue';
// 设计 token 由主壳经 wujie 沙箱注入（src/shell/wujieTokens.ts），子应用无需再打包 tokens.css。
import '@/styles/global.css';
import { installWujieDocumentShim } from '@/shell/wujieDocumentShim';
import http from '@/services/http';

// 在 wujie 沙箱内为 element-plus 焦点陷阱兜底 document.activeElement
installWujieDocumentShim();
import { installDevMock } from '@/mocks/devMock';
import { useAuthStore } from '@/stores/auth';
import { createSubappRouter } from '@/shell/subappRouter';

// fire-alarm 子应用入口（wujie-shell）。复用主壳已验证的 views/fire-alarm/index.vue，独立 Pinia 挂载；
// 共享态（auth/perm/theme）由主壳经 window.$wujie.props 下传，详见 src/shared。
// 空 router 仅为兜底 useRouter()（避免子应用内调用 router 报错），
// 跨应用导航经由 createSubappRouter（router.push → wujie 总线 route-navigate 委托主壳）。
const app = createApp(View);
const pinia = createPinia();
app.use(pinia);

// 与主壳一致：VITE_USE_DEV_MOCK=true 时启用自包含 mock（无需外部 8787 后端），
// installDevMock 内部 startSyntheticAlarms() 会经子应用自身 pinia 填充 alarm store。
if (import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true') {
  useAuthStore().login();
  installDevMock(http, pinia);
}

app.use(createSubappRouter());
app.mount('#app');
