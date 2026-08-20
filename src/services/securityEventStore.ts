// 治安防恐 · 门禁/出入事件 in-memory mock store（脚手架阶段 dev mock）
export type AccessDirection = '进' | '出';
export type AccessLevel = 1 | 2 | 3;

export interface SecurityEvent {
  eventId: string;
  ts: string;
  direction: AccessDirection;
  person: string;
  cardId: string;
  channel: string;
  vehicle: string;
  level: AccessLevel;
}

function seed(): SecurityEvent[] {
  const now = Date.now();
  const iso = (m: number): string => new Date(now - m * 60000).toISOString();
  return [
    {
      eventId: 'SE-2026-0812',
      ts: iso(3),
      direction: '进',
      person: '李建国',
      cardId: '80000020871',
      channel: '北门 人行通道',
      vehicle: '',
      level: 1,
    },
    {
      eventId: 'SE-2026-0811',
      ts: iso(8),
      direction: '进',
      person: '王师傅',
      cardId: '80000010732',
      channel: '东门 访客通道',
      vehicle: '冀A·X8372',
      level: 3,
    },
    {
      eventId: 'SE-2026-0810',
      ts: iso(15),
      direction: '出',
      person: '承包商一组',
      cardId: 'CK-0451',
      channel: '西门 承包商通道',
      vehicle: '',
      level: 1,
    },
    {
      eventId: 'SE-2026-0809',
      ts: iso(26),
      direction: '出',
      person: '张伟',
      cardId: '80000011145',
      channel: '南门 物资通道',
      vehicle: '粤G·9F221',
      level: 1,
    },
    {
      eventId: 'SE-2026-0808',
      ts: iso(41),
      direction: '进',
      person: '来访登记',
      cardId: 'RF-0827',
      channel: '东门 访客通道',
      vehicle: '京A·C5219',
      level: 2,
    },
    {
      eventId: 'SE-2026-0807',
      ts: iso(58),
      direction: '进',
      person: '刘芳',
      cardId: '80000009513',
      channel: '北门 人行通道',
      vehicle: '',
      level: 1,
    },
  ];
}

let cache: SecurityEvent[] | null = null;

function list(): SecurityEvent[] {
  if (!cache) cache = seed();
  return cache;
}

export function fetchSecurityEvents(): Promise<SecurityEvent[]> {
  return Promise.resolve([...list()]);
}
