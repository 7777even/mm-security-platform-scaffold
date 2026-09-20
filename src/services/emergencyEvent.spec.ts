import { describe, it, expect } from 'vitest';
import {
  EMERGENCY_EVENT_TYPE_DEFS,
  EMERGENCY_EVENT_TYPE_BY_BUSINESS,
  EMERGENCY_EVENT_TYPE_OPTIONS,
  deriveKindCategory,
  deriveBusinessType,
  type EmergencyEventType,
} from './emergencyEvent';

describe('emergencyEvent 事件类型登记表', () => {
  it('应急事件业务大类包含 4 类报警来源小类', () => {
    const eventTypes = EMERGENCY_EVENT_TYPE_BY_BUSINESS.event as readonly string[];
    expect(eventTypes).toContain('消防电话报警');
    expect(eventTypes).toContain('储罐消防报警');
    expect(eventTypes).toContain('消防设施异常');
    expect(eventTypes).toContain('视频烟火联动');
    expect(eventTypes).toContain('突发应急事件');
    expect(eventTypes).toContain('预警事件');
    expect(eventTypes).toContain('极端天气事件');
  });

  it('演练业务大类仅含演练事件', () => {
    expect(EMERGENCY_EVENT_TYPE_BY_BUSINESS.drill).toEqual(['演练事件']);
  });

  it('事件类型可选项来自登记表全部键', () => {
    expect(EMERGENCY_EVENT_TYPE_OPTIONS).toEqual(
      Object.keys(EMERGENCY_EVENT_TYPE_DEFS) as EmergencyEventType[],
    );
  });

  it('报警来源小类映射到与种子分组同码的 groupCode/groupLabel（确保归并到同一侧栏分组）', () => {
    expect(deriveKindCategory('消防电话报警')).toMatchObject({
      kind: 'event',
      eventCategory: 'default',
      groupCode: 'phone',
      groupLabel: '消防电话报警',
    });
    expect(deriveKindCategory('储罐消防报警')).toMatchObject({
      groupCode: 'tank',
      groupLabel: '储罐消防报警',
    });
    expect(deriveKindCategory('消防设施异常')).toMatchObject({
      groupCode: 'facility',
      groupLabel: '消防设施异常',
    });
    expect(deriveKindCategory('视频烟火联动')).toMatchObject({
      groupCode: 'video',
      groupLabel: '视频烟火联动',
    });
  });

  it('极端天气事件映射到 extreme-weather 分组与 extremeWeather 分类', () => {
    expect(deriveKindCategory('极端天气事件')).toMatchObject({
      kind: 'event',
      eventCategory: 'extremeWeather',
      groupCode: 'extreme-weather',
      groupLabel: '极端天气',
    });
  });

  it('演练事件映射到 manual-drill 分组与 drill 类型', () => {
    expect(deriveKindCategory('演练事件')).toMatchObject({
      kind: 'drill',
      eventCategory: 'default',
      groupCode: 'manual-drill',
      groupLabel: '演练事件',
    });
  });

  it('未登记类型回落到突发应急事件分组，不产生游离分组', () => {
    expect(deriveKindCategory('不存在的类型')).toMatchObject({
      groupCode: 'manual-event',
      groupLabel: '突发应急事件',
    });
  });

  it('deriveBusinessType 将报警来源小类归到应急事件大类', () => {
    expect(deriveBusinessType('消防电话报警')).toBe('event');
    expect(deriveBusinessType('演练事件')).toBe('drill');
    expect(deriveBusinessType('未知')).toBe('event');
  });
});
