import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { usePermission } from '@/composables/usePermission';
import type { RouteRecordRaw } from 'vue-router';

// 测试辅助：构造最小 RouteRecordRaw（仅路径+meta），路由类型为联合类型故此处断言转换
function route(path: string, meta: RouteRecordRaw['meta']): RouteRecordRaw {
  return { path, meta } as RouteRecordRaw;
}

describe('rbac-permission 能力（脚手架阶段：单一管理员身份，授予全部权限）', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('auth store：管理员权限', () => {
    it('默认身份为管理员，具备 dashboard:view', () => {
      const auth = useAuthStore();
      expect(auth.hasPerm('dashboard:view')).toBe(true);
    });

    it('管理员具备全部模块权限（含 fire-alarm:ack / system:user:view）', () => {
      const auth = useAuthStore();
      expect(auth.hasPerm('fire-alarm:ack')).toBe(true);
      expect(auth.hasPerm('system:user:view')).toBe(true);
    });
  });

  describe('usePermission：按钮级权限', () => {
    it('hasPerm 命中权限码返回 true', () => {
      const { hasPerm } = usePermission();
      expect(hasPerm('fire-alarm:view')).toBe(true);
    });

    it('hasPerm 未命中返回 false', () => {
      const { hasPerm } = usePermission();
      expect(hasPerm('system:user:delete')).toBe(false);
    });

    it('hasAny 任一命中返回 true', () => {
      const { hasAny } = usePermission();
      expect(hasAny(['fire-alarm:ack', 'system:user:view'])).toBe(true);
    });

    it('hasAny 全部未命中返回 false', () => {
      const { hasAny } = usePermission();
      expect(hasAny(['system:user:delete', 'unknown:perm'])).toBe(false);
    });
  });

  describe('usePermission：动态菜单过滤', () => {
    it('保留全部有权限路由（管理员授予全部权限）', () => {
      const { filterRoutesByPerm } = usePermission();
      const routes = [
        route('/dashboard', { perm: 'dashboard:view' }),
        route('/users', { perm: 'system:user:view' }),
      ];
      const filtered = filterRoutesByPerm(routes);
      expect(filtered.map((r) => r.path)).toEqual(['/dashboard', '/users']);
    });

    it('无 meta.perm 的路由保留，无权限路由被过滤', () => {
      const { filterRoutesByPerm } = usePermission();
      const routes = [
        route('/public', undefined),
        route('/secret', { perm: 'system:user:delete' }),
      ];
      const filtered = filterRoutesByPerm(routes);
      expect(filtered.map((r) => r.path)).toEqual(['/public']);
    });

    it('递归过滤子路由', () => {
      const { filterRoutesByPerm } = usePermission();
      const routes: RouteRecordRaw[] = [
        {
          path: '/fire-alarm',
          meta: { perm: 'fire-alarm:view' },
          children: [route('/ack', { perm: 'system:user:delete' }), route('/list', undefined)],
        },
      ];
      const filtered = filterRoutesByPerm(routes);
      expect(filtered[0]?.children?.map((r) => r.path)).toEqual(['/list']);
    });

    it('子路由全被过滤时父路由保留', () => {
      const { filterRoutesByPerm } = usePermission();
      const routes: RouteRecordRaw[] = [
        {
          path: '/fire-alarm',
          meta: { perm: 'fire-alarm:view' },
          children: [route('/ack', { perm: 'system:user:delete' })],
        },
      ];
      const filtered = filterRoutesByPerm(routes);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.children).toEqual([]);
    });
  });
});
