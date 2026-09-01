export interface RescueStat {
  label: string;
  value: number;
  unit: string;
  iconType: 'squad' | 'person' | 'vehicle' | 'equipment';
}

export interface SpecialOperationItem {
  id: number;
  label: string;
  count: number;
}

export interface EquipmentItem {
  id: number;
  name: string;
  count: number;
}

export interface AlarmItem {
  id: number;
  title: string;
  titleColor: 'danger' | 'warning';
  /** 告警类型，用于筛选 */
  alarmType: string;
  source: string;
  location: string;
  time: string;
  description: string;
  status: string;
  /** 关联应急事件 ID，用于处置调度 / 一键应急 */
  rescueEventId: number;
  /** 关联监控点位 */
  monitorId: string;
  monitorLabel: string;
  onsiteMonitorId: string;
  onsiteMonitorLabel: string;
  /** 可选地图点位，用于视频联动时将告警锚点固定在实际地理位置 */
  longitude?: number;
  latitude?: number;
}

export const fireAlarmTypeOptions = [
  '全部类型',
  '火灾告警',
  'GDS报警',
  '设备故障',
  '视频识别',
] as const;

export const fireAlarmStatusOptions = ['全部状态', '未处置', '处置中', '已处置'] as const;

export interface DutyPerson {
  id: number;
  name: string;
  phone: string;
  role: string;
}

export interface SystemMessage {
  id: number;
  type: 'danger' | 'warning';
  title: string;
  time: string;
  content: string;
}

export interface MapControl {
  key: string;
  label: string;
}

export const rescueStats: RescueStat[] = [
  { label: '消防队伍', value: 10, unit: '支', iconType: 'squad' },
  { label: '救援人员', value: 398, unit: '人', iconType: 'person' },
  { label: '救援装备', value: 123, unit: '套', iconType: 'equipment' },
  { label: '救援车辆', value: 83, unit: '台', iconType: 'vehicle' },
];

export const specialOperations: SpecialOperationItem[] = [
  { id: 1, label: '动火作业', count: 48 },
  { id: 2, label: '盲板抽堵', count: 3 },
  { id: 3, label: '吊装作业', count: 2 },
  { id: 4, label: '动土作业', count: 0 },
  { id: 5, label: '受限空间', count: 9 },
  { id: 6, label: '高处作业', count: 35 },
  { id: 7, label: '临时用电', count: 25 },
  { id: 8, label: '断路作业', count: 1 },
];

export const fireEquipmentCategories = [
  '火灾自动报警系统',
  '消防水源',
  '室外消火栓系统',
  '自动喷水灭火系统',
  '气体灭火系统',
  '泡沫灭火系统',
  '干粉灭火系统',
  '防烟排烟系统',
  '防火分隔设施',
  '消防应急广播',
  '应急照明及疏散指示系统',
  '消防电源',
] as const;

export const fireEquipment: EquipmentItem[] = fireEquipmentCategories.map((name, index) => ({
  id: index + 1,
  name,
  count: 665,
}));

export const equipmentStatus = {
  total: 1233,
  offline: 23,
  fault: 23,
  integrityRate: 98,
  onlineRate: 98,
};

export const alarms: AlarmItem[] = [
  {
    id: 1,
    title: 'A装置区火灾',
    titleColor: 'danger',
    alarmType: '火灾告警',
    source: '火灾报警',
    location: '化工区A装置西侧',
    time: '2026/03/17 14:21:30',
    description: 'A装置区域发现明火，请立即核实并启动处置。',
    status: '未处置',
    rescueEventId: 1,
    monitorId: 'cam-a-east',
    monitorLabel: 'A装置东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: 'A装置现场监控',
  },
  {
    id: 2,
    title: 'GDS报警',
    titleColor: 'warning',
    alarmType: 'GDS报警',
    source: 'DCS/GDS',
    location: '水东港区输油管廊',
    time: '2026/03/17 14:18:12',
    description: 'GDS检测到可燃气浓度短时升高，请现场复核。',
    status: '未处置',
    rescueEventId: 2,
    monitorId: 'cam-gds-01',
    monitorLabel: 'GDS联动监控',
    onsiteMonitorId: 'cam-gds-site',
    onsiteMonitorLabel: 'GDS现场监控',
  },
  {
    id: 3,
    title: 'A仓库失火',
    titleColor: 'danger',
    alarmType: '火灾告警',
    source: '火灾报警',
    location: '炼油区仓储区A库',
    time: '2026/03/17 13:56:08',
    description: '视频监控识别烟雾异常，疑似火点。',
    status: '未处置',
    rescueEventId: 3,
    monitorId: 'cam-store-a',
    monitorLabel: '仓储区监控',
    onsiteMonitorId: 'cam-store-site',
    onsiteMonitorLabel: '仓库现场监控',
  },
];

export const dutyPersons: DutyPerson[] = [
  { id: 1, name: '杨恒明', phone: '13792536966', role: '值班领导' },
  { id: 2, name: '高策', phone: '18300556145', role: '值班员' },
  { id: 3, name: '高策', phone: '18300556145', role: '值班员' },
];

export const systemMessages: SystemMessage[] = [
  {
    id: 1,
    type: 'danger',
    title: '人员违规进入',
    time: '2026-03-17 14:21:30',
    content: 'A装置区域发现非注册人员，请核实。',
  },
  {
    id: 2,
    type: 'warning',
    title: '有毒气体超标',
    time: '2026-03-17 14:21:30',
    content: 'A装置区域有毒气体浓度超过标准值200%，请相关人员立即撤离。',
  },
];

/** 消防页地图报警点（WGS84；位于厂区北侧装置区内部） */
export const fireAlarmMarker = {
  location: 'A装置区北侧',
  status: '火灾报警',
  /** 装置区.geojson 北侧厂区块内坐标 */
  longitude: 110.886,
  latitude: 21.6802,
};

export const mapControls: MapControl[] = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
