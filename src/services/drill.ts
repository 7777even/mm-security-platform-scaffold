import { request } from '@/services/http';

// 应急演练域（移动端演练信息 / 演练详情），对齐 docs/api/drills.openapi.json。
// 取代 apps/mobile/data/mock.ts 的 drills 静态数据。纯只读。

export interface DrillItem {
  id: number;
  /** 演练编号 */
  drillCode: string;
  name: string;
  /** 演练类型（实战演练/桌面推演） */
  drillType: string;
  /** 演练形式 */
  form: string;
  /** 演练时间 */
  timeRange: string;
  /** 演练地点 */
  place: string;
  /** 演练状态（计划中/进行中/已结束） */
  status: string;
  /** 参与部门（顿号分隔） */
  departments: string;
  /** 演练任务数 */
  taskCount: number;
}

export interface DrillTaskItem {
  name: string;
  status: string;
}

export interface DrillDetail {
  id: number;
  drillCode: string;
  name: string;
  drillType: string;
  form: string;
  timeRange: string;
  place: string;
  status: string;
  departments: string;
  tasks: DrillTaskItem[];
}

export interface DrillListResult {
  items: DrillItem[];
  total: number;
}

/** 演练列表：GET /drills */
export async function fetchDrills(): Promise<DrillListResult> {
  return request<DrillListResult>({ url: '/drills', method: 'GET' });
}

/** 演练详情：GET /drills/{id}（未命中后端返回业务码 404）。 */
export async function fetchDrillDetail(id: number | string): Promise<DrillDetail> {
  return request<DrillDetail>({
    url: `/drills/${encodeURIComponent(String(id))}`,
    method: 'GET',
  });
}
