import { computed, reactive, ref } from 'vue';
import {
  EMERGENCY_PHASES,
  mockEmergencyProcessStages,
  RESPONSE_MODE_OPTIONS,
  type EmergencyPhase,
  type EmergencyResponseMode,
  type ProcessStage,
} from '../data/emergencyProcessData';
import { mockDutyRoster, mockNodeGuidances, type NodeGuidance } from '../data/nodeGuidanceData';
import {
  cloneDefaultNodeConfigs,
  loadNodeConfigs,
  mergeNodeConfigs,
  saveNodeConfigs,
  type NodePhaseConfig,
} from '../data/nodeConfigData';
import {
  fetchEmergencyProcessGuidances,
  fetchEmergencyProcessPanorama,
  fetchNodePhaseConfigs,
  saveNodePhaseConfigs,
  type ResponseModeOption,
} from '@/services/emergencyProcess';
import { backendUnavailableWarn } from '@/services/backendFallback';

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

/** 应急阶段（默认值起步，`loadEmergencyProcessRemote()` 成功后被后端数据覆盖）。 */
const phases = ref<EmergencyPhase[]>([...EMERGENCY_PHASES]);
/** 响应模式选项（同上）。 */
const responseModes = ref<ResponseModeOption[]>([...RESPONSE_MODE_OPTIONS]);
/** 节点处置指引（按节点 id 索引；同上）。 */
const guidances = ref<Record<string, NodeGuidance>>({ ...mockNodeGuidances });
/** 实时值班表（同上）。 */
const dutyRoster = ref({ ...mockDutyRoster });

/** 是否落库：配置了 VITE_API_BASE 时才读写后端，否则维持本地缓存（纯静态演示模式）。 */
function nodeConfigsToBackend(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE);
}

/** 拉取后端节点联动配置并覆盖到本地（失败保持现有本地态并告警，不白屏）。 */
export async function loadNodeConfigsRemote(): Promise<void> {
  if (!nodeConfigsToBackend()) return;
  try {
    const list = await fetchNodePhaseConfigs();
    if (!Array.isArray(list) || list.length === 0) return;
    nodeConfigs.value = mergeNodeConfigs(list);
    saveNodeConfigs(nodeConfigs.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('emergency-process', '/emergency/process/node-configs', message);
  }
}

/**
 * 拉取后端「应急流程全景」（阶段 / 响应模式 / 15 节点）与「节点处置指引」（值班表 + 各节点指引），
 * 逐项覆盖本地默认值；失败保持本地默认值并告警（纯静态演示模式回落到 data/*.ts 常量）。
 */
export async function loadEmergencyProcessRemote(): Promise<void> {
  if (!nodeConfigsToBackend()) return;
  try {
    const [panorama, guidance] = await Promise.all([
      fetchEmergencyProcessPanorama(),
      fetchEmergencyProcessGuidances(),
    ]);
    if (panorama) {
      if (Array.isArray(panorama.phases) && panorama.phases.length > 0) {
        phases.value = panorama.phases;
      }
      if (Array.isArray(panorama.responseModes) && panorama.responseModes.length > 0) {
        responseModes.value = panorama.responseModes;
      }
      if (Array.isArray(panorama.stages) && panorama.stages.length > 0) {
        state.stages = panorama.stages;
      }
    }
    if (guidance) {
      if (guidance.dutyRoster) {
        dutyRoster.value = { ...dutyRoster.value, ...guidance.dutyRoster };
      }
      if (Array.isArray(guidance.guidances) && guidance.guidances.length > 0) {
        const merged: Record<string, NodeGuidance> = { ...guidances.value };
        for (const node of guidance.guidances) {
          if (node?.nodeId) merged[node.nodeId] = node;
        }
        guidances.value = merged;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '请求失败';
    backendUnavailableWarn('emergency-process', '/emergency/process/panorama', message);
  }
}

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
    phases.value.find((phase) => stageId >= phase.start && stageId <= phase.end) ?? phases.value[0]
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
    const existing = guidances.value[String(stage.id)];
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
          personName: dutyRoster.value.supervisor,
          avatarIcon: '🧑‍💼',
          phone: dutyRoster.value.supervisorPhone,
          tasks: [stage.description],
        },
        {
          roleName: '内操',
          roleTitle: 'DCS 中控室内操',
          personName: dutyRoster.value.boardOperator,
          avatarIcon: '🧑‍💻',
          phone: dutyRoster.value.boardOperatorPhone,
          tasks: ['执行工艺参数控制并持续通报现场态势'],
        },
        {
          roleName: '外操',
          roleTitle: '现场外操巡检员',
          personName: dutyRoster.value.fieldOperator,
          avatarIcon: '🧑‍🔧',
          phone: dutyRoster.value.fieldOperatorPhone,
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
      const team = phases.value[0];
      return isPhaseCompleted(team);
    }
    const index = phases.value.findIndex((p) => p.id === phase.id);
    const prev = phases.value[index - 1];
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
    void loadEmergencyProcessRemote();
  }

  function closeGuidance() {
    state.guidanceModal.show = false;
  }

  function openNodeConfig() {
    state.nodeConfigOpen = true;
    void loadNodeConfigsRemote();
  }

  function closeNodeConfig() {
    state.nodeConfigOpen = false;
  }

  /**
   * 保存节点联动配置（整表提交）。有后端时先落库再回写本地，失败不假成功（返回 false 且本地态不变）；
   * 无 VITE_API_BASE 的纯静态演示模式仅写本地缓存。
   */
  async function saveNodeConfig(configs: Record<string, NodePhaseConfig>): Promise<boolean> {
    if (!nodeConfigsToBackend()) {
      nodeConfigs.value = JSON.parse(JSON.stringify(configs));
      saveNodeConfigs(nodeConfigs.value);
      return true;
    }
    try {
      const saved = await saveNodePhaseConfigs(Object.values(configs));
      nodeConfigs.value =
        Array.isArray(saved) && saved.length > 0
          ? mergeNodeConfigs(saved)
          : (JSON.parse(JSON.stringify(configs)) as Record<string, NodePhaseConfig>);
      saveNodeConfigs(nodeConfigs.value);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败';
      backendUnavailableWarn('emergency-process', 'PUT /emergency/process/node-configs', message);
      return false;
    }
  }

  /** 恢复默认节点配置（默认值即 V30 种子），走与保存相同的落库路径。 */
  async function resetNodeConfig(): Promise<boolean> {
    return saveNodeConfig(cloneDefaultNodeConfigs());
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
      const phaseIndex = phases.value.findIndex((item) => item.id === phase.id);
      const nextPhase = phases.value[phaseIndex + 1];
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
    dutyRoster,
    phases,
    responseModeOptions: responseModes,
    loadEmergencyProcessRemote,
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
    loadNodeConfigsRemote,
    advanceNext,
    startAutoDemo,
    stopAutoDemo,
  };
}
