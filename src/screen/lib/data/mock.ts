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

// 值班人员：仅作后端 /emergency/duty 不可用时的兜底展示（DutyInfoPanel 使用）。
export const dutyPersons: DutyPerson[] = [
  { id: 1, name: '杨恒明', phone: '13792536966', role: '值班领导' },
  { id: 2, name: '高策', phone: '18300556145', role: '值班员' },
  { id: 3, name: '高策', phone: '18300556145', role: '值班员' },
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
