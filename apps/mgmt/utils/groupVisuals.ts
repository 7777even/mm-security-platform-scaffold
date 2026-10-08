import type { Component } from 'vue';
import {
  Aim,
  Bell,
  FirstAidKit,
  Lightning,
  Message,
  Monitor,
  OfficeBuilding,
  Setting,
  Tickets,
  Warning,
} from '@element-plus/icons-vue';

/*
 * 后台端「一级子系统分组 → 视觉」唯一真源（图标 / 瓦片色调 / 卡片色调）。
 *
 * 为什么要有这个文件（缺陷根因，2026-10-08 修复）：
 *   分组图标与色调原先在 App.vue（侧栏分组头 + 多页签）、views/workbench.vue（工作台模块卡）、
 *   views/module.vue（模块页页头）各抄了一份 map，且三份 map 键都写死为「当时的 8 个分组」。
 *   新增第 9 个分组「台风应急管理」时只补了 App.vue，另两处漏登记 →
 *   workbench 卡片 `<component :is="iconByKey['typhoon']">` 取到 undefined，渲染成**空白图标**
 *   （class 也变成 `wb-card__icon--undefined`，连底色都丢），即本次线上现象。
 * 现在三处统一从这里取；并由 apps/mgmt/utils/__tests__/groupVisuals.spec.ts 锁定
 *   「mgmtMenus 的每个分组 key 都必须已登记」，再新增分组时单测会先红，杜绝静默漏登记。
 */

export type MgmtTileTone =
  'red' | 'orange' | 'amber' | 'navy' | 'indigo' | 'cyan' | 'purple' | 'slate' | 'blue';

/** 工作台卡片色块语义（对应 workbench.vue 的 .wb-card__icon--* 与 --*-mgmt token） */
export type MgmtCardTone = 'danger' | 'warning' | 'primary' | 'success';

/** 分组图标（键 = mgmtMenus 的 group.key，非 group.icon 字段） */
export const mgmtGroupIcon: Record<string, Component> = {
  alarm: Bell,
  fire: Warning,
  emergency: FirstAidKit,
  typhoon: Lightning,
  production: OfficeBuilding,
  security: Aim,
  monitor: Monitor,
  comm: Message,
  sys: Setting,
};

/** 分组瓦片色调（键 = mgmtMenus 的 group.key） */
export const mgmtGroupTileTone: Record<string, MgmtTileTone> = {
  alarm: 'red',
  fire: 'orange',
  emergency: 'amber',
  typhoon: 'blue',
  production: 'navy',
  security: 'indigo',
  monitor: 'cyan',
  comm: 'purple',
  sys: 'slate',
};

/** 分组卡片色调（键 = mgmtMenus 的 group.key，仅工作台模块卡使用） */
export const mgmtGroupCardTone: Record<string, MgmtCardTone> = {
  alarm: 'danger',
  fire: 'warning',
  emergency: 'warning',
  typhoon: 'warning',
  production: 'primary',
  security: 'primary',
  monitor: 'success',
  comm: 'primary',
  sys: 'primary',
};

/* 取值函数一律带兜底：即便某分组漏登记，也只是退到通用图标/默认色调，绝不渲染空白图标。
 * （兜底只为不出现空白，正确性由 groupVisuals.spec.ts 的「全分组已登记」断言保证。） */

export function mgmtIconOf(groupKey: string): Component {
  return mgmtGroupIcon[groupKey] ?? Tickets;
}

export function mgmtTileToneOf(groupKey: string): MgmtTileTone {
  return mgmtGroupTileTone[groupKey] ?? 'blue';
}

/** 供侧栏分组按钮使用：`mgmt-tone--<tone>` 类挂在按钮上，给分组名下划线取色 */
export function mgmtToneClassOf(groupKey: string): string {
  return `mgmt-tone--${mgmtTileToneOf(groupKey)}`;
}

export function mgmtCardToneOf(groupKey: string): MgmtCardTone {
  return mgmtGroupCardTone[groupKey] ?? 'primary';
}
