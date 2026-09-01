/**
 * 流程节点联动配置模型（移植自 mm-safety-master emergency-command types/nodeConfig.ts）
 * 简化适配 UI-project：地图视角锚点、右侧面板显隐、左侧面板显隐、值班自动排班。
 */

export type CameraAnchorType =
  | 'event_device'
  | 'alarm_phone_location'
  | 'alarm_phone_zone'
  | 'first_responder_gps'
  | 'factory_center'
  | 'custom';

export interface MapCameraConfig {
  anchorPriorityList: CameraAnchorType[];
  customCenter?: [number, number];
  bufferRadiusMeters: number;
}

export interface NodePhaseConfig {
  nodeId: string;
  nodeName: string;
  mapCamera: MapCameraConfig;
  rightPanelHiddenTabs: string[];
  leftPanelHiddenPanels: string[];
  duty: {
    autoRoster: boolean;
  };
}

export const CAMERA_ANCHOR_METADATA: Record<CameraAnchorType, { label: string; desc: string }> = {
  event_device: {
    label: '事故关联装置',
    desc: '定位至事故直接关联的设备/塔器（无关联装置则顺延降级）',
  },
  alarm_phone_location: {
    label: '报警电话实测位置/GPS',
    desc: '读取拨打报警电话时的基站/GPS 实测精确坐标',
  },
  alarm_phone_zone: {
    label: '报警电话所属装置区/防区',
    desc: '定位至报警号码归属防区包围盒，并外扩指定缓冲区半径',
  },
  first_responder_gps: {
    label: '抢险队/巡检员 GPS',
    desc: '动态跟随现场首批到场的救援队伍或巡检员位置',
  },
  factory_center: {
    label: '茂名石化全厂总览中心',
    desc: '全厂宏观包围盒视角（兜底降级）',
  },
  custom: {
    label: '自定义硬编码坐标',
    desc: '手动输入的绝对经纬度坐标',
  },
};

export const DEFAULT_FACTORY_CENTER: [number, number] = [110.9265, 21.662];

export function resolveMapCameraCenter(
  config: MapCameraConfig,
  activeEvent?: {
    deviceCenter?: [number, number];
    alarmPhoneLocation?: [number, number];
    alarmPhoneZoneCenter?: [number, number];
    firstResponderGps?: [number, number];
  },
): { center: [number, number]; bufferRadiusMeters: number } {
  for (const anchor of config.anchorPriorityList) {
    if (anchor === 'event_device' && activeEvent?.deviceCenter) {
      return { center: activeEvent.deviceCenter, bufferRadiusMeters: config.bufferRadiusMeters };
    }
    if (anchor === 'alarm_phone_location' && activeEvent?.alarmPhoneLocation) {
      return {
        center: activeEvent.alarmPhoneLocation,
        bufferRadiusMeters: config.bufferRadiusMeters,
      };
    }
    if (anchor === 'alarm_phone_zone' && activeEvent?.alarmPhoneZoneCenter) {
      return {
        center: activeEvent.alarmPhoneZoneCenter,
        bufferRadiusMeters: config.bufferRadiusMeters,
      };
    }
    if (anchor === 'first_responder_gps' && activeEvent?.firstResponderGps) {
      return {
        center: activeEvent.firstResponderGps,
        bufferRadiusMeters: config.bufferRadiusMeters,
      };
    }
    if (anchor === 'custom' && config.customCenter) {
      return { center: config.customCenter, bufferRadiusMeters: config.bufferRadiusMeters };
    }
    if (anchor === 'factory_center') {
      return { center: DEFAULT_FACTORY_CENTER, bufferRadiusMeters: config.bufferRadiusMeters };
    }
  }
  return { center: DEFAULT_FACTORY_CENTER, bufferRadiusMeters: config.bufferRadiusMeters };
}

const baseCamera: MapCameraConfig = {
  anchorPriorityList: ['event_device', 'alarm_phone_zone', 'first_responder_gps', 'factory_center'],
  bufferRadiusMeters: 260,
};

export const DEFAULT_NODE_PHASE_CONFIGS: Record<string, NodePhaseConfig> = {
  alarmJudgement: {
    nodeId: 'alarmJudgement',
    nodeName: '1. 接警研判',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: [
        'alarm_phone_location',
        'event_device',
        'alarm_phone_zone',
        'factory_center',
      ],
    },
    rightPanelHiddenTabs: [],
    leftPanelHiddenPanels: [],
    duty: { autoRoster: true },
  },
  '1min': {
    nodeId: '1min',
    nodeName: '2. 一分钟能量隔离',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['event_device', 'alarm_phone_zone', 'factory_center'],
      bufferRadiusMeters: 220,
    },
    rightPanelHiddenTabs: [],
    leftPanelHiddenPanels: [],
    duty: { autoRoster: true },
  },
  '3min': {
    nodeId: '3min',
    nodeName: '3. 三分钟退守稳态',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['event_device', 'factory_center'],
      bufferRadiusMeters: 320,
    },
    rightPanelHiddenTabs: ['dynamics'],
    leftPanelHiddenPanels: ['info'],
    duty: { autoRoster: true },
  },
  '5min': {
    nodeId: '5min',
    nodeName: '4. 五分钟消气防控险',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['event_device', 'first_responder_gps', 'factory_center'],
      bufferRadiusMeters: 380,
    },
    rightPanelHiddenTabs: ['auxiliary'],
    leftPanelHiddenPanels: ['info'],
    duty: { autoRoster: true },
  },
  plantArea: {
    nodeId: 'plantArea',
    nodeName: '5. 装置区应急',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['event_device', 'alarm_phone_zone', 'factory_center'],
      bufferRadiusMeters: 460,
    },
    rightPanelHiddenTabs: [],
    leftPanelHiddenPanels: ['info'],
    duty: { autoRoster: false },
  },
  companyLevel: {
    nodeId: 'companyLevel',
    nodeName: '6. 全厂应急',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['factory_center', 'event_device'],
      bufferRadiusMeters: 900,
    },
    rightPanelHiddenTabs: ['auxiliary'],
    leftPanelHiddenPanels: ['info'],
    duty: { autoRoster: false },
  },
  govLevel: {
    nodeId: 'govLevel',
    nodeName: '7. 政府应急',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['factory_center'],
      bufferRadiusMeters: 1400,
    },
    rightPanelHiddenTabs: ['auxiliary', 'dynamics'],
    leftPanelHiddenPanels: ['info', 'plan'],
    duty: { autoRoster: false },
  },
  handling: {
    nodeId: 'handling',
    nodeName: '8. 完成处置',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['event_device', 'factory_center'],
      bufferRadiusMeters: 300,
    },
    rightPanelHiddenTabs: [],
    leftPanelHiddenPanels: ['info'],
    duty: { autoRoster: true },
  },
  archive: {
    nodeId: 'archive',
    nodeName: '9. 总结与恢复',
    mapCamera: {
      ...baseCamera,
      anchorPriorityList: ['factory_center'],
      bufferRadiusMeters: 1200,
    },
    rightPanelHiddenTabs: ['auxiliary', 'dynamics'],
    leftPanelHiddenPanels: ['info', 'plan'],
    duty: { autoRoster: true },
  },
};

export const ALL_NODE_IDS = Object.keys(DEFAULT_NODE_PHASE_CONFIGS);

export function loadNodeConfigs(): Record<string, NodePhaseConfig> {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_NODE_PHASE_CONFIGS)) as Record<
    string,
    NodePhaseConfig
  >;
  try {
    const raw = localStorage.getItem('mmsafety_ui_node_phase_configs');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, NodePhaseConfig>;
    for (const key of Object.keys(defaults)) {
      if (parsed[key]) {
        defaults[key] = {
          ...defaults[key],
          ...parsed[key],
          mapCamera: { ...defaults[key].mapCamera, ...(parsed[key].mapCamera ?? {}) },
          duty: { ...defaults[key].duty, ...(parsed[key].duty ?? {}) },
        };
      }
    }
  } catch {
    // fallback to defaults
  }
  return defaults;
}

export function saveNodeConfigs(configs: Record<string, NodePhaseConfig>) {
  try {
    localStorage.setItem('mmsafety_ui_node_phase_configs', JSON.stringify(configs));
  } catch {
    // ignore
  }
}
