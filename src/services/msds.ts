import { request } from '@/services/http';

// 化学品 MSDS 域（移动端化学品知识 / MSDS 详情），对齐 docs/api/msds.openapi.json。
// 取代 apps/mobile/data/mock.ts 的 msds 静态数据。纯只读；详情按 CAS 号查询。

export interface MsdsItem {
  id: number;
  name: string;
  /** CAS 号 */
  cas: string;
  /** 危险性分类 */
  classification: string;
}

export interface MsdsDetail {
  id: number;
  name: string;
  cas: string;
  classification: string;
  /** 物理状态 */
  state: string;
  /** 沸点 */
  boilingPoint: string;
  /** 闪点 */
  flashPoint: string;
  /** 爆炸极限 */
  explosionLimit: string;
  /** 储存要求 */
  storage: string;
  /** 安全措施 */
  safety: string;
  /** 应急处置 */
  emergency: string;
}

export interface MsdsListResult {
  items: MsdsItem[];
  total: number;
}

/** 化学品 MSDS 列表：GET /msds */
export async function fetchMsdsList(): Promise<MsdsListResult> {
  return request<MsdsListResult>({ url: '/msds', method: 'GET' });
}

/** 化学品 MSDS 详情：GET /msds/{cas}（未命中后端返回业务码 404）。 */
export async function fetchMsdsDetail(cas: string): Promise<MsdsDetail> {
  return request<MsdsDetail>({ url: `/msds/${encodeURIComponent(cas)}`, method: 'GET' });
}
