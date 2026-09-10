import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import {
  buildDynamicRoutes,
  installDynamicRoutes,
  getInstalledMenuRoutes,
  resetInstalledRoutes,
  DEFAULT_MENUS,
  type MenuItem,
} from '@/router/menu';
import { useAuthStore } from '@/stores/auth';
import { usePermission } from '@/composables/usePermission';
import { createPinia, setActivePinia } from 'pinia';

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'layout', component: { template: '<div />' }, children: [] }],
  });
}

describe('buildDynamicRoutes：菜单契约 → 路由记录', () => {
  it('映射出 path/name/meta(title+perm)', () => {
    const routes = buildDynamicRoutes([
      { id: 'fm-emergency', name: '应急指挥', path: '/emergency' },
    ]);
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/emergency');
    expect(routes[0].name).toBe('fm-emergency');
    expect(routes[0].meta).toMatchObject({ title: '应急指挥', perm: 'dashboard:view' });
  });

  it('未注册的菜单 id 被跳过（不装配无组件路由）', () => {
    const routes = buildDynamicRoutes([{ id: 'unknown-module', name: '未知', path: '/unknown' }]);
    expect(routes).toHaveLength(0);
  });

  it('children 递归装配', () => {
    const menus: MenuItem[] = [
      {
        id: 'emergency',
        name: '应急体系',
        path: '/emergency',
        children: [
          { id: 'fm-emergency', name: '应急指挥', path: '/emergency' },
          { id: 'fm-fire', name: '消防报警', path: '/fire' },
        ],
      },
    ];
    const routes = buildDynamicRoutes(menus);
    expect(routes).toHaveLength(1);
    expect(routes[0].children).toHaveLength(2);
    expect(routes[0].children?.[0].meta).toMatchObject({
      title: '应急指挥',
      perm: 'dashboard:view',
    });
  });
});

describe('installDynamicRoutes：装配到路由实例', () => {
  beforeEach(() => {
    resetInstalledRoutes();
    setActivePinia(createPinia());
  });

  it('装配后新路径可被路由解析', () => {
    const router = createTestRouter();
    const count = installDynamicRoutes(router, [
      { id: 'fm-emergency', name: '应急指挥', path: '/emergency' },
    ]);
    expect(count).toBe(1);
    expect(router.resolve('/emergency').name).toBe('fm-emergency');
  });

  it('重复装配幂等（已存在的路径不重复安装）', () => {
    const router = createTestRouter();
    const menus: MenuItem[] = [{ id: 'fm-emergency', name: '应急指挥', path: '/emergency' }];
    installDynamicRoutes(router, menus);
    const second = installDynamicRoutes(router, menus);
    expect(second).toBe(0);
    expect(getInstalledMenuRoutes()).toHaveLength(1);
  });

  it('管理员身份可见全部 fm 五模块（权限码由 /auth/me 下发，未授权则被守卫过滤）', () => {
    const router = createTestRouter();
    installDynamicRoutes(router, DEFAULT_MENUS);
    const auth = useAuthStore();
    const { filterRoutesByPerm } = usePermission();

    // 模拟后端 /auth/me 下发的管理员权限快照（覆盖五个 fm-* 路由的 meta.perm）
    auth.setMe({
      username: 'admin',
      realName: '系统管理员',
      role: 'ADMIN',
      roles: ['ADMIN'],
      perms: ['dashboard:view', 'fire-alarm:view', 'security:view', 'video:view', 'ops:view'],
      mustChangePwd: false,
    });
    const filtered = filterRoutesByPerm(getInstalledMenuRoutes());
    const names = filtered.map((r) => r.name).join(',');
    ['fm-emergency', 'fm-fire', 'fm-security', 'fm-tv', 'fm-production'].forEach((n) =>
      expect(names).toContain(n),
    );
  });
});
