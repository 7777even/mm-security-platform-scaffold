// 应急事件本地 in-memory mock store（B3 脚手架阶段 dev mock；后端契约就位后该文件可整体废弃）
// 用法：crud service 先尝试访问本地 mock（有 VITE_USE_DEV_MOCK=true 或无 VITE_API_BASE），
// 再 fallback HTTP，确保前端 CRUD 全链路可独立演示。

import type { AlarmItem, AlarmLevel, AlarmType, AlarmStatus } from '@/services/alarm'

const KEY = 'em.events.v1'

function seed(): AlarmItem[] {
  const now = Date.now()
  return [
    {
      alarmId: 'AE-2026-001',
      level: 4,
      type: 'FIRE',
      status: 'ACTIVE',
      deviceCode: 'DT-A-3012',
      location: '装置 A 区反应釜',
      ts: new Date(now - 1000 * 60 * 12).toISOString(),
      description: '反应釜温度持续高于阈值，已触发一级响应。',
    },
    {
      alarmId: 'AE-2026-002',
      level: 3,
      type: 'GAS',
      status: 'ACKED',
      deviceCode: 'GS-B-2010',
      location: '罐区 B 区',
      ts: new Date(now - 1000 * 60 * 50).toISOString(),
      description: '可燃气体探测器读数短暂越线，已现场确认。',
    },
    {
      alarmId: 'AE-2026-003',
      level: 2,
      type: 'TEMP',
      status: 'DISPATCHED',
      deviceCode: 'TP-C-0105',
      location: '装置 C 区',
      ts: new Date(now - 1000 * 60 * 90).toISOString(),
      description: '温度缓慢上升，已派单处置。',
    },
    {
      alarmId: 'AE-2026-004',
      level: 1,
      type: 'CCTV',
      status: 'CLOSED',
      deviceCode: 'CV-D-1107',
      location: '装卸区 01 泊位',
      ts: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      description: '摄像头遮挡告警，已清理。',
    },
  ]
}

function load(): AlarmItem[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    if (raw) return JSON.parse(raw) as AlarmItem[]
  } catch {
    /* localStorage 不可用，忽略 */
  }
  const initial = seed()
  save(initial)
  return initial
}

function save(list: AlarmItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 忽略持久化失败 */
  }
}

let cache: AlarmItem[] | null = null

function list(): AlarmItem[] {
  if (!cache) cache = load()
  return cache
}

export interface EmergencyEventPayload {
  level: AlarmLevel
  type: AlarmType
  deviceCode: string
  location: string
  description: string
}

export function mockPage(page: number, size: number) {
  const items = list()
  const start = (page - 1) * size
  return {
    list: items.slice(start, start + size),
    total: items.length,
    page,
    size,
  }
}

export function mockCreate(p: EmergencyEventPayload): AlarmItem {
  const item: AlarmItem = {
    alarmId: `AE-${Date.now().toString(36).toUpperCase()}`,
    level: p.level,
    type: p.type,
    status: 'ACTIVE' as AlarmStatus,
    deviceCode: p.deviceCode,
    location: p.location,
    ts: new Date().toISOString(),
    description: p.description,
  }
  cache = [item, ...list()]
  save(cache)
  return item
}

export function mockUpdate(id: string, p: EmergencyEventPayload): AlarmItem | null {
  const items = list()
  const idx = items.findIndex((e) => e.alarmId === id)
  if (idx < 0) return null
  const next: AlarmItem = { ...items[idx], ...p }
  items[idx] = next
  cache = items
  save(cache)
  return next
}

export function mockDelete(id: string): boolean {
  const items = list()
  const next = items.filter((e) => e.alarmId !== id)
  if (next.length === items.length) return false
  cache = next
  save(cache)
  return true
}