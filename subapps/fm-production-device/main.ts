import { createPinia } from 'pinia';
import { startRealtime } from '@/services/realtime';
import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/DeviceDetailView.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-production-device 子应用入口（设备台账详情页）：
// deviceCode 由主壳路由参数经 window.$wujie.props.routeParams 下传；
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
const deviceCode = routeParams.deviceCode ?? '';

const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () => h(MapDashboardLayout, null, { default: () => h(View, { deviceCode }) }),
    }),
    h(AppToast),
  ],
});
app.use(createPinia());
app.use(createSubappRouter());
startRealtime();
app.mount('#app');
