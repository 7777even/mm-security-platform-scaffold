import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/SectorEmergencyCommand.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-emergency 子应用入口（fire-monitoring 迁移）：
// 1:1 复刻源项目 App.vue 组合（ViewportSimulator > MapDashboardLayout > 视图 + AppToast），
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () => h(MapDashboardLayout, null, { default: () => h(View) }),
    }),
    h(AppToast),
  ],
});
app.use(createSubappRouter());
app.mount('#app');
