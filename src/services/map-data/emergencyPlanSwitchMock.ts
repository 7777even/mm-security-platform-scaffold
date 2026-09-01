export const emergencyPlanSwitchTabs = [
  { key: 'disposal', label: '应急处置方案' },
  { key: 'fire', label: '消防救援预案' },
  { key: 'company', label: '公司级应急预案' },
  { key: 'superior', label: '上级单位应急预案' },
] as const;

export type EmergencyPlanSwitchTabKey = (typeof emergencyPlanSwitchTabs)[number]['key'];

export interface SelectableEmergencyPlan {
  id: string;
  tab: EmergencyPlanSwitchTabKey;
  name: string;
  accidentType: string;
  facility: string;
}

export const emergencyPlanSwitchOptions = {
  accidentTypes: ['全部类型', '火灾/爆炸', '泄漏', '中毒窒息'],
  facilities: ['全部装置', '乙烯罐区', '乙烯裂解装置', '重油加氢装置'],
} as const;

const planCatalog: SelectableEmergencyPlan[] = [
  {
    id: 'disposal-1',
    tab: 'disposal',
    name: '乙烯储罐火灾处置方案',
    accidentType: '火灾/爆炸',
    facility: '乙烯罐区',
  },
  {
    id: 'disposal-2',
    tab: 'disposal',
    name: '液氨泄漏现场处置方案',
    accidentType: '泄漏',
    facility: '乙烯罐区',
  },
  {
    id: 'fire-1',
    tab: 'fire',
    name: '乙烯装置消防救援处置方案',
    accidentType: '火灾/爆炸',
    facility: '乙烯裂解装置',
  },
  {
    id: 'fire-2',
    tab: 'fire',
    name: '储罐区泡沫灭火救援预案',
    accidentType: '火灾/爆炸',
    facility: '乙烯罐区',
  },
  {
    id: 'company-1',
    tab: 'company',
    name: '茂名石化应急预案',
    accidentType: '火灾/爆炸',
    facility: '乙烯罐区',
  },
  {
    id: 'company-2',
    tab: 'company',
    name: '茂名石化综合应急预案（修订版）',
    accidentType: '泄漏',
    facility: '重油加氢装置',
  },
  {
    id: 'superior-1',
    tab: 'superior',
    name: '广东省石化行业应急预案',
    accidentType: '火灾/爆炸',
    facility: '乙烯罐区',
  },
];

export function resolvePlansByTab(tab: EmergencyPlanSwitchTabKey): SelectableEmergencyPlan[] {
  return planCatalog.filter((item) => item.tab === tab);
}

export const planSwitchTabToRowId: Record<EmergencyPlanSwitchTabKey, string> = {
  disposal: 'site',
  fire: 'branch',
  company: 'company',
  superior: 'superior',
};

export const planSwitchIncidentFieldLabels = [
  '事故时间',
  '事件分类',
  '涉及装置',
  '涉及危险化学品',
  '报警人',
  '报警电话',
  '接警人',
  '事件描述',
  '死亡人数',
  '已采取措施',
] as const;
