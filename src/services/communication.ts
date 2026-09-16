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

// —— 通讯通知记录（短信 / 电话通话 / 广播播报 / APP推送 / 语音对讲）——
// 五类记录字段语义同构，后端以 record_type 区分后返回统一结构，前端按类型取用所需列。

/** 通讯通知记录类型：与后端 record_type 取值一致。 */
export type CommunicationRecordType = 'sms' | 'call' | 'broadcast' | 'push' | 'intercom';

export interface CommunicationRecord {
  recordNo: string;
  recordType: string;
  occurredAt: string;
  category: string;
  sender: string;
  receiver: string;
  summary: string;
  result: string;
  duration: string;
  channel: string;
  direction: string;
  contentType: string;
}

export interface CommunicationRecordList {
  items: CommunicationRecord[];
  total: number;
}

/** 通讯通知记录列表；type 缺省返回全部五类。 */
export async function fetchCommunicationRecords(
  type?: CommunicationRecordType,
): Promise<CommunicationRecordList> {
  return request<CommunicationRecordList>({
    url: '/communication/records',
    method: 'GET',
    params: type === undefined ? {} : { type },
  });
}
