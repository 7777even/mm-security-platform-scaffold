// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createSubappRouter } from './subappRouter';
import {
  onWujieEvent,
  type WujieBus,
  type WujieEventMap,
  type WujieRouteQuery,
} from './wujieBridge';

function createMockBus(): WujieBus {
  const handlers = new Map<keyof WujieEventMap, Set<(d: unknown) => void>>();
  return {
    $emit(event, data) {
      handlers.get(event)?.forEach((h) => h(data));
    },
    $on(event, handler) {
      if (!handlers.get(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler as (d: unknown) => void);
    },
    $off(event, handler) {
      handlers.get(event)?.delete(handler as (d: unknown) => void);
    },
  };
}

describe('subappRouter：子应用 router.push 委托主壳', () => {
  let received: Array<{ path: string; query?: WujieRouteQuery }> = [];

  beforeEach(() => {
    received = [];
    const bus = createMockBus();
    // jsdom 提供 window.location / window.history（createWebHistory 依赖），
    // 不可整体替换 window。只在原 window 上挂 $wujie 句柄以满足 wujieBridge 类型
    Object.defineProperty(window, '$wujie', {
      configurable: true,
      value: { bus, props: {} },
    });
    onWujieEvent('route-navigate', (d) => received.push(d));
  });

  it('字符串路径直接转发', async () => {
    const router = createSubappRouter();
    await router.push('/emergency/drill');
    expect(received).toEqual([{ path: '/emergency/drill' }]);
  });

  it('{name, query} 翻译为镜像路径并透传 query', async () => {
    const router = createSubappRouter();
    await router.push({ name: 'fireAccidentRescue', query: { eventId: '42' } });
    expect(received).toEqual([{ path: '/fire/rescue', query: { eventId: '42' } }]);
  });

  it('{name, params} 拼接路径参数（productionArea → /production/area/<facilityId>）', async () => {
    const router = createSubappRouter();
    await router.push({ name: 'productionArea', params: { facilityId: 'A-101' } });
    expect(received).toEqual([{ path: '/production/area/A-101' }]);
  });

  it('{name, params, query} 同时拼接与透传', async () => {
    const router = createSubappRouter();
    await router.push({
      name: 'majorHazardDetail',
      params: { hazardId: 'MH-7' },
      query: { tab: 'video' },
    });
    expect(received).toEqual([{ path: '/production/hazards/MH-7', query: { tab: 'video' } }]);
  });

  it('动态 from：仅 {name} 命中翻译', async () => {
    const router = createSubappRouter();
    await router.push({ name: 'tvVideoWall' });
    expect(received).toEqual([{ path: '/tv/video-wall' }]);
  });

  it('带 path 的对象也透传 query', async () => {
    const router = createSubappRouter();
    await router.push({ path: '/fire/rescue', query: { eventId: '99' } });
    expect(received).toEqual([{ path: '/fire/rescue', query: { eventId: '99' } }]);
  });

  it('未注册的 name 回退到 rawPush（子应用 vue-router 会抛 MATCHER_NOT_FOUND）', async () => {
    const router = createSubappRouter();
    await expect(router.push({ name: 'notARoute' })).rejects.toThrow();
    // 未命中翻译的 push 不应触发 route-navigate（仍走原始路由）
    expect(received).toEqual([]);
  });

  it('subapp-fallback 作为子应用本地 catch-all 名称时不触发翻译（避免循环）', async () => {
    const router = createSubappRouter();
    await router.push({ name: 'subapp-fallback' });
    // subapp-fallback 是子应用 vue-router 兜底名，不应再次委托回主壳
    expect(received).toEqual([]);
  });
});
