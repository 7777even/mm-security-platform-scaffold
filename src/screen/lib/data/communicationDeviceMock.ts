export type CommunicationTab = 'broadcast' | 'phone' | 'intercom';

// 以下类型仍被面板组件引用（CommunicationDeviceListPanel / ProductionCommunicationView /
// SinglePointBroadcastDialog）。设备分组数据已迁至后端 service（@/services/communication）。
export type { CommunicationDevice } from '@/services/communication';
