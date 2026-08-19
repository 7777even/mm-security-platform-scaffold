import type {
  DashboardOverview,
  AlarmTrendPoint,
  AlarmItem,
  AlarmLevel,
  AlarmType,
} from '@/services/alarm';
import type { PageResult } from '@/types';
import type { MenuItem } from '@/router/menu';
import { DEFAULT_MENUS } from '@/router/menu';

// GeoJSON Feature（与 services/map.ts normalizeFeature 期望一致）
interface GeoJsonFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: number[] | number[][] };
}

// 开发期自包含 mock 数据（对齐 B3 Mock 契约包络），仅在无 VITE_API_BASE 时启用，
// 使前端脚手架无需外部后端即可演示。生产构建不引入。

export const overviewFixture: DashboardOverview = {
  activeAlarm: 3,
  deviceOnline: 142,
  deviceTotal: 150,
  riskIndex: 2.4, // 0-5
  onlineWorkstation: 12,
  ts: new Date().toISOString(),
};

export const trendFixture: AlarmTrendPoint[] = Array.from({ length: 24 }, (_, h) => ({
  hour: String(h).padStart(2, '0'),
  count: Math.round(2 + Math.sin(h / 3) * 2 + Math.random() * 3),
}));

const LOCATIONS = ['A 栋 1F', 'B 栋 3F', '罐区 02 区', '装置区 05 单元', '装卸区 01 泊位'];
const TYPES: AlarmType[] = ['FIRE', 'GAS', 'TEMP', 'SOS'];

export function makeAlarm(i: number): AlarmItem {
  const level = ((i % 4) + 1) as AlarmLevel;
  return {
    alarmId: `MOCK-${String(i).padStart(4, '0')}`,
    level,
    type: TYPES[i % TYPES.length] ?? 'FIRE',
    status: i % 3 === 0 ? 'ACKED' : 'ACTIVE',
    deviceCode: `DEV-${1000 + i}`,
    location: LOCATIONS[i % LOCATIONS.length] ?? '厂区',
    ts: new Date(Date.now() - i * 60000).toISOString(),
    description: `模拟报警：浓度/温度越限（样例 ${i}）`,
  };
}

export const alarmPageFixture: PageResult<AlarmItem> = {
  list: Array.from({ length: 12 }, (_, i) => makeAlarm(i)),
  total: 12,
  page: 1,
  size: 12,
};

// GeoJSON Feature（与 services/map.ts normalizeFeature 期望一致）
export const alarmPointsFixture: GeoJsonFeature[] = Array.from({ length: 8 }, (_, i) => ({
  type: 'Feature',
  properties: {
    alarmId: `AP-${i}`,
    name: `报警点 ${i}`,
    status: i % 2 === 0 ? 'active' : 'normal',
    level: (i % 4) + 1,
  },
  geometry: { type: 'Point', coordinates: [110.945 + i * 0.002, 21.67 + i * 0.001] },
}));

export const devicePointsFixture: GeoJsonFeature[] = Array.from({ length: 20 }, (_, i) => ({
  type: 'Feature',
  properties: {
    deviceCode: `DP-${i}`,
    name: `设备 ${i}`,
    status: i % 5 === 0 ? 'offline' : 'online',
  },
  geometry: { type: 'Point', coordinates: [110.944 + i * 0.0015, 21.668 + i * 0.0012] },
}));

// 服务层期望 { zone, score }[]（map.ts 内部用 ZONE_COORDS 补 polygon）
export const riskZonesFixture: { zone: string; score: number }[] = [
  { zone: '罐区', score: 3.1 },
  { zone: '装置区', score: 2.2 },
];

export const menusFixture: MenuItem[] = DEFAULT_MENUS;
