import { request } from '@/services/http';

// 应急流程节点联动配置接口（fm-accident-rescue 应急指挥），对齐 docs/api/emergency.openapi.json。
// 取代前端 nodeConfigData.ts 的本地常量 + localStorage 持久化：读走 GET、写走 PUT（按 nodeId 整体 upsert）。

/** 3D 地图镜头中心锚点类型。 */
export type CameraAnchorType =
  | 'event_device'
  | 'alarm_phone_location'
  | 'alarm_phone_zone'
  | 'first_responder_gps'
  | 'factory_center'
  | 'custom';

/** 3D 地图镜头配置。 */
export interface MapCameraConfig {
  anchorPriorityList: CameraAnchorType[];
  /** 自定义镜头中心 [lon, lat]；未配置为 null */
  customCenter?: [number, number] | null;
  bufferRadiusMeters: number;
}

/** 节点值班配置。 */
export interface NodePhaseDuty {
  autoRoster: boolean;
}

/** 应急流程节点联动配置。 */
export interface NodePhaseConfig {
  nodeId: string;
  nodeName: string;
  mapCamera: MapCameraConfig;
  rightPanelHiddenTabs: string[];
  leftPanelHiddenPanels: string[];
  duty: NodePhaseDuty;
}

/** 流程节点联动配置列表（按 sort_no 升序）。 */
export async function fetchNodePhaseConfigs(): Promise<NodePhaseConfig[]> {
  return request<NodePhaseConfig[]>({ url: '/emergency/process/node-configs', method: 'GET' });
}

/** 保存流程节点联动配置（按 nodeId 整体 upsert），返回落库后的全量列表。 */
export async function saveNodePhaseConfigs(configs: NodePhaseConfig[]): Promise<NodePhaseConfig[]> {
  return request<NodePhaseConfig[]>({
    url: '/emergency/process/node-configs',
    method: 'PUT',
    data: configs,
  });
}

/* ------------------------------------------------------------------
 * 应急流程全景（阶段 / 响应模式 / 流程节点）与节点处置指引
 * ------------------------------------------------------------------ */

/** 应急响应模式。 */
export type EmergencyResponseMode = 'team' | 'plant' | 'company' | 'government';

/** 应急阶段。 */
export interface EmergencyPhase {
  id: string;
  name: string;
  start: number;
  end: number;
  tone: 'blue' | 'cyan' | 'amber' | 'red' | 'green';
}

/** 响应模式选项（登台/升级下拉用）。 */
export interface ResponseModeOption {
  value: EmergencyResponseMode;
  label: string;
  stageId: number;
}

/** 流程节点处置动作项。 */
export interface ProcessAction {
  id: string;
  label: string;
  done: boolean;
  type?: 'primary' | 'danger' | 'warning';
}

/** 节点完成判据项。 */
export interface CriteriaChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

/** 节点子阶段项。 */
export interface SubStageItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
}

/** 升级规则现场概况。 */
export interface StageEscalationDetails {
  location: string;
  substance: string;
  casualty: string;
  currentStatus: string;
}

/** 节点升级规则。 */
export interface StageEscalationRule {
  triggerCondition: string;
  fromRole: string;
  toRole: string;
  details: StageEscalationDetails;
}

/** 应急流程节点。 */
export interface ProcessStage {
  id: number;
  name: string;
  shortName: string;
  leadRole: string;
  leadTitle: string;
  commandLevel: string;
  description: string;
  previousContext: string[];
  currentActions: ProcessAction[];
  criteriaChecklist: CriteriaChecklistItem[];
  subStages?: SubStageItem[];
  escalationRule: StageEscalationRule;
}

/** 应急流程全景聚合。 */
export interface EmergencyProcessPanorama {
  phases: EmergencyPhase[];
  responseModes: ResponseModeOption[];
  stages: ProcessStage[];
}

/** 指引上报链路步骤。 */
export interface NodeGuidanceReportingStep {
  step: number;
  fromRole: string;
  toRole: string;
  method: string;
  notice: string;
}

/** 指引岗位任务。 */
export interface NodeGuidanceRoleTask {
  roleName: string;
  roleTitle: string;
  personName: string;
  avatarIcon: string;
  phone: string;
  tasks: string[];
}

/** 节点处置指引。 */
export interface NodeGuidance {
  nodeId: string;
  nodeName: string;
  reportingChain: NodeGuidanceReportingStep[];
  roleTasks: NodeGuidanceRoleTask[];
  generalNotice: string;
}

/** 应急指引实时值班表。 */
export interface GuidanceDutyRoster {
  shiftGroup: string;
  supervisor: string;
  supervisorPhone: string;
  boardOperator: string;
  boardOperatorPhone: string;
  fieldOperator: string;
  fieldOperatorPhone: string;
}

/** 节点处置指引聚合（值班表 + 各节点指引）。 */
export interface EmergencyProcessGuidance {
  dutyRoster: GuidanceDutyRoster;
  guidances: NodeGuidance[];
}

/** 应急流程全景：阶段 + 响应模式 + 15 个流程节点。 */
export async function fetchEmergencyProcessPanorama(): Promise<EmergencyProcessPanorama> {
  return request<EmergencyProcessPanorama>({
    url: '/emergency/process/panorama',
    method: 'GET',
  });
}

/** 节点处置指引：实时值班表 + 各节点上报链路与岗位任务。 */
export async function fetchEmergencyProcessGuidances(): Promise<EmergencyProcessGuidance> {
  return request<EmergencyProcessGuidance>({
    url: '/emergency/process/guidances',
    method: 'GET',
  });
}
