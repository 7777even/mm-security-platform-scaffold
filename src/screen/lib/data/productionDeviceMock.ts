import { stagePercentStringToWorldPosition } from '../../utils/mapDesignGeo';
import { deviceItems } from './productionMock';

export type ProductionDeviceStatus = '正常' | '离线' | '故障';

/** 与设备总览卡片名称对应 */
export type ProductionDeviceCategory =
  '卡口/通道' | '监测点' | '人员定位' | '消防设施' | '通风设备' | '广播' | '电话';

export interface ProductionDeviceItem {
  id: number;
  name: string;
  type: string;
  category: ProductionDeviceCategory;
  area: string;
  status: ProductionDeviceStatus;
  longitude: number;
  latitude: number;
}

export const productionDevicePageSize = 10;

export const productionDeviceStatusOptions = ['全部状态', '正常', '离线', '故障'] as const;

const areas = ['炼油区', '化工区', '储运区', '公用工程区', '乙烯区'] as const;
const statuses: ProductionDeviceStatus[] = ['正常', '正常', '正常', '离线', '故障'];

const categoryTypeMap: Record<ProductionDeviceCategory, string[]> = {
  '卡口/通道': ['门禁闸机', '车辆通道', '人行通道'],
  监测点: ['气体监测', '压力监测', '温度监测'],
  人员定位: ['定位基站', '定位标签网关'],
  消防设施: ['自动喷水设备', '泡沫灭火设备', '气体灭火设备'],
  通风设备: ['自动通风设备', '强制排风设备'],
  广播: ['厂区广播', '应急广播'],
  电话: ['固定电话', '应急电话'],
};

const namePrefixMap: Record<ProductionDeviceCategory, string[]> = {
  '卡口/通道': ['东门卡口', '西门卡口', '南门通道', '北门通道', '罐区通道'],
  监测点: ['催化裂解监测', '乙烯装置监测', '罐区监测', '管廊监测'],
  人员定位: ['炼油区定位', '化工区定位', '罐区定位'],
  消防设施: ['催化裂解装置自动喷淋', '罐区泡沫炮', '装置气体灭火'],
  通风设备: ['泵房通风', '配电室通风', '装置排风'],
  广播: ['厂区广播点', '装置广播', '罐区广播'],
  电话: ['值班电话', '应急电话', '装置电话'],
};

const basePositions = [
  ['38%', '30%'],
  ['42%', '34%'],
  ['46%', '28%'],
  ['50%', '36%'],
  ['54%', '32%'],
  ['58%', '40%'],
  ['40%', '44%'],
  ['48%', '48%'],
  ['56%', '46%'],
  ['44%', '52%'],
  ['52%', '54%'],
  ['60%', '50%'],
  ['36%', '38%'],
  ['62%', '34%'],
  ['45%', '42%'],
] as const;

function buildDevicesForCategory(
  category: ProductionDeviceCategory,
  startId: number,
): ProductionDeviceItem[] {
  const types = categoryTypeMap[category];
  const prefixes = namePrefixMap[category];
  const count = 12;
  const list: ProductionDeviceItem[] = [];

  for (let i = 0; i < count; i += 1) {
    const pos = basePositions[i % basePositions.length]!;
    const jitter = (startId + i) * 0.00008;
    const world = stagePercentStringToWorldPosition(pos[0], pos[1]);
    const type = types[i % types.length]!;
    const prefix = prefixes[i % prefixes.length]!;
    list.push({
      id: startId + i,
      name: `${prefix}${i + 1}#`,
      type,
      category,
      area: areas[i % areas.length]!,
      status: statuses[i % statuses.length]!,
      longitude: world.longitude + jitter,
      latitude: world.latitude + jitter * 0.6,
    });
  }
  return list;
}

export const productionDevices: ProductionDeviceItem[] = deviceItems.flatMap((item, index) =>
  buildDevicesForCategory(item.name as ProductionDeviceCategory, index * 100 + 1),
);

export function getDevicesByCategory(
  category: ProductionDeviceCategory | null,
): ProductionDeviceItem[] {
  if (!category) return productionDevices;
  return productionDevices.filter((d) => d.category === category);
}

export function resolveDeviceCategoryTitle(category: ProductionDeviceCategory | null): string {
  if (!category) return '设备列表';
  if (category === '消防设施') return '自动灭火设备';
  return `${category}列表`;
}

export function statusTone(status: ProductionDeviceStatus): 'ok' | 'offline' | 'fault' {
  if (status === '正常') return 'ok';
  if (status === '离线') return 'offline';
  return 'fault';
}
