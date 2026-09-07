import { createPinia } from 'pinia';
import { startRealtime } from '@/services/realtime';
import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import ListView from '@/screen/views/MajorHazardListView.vue';
import DetailView from '@/screen/views/MajorHazardDetailView.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-major-hazard 子应用入口（fire-monitoring 迁移）：
// 主壳两条路由（列表/详情）指向同一子应用，靠 window.$wujie.props.routeParams.hazardId 分发；
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
// 有 hazardId → 详情页；无 → 列表页
const hazardId = routeParams.hazardId;

const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () =>
        h(MapDashboardLayout, null, {
          default: () => (hazardId ? h(DetailView, { hazardId }) : h(ListView)),
        }),
    }),
    h(AppToast),
  ],
});
app.use(createPinia());
app.use(createSubappRouter());
startRealtime();
app.mount('#app');
