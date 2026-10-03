import { request } from '@/services/http';
import type { components } from '@/types/generated/communication';

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

/** 通讯设备写请求体（新增/编辑共用）：由契约 CommDeviceWriteRequest 生成，必填 deviceCode/deviceType/deviceName。 */
export type CommDeviceWriteRequest = components['schemas']['CommDeviceWriteRequest'];

/** 删除结果（对齐契约 DeleteResult）。 */
export interface CommunicationDeleteResult {
  ok: boolean;
}

/** 新建通讯设备台账（权限码 communication:device-write），返回落库后的设备。 */
export async function createCommunicationDevice(
  payload: CommDeviceWriteRequest,
): Promise<CommunicationDevice> {
  return request<CommunicationDevice>({
    url: '/communication/devices',
    method: 'POST',
    data: payload,
  });
}

/** 更新通讯设备台账；路径 {id} 实为设备编码 deviceCode；未命中时返回 null。 */
export async function updateCommunicationDevice(
  id: string,
  payload: CommDeviceWriteRequest,
): Promise<CommunicationDevice | null> {
  return request<CommunicationDevice | null>({
    url: '/communication/devices/' + encodeURIComponent(id),
    method: 'PUT',
    data: payload,
  });
}

/** 删除通讯设备台账；路径 {id} 实为设备编码 deviceCode；未命中时后端返回 ok=false（不抛异常）。 */
export async function deleteCommunicationDevice(id: string): Promise<void> {
  await request<CommunicationDeleteResult>({
    url: '/communication/devices/' + encodeURIComponent(id),
    method: 'DELETE',
  });
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

/** 通讯通知记录写请求体（新增/编辑共用）：由契约 CommRecordWriteRequest 生成，必填 recordNo/recordType。 */
export type CommRecordWriteRequest = components['schemas']['CommRecordWriteRequest'];

/** 新建通讯通知记录（权限码 communication:record-write），返回落库后的记录。 */
export async function createCommunicationRecord(
  payload: CommRecordWriteRequest,
): Promise<CommunicationRecord> {
  return request<CommunicationRecord>({
    url: '/communication/records',
    method: 'POST',
    data: payload,
  });
}

/** 更新通讯通知记录；路径 {recordNo} 为业务自然键，后端不以请求体覆盖该定位键；未命中时返回 null。 */
export async function updateCommunicationRecord(
  recordNo: string,
  payload: CommRecordWriteRequest,
): Promise<CommunicationRecord | null> {
  return request<CommunicationRecord | null>({
    url: '/communication/records/' + encodeURIComponent(recordNo),
    method: 'PUT',
    data: payload,
  });
}

/** 删除通讯通知记录；未命中时后端返回 ok=false（不抛异常）。 */
export async function deleteCommunicationRecord(recordNo: string): Promise<void> {
  await request<CommunicationDeleteResult>({
    url: '/communication/records/' + encodeURIComponent(recordNo),
    method: 'DELETE',
  });
}
