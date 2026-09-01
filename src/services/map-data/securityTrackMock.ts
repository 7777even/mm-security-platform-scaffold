import {
  buildSecurityTrackWaypoints,
  type SecurityTrackWaypointsConfig,
} from '@/services/map-data/geo/securityTrackRoute';
import {
  getPersonSearchDetail,
  getVehicleSearchDetail,
  type PersonSearchDetail,
  type VehicleSearchDetail,
} from './securitySearchMock';

export type { SecurityTrackWaypointsConfig };

export interface SecurityTrackTimelineItem {
  id: number;
  location: string;
  status: string;
  statusTone: 'enter' | 'exit' | 'pass';
  time: string;
  captureHint?: string;
}

export type SecurityTrackMode = 'vehicle' | 'person';

export function resolveSecurityTrackWaypoints(
  mode: SecurityTrackMode,
): SecurityTrackWaypointsConfig {
  return buildSecurityTrackWaypoints(mode);
}

const vehicleTimelineById: Record<number, SecurityTrackTimelineItem[]> = {
  1: [
    {
      id: 1,
      location: '东门-入',
      status: '入厂',
      statusTone: 'enter',
      time: '2026-01-20 09:12:08',
      captureHint: '东门卡口',
    },
    {
      id: 2,
      location: '主干道 A 段',
      status: '通行',
      statusTone: 'pass',
      time: '2026-01-20 09:18:33',
      captureHint: '路网抓拍',
    },
    {
      id: 3,
      location: '炼油一区',
      status: '到达',
      statusTone: 'pass',
      time: '2026-01-20 09:26:41',
      captureHint: '区域卡口',
    },
    {
      id: 4,
      location: '装卸点',
      status: '停留',
      statusTone: 'pass',
      time: '2026-01-20 10:05:12',
      captureHint: '装卸区监控',
    },
  ],
};

const personTimelineById: Record<number, SecurityTrackTimelineItem[]> = {
  1: [
    {
      id: 1,
      location: '西门-入',
      status: '入厂',
      statusTone: 'enter',
      time: '2026-01-20 08:02:15',
      captureHint: '门禁抓拍',
    },
    {
      id: 2,
      location: '行政楼通道',
      status: '通行',
      statusTone: 'pass',
      time: '2026-01-20 08:09:40',
      captureHint: '走廊监控',
    },
    {
      id: 3,
      location: '炼油二区',
      status: '到达',
      statusTone: 'pass',
      time: '2026-01-20 08:22:18',
      captureHint: '作业区门禁',
    },
    {
      id: 4,
      location: '检修平台',
      status: '作业',
      statusTone: 'pass',
      time: '2026-01-20 09:10:05',
      captureHint: '高处作业监控',
    },
  ],
};

const defaultVehicleTimeline: SecurityTrackTimelineItem[] = [
  { id: 1, location: '东门-入', status: '入厂', statusTone: 'enter', time: '2026-01-20 09:12:08' },
  { id: 2, location: '厂内路网', status: '通行', statusTone: 'pass', time: '2026-01-20 09:20:00' },
  { id: 3, location: '目标区域', status: '到达', statusTone: 'pass', time: '2026-01-20 09:35:22' },
];

const defaultPersonTimeline: SecurityTrackTimelineItem[] = [
  { id: 1, location: '北门-入', status: '入厂', statusTone: 'enter', time: '2026-01-20 08:00:12' },
  { id: 2, location: '厂区通道', status: '通行', statusTone: 'pass', time: '2026-01-20 08:15:30' },
  { id: 3, location: '作业区域', status: '到达', statusTone: 'pass', time: '2026-01-20 08:40:18' },
];

export function resolveSecurityTrackTimeline(
  mode: SecurityTrackMode,
  entityId: number | null,
): SecurityTrackTimelineItem[] {
  if (entityId == null) {
    return mode === 'vehicle' ? defaultVehicleTimeline : defaultPersonTimeline;
  }
  if (mode === 'vehicle') {
    return vehicleTimelineById[entityId] ?? defaultVehicleTimeline;
  }
  return personTimelineById[entityId] ?? defaultPersonTimeline;
}

export function resolveSecurityTrackTimeRange(
  mode: SecurityTrackMode,
  entityId: number | null,
): string {
  const timeline = resolveSecurityTrackTimeline(mode, entityId);
  if (timeline.length === 0) return '—';
  const start = timeline[0]!.time;
  const end = timeline[timeline.length - 1]!.time;
  return `${start} - ${end}`;
}

export function resolveSecurityTrackVehicleDetail(
  entityId: number | null,
): VehicleSearchDetail | null {
  return getVehicleSearchDetail(entityId ?? 1);
}

export function resolveSecurityTrackPersonDetail(
  entityId: number | null,
): PersonSearchDetail | null {
  return getPersonSearchDetail(entityId ?? 1);
}

export function resolveSecurityTrackStartLabel(mode: SecurityTrackMode): string {
  return mode === 'vehicle' ? '东门' : '西门';
}

export function resolveSecurityTrackEndLabel(mode: SecurityTrackMode): string {
  return mode === 'vehicle' ? '装卸点' : '作业区';
}
