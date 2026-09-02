import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/VideoWallView.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-video-wall 子应用入口（fire-monitoring 迁移）：
// 源项目该页不包 MapDashboardLayout，仅 ViewportSimulator 直挂视图 + AppToast；
// 子应用无路由树，跨页导航经 createSubappRouter 委托主壳。
const app = createApp({
  render: () => [h(ViewportSimulator, null, { default: () => h(View) }), h(AppToast)],
});
app.use(createSubappRouter());
app.mount('#app');
