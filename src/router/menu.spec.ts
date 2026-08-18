import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import {
  buildDynamicRoutes,
  installDynamicRoutes,
  getInstalledMenuRoutes,
  resetInstalledRoutes,
  type MenuItem,
} from '@/router/menu'

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
  beforeEach(() => resetInstalledRoutes())

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
})
