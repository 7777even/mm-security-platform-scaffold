/**
 * 应急预案矩阵 - 仅保留类型定义。
 * 运行时数据已迁移至 src/services/emergencyPlan.ts（fetchPlanMatrix / fetchEmergencyPlanOptions）。
 * 以下 interface 仍被各面板以 `import type` 方式引用，请勿删除。
 */

export type PlanCardStatus = 'pending' | 'in-progress' | 'completed';

export interface PlanMajorPhase {
  id: string;
  name: string;
  order: number;
  /** 上报与升级流程（大阶段行下方展示） */
  upgradeProcess?: string;
}

export interface PlanSubPhase {
  id: string;
  parentId: string;
  name: string;
  order: number;
  progress?: number;
}

export interface PlanRiskEvent {
  id: string;
  subPhaseId: string;
  name: string;
}

export interface PlanCombatResource {
  id: string;
  name: string;
  expectedCount: number | string;
  actualCount: number | string;
  leaderName?: string;
  contactPhone?: string;
  duties: string;
  lon?: number;
  lat?: number;
}

export interface PlanActionCard {
  id: string;
  resourceId: string;
  title: string;
  content?: string;
  description?: string;
  startSubPhaseId: string;
  endSubPhaseId: string;
  riskEventId?: string;
  status: PlanCardStatus;
  isGlobal?: boolean;
}

export interface PlanInstance {
  id: string;
  title: string;
  description: string;
  majorPhases: PlanMajorPhase[];
  subPhases: PlanSubPhase[];
  riskEvents: PlanRiskEvent[];
  resources: PlanCombatResource[];
  actionCards: PlanActionCard[];
}
