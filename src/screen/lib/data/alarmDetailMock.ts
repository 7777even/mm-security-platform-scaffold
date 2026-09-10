import { fireAlarmMarker, type AlarmItem } from './mock';
import type { FireAlarmItem } from '@/services/alarm';
import type { FacilityAlarmItem } from './fireFacilityMonitoringMock';
import { fireFacilityFaults } from './fireFacilityMonitoringMock';
import type { ProductionAlarmItem } from '@/services/production';
import type { PatrolAlarmItem, PerimeterAlarmDetail } from '@/services/security';
import fireAlarmPipeRack from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import securityPerimeterIntrusion from '../../assets/semantic-scenes/security-perimeter-intrusion.png';
import chemicalFactoryPipes from '../../assets/mock-cameras/chemical_factory_pipes_1782731393637.png';
import chemicalPlantReactor from '../../assets/mock-cameras/chemical_plant_reactor_1782731378222.png';
import outdoorStorageTanks from '../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png';

export type AlarmDetailType = 'DCS' | 'GDS' | '消防' | '视频AI' | '气象' | '雷电' | '周界';
export type AlarmDetailStatus = '未确认' | '已确认' | '处理中' | '已处理';
export type FalseAlarmStatus = '是' | '否' | '未核实';

export interface AlarmTrendSeries {
  name: string;
  data: number[];
}

export interface AlarmDetailItem {
  id: string;
  alarmCode: string;
  title: string;
  alarmType: AlarmDetailType;
  source: string;
  level: string;
  status: AlarmDetailStatus;
  falseAlarm: FalseAlarmStatus;
  time: string;
  objectType: string;
  objectName: string;
  location: string;
  description: string;
  deviceType?: string;
  deviceId?: string;
  point?: string;
  typeFields: Record<string, string | string[]>;
  images?: string[];
  imageLabels?: string[];
  trend?: {
    unit: string;
    duration: string;
    times: string[];
    series: AlarmTrendSeries[];
    thresholds: { label: string; value: number }[];
  };
  longitude: number;
  latitude: number;
  dispatchPersonnel: string[];
  notifyApp: boolean;
  notifySms: boolean;
  handleResult: string;
  handleTime: string;
  attachments: string[];
  timeline: { time: string; operator: string; action: string; detail: string }[];
  rescueEventId?: number;
  monitorId?: string;
  monitorLabel?: string;
  workOrderNo?: string;
}

export const alarmDetailTypeOptions = [
  'DCS报警',
  'GDS报警',
  '消防报警',
  '视频AI',
  '气象预警',
  '雷电预警',
  '周界入侵',
] as const;

export const alarmDetailPersonnelOptions = ['张三', '王成', '李四', '赵五', '高策'] as const;

const FIRE_IMAGES = [fireAlarmPipeRack, chemicalFactoryPipes, outdoorStorageTanks];
const PROD_IMAGES = [chemicalFactoryPipes, chemicalPlantReactor, outdoorStorageTanks];
const SECURITY_IMAGES = [securityPerimeterIntrusion];

const BASE_LONGITUDE = 110.905;
const BASE_LATITUDE = 21.652;

function coordsFor(seed: string | number): { longitude: number; latitude: number } {
  const n =
    typeof seed === 'number' ? seed : seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const dx = (n % 7) * 0.008 - 0.024;
  const dy = ((n * 3) % 5) * 0.006 - 0.015;
  return { longitude: BASE_LONGITUDE + dx, latitude: BASE_LATITUDE + dy };
}

function baseTimeline(time: string, title: string) {
  return [{ time, operator: '系统', action: '产生告警', detail: title }];
}

function normalizeFireType(alarmType: string): AlarmDetailType {
  if (alarmType === 'GDS报警' || alarmType === 'GDS') return 'GDS';
  if (alarmType === '视频识别' || alarmType === '视频AI') return '视频AI';
  if (alarmType === '设备故障') return '消防';
  return '消防';
}

export function fireAlarmToDetail(alarm: AlarmItem): AlarmDetailItem {
  const type = normalizeFireType(alarm.alarmType);
  const images = type === '视频AI' ? SECURITY_IMAGES : FIRE_IMAGES;
  return {
    id: `fire-${alarm.id}`,
    alarmCode: `AL-20260820-${String(alarm.id).padStart(3, '0')}`,
    title: alarm.title,
    alarmType: type,
    source: alarm.source,
    level: alarm.titleColor === 'danger' ? '一级' : '二级',
    status: alarm.status === '未处置' ? '未确认' : alarm.status === '处置中' ? '处理中' : '已处理',
    falseAlarm: '未核实',
    time: alarm.time,
    objectType: '区域',
    objectName: alarm.title,
    location: alarm.location,
    description: alarm.description,
    point: alarm.monitorLabel,
    typeFields:
      type === '视频AI'
        ? { AI算法类型: alarm.alarmType, 关联摄像头: alarm.monitorId }
        : { 告警来源: alarm.source },
    images,
    imageLabels:
      type === '视频AI' ? ['周界现场抓拍'] : ['告警现场', '关联装置现场', '储罐区联动画面'],
    // 消防页告警与地图固定报警点共用同一厂区内坐标，保证卡片/弹窗详情定位一致。
    longitude: fireAlarmMarker.longitude,
    latitude: fireAlarmMarker.latitude,
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline(alarm.time, alarm.title),
    rescueEventId: alarm.rescueEventId,
    monitorId: alarm.onsiteMonitorId ?? alarm.monitorId,
    monitorLabel: alarm.onsiteMonitorLabel ?? alarm.monitorLabel,
  };
}

export function fireListItemToDetail(item: FireAlarmItem): AlarmDetailItem {
  const type = normalizeFireType(item.typeLabel);
  const images = type === '视频AI' ? SECURITY_IMAGES : FIRE_IMAGES;
  return {
    id: `fire-list-${item.alarmId}`,
    alarmCode: `AL-20260820-${String(item.alarmId).padStart(3, '0')}`,
    title: item.title,
    alarmType: type,
    source: item.source,
    level: item.level,
    status: item.status === 'CLOSED' ? '已处理' : '未确认',
    falseAlarm: item.falseAlarm === '是' ? '是' : '未核实',
    time: item.time,
    objectType: item.objectType,
    objectName: item.objectName,
    location: item.location,
    description: item.description,
    point: item.location,
    typeFields: { 告警来源: item.source, 告警对象: item.objectName },
    images,
    imageLabels:
      type === '视频AI' ? ['周界现场抓拍'] : ['告警现场', '关联装置现场', '储罐区联动画面'],
    ...coordsFor(item.alarmId),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline(item.time, item.title),
    rescueEventId: item.rescueEventId ? Number(item.rescueEventId) : undefined,
    monitorId: item.onsiteMonitorId ?? item.monitorId,
    monitorLabel: item.onsiteMonitorLabel ?? item.monitorLabel,
  };
}

export function facilityAlarmToDetail(alarm: FacilityAlarmItem): AlarmDetailItem {
  const fault = fireFacilityFaults.find((item) => item.faultCode === alarm.faultCode);
  return {
    id: `facility-${alarm.faultCode}`,
    alarmCode: alarm.id,
    title: alarm.content,
    alarmType: '消防',
    source: alarm.source,
    level: alarm.level === '紧急' ? '一级' : alarm.level === '重要' ? '二级' : '三级',
    status:
      alarm.status === '待确认'
        ? '未确认'
        : alarm.status === '已确认'
          ? '已确认'
          : alarm.status === '已派单' || alarm.status === '维修中'
            ? '处理中'
            : '已处理',
    falseAlarm: '未核实',
    time: alarm.time,
    objectType: '设施',
    objectName: alarm.facilityType,
    location: alarm.facilityType,
    description: alarm.content,
    deviceType: alarm.facilityType,
    deviceId: alarm.faultCode,
    point: alarm.source,
    typeFields: {
      告警分类: alarm.category,
      关联故障: alarm.faultCode,
      关联工单: fault?.workOrderNo ?? '—',
    },
    images: FIRE_IMAGES,
    imageLabels: ['告警现场', '关联装置现场', '储罐区联动画面'],
    ...coordsFor(alarm.faultCode),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: fault?.timeline ?? baseTimeline(alarm.time, alarm.content),
    workOrderNo: fault?.workOrderNo,
  };
}

export function productionAlarmToDetail(item: ProductionAlarmItem): AlarmDetailItem {
  const type: AlarmDetailType = /GDS|气体|浓度/i.test(item.title)
    ? 'GDS'
    : /DCS|温度|压力|液位/i.test(item.title)
      ? 'DCS'
      : '视频AI';
  const images = item.thumb ? [item.thumb] : PROD_IMAGES;
  return {
    id: `prod-${item.id}`,
    alarmCode: `AL-20260820-${String(item.id + 10).padStart(3, '0')}`,
    title: item.title,
    alarmType: type,
    source: type === '视频AI' ? '视频AI分析' : type === 'GDS' ? 'GDS系统' : 'DCS系统',
    level: item.titleColor === 'danger' ? '一级' : '二级',
    status: item.status === '未处置' ? '未确认' : item.status === '处置中' ? '处理中' : '已处理',
    falseAlarm: '未核实',
    time: item.time,
    objectType: '装置',
    objectName: item.title,
    location: item.location,
    description: item.description,
    typeFields: { 告警来源: item.title },
    images: type === '视频AI' ? images : undefined,
    imageLabels: ['现场抓拍'],
    trend:
      type !== '视频AI'
        ? {
            unit: type === 'GDS' ? 'ppm' : '℃',
            duration: '30min',
            times: ['11:18', '11:28', '11:38', '11:48', '11:58'],
            series: [{ name: '监测值', data: [120, 140, 165, 190, 180] }],
            thresholds: [{ label: '阈值', value: 170 }],
          }
        : undefined,
    ...coordsFor(item.id + 20),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline(item.time, item.title),
    monitorId: `cam-prod-${item.id}`,
    monitorLabel: item.title,
  };
}

export function patrolAlarmToDetail(item: PatrolAlarmItem): AlarmDetailItem {
  const type: AlarmDetailType = item.title.includes('入侵') ? '周界' : '视频AI';
  return {
    id: `patrol-${item.id}`,
    alarmCode: `AL-20260820-${String(item.id + 30).padStart(3, '0')}`,
    title: item.title,
    alarmType: type,
    source: type === '周界' ? '周界防范' : '视频AI分析',
    level: item.titleTone === 'danger' ? '一级' : '二级',
    status: item.status === '未处置' ? '未确认' : item.status === '处理中' ? '处理中' : '已处理',
    falseAlarm: '未核实',
    time: item.time,
    objectType: '区域',
    objectName: item.title,
    location: item.location,
    description: item.description,
    typeFields:
      type === '周界'
        ? { 入侵位置: item.location, 入侵方式: '翻越围栏', 关联摄像机: `CAM-PERI-${item.id}` }
        : { AI算法类型: item.title, 关联摄像头: `CAM-${item.id}` },
    images: SECURITY_IMAGES,
    imageLabels: ['周界现场抓拍'],
    ...coordsFor(item.id + 40),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline(item.time, item.title),
    monitorId: `cam-${item.id}`,
    monitorLabel: item.title,
  };
}

export function perimeterAlarmToDetail(
  alarm: PerimeterAlarmDetail,
  snapshotUrl?: string | null,
): AlarmDetailItem {
  const timeline = [
    { time: alarm.time, operator: '系统', action: '产生告警', detail: alarm.title },
  ];
  if (alarm.handleTime) {
    timeline.push({
      time: alarm.handleTime,
      operator: '安保值守',
      action: '处置完成',
      detail: alarm.handleResult || '已处置并闭环',
    });
  }
  return {
    id: `perimeter-${alarm.id}`,
    alarmCode: alarm.alarmCode,
    title: alarm.title,
    alarmType: '周界',
    source: alarm.source,
    level: alarm.level,
    status: normalizePerimeterStatus(alarm.status),
    falseAlarm: normalizeFalseAlarm(alarm.falseAlarm),
    time: alarm.time,
    objectType: alarm.objectType,
    objectName: alarm.objectName,
    location: alarm.location,
    description: alarm.description,
    deviceType: alarm.deviceType,
    deviceId: alarm.deviceId,
    point: alarm.point,
    typeFields: {
      入侵位置: alarm.intrusionPosition,
      入侵方式: alarm.intrusionMethod,
      关联摄像机: alarm.relatedCamera,
    },
    images: snapshotUrl ? [snapshotUrl] : [],
    imageLabels: snapshotUrl ? [alarm.snapshotLabel || '现场抓拍'] : [],
    longitude: alarm.longitude,
    latitude: alarm.latitude,
    dispatchPersonnel: alarm.dispatchPersonnel ?? [],
    notifyApp: alarm.notifyApp,
    notifySms: alarm.notifySms,
    handleResult: alarm.handleResult,
    handleTime: alarm.handleTime,
    attachments: [],
    timeline,
    rescueEventId: alarm.rescueEventId,
    monitorId: alarm.monitorId,
    monitorLabel: alarm.monitorLabel,
    workOrderNo: alarm.workOrderNo || undefined,
  };
}

function normalizePerimeterStatus(status: string): AlarmDetailStatus {
  if (status === '已确认') return '已确认';
  if (status === '处理中') return '处理中';
  if (status === '已处理') return '已处理';
  return '未确认';
}

function normalizeFalseAlarm(falseAlarm: string): FalseAlarmStatus {
  if (falseAlarm === '是') return '是';
  if (falseAlarm === '否') return '否';
  return '未核实';
}
