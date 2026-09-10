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
