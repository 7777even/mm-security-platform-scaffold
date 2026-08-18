import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import {
  buildDynamicRoutes,
  installDynamicRoutes,
  getInstalledMenuRoutes,
  resetInstalledRoutes,
  DEFAULT_MENUS,
  type MenuItem,
} from '@/router/menu'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import { createPinia, setActivePinia } from 'pinia'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'layout', component: { template: '<div />' }, children: [] }],
  })
}

describe('buildDynamicRoutes：菜单契约 → 路由记录', () => {
  it('映射出 path/name/meta(title+perm)', () => {
    const routes = buildDynamicRoutes([{ id: 'dashboard', name: '综合态势', path: '/dashboard' }])
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/dashboard')
    expect(routes[0].name).toBe('dashboard')
    expect(routes[0].meta).toMatchObject({ title: '综合态势', perm: 'dashboard:view' })
  })

  it('未注册的菜单 id 被跳过（不装配无组件路由）', () => {
    const routes = buildDynamicRoutes([{ id: 'unknown-module', name: '未知', path: '/unknown' }])
    expect(routes).toHaveLength(0)
  })

  it('children 递归装配', () => {
    const menus: MenuItem[] = [
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
    const routes = buildDynamicRoutes(menus)
    expect(routes).toHaveLength(1)
    expect(routes[0].children).toHaveLength(2)
    expect(routes[0].children?.[0].meta).toMatchObject({
      title: '用户与权限',
      perm: 'system:user:view',
    })
  })
})

describe('installDynamicRoutes：装配到路由实例', () => {
  beforeEach(() => {
    resetInstalledRoutes()
    setActivePinia(createPinia())
  })

  it('装配后新路径可被路由解析', () => {
    const router = createTestRouter()
    const count = installDynamicRoutes(router, [
      { id: 'dashboard', name: '综合态势', path: '/dashboard' },
    ])
    expect(count).toBe(1)
    expect(router.resolve('/dashboard').name).toBe('dashboard')
  })

  it('重复装配幂等（已存在的路径不重复安装）', () => {
    const router = createTestRouter()
    const menus: MenuItem[] = [{ id: 'dashboard', name: '综合态势', path: '/dashboard' }]
    installDynamicRoutes(router, menus)
    const second = installDynamicRoutes(router, menus)
    expect(second).toBe(0)
    expect(getInstalledMenuRoutes()).toHaveLength(1)
  })

  it('角色权限驱动动态菜单过滤：外操无综合态势与设备编码', () => {
    const router = createTestRouter()
    installDynamicRoutes(router, DEFAULT_MENUS)
    const auth = useAuthStore()
    const { filterRoutesByPerm } = usePermission()

    // 总指挥：全量可见
    auth.setRole('commander')
    let filtered = filterRoutesByPerm(getInstalledMenuRoutes())
    const commanderNames = filtered.map((r) => r.name).join(',')
    expect(commanderNames).toContain('dashboard')
    expect(commanderNames).toContain('fire-alarm')
    expect(commanderNames).toContain('industrial-video')
    expect(commanderNames).toContain('system')

    // 切外操：仅火灾报警；无 component 的分组壳（system）因无 meta.perm 被保留但子项全过滤
    auth.setRole('operator-outer')
    filtered = filterRoutesByPerm(getInstalledMenuRoutes())
    const outerNames = filtered.map((r) => r.name).join(',')
    expect(outerNames).toContain('fire-alarm')
    expect(outerNames).not.toContain('dashboard')
    expect(outerNames).not.toContain('industrial-video')
    const systemRoute = filtered.find((r) => r.name === 'system')
    if (systemRoute) {
      // 分组壳被保留，但其子项（system-users / system-device-code）应全部被过滤
      expect(systemRoute.children).toEqual([])
    }

    // 内操：综合态势+火灾报警，无视频；system 子项仅保留无权限判定
    auth.setRole('operator-inner')
    filtered = filterRoutesByPerm(getInstalledMenuRoutes())
    const innerNames = filtered.map((r) => r.name).join(',')
    expect(innerNames).toContain('dashboard')
    expect(innerNames).toContain('fire-alarm')
    expect(innerNames).not.toContain('industrial-video')
    const innerSystem = filtered.find((r) => r.name === 'system')
    if (innerSystem) {
      // 内操无 system:* 权限，子项应全过滤
      expect(innerSystem.children).toEqual([])
    }
  })
})
