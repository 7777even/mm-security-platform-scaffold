import type { Router, RouteRecordRaw, RouteComponent } from 'vue-router'
import { logger } from '@/utils/logger'

// B3 AUTH-05 菜单契约（GET /auth/menus）返回的菜单项；id 与前端路由 name/权限码对齐
export interface MenuItem {
  id: string
  name: string
  path: string
  children?: MenuItem[]
}

// 菜单 id → 前端装配信息（组件懒加载 + 标题 + 权限码）
// T7 后端契约到位后若菜单自带 component/perm 字段，仅需改此映射或 adapter
interface MenuRouteSpec {
  title: string
  perm: string
  component: () => Promise<RouteComponent>
}

const MENU_ROUTE_SPECS: Record<string, MenuRouteSpec> = {
  dashboard: {
    title: '综合态势',
    perm: 'dashboard:view',
    component: () => import('@/views/dashboard/index.vue').then((m) => m.default),
  },
  'fire-alarm': {
    title: '火灾报警',
    perm: 'fire-alarm:view',
    component: () => import('@/views/fire-alarm/index.vue').then((m) => m.default),
  },
  'industrial-video': {
    title: '工业视频',
    perm: 'video:view',
    component: () => import('@/views/industrial-video/index.vue').then((m) => m.default),
  },
  'system-users': {
    title: '用户与权限',
    perm: 'system:user:view',
    component: () => import('@/views/system/users.vue').then((m) => m.default),
  },
  'system-device-code': {
    title: '设备编码',
    perm: 'system:device-code:view',
    component: () => import('@/views/system/deviceCode.vue').then((m) => m.default),
  },
}

// 降级默认菜单：mock/后端菜单不可达时装配，保证不白屏（对齐当前页面集）
export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'dashboard', name: '综合态势', path: '/dashboard' },
  { id: 'fire-alarm', name: '火灾报警', path: '/fire-alarm' },
  { id: 'industrial-video', name: '工业视频', path: '/industrial-video' },
  {
    id: 'system',
    name: '系统管理',
    path: '/system',
    children: [
      { id: 'system-users', name: '用户与权限', path: '/system/users' },
      { id: 'system-device-code', name: '设备编码', path: '/system/device-code' },
    ],
  },
]

// 菜单 → 路由记录（递归；未注册 id 跳过并告警，避免装配无组件路由）
export function buildDynamicRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []
  for (const menu of menus) {
    const spec = MENU_ROUTE_SPECS[menu.id]
    if (spec) {
      result.push({
        path: menu.path,
        name: menu.id,
        component: spec.component,
        meta: { title: spec.title, perm: spec.perm },
        children: menu.children ? buildDynamicRoutes(menu.children) : undefined,
      })
    } else if (menu.children && menu.children.length > 0) {
      // 无组件但有子菜单：生成分组壳路由（如 system 分组）
      const children = buildDynamicRoutes(menu.children)
      if (children.length > 0) {
        result.push({ path: menu.path, name: menu.id, meta: { title: menu.name }, children })
      }
    } else {
      logger.warn(`[menu] 未注册菜单 id 已跳过: ${menu.id}`)
    }
  }
  return result
}

// 已装配菜单路由快照（供 AppLayout 菜单渲染复用，避免读 router.options 静态路由）
let installedRoutes: RouteRecordRaw[] = []

export function getInstalledMenuRoutes(): RouteRecordRaw[] {
  return installedRoutes
}

/** 清空装配快照（HMR/测试场景） */
export function resetInstalledRoutes(): void {
  installedRoutes = []
}

/**
 * 将菜单装配到指定父路由（默认 layout）的 children 下。
 * 幂等：按路由 name 去重，已存在的路径不重复安装。
 * @returns 本次新增装配数
 */
export function installDynamicRoutes(router: Router, menus: MenuItem[], parentName = 'layout'): number {
  const routes = buildDynamicRoutes(menus)
  const existing = new Set(router.getRoutes().map((r) => r.name))
  let count = 0
  for (const route of routes) {
    if (route.name && existing.has(route.name)) continue
    router.addRoute(parentName, route)
    count += 1
  }
  installedRoutes = routes
  return count
}
