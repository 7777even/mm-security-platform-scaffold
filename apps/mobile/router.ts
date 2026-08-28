import { createRouter, createWebHistory } from 'vue-router';

// 移动端独立入口路由（与主壳/后台一致使用 history 模式，base 指向子路径）。
// dev 访问路径：/apps/mobile/（多入口构建，见 vite.config.ts rollupOptions.input）。
// - dev：vite.config.ts 的 appsHtmlFallback 中间件把 /apps/mobile/* 回退到本入口 index.html；
// - 生产：网关需为 /apps/mobile/* 配置 rewrite → /apps/mobile/index.html（同 /apps/mgmt 规则）；
// - 原生壳（hybrid）内嵌时由原生 WebView 直接加载本入口（静态资源同源部署，无跨域问题）。
const router = createRouter({
  history: createWebHistory('/apps/mobile/'),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/home',
      name: 'mobile-home',
      component: () => import('./views/home.vue'),
      meta: { title: '首页', tab: 'home' },
    },
    {
      path: '/tasks',
      name: 'mobile-tasks',
      component: () => import('./views/tasks.vue'),
      meta: { title: '任务', tab: 'tasks' },
    },
    {
      path: '/messages',
      name: 'mobile-messages',
      component: () => import('./views/messages.vue'),
      meta: { title: '消息', tab: 'messages' },
    },
    {
      path: '/profile',
      name: 'mobile-profile',
      component: () => import('./views/profile.vue'),
      meta: { title: '我的', tab: 'profile' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '移动端')} · 安全管控平台`;
});

export default router;
