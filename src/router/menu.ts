import type { Router, RouteRecordRaw, RouteComponent } from 'vue-router';
import type { Component } from 'vue';
import { DataBoard, Warning, VideoCamera, Cloudy, Lock, Cpu } from '@element-plus/icons-vue';
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

export const MENU_ROUTE_SPECS: Record<string, MenuRouteSpec> = {
  dashboard: {
    title: '应急指挥及演练',
    perm: 'dashboard:view',
    icon: DataBoard,
    // wujie-shell 试点：dashboard 作为首个子应用，经 WujieHost 挂载
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    // 同源路径：与主壳同一 Vite 服务(5173)托管，wujie 要求子应用与主应用同源
    subappUrl: import.meta.env.VITE_DASHBOARD_SUBAPP_URL ?? '/subapps/dashboard/',
  },
  'extreme-weather': {
    title: '极端天气风险应急',
    perm: 'weather:view',
    icon: Cloudy,
    component: () => import('@/views/extreme-weather/index.vue').then((m) => m.default),
  },
  'fire-alarm': {
    title: '消防报警',
    perm: 'fire-alarm:view',
    icon: Warning,
    // wujie-shell：作为子应用经 WujieHost 挂载，复用主壳下发的设计 token
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FIRE_ALARM_SUBAPP_URL ?? '/subapps/fire-alarm/',
  },
  'security-anti-terror': {
    title: '治安防恐',
    perm: 'security:view',
    icon: Lock,
    // wujie-shell：作为子应用经 WujieHost 挂载，复用主壳下发的设计 token
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl:
      import.meta.env.VITE_SECURITY_ANTI_TERROR_SUBAPP_URL ?? '/subapps/security-anti-terror/',
  },
  'industrial-video': {
    title: '工业电视视频墙',
    perm: 'video:view',
    icon: VideoCamera,
    // wujie-shell：作为子应用经 WujieHost 挂载，复用主壳下发的设计 token
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_INDUSTRIAL_VIDEO_SUBAPP_URL ?? '/subapps/industrial-video/',
  },
  'ops-monitor': {
    title: '运维监测',
    perm: 'ops:view',
    icon: Cpu,
    component: () => import('@/views/ops-monitor/index.vue').then((m) => m.default),
  },
};

// 降级默认菜单：mock/后端菜单不可达时装配，保证不白屏（对齐六大业务模块原型）
export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' },
  { id: 'extreme-weather', name: '极端天气风险应急', path: '/extreme-weather' },
  { id: 'fire-alarm', name: '消防报警', path: '/fire-alarm' },
  { id: 'security-anti-terror', name: '治安防恐', path: '/security-anti-terror' },
  { id: 'industrial-video', name: '工业电视视频墙', path: '/industrial-video' },
  { id: 'ops-monitor', name: '运维监测', path: '/ops-monitor' },
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
