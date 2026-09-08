import type { Router, RouteRecordRaw, RouteComponent } from 'vue-router';
import type { Component } from 'vue';
import { DataBoard, Warning, VideoCamera, Lock, OfficeBuilding } from '@element-plus/icons-vue';
import { logger } from '@/utils/logger';

// B3 AUTH-05 菜单契约（GET /auth/menus）返回的菜单项；id 与前端路由 name/权限码对齐
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  children?: MenuItem[];
}

// 菜单 id → 前端装配信息（组件懒加载 + 标题 + 权限码 + 导航图标）
// T7 后端契约到位后若菜单自带 component/perm 字段，仅需改此映射或 adapter
interface MenuRouteSpec {
  title: string;
  perm: string;
  component: () => Promise<RouteComponent>;
  icon: Component;
  /** wujie-shell：是否为子应用挂载（true 时主内容经 WujieHost 装载） */
  subapp?: boolean;
  /** wujie-shell：子应用入口地址，由主壳 WujieHost 读取 */
  subappUrl?: string;
}

// 顶栏六大业务模块 Tab（文案对齐《安全管控指挥系统》大屏原型：
//   应急指挥 / 消防报警 / 安全防恐 / 工业电视 / 生产应急 / 预警中心）
// id 与 subapps/* 子应用目录一一对应；title 为原型 Tab 展示名。
export const MENU_ROUTE_SPECS: Record<string, MenuRouteSpec> = {
  // —— fire-monitoring 迁移子应用（fm-*）：默认菜单指向；旧 6 子应用保留可经 env 指回 ——
  'fm-emergency': {
    title: '应急指挥',
    perm: 'dashboard:view',
    icon: DataBoard,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_EMERGENCY_SUBAPP_URL ?? '/subapps/fm-emergency/',
  },
  'fm-fire': {
    title: '消防报警',
    perm: 'fire-alarm:view',
    icon: Warning,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_FIRE_SUBAPP_URL ?? '/subapps/fm-fire/',
  },
  'fm-security': {
    title: '治安防恐',
    perm: 'security:view',
    icon: Lock,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_SECURITY_SUBAPP_URL ?? '/subapps/fm-security/',
  },
  'fm-tv': {
    title: '工业电视',
    perm: 'video:view',
    icon: VideoCamera,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_TV_SUBAPP_URL ?? '/subapps/fm-tv/',
  },
  'fm-production': {
    title: '生产应急',
    perm: 'ops:view',
    icon: OfficeBuilding,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_PRODUCTION_SUBAPP_URL ?? '/subapps/fm-production/',
  },
  // 注：fm-rescue / fm-typhoon / fm-production-area / fm-major-hazard / fm-communication /
  // fm-video-control / fm-video-wall 这 7 个子应用不进顶部导航，其路由由 router/index.ts
  // 的 SECONDARY_ROUTES 二级隐藏路由承载（WujieHost 挂载对应 /subapps/fm-*），故此处不列。
};

// 降级默认菜单：fm-*（fire-monitoring 迁移版大屏）；旧 6 子应用保留在 MENU_ROUTE_SPECS，
// 菜单不可达时装配以下五项（对齐源项目 navItems：预警中心源项目无页面，暂不设项）
export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'fm-emergency', name: '应急指挥', path: '/emergency' },
  { id: 'fm-fire', name: '消防报警', path: '/fire' },
  { id: 'fm-security', name: '治安防恐', path: '/security' },
  { id: 'fm-tv', name: '工业电视', path: '/tv' },
  { id: 'fm-production', name: '生产应急', path: '/production' },
];

// 菜单 → 路由记录（递归；未注册 id 跳过并告警，避免装配无组件路由）
export function buildDynamicRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];
  for (const menu of menus) {
    const spec = MENU_ROUTE_SPECS[menu.id];
    if (spec) {
      result.push({
        path: menu.path,
        name: menu.id,
        component: spec.component,
        meta: {
          title: spec.title,
          perm: spec.perm,
          icon: spec.icon,
          subapp: spec.subapp ?? false,
          subappUrl: spec.subappUrl,
        },
        children: menu.children ? buildDynamicRoutes(menu.children) : undefined,
      });
    } else if (menu.children && menu.children.length > 0) {
      // 无组件但有子菜单：生成分组壳路由（如 system 分组）
      const children = buildDynamicRoutes(menu.children);
      if (children.length > 0) {
        result.push({ path: menu.path, name: menu.id, meta: { title: menu.name }, children });
      }
    } else {
      logger.warn(`[menu] 未注册菜单 id 已跳过: ${menu.id}`);
    }
  }
  return result;
}

// 已装配菜单路由快照（供 AppLayout 菜单渲染复用，避免读 router.options 静态路由）
let installedRoutes: RouteRecordRaw[] = [];

export function getInstalledMenuRoutes(): RouteRecordRaw[] {
  return installedRoutes;
}

/** 清空装配快照（HMR/测试场景） */
export function resetInstalledRoutes(): void {
  installedRoutes = [];
}

/**
 * 将菜单装配到指定父路由（默认 layout）的 children 下。
 * 幂等：按路由 name 去重，已存在的路径不重复安装。
 * @returns 本次新增装配数
 */
export function installDynamicRoutes(
  router: Router,
  menus: MenuItem[],
  parentName = 'layout',
): number {
  const routes = buildDynamicRoutes(menus);
  const existing = new Set(router.getRoutes().map((r) => r.name));
  let count = 0;
  for (const route of routes) {
    if (route.name && existing.has(route.name)) continue;
    router.addRoute(parentName, route);
    count += 1;
  }
  installedRoutes = routes;
  return count;
}
