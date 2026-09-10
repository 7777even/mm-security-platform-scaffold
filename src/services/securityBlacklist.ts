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

/** 删除结果（对齐契约 DeleteResult）。 */
export interface BlacklistDeleteResult {
  ok: boolean;
}

/** 从车辆黑名单移除记录，返回是否删除成功。 */
export async function removeBlacklistVehicle(id: number): Promise<boolean> {
  const result = await request<BlacklistDeleteResult>({
    url: `/security/blacklist/vehicles/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  });
  return Boolean(result?.ok);
}

/** 从人员黑名单移除记录，返回是否删除成功。 */
export async function removeBlacklistPerson(id: number): Promise<boolean> {
  const result = await request<BlacklistDeleteResult>({
    url: `/security/blacklist/persons/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  });
  return Boolean(result?.ok);
}
