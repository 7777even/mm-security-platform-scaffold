import { request } from '@/services/http'
import type { PageResult } from '@/types'
import {
  mockPage,
  mockCreate,
  mockUpdate,
  mockDelete,
  type EmergencyEventPayload,
} from '@/services/emergencyEventStore'

// 报警/态势数据接口（对齐 B3 Mock 契约：REST 包络 + 分页 {list,total,page,size}）
export type AlarmLevel = 1 | 2 | 3 | 4
export type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED'
export type AlarmType = 'FIRE' | 'GAS' | 'TEMP' | 'CCTV' | 'SOS'

export interface AlarmItem {
  alarmId: string
  level: AlarmLevel
  type: AlarmType
  status: AlarmStatus
  deviceCode: string
  location: string
  ts: string
  description: string
  planId?: string
}

export interface DashboardOverview {
  activeAlarm: number
  deviceOnline: number
  deviceTotal: number
  riskIndex: number
  onlineWorkstation: number
  ts: string
}

export interface AlarmTrendPoint {
  hour: string
  count: number
}

/** dev mock 开关：缺后端 API base 或显式 dev mock 开关时，走 in-memory store */
function useDevMock(): boolean {
  if (!import.meta.env.VITE_API_BASE) return true
  return import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true'
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return request<DashboardOverview>({ url: '/dashboard/overview', method: 'GET' })
}

export async function fetchAlarmTrend(): Promise<AlarmTrendPoint[]> {
  return request<AlarmTrendPoint[]>({ url: '/dashboard/alarm-trend', method: 'GET' })
}

export async function fetchAlarmPage(page = 1, size = 5): Promise<PageResult<AlarmItem>> {
  if (useDevMock()) return Promise.resolve(mockPage(page, size))
  return request<PageResult<AlarmItem>>({ url: '/alarms', method: 'GET', params: { page, size } })
}

export async function createEmergencyEvent(p: EmergencyEventPayload): Promise<AlarmItem> {
  if (useDevMock()) return Promise.resolve(mockCreate(p))
  return request<AlarmItem>({ url: '/alarms', method: 'POST', data: p })
}

export async function updateEmergencyEvent(id: string, p: EmergencyEventPayload): Promise<AlarmItem | null> {
  if (useDevMock()) return Promise.resolve(mockUpdate(id, p))
  return request<AlarmItem>({ url: `/alarms/${encodeURIComponent(id)}`, method: 'PUT', data: p })
}

export async function deleteEmergencyEvent(id: string): Promise<boolean> {
  if (useDevMock()) return Promise.resolve(mockDelete(id))
  return request<{ ok: boolean }>({ url: `/alarms/${encodeURIComponent(id)}`, method: 'DELETE' }).then(() => true)
}