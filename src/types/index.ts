// 共享类型定义（S1 §3.2 types 目录）；对齐 B3 Mock 契约包络与分页语义
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  traceId?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}
