import type { DeviceItem, DeviceStatus, DeviceType } from '@/services/device';

// 设备台账适配器：把后端契约 DeviceItem（device.openapi.json → /devices）单向映射为
// 大屏设备台账表格用的本地展示形状。屏幕组件消费本地类型，不在卡片组件里改字段。
// 注意：设备台账不做厂区(plantArea)过滤——设备 zone（罐区A/装置区…）粒度细于厂区，
// 且没有 areaCode 字段，走 usePlantArea 会被 id 哈希误导，故全局展示。

export type DeviceLedgerStatusTone = 'ok' | 'offline' | 'fault';

export interface DeviceLedgerItem {
  /** 由 20 位 MDM 编码派生态稳定的数字 id，仅用于列表 key */
  id: number;
  deviceCode: string;
  name: string;
  /** 中文类型标签：消防 / 可燃气体 / 周界报警 / 视频监控 */
  type: string;
  zone: string;
  /** 中文状态标签：在线 / 离线 / 告警 */
  status: string;
  statusTone: DeviceLedgerStatusTone;
}

const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  FIRE: '消防',
  GAS: '可燃气体',
  FLOOD: '周界报警',
  CCTV: '视频监控',
};

export function deviceTypeLabel(type: DeviceType): string {
  return DEVICE_TYPE_LABEL[type] ?? type;
}

export function deviceStatusLabel(status: DeviceStatus): string {
  switch (status) {
    case 1:
      return '在线';
    case 2:
      return '告警';
    default:
      return '离线';
  }
}

export function deviceStatusTone(status: DeviceStatus): DeviceLedgerStatusTone {
  switch (status) {
    case 1:
      return 'ok';
    case 2:
      return 'fault';
    default:
      return 'offline';
  }
}

function stableId(deviceCode: string, index: number): number {
  const digits = deviceCode.replace(/\D/g, '');
  const n = Number(digits.slice(-9) || '0');
  return Number.isFinite(n) ? n : index + 1;
}

export function toDeviceLedgerItem(device: DeviceItem, index: number): DeviceLedgerItem {
  return {
    id: stableId(device.deviceCode, index),
    deviceCode: device.deviceCode,
    name: device.deviceName,
    type: deviceTypeLabel(device.deviceType),
    zone: device.zone,
    status: deviceStatusLabel(device.status),
    statusTone: deviceStatusTone(device.status),
  };
}
