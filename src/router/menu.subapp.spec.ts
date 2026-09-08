import { describe, it, expect } from 'vitest';
import { buildDynamicRoutes, MENU_ROUTE_SPECS, DEFAULT_MENUS } from '@/router/menu';

describe('fm 子应用 → wujie 挂载映射', () => {
  const fmIds = ['fm-emergency', 'fm-fire', 'fm-security', 'fm-tv', 'fm-production'] as const;

  it('每个 fm 菜单规格携带 subappUrl 与 subapp 标记', () => {
    for (const id of fmIds) {
      const spec = MENU_ROUTE_SPECS[id];
      expect(spec).toBeDefined();
      expect(spec!.subapp).toBe(true);
      expect(spec!.subappUrl ?? '').toMatch(/^\/subapps\/fm-/);
    }
  });

  it('buildDynamicRoutes 将 subappUrl/subapp 透传到路由 meta', () => {
    const routes = buildDynamicRoutes([{ id: 'fm-fire', name: '消防报警', path: '/fire' }]);
    expect(routes[0].meta).toMatchObject({
      title: '消防报警',
      perm: 'fire-alarm:view',
      subapp: true,
    });
    expect(typeof routes[0].meta?.subappUrl).toBe('string');
  });

  it('fm 菜单组件均为懒加载函数（WujieHost）', () => {
    for (const id of fmIds) {
      expect(MENU_ROUTE_SPECS[id]!.component.toString()).toContain('WujieHost');
    }
  });
});

describe('fm 子应用菜单接管（fire-monitoring 迁移）', () => {
  it('fm 子应用菜单条目指向 /subapps/fm-* 且默认菜单切换为 fm 五项', () => {
    expect(MENU_ROUTE_SPECS['fm-emergency'].subappUrl).toBe('/subapps/fm-emergency/');
    expect(MENU_ROUTE_SPECS['fm-fire'].subappUrl).toBe('/subapps/fm-fire/');
    expect(MENU_ROUTE_SPECS['fm-security'].subappUrl).toBe('/subapps/fm-security/');
    expect(MENU_ROUTE_SPECS['fm-tv'].subappUrl).toBe('/subapps/fm-tv/');
    expect(MENU_ROUTE_SPECS['fm-production'].subappUrl).toBe('/subapps/fm-production/');
    expect(DEFAULT_MENUS.map((m) => m.id)).toEqual([
      'fm-emergency',
      'fm-fire',
      'fm-security',
      'fm-tv',
      'fm-production',
    ]);
  });
});
