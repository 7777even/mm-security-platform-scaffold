import { createRouter, createWebHistory } from 'vue-router';
import { mgmtMenus, mgmtLeafByPath } from '@/data/mgmtMenus';
import type { RouteRecordRaw } from 'vue-router';

// 后台独立入口路由（与主壳一致使用 history 模式，base 指向子路径）。
// dev 访问路径：/apps/mgmt/（多入口构建，见 vite.config.ts rollupOptions.input）。
// - dev：vite.config.ts 的 appsHtmlFallback 中间件把 /apps/mgmt/* 回退到本入口 index.html；
// - 生产：网关需为 /apps/mgmt/* 配置 rewrite → /apps/mgmt/index.html（与主壳回退规则同理）。

// 已接后端的系统管理页路径：显式指向服务驱动视图（优先于数据驱动的 module-embed 兜底页）。
// 其余叶子仍统一走 module-embed.vue（原型 iframe / 静态数据兜底），后续按域逐步接入。
const SERVICE_PATHS = ['/staff-mgmt', '/role-mgmt', '/dict-mgmt', '/audit-log', '/area-config'];

function routeMeta(path: string, fallbackTitle: string) {
  const leaf = mgmtLeafByPath[path];
  return {
    title: leaf?.name ?? fallbackTitle,
    group: leaf?.group ?? '',
    groupKey: leaf?.groupKey ?? '',
  };
}

// 服务驱动路由（先行注册，确保静态路径命中真实页面）。
const serviceRoutes: RouteRecordRaw[] = [
  {
    path: '/staff-mgmt',
    component: () => import('./views/system/StaffView.vue'),
    meta: routeMeta('/staff-mgmt', '人员与账号管理'),
  },
  {
    path: '/role-mgmt',
    component: () => import('./views/system/RoleView.vue'),
    meta: routeMeta('/role-mgmt', '角色与权限管理'),
  },
  {
    path: '/dict-mgmt',
    component: () => import('./views/system/DictView.vue'),
    meta: routeMeta('/dict-mgmt', '字典管理'),
  },
  {
    path: '/audit-log',
    component: () => import('./views/system/AuditView.vue'),
    meta: routeMeta('/audit-log', '审计日志管理'),
  },
  {
    path: '/area-config',
    component: () => import('./views/system/AreaView.vue'),
    meta: routeMeta('/area-config', '茂名石化厂区配置'),
  },
];

// 数据驱动兜底路由：未接入后端能力的叶子走 module-embed.vue
// （原型页命中 → iframe 嵌入 public/pc-admin；/form → 流程填报向导；否则 module.vue 静态页）。
const moduleRoutes: RouteRecordRaw[] = mgmtMenus.flatMap((g) =>
  g.children
    .filter((c) => !SERVICE_PATHS.includes(c.path))
    .map((c) => ({
      path: c.path,
      component: () => import('./views/module-embed.vue'),
      meta: { title: c.name, group: g.title, groupKey: g.key },
    })),
);

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
      // 流程填报向导（mgmtWorkbenchLinks 顶层入口，不在菜单分组内）
      path: '/form',
      name: 'mgmt-form-wizard',
      component: () => import('./views/module-embed.vue'),
      meta: { title: '流程填报' },
    },
    ...serviceRoutes,
    ...moduleRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/workbench' },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '管理后台')} · 安全管控平台`;
});

export default router;
