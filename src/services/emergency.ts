import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 应急力量数据（B3 Mock 契约 §3.6）：按维度统计资源数量
export type EmergencyResourceKind =
  | '应急专家'
  | '应急物资'
  | '救援队伍'
  | '装备车辆'
  | '应急场所'
  | '医疗机构'
  | '应急车辆'
  | '消防设施';

export interface EmergencyResource {
  kind: EmergencyResourceKind;
  count: number;
  icon: string;
}

export interface EmergencyStrength {
  resources: EmergencyResource[];
}

// 开发期自包含 mock：8 个核心应急力量维度（2 列 × 4 行网格）
const DEV_FIXTURE: EmergencyStrength = {
  resources: [
    { kind: '应急专家', count: 47, icon: 'UserFilled' },
    { kind: '应急物资', count: 3510, icon: 'Box' },
    { kind: '救援队伍', count: 10, icon: 'Avatar' },
    { kind: '装备车辆', count: 55, icon: 'Tools' },
    { kind: '应急场所', count: 52, icon: 'OfficeBuilding' },
    { kind: '医疗机构', count: 80, icon: 'FirstAidKit' },
    { kind: '应急车辆', count: 33, icon: 'Van' },
    { kind: '消防设施', count: 11, icon: 'Warning' },
  ],
};

/** 后端不可用时的空态：不再回落 DEV_FIXTURE，避免假数据冒充后端（见 backendFallback.ts）。 */
const EMPTY: EmergencyStrength = { resources: [] };

export async function fetchEmergencyStrength(): Promise<EmergencyStrength> {
  // 纯静态 / 演示模式（未配置后端地址）仍用 fixture，此时不存在误判后端就绪的风险
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<EmergencyStrength>({ url: '/emergency/strength', method: 'GET' });
    if (!data || !Array.isArray(data.resources)) {
      backendUnavailableWarn('emergency', '/emergency/strength', REASON_CONTRACT_MISMATCH);
      return EMPTY;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency', '/emergency/strength');
    return EMPTY;
  }
}

// 应急指挥指令（B4 去 mock：原 accidentRescueMock 的 fixedCommandGroups/tempCommandGroups/
// commandDetailDefaults/commandLogs 已迁至后端 fac_emergency_cmd，由下面两个服务函数拉取）。
export type EmergencyCommandInstructionStatus = '待处置' | '已处置' | '待派发';
export type CommandNotifyChannel = 'app' | 'sms' | 'voice';

export interface EmergencyCommandInstruction {
  id: string;
  type: string;
  name: string;
  location: string;
  status: EmergencyCommandInstructionStatus;
  actionLabel?: string;
  done?: boolean;
}

export interface EmergencyCommandGroup {
  id: string;
  label: string;
  items: EmergencyCommandInstruction[];
}

export interface CommandActionRecipient {
  id: string;
  role: string;
  name: string;
  phone: string;
}

export interface CommandActionMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  src?: string;
  duration?: string;
}

export interface CommandActionDynamicEntry {
  id: string;
  time: string;
  type: string;
  operator: string;
  result: string;
  content: string;
  attachment?: string;
  media?: CommandActionMedia[];
}

export interface CommandActionDetail {
  id: string;
  name: string;
  type: string;
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

const EMPTY_GROUPS: EmergencyCommandGroup[] = [];

/**
 * 应急指挥指令分组列表（固定 / 临时）。后端就绪时走真实服务；
 * 纯静态演示（无 VITE_API_BASE）回落空态——不回灌 mock 假数据（零下行控制红线）。
 */
export async function fetchEmergencyCommandGroups(
  tab?: 'fixed' | 'temp',
): Promise<EmergencyCommandGroup[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(EMPTY_GROUPS);
  try {
    const data = await request<EmergencyCommandGroup[]>({
      url: '/emergency/commands',
      method: 'GET',
      params: tab ? { tab } : undefined,
    });
    if (!data || !Array.isArray(data)) {
      backendUnavailableWarn('emergency', '/emergency/commands', REASON_CONTRACT_MISMATCH);
      return EMPTY_GROUPS;
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency', '/emergency/commands');
    return EMPTY_GROUPS;
  }
}

/**
 * 单条指令行动详情（派发对象 / 执行日志等）。未知 id 后端返回 200 空包络，此处归一为 null。
 */
export async function fetchEmergencyCommandDetail(
  commandId: string,
): Promise<CommandActionDetail | null> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(null);
  try {
    const data = await request<CommandActionDetail>({
      url: `/emergency/commands/${commandId}`,
      method: 'GET',
    });
    return data ?? null;
  } catch {
    backendUnavailableWarn('emergency', `/emergency/commands/${commandId}`);
    return null;
  }
}

// 应急派单人员名册（A3 去 mock：替代前端 AlarmDetailPanel 硬编码的 5 个人名）。
export interface DispatchPersonnelOption {
  id: number;
  name: string;
  role: string;
  department: string;
  phone: string;
}

/**
 * 告警详情「派单人员」下拉选项源。后端就绪时走 /emergency/dispatch-personnel；
 * 纯静态演示（无 VITE_API_BASE）回落空数组——不回灌假人名（零下行控制红线）。
 */
export async function fetchDispatchPersonnel(): Promise<DispatchPersonnelOption[]> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve([]);
  try {
    const data = await request<DispatchPersonnelOption[]>({
      url: '/emergency/dispatch-personnel',
      method: 'GET',
    });
    if (!data || !Array.isArray(data)) {
      backendUnavailableWarn(
        'emergency',
        '/emergency/dispatch-personnel',
        REASON_CONTRACT_MISMATCH,
      );
      return [];
    }
    return data;
  } catch {
    backendUnavailableWarn('emergency', '/emergency/dispatch-personnel');
    return [];
  }
}
