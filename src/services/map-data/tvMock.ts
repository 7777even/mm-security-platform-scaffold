import { stagePercentToWorldPosition } from '@/utils/mapDesignGeo';
import type { BoundaryEdgeSide } from '@/composables/sharedCesiumBridge';
import type { ConcretePlantAreaCode } from './plantAreas';

export interface VideoOverviewItem {
  id: number;
  label: string;
  value: number;
  iconIndex: number;
}

export interface EventBreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface ImportantVideoItem {
  id: number;
  label: string;
  online: boolean;
}

export interface InspectionVehicleItem {
  id: number;
  areaCode: ConcretePlantAreaCode;
  plate: string;
  badge: string;
  gate: string;
  time: string;
}

export interface TvMapPin {
  label: string;
  labelBgIndex: number;
  outerIndex: number;
  iconIndex: number;
  edge: BoundaryEdgeSide;
}

export interface TvInspectionCircle {
  id: string;
  variant: number;
  longitude: number;
  latitude: number;
  radiusMeters: number;
  height?: number;
}

export interface InspectionPersonItem {
  id: number;
  areaCode: ConcretePlantAreaCode;
  name: string;
  badge: string;
  department: string;
  gate: string;
  time: string;
}

export type TvVideoPointGroupKey = 'high-ar' | 'focus' | 'hazard' | 'boundary';

export interface TvVideoMapPoint {
  id: string;
  label: string;
  group: TvVideoPointGroupKey;
  longitude: number;
  latitude: number;
  height?: number;
  online: boolean;
}

function createTvVideoMapPoint(
  id: string,
  label: string,
  group: TvVideoPointGroupKey,
  stageX: number,
  stageY: number,
  online = true,
): TvVideoMapPoint {
  const world = stagePercentToWorldPosition(stageX, stageY);
  return { id, label, group, ...world, height: 74, online };
}

/** 工业视频地图撒点模拟数据，初始化时将设计舞台坐标转换为 WGS84 经纬度。 */
export const tvVideoMapPoints: TvVideoMapPoint[] = [
  createTvVideoMapPoint('ar-01', '高空AR-01', 'high-ar', 50.2, 17.5),
  createTvVideoMapPoint('ar-02', '高空AR-02', 'high-ar', 61.8, 24.5),
  createTvVideoMapPoint('ar-03', '高空AR-03', 'high-ar', 43.5, 31.8),
  createTvVideoMapPoint('focus-01', '储罐区东侧球机', 'focus', 47.8, 35.2),
  createTvVideoMapPoint('focus-02', '乙烯装置入口', 'focus', 55.1, 29.4),
  createTvVideoMapPoint('focus-03', '管廊巡检点A', 'focus', 58.7, 41.2),
  createTvVideoMapPoint('focus-04', '装卸区监控', 'focus', 42.2, 44.5, false),
  createTvVideoMapPoint('hazard-01', '储罐区B-3', 'hazard', 49.7, 27.2),
  createTvVideoMapPoint('hazard-02', '催化裂化装置', 'hazard', 52.9, 38.7),
  createTvVideoMapPoint('hazard-03', '加氢装置区', 'hazard', 46.4, 23.8),
  createTvVideoMapPoint('hazard-04', '液化烃罐区', 'hazard', 59.8, 34.6),
  createTvVideoMapPoint('boundary-01', '厂区西门', 'boundary', 40.5, 31.2),
  createTvVideoMapPoint('boundary-02', '厂区北门', 'boundary', 51.8, 15.8),
  createTvVideoMapPoint('boundary-03', '厂界东侧', 'boundary', 63.3, 31.5),
  createTvVideoMapPoint('boundary-04', '厂界南侧', 'boundary', 52.6, 50.8, false),
];

export const videoOverviewItems: VideoOverviewItem[] = [
  { id: 1, label: '重大危险源', value: 665, iconIndex: 0 },
  { id: 2, label: '生产设施', value: 56, iconIndex: 1 },
  { id: 3, label: '厂界', value: 56, iconIndex: 2 },
  { id: 4, label: '封闭入口', value: 55, iconIndex: 3 },
  { id: 5, label: '其他入口', value: 66, iconIndex: 4 },
  { id: 6, label: '其它', value: 6, iconIndex: 5 },
];

export const videoOperationStats = {
  total: 1233,
  offline: 23,
  fault: 23,
  integrityRate: 98,
  onlineRate: 98,
};

export const maintenanceOrders = [
  { label: '未接单', value: 12, tone: 'grey' as const },
  { label: '处理中', value: 25, tone: 'blue' as const },
  { label: '已超时', value: 8, tone: 'red' as const },
];

export const eventAlertTotal = 110;

export const eventBreakdown: EventBreakdownItem[] = [
  { label: '人员闯入', value: 150, color: '#5b8cff' },
  { label: '烟火检测', value: 100, color: '#6a8fd8' },
  { label: '未戴安全帽', value: 150, color: '#3dd68c' },
  { label: '区域入侵', value: 152, color: '#f0b429' },
  { label: '设备异常', value: 120, color: '#ff6b6b' },
  { label: '其他', value: 48, color: '#b07aff' },
];

export const eventTotal = 450;

export const importantVideos: ImportantVideoItem[] = [
  { id: 1, label: '化工区/乙烯装置-1', online: true },
  { id: 2, label: '水东港区/码头-2', online: true },
  { id: 3, label: '炼油区/储罐区-3', online: true },
  { id: 4, label: '化工区/罐区-4', online: true },
  { id: 5, label: '博贺港区/泊位-5', online: true },
  { id: 6, label: '炼油区/装置区-6', online: false },
];

export const inspectionVehicles: InspectionVehicleItem[] = [
  {
    id: 1,
    areaCode: 'refinery',
    plate: '粤KAA543',
    badge: '入厂',
    gate: '3#门-入',
    time: '2026-03-17 10:22:23',
  },
  {
    id: 2,
    areaCode: 'refinery',
    plate: '粤K·D8621',
    badge: '出厂',
    gate: '2#门-出',
    time: '2026-03-17 10:19:46',
  },
  {
    id: 3,
    areaCode: 'refinery',
    plate: '粤K·B3310',
    badge: '入厂',
    gate: '南门-入',
    time: '2026-03-17 10:16:08',
  },
  {
    id: 4,
    areaCode: 'refinery',
    plate: '粤K·A8821',
    badge: '出厂',
    gate: '东门-出',
    time: '2026-03-17 10:11:35',
  },
  {
    id: 5,
    areaCode: 'refinery',
    plate: '粤K·F2076',
    badge: '入厂',
    gate: '1#门-入',
    time: '2026-03-17 10:07:12',
  },
  {
    id: 6,
    areaCode: 'chemical',
    plate: '粤K·C5198',
    badge: '出厂',
    gate: '3#门-出',
    time: '2026-03-17 10:02:54',
  },
  {
    id: 7,
    areaCode: 'chemical',
    plate: '粤K·E7603',
    badge: '入厂',
    gate: '北门-入',
    time: '2026-03-17 09:58:31',
  },
  {
    id: 8,
    areaCode: 'port',
    plate: '粤K·H1265',
    badge: '出厂',
    gate: '2#门-出',
    time: '2026-03-17 09:53:17',
  },
];

export const inspectionPersons: InspectionPersonItem[] = [
  {
    id: 1,
    areaCode: 'refinery',
    name: '陈志强',
    badge: '员工',
    department: '炼油运行一部',
    gate: '3#门-入',
    time: '10:21:18',
  },
  {
    id: 2,
    areaCode: 'refinery',
    name: '李明辉',
    badge: '承包商',
    department: '广东安建',
    gate: '2#门-入',
    time: '10:18:42',
  },
  {
    id: 3,
    areaCode: 'refinery',
    name: '王晓峰',
    badge: '访客',
    department: '设备厂商',
    gate: '东门-入',
    time: '10:14:09',
  },
  {
    id: 4,
    areaCode: 'refinery',
    name: '周宇鹏',
    badge: '员工',
    department: '储运部',
    gate: '南门-出',
    time: '10:09:56',
  },
  {
    id: 5,
    areaCode: 'chemical',
    name: '黄建军',
    badge: '承包商',
    department: '石化检修',
    gate: '1#门-入',
    time: '10:05:23',
  },
  {
    id: 6,
    areaCode: 'port',
    name: '张伟东',
    badge: '员工',
    department: '安全环保部',
    gate: '3#门-出',
    time: '09:59:47',
  },
];

const alarmPos = stagePercentToWorldPosition(50.9, 45.6);

/** 巡检圆期望半径（米）；实际由边界模型自动计算以避免重叠 */
export const tvInspectionCircleRequestedRadius = 332;

/** 边界.geojson 四向边缘回退坐标（地图未就绪时使用） */
export const tvBoundaryEdgeFallback = {
  north: { longitude: 110.8776, latitude: 21.6898 },
  south: { longitude: 110.8806, latitude: 21.6707 },
  east: { longitude: 110.894, latitude: 21.6855 },
  west: { longitude: 110.8664, latitude: 21.6784 },
};

/** 监控点：绑定边界模型四向边缘 + 名称标签 */
export const tvMapPins: TvMapPin[] = [
  {
    label: '厂区西门',
    labelBgIndex: 0,
    outerIndex: 0,
    iconIndex: 0,
    edge: 'west',
  },
  {
    label: '油城一路',
    labelBgIndex: 1,
    outerIndex: 1,
    iconIndex: 1,
    edge: 'north',
  },
  {
    label: '油城二路',
    labelBgIndex: 2,
    outerIndex: 2,
    iconIndex: 2,
    edge: 'east',
  },
  {
    label: '油城三路',
    labelBgIndex: 3,
    outerIndex: 3,
    iconIndex: 3,
    edge: 'south',
  },
];

export const tvAlarmMarker = {
  ...alarmPos,
  location: '储罐区B-3',
  status: '压力报警',
};

export interface TvVideoMonitorDetail {
  id: string;
  name: string;
  online: boolean;
  integrity: string;
  monitorType: string;
  department: string;
  location: string;
  height: string;
  angle: string;
}

/** 地图视频标签 → 监控详情（可按标签扩展） */
export const tvVideoMonitorDetails: Record<string, Partial<TvVideoMonitorDetail>> = {
  厂区西门: { name: '炼油罐区-5#球机' },
  油城一路: { name: '油城一路-3#枪机' },
  油城二路: { name: '油城二路-2#球机' },
  油城三路: { name: '油城三路-1#球机' },
  '储罐区-1号监控': { name: '储罐区-1号监控' },
  管廊巡检点A: { name: '管廊巡检点A' },
  乙烯装置入口: { name: '乙烯装置入口', online: false, integrity: '一般' },
  南区卡口: { name: '南区卡口-2#球机' },
  催化裂化设备: { name: '催化裂化设备-1#枪机' },
  通风机房: { name: '通风机房-3#球机' },
  '监测点-C7': { name: '监测点-C7' },
};

const defaultVideoMonitorDetail: Omit<TvVideoMonitorDetail, 'id' | 'name'> = {
  online: true,
  integrity: '良好',
  monitorType: '球机',
  department: '安环部',
  location: `38°54'56"N, 121°38'42"E`,
  height: '15m',
  angle: '56°',
};

export function resolveTvVideoMonitorDetail(label: string, id?: string): TvVideoMonitorDetail {
  const preset = tvVideoMonitorDetails[label] ?? {};
  return {
    id: id ?? label,
    name: preset.name ?? label,
    ...defaultVideoMonitorDetail,
    ...preset,
  };
}

export interface TvInspectionScanPointDef {
  id: string;
  label: string;
  labelBgIndex: number;
  outerIndex: number;
  iconIndex: number;
  /** 相对圆心的东向偏移（米） */
  offsetEastMeters: number;
  /** 相对圆心的北向偏移（米） */
  offsetNorthMeters: number;
}

/** 巡检圆扫描完成后展示的模拟点位（相对圆心偏移） */
export const tvInspectionScanPointsByCircle: Record<string, TvInspectionScanPointDef[]> = {
  'inspection-north': [
    {
      id: 'scan-n1',
      label: '储罐区-1号监控',
      labelBgIndex: 0,
      outerIndex: 0,
      iconIndex: 0,
      offsetEastMeters: -95,
      offsetNorthMeters: 140,
    },
    {
      id: 'scan-n2',
      label: '管廊巡检点A',
      labelBgIndex: 1,
      outerIndex: 1,
      iconIndex: 1,
      offsetEastMeters: 120,
      offsetNorthMeters: -60,
    },
    {
      id: 'scan-n3',
      label: '乙烯装置入口',
      labelBgIndex: 2,
      outerIndex: 2,
      iconIndex: 2,
      offsetEastMeters: -40,
      offsetNorthMeters: -180,
    },
    {
      id: 'scan-n4',
      label: '消防栓-12',
      labelBgIndex: 3,
      outerIndex: 3,
      iconIndex: 3,
      offsetEastMeters: 200,
      offsetNorthMeters: 80,
    },
  ],
  'inspection-south': [
    {
      id: 'scan-s1',
      label: '南区卡口',
      labelBgIndex: 0,
      outerIndex: 0,
      iconIndex: 0,
      offsetEastMeters: 60,
      offsetNorthMeters: 100,
    },
    {
      id: 'scan-s2',
      label: '催化裂化设备',
      labelBgIndex: 1,
      outerIndex: 1,
      iconIndex: 1,
      offsetEastMeters: -150,
      offsetNorthMeters: -50,
    },
    {
      id: 'scan-s3',
      label: '通风机房',
      labelBgIndex: 2,
      outerIndex: 2,
      iconIndex: 2,
      offsetEastMeters: 80,
      offsetNorthMeters: -120,
    },
    {
      id: 'scan-s4',
      label: '监测点-C7',
      labelBgIndex: 3,
      outerIndex: 3,
      iconIndex: 3,
      offsetEastMeters: -70,
      offsetNorthMeters: 160,
    },
  ],
};

export const tvMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '3D视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
