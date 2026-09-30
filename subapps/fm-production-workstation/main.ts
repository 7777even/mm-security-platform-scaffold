import { createPinia } from 'pinia';
import { startRealtime } from '@/services/realtime';
import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/WorkstationDetailView.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-production-workstation 子应用入口（值守工位详情页）：
// workstationId 由主壳路由参数经 window.$wujie.props.routeParams 下传；
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
const workstationId = routeParams.workstationId ?? '';

const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () => h(MapDashboardLayout, null, { default: () => h(View, { workstationId }) }),
    }),
    h(AppToast),
  ],
});
app.use(createPinia());
app.use(createSubappRouter());
startRealtime();
app.mount('#app');
