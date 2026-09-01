import { computed, reactive, ref } from 'vue';
import {
  EMERGENCY_PHASES,
  mockEmergencyProcessStages,
  RESPONSE_MODE_OPTIONS,
  type EmergencyPhase,
  type EmergencyResponseMode,
  type ProcessStage,
} from '@/services/map-data/emergencyProcessData';
import {
  mockDutyRoster,
  mockNodeGuidances,
  type NodeGuidance,
} from '@/services/map-data/nodeGuidanceData';
import {
  loadNodeConfigs,
  saveNodeConfigs,
  type NodePhaseConfig,
} from '@/services/map-data/nodeConfigData';

const STAGE_ID_TO_NODE_ID: Record<number, string> = {
  1: 'alarmJudgement',
  2: '1min',
  3: '3min',
  4: '5min',
  5: 'plantArea',
  6: 'plantArea',
  7: 'plantArea',
  8: 'companyLevel',
  9: 'companyLevel',
  10: 'companyLevel',
  11: 'govLevel',
  12: 'govLevel',
  13: 'govLevel',
  14: 'handling',
  15: 'archive',
};

const MODE_STAGE: Record<EmergencyResponseMode, number> = {
  team: 1,
  plant: 5,
  company: 8,
  government: 11,
};

const MODE_STAGE_NAME: Record<EmergencyResponseMode, string> = {
  team: '班组处置',
  plant: '运行部级应急',
  company: '公司级应急',
  government: '政府级应急',
};

const state = reactive({
  stages: [...mockEmergencyProcessStages] as ProcessStage[],
  activePhaseId: 1,
  activeSubStageCode: null as string | null,
  responseMode: 'team' as EmergencyResponseMode,
  isEscalated: false,
  completedPhases: [] as number[],
  escalateModal: {
    show: false,
    targetMode: 'plant' as EmergencyResponseMode,
    targetStageName: '装置区应急',
  },
  guidanceModal: {
    show: false,
    nodeId: '1',
  },
  nodeConfigOpen: false,
  phaseDecision: {
    show: false,
    escalatePhase: null as EmergencyPhase | null,
    finishStageId: 14,
  },
  unlockedPhaseIds: ['phase-team', 'phase-close'] as string[],
});

const nodeConfigs = ref<Record<string, NodePhaseConfig>>(loadNodeConfigs());

let autoDemoTimer: ReturnType<typeof setInterval> | null = null;
const autoDemoRunning = ref(false);

function stageToNodeId(stageId: number): string {
  return STAGE_ID_TO_NODE_ID[stageId] ?? 'alarmJudgement';
}

function modeFromStage(stageId: number): EmergencyResponseMode {
  if (stageId >= 11) return 'government';
  if (stageId >= 8) return 'company';
  if (stageId >= 5) return 'plant';
  return 'team';
}

function phaseOf(stageId: number): EmergencyPhase {
  return (
    EMERGENCY_PHASES.find((phase) => stageId >= phase.start && stageId <= phase.end) ??
    EMERGENCY_PHASES[0]
  );
}

function phaseStages(phase: EmergencyPhase) {
  return state.stages.filter((s) => s.id >= phase.start && s.id <= phase.end);
}

export function useEmergencyProcess() {
  const currentStage = computed(
    () => state.stages.find((item) => item.id === state.activePhaseId) ?? state.stages[0],
  );

  const currentNodeId = computed(() => stageToNodeId(state.activePhaseId));

  const currentNodeConfig = computed(
    () => nodeConfigs.value[currentNodeId.value] ?? nodeConfigs.value.alarmJudgement,
  );

  const currentNodeGuidance = computed<NodeGuidance>(() => {
    const stage = currentStage.value;
    const existing = mockNodeGuidances[String(stage.id)];
    if (existing) return existing;
    return {
      nodeId: String(stage.id),
      nodeName: `节点 ${stage.id}：${stage.name}`,
      reportingChain: [
        {
          step: 1,
          fromRole: stage.escalationRule.fromRole,
          toRole: stage.escalationRule.toRole,
          method: '应急指挥专线',
          notice: stage.escalationRule.triggerCondition,
        },
      ],
      roleTasks: [
        {
          roleName: '班长',
          roleTitle: stage.leadTitle,
          personName: mockDutyRoster.supervisor,
          avatarIcon: '🧑‍💼',
          phone: mockDutyRoster.supervisorPhone,
          tasks: [stage.description],
        },
        {
          roleName: '内操',
          roleTitle: 'DCS 中控室内操',
          personName: mockDutyRoster.boardOperator,
          avatarIcon: '🧑‍💻',
          phone: mockDutyRoster.boardOperatorPhone,
          tasks: ['执行工艺参数控制并持续通报现场态势'],
        },
        {
          roleName: '外操',
          roleTitle: '现场外操巡检员',
          personName: mockDutyRoster.fieldOperator,
          avatarIcon: '🧑‍🔧',
          phone: mockDutyRoster.fieldOperatorPhone,
          tasks: ['落实现场处置动作并确认完成标准'],
        },
      ],
      generalNotice: stage.description,
    };
  });

  const leftPanelVisible = computed(() => {
    const hidden = new Set(currentNodeConfig.value.leftPanelHiddenPanels ?? []);
    return {
      incident: !hidden.has('incident'),
      plan: !hidden.has('plan'),
      info: !hidden.has('info'),
    };
  });

  const currentPhaseCompleted = computed(() => isPhaseCompleted(phaseOf(state.activePhaseId)));

  const rightPanelVisible = computed(() => {
    const hidden = new Set(currentNodeConfig.value.rightPanelHiddenTabs ?? []);
    return {
      duty: !hidden.has('duty'),
      auxiliary: !hidden.has('auxiliary'),
      dynamics: !hidden.has('dynamics'),
    };
  });

  function isCompleted(stageId: number) {
    return state.completedPhases.includes(stageId);
  }

  function isPhaseCompleted(phase: EmergencyPhase): boolean {
    const stages = phaseStages(phase);
    return stages.length > 0 && stages.every((s) => isCompleted(s.id));
  }

  function isPhaseUnlocked(phase: EmergencyPhase): boolean {
    return state.unlockedPhaseIds.includes(phase.id);
  }

  function unlockPhase(phaseId: string) {
    if (!state.unlockedPhaseIds.includes(phaseId)) {
      state.unlockedPhaseIds.push(phaseId);
    }
  }

  /** 业务规则：班组必执行；升级阶段需前一阶段完成后才可进入；收尾需班组完成后可随时进入 */
  function canEnterPhase(phase: EmergencyPhase): boolean {
    if (phase.id === 'phase-team') return true;
    if (phase.id === 'phase-close') {
      const team = EMERGENCY_PHASES[0];
      return isPhaseCompleted(team);
    }
    const index = EMERGENCY_PHASES.findIndex((p) => p.id === phase.id);
    const prev = EMERGENCY_PHASES[index - 1];
    return prev ? isPhaseCompleted(prev) : false;
  }

  function selectStage(stageId: number) {
    state.activePhaseId = stageId;
    state.activeSubStageCode = null;
    const derived = modeFromStage(stageId);
    if (derived !== state.responseMode) {
      state.responseMode = derived;
      state.isEscalated = derived !== 'team';
    }
  }

  function selectSubStage(stageId: number, subCode: string) {
    state.activePhaseId = stageId;
    state.activeSubStageCode = subCode;
  }

  function completeStage(stageId: number) {
    if (!state.completedPhases.includes(stageId)) {
      state.completedPhases.push(stageId);
    }
  }

  function requestEscalate(targetMode: EmergencyResponseMode) {
    if (targetMode === state.responseMode) return;
    state.escalateModal.targetMode = targetMode;
    state.escalateModal.targetStageName = MODE_STAGE_NAME[targetMode];
    state.escalateModal.show = true;
  }

  function confirmEscalate() {
    const mode = state.escalateModal.targetMode;
    state.responseMode = mode;
    state.isEscalated = mode !== 'team';
    state.activePhaseId = MODE_STAGE[mode];
    state.activeSubStageCode = mode === 'plant' ? '5.1' : mode === 'company' ? '6.1' : null;
    state.escalateModal.show = false;
  }

  function cancelEscalate() {
    state.escalateModal.show = false;
  }

  function openGuidance(nodeId?: string) {
    state.guidanceModal.nodeId = nodeId ?? String(state.activePhaseId);
    state.guidanceModal.show = true;
  }

  function closeGuidance() {
    state.guidanceModal.show = false;
  }

  function openNodeConfig() {
    state.nodeConfigOpen = true;
  }

  function closeNodeConfig() {
    state.nodeConfigOpen = false;
  }

  function saveNodeConfig(configs: Record<string, NodePhaseConfig>) {
    nodeConfigs.value = JSON.parse(JSON.stringify(configs));
    saveNodeConfigs(nodeConfigs.value);
  }

  function resetNodeConfig() {
    nodeConfigs.value = loadNodeConfigs();
    saveNodeConfigs(nodeConfigs.value);
  }

  function requestPhaseDecision(escalatePhase: EmergencyPhase | null) {
    state.phaseDecision.show = true;
    state.phaseDecision.escalatePhase = escalatePhase;
    state.phaseDecision.finishStageId = 14;
  }

  function confirmEscalateToPhase() {
    const target = state.phaseDecision.escalatePhase;
    state.phaseDecision.show = false;
    if (target && isPhaseCompleted(phaseOf(state.activePhaseId))) {
      unlockPhase(target.id);
      selectStage(target.start);
    }
  }

  function confirmFinishPhase() {
    const target = state.phaseDecision.finishStageId;
    state.phaseDecision.show = false;
    selectStage(target);
  }

  function finishNow() {
    selectStage(14);
  }

  function cancelPhaseDecision() {
    state.phaseDecision.show = false;
  }

  /** 流程推进：完成当前节点；阶段末按“升级或收尾”决策 */
  function advanceNext() {
    completeStage(state.activePhaseId);
    const phase = phaseOf(state.activePhaseId);
    const next = state.activePhaseId + 1;
    if (state.activePhaseId >= state.stages.length) return;
    if (phase.end === state.activePhaseId) {
      if (phase.id === 'phase-close') return;
      const phaseIndex = EMERGENCY_PHASES.findIndex((item) => item.id === phase.id);
      const nextPhase = EMERGENCY_PHASES[phaseIndex + 1];
      if (!nextPhase || nextPhase.id === 'phase-close') {
        selectStage(14);
        return;
      }
      requestPhaseDecision(nextPhase);
      return;
    }
    selectStage(next);
  }

  function startAutoDemo() {
    if (autoDemoRunning.value) return;
    autoDemoRunning.value = true;
    autoDemoTimer = setInterval(() => {
      if (state.activePhaseId >= state.stages.length) {
        stopAutoDemo();
        return;
      }
      advanceNext();
      if (state.phaseDecision.show) {
        confirmEscalateToPhase();
      }
    }, 3200);
  }

  function stopAutoDemo() {
    autoDemoRunning.value = false;
    if (autoDemoTimer) {
      clearInterval(autoDemoTimer);
      autoDemoTimer = null;
    }
  }

  return {
    state,
    stages: state.stages,
    currentStage,
    currentNodeId,
    currentNodeConfig,
    currentNodeGuidance,
    currentPhaseCompleted,
    leftPanelVisible,
    rightPanelVisible,
    nodeConfigs,
    autoDemoRunning,
    mockDutyRoster,
    responseModeOptions: RESPONSE_MODE_OPTIONS,
    phaseDecision: state.phaseDecision,
    unlockedPhaseIds: state.unlockedPhaseIds,
    requestPhaseDecision,
    confirmEscalateToPhase,
    confirmFinishPhase,
    cancelPhaseDecision,
    isPhaseCompleted,
    isPhaseUnlocked,
    unlockPhase,
    canEnterPhase,
    finishNow,
    isCompleted,
    selectStage,
    selectSubStage,
    completeStage,
    requestEscalate,
    confirmEscalate,
    cancelEscalate,
    openGuidance,
    closeGuidance,
    openNodeConfig,
    closeNodeConfig,
    saveNodeConfig,
    resetNodeConfig,
    advanceNext,
    startAutoDemo,
    stopAutoDemo,
  };
}
