// 实时中枢（port of src/services/realtime.ts + ws.ts，底层换 uni 套接字）。
// 仅订阅只读监视流，严格不暴露任何硬控写端点（零下行控制红线）。
import { uniCreateSocket, type WebSocketLike } from './ws';
import { logger } from './logger';
import { getAccessToken } from './token';

export interface RealtimeMessage {
  topic: string;
  payload: unknown;
}

// ---- 以下 RealtimeClient 为原 ws.ts 的忠实移植，仅把默认 createSocket 换成 uniCreateSocket ----
const DEFAULT_HEARTBEAT_MS = 15000;
const DEFAULT_BASE_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 30000;
const CLOSING = 2;

export interface RealtimeClientOptions {
  url: string;
  heartbeatIntervalMs?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  createSocket?: (url: string) => WebSocketLike;
  onMessage?: (msg: RealtimeMessage) => void;
  getToken?: () => string | null;
  refreshToken?: () => Promise<boolean>;
}

export class RealtimeClient {
  private readonly url: string;
  private readonly heartbeatIntervalMs: number;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly createSocket: (url: string) => WebSocketLike;
  private readonly onMessage?: (msg: RealtimeMessage) => void;
  private readonly getToken?: () => string | null;
  private readonly refreshToken?: () => Promise<boolean>;

  private socket: WebSocketLike | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;
  private openedEver = false;
  private refreshTried = false;

  constructor(options: RealtimeClientOptions) {
    this.url = options.url;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.maxBackoffMs = options.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
    this.onMessage = options.onMessage;
    this.getToken = options.getToken;
    this.refreshToken = options.refreshToken;
    this.createSocket = options.createSocket ?? ((url: string) => uniCreateSocket(url));
  }

  connect(): void {
    if (this.closed) return;
    if (this.socket && this.socket.readyState < CLOSING) return;

    const socket = this.createSocket(this.buildUrl());
    this.socket = socket;

    socket.onopen = () => {
      this.openedEver = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    socket.onclose = () => {
      this.stopHeartbeat();
      this.socket = null;
      if (this.closed) return;
      this.onClosed();
    };
    socket.onerror = () => undefined;
    socket.onmessage = (ev) => this.handleMessage(ev.data);
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    const delay = Math.min(this.baseBackoffMs * 2 ** this.reconnectAttempts, this.maxBackoffMs);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private buildUrl(): string {
    const token = this.getToken?.();
    if (!token) return this.url;
    const sep = this.url.includes('?') ? '&' : '?';
    return `${this.url}${sep}token=${encodeURIComponent(token)}`;
  }

  private onClosed(): void {
    if (!this.openedEver && this.refreshToken && !this.refreshTried) {
      this.refreshTried = true;
      void this.tryRefreshThenReconnect();
      return;
    }
    this.scheduleReconnect();
  }

  private async tryRefreshThenReconnect(): Promise<void> {
    try {
      const ok = await this.refreshToken!();
      if (ok && !this.closed) {
        this.reconnectAttempts = 0;
        this.connect();
        return;
      }
    } catch {
      /* 退回退避重连 */
    }
    if (!this.closed) this.scheduleReconnect();
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.socket?.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(data: unknown): void {
    if (typeof data !== 'string') return;
    try {
      const parsed = JSON.parse(data) as { topic?: unknown; payload?: unknown };
      if (parsed && typeof parsed === 'object' && typeof parsed.topic === 'string') {
        this.onMessage?.({ topic: parsed.topic, payload: parsed.payload });
      }
    } catch {
      logger.warn('[ws] 收到非法 JSON 消息，已忽略');
    }
  }
}

// ---------------- 业务分发与订阅 ----------------
const ALARM_TOPIC = 'alarm.push';
const DEFAULT_URL = import.meta.env.VITE_ALARM_WS_URL ?? '/ws/alarm';
const DOMAIN_CHANGED_SUFFIX = '.changed';
const DOMAIN_DEBOUNCE_MS = 400;

let client: RealtimeClient | null = null;
let tokenRefresher: (() => Promise<boolean>) | null = null;

export function setRealtimeTokenRefresher(fn: () => Promise<boolean>): void {
  tokenRefresher = fn;
}

type AlarmPushListener = (alarm: unknown) => void;
const alarmPushListeners = new Set<AlarmPushListener>();

export function subscribeAlarmPush(listener: AlarmPushListener): () => void {
  alarmPushListeners.add(listener);
  return () => {
    alarmPushListeners.delete(listener);
  };
}

export type DomainChangeAction = 'created' | 'updated' | 'deleted';
export interface DomainChangeEvent {
  domain: string;
  action: DomainChangeAction;
  id: string | null;
  data: unknown;
}
export type DomainChangeHandler = (events: DomainChangeEvent[]) => void;

const domainChangeListeners = new Map<string, Set<DomainChangeHandler>>();
const domainChangeTimers = new Map<string, ReturnType<typeof setTimeout>>();
const domainChangeBuffers = new Map<string, DomainChangeEvent[]>();

function isDomainChangePayload(v: unknown): v is DomainChangeEvent {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as DomainChangeEvent).domain === 'string' &&
    typeof (v as DomainChangeEvent).action === 'string'
  );
}

function dispatchDomainChange(domain: string, payload: unknown): void {
  const evt: DomainChangeEvent = isDomainChangePayload(payload)
    ? payload
    : { domain, action: 'updated', id: null, data: payload };

  const buffer = domainChangeBuffers.get(domain) ?? [];
  buffer.push(evt);
  domainChangeBuffers.set(domain, buffer);

  const existing = domainChangeTimers.get(domain);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    domainChangeTimers.delete(domain);
    domainChangeBuffers.delete(domain);
    const handlers = domainChangeListeners.get(domain);
    if (!handlers || handlers.size === 0) return;
    const events = buffer;
    handlers.forEach((h) => {
      try {
        h(events);
      } catch (err) {
        logger.warn('[realtime] domain.change 订阅者处理失败，已跳过', err);
      }
    });
  }, DOMAIN_DEBOUNCE_MS);
  domainChangeTimers.set(domain, timer);
}

export function subscribeDomainChange(domain: string, handler: DomainChangeHandler): () => void {
  let set = domainChangeListeners.get(domain);
  if (!set) {
    set = new Set();
    domainChangeListeners.set(domain, set);
  }
  set.add(handler);
  return () => {
    set!.delete(handler);
    if (set!.size === 0) domainChangeListeners.delete(domain);
  };
}

function dispatch(msg: { topic: string; payload: unknown }): void {
  if (msg.topic === ALARM_TOPIC) {
    const alarm = msg.payload;
    alarmPushListeners.forEach((listener) => {
      try {
        listener(alarm);
      } catch (err) {
        logger.warn('[realtime] alarm.push 订阅者处理失败，已跳过', err);
      }
    });
    return;
  }
  if (msg.topic.endsWith(DOMAIN_CHANGED_SUFFIX)) {
    const domain = msg.topic.slice(0, -DOMAIN_CHANGED_SUFFIX.length);
    dispatchDomainChange(domain, msg.payload);
    return;
  }
  logger.debug('[realtime] 忽略未知 topic：' + msg.topic);
}

export interface RealtimeHubOptions {
  url?: string;
  createSocket?: (url: string) => WebSocketLike;
}

export function startRealtime(opts: RealtimeHubOptions = {}): void {
  if (client) return;
  client = new RealtimeClient({
    url: opts.url ?? DEFAULT_URL,
    createSocket: opts.createSocket,
    onMessage: dispatch,
    getToken: () => getAccessToken(),
    refreshToken: tokenRefresher ?? undefined,
  });
  client.connect();
}

export function stopRealtime(): void {
  client?.close();
  client = null;
}
