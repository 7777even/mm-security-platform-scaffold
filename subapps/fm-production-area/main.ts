import { createPinia } from 'pinia';
import { startRealtime } from '@/services/realtime';
import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/ProductionAreaView.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-production-area 子应用入口（fire-monitoring 迁移）：
// facilityId 由主壳路由参数经 window.$wujie.props.routeParams 下传（Task 5）；
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
const facilityId = routeParams.facilityId ?? '';

const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () => h(MapDashboardLayout, null, { default: () => h(View, { facilityId }) }),
    }),
    h(AppToast),
  ],
});
app.use(createPinia());
app.use(createSubappRouter());
startRealtime();
app.mount('#app');
