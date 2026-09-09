/**
 * 应急预案切换 - 仅保留 UI 映射常量。
 * Tabs / 事故类型 / 设施 / 可选预案清单已迁移至后端 service（fetchEmergencyPlanOptions），
 * 经 usePlanMatrix 以 emergencyPlanSwitchTabs / emergencyPlanSwitchOptions / resolvePlansByTab 暴露。
 * 以下常量仍被 EmergencyPlanPanel.vue 引用，请勿删除。
 */

/** 预案 Tab 键 → 面板行 id（联动高亮） */
export const planSwitchTabToRowId: Record<string, string> = {
  disposal: 'site',
  fire: 'branch',
  company: 'company',
  superior: 'superior',
};
