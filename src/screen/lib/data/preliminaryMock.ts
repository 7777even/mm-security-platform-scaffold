// 应急事件类型已迁至后端 service（@/services/emergencyEvent）。以下为类型别名，
// 供仍 import 自本文件的面板组件（FireEmergencyMap / PreliminaryMap / EmergencyEventListPanel /
// fireEmergencyEventsStore 等）零改动平滑切换。
export type { EmergencyEventItem, EmergencyEventGroup } from '@/services/emergencyEvent';

export interface RescueForceStat {
  label: string;
  value: number;
  iconIndex: number;
}

export interface KnowledgeItem {
  id: number;
  line1: string;
  line2: string;
  count: number;
  countTone: 'lime' | 'cyan';
  iconIndex: number;
}

export interface DutyWatchPerson {
  id: number;
  name: string;
  role: string;
  phone: string;
  avatarIndex: number;
}

export const dutyWatchPersons: DutyWatchPerson[] = [
  { id: 1, name: '杨恒明', role: '值班领导', phone: '13792536966', avatarIndex: 0 },
  { id: 2, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 1 },
  { id: 3, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 2 },
  { id: 4, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 3 },
];

export const rescueForceStats: RescueForceStat[] = [
  { label: '应急专家', value: 47, iconIndex: 0 },
  { label: '应急物资', value: 3510, iconIndex: 1 },
  { label: '救援队伍', value: 10, iconIndex: 2 },
  { label: '装备车辆', value: 55, iconIndex: 3 },
  { label: '应急场所', value: 62, iconIndex: 4 },
  { label: '医疗机构', value: 80, iconIndex: 5 },
  { label: '应急车辆', value: 33, iconIndex: 6 },
  { label: '消防设施', value: 11, iconIndex: 7 },
];

export const safetyKnowledgeItems: KnowledgeItem[] = [
  { id: 1, line1: '岗位应急', line2: '处置卡', count: 158, countTone: 'lime', iconIndex: 0 },
  { id: 2, line1: '危险化学品', line2: '知识库', count: 158, countTone: 'cyan', iconIndex: 1 },
  { id: 3, line1: '生产区域', line2: '疏散路线图', count: 158, countTone: 'cyan', iconIndex: 2 },
];

export const preliminaryZoneOverlays = [
  { left: '27.9%', top: '31.6%', width: '17.5%', height: '19.1%' },
  { left: '44.9%', top: '28.7%', width: '25.6%', height: '17.7%' },
  { left: '36.0%', top: '45.6%', width: '24.2%', height: '20.6%' },
];

export const preliminaryMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
