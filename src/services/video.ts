import http, { request } from '@/services/http';

// 视频控制/视频墙大屏接口（fm-video-control / fm-video-wall），对齐 docs/api/video.openapi.json。
// 取代前端硬编码的 videoControlMock / videoLinkageMock 业务数据；
// 网格布局（1x1/2x2/3x3）与画面轮巡为前端交互状态，不在 service 层。

export type VideoCellStatus = 'live' | 'loading' | 'ai';

export type GridLayout = '1x1' | '2x2' | '3x3';

export interface VideoCategoryItem {
  id: string;
  label: string;
  iconType: number;
}

export interface VideoGroupNode {
  id: string;
  label: string;
  children?: VideoGroupNode[];
}

export interface VideoNavigation {
  categories: VideoCategoryItem[];
  tree: VideoGroupNode[];
}

export interface VideoCameraItem {
  id: number;
  name: string;
  cameraType: string;
  location: string;
  status: VideoCellStatus;
  hd: boolean;
  thumbIndex: number;
}

export interface VideoCameraPage {
  total: number;
  page: number;
  size: number;
  pages: number;
  list: VideoCameraItem[];
}

export interface VideoLinkageItem {
  id: string;
  name: string;
  code: string;
  category: string;
  linkageCount: number;
  businessObjects: string;
}

export interface VideoLinkageRuleRow {
  id: string;
  presetPoint: string;
  objectCategory: string;
  objectName: string;
}

/** 联动规则行入参（对齐契约 VideoLinkageRuleInput）。 */
export interface VideoLinkageRuleInput {
  presetPoint: string;
  objectCategory: string;
  objectName: string;
}

/** 联动配置保存入参（新建/更新共用；linkageCount 与 businessObjects 由后端推导）。 */
export interface VideoLinkageSaveRequest {
  name: string;
  code: string;
  category: string;
  rules: VideoLinkageRuleInput[];
}

/** 删除结果（对齐契约 DeleteResult）。 */
export interface VideoLinkageDeleteResult {
  ok: boolean;
}

/** 左侧导航：顶部分类（扁平）+ 分组树。 */
export async function fetchVideoNavigation(): Promise<VideoNavigation> {
  return request<VideoNavigation>({ url: '/video/navigation', method: 'GET' });
}

/** 摄像头分页网格（前端默认每页 9 宫格）。 */
export async function fetchVideoCameras(page = 1, size = 9): Promise<VideoCameraPage> {
  return request<VideoCameraPage>({
    url: '/video/cameras',
    method: 'GET',
    params: { page, size },
  });
}

/** 视频联动配置列表。 */
export async function fetchVideoLinkages(): Promise<VideoLinkageItem[]> {
  return request<VideoLinkageItem[]>({ url: '/video/linkages', method: 'GET' });
}

/** 指定联动配置的规则行；后端对未预置规则回退默认行。 */
export async function fetchVideoLinkageRules(configCode: string): Promise<VideoLinkageRuleRow[]> {
  return request<VideoLinkageRuleRow[]>({
    url: `/video/linkages/${encodeURIComponent(configCode)}/rules`,
    method: 'GET',
  });
}

/** 新建联动配置（configCode 由后端生成），返回落库后的配置。 */
export async function createVideoLinkage(body: VideoLinkageSaveRequest): Promise<VideoLinkageItem> {
  return request<VideoLinkageItem>({ url: '/video/linkages', method: 'POST', data: body });
}

/** 更新联动配置并整表替换规则行；未命中 configCode 时返回 null。 */
export async function updateVideoLinkage(
  configCode: string,
  body: VideoLinkageSaveRequest,
): Promise<VideoLinkageItem | null> {
  return request<VideoLinkageItem | null>({
    url: `/video/linkages/${encodeURIComponent(configCode)}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除联动配置及其规则行，返回是否删除成功。 */
export async function deleteVideoLinkage(configCode: string): Promise<boolean> {
  const result = await request<VideoLinkageDeleteResult>({
    url: `/video/linkages/${encodeURIComponent(configCode)}`,
    method: 'DELETE',
  });
  return Boolean(result?.ok);
}

/**
 * 摄像头静态截图（演示）：带 JWT 的 http 客户端取字节端点，转 objectURL 供 <img> 渲染。
 * 直接走 /video/cameras/{id}/snapshot，规避 <img src> 无法携带 Authorization 头的鉴权坑
 * （视频域接口需 JWT，裸 <img> 请求会被 401）。
 */
export async function fetchVideoSnapshotUrl(id: number): Promise<string> {
  const resp = await http.get<Blob>(`/video/cameras/${id}/snapshot`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(resp.data);
}
