import { request } from '@/services/http';
import type { components } from '@/types/generated/form-records';

export type FormRecordItem = components['schemas']['FormRecordItem'];
export type FormRecordPageResult = components['schemas']['FormRecordPageResult'];
export type FormRecordCreateRequest = components['schemas']['FormRecordCreateRequest'];
export type FormRecordUpdateRequest = components['schemas']['FormRecordUpdateRequest'];

// 流程填报记录服务（mgmt /form 流程填报向导）。对齐 docs/api/form-records.openapi.json。
// 权限语义：新增（一线人员即可提交，POST 无 ADMIN 限制）/ 更新（审核，需 ADMIN）。

/** 填报类型（与后端枚举一致）。 */
export type FormType = '隐患排查' | '设备巡检' | '值班交接' | '其他';

export const FORM_TYPES: FormType[] = ['隐患排查', '设备巡检', '值班交接', '其他'];

export interface FormRecordQuery {
  page?: number;
  size?: number;
}

/** 流程填报记录列表（分页）。 */
export async function fetchFormRecords(query: FormRecordQuery = {}): Promise<FormRecordPageResult> {
  return request<FormRecordPageResult>({
    url: '/form-records',
    method: 'GET',
    params: { page: query.page ?? 1, size: query.size ?? 10 },
  });
}

/** 单条流程填报记录详情。 */
export async function fetchFormRecord(id: number): Promise<FormRecordItem> {
  return request<FormRecordItem>({ url: `/form-records/${id}`, method: 'GET' });
}

/** 新增流程填报（一线人员即可提交）。 */
export async function createFormRecord(payload: FormRecordCreateRequest): Promise<FormRecordItem> {
  return request<FormRecordItem>({ url: '/form-records', method: 'POST', data: payload });
}

/** 更新流程填报（审核 / 状态流转，需 ADMIN）。 */
export async function updateFormRecord(
  id: number,
  payload: FormRecordUpdateRequest,
): Promise<FormRecordItem> {
  return request<FormRecordItem>({ url: `/form-records/${id}`, method: 'PUT', data: payload });
}
