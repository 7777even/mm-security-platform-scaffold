import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { mark, measure } from '@/utils/perf';
import { recordPerf } from '@/utils/perf-budget';
import { reportAudit } from '@/services/audit';

// 静态仅保留布局壳与 404；页面路由由 /auth/menus 动态装配（B3 AUTH-05）
// mock 菜单不可达时降级装配 DEFAULT_MENUS（menu.ts），保证不白屏
// 二级页面（hidden）：不进顶部导航，由一级页面「更多/查看全部」跳转进入。
// 权限码沿用 RBAC 表（ROLE_PERMS），守卫自动校验 meta.perm。
const SECONDARY_ROUTES: RouteRecordRaw[] = [
  {
    path: '/fire-alarm/records',
    name: 'fire-alarm-records',
    component: () => import('@/views/fire-alarm/records.vue'),
    meta: { title: '消防报警记录', perm: 'fire-alarm:view', hidden: true },
  },
  {
    path: '/dashboard/plans',
    name: 'dashboard-plans',
    component: () => import('@/views/dashboard/plans.vue'),
    meta: { title: '应急预案库', perm: 'dashboard:view', hidden: true },
  },
  {
    path: '/security-anti-terror/records',
    name: 'security-anti-terror-records',
    component: () => import('@/views/security-anti-terror/records.vue'),
    meta: { title: '门禁事件记录', perm: 'security:view', hidden: true },
  },
  {
    path: '/system/users',
    name: 'system-users',
    component: () => import('@/views/system/users.vue'),
    meta: { title: '用户与权限', perm: 'system:user:view', hidden: true },
  },
  {
    path: '/system/device-code',
    name: 'system-device-code',
    component: () => import('@/views/system/deviceCode.vue'),
    meta: { title: '设备编码解析', perm: 'system:device-code:view', hidden: true },
  },
  {
    path: '/mobile/field-report',
    name: 'mobile-field-report',
    component: () => import('@/views/mobile/fieldReport.vue'),
    meta: { title: '现场采集回传', perm: 'mobile:field-report:view', hidden: true },
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [...SECONDARY_ROUTES],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

// 全局权限守卫：未授权路由直接访问亦被拦截（rbac-permission spec §动态路由与菜单权限）
router.beforeEach(async (to) => {
  mark('nav:start');
  const perm = to.meta.perm as string | undefined;
  if (perm) {
    const { useAuthStore } = await import('@/stores/auth');
    const auth = useAuthStore();
    if (!auth.hasPerm(perm)) return { name: 'not-found' };
  }
  return true;
});

// 功能窗口切换耗时（D1 P8 ≤2s 基线）+ 路由查看审计埋点（C-2）
router.afterEach((to) => {
  const ms = measure('nav', 'nav:start');
  if (ms != null) recordPerf('functionWindowMs', ms);
  reportAudit({ action: 'route-view', module: String(to.name ?? to.path) });
});

export default router;
