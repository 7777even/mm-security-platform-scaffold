import { request } from '@/services/http';

// 结案滚动列表（B3 Mock 契约 §3.6）：近期已结案的应急事件
export interface ClosedCase {
  caseId: string;
  title: string;
  location: string;
  closedAt: string; // ISO
  handler: string;
}

export interface ClosedCaseList {
  cases: ClosedCase[];
}

// 开发期自包含 mock
const DEV_FIXTURE: ClosedCaseList = {
  cases: [
    {
      caseId: 'C-2026-081',
      title: 'A 装置反应釜温度异常',
      location: '装置区 03 单元',
      closedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      handler: '王斌',
    },
    {
      caseId: 'C-2026-080',
      title: '罐区可燃气体探测器报警',
      location: '罐区 02 区',
      closedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      handler: '韩俊',
    },
    {
      caseId: 'C-2026-079',
      title: '装卸区静电隐患排查',
      location: '装卸区 01 泊位',
      closedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      handler: '张林',
    },
    {
      caseId: 'C-2026-078',
      title: '公用工程蒸汽泄漏',
      location: '公用工程 02 区',
      closedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      handler: '高峰',
    },
  ],
};

export async function fetchClosedCases(): Promise<ClosedCaseList> {
  if (!import.meta.env.VITE_API_BASE) return Promise.resolve(DEV_FIXTURE);
  try {
    const data = await request<ClosedCaseList>({ url: '/emergency/closed-cases', method: 'GET' });
    if (!data || !Array.isArray(data.cases)) return DEV_FIXTURE;
    return data;
  } catch {
    return DEV_FIXTURE;
  }
}