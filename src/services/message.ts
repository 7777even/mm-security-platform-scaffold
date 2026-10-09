import { request } from '@/services/http';
import type { components } from '@/types/generated/notification';

// 生成类型嵌套在 components['schemas'] 下，按仓库既有约定（同 communication.ts）取别名再导出。
export type NotificationItem = components['schemas']['NotificationItem'];
export type NotificationPageResult = components['schemas']['NotificationPageResult'];
export type NotificationSaveRequest = components['schemas']['NotificationSaveRequest'];

// 消息中心数据服务（设计稿 §5.3.5.5 列表与消息栏 / 消息中心原型）。
// 接后端 /api/v1/notifications；测试 / 离线兜底通过 __setNotificationFetch 注入。

export type MessageCategory = 'alarm' | 'event' | 'task' | 'system';

export interface MessageTarget {
  type: 'alarm' | 'event' | 'task';
  id: string;
}

export interface MessageItem {
  id: string;
  category: MessageCategory;
  title: string;
  summary: string;
  time: string;
  read: boolean;
  target?: MessageTarget;
}

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  alarm: '报警通知',
  event: '事件通知',
  task: '任务通知',
  system: '系统通知',
};

export const MESSAGE_CATEGORIES: MessageCategory[] = ['alarm', 'event', 'task', 'system'];

export interface NotificationQuery {
  page?: number;
  size?: number;
  category?: string;
  read?: number;
}

/** 后端 createdAt（yyyy-MM-dd HH:mm:ss）→ HH:mm，供底部播报 / 铃铛展示。 */
function fmtTime(createdAt?: string | null): string {
  if (!createdAt) return '';
  const m = createdAt.match(/(\d{2}:\d{2})(:\d{2})?/);
  return m ? m[1] : createdAt;
}

/** 后端通知项 → 前端消息项（统一 id/time 形态，供 BottomMessageBar / 铃铛复用）。 */
export function toMessageItem(n: NotificationItem): MessageItem {
  return {
    id: String(n.id),
    category: (n.category as MessageCategory) || 'system',
    title: n.title ?? '',
    summary: n.summary ?? '',
    time: fmtTime(n.createdAt),
    read: !!n.read,
    target: n.target
      ? { type: (n.target.type as MessageTarget['type']) || 'alarm', id: n.target.id ?? '' }
      : undefined,
  };
}

// 注入点：测试 / 离线兜底可替换取数实现（默认直连后端 /notifications）。
type FetchFn = (query: NotificationQuery) => Promise<NotificationPageResult>;
let fetchImpl: FetchFn = (q) =>
  request<NotificationPageResult>({ url: '/notifications', method: 'GET', params: q });

/** 测试注入取数函数，避免真实网络依赖。 */
export function __setNotificationFetch(fn: FetchFn): void {
  fetchImpl = fn;
}

export function fetchNotifications(query: NotificationQuery = {}): Promise<NotificationPageResult> {
  return fetchImpl(query);
}

/** 底部播报 / 铃铛下拉：取最近若干条转为消息项。 */
export function fetchMessages(): Promise<MessageItem[]> {
  return fetchNotifications({ page: 1, size: 50 }).then((r) => (r.list ?? []).map(toMessageItem));
}

export function markNotificationRead(id: number | string): Promise<void> {
  return request<void>({ url: `/notifications/${id}/read`, method: 'PUT' });
}

export function markAllNotificationsRead(): Promise<void> {
  return request<void>({ url: '/notifications/read-all', method: 'POST' });
}

export function deleteNotification(id: number | string): Promise<void> {
  return request<void>({ url: `/notifications/${id}`, method: 'DELETE' });
}

export function createNotification(body: NotificationSaveRequest): Promise<NotificationItem> {
  return request<NotificationItem>({ url: '/notifications', method: 'POST', data: body });
}
