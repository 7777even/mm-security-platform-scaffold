import { request } from '@/services/http';

// 安防黑名单接口，对齐 docs/api/security-blacklist.openapi.json。
// 取代 blacklistMock 中的业务数据（车辆/人员黑名单）。

export interface BlacklistVehicleItem {
  id: number;
  plate: string;
  reason: string;
  time: string;
  status: string;
}

export interface BlacklistPersonItem {
  id: number;
  name: string;
  idCard: string;
  reason: string;
  time: string;
  status: string;
}

export interface BlacklistSummary {
  vehicles: BlacklistVehicleItem[];
  persons: BlacklistPersonItem[];
}

/** 安防黑名单聚合：车辆黑名单 + 人员黑名单。 */
export async function fetchBlacklist(): Promise<BlacklistSummary> {
  return request<BlacklistSummary>({ url: '/security/blacklist', method: 'GET' });
}
