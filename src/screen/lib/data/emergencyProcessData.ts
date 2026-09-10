/**
 * 应急响应流程数据（15 节点 / 5 阶段）——**离线兜底默认值**。
 * - 班组处置（1-4）：必走，按客户“135”原则；
 * - 运行部级（5-7）/ 公司级（8-10）/ 政府级（11-13）：各 3 个节点，逐级升级；
 * - 收尾阶段（14-15）：任意级别处置完成即跳转。
 *
 * 契约类型已上收至 `@/services/emergencyProcess`（对齐 emergency.openapi.json #/EmergencyPhase 等）；
 * 本文件只保留默认值——有后端时由 `loadEmergencyProcessRemote()` 覆盖，
 * 无 `VITE_API_BASE` 的纯静态演示模式回落到此处。
 */

import type {
  CriteriaChecklistItem,
  EmergencyPhase,
  EmergencyResponseMode,
  ProcessAction,
  ProcessStage,
  ResponseModeOption,
  StageEscalationDetails,
  StageEscalationRule,
  SubStageItem,
} from '@/services/emergencyProcess';

export type {
  CriteriaChecklistItem,
  EmergencyPhase,
  EmergencyResponseMode,
  ProcessAction,
  ProcessStage,
  ResponseModeOption,
  StageEscalationDetails,
  StageEscalationRule,
  SubStageItem,
};

export const EMERGENCY_PHASES: EmergencyPhase[] = [
  { id: 'phase-team', name: '班组处置', start: 1, end: 4, tone: 'blue' },
  { id: 'phase-plant', name: '运行部级应急', start: 5, end: 7, tone: 'cyan' },
  { id: 'phase-company', name: '公司级应急', start: 8, end: 10, tone: 'amber' },
  { id: 'phase-gov', name: '政府级应急', start: 11, end: 13, tone: 'red' },
  { id: 'phase-close', name: '收尾阶段', start: 14, end: 15, tone: 'green' },
];

export const RESPONSE_MODE_OPTIONS: ResponseModeOption[] = [
  { value: 'team', label: '一、班组处置', stageId: 1 },
  { value: 'plant', label: '二、运行部级应急', stageId: 5 },
  { value: 'company', label: '三、公司级应急', stageId: 8 },
  { value: 'government', label: '四、政府级应急', stageId: 11 },
];

const baseEscalationRule: StageEscalationRule = {
  triggerCondition: '当前级别处置无法控制险情，需升级到上一级应急响应',
  fromRole: '当前级别现场指挥',
  toRole: '上一级应急指挥部',
  details: {
    location: '加氢裂化装置区',
    substance: '加氢裂化重油 / 硫化氢',
    casualty: '0人受伤',
    currentStatus: '现场处置推进中',
  },
};

function makeEscalationStage(id: number, levelName: string, nodeIndex: number): ProcessStage {
  return {
    id,
    name: `${levelName}·节点${nodeIndex}`,
    shortName: `节点${nodeIndex}`,
    leadRole: `🧑‍💼 ${levelName}现场指挥`,
    leadTitle: `${levelName}指挥长`,
    commandLevel: levelName,
    description: `按${levelName}专项预案执行第 ${nodeIndex} 项处置任务，落实力量部署、工艺控制与态势上报。`,
    previousContext: [`上一节点已完成，进入${levelName}节点${nodeIndex}`],
    currentActions: [
      {
        id: `act-${id}-1`,
        label: `落实${levelName}节点${nodeIndex}处置指令`,
        done: false,
        type: 'primary',
      },
      { id: `act-${id}-2`, label: '同步上报现场态势与处置进展', done: false },
    ],
    criteriaChecklist: [
      { id: `cri-${id}-1`, label: `${levelName}节点${nodeIndex}关键动作完成`, checked: false },
      { id: `cri-${id}-2`, label: '现场态势受控或具备升级条件', checked: false },
    ],
    escalationRule: baseEscalationRule,
  };
}

export const mockEmergencyProcessStages: ProcessStage[] = [
  {
    id: 1,
    name: '接警研判',
    shortName: '1. 接警研判',
    leadRole: '🧑 现场第一发现人 / 岗位带班',
    leadTitle: '巡检员 / 内操员',
    commandLevel: '班组处置',
    description: '通过巡检、仪器报警第一时间捕捉险情，按三要素（地点、介质、伤员）上报。',
    previousContext: ['10:00:00 - 厂区 GDS 检测到气体异常', '10:00:15 - 发现 T103 塔底法兰渗漏'],
    currentActions: [
      { id: 'act-1-1', label: '按三要素向运行部调度核实报告', done: true, type: 'primary' },
      { id: 'act-1-2', label: '佩戴防护对现场建立初始警戒', done: true },
    ],
    criteriaChecklist: [
      { id: 'cri-1-1', label: '确定事故点位与介质', checked: true },
      { id: 'cri-1-2', label: '完成初步信息上报', checked: true },
    ],
    escalationRule: {
      triggerCondition: '确认工况异常或发生真实泄漏，启动班组初始应急',
      fromRole: '现场第一发现人',
      toRole: '现场班组长',
      details: {
        location: '加氢制氢部 T103 塔底泵 P101B 处',
        substance: '加氢裂化重油 / 硫化氢（H2S）',
        casualty: '无人员受伤',
        currentStatus: '现场有轻度泄漏，报警系统正常响应',
      },
    },
  },
  {
    id: 2,
    name: '一分钟应急响应与能量隔离',
    shortName: '2. 一分钟应急响应',
    leadRole: '🧑‍💼 现场班组长（岗位带班）',
    leadTitle: '加氢班组长',
    commandLevel: '班组处置',
    description: '一分钟内落实“该停的停、该关的关、该放的放”，执行能量隔离与物料切断。',
    previousContext: ['10:00:30 - 已完成接警研判'],
    currentActions: [
      { id: 'act-2-1', label: 'DCS 一键急停与切断联锁', done: true, type: 'danger' },
      { id: 'act-2-2', label: '停运 P101B，关闭进料阀', done: true },
      { id: 'act-2-3', label: '开启紧急泄压阀门降压', done: true },
    ],
    criteriaChecklist: [
      { id: 'cri-2-1', label: '能量隔离阀关毕率 100%', checked: true },
      { id: 'cri-2-2', label: '无关人员撤至上风向', checked: true },
    ],
    escalationRule: {
      triggerCondition: '一分钟能量隔离完成，申请运行部级预案评定',
      fromRole: '现场班组长',
      toRole: '运行部区域主管',
      details: {
        location: 'T103 塔及泵房区域',
        substance: '加氢裂化重油',
        casualty: '0人受伤',
        currentStatus: '进料切断完成，塔压下降中',
      },
    },
  },
  {
    id: 3,
    name: '三分钟退守稳态',
    shortName: '3. 三分钟退守稳态',
    leadRole: '🧑‍💻 运行部区域主管',
    leadTitle: '加氢运行部主管',
    commandLevel: '班组处置',
    description: '三分钟内完成工艺退守稳态：降温降压、物料导空、系统隔离。',
    previousContext: ['10:01:00 - 能量隔离完成'],
    currentActions: [
      { id: 'act-3-1', label: '降温降压退守稳态', done: true },
      { id: 'act-3-2', label: '物料导空并完成系统隔离', done: false, type: 'warning' },
      { id: 'act-3-3', label: '评估是否达到升级条件', done: false, type: 'primary' },
    ],
    criteriaChecklist: [
      { id: 'cri-3-1', label: '塔体压力降至安全阈值', checked: true },
      { id: 'cri-3-2', label: '泄漏点气体浓度受控', checked: false },
    ],
    escalationRule: {
      triggerCondition: '退守稳态期间泄漏扩大或浓度超限，升级至运行部级预案',
      fromRole: '运行部区域主管',
      toRole: '运行部级应急指挥部',
      details: {
        location: '加氢裂化装置区',
        substance: '加氢裂化重油 / 硫化氢',
        casualty: '0人受伤',
        currentStatus: '塔压下降中，仍有少量介质渗出',
      },
    },
  },
  {
    id: 4,
    name: '五分钟消气防联动',
    shortName: '4. 五分钟消气防联动',
    leadRole: '🚒 消气防救援力量',
    leadTitle: '消气防指挥',
    commandLevel: '班组处置',
    description: '五分钟内消气防联动：水幕隔离、泄漏稀释、人员清点，防止气体扩散形成闪爆。',
    previousContext: ['10:02:00 - 申请消气防联动'],
    currentActions: [
      { id: 'act-4-1', label: '启动水幕隔离与泄漏稀释', done: false, type: 'danger' },
      { id: 'act-4-2', label: '气体浓度连续监测与警戒', done: false },
      { id: 'act-4-3', label: '全装置人员清点确认', done: false },
    ],
    criteriaChecklist: [
      { id: 'cri-4-1', label: '下风向 100m 内无人员', checked: false },
      { id: 'cri-4-2', label: '气体浓度不再上升', checked: false },
    ],
    escalationRule: {
      triggerCondition: '班组处置无法控制，需升级至运行部级应急',
      fromRole: '消气防指挥',
      toRole: '运行部级应急指挥部',
      details: {
        location: '加氢裂化装置区及周边',
        substance: '加氢裂化重油 / 硫化氢',
        casualty: '0人受伤',
        currentStatus: '水幕已启动，浓度持续监测中',
      },
    },
  },
  makeEscalationStage(5, '运行部级应急', 1),
  makeEscalationStage(6, '运行部级应急', 2),
  makeEscalationStage(7, '运行部级应急', 3),
  makeEscalationStage(8, '公司级应急', 1),
  makeEscalationStage(9, '公司级应急', 2),
  makeEscalationStage(10, '公司级应急', 3),
  makeEscalationStage(11, '政府级应急', 1),
  makeEscalationStage(12, '政府级应急', 2),
  makeEscalationStage(13, '政府级应急', 3),
  {
    id: 14,
    name: '应急终止',
    shortName: '14. 应急终止',
    leadRole: '✅ 现场处置组',
    leadTitle: '现场指挥',
    commandLevel: '收尾阶段',
    description: '确认泄漏点封堵、气体浓度达标、污染水全部回收，解除现场警戒。',
    previousContext: ['当前级别处置完成，进入收尾'],
    currentActions: [
      { id: 'act-14-1', label: '泄漏点封堵确认', done: false },
      { id: 'act-14-2', label: '现场气体浓度复测达标', done: false },
      { id: 'act-14-3', label: '解除警戒与恢复通行', done: false },
    ],
    criteriaChecklist: [
      { id: 'cri-14-1', label: '泄漏源彻底消除', checked: false },
      { id: 'cri-14-2', label: '无二次衍生隐患', checked: false },
    ],
    escalationRule: {
      triggerCondition: '处置完成确认后转入总结评估',
      fromRole: '现场指挥',
      toRole: '总结评估组',
      details: {
        location: 'T103 塔区域',
        substance: '-',
        casualty: '0人受伤',
        currentStatus: '现场处置完成',
      },
    },
  },
  {
    id: 15,
    name: '总结评估与恢复',
    shortName: '15. 总结评估与恢复',
    leadRole: '📋 总结评估组',
    leadTitle: '应急办主任',
    commandLevel: '收尾阶段',
    description: '事故原因调查、损害评估、环境跟踪，确认恢复生产条件并归档复盘。',
    previousContext: ['10:40:00 - 应急终止完成'],
    currentActions: [
      { id: 'act-15-1', label: '事故原因调查组成立', done: false },
      { id: 'act-15-2', label: '设备损害评估与修复计划', done: false },
      { id: 'act-15-3', label: '恢复生产条件确认', done: false },
    ],
    criteriaChecklist: [
      { id: 'cri-15-1', label: '调查报告完成', checked: false },
      { id: 'cri-15-2', label: '生产恢复条件具备', checked: false },
    ],
    escalationRule: {
      triggerCondition: '总结归档完成，应急流程关闭',
      fromRole: '总结评估组',
      toRole: '公司应急指挥中心',
      details: {
        location: '茂名石化厂区',
        substance: '-',
        casualty: '0人受伤',
        currentStatus: '总结与恢复进行中',
      },
    },
  },
];
