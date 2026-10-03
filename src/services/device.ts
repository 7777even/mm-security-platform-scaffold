import { request } from '@/services/http';
import type { PageResult } from '@/types';
import type { components } from '@/types/generated/device';

// 设备台账服务（对齐 device.openapi.json：/devices 分页、/devices/{code} 单台）。
// 后端返回强类型 PageResult（list/total/page/size），无 mock 回落，直连真后端（VITE_API_BASE=8787）。

/** 设备运行状态：0=离线 1=在线 2=告警（与后端 FacDevice.status 同义） */
export type DeviceStatus = 0 | 1 | 2;
/** 设备类型：FIRE/GAS/FLOOD/CCTV（与后端 device_type 同义） */
export type DeviceType = 'FIRE' | 'GAS' | 'FLOOD' | 'CCTV';

export interface DeviceItem {
  /** 20 位 MDM 设备编码（物理主键，禁止自创） */
  deviceCode: string;
  deviceName: string;
  deviceType: DeviceType;
  /** 所属区域（罐区A / 装置区 / 装卸区 / 公用工程 / 行政办公） */
  zone: string;
  status: DeviceStatus;
  lat?: number;
  lon?: number;
}

export interface DevicePageQuery {
  page?: number;
  size?: number;
  status?: DeviceStatus;
  /** 区域模糊匹配，如 罐区A */
  zone?: string;
  /** 20 位 MDM 编码精确查询 */
  deviceCode?: string;
}

export async function fetchDevicePage(
  query: DevicePageQuery = {},
): Promise<PageResult<DeviceItem>> {
  const { page = 1, size = 20, status, zone, deviceCode } = query;
  return request<PageResult<DeviceItem>>({
    url: '/devices',
    method: 'GET',
    params: {
      page,
      size,
      ...(status !== undefined ? { status } : {}),
      ...(zone ? { zone } : {}),
      ...(deviceCode ? { deviceCode } : {}),
    },
  });
}

export async function fetchDeviceByCode(code: string): Promise<DeviceItem> {
  return request<DeviceItem>({ url: `/devices/${encodeURIComponent(code)}`, method: 'GET' });
}

/** 设备台账写请求体（新增/编辑共用）：由契约 DeviceWriteRequest 生成，必填 deviceCode。 */
export type DeviceWriteRequest = components['schemas']['DeviceWriteRequest'];

/** 新建设备台账（权限码 device:write），返回落库后的设备。 */
export async function createDevice(payload: DeviceWriteRequest): Promise<DeviceItem> {
  return request<DeviceItem>({ url: '/devices', method: 'POST', data: payload });
}

/** 更新设备台账；路径 {code} 为 20 位 MDM 编码，后端不以请求体覆盖该定位键；未命中时返回 null。 */
export async function updateDevice(
  code: string,
  payload: DeviceWriteRequest,
): Promise<DeviceItem | null> {
  return request<DeviceItem | null>({
    url: `/devices/${encodeURIComponent(code)}`,
    method: 'PUT',
    data: payload,
  });
}

/** 删除设备台账（软删除）；未命中时后端返回 ok=false（不抛异常）。 */
export async function deleteDevice(code: string): Promise<void> {
  await request<{ ok?: boolean }>({
    url: `/devices/${encodeURIComponent(code)}`,
    method: 'DELETE',
  });
}
