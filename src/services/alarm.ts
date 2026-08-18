import { request } from '@/services/http'
import type { PageResult } from '@/types'

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

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return request<DashboardOverview>({ url: '/dashboard/overview', method: 'GET' })
}

export async function fetchAlarmTrend(): Promise<AlarmTrendPoint[]> {
  return request<AlarmTrendPoint[]>({ url: '/dashboard/alarm-trend', method: 'GET' })
}

export async function fetchAlarmPage(page = 1, size = 5): Promise<PageResult<AlarmItem>> {
  return request<PageResult<AlarmItem>>({ url: '/alarms', method: 'GET', params: { page, size } })
}
