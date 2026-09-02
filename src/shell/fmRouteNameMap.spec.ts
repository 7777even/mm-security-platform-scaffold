import { describe, it, expect } from 'vitest';
import {
  resolveDelegatedLocation,
  serializeParamPath,
  FM_SOURCE_ROUTE_TO_SHELL_PATH,
} from './fmRouteNameMap';

describe('fmRouteNameMap：子应用 router.push 目标 → 主壳 path 翻译', () => {
  it('字符串目标直接作为 path 委托', () => {
    expect(resolveDelegatedLocation('/emergency/drill')).toEqual({ path: '/emergency/drill' });
  });

  it('{ path, query } 直接透传 path 与 query', () => {
    expect(resolveDelegatedLocation({ path: '/fire/rescue', query: { eventId: '42' } })).toEqual({
      path: '/fire/rescue',
      query: { eventId: '42' },
    });
  });

  it('{ name } 已知源路由名翻译为对应镜像路径', () => {
    expect(resolveDelegatedLocation({ name: 'fireAccidentRescue' })).toEqual({
      path: '/fire/rescue',
    });
    expect(resolveDelegatedLocation({ name: 'drillEmergencyDetail' })).toEqual({
      path: '/emergency/drill',
    });
    expect(resolveDelegatedLocation({ name: 'typhoonEmergencyDetail' })).toEqual({
      path: '/emergency/typhoon',
    });
    expect(resolveDelegatedLocation({ name: 'tvVideoWall' })).toEqual({ path: '/tv/video-wall' });
    expect(resolveDelegatedLocation({ name: 'tvVideoControl' })).toEqual({
      path: '/tv/video-control',
    });
    expect(resolveDelegatedLocation({ name: 'majorHazardList' })).toEqual({
      path: '/production/hazards',
    });
    expect(resolveDelegatedLocation({ name: 'majorHazardDetail' })).toEqual({
      path: '/production/hazards/:hazardId',
    });
  });

  it('{ name, params } 序列化路径参数占位（:facilityId / :hazardId）', () => {
    expect(
      resolveDelegatedLocation({ name: 'productionArea', params: { facilityId: 'A-101' } }),
    ).toEqual({ path: '/production/area/A-101' });
    expect(
      resolveDelegatedLocation({ name: 'majorHazardDetail', params: { hazardId: 'MH-7' } }),
    ).toEqual({ path: '/production/hazards/MH-7' });
  });

  it('{ name, params, query } 路径参数替换并透传 query', () => {
    expect(
      resolveDelegatedLocation({
        name: 'majorHazardDetail',
        params: { hazardId: 'MH-7' },
        query: { tab: 'video' },
      }),
    ).toEqual({ path: '/production/hazards/MH-7', query: { tab: 'video' } });
  });

  it('一级菜单源路由名翻译为菜单路径', () => {
    expect(resolveDelegatedLocation({ name: 'emergency' })).toEqual({ path: '/emergency' });
    expect(resolveDelegatedLocation({ name: 'fire' })).toEqual({ path: '/fire' });
    expect(resolveDelegatedLocation({ name: 'security' })).toEqual({ path: '/security' });
    expect(resolveDelegatedLocation({ name: 'tv' })).toEqual({ path: '/tv' });
    expect(resolveDelegatedLocation({ name: 'production' })).toEqual({ path: '/production' });
    expect(resolveDelegatedLocation({ name: 'productionCommunication' })).toEqual({
      path: '/production/communication',
    });
  });

  it('未注册的 name 返回 null（上层 rawPush 会抛 MATCHER_NOT_FOUND）', () => {
    expect(resolveDelegatedLocation({ name: 'notARoute' })).toBeNull();
    expect(resolveDelegatedLocation({ name: 'subapp-fallback' })).toBeNull();
  });

  it('空对象 / 非对象返回 null', () => {
    expect(resolveDelegatedLocation({})).toBeNull();
    expect(resolveDelegatedLocation(null as unknown as string)).toBeNull();
    expect(resolveDelegatedLocation(undefined as unknown as string)).toBeNull();
    expect(resolveDelegatedLocation(123 as unknown as string)).toBeNull();
  });

  it('query 中数组值被字符串化（与 vue-router LocationQuery 行为一致）', () => {
    expect(
      resolveDelegatedLocation({
        name: 'fireAccidentRescue',
        query: { tag: ['a', 'b'], kind: 'event' },
      }),
    ).toEqual({ path: '/fire/rescue', query: { tag: ['a', 'b'], kind: 'event' } });
  });

  it('query 全部为 undefined 时不附加 query 字段', () => {
    expect(
      resolveDelegatedLocation({ name: 'fireAccidentRescue', query: { x: undefined } }),
    ).toEqual({
      path: '/fire/rescue',
    });
  });

  it('serializeParamPath 替换 :param 模板', () => {
    expect(serializeParamPath('/a/:id/b', { id: 'X' })).toBe('/a/X/b');
    expect(serializeParamPath('/a/:id/b', {})).toBe('/a/:id/b');
    expect(serializeParamPath('/a/:id', { id: 7 })).toBe('/a/7');
  });

  it('FM_SOURCE_ROUTE_TO_SHELL_PATH 覆盖 reviewer 列出的全部源路由名', () => {
    // 任务 task-12 #1 要求枚举「所有基于 name 的 router.push」并镜像到主壳路径。
    // 至少应包含 src/screen 中所有出现的源路由名。
    const expected = [
      'fireAccidentRescue',
      'drillEmergencyDetail',
      'typhoonEmergencyDetail',
      'tvVideoWall',
      'tvVideoControl',
      'productionArea',
      'productionCommunication',
      'majorHazardList',
      'majorHazardDetail',
      'emergency',
      'fire',
      'security',
      'tv',
      'production',
    ];
    for (const name of expected) {
      expect(FM_SOURCE_ROUTE_TO_SHELL_PATH[name]).toBeTruthy();
    }
  });
});
