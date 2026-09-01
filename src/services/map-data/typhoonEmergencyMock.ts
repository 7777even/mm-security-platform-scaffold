import { findFireEmergencyEventById } from './fireEmergencyEventsStore';
import type { DutyWatchPerson, KnowledgeItem } from './preliminaryMock';
import type { EmergencyDispatchResource } from './accidentRescueMock';

export const typhoonDispatchResources: EmergencyDispatchResource[] = [
  {
    id: 'flood-team-01',
    type: '救援队伍',
    name: '炼油防汛抢险一组',
    code: 'TEAM-FX-01',
    organization: '炼油分部应急中心',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.7,
    etaMinutes: 4,
    capacity: '12人 · 排涝与警戒',
    contact: '高策',
    phone: '18300556146',
    longitude: 110.8769,
    latitude: 21.6804,
  },
  {
    id: 'flood-vehicle-01',
    type: '应急车辆',
    name: '龙吸水排涝车',
    code: '粤K·PL018',
    organization: '消防救援中心',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.9,
    etaMinutes: 5,
    capacity: '排水能力 3000m³/h',
    contact: '陈伟',
    phone: '18300556148',
    longitude: 110.8791,
    latitude: 21.6787,
  },
  {
    id: 'flood-vehicle-02',
    type: '应急车辆',
    name: '大水牛排涝机器人',
    code: 'ROBOT-PL-02',
    organization: '特勤中队',
    area: '炼油区',
    status: '任务中',
    distanceKm: 1.4,
    etaMinutes: 8,
    capacity: '远程排涝 · 复杂水域作业',
    contact: '王磊',
    phone: '18300556145',
    longitude: 110.8831,
    latitude: 21.6742,
  },
  {
    id: 'flood-material-01',
    type: '应急物资',
    name: '移动式大功率排水泵',
    code: 'MAT-PUMP-031',
    organization: '炼油防汛物资库',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.8,
    etaMinutes: 5,
    capacity: '库存 8台 · 可用 6台',
    contact: '赵敏',
    phone: '18300556150',
    longitude: 110.8819,
    latitude: 21.681,
  },
  {
    id: 'flood-material-02',
    type: '应急物资',
    name: '防汛沙袋与挡水板',
    code: 'MAT-FX-016',
    organization: '炼油防汛物资库',
    area: '炼油区',
    status: '可调度',
    distanceKm: 1.1,
    etaMinutes: 6,
    capacity: '沙袋 1200只 · 挡水板 80m',
    contact: '赵敏',
    phone: '18300556150',
    longitude: 110.884,
    latitude: 21.6802,
  },
  {
    id: 'flood-expert-01',
    type: '应急专家',
    name: '梁海',
    code: 'EXP-FX-006',
    organization: '茂名石化防汛专家组',
    area: '炼油区',
    status: '可调度',
    distanceKm: 2.6,
    etaMinutes: 12,
    capacity: '厂区排水系统与防台研判',
    contact: '梁海',
    phone: '13802556012',
    longitude: 110.8738,
    latitude: 21.6833,
  },
];

export type MonitorObjectStatus = 'normal' | 'warning' | 'critical';

export interface TyphoonMonitorObject {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: MonitorObjectStatus;
  statusText: string;
}

export interface TyphoonRiskWarning {
  id: string;
  time: string;
  type: string;
  content: string;
}

export interface TyphoonMapRiskPoint {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  status: MonitorObjectStatus;
  statusText: string;
  responsibleUnit: string;
  predeployed: boolean;
  deployment: string;
  labelOffsetX?: number;
  labelOffsetY?: number;
  clusterCount?: number;
  kind?: 'risk' | 'resource';
  videoIds?: string[];
}

export interface TyphoonLiveVideo {
  id: string;
  label: string;
  sceneIndex: number;
  angle: string;
  status: 'online' | 'offline';
  deviceCode: string;
}

export interface TyphoonWeatherMetrics {
  temperature: string;
  windSpeed: string;
  humidity: string;
  windDirection: string;
}

export interface TyphoonEmergencyIncident {
  eventId: number;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
  startedAt: string;
  endedAt?: string;
  status: 'processing' | 'pending' | 'done';
  weatherMetrics: TyphoonWeatherMetrics;
  monitoringObjects: TyphoonMonitorObject[];
  meteorologySummary: string;
  riskWarnings: TyphoonRiskWarning[];
  weatherChartLabels: string[];
  precipitationSeries: number[];
  windSpeedSeries: number[];
  waterLevelLabels: string[];
  waterLevelSeries: number[];
  waterLevelWarn: number;
  waterLevelDanger: number;
  liveVideos: TyphoonLiveVideo[];
  auxiliaryItems: KnowledgeItem[];
  dutyPersons: DutyWatchPerson[];
  mapRiskPoints: TyphoonMapRiskPoint[];
  eventInfoFields: Array<{ label: string; value: string }>;
  /** istrongcloud 台风编号，如 202521 */
  typhoonApiCode?: string;
}

const defaultTyphoonIncident: TyphoonEmergencyIncident = {
  eventId: 100,
  title: '台风沙迦防台防汛工作',
  location: '全厂范围',
  longitude: 110.92,
  latitude: 21.67,
  startedAt: '2026-06-25T08:12:00',
  status: 'processing',
  /** 桦加沙：2025年登陆阳江一带，贴近茂名防台场景 */
  typhoonApiCode: '202518',
  weatherMetrics: {
    temperature: '20.1℃',
    windSpeed: '2.4m/s',
    humidity: '43.36%rh',
    windDirection: '东北风',
  },
  monitoringObjects: [
    {
      id: 'outlet',
      name: '总排口',
      value: '0.8',
      unit: 'm',
      status: 'normal',
      statusText: '水位正常',
    },
    {
      id: 'pool-a',
      name: '6#路地磅北地沟',
      value: '0.3',
      unit: 'm',
      status: 'warning',
      statusText: '接近预警线',
    },
    {
      id: 'pool-b',
      name: '西化学水泵房',
      value: '0.5',
      unit: 'm',
      status: 'critical',
      statusText: '超过警戒水位',
    },
    {
      id: 'pump',
      name: '雨水泵站',
      value: '2',
      unit: '台运行',
      status: 'normal',
      statusText: '设备运行正常',
    },
  ],
  meteorologySummary:
    '受台风"沙迦"外围云系影响，厂区将出现中到大雨，局部暴雨，伴有6-8级阵风。请各单位加强低洼区域巡查，确保排涝设施正常运行。',
  riskWarnings: [
    {
      id: '1',
      time: '08:05',
      type: '内涝预警',
      content: '西化学水泵房水位持续上升，建议启动一车一泵应急抽排',
    },
    {
      id: '2',
      time: '07:42',
      type: '大风预警',
      content: '炼油区西侧风速超过6m/s，请加固高端碳装置周边临时设施',
    },
    {
      id: '3',
      time: '07:18',
      type: '暴雨预警',
      content: '未来2小时降雨量预计达35mm，注意低洼积水',
    },
  ],
  weatherChartLabels: ['02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'],
  precipitationSeries: [2, 4, 8, 14, 22, 28, 35, 30, 18, 10, 6, 3],
  windSpeedSeries: [1.2, 1.8, 2.1, 2.4, 3.2, 4.5, 5.8, 6.2, 4.8, 3.6, 2.8, 2.2],
  waterLevelLabels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
  waterLevelSeries: [0.42, 0.48, 0.55, 0.62, 0.68, 0.72, 0.75],
  waterLevelWarn: 0.6,
  waterLevelDanger: 0.8,
  liveVideos: [
    {
      id: 'r1-east',
      label: '高端碳装置雨水池—东侧全景',
      angle: '东侧全景',
      status: 'online',
      sceneIndex: 0,
      deviceCode: 'FX-R1-01',
    },
    {
      id: 'r1-outlet',
      label: '高端碳装置污水池—排水口',
      angle: '排水口近景',
      status: 'online',
      sceneIndex: 1,
      deviceCode: 'FX-R1-02',
    },
    {
      id: 'r1-road',
      label: '高端碳装置雨水池—道路侧',
      angle: '道路侧俯视',
      status: 'offline',
      sceneIndex: 2,
      deviceCode: 'FX-R1-03',
    },
    {
      id: 'r2-wide',
      label: '西化学水泵房—全景',
      angle: '泵房全景',
      status: 'online',
      sceneIndex: 1,
      deviceCode: 'FX-R2-01',
    },
    {
      id: 'r2-inlet',
      label: '西化学水泵房—进水渠',
      angle: '进水渠水位',
      status: 'online',
      sceneIndex: 3,
      deviceCode: 'FX-R2-02',
    },
    {
      id: 'r2-pump',
      label: '西化学水泵房—泵组',
      angle: '泵组运行区',
      status: 'online',
      sceneIndex: 4,
      deviceCode: 'FX-R2-03',
    },
    {
      id: 'r3-south',
      label: '新鲜水泵房—南侧全景',
      angle: '南侧全景',
      status: 'online',
      sceneIndex: 2,
      deviceCode: 'FX-R3-01',
    },
    {
      id: 'r3-drain',
      label: '新鲜水泵房—排水沟',
      angle: '排水沟近景',
      status: 'online',
      sceneIndex: 5,
      deviceCode: 'FX-R3-02',
    },
    {
      id: 'r4-weigh',
      label: '6#路地磅北地沟—地磅侧',
      angle: '地磅侧全景',
      status: 'online',
      sceneIndex: 4,
      deviceCode: 'FX-R4-01',
    },
    {
      id: 'r4-ditch',
      label: '6#路地磅北地沟—沟渠',
      angle: '沟渠水位',
      status: 'offline',
      sceneIndex: 3,
      deviceCode: 'FX-R4-02',
    },
    {
      id: 'r5-west',
      label: '11#路西—道路全景',
      angle: '道路西向',
      status: 'online',
      sceneIndex: 5,
      deviceCode: 'FX-R5-01',
    },
    {
      id: 'r5-drain',
      label: '11#路西—应急抽排点',
      angle: '抽排作业区',
      status: 'online',
      sceneIndex: 0,
      deviceCode: 'FX-R5-02',
    },
    {
      id: 'r6-east',
      label: '11#路东—道路全景',
      angle: '道路东向',
      status: 'online',
      sceneIndex: 0,
      deviceCode: 'FX-R6-01',
    },
    {
      id: 'r6-outlet',
      label: '11#路东—排水口',
      angle: '排水口近景',
      status: 'online',
      sceneIndex: 5,
      deviceCode: 'FX-R6-02',
    },
    {
      id: 'r7-wide',
      label: '储运部中间罐区泵房—全景',
      angle: '泵房全景',
      status: 'online',
      sceneIndex: 3,
      deviceCode: 'FX-R7-01',
    },
    {
      id: 'r7-pump',
      label: '储运部中间罐区泵房—泵组',
      angle: '泵组运行区',
      status: 'online',
      sceneIndex: 1,
      deviceCode: 'FX-R7-02',
    },
    {
      id: 'r7-inlet',
      label: '储运部中间罐区泵房—进水侧',
      angle: '进水侧水位',
      status: 'online',
      sceneIndex: 4,
      deviceCode: 'FX-R7-03',
    },
    {
      id: 'r8-wide',
      label: '中间罐区9#提升池—全景',
      angle: '提升池全景',
      status: 'online',
      sceneIndex: 2,
      deviceCode: 'FX-R8-01',
    },
    {
      id: 'r8-level',
      label: '中间罐区9#提升池—液位侧',
      angle: '液位监测侧',
      status: 'online',
      sceneIndex: 4,
      deviceCode: 'FX-R8-02',
    },
    {
      id: 'r8-outlet',
      label: '中间罐区9#提升池—出水侧',
      angle: '出水侧近景',
      status: 'offline',
      sceneIndex: 5,
      deviceCode: 'FX-R8-03',
    },
  ],
  auxiliaryItems: [
    { id: 1, line1: '应急预案', line2: '', count: 15, countTone: 'cyan', iconIndex: 0 },
    { id: 2, line1: '危险化学品', line2: '知识库', count: 158, countTone: 'cyan', iconIndex: 1 },
    { id: 3, line1: '生产区域', line2: '疏散路线图', count: 12, countTone: 'lime', iconIndex: 2 },
    { id: 4, line1: '装置区', line2: '专项预案', count: 8, countTone: 'cyan', iconIndex: 3 },
  ],
  dutyPersons: [
    { id: 1, name: '杨恒朋', role: '值班领导', phone: '13792536966', avatarIndex: 0 },
    { id: 2, name: '高策', role: '值班员', phone: '18300556145', avatarIndex: 1 },
    { id: 3, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 2 },
    { id: 4, name: '王磊', role: '值班员', phone: '18300556145', avatarIndex: 3 },
  ],
  /**
   * 炼油厂区防洪排涝力量布置图中的易涝点。
   * 原图表格列出的 1—8 号点，坐标按用户人工标注的厂区位置校正。
   */
  mapRiskPoints: [
    {
      id: 'r1',
      name: '高端碳装置雨水池、污水池',
      longitude: 110.87264,
      latitude: 21.6846,
      status: 'warning',
      statusText: '重点巡查',
      responsibleUnit: '炼油/高端碳',
      predeployed: true,
      deployment: '龙吸水排涝车（炼油布置、高端碳操作）',
      videoIds: ['r1-east', 'r1-outlet', 'r1-road'],
    },
    {
      id: 'r2',
      name: '西化学水泵房',
      longitude: 110.8768,
      latitude: 21.67999,
      status: 'critical',
      statusText: '积水超限',
      responsibleUnit: '炼油中队',
      predeployed: true,
      deployment: '一车一泵',
      videoIds: ['r2-wide', 'r2-inlet', 'r2-pump'],
    },
    {
      id: 'r3',
      name: '新鲜水泵房',
      longitude: 110.8838,
      latitude: 21.67158,
      status: 'critical',
      statusText: '强制抽排',
      responsibleUnit: '炼油中队',
      predeployed: true,
      deployment: '大水牛排涝机器人、一车',
      labelOffsetX: -54,
      labelOffsetY: 10,
      videoIds: ['r3-south', 'r3-drain'],
    },
    {
      id: 'r4',
      name: '6#路地磅北地沟',
      longitude: 110.8828,
      latitude: 21.67301,
      status: 'warning',
      statusText: '水位上涨',
      responsibleUnit: '特勤中队',
      predeployed: true,
      deployment: '大功率泵浦车在301事故池排水',
      labelOffsetX: -36,
      labelOffsetY: -26,
      videoIds: ['r4-weigh', 'r4-ditch'],
    },
    {
      id: 'r5',
      name: '11#路西',
      longitude: 110.88565,
      latitude: 21.67216,
      status: 'warning',
      statusText: '持续监测',
      responsibleUnit: '特勤/高端碳中队',
      predeployed: true,
      deployment: '各一车',
      videoIds: ['r5-west', 'r5-drain'],
    },
    {
      id: 'r6',
      name: '11#路东',
      longitude: 110.88814,
      latitude: 21.67189,
      status: 'normal',
      statusText: '排水正常',
      responsibleUnit: '机动安排',
      predeployed: false,
      deployment: '一车',
      videoIds: ['r6-east', 'r6-outlet'],
    },
    {
      id: 'r7',
      name: '储运部中间罐区泵房',
      longitude: 110.88775,
      latitude: 21.68086,
      status: 'normal',
      statusText: '泵组正常',
      responsibleUnit: '炼油/高端碳/金塘中队',
      predeployed: true,
      deployment: '储运部1泵',
      videoIds: ['r7-wide', 'r7-pump', 'r7-inlet'],
    },
    {
      id: 'r8',
      name: '储运部中间罐区9#提升池',
      longitude: 110.8858,
      latitude: 21.67803,
      status: 'normal',
      statusText: '提升正常',
      responsibleUnit: '炼油/高端碳/金塘中队',
      predeployed: true,
      deployment: '储运部4泵',
      videoIds: ['r8-wide', 'r8-level', 'r8-outlet'],
    },
  ],
  eventInfoFields: [
    { label: '事件名称', value: '台风沙迦防台防汛工作' },
    { label: '事件分类', value: '极端天气' },
    { label: '响应等级', value: '防台防汛Ⅱ级响应' },
    { label: '启动时间', value: '2026-06-25 08:12:00' },
    { label: '影响范围', value: '全厂范围' },
    { label: '指挥部门', value: '应急管理部' },
    { label: '当前措施', value: '加强低洼区域巡查，雨水泵站双机运行，重点点位视频监控轮巡' },
  ],
};

export function resolveTyphoonEmergencyIncident(eventId?: number): TyphoonEmergencyIncident {
  const event = findFireEmergencyEventById(eventId) ?? findFireEmergencyEventById(100);

  if (!event) return defaultTyphoonIncident;

  const weather = event.weatherMeta;
  return {
    ...defaultTyphoonIncident,
    eventId: event.id,
    title: event.title,
    location: event.location,
    longitude: event.longitude,
    latitude: event.latitude,
    startedAt: event.time.replace(' ', 'T'),
    endedAt: event.endedAt?.replace(' ', 'T'),
    status: event.status,
    eventInfoFields: weather
      ? [
          { label: '事件名称', value: event.title },
          { label: '事件分类', value: weather.weatherType },
          { label: '预警等级', value: weather.warningLevel },
          { label: '影响范围', value: weather.affectedArea },
          { label: '监测时段', value: weather.monitoringPeriod },
          { label: '启动时间', value: event.time },
          { label: '事件来源', value: weather.source },
          { label: '当前措施', value: weather.measures },
        ]
      : defaultTyphoonIncident.eventInfoFields.map((field) =>
          field.label === '事件名称' ? { ...field, value: event.title } : field,
        ),
  };
}

/** 新版极端天气页面专用：无事件参数时保持防台防汛默认事件，不改变旧版兼容逻辑。 */
export function resolveTyphoonEmergencyIncidentV2(eventId?: number): TyphoonEmergencyIncident {
  if (eventId == null) return defaultTyphoonIncident;
  return resolveTyphoonEmergencyIncident(eventId);
}
