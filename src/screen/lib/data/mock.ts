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
  /** 消防报警真实主键（fac_fire_alarm.alarmId），仅消防报警源携带，用于详情写回落库 */
  fireAlarmId?: string;
  /** 可选地图点位，用于视频联动时将告警锚点固定在实际地理位置 */
  longitude?: number;
  latitude?: number;
}

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
