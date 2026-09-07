import { ref } from 'vue';
import { request } from '@/services/http';

// 安全防恐门禁事件 store（B3 脚手架阶段 in-memory mock 打底；后端契约就位后整体可废弃）。
// 后端契约（/security/events 端点、事件 CRUD）标 #TODO-确认；dev 缺 VITE_API_BASE 时以内置 fixture 兜底。
// 消费方：src/views/security-anti-terror/records.vue。
export type AccessDirection = '进' | '出';
export type AccessLevel = 1 | 2 | 3;

export interface SecurityEvent {
  eventId: string;
  person: string;
  channel: string;
  cardId: string;
  vehicle: string;
  direction: AccessDirection;
  level: AccessLevel;
  ts: string;
}

const fixture: SecurityEvent[] = [
  {
    eventId: 'EVT-20260907-0001',
    person: '张伟',
    channel: '1#门-道闸1',
    cardId: 'C1001',
    vehicle: '粤K·12345',
    direction: '进',
    level: 1,
    ts: '2026-09-07 08:02:11',
  },
  {
    eventId: 'EVT-20260907-0002',
    person: '李娜',
    channel: '1#门-道闸2',
    cardId: 'C1002',
    vehicle: '粤K·23456',
    direction: '出',
    level: 1,
    ts: '2026-09-07 08:05:33',
  },
  {
    eventId: 'EVT-20260907-0003',
    person: '王强',
    channel: '2#门-道闸1',
    cardId: 'C1003',
    vehicle: '粤K·34567',
    direction: '进',
    level: 2,
    ts: '2026-09-07 08:11:47',
  },
  {
    eventId: 'EVT-20260907-0004',
    person: '赵敏',
    channel: '3#门-道闸1',
    cardId: 'C1004',
    vehicle: '粤K·45678',
    direction: '出',
    level: 1,
    ts: '2026-09-07 08:19:02',
  },
  {
    eventId: 'EVT-20260907-0005',
    person: '陈杰',
    channel: '东门-道闸1',
    cardId: 'C1005',
    vehicle: '粤K·56789',
    direction: '进',
    level: 3,
    ts: '2026-09-07 08:24:15',
  },
  {
    eventId: 'EVT-20260907-0006',
    person: '刘洋',
    channel: '南门-道闸1',
    cardId: 'C1006',
    vehicle: '粤K·67890',
    direction: '进',
    level: 1,
    ts: '2026-09-07 08:31:40',
  },
  {
    eventId: 'EVT-20260907-0007',
    person: '孙莉',
    channel: '西门-道闸1',
    cardId: 'C1007',
    vehicle: '粤K·78901',
    direction: '出',
    level: 2,
    ts: '2026-09-07 08:38:09',
  },
  {
    eventId: 'EVT-20260907-0008',
    person: '周涛',
    channel: '北门-道闸1',
    cardId: 'C1008',
    vehicle: '粤K·89012',
    direction: '进',
    level: 1,
    ts: '2026-09-07 08:45:22',
  },
  {
    eventId: 'EVT-20260907-0009',
    person: '吴昊',
    channel: '1#门-道闸3',
    cardId: 'C1009',
    vehicle: '粤K·90123',
    direction: '出',
    level: 1,
    ts: '2026-09-07 08:52:57',
  },
  {
    eventId: 'EVT-20260907-0010',
    person: '郑爽',
    channel: '2#门-道闸2',
    cardId: 'C1010',
    vehicle: '粤K·01234',
    direction: '进',
    level: 3,
    ts: '2026-09-07 09:01:13',
  },
  {
    eventId: 'EVT-20260907-0011',
    person: '冯磊',
    channel: '3#门-道闸2',
    cardId: 'C1011',
    vehicle: '粤K·12340',
    direction: '出',
    level: 1,
    ts: '2026-09-07 09:08:48',
  },
  {
    eventId: 'EVT-20260907-0012',
    person: '蒋雯',
    channel: '东门-道闸1',
    cardId: 'C1012',
    vehicle: '粤K·23401',
    direction: '进',
    level: 2,
    ts: '2026-09-07 09:15:30',
  },
  {
    eventId: 'EVT-20260907-0013',
    person: '韩雪',
    channel: '南门-道闸1',
    cardId: 'C1013',
    vehicle: '粤K·34502',
    direction: '进',
    level: 1,
    ts: '2026-09-07 09:23:05',
  },
  {
    eventId: 'EVT-20260907-0014',
    person: '杨帆',
    channel: '西门-道闸1',
    cardId: 'C1014',
    vehicle: '粤K·45603',
    direction: '出',
    level: 1,
    ts: '2026-09-07 09:30:41',
  },
  {
    eventId: 'EVT-20260907-0015',
    person: '朱琳',
    channel: '北门-道闸1',
    cardId: 'C1015',
    vehicle: '粤K·56704',
    direction: '进',
    level: 2,
    ts: '2026-09-07 09:37:18',
  },
  {
    eventId: 'EVT-20260907-0016',
    person: '秦风',
    channel: '1#门-道闸1',
    cardId: 'C1016',
    vehicle: '粤K·67805',
    direction: '出',
    level: 3,
    ts: '2026-09-07 09:44:52',
  },
];

const events = ref<SecurityEvent[]>(fixture.map((e) => ({ ...e })));

export const securityEventStore = {
  events,
  async fetchSecurityEvents(): Promise<SecurityEvent[]> {
    if (!import.meta.env.VITE_API_BASE) return events.value;
    try {
      const data = await request<SecurityEvent[]>({ url: '/security/events', method: 'GET' });
      if (Array.isArray(data)) events.value = data;
    } catch {
      /* dev 降级保留 fixture */
    }
    return events.value;
  },
  addSecurityEvent(item: SecurityEvent): void {
    events.value = [item, ...events.value];
  },
  updateSecurityEvent(eventId: string, patch: Partial<SecurityEvent>): void {
    events.value = events.value.map((e) => (e.eventId === eventId ? { ...e, ...patch } : e));
  },
  removeSecurityEvent(eventId: string): void {
    events.value = events.value.filter((e) => e.eventId !== eventId);
  },
};

export async function fetchSecurityEvents(): Promise<SecurityEvent[]> {
  return securityEventStore.fetchSecurityEvents();
}
