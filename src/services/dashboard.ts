import { request } from '@/services/http';
import { backendUnavailableWarn } from '@/services/backendFallback';

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

/** 值守工位单条明细：GET /dashboard/workstations/{id}（后端未命中收口为 null） */
export async function fetchWorkstationById(id: string): Promise<Workstation | null> {
  try {
    const data = await request<unknown>({ url: `/dashboard/workstations/${id}`, method: 'GET' });
    if (!data || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.name !== 'string') return null;
    return {
      id: o.id,
      name: o.name,
      zone: typeof o.zone === 'string' ? o.zone : '',
      online: o.online === true,
    };
  } catch {
    backendUnavailableWarn('dashboard', `/dashboard/workstations/${id}`);
    return null;
  }
}

/** 大屏滚动系统消息：GET /dashboard/messages（取代前端硬编码 systemMessages） */
export async function fetchDashboardMessages(): Promise<SystemMessageItem[]> {
  return request<SystemMessageItem[]>({ url: '/dashboard/messages', method: 'GET' });
}
