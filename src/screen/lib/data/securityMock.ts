export type EntryTab = 'person' | 'vehicle' | 'hazmat';

export interface PatrolZoneItem {
  label: string;
  iconIndex: number;
}

export interface Linkage5GItem {
  label: string;
  status: string;
  tone: 'green' | 'orange';
}

export interface PatrolAlarmItem {
  id: number;
  title: string;
  titleTone: 'danger' | 'warning' | 'success';
  description: string;
  location: string;
  time: string;
  status: string;
  statusTone: 'pending' | 'processing' | 'done';
}

export type BoundaryEdgeSide = 'north' | 'south' | 'east' | 'west';

export interface GateMarker {
  name: string;
  flow: string;
  edge: BoundaryEdgeSide;
}

export const entrySummary = {
  person: { enter: 4980, exit: 4560 },
  vehicle: { enter: 1260, exit: 980 },
  hazmat: { enter: 86, exit: 52 },
};

export const entryLineHours = ['7:00', '8:00', '9:00', '10:00', '11:00'] as const;

export const entryLineTrend: Record<EntryTab, { enter: number[]; exit: number[] }> = {
  person: {
    enter: [120, 165, 198, 210, 228],
    exit: [98, 142, 176, 188, 205],
  },
  vehicle: {
    enter: [32, 48, 55, 62, 58],
    exit: [28, 40, 46, 51, 49],
  },
  hazmat: {
    enter: [4, 8, 12, 10, 14],
    exit: [3, 6, 9, 8, 11],
  },
};

export const entryBreakdown: Record<EntryTab, { label: string; value: number; color: string }[]> = {
  person: [
    { label: '驻场人员', value: 100, color: '#5b8cff' },
    { label: '厂区职工', value: 150, color: '#37cfff' },
    { label: '其它', value: 11, color: '#3dd68c' },
  ],
  vehicle: [
    { label: '备案车辆', value: 420, color: '#5b8cff' },
    { label: '临时车辆', value: 280, color: '#37cfff' },
    { label: '其它', value: 36, color: '#3dd68c' },
  ],
  hazmat: [
    { label: '装车作业', value: 28, color: '#5b8cff' },
    { label: '卸车作业', value: 22, color: '#37cfff' },
    { label: '其它', value: 6, color: '#f0b429' },
  ],
};

/** @deprecated 使用 entryLineTrend */
export const entryAreaTrend = [42, 58, 76, 65, 88, 72, 95, 110, 98, 120, 105, 130];

/** @deprecated 使用 entryBreakdown */
export const entryPersonBreakdown = entryBreakdown.person;

export const patrolZones: PatrolZoneItem[] = [
  { label: '核心区防控', iconIndex: 0 },
  { label: '路网防控', iconIndex: 1 },
  { label: '周界防控', iconIndex: 2 },
  { label: '门禁卡口防控', iconIndex: 3 },
  { label: '外围防控', iconIndex: 4 },
];

export const linkage5GItems: Linkage5GItem[] = [
  { label: '声光报警', status: '已启动', tone: 'green' },
  { label: '短信通知', status: '已发送', tone: 'green' },
  { label: 'APP推送', status: '已推送', tone: 'green' },
  { label: '联动控制', status: '执行中', tone: 'orange' },
];

export const alarmTrendData = [12, 18, 15, 22, 28, 24, 32, 26, 35, 30];

export const patrolAlarms: PatrolAlarmItem[] = [
  {
    id: 1,
    title: '人员异常聚集',
    titleTone: 'danger',
    description: 'A装置区域发现异常人员聚集',
    location: '化工区 / A装置东北角',
    time: '2026-03-17 14:21:54',
    status: '未处置',
    statusTone: 'pending',
  },
  {
    id: 2,
    title: '超速行驶',
    titleTone: 'warning',
    description: '车牌粤K·A8821 超速通过东门卡口',
    location: '水东港区 / 港区卡口02',
    time: '2026-03-17 14:18:32',
    status: '处理中',
    statusTone: 'processing',
  },
  {
    id: 3,
    title: '超速行驶',
    titleTone: 'warning',
    description: '车牌粤K·B3310 超速通过南门卡口',
    location: '炼油区 / 南门卡口05',
    time: '2026-03-17 13:56:10',
    status: '已完成',
    statusTone: 'done',
  },
  {
    id: 4,
    title: '危险区域入侵',
    titleTone: 'success',
    description: '非授权人员进入危化品仓储区',
    location: '化工区 / 危化品仓储区',
    time: '2026-03-17 13:42:08',
    status: '已完成',
    statusTone: 'done',
  },
];

export const securityGates: GateMarker[] = [
  { name: '厂区北门', flow: '85%', edge: 'north' },
  { name: '厂区西门', flow: '85%', edge: 'west' },
  { name: '厂区南门', flow: '85%', edge: 'south' },
  { name: '厂区东门', flow: '85%', edge: 'east' },
];

/** 边界.geojson 四向边缘回退坐标（地图未就绪时使用） */
export const securityBoundaryEdgeFallback = {
  north: { longitude: 110.8776, latitude: 21.6898 },
  south: { longitude: 110.8806, latitude: 21.6707 },
  east: { longitude: 110.894, latitude: 21.6855 },
  west: { longitude: 110.8664, latitude: 21.6784 },
};

export const securityMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];

export type SecurityToolbarIconKey =
  | 'gate'
  | 'drone'
  | 'vehicleSearch'
  | 'personSearch'
  | 'comm'
  | 'meeting'
  | 'bollard'
  | 'blacklist';

export interface SecurityMapToolbarItem {
  key: SecurityToolbarIconKey;
  label: string;
}

export const securityMapToolbarItems: SecurityMapToolbarItem[] = [
  { key: 'gate', label: '道闸控制' },
  { key: 'drone', label: '无人机防御' },
  { key: 'vehicleSearch', label: '车辆检索' },
  { key: 'personSearch', label: '人员检索' },
  { key: 'comm', label: '设备通讯' },
  { key: 'meeting', label: '融合通讯会议' },
  { key: 'bollard', label: '液压防恐柱' },
  { key: 'blacklist', label: '黑名单' },
];

/** @deprecated 使用 securityMapToolbarItems */
export const securityMapToolbar = securityMapToolbarItems.map((item) => item.label);
