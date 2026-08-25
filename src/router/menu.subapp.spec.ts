import { describe, it, expect } from 'vitest';
import { buildDynamicRoutes, MENU_ROUTE_SPECS } from '@/router/menu';

describe('dashboard 路由 → wujie 子应用挂载映射', () => {
  it('dashboard 菜单规格携带 subappUrl 与 subapp 标记', () => {
    const spec = MENU_ROUTE_SPECS['dashboard'];
    expect(spec).toBeDefined();
    expect(spec!.subapp).toBe(true);
    expect(typeof spec!.subappUrl).toBe('string');
    // 同源相对路径（wujie 要求子应用与主应用同源；dev 由单 Vite server 托管 /subapps/dashboard/）
    expect(spec!.subappUrl ?? '').toMatch(/^\/subapps\//);
  });

  it('buildDynamicRoutes 将 subappUrl/subapp 透传到路由 meta', () => {
    const routes = buildDynamicRoutes([
      { id: 'dashboard', name: '应急指挥及演练', path: '/dashboard' },
    ]);
    expect(routes[0].meta).toMatchObject({
      title: '应急指挥及演练',
      perm: 'dashboard:view',
      subapp: true,
    });
    expect(typeof routes[0].meta?.subappUrl).toBe('string');
  });

  it('dashboard 路由组件为懒加载函数（WujieHost）', () => {
    const spec = MENU_ROUTE_SPECS['dashboard'];
    expect(typeof spec!.component).toBe('function');
  });
});
