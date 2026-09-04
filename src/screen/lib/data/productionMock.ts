import { designImg } from '../../utils/designAssets';
import { stagePercentStringToWorldPosition } from '../../utils/mapDesignGeo';
import productionPersonFall from '../../assets/semantic-scenes/production-person-fall.png';
import productionUnauthorizedEntry from '../../assets/semantic-scenes/production-unauthorized-entry.png';
import productionPersonGathering from '../../assets/semantic-scenes/production-person-gathering.png';
import productionGasLeak from '../../assets/semantic-scenes/production-gas-leak.png';

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
    time: '2026-03-17 14:21:30',
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
    time: '2026-03-17 14:18:05',
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
    time: '2026-03-17 14:12:47',
    description: 'A装置区域5至30人，超过20人上限50%。',
    status: '处置中',
    iconIndex: 2,
    thumb: productionPersonGathering,
  },
  {
    id: 4,
    title: '有毒气体超标',
    titleColor: 'purple',
    location: '化工区罐区南侧',
    time: '2026-03-17 13:58:12',
    description: 'A装置区有毒气体超标200%，请关注。',
    status: '未处置',
    iconIndex: 3,
    thumb: productionGasLeak,
  },
  {
    id: 5,
    title: '人员滞留',
    titleColor: 'warning',
    location: '炼油区加氢装置二层',
    time: '2026-03-17 13:45:09',
    description: 'B装置区域同一人员停留超30分钟。',
    status: '未处置',
    iconIndex: 0,
    thumb: productionPersonFall,
  },
  {
    id: 6,
    title: '非注册人员闯入',
    titleColor: 'danger',
    location: '化工区苯乙烯罐组',
    time: '2026-03-17 13:30:51',
    description: '周界报警触发，请核实人员身份。',
    status: '已处置',
    iconIndex: 1,
    thumb: productionUnauthorizedEntry,
  },
  {
    id: 7,
    title: '区域超员',
    titleColor: 'orange',
    location: '水东港区码头平台',
    time: '2026-03-17 13:22:33',
    description: '实时人数28人，超出核定20人。',
    status: '未处置',
    iconIndex: 2,
    thumb: productionPersonGathering,
  },
  {
    id: 8,
    title: '可燃气体报警',
    titleColor: 'purple',
    location: '炼油区重整装置区',
    time: '2026-03-17 12:58:40',
    description: '可燃气探测器浓度达LEL 35%。',
    status: '未处置',
    iconIndex: 3,
    thumb: productionGasLeak,
  },
  {
    id: 9,
    title: '人员越界',
    titleColor: 'warning',
    location: '化工区管廊下方',
    time: '2026-03-17 12:40:18',
    description: '人员进入受限空间警戒区。',
    status: '处置中',
    iconIndex: 0,
    thumb: productionPersonFall,
  },
  {
    id: 10,
    title: '周界入侵',
    titleColor: 'danger',
    location: '港区危化品仓库周界',
    time: '2026-03-17 12:15:02',
    description: '西侧周界触发入侵报警。',
    status: '未处置',
    iconIndex: 1,
    thumb: productionUnauthorizedEntry,
  },
  {
    id: 11,
    title: '人员聚集',
    titleColor: 'orange',
    location: '炼油区硫磺回收装置',
    time: '2026-03-17 11:50:36',
    description: '区域瞬时人数22人，接近上限。',
    status: '已处置',
    iconIndex: 2,
    thumb: productionPersonGathering,
  },
  {
    id: 12,
    title: '有毒气体超标',
    titleColor: 'purple',
    location: '化工区EOEG装置',
    time: '2026-03-17 11:28:54',
    description: 'H2S浓度超标120%，已联动通风。',
    status: '未处置',
    iconIndex: 3,
    thumb: productionGasLeak,
  },
  {
    id: 13,
    title: '人员跌倒',
    titleColor: 'warning',
    location: '水东港区罐区巡检通道',
    time: '2026-03-17 10:55:21',
    description: '巡检人员疑似跌倒，画面需复核。',
    status: '未处置',
    iconIndex: 0,
    thumb: productionPersonFall,
  },
  {
    id: 14,
    title: '非注册车辆进入',
    titleColor: 'danger',
    location: '炼油区东门卡口',
    time: '2026-03-17 10:30:44',
    description: '无权限车辆驶入生产区。',
    status: '处置中',
    iconIndex: 1,
    thumb: productionUnauthorizedEntry,
  },
];

export const riskSummary = { red: 2, orange: 3, yellow: 2 };

export const riskWarnings: RiskWarningItem[] = [
  {
    id: 1,
    location: '乙烯装置区（二）',
    type: '高温预警',
    time: '2026-03-17 02:00:46',
    person: '王立军',
    phone: '1380255****',
    level: 'red',
    levelLabel: '红色',
  },
  {
    id: 2,
    location: '重整装置区',
    type: '压力异常',
    time: '2026-03-17 03:12:18',
    person: '李建国',
    phone: '1390288****',
    level: 'red',
    levelLabel: '红色',
  },
  {
    id: 3,
    location: '罐区（三）',
    type: '泄漏预警',
    time: '2026-03-17 04:25:09',
    person: '陈志强',
    phone: '1370900****',
    level: 'orange',
    levelLabel: '橙色',
  },
  {
    id: 4,
    location: '催化装置区',
    type: '温度偏高',
    time: '2026-03-17 05:40:33',
    person: '赵伟',
    phone: '1350666****',
    level: 'orange',
    levelLabel: '橙色',
  },
  {
    id: 5,
    location: '水东港区作业区',
    type: '风速超限',
    time: '2026-03-17 06:18:55',
    person: '黄国强',
    phone: '1360200****',
    level: 'orange',
    levelLabel: '橙色',
  },
  {
    id: 6,
    location: '苯乙烯装置区',
    type: '液位预警',
    time: '2026-03-17 07:02:11',
    person: '周敏',
    phone: '1880255****',
    level: 'yellow',
    levelLabel: '黄色',
  },
  {
    id: 7,
    location: '港区储罐区',
    type: '温度预警',
    time: '2026-03-17 07:45:02',
    person: '吴涛',
    phone: '1890288****',
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
