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
