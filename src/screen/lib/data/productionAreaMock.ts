import {
  facilityItems,
  productionAlarms,
  type OverviewGridItem,
  type ProductionAlarmItem,
} from './productionMock';

export interface ProductionAreaMetric {
  id: number;
  label: string;
  value: string;
}

export interface ProductionAreaZone {
  id: string;
  name: string;
  alarmCount: number;
  zoneIndex: number;
}

export interface ProductionAreaPersonnelSlice {
  name: string;
  value: number;
  color: string;
}

export interface ProductionAreaDetail {
  facilityId: number;
  facilityName: string;
  zones: ProductionAreaZone[];
  metrics: ProductionAreaMetric[];
  personnelTotal: number;
  personnelSlices: ProductionAreaPersonnelSlice[];
  alarms: ProductionAlarmItem[];
}

const metricLabels = [
  '重大危险源',
  '生产装置',
  '门禁闸机',
  '视频监控',
  '厂播',
  '电话',
  '仓库',
  '储罐',
  '监测点位',
  '通风设备',
  '灭火设施',
  '无线通讯',
] as const;

function buildMetrics(seed: number): ProductionAreaMetric[] {
  return metricLabels.map((label, index) => ({
    id: index + 1,
    label,
    value: String(520 + ((seed * 17 + index * 13) % 90)),
  }));
}

function buildZones(facilityName: string): ProductionAreaZone[] {
  return [
    { id: 'a', name: `A${facilityName}`, alarmCount: 2, zoneIndex: 0 },
    { id: 'b', name: `B${facilityName}`, alarmCount: 1, zoneIndex: 1 },
    { id: 'c', name: `C${facilityName}`, alarmCount: 0, zoneIndex: 2 },
  ];
}

function buildPersonnel(seed: number): { total: number; slices: ProductionAreaPersonnelSlice[] } {
  const contractor = 8 + (seed % 5);
  const visitor = 3 + (seed % 4);
  const employee = 20 + (seed % 8);
  return {
    total: employee + contractor + visitor,
    slices: [
      { name: '本厂人员', value: employee, color: '#3ec6ff' },
      { name: '承包商', value: contractor, color: '#f0c429' },
      { name: '访客', value: visitor, color: '#8aa4c4' },
    ],
  };
}

const detailByFacilityId = new Map<number, ProductionAreaDetail>();

for (const facility of facilityItems) {
  const personnel = buildPersonnel(facility.id);
  detailByFacilityId.set(facility.id, {
    facilityId: facility.id,
    facilityName: facility.name,
    zones: buildZones(facility.name),
    metrics: buildMetrics(facility.id),
    personnelTotal: personnel.total,
    personnelSlices: personnel.slices,
    alarms: productionAlarms.map((alarm) => ({
      ...alarm,
      location: `${facility.name}区域`,
      description: alarm.description.replace(/A装置/g, facility.name),
    })),
  });
}

export function resolveProductionAreaDetail(facilityId?: number | string): ProductionAreaDetail {
  const id = Number(facilityId);
  const found = Number.isFinite(id) ? detailByFacilityId.get(id) : undefined;
  if (found) return found;

  const fallback = facilityItems[0] as OverviewGridItem;
  return (
    detailByFacilityId.get(fallback.id) ?? {
      facilityId: fallback.id,
      facilityName: fallback.name,
      zones: buildZones(fallback.name),
      metrics: buildMetrics(fallback.id),
      personnelTotal: 35,
      personnelSlices: [
        { name: '本厂人员', value: 24, color: '#3ec6ff' },
        { name: '承包商', value: 8, color: '#f0c429' },
        { name: '访客', value: 3, color: '#8aa4c4' },
      ],
      alarms: productionAlarms,
    }
  );
}

export function resolveFacilityItem(facilityId?: number | string): OverviewGridItem {
  const id = Number(facilityId);
  return facilityItems.find((item) => item.id === id) ?? facilityItems[0]!;
}
