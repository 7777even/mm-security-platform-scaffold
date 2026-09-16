import { request } from '@/services/http';

// 处置任务域（移动端任务中心），对齐 docs/api/tasks.openapi.json。
// 取代 apps/mobile/data/mock.ts 的 tasks 静态数据。纯只读。

export interface TaskItem {
  id: number;
  /** 任务编号（对外展示） */
  taskCode: string;
  title: string;
  /** 级别（紧急/重要/一般） */
  level: string;
  /** 任务来源 */
  source: string;
  /** 任务区域 / 位置 */
  area: string;
  deadline: string;
  status: string;
  /** 任务内容描述 */
  description: string;
}

export interface TaskListResult {
  items: TaskItem[];
  total: number;
}

/** 处置任务列表：GET /tasks */
export async function fetchTasks(): Promise<TaskListResult> {
  return request<TaskListResult>({ url: '/tasks', method: 'GET' });
}

/** 处置任务详情：GET /tasks/{id}（未命中后端返回业务码 4040）。 */
export async function fetchTaskDetail(id: number | string): Promise<TaskItem> {
  return request<TaskItem>({
    url: `/tasks/${encodeURIComponent(String(id))}`,
    method: 'GET',
  });
}
