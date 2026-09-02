import { fireEmergencyAllEventGroups } from '../composables/useFireEmergencyEventList';
import type {
  EmergencyProcessStage,
  GuidanceStep,
  IncidentDetailField,
  RescueDynamicEntry,
  RescueStageProgressItem,
} from './accidentRescueMock';
import { findFireEmergencyEventById } from './fireEmergencyEventsStore';

export interface DrillRescueIncident {
  eventId: number;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
  hazardSourceLevel?: string;
  mapStatus: string;
  startedAt: string;
  endedAt?: string;
  status: 'processing' | 'pending' | 'done';
  reported: boolean;
  detailFields: IncidentDetailField[];
  facilityName: string;
}

function buildDrillDetailFields(event: {
  time: string;
  title: string;
  description: string;
  location: string;
}): IncidentDetailField[] {
  return [
    { label: '演练时间', value: event.time },
    { label: '演练名称', value: event.title },
    { label: '演练类型', value: '计划演练' },
    { label: '演练描述', value: event.description },
    { label: '演练地点', value: event.location },
    { label: '组织部门', value: '应急管理部' },
    { label: '演练指挥', value: '李四' },
    { label: '参演人数', value: '48人' },
    { label: '演练脚本', value: '储罐火灾应急处置联合演练脚本 V2.1' },
    { label: '演练状态', value: '未启动' },
    { label: '死亡人数', value: '0人' },
    { label: '重伤人数', value: '0人' },
    { label: '轻伤人数', value: '0人' },
    {
      label: '已采取措施',
      value: '已通知参演队伍集结，现场警戒与疏散路线已确认，等待演练指挥下达处置指令。',
    },
    { label: '附件信息', value: '演练脚本.pdf' },
  ];
}

export function resolveDrillRescueIncident(eventId?: number): DrillRescueIncident {
  const drillEvents = fireEmergencyAllEventGroups.value
    .flatMap((group) => group.events)
    .filter((event) => event.kind === 'drill');

  const event =
    drillEvents.find((item) => item.id === eventId) ??
    drillEvents[0] ??
    findFireEmergencyEventById(eventId);

  if (!event) {
    return {
      eventId: 0,
      title: '演练事件',
      location: '厂区待标注',
      longitude: 110.928,
      latitude: 21.678,
      hazardSourceLevel: '三级',
      mapStatus: '演练处置',
      startedAt: '',
      endedAt: undefined,
      status: 'pending',
      reported: false,
      facilityName: '储罐演练区',
      detailFields: buildDrillDetailFields({
        time: '',
        title: '演练事件',
        description: '—',
        location: '厂区待标注',
      }),
    };
  }

  const hazardLevels = ['一级', '二级', '三级', '四级'];

  return {
    eventId: event.id,
    title: event.title,
    location: event.location,
    longitude: event.longitude,
    latitude: event.latitude,
    hazardSourceLevel: event.hazardSourceLevel ?? hazardLevels[event.id % hazardLevels.length],
    mapStatus: '演练处置',
    startedAt: event.time,
    endedAt: event.endedAt,
    status: event.status,
    reported: event.reported,
    facilityName: event.title.includes('储罐') ? '储罐演练区' : event.title,
    detailFields: buildDrillDetailFields(event),
  };
}

export const drillIncidentDetailTabs = [
  { key: 'basic', label: '演练信息' },
  { key: 'response', label: '演练流程' },
  { key: 'dispatch', label: '参演资源' },
  { key: 'video', label: '现场视频' },
] as const;

export const drillResponseFields: IncidentDetailField[] = [
  { label: '演练等级', value: '公司级联合演练' },
  { label: '启动时间', value: '2026-04-03 12:00:00' },
  { label: '指挥体系', value: '公司演练指挥部' },
  { label: '现场指挥', value: '李四' },
  { label: '演练状态', value: '进行中' },
  {
    label: '演练要点',
    value: '按脚本开展警戒疏散、冷却抑爆与联合处置，同步记录参演队伍响应时效。',
  },
];

export const drillDispatchFields: IncidentDetailField[] = [
  { label: '参演队伍', value: '消防一队、消防二队、工艺处置组' },
  { label: '参演车辆', value: '消防救援车 2 辆、泡沫车 1 辆' },
  { label: '参演物资', value: '泡沫灭火剂、防化服、警戒设施' },
  { label: '观摩人员', value: '应急管理部、生产管理部共 12 人' },
  { label: '调度状态', value: '参演资源已到位' },
];

export const drillVideoFields: IncidentDetailField[] = [
  { label: '储罐区东侧', value: '在线 · 1080P' },
  { label: '西门通道', value: '在线 · 720P' },
  { label: '总控室', value: '在线 · 1080P' },
  { label: '演练指挥席', value: '在线 · 1080P' },
];

export const drillGuidanceSteps: GuidanceStep[] = [
  { id: 'notify', label: '演练通知', status: 'done' },
  { id: 'dispatch', label: '演练资源', status: 'pending' },
  { id: 'onsite', label: '现场演练', status: 'active' },
  { id: 'complete', label: '演练总结', status: 'disabled' },
];

const drillProcessStagesStarted: EmergencyProcessStage[] = [
  {
    id: 'stage1',
    label: '阶段一',
    status: 'active',
    tasks: [
      { id: 'notify', label: '演练通知', status: 'done' },
      { id: 'gather', label: '队伍集结', status: 'active' },
      { id: 'cordon', label: '现场警戒', status: 'pending' },
    ],
  },
  { id: 'stage2', label: '阶段二', status: 'pending' },
  { id: 'stage3', label: '阶段三', status: 'pending' },
  { id: 'stage4', label: '阶段四', status: 'pending' },
  { id: 'stage5', label: '阶段五', status: 'pending' },
];

const drillProcessStagesPending: EmergencyProcessStage[] = [
  { id: 'stage1', label: '阶段一', status: 'pending' },
  { id: 'stage2', label: '阶段二', status: 'pending' },
  { id: 'stage3', label: '阶段三', status: 'pending' },
  { id: 'stage4', label: '阶段四', status: 'pending' },
  { id: 'stage5', label: '阶段五', status: 'pending' },
];

export function resolveDrillProcessStages(
  status: DrillRescueIncident['status'],
): EmergencyProcessStage[] {
  return status === 'pending' ? drillProcessStagesPending : drillProcessStagesStarted;
}

const drillStageProgressStarted: RescueStageProgressItem[] = [
  { id: 'stage1', orderLabel: '一', status: 'active' },
  { id: 'stage2', orderLabel: '二', status: 'pending' },
  { id: 'stage3', orderLabel: '三', status: 'pending' },
  { id: 'stage4', orderLabel: '四', status: 'pending' },
];

const drillStageProgressPending: RescueStageProgressItem[] = [
  { id: 'stage1', orderLabel: '一', status: 'pending' },
  { id: 'stage2', orderLabel: '二', status: 'pending' },
  { id: 'stage3', orderLabel: '三', status: 'pending' },
  { id: 'stage4', orderLabel: '四', status: 'pending' },
];

export function resolveDrillStageProgressItems(
  status: DrillRescueIncident['status'],
): RescueStageProgressItem[] {
  return status === 'pending' ? drillStageProgressPending : drillStageProgressStarted;
}

export const drillDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    stageLabel: '演练阶段一',
    title: '演练处置',
    tag: '【演练指令】',
    time: '2026-04-03 12:15:45',
    command: '指令内容：请参演消防一队按演练脚本赶赴储罐区，开展联合演练处置并同步上报现场情况。',
    responder: '王钰',
    reply: '【已回复】：已接收演练指令，参演队伍已出发，预计8分钟到达演练点位。',
  },
  {
    id: 2,
    stageLabel: '演练阶段二',
    title: '演练警戒',
    tag: '【演练指令】',
    time: '2026-04-03 12:08:20',
    command: '指令内容：请西门警戒组引导参演车辆进入，确保演练通道畅通。',
    responder: '赵敏',
    reply: '【已回复】：西门通道已清理完毕，正在引导参演车辆通行。',
  },
];

export const drillBriefDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    title: '演练简报',
    tag: '【快讯】',
    time: '2026-04-03 12:10:00',
    command: '参演队伍已集结完毕，演练按计划推进，暂无异常情况。',
    responder: '演练指挥部',
    reply: '【已发布】',
  },
];

export const drillAwarenessDynamics: RescueDynamicEntry[] = [
  {
    id: 1,
    title: '态势感知',
    tag: '【快报】',
    time: '2026-04-03 12:12:30',
    command: '演练区域气象条件稳定，周边装置运行正常，参演通道畅通。',
    responder: '态势席',
    reply: '【已同步】',
  },
];
