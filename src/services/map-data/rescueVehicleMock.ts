import {
  fetchRescueVehicles,
  type RescueVehicleItem as ServiceRescueVehicleItem,
} from '@/services/rescueResource';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

export type RescueVehicleStatus = '出动' | '空闲' | '维修中';

export interface RescueVehicleCrewMember {
  role: string;
  name: string;
  phone: string;
  certificate: string;
  dutyStatus: string;
}

export interface RescueVehicleOnboardEquipment {
  name: string;
  quantity: string;
  model: string;
  nextCheckDate: string;
  equipmentStatus: string;
  storageLocation: string;
}

export interface RescueVehicleItem {
  id: number;
  plate: string;
  type: string;
  squadron: string;
  leaderName: string;
  leaderPhone: string;
  status: RescueVehicleStatus;
  /** 业务对象名称，用于详情标题 */
  businessName: string;
  vehicleTypeFull: string;
  parkingLocation: string;
  chassisModel: string;
  manufactureDate: string;
  inspectionExpiry: string;
  foamTankVolume: string;
  waterTankVolume: string;
  maxWaterFlow: string;
  foamType: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  totalMileage: string;
  faultRecord: string;
  inspectionStatus: string;
  crew: RescueVehicleCrewMember[];
  onboardEquipment: RescueVehicleOnboardEquipment[];
  consumables: Array<{ label: string; value: string }>;
  dispatchSummary: Array<{ label: string; value: string }>;
}

export const rescueVehicleSquadrons = [
  '全部中队',
  '乙烯中队',
  '炼油中队',
  '罐区中队',
  '仓储中队',
  '码头中队',
  '芳烃中队',
  '特勤一中队',
  '特勤二中队',
] as const;

export const rescueVehicleTypes = [
  '全部类型',
  '泡沫车',
  '水罐消防车',
  '泡沫消防车',
  '抢险救援车',
  '登高平台消防车',
  '云梯消防车',
  '指挥车',
] as const;

const squadrons = rescueVehicleSquadrons.filter((s) => s !== '全部中队');
const types = rescueVehicleTypes.filter((t) => t !== '全部类型');
const statuses: RescueVehicleStatus[] = ['出动', '空闲', '维修中'];

const leaders = [
  { name: '张建', phone: '13677669527' },
  { name: '陈建', phone: '13665898855' },
  { name: '李伟', phone: '13788996655' },
  { name: '王磊', phone: '13977665544' },
];

function buildSampleVehicle(id: number): RescueVehicleItem {
  return {
    id,
    plate: '粤K-1231',
    type: '泡沫车',
    squadron: '乙烯中队',
    leaderName: '张建',
    leaderPhone: '13677669527',
    status: id % 3 === 0 ? '维修中' : id % 2 === 0 ? '空闲' : '出动',
    businessName: '泡沫车（粤 K-1231）',
    vehicleTypeFull: '泡沫消防车',
    parkingLocation: '乙烯中队消防车库 2 号车位',
    chassisModel: '重汽豪沃 ZZ5447V506HF6',
    manufactureDate: '2023-03-15',
    inspectionExpiry: '2027-03-15',
    foamTankVolume: '8m³',
    waterTankVolume: '12m³',
    maxWaterFlow: '120L/s',
    foamType: '抗溶泡沫液',
    lastMaintenanceDate: '2026-06-20',
    nextMaintenanceDate: '2026-09-20',
    totalMileage: '12680km',
    faultRecord: '近 3 个月无故障',
    inspectionStatus: '正常有效',
    crew: [
      {
        role: '车长',
        name: '张建',
        phone: '13677669527',
        certificate: '消防车辆操作证、危化处置证',
        dutyStatus: '在岗',
      },
      {
        role: '驾驶员',
        name: '刘阳',
        phone: '13865974412',
        certificate: 'A1 驾驶证、特种车辆准驾证',
        dutyStatus: '在岗',
      },
      {
        role: '战斗员',
        name: '周明',
        phone: '13978445611',
        certificate: '危化品应急救援证',
        dutyStatus: '备勤',
      },
    ],
    onboardEquipment: [
      {
        name: '空气呼吸器',
        quantity: '4 套',
        model: 'RHZKF6.8/30',
        nextCheckDate: '2026-08-05',
        equipmentStatus: '完好可用',
        storageLocation: '车辆左侧器材舱 A 格',
      },
    ],
    consumables: [
      { label: '抗溶泡沫液存量', value: '6.2m³' },
      { label: '备用水带规格 / 数量', value: 'DN80 水带 12 条、DN65 水带 8 条' },
      { label: '备用滤毒罐', value: '12 个' },
      { label: '应急照明设备', value: '4 套' },
    ],
    dispatchSummary: [
      { label: '本月出警次数', value: '3 次' },
      { label: '上次出警时间', value: '2026-06-28 14:20' },
      { label: '出警场景', value: '乙烯装置小型泄漏演练' },
    ],
  };
}

function buildItem(id: number): RescueVehicleItem {
  if (id <= 6) {
    const sample = buildSampleVehicle(id);
    return { ...sample, id, status: sample.status };
  }

  const leader = leaders[(id - 1) % leaders.length]!;
  const squadron = squadrons[(id - 1) % squadrons.length]!;
  const type = types[(id - 1) % types.length]!;
  const status = statuses[(id - 1) % statuses.length]!;
  const plate = `粤K-${String(1200 + id).padStart(4, '0')}`;

  return {
    id,
    plate,
    type,
    squadron,
    leaderName: leader.name,
    leaderPhone: leader.phone,
    status,
    businessName: `${type}（${plate}）`,
    vehicleTypeFull: type.includes('车') ? type : `${type}消防车`,
    parkingLocation: `${squadron}消防车库 ${(id % 8) + 1} 号车位`,
    chassisModel: `重汽豪沃 ZZ5447V506HF${id % 10}`,
    manufactureDate: '2022-08-10',
    inspectionExpiry: '2026-08-10',
    foamTankVolume: `${6 + (id % 4)}m³`,
    waterTankVolume: `${10 + (id % 5)}m³`,
    maxWaterFlow: `${100 + (id % 3) * 10}L/s`,
    foamType: '抗溶泡沫液',
    lastMaintenanceDate: '2026-06-01',
    nextMaintenanceDate: '2026-09-01',
    totalMileage: `${8000 + id * 120}km`,
    faultRecord: id % 9 === 0 ? '近 3 个月有 1 次轻微故障已修复' : '近 3 个月无故障',
    inspectionStatus: '正常有效',
    crew: [
      {
        role: '车长',
        name: leader.name,
        phone: leader.phone,
        certificate: '消防车辆操作证',
        dutyStatus: '在岗',
      },
      {
        role: '驾驶员',
        name: '刘阳',
        phone: '13865974412',
        certificate: 'A1 驾驶证、特种车辆准驾证',
        dutyStatus: status === '出动' ? '出警中' : '在岗',
      },
    ],
    onboardEquipment: [
      {
        name: '空气呼吸器',
        quantity: `${2 + (id % 4)} 套`,
        model: 'RHZKF6.8/30',
        nextCheckDate: '2026-08-05',
        equipmentStatus: '完好可用',
        storageLocation: '车辆左侧器材舱 A 格',
      },
    ],
    consumables: [
      { label: '抗溶泡沫液存量', value: `${(4 + (id % 5) * 0.4).toFixed(1)}m³` },
      { label: '备用水带规格 / 数量', value: 'DN80 水带 10 条、DN65 水带 6 条' },
      { label: '备用滤毒罐', value: `${8 + (id % 6)} 个` },
      { label: '应急照明设备', value: `${2 + (id % 3)} 套` },
    ],
    dispatchSummary: [
      { label: '本月出警次数', value: `${id % 5} 次` },
      { label: '上次出警时间', value: '2026-06-15 09:30' },
      { label: '出警场景', value: `${squadron}辖区应急演练` },
    ],
  };
}

/** 列表分页展示条目；业务总量 126 辆 */
export const rescueVehicleItems: RescueVehicleItem[] = Array.from({ length: 52 }, (_, i) =>
  buildItem(i + 1),
);

export const rescueVehicleTotalCount = 126;

export function getRescueVehicleItem(id: number | null | undefined): RescueVehicleItem | null {
  if (!id) return null;
  return rescueVehicleItems.find((item) => item.id === id) ?? null;
}

export function statusBadgeClass(status: RescueVehicleStatus): string {
  if (status === '出动') return 'vehicle-status--dispatch';
  if (status === '维修中') return 'vehicle-status--repair';
  return 'vehicle-status--idle';
}

function mapRescueVehicle(i: ServiceRescueVehicleItem): RescueVehicleItem {
  return {
    id: i.id,
    plate: i.plate ?? '',
    type: i.type ?? '',
    squadron: i.squadron ?? '',
    leaderName: i.leaderName ?? '',
    leaderPhone: i.leaderPhone ?? '',
    status: (i.status ?? '空闲') as RescueVehicleStatus,
    businessName: i.businessName ?? '',
    vehicleTypeFull: i.vehicleTypeFull ?? '',
    parkingLocation: i.parkingLocation ?? '',
    chassisModel: i.chassisModel ?? '',
    manufactureDate: i.manufactureDate ?? '',
    inspectionExpiry: i.inspectionExpiry ?? '',
    foamTankVolume: i.foamTankVolume ?? '',
    waterTankVolume: i.waterTankVolume ?? '',
    maxWaterFlow: i.maxWaterFlow ?? '',
    foamType: i.foamType ?? '',
    lastMaintenanceDate: i.lastMaintenanceDate ?? '',
    nextMaintenanceDate: i.nextMaintenanceDate ?? '',
    totalMileage: i.totalMileage ?? '',
    faultRecord: i.faultRecord ?? '',
    inspectionStatus: i.inspectionStatus ?? '',
    crew: (i.crew ?? []).map((c) => ({
      role: c.role ?? '',
      name: c.name ?? '',
      phone: c.phone ?? '',
      certificate: c.certificate ?? '',
      dutyStatus: c.dutyStatus ?? '',
    })),
    onboardEquipment: (i.onboardEquipment ?? []).map((e) => ({
      name: e.name ?? '',
      quantity: e.quantity ?? '',
      model: e.model ?? '',
      nextCheckDate: e.nextCheckDate ?? '',
      equipmentStatus: e.equipmentStatus ?? '',
      storageLocation: e.storageLocation ?? '',
    })),
    consumables: (i.consumables ?? []).map((k) => ({ label: k.label, value: k.value })),
    dispatchSummary: (i.dispatchSummary ?? []).map((k) => ({ label: k.label, value: k.value })),
  };
}

/** 救援车辆台账：demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态。 */
export async function loadRescueVehicles(): Promise<RescueVehicleItem[]> {
  const fb = resolveOfflineFetch(
    'rescue-resources',
    '/rescue-resources/vehicles',
    rescueVehicleItems,
    [],
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await fetchRescueVehicles();
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn(
        'rescue-resources',
        '/rescue-resources/vehicles',
        REASON_CONTRACT_MISMATCH,
      );
      return rescueVehicleItems;
    }
    return data.items.map(mapRescueVehicle);
  } catch {
    backendUnavailableWarn('rescue-resources', '/rescue-resources/vehicles');
    return rescueVehicleItems;
  }
}
