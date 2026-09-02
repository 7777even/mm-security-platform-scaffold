export type MonitoringPointStatus = 'normal' | 'warning' | 'alarm';

export interface MonitoringPoint {
  id: string;
  name: string;
  category: string;
  status: MonitoringPointStatus;
  lastTime: string;
  org: string;
  longitude: number;
  latitude: number;
}

export interface MonitoringAlarm {
  id: string;
  title: string;
  detail: string;
  area: string;
  time: string;
  level: 'low' | 'medium' | 'high';
}

const basePoints: Array<{ longitude: number; latitude: number }> = [
  { longitude: 110.8899, latitude: 21.6769 },
  { longitude: 110.8907, latitude: 21.6759 },
  { longitude: 110.8886, latitude: 21.6754 },
  { longitude: 110.8875, latitude: 21.6771 },
  { longitude: 110.8912, latitude: 21.6774 },
  { longitude: 110.8869, latitude: 21.6747 },
  { longitude: 110.8892, latitude: 21.6739 },
  { longitude: 110.8916, latitude: 21.6738 },
];

export function resolveMonitoringPoints(): MonitoringPoint[] {
  const categories = ['DCS', 'GDS', '气体检测', '压力', '温度', '液位'] as const;
  const orgs = ['乙烯装置区', '乙烯罐区', '生产管理部', '公用工程区'] as const;
  const now = new Date();
  const categoryName: Record<(typeof categories)[number], string> = {
    DCS: 'DCS',
    GDS: 'GDS',
    气体检测: '气体',
    压力: '压力',
    温度: '温度',
    液位: '液位',
  };

  return Array.from({ length: 18 }).map((_, i) => {
    const p = basePoints[i % basePoints.length];
    const jitterLng = ((i % 3) - 1) * 0.00022;
    const jitterLat = (((i * 7) % 3) - 1) * 0.00018;
    const status: MonitoringPointStatus =
      i % 9 === 0 ? 'alarm' : i % 5 === 0 ? 'warning' : 'normal';
    const lastTime = new Date(now.getTime() - (i + 1) * 7 * 60 * 1000).toISOString();
    const category = categories[i % categories.length];
    return {
      id: `mp-${i + 1}`,
      name: `A-${String(i + 1).padStart(2, '0')}${categoryName[category]}监测`,
      category,
      status,
      lastTime,
      org: orgs[i % orgs.length],
      longitude: p.longitude + jitterLng,
      latitude: p.latitude + jitterLat,
    };
  });
}

export function resolveMonitoringAlarms(): MonitoringAlarm[] {
  const now = new Date();
  return [
    {
      id: 'al-1',
      title: '压力高高报',
      detail: 'A点压力已超过阈值，建议立即核查。',
      area: '乙烯装置区',
      time: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      level: 'high',
    },
    {
      id: 'al-2',
      title: '气体浓度预警',
      detail: '检测到浓度上升，建议加强通风并确认泄漏源。',
      area: '乙烯罐区',
      time: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
      level: 'medium',
    },
    {
      id: 'al-3',
      title: '温度偏高',
      detail: '温度趋势偏离正常区间，请关注后续变化。',
      area: '公用工程区',
      time: new Date(now.getTime() - 16 * 60 * 1000).toISOString(),
      level: 'low',
    },
  ];
}
