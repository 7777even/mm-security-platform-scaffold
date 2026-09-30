/**
 * 大屏总览卡片的交互语义（生产应急左栏「生产设施总览 / 设备总览」共用）。
 *
 * 背景：同一个两列网格里混排着两类卡片——一类点下去会**整屏替换到独立子应用页**
 * （厂区 / 生产装置 / 仓库 / 储罐 / 重大危险源 / 广播 / 电话），另一类只**在当前页就地
 * 展开二级页面**（左侧设备清单抽屉）。此前只有通讯设备卡带一个 `›` 角标，其余跨页卡
 * 没有任何提示，用户点击后被整屏跳转会觉得突兀。
 *
 * 本文件是这套「角标 ↔ 交互行为」的唯一事实源：角标渲染与点击分支都从这里取，
 * 避免再出现「按 name 散落写死」或某类卡片漏标。
 */

export type OverviewItemAction = 'navigate' | 'expand';

export interface OverviewItemActionMeta {
  /** 角标图标（字面字符，避免额外切图） */
  glyph: string;
  /** 角标文案 */
  label: string;
  /** 悬停提示（原生 tooltip 文案） */
  hint: string;
}

/**
 * - `navigate`：打开独立页面。会离开当前大屏页（目标页自带「返回」入口），故角标用
 *   **实心蓝底 + ↗**、视觉权重更高，让用户在点击前就有预期。
 * - `expand`：在当前页就地展开二级页面（左侧抽屉 / 浮层），角标用**描边 + ⌄**，权重更低。
 *
 * 两类都只用 `--color-accent` 蓝系：`--color-warning` / `--color-danger` 在大屏规范里
 * 是「警示 / 待处置 / 危险」的语义色，不能挪用来表达导航行为。
 */
export const OVERVIEW_ITEM_ACTION_META: Record<OverviewItemAction, OverviewItemActionMeta> = {
  navigate: { glyph: '↗', label: '前往', hint: '将打开独立页面' },
  expand: { glyph: '⌄', label: '展开', hint: '在当前页展开列表' },
};
