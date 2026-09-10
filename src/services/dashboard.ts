import { request } from '@/services/http';

// 大屏态势服务（对齐 dashboard.openapi.json：/dashboard/workstations）。
// /dashboard/overview、/dashboard/alarm-trend、/dashboard/risk-heatmap 封装见 services/alarm.ts、services/map.ts。
// 直连真后端（VITE_API_BASE=8787），无 mock 回落。

export interface Workstation {
  id: string;
  name: string;
  zone: string;
  online: boolean;
}

/** 大屏底部滚动系统消息项（危险/预警两类） */
export interface SystemMessageItem {
  id: number;
  /** danger 危险 / warning 预警 */
  type: string;
  title: string;
  /** 发生时间 */
  time: string;
  content: string;
}

/** 在线工位/工作站列表（大屏人员值守态势） */
export async function fetchWorkstations(): Promise<Workstation[]> {
  return request<Workstation[]>({ url: '/dashboard/workstations', method: 'GET' });
}

/** 大屏滚动系统消息：GET /dashboard/messages（取代前端硬编码 systemMessages） */
export async function fetchDashboardMessages(): Promise<SystemMessageItem[]> {
  return request<SystemMessageItem[]>({ url: '/dashboard/messages', method: 'GET' });
}
