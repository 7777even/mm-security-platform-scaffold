import { request } from '@/services/http';

// 后台管理端通用台账（静态页真后端化）。
// 原由 mgmtMenus.ts 硬编码渲染的静态台账页，统一改走 /api/v1/mgmt-ledger/{domain}。
// domain = 菜单叶子 path 去掉前导 /（如 alarm-config）。数据由后端 V51 迁移种子化进 mgmt_ledger_* 表。
// 仅 GET，零下行控制；支持 keyword 模糊搜索与 f_<列名>=值 按列筛选（值为“全部”时忽略）。

export type MgmtLedgerCellType = 'ok' | 'warn' | 'bad' | null;

export interface MgmtLedgerCell {
  text: string | null;
  type?: MgmtLedgerCellType;
}

export interface MgmtLedgerFilter {
  column: string;
  options: string[];
}

export interface MgmtLedgerMeta {
  domain: string;
  title: string;
  columns: string[];
  filters: MgmtLedgerFilter[];
}

export interface MgmtLedgerListResult {
  columns: string[];
  filters: MgmtLedgerFilter[];
  rows: MgmtLedgerCell[][];
  total: number;
  page: number;
  size: number;
}

/** “全部”类占位值：前后端约定忽略（按列不筛选）。 */
const ALL_VALUES = new Set(['全部', '全部中队', '全部单位', 'ALL']);

/** 获取台账元数据：列标题与筛选定义。 */
export function fetchMgmtLedgerMeta(domain: string): Promise<MgmtLedgerMeta> {
  return request<MgmtLedgerMeta>({ url: `/mgmt-ledger/${domain}/meta`, method: 'GET' });
}

export interface MgmtLedgerQuery {
  page?: number;
  size?: number;
  keyword?: string;
  filters?: Record<string, string>;
}

/** 获取台账分页数据：二维单元格 + 总数。 */
export function fetchMgmtLedgerList(
  domain: string,
  opts: MgmtLedgerQuery = {},
): Promise<MgmtLedgerListResult> {
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    size: opts.size ?? 20,
  };
  if (opts.keyword) params.keyword = opts.keyword;
  if (opts.filters) {
    for (const [column, value] of Object.entries(opts.filters)) {
      if (value && !ALL_VALUES.has(value)) {
        params[`f_${column}`] = value;
      }
    }
  }
  return request<MgmtLedgerListResult>({ url: `/mgmt-ledger/${domain}`, method: 'GET', params });
}
