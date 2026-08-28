import { createRouter, createWebHistory } from 'vue-router';

// 后台独立入口路由（与主壳一致使用 history 模式，base 指向子路径）。
// dev 访问路径：/apps/mgmt/（多入口构建，见 vite.config.ts rollupOptions.input）。
// - dev：vite.config.ts 的 appsHtmlFallback 中间件把 /apps/mgmt/* 回退到本入口 index.html；
// - 生产：网关需为 /apps/mgmt/* 配置 rewrite → /apps/mgmt/index.html（与主壳回退规则同理）。
const router = createRouter({
  history: createWebHistory('/apps/mgmt/'),
  routes: [
    { path: '/', redirect: '/workbench' },
    {
      path: '/workbench',
      name: 'mgmt-workbench',
      component: () => import('./views/workbench.vue'),
      meta: { title: '工作台' },
    },
    {
      path: '/alarm-records',
      name: 'mgmt-alarm-records',
      component: () => import('./views/alarm-records.vue'),
      meta: { title: '报警记录' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/workbench' },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '管理后台')} · 安全管控平台`;
});

export default router;
