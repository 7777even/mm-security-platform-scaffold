import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, type RoleId } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import type { RouteRecordRaw } from 'vue-router'

// 测试辅助：构造最小 RouteRecordRaw（仅路径+meta），路由类型为联合类型故此处断言转换
function route(path: string, meta: RouteRecordRaw['meta']): RouteRecordRaw {
  return { path, meta } as RouteRecordRaw
}

describe('rbac-permission 能力', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('auth store：角色-权限映射', () => {
    it('默认角色为总指挥，具备 dashboard:view', () => {
      const auth = useAuthStore()
      expect(auth.hasPerm('dashboard:view')).toBe(true)
    })

    it('切换为外操后失去 dashboard:view，仍可查看 fire-alarm:view', () => {
      const auth = useAuthStore()
      auth.setRole('operator-outer')
      expect(auth.hasPerm('dashboard:view')).toBe(false)
      expect(auth.hasPerm('fire-alarm:view')).toBe(true)
    })

    it('五类角色均有权限映射且含预期权限码', () => {
      const auth = useAuthStore()
      const cases: Array<[RoleId, string, boolean]> = [
        ['commander', 'system:user:view', true],
        ['dispatcher', 'fire-alarm:ack', true],
        ['shift-leader', 'system:user:view', false],
        ['operator-inner', 'dashboard:view', true],
        ['operator-outer', 'dashboard:view', false],
      ]
      for (const [role, perm, expected] of cases) {
        auth.setRole(role)
        expect(auth.hasPerm(perm)).toBe(expected)
      }
    })
  })

  describe('usePermission：按钮级权限', () => {
    it('hasPerm 命中角色权限码返回 true', () => {
      const { hasPerm } = usePermission()
      expect(hasPerm('fire-alarm:view')).toBe(true)
    })

    it('hasPerm 未命中返回 false', () => {
      const { hasPerm } = usePermission()
      expect(hasPerm('system:user:delete')).toBe(false)
    })

    it('hasAny 任一命中返回 true', () => {
      const auth = useAuthStore()
      auth.setRole('dispatcher')
      const { hasAny } = usePermission()
      expect(hasAny(['fire-alarm:ack', 'system:user:view'])).toBe(true)
    })

    it('hasAny 全部未命中返回 false', () => {
      const auth = useAuthStore()
      auth.setRole('operator-inner')
      const { hasAny } = usePermission()
      expect(hasAny(['fire-alarm:ack', 'system:user:view'])).toBe(false)
    })

    it('切换角色后权限判断即时刷新', () => {
      const auth = useAuthStore()
      const { hasPerm } = usePermission()
      expect(hasPerm('dashboard:view')).toBe(true)
      auth.setRole('operator-outer')
      expect(hasPerm('dashboard:view')).toBe(false)
    })
  })

  describe('usePermission：动态菜单过滤', () => {
    beforeEach(() => {
      // 内操：仅 dashboard:view / fire-alarm:view，无 system:user:view 与 fire-alarm:ack
      useAuthStore().setRole('operator-inner')
    })

    it('过滤掉角色无权限的路由', () => {
      const { filterRoutesByPerm } = usePermission()
      const routes = [route('/dashboard', { perm: 'dashboard:view' }), route('/users', { perm: 'system:user:view' })]
      const filtered = filterRoutesByPerm(routes)
      expect(filtered.map((r) => r.path)).toEqual(['/dashboard'])
    })

    it('无 meta.perm 的路由保留', () => {
      const { filterRoutesByPerm } = usePermission()
      const routes = [route('/public', undefined), route('/secret', { perm: 'system:user:view' })]
      const filtered = filterRoutesByPerm(routes)
      expect(filtered.map((r) => r.path)).toEqual(['/public'])
    })

    it('递归过滤子路由', () => {
      const { filterRoutesByPerm } = usePermission()
      const routes: RouteRecordRaw[] = [
        {
          path: '/fire-alarm',
          meta: { perm: 'fire-alarm:view' },
          children: [route('/ack', { perm: 'fire-alarm:ack' }), route('/list', undefined)],
        },
      ]
      const filtered = filterRoutesByPerm(routes)
      expect(filtered[0]?.children?.map((r) => r.path)).toEqual(['/list'])
    })

    it('子路由全被过滤时父路由保留', () => {
      const { filterRoutesByPerm } = usePermission()
      const routes: RouteRecordRaw[] = [
        {
          path: '/fire-alarm',
          meta: { perm: 'fire-alarm:view' },
          children: [route('/ack', { perm: 'fire-alarm:ack' })],
        },
      ]
      const filtered = filterRoutesByPerm(routes)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.children).toEqual([])
    })
  })
})
