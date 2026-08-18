// 共享类型定义（S1 §3.2 types 目录）；网关统一响应包裹结构以实际协议为准，此处为基线
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
