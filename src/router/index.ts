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
  {
    path: '/emergency/drill',
    name: 'fm-drill',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '应急演练详情',
      perm: 'dashboard:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-rescue/',
    },
  },
  {
    path: '/emergency/typhoon',
    name: 'fm-typhoon',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '台风应急详情',
      perm: 'dashboard:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-typhoon/',
    },
  },
  {
    path: '/fire/rescue',
    name: 'fm-fire-rescue',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '事故应急救援',
      perm: 'fire-alarm:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-rescue/',
    },
  },
  {
    path: '/production/area/:facilityId',
    name: 'fm-production-area',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '生产区域详情',
      perm: 'ops:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-production-area/',
    },
  },
  {
    path: '/production/hazards',
    name: 'fm-major-hazard-list',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '重大危险源',
      perm: 'ops:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-major-hazard/',
    },
  },
  {
    path: '/production/hazards/:hazardId',
    name: 'fm-major-hazard-detail',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '重大危险源详情',
      perm: 'ops:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-major-hazard/',
    },
  },
  {
    path: '/production/communication',
    name: 'fm-communication',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '生产通信',
      perm: 'ops:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-communication/',
    },
  },
  {
    path: '/tv/video-control',
    name: 'fm-video-control',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '视频控制平台',
      perm: 'video:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-video-control/',
    },
  },
  {
    path: '/tv/video-wall',
    name: 'fm-video-wall',
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    meta: {
      title: '视频墙',
      perm: 'video:view',
      hidden: true,
      subapp: true,
      subappUrl: '/subapps/fm-video-wall/',
    },
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/fire',
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
