import { createRouter, createWebHistory } from 'vue-router';

// 移动端独立入口路由（与主壳/后台一致使用 history 模式，base 指向子路径）。
// dev 访问路径：/apps/mobile/（多入口构建，见 vite.config.ts rollupOptions.input）。
// - dev：vite.config.ts 的 appsHtmlFallback 中间件把 /apps/mobile/* 回退到本入口 index.html；
// - 生产：网关需为 /apps/mobile/* 配置 rewrite → /apps/mobile/index.html（同 /apps/mgmt 规则）；
// - 原生壳（hybrid）内嵌时由原生 WebView 直接加载本入口（静态资源同源部署，无跨域问题）。
//
// ui-redesign 迁移（2026-08）：页面集合对齐参考项目移动端 35 个路由。
// - meta.tab 标记「主界面级」页面（首页/消息/我的），布局壳据此决定是否渲染底部标签栏；
//   列表页 / 详情页 / 流程页不带 tab，流程页改用底部主操作条（.mb-safe-bar）。
// - meta.title 统一驱动 document.title，页面内不必再各写一遍。
const router = createRouter({
  history: createWebHistory('/apps/mobile/'),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/login',
      name: 'mobile-login',
      component: () => import('./views/login.vue'),
      meta: { title: '登录' },
    },

    // ---- 主界面级（带底部标签栏）----
    {
      path: '/home',
      name: 'mobile-home',
      component: () => import('./views/home.vue'),
      meta: { title: '首页', tab: 'home' },
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

    // ---- 消息 ----
    {
      path: '/messages/history',
      name: 'mobile-message-history',
      component: () => import('./views/messageHistory.vue'),
      meta: { title: '通知历史' },
    },

    // ---- 任务 ----
    {
      path: '/tasks',
      name: 'mobile-tasks',
      component: () => import('./views/tasks.vue'),
      meta: { title: '任务中心' },
    },
    {
      path: '/tasks/:id',
      name: 'mobile-task-detail',
      component: () => import('./views/task-detail.vue'),
      meta: { title: '任务详情' },
    },
    {
      path: '/path',
      name: 'mobile-path-nav',
      component: () => import('./views/path-nav.vue'),
      meta: { title: '任务路径规划' },
    },

    // ---- 报警 ----
    {
      path: '/alarms',
      name: 'mobile-alarms',
      component: () => import('./views/alarms.vue'),
      meta: { title: '告警明细' },
    },
    {
      path: '/alarms/:id',
      name: 'mobile-alarm-detail',
      component: () => import('./views/alarm-detail.vue'),
      meta: { title: '告警详情' },
    },
    {
      path: '/map',
      name: 'mobile-map',
      component: () => import('./views/map.vue'),
      meta: { title: '报警态势地图' },
    },

    // ---- 应急事件 ----
    {
      path: '/events',
      name: 'mobile-events',
      component: () => import('./views/events.vue'),
      meta: { title: '应急事件' },
    },
    {
      path: '/events/:id',
      name: 'mobile-event-detail',
      component: () => import('./views/event-detail.vue'),
      meta: { title: '事件详情' },
    },
    {
      path: '/event-resources',
      name: 'mobile-event-resources',
      component: () => import('./views/event-resources.vue'),
      meta: { title: '周边应急资源' },
    },

    // ---- 防火巡查 / 异常 ----
    {
      path: '/patrols',
      name: 'mobile-patrols',
      component: () => import('./views/patrols.vue'),
      meta: { title: '日常防火巡查' },
    },
    {
      path: '/patrol-exec',
      name: 'mobile-patrol-exec',
      component: () => import('./views/patrol-exec.vue'),
      meta: { title: '巡查执行' },
    },
    {
      path: '/anomalies',
      name: 'mobile-anomalies',
      component: () => import('./views/anomalies.vue'),
      meta: { title: '异常管理' },
    },

    // ---- 工单 / 操作票 ----
    {
      path: '/orders',
      name: 'mobile-orders',
      component: () => import('./views/orders.vue'),
      meta: { title: '报修工单' },
    },
    {
      path: '/orders/:id',
      name: 'mobile-order-detail',
      component: () => import('./views/order-detail.vue'),
      meta: { title: '工单详情' },
    },
    {
      path: '/tickets',
      name: 'mobile-tickets',
      component: () => import('./views/tickets.vue'),
      meta: { title: '操作票' },
    },
    {
      path: '/ticket-exec',
      name: 'mobile-ticket-exec',
      component: () => import('./views/ticket-exec.vue'),
      meta: { title: '操作票执行' },
    },

    // ---- 监测 / 视频 ----
    {
      path: '/ops',
      name: 'mobile-ops-board',
      component: () => import('./views/ops-board.vue'),
      meta: { title: '运维监测看板' },
    },
    {
      path: '/videos',
      name: 'mobile-videos',
      component: () => import('./views/videos.vue'),
      meta: { title: '视频监控' },
    },
    {
      path: '/videos/:id',
      name: 'mobile-video-player',
      component: () => import('./views/video-player.vue'),
      meta: { title: '视频播放' },
    },

    // ---- 演练 / 预案 / 知识 ----
    {
      path: '/drills',
      name: 'mobile-drills',
      component: () => import('./views/drills.vue'),
      meta: { title: '演练信息' },
    },
    {
      path: '/drills/:id',
      name: 'mobile-drill-detail',
      component: () => import('./views/drill-detail.vue'),
      meta: { title: '演练详情' },
    },
    {
      path: '/plans',
      name: 'mobile-plans',
      component: () => import('./views/plans.vue'),
      meta: { title: '应急预案' },
    },
    {
      path: '/plans/:id',
      name: 'mobile-plan-detail',
      component: () => import('./views/plan-detail.vue'),
      meta: { title: '预案详情' },
    },
    {
      path: '/msds',
      name: 'mobile-msds',
      component: () => import('./views/msds.vue'),
      meta: { title: '化学品知识 MSDS' },
    },
    {
      path: '/msds/:cas',
      name: 'mobile-msds-detail',
      component: () => import('./views/msds-detail.vue'),
      meta: { title: 'MSDS 详情' },
    },
    {
      path: '/library',
      name: 'mobile-library',
      component: () => import('./views/library.vue'),
      meta: { title: '辅助资料库' },
    },

    // ---- 资源 / 通讯 / 值班 / 设置 ----
    {
      path: '/resources',
      name: 'mobile-resources',
      component: () => import('./views/resources.vue'),
      meta: { title: '应急资源' },
    },
    {
      path: '/contacts',
      name: 'mobile-contacts',
      component: () => import('./views/contacts.vue'),
      meta: { title: '通讯录' },
    },
    {
      path: '/duty',
      name: 'mobile-duty',
      component: () => import('./views/duty.vue'),
      meta: { title: '今日值班' },
    },
    {
      path: '/settings',
      name: 'mobile-settings',
      component: () => import('./views/settings.vue'),
      meta: { title: '系统设置' },
    },

    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '移动端')} · 安全管控平台`;
});

export default router;
