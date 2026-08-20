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
      { id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' },
    ]);
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/dashboard');
    expect(routes[0].name).toBe('dashboard');
    expect(routes[0].meta).toMatchObject({ title: '应急指挥及演练', perm: 'dashboard:view' });
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
          { id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' },
          { id: 'fire-alarm', name: '消防报警', path: '/fire-alarm' },
        ],
      },
    ];
    const routes = buildDynamicRoutes(menus);
    expect(routes).toHaveLength(1);
    expect(routes[0].children).toHaveLength(2);
    expect(routes[0].children?.[0].meta).toMatchObject({
      title: '应急指挥及演练',
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
      { id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' },
    ]);
    expect(count).toBe(1);
    expect(router.resolve('/dashboard').name).toBe('dashboard');
  });

  it('重复装配幂等（已存在的路径不重复安装）', () => {
    const router = createTestRouter();
    const menus: MenuItem[] = [{ id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' }];
    installDynamicRoutes(router, menus);
    const second = installDynamicRoutes(router, menus);
    expect(second).toBe(0);
    expect(getInstalledMenuRoutes()).toHaveLength(1);
  });

  it('角色权限驱动动态菜单过滤：六大模块按角色可见性过滤', () => {
    const router = createTestRouter();
    installDynamicRoutes(router, DEFAULT_MENUS);
    const auth = useAuthStore();
    const { filterRoutesByPerm } = usePermission();

    // 总指挥：六模块全量可见
    auth.setRole('commander');
    let filtered = filterRoutesByPerm(getInstalledMenuRoutes());
    const names = filtered.map((r) => r.name).join(',');
    [
      'dashboard',
      'extreme-weather',
      'fire-alarm',
      'security-anti-terror',
      'industrial-video',
      'ops-monitor',
    ].forEach((n) => expect(names).toContain(n));

    // 外操：仅消防报警
    auth.setRole('operator-outer');
    filtered = filterRoutesByPerm(getInstalledMenuRoutes());
    const outer = filtered.map((r) => r.name).join(',');
    expect(outer).toContain('fire-alarm');
    expect(outer).not.toContain('dashboard');
    expect(outer).not.toContain('extreme-weather');
    expect(outer).not.toContain('security-anti-terror');
    expect(outer).not.toContain('industrial-video');
    expect(outer).not.toContain('ops-monitor');

    // 内操：应急指挥及演练 + 消防报警
    auth.setRole('operator-inner');
    filtered = filterRoutesByPerm(getInstalledMenuRoutes());
    const inner = filtered.map((r) => r.name).join(',');
    expect(inner).toContain('dashboard');
    expect(inner).toContain('fire-alarm');
    expect(inner).not.toContain('extreme-weather');
    expect(inner).not.toContain('industrial-video');
  });
});
