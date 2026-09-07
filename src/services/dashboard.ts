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

/** 在线工位/工作站列表（大屏人员值守态势） */
export async function fetchWorkstations(): Promise<Workstation[]> {
  return request<Workstation[]>({ url: '/dashboard/workstations', method: 'GET' });
}
