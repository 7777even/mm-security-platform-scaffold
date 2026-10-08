import { describe, expect, it } from 'vitest';
import { mgmtMenus } from '@/data/mgmtMenus';
import {
  mgmtCardToneOf,
  mgmtGroupCardTone,
  mgmtGroupIcon,
  mgmtGroupTileTone,
  mgmtIconOf,
  mgmtTileToneOf,
  mgmtToneClassOf,
  type MgmtCardTone,
  type MgmtTileTone,
} from '../groupVisuals';

/*
 * 后台端分组视觉唯一真源的单测（回归防线）。
 * 背景：新增第 9 个分组「台风应急管理」时，workbench.vue / module.vue 各自内联的
 * iconByKey / toneByKey 未同步补登记 → 工作台卡片图标渲染为空白（本次线上缺陷）。
 * 本用例把「mgmtMenus 的每个分组 key 都必须已登记图标 + 两种色调」变成门禁，
 * 再新增/改名分组时若漏登记，此处先红。
 */

describe('apps/mgmt/utils/groupVisuals：分组视觉唯一真源', () => {
  it('mgmtMenus 每个一级分组都已登记图标 / 瓦片色调 / 卡片色调', () => {
    expect(mgmtMenus.length).toBeGreaterThan(0);
    for (const g of mgmtMenus) {
      expect(mgmtGroupIcon[g.key], `分组「${g.key}」未登记图标`).toBeTruthy();
      expect(mgmtGroupTileTone[g.key], `分组「${g.key}」未登记瓦片色调`).toBeTruthy();
      expect(mgmtGroupCardTone[g.key], `分组「${g.key}」未登记卡片色调`).toBeTruthy();
    }
  });

  it('映射表不含 mgmtMenus 之外的分组 key（防分组改名后残留旧键）', () => {
    const known = new Set(mgmtMenus.map((g) => g.key));
    for (const key of Object.keys(mgmtGroupIcon)) {
      expect(known.has(key), `图标表存在已不存在的分组 key「${key}」`).toBe(true);
    }
    for (const key of Object.keys(mgmtGroupTileTone)) {
      expect(known.has(key), `瓦片色调表存在已不存在的分组 key「${key}」`).toBe(true);
    }
    for (const key of Object.keys(mgmtGroupCardTone)) {
      expect(known.has(key), `卡片色调表存在已不存在的分组 key「${key}」`).toBe(true);
    }
  });

  it('台风应急管理（typhoon）分组图标与色调已登记，不再渲染空白图标', () => {
    // 缺陷回归锚点：该分组曾因漏登记而拿到 undefined 图标
    expect(mgmtIconOf('typhoon')).toBe(mgmtGroupIcon.typhoon);
    expect(mgmtIconOf('typhoon')).toBeTruthy();
    expect(mgmtCardToneOf('typhoon')).toBe('warning');
    expect(mgmtTileToneOf('typhoon')).toBe('blue');
  });

  it('取值函数对未登记 key 一律走兜底（绝不返回空图标/空色调）', () => {
    const cardTones: MgmtCardTone[] = ['danger', 'warning', 'primary', 'success'];
    const tileTones: MgmtTileTone[] = [
      'red',
      'orange',
      'amber',
      'navy',
      'indigo',
      'cyan',
      'purple',
      'slate',
      'blue',
    ];
    expect(mgmtIconOf('__unknown__')).toBeTruthy();
    expect(cardTones).toContain(mgmtCardToneOf('__unknown__'));
    expect(tileTones).toContain(mgmtTileToneOf('__unknown__'));
    expect(mgmtToneClassOf('__unknown__')).toBe('mgmt-tone--blue');
  });

  it('mgmtToneClassOf 与 mgmtTileToneOf 同源（侧栏分组按钮类名不脱节）', () => {
    for (const g of mgmtMenus) {
      expect(mgmtToneClassOf(g.key)).toBe(`mgmt-tone--${mgmtTileToneOf(g.key)}`);
    }
  });
});
