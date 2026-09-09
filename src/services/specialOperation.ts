import { request } from '@/services/http';
import { ApiError } from '@/services/http';

// 特殊作业大屏接口（壳内特殊作业面板 + 消防特殊作业弹窗复用），
// 对齐 docs/api/special-operation.openapi.json。取代 specialOperationMock。
// 与 /fire/special-operations 统计端点（fireMonitoring 域）职责不同：本域为作业票明细。

export interface SpecialOperationVideoItem {
  id: number;
  name: string;
  location: string;
}

export interface SpecialOperationGasPoint {
  id: number;
  name: string;
  value: string;
  status: string;
}

export interface SpecialOperationPersonItem {
  id: number;
  name: string;
  role: string;
  phone: string;
}

export interface SpecialOperationItem {
  id: number;
  area: string;
  type: string;
  level: string;
  status: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  unit: string;
  applyUnit: string;
  operationDate: string;
  location: string;
  isContractor: string;
  hazardType: string;
  leaderName: string;
  leaderPhone: string;
  position: string;
  longitude: number;
  latitude: number;
  changeReason: string;
  cancelReason: string;
  guardianName: string;
  workers: string;
  permitNo: string;
  content: string;
  videoCount: number;
  gasMonitorCount: number;
  personnelCount: number;
}

export interface SpecialOperationRecord extends SpecialOperationItem {
  videos: SpecialOperationVideoItem[];
  gasPoints: SpecialOperationGasPoint[];
  personnel: SpecialOperationPersonItem[];
}

export interface SpecialOperationPage {
  total: number;
  page: number;
  size: number;
  pages: number;
  list: SpecialOperationItem[];
}

export interface SpecialOperationQuery {
  page?: number;
  size?: number;
  /** 下拉文案原样下传，「全部xx」由后端按不过滤处理 */
  type?: string;
  area?: string;
  level?: string;
  status?: string;
}

/** 作业票分页（支持类型/区域/等级/状态筛选）。 */
export async function fetchSpecialOperations(
  query: SpecialOperationQuery = {},
): Promise<SpecialOperationPage> {
  return request<SpecialOperationPage>({
    url: '/special-operations',
    method: 'GET',
    params: {
      page: query.page ?? 1,
      size: query.size ?? 10,
      type: query.type,
      area: query.area,
      level: query.level,
      status: query.status,
    },
  });
}

/** 作业票详情（含现场视频/气体检测点/作业人员）；未命中（404 业务码）返回 null。 */
export async function fetchSpecialOperationDetail(
  id: number | null | undefined,
): Promise<SpecialOperationRecord | null> {
  if (!id) return null;
  try {
    return await request<SpecialOperationRecord>({
      url: `/special-operations/${id}`,
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === 404) return null;
    throw error;
  }
}
