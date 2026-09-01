import { designImg } from '@/utils/designAssets';
import { stagePercentStringToWorldPosition } from '@/utils/mapDesignGeo';
import productionPersonFall from '@/assets/map/semantic-scenes/production-person-fall.png';
import productionUnauthorizedEntry from '@/assets/map/semantic-scenes/production-unauthorized-entry.png';
import productionPersonGathering from '@/assets/map/semantic-scenes/production-person-gathering.png';
import productionGasLeak from '@/assets/map/semantic-scenes/production-gas-leak.png';

export interface OverviewGridItem {
  id: number;
  name: string;
  count: number;
  image: string;
}

export interface ProductionAlarmItem {
  id: number;
  title: string;
  titleColor: 'danger' | 'warning' | 'orange' | 'purple';
  location: string;
  time: string;
  description: string;
  status: string;
  thumb?: string;
  iconIndex: number;
}

export interface RiskWarningItem {
  id: number;
  location: string;
  type: string;
  time: string;
  person: string;
  phone: string;
  level: 'red' | 'orange' | 'yellow';
  levelLabel: string;
}

export interface StatOverviewItem {
  id: number;
  label: string;
  value: string;
  valueSuffix?: string;
  trend: number;
  trendUp: boolean;
  iconIndex: number;
}

export interface PersonnelMarker {
  id: number;
  left: string;
  top: string;
  longitude: number;
  latitude: number;
  location: string;
  count: number;
  markerIcon: string;
  popupBg: string;
  markerOuter: string;
  markerInner: string;
  markerDot: string;
  markerLine: string;
}

const module = 'production' as const;
const thumb = (suffix: string) => designImg(suffix, module);

export const facilityItems: OverviewGridItem[] = [
  { id: 1, name: '厂区', count: 596, image: 'image_0001.png' },
  { id: 2, name: '生产装置', count: 596, image: 'image_0008.png' },
  { id: 3, name: '仓库', count: 596, image: 'image_0006.png' },
  { id: 4, name: '重大危险源', count: 596, image: 'image_0012.png' },
  { id: 5, name: '储罐', count: 596, image: 'image_0007.png' },
];

export const deviceItems: OverviewGridItem[] = [
  { id: 1, name: '卡口/通道', count: 596, image: 'image_0002.png' },
  { id: 2, name: '监测点', count: 596, image: 'image_0009.png' },
  { id: 3, name: '人员定位', count: 596, image: 'image_0003.png' },
  { id: 4, name: '消防设施', count: 596, image: 'image_0010.png' },
  { id: 5, name: '通风设备', count: 596, image: 'image_0004.png' },
  { id: 6, name: '广播', count: 596, image: 'image_0011.png' },
  { id: 7, name: '电话', count: 596, image: 'image_0005.png' },
];

export const productionAlarms: ProductionAlarmItem[] = [
  {
    id: 1,
    title: '人员跌倒',
    titleColor: 'warning',
    location: '化工区乙烯装置东侧',
    time: '2026年3月17日 14:21:30',
    description: 'A装置区域发现人员跌倒。',
    status: '未处置',
    iconIndex: 0,
    thumb: productionPersonFall,
  },
  {
    id: 2,
    title: '人员违规进入',
    titleColor: 'danger',
    location: '水东港区第一作业区',
    time: '2026年3月17日 14:21:30',
    description: 'A装置区域发现非注册人员，请核实。',
    status: '未处置',
    iconIndex: 1,
    thumb: productionUnauthorizedEntry,
  },
  {
    id: 3,
    title: '人员聚集',
    titleColor: 'orange',
    location: '炼油区催化装置北侧',
    time: '2026年3月17日 14:21:30',
    description: 'A装置区域5人至30人，超过20人，超出50%。',
    status: '未处置',
    iconIndex: 2,
    thumb: productionPersonGathering,
  },
  {
    id: 4,
    title: '有毒气体超标',
    titleColor: 'purple',
    location: '化工区罐区南侧',
    time: '2026年3月17日 14:21:30',
    description: 'A装置区有毒气体超标200%，请关注。',
    status: '未处置',
    iconIndex: 3,
    thumb: productionGasLeak,
  },
];

export const riskSummary = { red: 0, orange: 0, yellow: 1 };

export const riskWarnings: RiskWarningItem[] = [
  {
    id: 1,
    location: '乙烯装置区（二）',
    type: '高温预警',
    time: '2026-03-17 02:00:46',
    person: '/A1',
    phone: '6/1N12345/6',
    level: 'yellow',
    levelLabel: '黄色',
  },
];

export const statOverview: StatOverviewItem[] = [
  { id: 1, label: '报警总数', value: '36', trend: 12, trendUp: false, iconIndex: 0 },
  { id: 2, label: '未处置告警', value: '12', trend: 8, trendUp: true, iconIndex: 1 },
  { id: 3, label: '已处置告警', value: '24', trend: 5, trendUp: false, iconIndex: 2 },
  { id: 4, label: '处置中告警', value: '6', trend: 3, trendUp: true, iconIndex: 3 },
  {
    id: 5,
    label: '平均处置时长',
    value: '18',
    valueSuffix: '分32秒',
    trend: 10,
    trendUp: false,
    iconIndex: 4,
  },
];

export const personnelMarkers: PersonnelMarker[] = [
  {
    id: 1,
    left: '54.2%',
    top: '25.3%',
    ...stagePercentStringToWorldPosition('54.2%', '25.3%'),
    location: '炼化厂区丙侧',
    count: 365,
    markerIcon: thumb('路径_0015.png'),
    popupBg: thumb('矩形_31.png'),
    markerOuter: thumb('圆形_41.png'),
    markerInner: thumb('圆形_42.png'),
    markerDot: thumb('圆形_43.png'),
    markerLine: thumb('矩形_60.png'),
  },
  {
    id: 2,
    left: '33.8%',
    top: '28.1%',
    ...stagePercentStringToWorldPosition('33.8%', '28.1%'),
    location: '炼化厂区丙侧',
    count: 365,
    markerIcon: thumb('路径_0016.png'),
    popupBg: thumb('矩形_31_0001.png'),
    markerOuter: thumb('圆形_41_0001.png'),
    markerInner: thumb('圆形_42_0001.png'),
    markerDot: thumb('圆形_43_0001.png'),
    markerLine: thumb('矩形_60_0001.png'),
  },
  {
    id: 3,
    left: '46.5%',
    top: '46.4%',
    ...stagePercentStringToWorldPosition('46.5%', '46.4%'),
    location: '炼化厂区丙侧',
    count: 365,
    markerIcon: thumb('路径_0017.png'),
    popupBg: thumb('矩形_31_0002.png'),
    markerOuter: thumb('圆形_41_0002.png'),
    markerInner: thumb('圆形_42_0002.png'),
    markerDot: thumb('圆形_43_0002.png'),
    markerLine: thumb('矩形_60_0002.png'),
  },
];

export const productionZoneOverlays = [
  { left: '27.9%', top: '31.6%', width: '17.5%', height: '19.1%' },
  { left: '44.9%', top: '28.7%', width: '25.6%', height: '17.7%' },
  { left: '36.0%', top: '45.6%', width: '24.2%', height: '20.6%' },
];

export const productionMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
