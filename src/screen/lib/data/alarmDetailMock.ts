import { fireAlarmMarker, type AlarmItem } from './mock';
import type { FireAlarmItem } from '@/services/alarm';
import type { FacilityAlarmItem } from './fireFacilityMonitoringMock';
import { fireFacilityFaults } from './fireFacilityMonitoringMock';
import type { ProductionAlarmItem } from '@/services/production';
import type { PatrolAlarmItem } from '@/services/security';
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

export const demoAlarmDetails: AlarmDetailItem[] = [
  {
    id: 'demo-dcs-1',
    alarmCode: 'AL-20260820-001',
    title: 'DCS温度越限报警',
    alarmType: 'DCS',
    source: 'DCS系统',
    level: '一级',
    status: '未确认',
    falseAlarm: '未核实',
    time: '2026-08-20 09:15:12',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    location: '化工区化工3路4号 蜡油加氢装置区一层',
    description: '反应器出口温度超过联锁阈值，请立即核实。',
    deviceType: '温度变送器',
    deviceId: 'TT-2103',
    point: 'R-2101 出口',
    typeFields: {
      仪表位号: 'TT-2103',
      工艺参数名: '反应器出口温度',
      当前值: '218℃',
      正常范围: '150-200℃',
      偏差幅度: '+9%',
    },
    trend: {
      unit: '℃',
      duration: '25min',
      times: ['11:18', '11:23', '11:28', '11:33', '11:38', '11:43', '11:48', '11:53', '11:58'],
      series: [{ name: '温度', data: [186, 192, 199, 205, 210, 214, 217, 219, 218] }],
      thresholds: [
        { label: '高高值', value: 215 },
        { label: '高值', value: 205 },
      ],
    },
    ...coordsFor('dcs'),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline('2026-08-20 09:15:12', 'DCS温度越限报警'),
    rescueEventId: 1,
    monitorId: 'cam-dcs-2103',
    monitorLabel: '蜡油加氢装置现场监控',
  },
  {
    id: 'demo-gds-1',
    alarmCode: 'AL-20260820-002',
    title: 'GDS硫化氢浓度报警',
    alarmType: 'GDS',
    source: 'GDS系统',
    level: '二级',
    status: '已确认',
    falseAlarm: '否',
    time: '2026-08-20 08:42:36',
    objectType: '装置',
    objectName: '硫磺回收装置',
    location: '化工区硫磺回收装置东侧',
    description: '硫化氢检测浓度 12ppm，超过 10ppm 报警阈值。',
    deviceType: '气体探测器',
    deviceId: 'GDS-H2S-12',
    point: 'EA-1201 东侧',
    typeFields: {
      气体类型: '硫化氢 H₂S',
      检测浓度: '12ppm',
      报警阈值: '10ppm',
      传感器型号: 'GDS-2100',
    },
    trend: {
      unit: 'ppm',
      duration: '18min',
      times: ['11:18', '11:23', '11:28', '11:33', '11:38', '11:43', '11:48', '11:53', '11:58'],
      series: [{ name: '浓度', data: [3, 5, 7, 9, 11, 12, 12, 11, 10] }],
      thresholds: [{ label: '报警阈值', value: 10 }],
    },
    ...coordsFor('gds'),
    dispatchPersonnel: ['王成'],
    notifyApp: true,
    notifySms: true,
    handleResult: '已通知属地班组现场复核',
    handleTime: '2026-08-20 09:02:18',
    attachments: [],
    timeline: [
      ...baseTimeline('2026-08-20 08:42:36', 'GDS硫化氢浓度报警'),
      {
        time: '2026-08-20 08:50:02',
        operator: '高策',
        action: '确认告警',
        detail: '确认为真实告警',
      },
      {
        time: '2026-08-20 09:02:18',
        operator: '高策',
        action: '提交处置',
        detail: '已通知属地班组现场复核',
      },
    ],
    monitorId: 'cam-gds-12',
    monitorLabel: '硫磺回收装置东侧监控',
  },
  {
    id: 'demo-fire-1',
    alarmCode: 'AL-20260820-003',
    title: '火灾报警（疑似明火）',
    alarmType: '消防',
    source: 'FAS火灾报警',
    level: '一级',
    status: '处理中',
    falseAlarm: '未核实',
    time: '2026-08-20 07:58:20',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    location: '化工区化工3路4号 蜡油加氢装置区一层',
    description: '蜡油加氢装置区疑似出现明火，请核实。',
    deviceType: '感烟探测器',
    deviceId: 'FAS-SMK-0112',
    point: '一层西侧',
    typeFields: {
      FAS控制器编号: 'FAS-C01',
      探测器类型: '感烟探测器',
      探测器地址码: '0112',
      联动设备: ['消防广播', '声光报警器', 'CCTV-001'],
    },
    images: FIRE_IMAGES,
    imageLabels: ['告警现场', '关联装置现场', '储罐区联动画面'],
    ...coordsFor('fire'),
    dispatchPersonnel: ['张三', '王成'],
    notifyApp: true,
    notifySms: true,
    handleResult: '消防队已出动，正在现场核实',
    handleTime: '2026-08-20 08:12:45',
    attachments: ['现场照片-01.jpg'],
    timeline: [
      ...baseTimeline('2026-08-20 07:58:20', '火灾报警（疑似明火）'),
      {
        time: '2026-08-20 08:01:12',
        operator: '高策',
        action: '确认告警',
        detail: '确认为真实告警',
      },
      { time: '2026-08-20 08:12:45', operator: '高策', action: '开始处置', detail: '消防队已出动' },
    ],
    rescueEventId: 1,
    monitorId: 'cam-fire-0112',
    monitorLabel: '蜡油加氢装置区一层监控',
    workOrderNo: 'WO-20260820-011',
  },
  {
    id: 'demo-video-1',
    alarmCode: 'AL-20260820-004',
    title: '视频AI：东门人员聚集',
    alarmType: '视频AI',
    source: '视频AI分析',
    level: '二级',
    status: '未确认',
    falseAlarm: '未核实',
    time: '2026-08-20 06:35:10',
    objectType: '区域',
    objectName: '厂区东门',
    location: '厂区东门 / 卡口02 附近',
    description: 'AI识别东门区域出现人员聚集，置信度 92%。',
    deviceType: 'AI摄像机',
    deviceId: 'CAM-EAST-02',
    point: '东门卡口',
    typeFields: {
      AI算法类型: '人员聚集',
      置信度: '92%',
      关联摄像头: 'CAM-EAST-02',
    },
    images: SECURITY_IMAGES,
    imageLabels: ['现场抓拍', 'AI标注图', '录像回放'],
    ...coordsFor('video'),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline('2026-08-20 06:35:10', '视频AI：东门人员聚集'),
    monitorId: 'cam-east-02',
    monitorLabel: '厂区东门监控',
  },
  {
    id: 'demo-weather-1',
    alarmCode: 'AL-20260820-005',
    title: '台风蓝色预警',
    alarmType: '气象',
    source: '气象监测',
    level: '三级',
    status: '已确认',
    falseAlarm: '否',
    time: '2026-08-20 05:00:00',
    objectType: '全厂',
    objectName: '茂名石化厂区',
    location: '全厂范围',
    description: '台风“海鸥”逼近，预计 24 小时内影响厂区，启动防台防汛Ⅲ级响应。',
    typeFields: {
      预警类型: '台风',
      预警等级: '蓝色',
      影响区域: '全厂范围',
    },
    ...coordsFor('weather'),
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: true,
    handleResult: '已发布防台防汛通知',
    handleTime: '2026-08-20 05:20:00',
    attachments: [],
    timeline: [
      ...baseTimeline('2026-08-20 05:00:00', '台风蓝色预警'),
      {
        time: '2026-08-20 05:20:00',
        operator: '杨恒朋',
        action: '确认告警',
        detail: '已确认并发布通知',
      },
    ],
  },
  {
    id: 'demo-lightning-1',
    alarmCode: 'AL-20260820-006',
    title: '雷电橙色预警',
    alarmType: '雷电',
    source: '雷电监测',
    level: '二级',
    status: '处理中',
    falseAlarm: '未核实',
    time: '2026-08-20 04:10:32',
    objectType: '区域',
    objectName: '罐区',
    location: '储运部罐区',
    description: '电场强度快速升高，预计 30 分钟内发生雷暴，注意防雷。',
    typeFields: {
      电场强度: '2.8kV/m',
      预警等级: '橙色',
      预计影响时间: '04:40 前后',
    },
    trend: {
      unit: 'kV/m',
      duration: '20min',
      times: ['03:50', '03:55', '04:00', '04:05', '04:10', '04:15', '04:20', '04:25', '04:30'],
      series: [{ name: '电场强度', data: [0.8, 1.1, 1.5, 1.9, 2.4, 2.6, 2.8, 2.7, 2.5] }],
      thresholds: [{ label: '橙色阈值', value: 2.5 }],
    },
    ...coordsFor('lightning'),
    dispatchPersonnel: ['李四'],
    notifyApp: true,
    notifySms: true,
    handleResult: '已通知储运部暂停高处作业',
    handleTime: '2026-08-20 04:25:00',
    attachments: [],
    timeline: [
      ...baseTimeline('2026-08-20 04:10:32', '雷电橙色预警'),
      { time: '2026-08-20 04:16:20', operator: '高策', action: '确认告警', detail: '确认预警' },
      {
        time: '2026-08-20 04:25:00',
        operator: '高策',
        action: '开始处置',
        detail: '通知储运部暂停高处作业',
      },
    ],
  },
  {
    id: 'demo-intrusion-1',
    alarmCode: 'AL-20260820-007',
    title: '周界入侵告警',
    alarmType: '周界',
    source: '周界防范',
    level: '一级',
    status: '未确认',
    falseAlarm: '未核实',
    time: '2026-08-20 03:22:48',
    objectType: '区域',
    objectName: '南门西侧周界',
    location: '厂区南门西侧 200 米',
    description: '非授权人员翻越周界进入厂区，请立即核实。',
    deviceType: '周界摄像机',
    deviceId: 'CAM-PERI-07',
    point: '南门西侧 200 米',
    typeFields: {
      入侵位置: '南门西侧 200 米',
      入侵方式: '翻越围栏',
      关联摄像机: 'CAM-PERI-07',
    },
    images: SECURITY_IMAGES,
    imageLabels: ['现场抓拍', '视频截图', '录像回放'],
    // 贴近「边界.geojson」南侧周界线，避免详情打开后点位飞到厂区外较远位置。
    longitude: 110.8872,
    latitude: 21.6709,
    dispatchPersonnel: [],
    notifyApp: true,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: baseTimeline('2026-08-20 03:22:48', '周界入侵告警'),
    monitorId: 'cam-peri-07',
    monitorLabel: '南门西侧周界监控',
  },
];

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

export function resolveDemoAlarmDetailById(id: string): AlarmDetailItem | undefined {
  return demoAlarmDetails.find((item) => item.id === id);
}
