import { request } from '@/services/http';

// 通讯设备接口（广播/电话/对讲），对齐 docs/api/communication.openapi.json。
// 取代 communicationDeviceMock 中的硬编码业务数据。

export interface CommunicationDeviceDetail {
  category: string;
  installTime: string;
  owner: string;
  ip: string;
  lastCheck: string;
}

export interface CommunicationDevice {
  id: string;
  type: string;
  name: string;
  area: string;
  location: string;
  status: string;
  longitude: number;
  latitude: number;
  detail: CommunicationDeviceDetail;
}

export interface CommunicationGroup {
  key: string;
  label: string;
  devices: CommunicationDevice[];
}

export interface CommunicationDeviceGroups {
  broadcast: CommunicationGroup[];
  phone: CommunicationGroup[];
  intercom: CommunicationGroup[];
}

/** 通讯设备 Tab 键（广播 / 电话 / 对讲），与分组聚合结构一致。 */
export type CommunicationTab = keyof CommunicationDeviceGroups;

/** 通讯设备分组聚合：广播 / 电话 / 对讲。 */
export async function fetchCommunicationDevices(): Promise<CommunicationDeviceGroups> {
  return request<CommunicationDeviceGroups>({ url: '/communication/devices', method: 'GET' });
}

/** 单个通讯设备详情。 */
export async function fetchCommunicationDevice(id: string): Promise<CommunicationDevice> {
  return request<CommunicationDevice>({ url: '/communication/devices/' + id, method: 'GET' });
}
