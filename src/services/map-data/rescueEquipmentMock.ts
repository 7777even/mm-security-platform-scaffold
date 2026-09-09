import {
  fetchRescueEquipment,
  type RescueEquipmentItem as ServiceRescueEquipmentItem,
} from '@/services/rescueResource';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

export interface RescueEquipmentItem {
  id: number;
  name: string;
  squadron: string;
  quantity: number;
  leaderName: string;
  leaderPhone: string;
  /** 在库数量 */
  stockQuantity: number;
  /** 装备规格 */
  model: string;
  protectionType: string;
  filterCanister: string;
  maxContinuousUse: string;
  storageLocation: string;
  purchaseBatch: string;
  factoryValidityYears: string;
  remainingValidity: string;
  /** 运维管理 */
  lastInspectionDate: string;
  nextMandatoryMaintenanceDate: string;
  equipmentStatus: string;
  scrapWarning: string;
  issueRegistration: string;
  spareParts: string;
}

export const rescueEquipmentSquadrons = [
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

const equipmentNames = [
  '防毒面罩',
  '空气呼吸器',
  '消防水带',
  '手提式灭火器',
  '隔热服',
  '破拆工具组',
  '救生绳',
  '强光手电',
  '液压扩张器',
  '无齿锯',
  '正压式呼吸机',
  '化学防护服',
  '堵漏工具',
  '机动泵',
  '泡沫枪',
];

const squadrons = rescueEquipmentSquadrons.filter((s) => s !== '全部中队');
const leaders = [
  { name: '张建', phone: '17846865588' },
  { name: '陈建', phone: '13665898855' },
  { name: '李伟', phone: '13788996655' },
  { name: '王磊', phone: '13977665544' },
];

function buildItem(id: number): RescueEquipmentItem {
  const squadron = squadrons[(id - 1) % squadrons.length]!;
  const leader = leaders[(id - 1) % leaders.length]!;
  const name = equipmentNames[(id - 1) % equipmentNames.length]!;
  const quantity = 20 + ((id * 7) % 45);

  if (id === 1 && name === '防毒面罩') {
    return {
      id,
      name,
      squadron: '乙烯中队',
      quantity: 38,
      leaderName: '张建',
      leaderPhone: '17846865588',
      stockQuantity: 27,
      model: 'RD400 型全面罩防毒面具',
      protectionType: '综合防毒（有机蒸汽、酸性气体、粉尘）',
      filterCanister: 'A 型 P-K-1 滤毒罐',
      maxContinuousUse: '单次连续使用≤45 分钟',
      storageLocation: '乙烯中队一号装备库房 A 区 03 货架',
      purchaseBatch: '202405 消防应急采购',
      factoryValidityYears: '5 年',
      remainingValidity: '3 年 2 个月',
      lastInspectionDate: '2026-06-12',
      nextMandatoryMaintenanceDate: '2026-09-12',
      equipmentStatus: '正常可用',
      scrapWarning: '无',
      issueRegistration: '本月领用 3 套（应急演练使用）',
      spareParts: '备用面罩密封圈 15 个、备用滤毒罐 42 个',
    };
  }

  return {
    id,
    name,
    squadron,
    quantity,
    leaderName: leader.name,
    leaderPhone: leader.phone,
    stockQuantity: Math.max(8, quantity - 11),
    model: `${name}标准型-${String(id).padStart(3, '0')}`,
    protectionType: '综合防护',
    filterCanister: '通用型滤毒罐',
    maxContinuousUse: '单次连续使用≤60 分钟',
    storageLocation: `${squadron}装备库房 B 区 ${String((id % 12) + 1).padStart(2, '0')} 货架`,
    purchaseBatch: `2024${String((id % 12) + 1).padStart(2, '0')} 消防应急采购`,
    factoryValidityYears: '5 年',
    remainingValidity: `${3 + (id % 3)} 年 ${id % 12} 个月`,
    lastInspectionDate: '2026-06-01',
    nextMandatoryMaintenanceDate: '2026-09-01',
    equipmentStatus: id % 7 === 0 ? '待检修' : '正常可用',
    scrapWarning: id % 11 === 0 ? '接近报废年限' : '无',
    issueRegistration: `本月领用 ${id % 5} 套`,
    spareParts: '备用配件按台账配置',
  };
}

/** 列表数据（375 套为业务总量，列表按装备条目分页展示） */
export const rescueEquipmentItems: RescueEquipmentItem[] = Array.from({ length: 35 }, (_, i) =>
  buildItem(i + 1),
);

export const rescueEquipmentTotalSets = 375;

export function getRescueEquipmentItem(id: number | null | undefined): RescueEquipmentItem | null {
  if (!id) return null;
  return rescueEquipmentItems.find((item) => item.id === id) ?? null;
}

function mapRescueEquipment(i: ServiceRescueEquipmentItem): RescueEquipmentItem {
  return {
    id: i.id,
    name: i.name,
    squadron: i.squadron,
    quantity: i.quantity,
    leaderName: i.leaderName ?? '',
    leaderPhone: i.leaderPhone ?? '',
    stockQuantity: i.stockQuantity,
    model: i.model ?? '',
    protectionType: i.protectionType ?? '',
    filterCanister: i.filterCanister ?? '',
    maxContinuousUse: i.maxContinuousUse ?? '',
    storageLocation: i.storageLocation ?? '',
    purchaseBatch: i.purchaseBatch ?? '',
    factoryValidityYears: i.factoryValidityYears ?? '',
    remainingValidity: i.remainingValidity ?? '',
    lastInspectionDate: i.lastInspectionDate ?? '',
    nextMandatoryMaintenanceDate: i.nextMandatoryMaintenanceDate ?? '',
    equipmentStatus: i.equipmentStatus ?? '',
    scrapWarning: i.scrapWarning ?? '',
    issueRegistration: i.issueRegistration ?? '',
    spareParts: i.spareParts ?? '',
  };
}

/** 救援装备台账：未配置后端时回落本地 fixture；配置后走 /rescue-resources/equipment 真实端点。 */
export async function loadRescueEquipment(): Promise<RescueEquipmentItem[]> {
  if (!import.meta.env.VITE_API_BASE) return rescueEquipmentItems;
  try {
    const data = await fetchRescueEquipment();
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn(
        'rescue-resources',
        '/rescue-resources/equipment',
        REASON_CONTRACT_MISMATCH,
      );
      return rescueEquipmentItems;
    }
    return data.items.map(mapRescueEquipment);
  } catch {
    backendUnavailableWarn('rescue-resources', '/rescue-resources/equipment');
    return rescueEquipmentItems;
  }
}
