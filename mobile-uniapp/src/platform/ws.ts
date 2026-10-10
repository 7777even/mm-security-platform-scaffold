// uni-app WebSocket 适配层：将 uni.connectSocket 的任务式 API 包成原 RealtimeClient 所需的
// WebSocketLike 接口（属性式 onopen/onmessage/onclose/onerror + send/close）。
// 这样原 src/services/ws.ts 的 RealtimeClient（心跳、指数退避重连、令牌注入）可零改动复用——
// 只需把 createSocket 工厂换成本文件的 uniCreateSocket。
import { logger } from './logger';

/** 最小 WebSocket 接口，与原 ws.ts 完全一致，便于测试注入 fake 实现。 */
export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onclose: ((ev: { code?: number; wasClean?: boolean }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
}

const CLOSED = 3;

/** 把 uni 的 ConnectSocketTask 适配为 WebSocketLike。 */
class UniSocket implements WebSocketLike {
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: ((ev: { code?: number; wasClean?: boolean }) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;

  private task: any = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
    this.ensure();
  }

  private ensure(): void {
    if (this.task) return;
    const u = (globalThis as Record<string, any>).uni;
    if (!u || typeof u.connectSocket !== 'function') {
      logger.error('[ws] uni.connectSocket 不可用');
      return;
    }
    this.task = u.connectSocket({ url: this.url, complete: () => undefined });
    this.task.onOpen(() => {
      this.readyState = 1;
      this.onopen?.();
    });
    this.task.onClose((ev: { code?: number; wasClean?: boolean }) => {
      this.readyState = CLOSED;
      this.onclose?.({ code: ev?.code, wasClean: ev?.wasClean });
    });
    this.task.onError((ev: unknown) => {
      this.onerror?.(ev);
    });
    this.task.onMessage((ev: { data?: unknown }) => {
      this.onmessage?.({ data: ev?.data });
    });
  }

  send(data: string): void {
    this.ensure();
    this.task?.send({ data });
  }

  close(): void {
    this.task?.close({});
    this.task = null;
    this.readyState = CLOSED;
  }
}

/** 注入 RealtimeClient 的 socket 工厂（替代浏览器 `new WebSocket(url)`）。 */
export function uniCreateSocket(url: string): WebSocketLike {
  return new UniSocket(url);
}
