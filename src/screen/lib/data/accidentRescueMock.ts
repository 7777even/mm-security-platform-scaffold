import { findFireEmergencyEventById } from './fireEmergencyEventsStore';
import {
  accidentRescueMapMarkers,
  accidentRescueRouteWaypoints,
  type RescueRouteWaypoint,
} from '../../utils/accidentRescueRoutePlanner';
import fireSceneImage from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import gasLeakSceneImage from '../../assets/semantic-scenes/production-gas-leak.png';

export type { RescueRouteWaypoint };
export { accidentRescueMapMarkers, accidentRescueRouteWaypoints };

export interface IncidentDetailField {
  label: string;
  value: string;
}

export type EmergencyResourceType = '救援队伍' | '应急车辆' | '应急物资' | '应急专家';
export type EmergencyResourceStatus = '可调度' | '任务中' | '离线';

/** 与资源管理台账一致的应急资源主数据，用于事件处置时检索与调度。 */
export interface EmergencyDispatchResource {
  id: string;
  type: EmergencyResourceType;
  name: string;
  code: string;
  organization: string;
  area: string;
  status: EmergencyResourceStatus;
  distanceKm: number;
  etaMinutes: number;
  capacity: string;
  contact: string;
  phone: string;
  longitude: number;
  latitude: number;
}

export const emergencyDispatchResources: EmergencyDispatchResource[] = [
  {
    id: 'team-01',
    type: '救援队伍',
    name: '炼油消防一中队',
    code: 'TEAM-RY-01',
    organization: '消防救援中心',
    area: '炼油区',
    status: '可调度',
    distanceKm: 1.2,
    etaMinutes: 6,
    capacity: '18人 · 泡沫灭火',
    contact: '王钰',
    phone: '18300556145',
    longitude: 110.8781,
    latitude: 21.6812,
  },
  {
    id: 'team-02',
    type: '救援队伍',
    name: '炼油工艺处置组',
    code: 'TEAM-RY-03',
    organization: '炼油分部',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.8,
    etaMinutes: 4,
    capacity: '12人 · 切料堵漏',
    contact: '高策',
    phone: '18300556146',
    longitude: 110.8802,
    latitude: 21.6798,
  },
  {
    id: 'vehicle-01',
    type: '应急车辆',
    name: '重型泡沫消防车',
    code: '粤K·XF119',
    organization: '消防救援中心',
    area: '炼油区',
    status: '可调度',
    distanceKm: 1.5,
    etaMinutes: 7,
    capacity: '泡沫液 6t · 水 12t',
    contact: '陈伟',
    phone: '18300556148',
    longitude: 110.8769,
    latitude: 21.6779,
  },
  {
    id: 'vehicle-02',
    type: '应急车辆',
    name: '防化洗消车',
    code: '粤K·YJ026',
    organization: '消防救援中心',
    area: '炼油区',
    status: '任务中',
    distanceKm: 2.4,
    etaMinutes: 12,
    capacity: '洗消剂 2t · 6人',
    contact: '李强',
    phone: '18300556149',
    longitude: 110.8841,
    latitude: 21.6754,
  },
  {
    id: 'material-01',
    type: '应急物资',
    name: '抗溶性水成膜泡沫液',
    code: 'MAT-PM-0031',
    organization: '炼油应急物资库',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.9,
    etaMinutes: 5,
    capacity: '库存 12t · 可用 10t',
    contact: '赵敏',
    phone: '18300556150',
    longitude: 110.8822,
    latitude: 21.6815,
  },
  {
    id: 'material-02',
    type: '应急物资',
    name: '重型防化服',
    code: 'MAT-FH-0018',
    organization: '炼油应急物资库',
    area: '炼油区',
    status: '可调度',
    distanceKm: 0.9,
    etaMinutes: 5,
    capacity: '库存 36套 · 可用 28套',
    contact: '赵敏',
    phone: '18300556150',
    longitude: 110.8824,
    latitude: 21.6812,
  },
  {
    id: 'expert-01',
    type: '应急专家',
    name: '周建国',
    code: 'EXP-HG-008',
    organization: '茂名石化专家组',
    area: '炼油区',
    status: '可调度',
    distanceKm: 3.1,
    etaMinutes: 15,
    capacity: '危化品泄漏与火灾处置',
    contact: '周建国',
    phone: '13802556008',
    longitude: 110.8738,
    latitude: 21.6833,
  },
  {
    id: 'team-03',
    type: '救援队伍',
    name: '港区危化品抢险队',
    code: 'TEAM-GQ-02',
    organization: '港区作业部',
    area: '港区',
    status: '离线',
    distanceKm: 18.6,
    etaMinutes: 35,
    capacity: '15人 · 海上围控',
    contact: '梁海',
    phone: '13802556012',
    longitude: 110.9462,
    latitude: 21.5837,
  },
];

export interface GuidanceStep {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending' | 'disabled';
}

export interface RescueDynamicEntry {
  id: number;
  title: string;
  tag: string;
  time: string;
  command: string;
  responder: string;
  reply: string;
  /** 左侧阶段标签（应急指挥详情） */
  stageLabel?: string;
  media?: Array<{
    id: string;
    type: 'image' | 'audio';
    name: string;
    src?: string;
    duration?: string;
  }>;
}

export interface EmergencyPlanLevel {
  id: string;
  label: string;
  isCurrent?: boolean;
}

export interface AccidentInfoField {
  label: string;
  value: string;
}

export type ProcessTaskStatus = 'done' | 'active' | 'pending';

export interface EmergencyProcessTask {
  id: string;
  label: string;
  status: ProcessTaskStatus;
}

export interface EmergencyProcessStage {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
  tasks?: EmergencyProcessTask[];
}

export interface EventAuxiliaryItem {
  label: string;
  value: number;
  iconIndex: number;
}

export interface BottomToolbarItem {
  id: string;
  label: string;
  iconFile: string;
}

export interface AccidentRescueIncident {
  eventId: number;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
  hazardSourceLevel?: string;
  mapStatus: string;
  startedAt?: string;
  endedAt?: string;
  status: 'processing' | 'pending' | 'done';
  reported: boolean;
  detailFields: IncidentDetailField[];
  /** 设施详情面板标题 */
  facilityName: string;
}

const defaultDetailFields: IncidentDetailField[] = [
  { label: '事故时间', value: '2026-04-27 14:54:49' },
  { label: '事件分类', value: '突发应急事件' },
  { label: '事件小类', value: '事故灾难-工矿商贸等企业的安全事故' },
  {
    label: '事件描述',
    value: '模拟检修储运10/1-11/#区液氨储罐T-001泄漏引发火灾',
  },
  { label: '报警人', value: '张三' },
  { label: '报警电话', value: '111' },
  { label: '接警人', value: '李四' },
  { label: '接警时间', value: '2026-04-27 14:55:24' },
  { label: '涉及企业', value: '中海壳牌石油化工有限公司' },
  { label: '涉及装置', value: '液氨储罐ST1201' },
  { label: '涉及危险化学品', value: '液氨' },
  { label: '死亡人数', value: '0人' },
  { label: '重伤人数', value: '0人' },
  { label: '轻伤人数', value: '0人' },
  { label: '外部救援', value: '已启动预案' },
  {
    label: '已采取措施',
    value: '现场已启动疏散撤离，打开附近消防泡沫管道喷淋降温，同时确认无关人员已疏散',
  },
  { label: '附件信息', value: '—' },
];

export function resolveAccidentRescueIncident(eventId?: number): AccidentRescueIncident {
  const event = findFireEmergencyEventById(eventId) ?? findFireEmergencyEventById(4)!;

  return {
    eventId: event.id,
    title: event.id === 4 ? '乙烯裂解装置区火灾' : event.title,
    location: event.location,
    longitude: event.longitude,
    latitude: event.latitude,
    hazardSourceLevel: event.hazardSourceLevel,
    mapStatus: '主力扑救',
    startedAt: event.time,
    endedAt: event.endedAt,
    status: event.status,
    reported: event.reported,
    facilityName: event.id === 4 ? '乙烯裂解装置' : event.title,
    detailFields: defaultDetailFields.map((field, index) =>
      index === 0 ? { ...field, value: event.time } : field,
    ),
  };
}

/** 应急指挥 · 事件详情左上面板 Tab */
export const eventCommandDetailTabs = [
  { key: 'info', label: '事件信息' },
  { key: 'response', label: '应急响应' },
  { key: 'dispatch', label: '资源调度' },
] as const;

export const eventCommandResponseFields: IncidentDetailField[] = [
  { label: '响应等级', value: '公司级应急响应' },
  { label: '启动时间', value: '2026-04-27 15:02:18' },
  { label: '指挥体系', value: '公司应急指挥部' },
  { label: '现场指挥', value: '杨恒朋' },
  { label: '响应状态', value: '进行中' },
  {
    label: '处置要点',
    value: '启动人员疏散、现场警戒与应急前置处置，同步调度消防与工艺处置力量。',
  },
];

export const eventCommandDispatchFields: IncidentDetailField[] = [
  { label: '消防队伍', value: '消防一队、消防二队（已调度）' },
  { label: '工艺处置', value: '乙烯装置工艺处置组（待命）' },
  { label: '医疗救护', value: '厂区医务室、120联动（待命）' },
  { label: '应急物资', value: '泡沫灭火剂、防化服等已出库' },
  { label: '应急车辆', value: '消防救援车 2 辆、泡沫车 1 辆' },
  { label: '调度状态', value: '持续调度中' },
];

export const emergencyPlanLevels: EmergencyPlanLevel[] = [
  { id: 'superior', label: '上级预案' },
  { id: 'company', label: '公司级预案', isCurrent: true },
  { id: 'branch', label: '分厂级预案' },
  { id: 'site', label: '装置级预案' },
];

export const accidentInfoTabs = [
  { key: 'info', label: '事故信息' },
  { key: 'report', label: '事故报送' },
  { key: 'arrival', label: '到场情况' },
] as const;

export const accidentInfoFields: AccidentInfoField[] = [
  { label: '发生区域', value: '油气储存' },
  { label: '发生时间', value: '2026-04-27 14:54:49' },
  { label: '介质', value: '乙烯' },
  { label: '类型', value: '火灾' },
  { label: '状态', value: '进行中' },
  { label: '死亡人数', value: '0' },
  { label: '自救力量', value: '3支队伍35人' },
];

export const accidentReportFields: AccidentInfoField[] = [
  { label: '报送单位', value: '中海壳牌石油化工有限公司' },
  { label: '报送时间', value: '2026-04-27 14:56:10' },
  { label: '报送方式', value: '系统上报' },
  { label: '报送内容', value: '储罐区发生火灾，已启动公司级应急响应。' },
];

export const accidentArrivalFields: AccidentInfoField[] = [
  { label: '消防一队', value: '已到场（14:58）' },
  { label: '消防二队', value: '行进中（预计 15:05）' },
  { label: '工艺处置组', value: '已集结待命' },
  { label: '医疗救护', value: '待命' },
];

const emergencyProcessStagesStarted: EmergencyProcessStage[] = [
  {
    id: 'stage1',
    label: '阶段一',
    status: 'active',
    tasks: [
      { id: 'evacuate', label: '应急疏散', status: 'active' },
      { id: 'front', label: '应急前置处置', status: 'pending' },
      { id: 'cordon', label: '现场警戒', status: 'pending' },
    ],
  },
  { id: 'stage2', label: '阶段二', status: 'pending' },
  { id: 'stage3', label: '阶段三', status: 'pending' },
  { id: 'stage4', label: '阶段四', status: 'pending' },
  { id: 'stage5', label: '阶段五', status: 'pending' },
];

const emergencyProcessStagesPending: EmergencyProcessStage[] = [
  { id: 'stage1', label: '阶段一', status: 'pending' },
  { id: 'stage2', label: '阶段二', status: 'pending' },
  { id: 'stage3', label: '阶段三', status: 'pending' },
  { id: 'stage4', label: '阶段四', status: 'pending' },
  { id: 'stage5', label: '阶段五', status: 'pending' },
];

export const emergencyProcessStages = emergencyProcessStagesStarted;

export function resolveEmergencyProcessStages(
  status: AccidentRescueIncident['status'],
): EmergencyProcessStage[] {
  return status === 'pending' ? emergencyProcessStagesPending : emergencyProcessStagesStarted;
}

export type RescueStageProgressStatus = 'done' | 'active' | 'pending';

export interface RescueStageProgressItem {
  id: string;
  orderLabel: string;
  status: RescueStageProgressStatus;
}

const rescueStageProgressItemsStarted: RescueStageProgressItem[] = [
  { id: 'stage1', orderLabel: '一', status: 'active' },
  { id: 'stage2', orderLabel: '二', status: 'pending' },
  { id: 'stage3', orderLabel: '三', status: 'pending' },
  { id: 'stage4', orderLabel: '四', status: 'pending' },
];

const rescueStageProgressItemsPending: RescueStageProgressItem[] = [
  { id: 'stage1', orderLabel: '一', status: 'pending' },
  { id: 'stage2', orderLabel: '二', status: 'pending' },
  { id: 'stage3', orderLabel: '三', status: 'pending' },
  { id: 'stage4', orderLabel: '四', status: 'pending' },
];

/** 底部救援阶段进度（四段竖条） */
export const rescueStageProgressItems = rescueStageProgressItemsStarted;

export function resolveRescueStageProgressItems(
  status: AccidentRescueIncident['status'],
): RescueStageProgressItem[] {
  return status === 'pending' ? rescueStageProgressItemsPending : rescueStageProgressItemsStarted;
}

export const eventCommandAuxiliaryItems: EventAuxiliaryItem[] = [
  { label: '岗位应急处置卡', value: 15, iconIndex: 0 },
  { label: '危险化学品知识库', value: 15, iconIndex: 1 },
  { label: '生产区域疏散路线图', value: 15, iconIndex: 2 },
  { label: '生产区域应急预案', value: 15, iconIndex: 3 },
  { label: '生产工艺流程', value: 15, iconIndex: 4 },
];

export const eventCommandDynamicsTabs = [
  { key: 'command', label: '指令动态' },
  { key: 'brief', label: '简报快讯' },
  { key: 'awareness', label: '态势感知快讯' },
] as const;

export const eventCommandDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    stageLabel: '1. 接警研判',
    title: '应急疏散',
    tag: '【固定指令】',
    time: '2026-04-27 14:58:12',
    command: '指令内容：请立即组织装置区无关人员按疏散路线撤离至安全区域。',
    responder: '高策',
    reply: '【已回复】：疏散路线已确认，人员正在有序撤离。',
    media: [
      {
        id: 'command-evacuation-image',
        type: 'image',
        name: '装置区人员疏散现场',
        src: gasLeakSceneImage,
      },
      {
        id: 'command-evacuation-audio',
        type: 'audio',
        name: '现场疏散情况语音',
        duration: '00:18',
      },
    ],
  },
  {
    id: 2,
    stageLabel: '2. 一分钟应急响应',
    title: '应急前置处置',
    tag: '【固定指令】',
    time: '2026-04-27 15:01:36',
    command: '指令内容：请消防一队开展冷却抑爆，工艺组同步切断物料来源。',
    responder: '王钰',
    reply: '【已回复】：冷却抑爆已开展，工艺切断正在执行。',
    media: [
      { id: 'command-fire-image', type: 'image', name: '消防冷却抑爆现场', src: fireSceneImage },
      { id: 'command-fire-audio', type: 'audio', name: '消防一队到场反馈', duration: '00:24' },
    ],
  },
  {
    id: 3,
    stageLabel: '3. 三分钟退守稳态',
    title: '现场警戒',
    tag: '【固定指令】',
    time: '2026-04-27 15:03:08',
    command: '指令内容：请警戒组封锁事故区域出入口，引导救援车辆通行。',
    responder: '赵敏',
    reply: '【已回复】：警戒点位已布设，通道清理中。',
  },
];

export const eventCommandBriefDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    title: '现场简报',
    tag: '【快讯】',
    time: '2026-04-27 15:00:00',
    command: '火势受控，暂无人员伤亡，周边装置运行平稳。',
    responder: '应急指挥部',
    reply: '【已发布】',
  },
  {
    id: 2,
    title: '环境监测',
    tag: '【快讯】',
    time: '2026-04-27 15:08:10',
    command: '事故区域下风向恶臭气体浓度达标，未检出剧毒组分。',
    responder: '环境监测组',
    reply: '【已发布】',
  },
  {
    id: 3,
    title: '交通管制',
    tag: '【快讯】',
    time: '2026-04-27 15:15:40',
    command: '厂区南门已实施交通管制，社会车辆请绕行。',
    responder: '治安管理组',
    reply: '【已发布】',
  },
  {
    id: 4,
    title: '医疗救护',
    tag: '【快讯】',
    time: '2026-04-27 15:22:05',
    command: '医疗救护车3辆已就位，开通绿色救治通道。',
    responder: '医疗保障组',
    reply: '【已发布】',
  },
  {
    id: 5,
    title: '气象通报',
    tag: '【快讯】',
    time: '2026-04-27 15:30:18',
    command: '当前东南风3级，能见度良好，利于烟气扩散。',
    responder: '气象保障组',
    reply: '【已发布】',
  },
];

export const eventCommandAwarenessDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    title: '态势感知',
    tag: '【快报】',
    time: '2026-04-27 15:02:30',
    command: '监测数据显示事故区域温度下降，可燃气体浓度趋于稳定。',
    responder: '监测中心',
    reply: '【已同步】',
  },
  {
    id: 2,
    title: '视频监控',
    tag: '【快报】',
    time: '2026-04-27 15:05:12',
    command: '主监控画面显示明火已熄灭，现场烟雾明显减少。',
    responder: '视频监控中心',
    reply: '【已同步】',
  },
  {
    id: 3,
    title: '人员定位',
    tag: '【快报】',
    time: '2026-04-27 15:12:33',
    command: '现场作业人员已全部撤离至安全集合点，无失联。',
    responder: '人员定位系统',
    reply: '【已同步】',
  },
  {
    id: 4,
    title: '气体监测',
    tag: '【快报】',
    time: '2026-04-27 15:19:50',
    command: '便携式检测仪显示O2浓度正常，CO浓度持续下降。',
    responder: '气体检测组',
    reply: '【已同步】',
  },
  {
    id: 5,
    title: '消防设施',
    tag: '【快报】',
    time: '2026-04-27 15:27:21',
    command: '固定消防炮运行正常，管网压力维持在额定区间。',
    responder: '消防设施组',
    reply: '【已同步】',
  },
];

export type EmergencyCommandInstructionStatus = '待处置' | '已处置' | '待派发';

export interface EmergencyCommandInstruction {
  id: string;
  type: '通知' | '任务';
  name: string;
  location: string;
  status: EmergencyCommandInstructionStatus;
  /** 卡片右上角操作 */
  actionLabel?: string;
  /** 已完成角标 */
  done?: boolean;
}

export interface EmergencyCommandGroup {
  id: string;
  label: string;
  items: EmergencyCommandInstruction[];
}

export const emergencyCommandInstructionTabs = [
  { key: 'fixed', label: '固定指令' },
  { key: 'temp', label: '临时指令' },
] as const;

export const emergencyCommandPhaseFilterOptions = [
  { value: 'all', label: '全部阶段' },
  { value: 'stage1', label: '阶段一' },
  { value: 'stage2', label: '阶段二' },
  { value: 'stage3', label: '阶段三' },
] as const;

export const emergencyCommandStatusFilterOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处置' },
  { value: 'dispatch', label: '待派发' },
  { value: 'done', label: '已处置' },
] as const;

const fixedCommandGroups: EmergencyCommandGroup[] = [
  {
    id: 'notify',
    label: '一键通知',
    items: [
      {
        id: 'n1',
        type: '通知',
        name: '通知值班人员',
        location: '中海壳牌石油化工有限公司',
        status: '待处置',
      },
      {
        id: 'n2',
        type: '通知',
        name: '通知消防队伍',
        location: '中海壳牌石油化工有限公司',
        status: '已处置',
        done: true,
      },
      {
        id: 'n3',
        type: '通知',
        name: '通知工艺处置组',
        location: '中海壳牌石油化工有限公司',
        status: '待处置',
      },
    ],
  },
  {
    id: 'dispatch',
    label: '一键调度',
    items: [
      {
        id: 'd1',
        type: '任务',
        name: '调度消防一队',
        location: '中海壳牌石油化工有限公司',
        status: '待派发',
        actionLabel: '一键派发',
      },
      {
        id: 'd2',
        type: '任务',
        name: '调度泡沫车',
        location: '中海壳牌石油化工有限公司',
        status: '已处置',
        done: true,
      },
      {
        id: 'd3',
        type: '任务',
        name: '调度医疗救护',
        location: '中海壳牌石油化工有限公司',
        status: '待派发',
        actionLabel: '一键派发',
      },
    ],
  },
];

const tempCommandGroups: EmergencyCommandGroup[] = [
  {
    id: 'temp-notify',
    label: '临时通知',
    items: [
      {
        id: 't1',
        type: '通知',
        name: '通知周边企业',
        location: '大亚湾石化区',
        status: '待处置',
      },
    ],
  },
  {
    id: 'temp-dispatch',
    label: '临时调度',
    items: [
      {
        id: 't2',
        type: '任务',
        name: '增派泡沫灭火剂',
        location: '应急物资库',
        status: '待派发',
        actionLabel: '一键派发',
      },
    ],
  },
];

export function resolveEmergencyCommandGroups(tab: 'fixed' | 'temp'): EmergencyCommandGroup[] {
  return tab === 'fixed' ? fixedCommandGroups : tempCommandGroups;
}

export type CommandNotifyChannel = 'app' | 'sms' | 'voice';

export interface CommandActionRecipient {
  id: string;
  role: string;
  name: string;
  phone: string;
}

export interface CommandActionDynamicEntry {
  id: string;
  time: string;
  type: '系统' | '派发' | '签收' | '执行' | '现场反馈' | '异常' | '完成';
  operator: string;
  result: '已记录' | '成功' | '进行中' | '异常' | '已完成';
  content: string;
  attachment?: string;
  media?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    name: string;
    src?: string;
    duration?: string;
  }>;
}

export interface CommandActionDetail {
  id: string;
  name: string;
  type: '通知' | '任务';
  notifyChannels: CommandNotifyChannel[];
  status: EmergencyCommandInstructionStatus;
  dispatchMode: string;
  location: string;
  description: string;
  attachment?: string;
  addressBookRecipients: CommandActionRecipient[];
  dutyRecipients: CommandActionRecipient[];
  dynamics: CommandActionDynamicEntry[];
}

const commandDetailDefaults: Omit<
  CommandActionDetail,
  'id' | 'name' | 'type' | 'status' | 'location'
> = {
  notifyChannels: ['app', 'sms', 'voice'],
  dispatchMode: '自动派发',
  description:
    '【2026-04-27 14:55:24】装置区发生疑似火灾事故，请按预案开展通知与前置处置，保持信息同步。',
  attachment: '—',
  addressBookRecipients: [
    { id: 'ab1', role: '公司总值班室', name: '宋文帅', phone: '13792536966' },
    { id: 'ab2', role: '消防一队', name: '王钰', phone: '18300556145' },
    { id: 'ab3', role: '工艺处置组', name: '高策', phone: '18300556146' },
  ],
  dutyRecipients: [
    { id: 'dy1', role: '值班领导', name: '杨恒朋', phone: '13792536966' },
    { id: 'dy2', role: '值班员', name: '高颖', phone: '18300556145' },
  ],
  dynamics: [],
};

const commandLogs: Record<string, CommandActionDynamicEntry[]> = {
  n1: [
    {
      id: 'n1-1',
      time: '2026-04-27 14:56:10',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '根据公司级应急预案自动生成“通知值班人员”指令，共匹配 6 名当日值班人员。',
    },
    {
      id: 'n1-2',
      time: '2026-04-27 14:56:24',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '成功',
      content:
        '指令已发送至公司总值班室、炼油分部值班组及装置当班人员；APP 6/6 送达，短信 6/6 送达。',
    },
    {
      id: 'n1-3',
      time: '2026-04-27 14:57:03',
      type: '签收',
      operator: '值班领导 杨恒朋',
      result: '成功',
      content: '已签收指令，确认进入应急指挥室并组织会商研判。',
    },
    {
      id: 'n1-4',
      time: '2026-04-27 14:58:16',
      type: '现场反馈',
      operator: '装置值班长 高策',
      result: '进行中',
      content: '当班 23 人已全部确认收到通知，正按分工进行工艺隔离和无关人员清点。',
      attachment: '现场人员清点表.xlsx',
      media: [
        { id: 'n1-image', type: 'image', name: '装置区警戒隔离现场', src: gasLeakSceneImage },
        { id: 'n1-audio', type: 'audio', name: '装置值班长现场语音', duration: '00:18' },
      ],
    },
  ],
  n2: [
    {
      id: 'n2-1',
      time: '2026-04-27 14:56:18',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '事件等级达到公司级响应条件，自动生成消防队伍通知指令。',
    },
    {
      id: 'n2-2',
      time: '2026-04-27 14:56:31',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '成功',
      content: '炼油消防一中队 18 人、重型泡沫车 1 辆已完成通知。',
    },
    {
      id: 'n2-3',
      time: '2026-04-27 14:56:48',
      type: '签收',
      operator: '消防一中队 王钰',
      result: '成功',
      content: '队伍已签收，完成个人防护与泡沫液装载检查。',
    },
    {
      id: 'n2-4',
      time: '2026-04-27 14:58:05',
      type: '执行',
      operator: '消防一中队 王钰',
      result: '进行中',
      content: '消防车组已出发，由北二门进入，距事故点 0.8km。',
    },
    {
      id: 'n2-5',
      time: '2026-04-27 15:01:18',
      type: '完成',
      operator: '现场指挥 王钰',
      result: '已完成',
      content: '消防力量已到达指定集结点，人员、车辆及装备清点完成，通知指令办结。',
      media: [
        { id: 'n2-image', type: 'image', name: '消防力量到场回传', src: fireSceneImage },
        {
          id: 'n2-video',
          type: 'video',
          name: '消防车集结现场视频',
          src: fireSceneImage,
          duration: '00:26',
        },
      ],
    },
  ],
  n3: [
    {
      id: 'n3-1',
      time: '2026-04-27 14:56:22',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '已生成工艺处置组通知，关联装置紧急停车与物料隔离卡。',
    },
    {
      id: 'n3-2',
      time: '2026-04-27 14:56:45',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '成功',
      content: '指令已发送给工艺处置组 8 人，要求确认泄漏介质、切断上游物料并建立盲板隔离清单。',
    },
    {
      id: 'n3-3',
      time: '2026-04-27 14:58:34',
      type: '现场反馈',
      operator: '工艺处置组 高策',
      result: '进行中',
      content:
        '已关闭上游紧急切断阀 XV-1203，现场可燃气体检测值正在下降；东侧阀组渗漏点仍需进一步确认。',
      attachment: '现场气体检测记录.pdf',
      media: [
        { id: 'n3-image', type: 'image', name: '东侧阀组泄漏点', src: gasLeakSceneImage },
        { id: 'n3-audio', type: 'audio', name: '工艺组现场反馈', duration: '00:32' },
      ],
    },
    {
      id: 'n3-4',
      time: '2026-04-27 14:59:12',
      type: '异常',
      operator: '工艺处置组 高策',
      result: '异常',
      content: '东侧手动阀周边温度偏高，现场人员无法近距离操作，申请消防水幕掩护后再实施关阀。',
      media: [
        {
          id: 'n3-video',
          type: 'video',
          name: '东侧阀组热辐射现场',
          src: fireSceneImage,
          duration: '00:41',
        },
      ],
    },
  ],
  d1: [
    {
      id: 'd1-1',
      time: '2026-04-27 14:57:05',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '已根据事故位置、队伍状态和专业能力匹配炼油消防一中队。',
    },
    {
      id: 'd1-2',
      time: '2026-04-27 14:57:18',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '进行中',
      content: '调度单已生成，待指挥员确认派发；任务包含冷却抑爆、泡沫覆盖和现场侦检。',
    },
  ],
  d2: [
    {
      id: 'd2-1',
      time: '2026-04-27 14:57:12',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '成功',
      content: '重型泡沫车及 3 名车组人员已接收调度任务。',
    },
    {
      id: 'd2-2',
      time: '2026-04-27 14:58:20',
      type: '执行',
      operator: '车组长 陈伟',
      result: '进行中',
      content: '车辆已出库，泡沫液 6t、水 12t，装备状态正常。',
    },
    {
      id: 'd2-3',
      time: '2026-04-27 15:00:42',
      type: '现场反馈',
      operator: '车组长 陈伟',
      result: '进行中',
      content: '车辆已在事故点东北侧停靠，正连接 8 号消防栓和泡沫比例混合器。',
      media: [
        { id: 'd2-image', type: 'image', name: '泡沫车供液干线现场', src: fireSceneImage },
        { id: 'd2-audio', type: 'audio', name: '车组长到场报告', duration: '00:14' },
      ],
    },
    {
      id: 'd2-4',
      time: '2026-04-27 15:02:06',
      type: '完成',
      operator: '现场指挥 王钰',
      result: '已完成',
      content: '泡沫车已建立供液干线并开始持续供泡沫，调度任务完成。',
    },
  ],
  d3: [
    {
      id: 'd3-1',
      time: '2026-04-27 14:57:24',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '已生成医疗救护待命任务，关联厂区医务室和 120 联动联系人。',
    },
    {
      id: 'd3-2',
      time: '2026-04-27 14:57:36',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '进行中',
      content: '调度任务待确认派发，要求配备吸氧、烧伤急救和化学品暴露处置物资。',
    },
  ],
  t1: [
    {
      id: 't1-1',
      time: '2026-04-27 14:59:08',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '根据气象风向和扩散模型，生成下风向周边单位风险提醒通知。',
    },
    {
      id: 't1-2',
      time: '2026-04-27 14:59:30',
      type: '派发',
      operator: '指挥员 杨恒朋',
      result: '进行中',
      content: '通知草稿已完成，待复核扩散影响范围后正式发送。',
    },
  ],
  t2: [
    {
      id: 't2-1',
      time: '2026-04-27 15:00:05',
      type: '系统',
      operator: '应急指挥平台',
      result: '已记录',
      content: '根据泡沫液消耗速率生成增援建议：增派抗溶性水成膜泡沫液 4t。',
    },
    {
      id: 't2-2',
      time: '2026-04-27 15:00:22',
      type: '派发',
      operator: '物资保障组 赵敏',
      result: '进行中',
      content: '已预占库存 4t，待调度指令确认后出库。',
    },
  ],
};

function findCommandInstruction(commandId: string): EmergencyCommandInstruction | undefined {
  const allGroups = [...fixedCommandGroups, ...tempCommandGroups];
  for (const group of allGroups) {
    const item = group.items.find((entry) => entry.id === commandId);
    if (item) return item;
  }
  return undefined;
}

export function resolveEmergencyCommandDetail(commandId: string): CommandActionDetail | null {
  const instruction = findCommandInstruction(commandId);
  if (!instruction) return null;

  const dynamics = commandLogs[instruction.id] ?? [];

  return {
    id: instruction.id,
    name: instruction.name,
    type: instruction.type,
    status: instruction.status,
    location: instruction.location,
    ...commandDetailDefaults,
    dynamics,
  };
}

export const eventCommandToolbarItems: BottomToolbarItem[] = [
  { id: 'comm', label: '应急通讯', iconFile: 'image_0012.png' },
  { id: 'monitor', label: '现场监控', iconFile: 'image_0013.png' },
  { id: 'points', label: '监测点位', iconFile: 'image_0014.png' },
  { id: 'facility', label: '应急消防设施', iconFile: 'image_0016.png' },
  { id: 'resource', label: '应急资源', iconFile: '图片_0001.png' },
];

/** 应急指挥详情底部工具栏图标索引（对应 bottomToolbarIconClips） */
export const eventCommandToolbarIconIndices = [0, 1, 2, 5, 6];

export const guidanceSteps: GuidanceStep[] = [
  { id: 'notify', label: '应急通知', status: 'done' },
  { id: 'dispatch', label: '出警资源', status: 'pending' },
  { id: 'onsite', label: '现场救援', status: 'active' },
  { id: 'complete', label: '前序救援完成', status: 'disabled' },
];

export const rescueDutyPersons = [
  { id: 1, name: '杨恒朋', role: '值班领导', phone: '13792536966', avatarIndex: 0 },
  { id: 2, name: '高策', role: '值班员', phone: '18300556145', avatarIndex: 1 },
  { id: 3, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 2 },
  { id: 4, name: '王磊', role: '值班员', phone: '18300556145', avatarIndex: 3 },
];

export const rescueAuxiliaryStats = [
  { label: '应急专家', value: 47, iconIndex: 0 },
  { label: '应急物资', value: 3510, iconIndex: 1 },
  { label: '救援队伍', value: 10, iconIndex: 2 },
  { label: '装备车辆', value: 55, iconIndex: 3 },
  { label: '应急场所', value: 62, iconIndex: 4 },
  { label: '医疗机构', value: 80, iconIndex: 5 },
  { label: '应急车辆', value: 33, iconIndex: 6 },
  { label: '消防设施', value: 11, iconIndex: 7 },
];

export const rescueDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 12:15:45',
    command:
      '指令内容：请消防一队立即赶赴储罐区B-3，开展主力扑救并同步上报现场情况，注意保持安全距离。',
    responder: '王钰',
    reply: '【已回复】：已接收指令，车辆已出发，预计8分钟到达现场。',
  },
  {
    id: 2,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 12:08:20',
    command: '指令内容：请厂区西门警戒组引导救援车辆进入，确保通道畅通。',
    responder: '赵敏',
    reply: '【已回复】：西门通道已清理完毕，正在引导救援车辆通行。',
  },
  {
    id: 3,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 11:55:10',
    command: '指令内容：请医疗组在集结点设立临时救护站，做好伤员分类救治准备。',
    responder: '李娜',
    reply: '【已回复】：救护站已搭建，医疗物资到位，可接收伤员。',
  },
  {
    id: 4,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 11:40:25',
    command: '指令内容：请环保监测组对事故区域下风向开展连续大气监测并每15分钟上报。',
    responder: '陈强',
    reply: '【已回复】：监测点位已布设，数据实时回传中。',
  },
  {
    id: 5,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 11:28:50',
    command: '指令内容：请工艺处置组切断事故装置上下游物料，执行紧急停车。',
    responder: '周斌',
    reply: '【已回复】：上下游阀门已关闭，装置进入安全退守状态。',
  },
  {
    id: 6,
    title: '应急救援',
    tag: '【固定指令】',
    time: '2026-04-03 11:15:05',
    command: '指令内容：请通信保障组建立现场应急通信专网，确保指挥链路畅通。',
    responder: '吴磊',
    reply: '【已回复】：应急专网已开通，各小组信道分配完毕。',
  },
];

export const bottomToolbarItems: BottomToolbarItem[] = [
  { id: 'comm', label: '应急通讯', iconFile: 'image_0012.png' },
  { id: 'monitor', label: '现场监控', iconFile: 'image_0013.png' },
  { id: 'points', label: '监测点位', iconFile: 'image_0014.png' },
  { id: 'evacuate', label: '应急疏散', iconFile: '图片.png' },
  { id: 'location', label: '人员定位', iconFile: 'image_0015.png' },
  { id: 'facility', label: '应急消防设施', iconFile: 'image_0016.png' },
  { id: 'resource', label: '应急资源', iconFile: '图片_0001.png' },
];

export const accidentRescueMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
