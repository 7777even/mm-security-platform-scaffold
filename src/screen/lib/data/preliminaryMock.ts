// 应急事件类型已迁至后端 service（@/services/emergencyEvent）。以下为类型别名，
// 供仍 import 自本文件的面板组件（FireEmergencyMap / PreliminaryMap / EmergencyEventListPanel /
// fireEmergencyEventsStore 等）零改动平滑切换。
export type { EmergencyEventItem, EmergencyEventGroup } from '@/services/emergencyEvent';

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
