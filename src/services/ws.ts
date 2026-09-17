import { logger } from '@/utils/logger';

// 零下行控制红线（realtime-channel spec §零下行控制）：本客户端仅消费只读监视数据，
// 公开面只保留 connect/close 生命周期方法，不提供任何消防泵/应急广播/逃生门禁等硬控写端点。

export interface RealtimeMessage {
  topic: string;
  payload: unknown;
}

// 结构化的最小 WebSocket 接口，便于测试注入 fake 实现（node 环境无全局 WebSocket）
export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onclose: ((ev: { code?: number; wasClean?: boolean }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
}

export interface RealtimeClientOptions {
  url: string;
  /** 心跳间隔，默认 15000ms */
  heartbeatIntervalMs?: number;
  /** 基础退避，默认 1000ms */
  baseBackoffMs?: number;
  /** 退避上限，默认 30000ms */
  maxBackoffMs?: number;
  /** Socket 工厂，默认使用全局 WebSocket；测试注入 fake */
  createSocket?: (url: string) => WebSocketLike;
  onMessage?: (msg: RealtimeMessage) => void;
  /**
   * 握手鉴权回调：浏览器 WS 升级请求无法携带 Authorization 头，
   * 故访问令牌须经 `?token=` 查询参数注入连接 URL（令牌为纯内存态，见 token.ts 红线）。
   * 返回 null 表示未登录（不注入，握手将收 401）。
   */
  getToken?: () => string | null;
  /**
   * 令牌刷新回调：当连接**从未成功打开**且可能因令牌失效被握手拒绝（401）时，
   * 由客户端尝试刷新一次（返回是否取得新令牌），避免对已失效令牌无限重连锤击。
   * 连接曾成功打开后的网络掉线不再触发刷新（防瞬时抖动刷爆续期接口）。
   */
  refreshToken?: () => Promise<boolean>;
}

const DEFAULT_HEARTBEAT_MS = 15000;
const DEFAULT_BASE_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 30000;

// readyState 取值（与 DOM WebSocket 常量一致）：CONNECTING=0 / OPEN=1 / CLOSING=2 / CLOSED=3
const CLOSING = 2;

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
  /** 本客户端是否曾成功打开连接（用于区分「从未连上」与「连上后掉线」） */
  private openedEver = false;
  /** 鉴权失败后是否已尝试过一次刷新（避免对已失效令牌无限刷新） */
  private refreshTried = false;

  constructor(options: RealtimeClientOptions) {
    this.url = options.url;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.maxBackoffMs = options.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
    this.onMessage = options.onMessage;
    this.getToken = options.getToken;
    this.refreshToken = options.refreshToken;
    // 浏览器默认工厂；TS 中 DOM WebSocket 与 WebSocketLike 仅事件签名有差异，桥接适配
    this.createSocket =
      options.createSocket ?? ((url: string) => new WebSocket(url) as unknown as WebSocketLike);
  }

  connect(): void {
    if (this.closed) return;
    // 连接建立中/已建立时不重复创建
    if (this.socket && this.socket.readyState < CLOSING) return;

    const socket = this.createSocket(this._buildUrl());
    this.socket = socket;

    socket.onopen = () => {
      // 重连成功后重置退避计数（spec：1s·2^n，上限 30s）
      this.openedEver = true;
      this.reconnectAttempts = 0;
      this._startHeartbeat();
    };

    socket.onclose = () => {
      this._stopHeartbeat();
      this.socket = null;
      if (this.closed) return;
      this._onClosed();
    };

    socket.onerror = () => {
      // 错误路径统一由 onclose 触发退避重连
    };

    socket.onmessage = (ev) => this._handleMessage(ev.data);
  }

  close(): void {
    this.closed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._stopHeartbeat();
    this.socket?.close();
    this.socket = null;
  }

  private _scheduleReconnect(): void {
    const delay = Math.min(this.baseBackoffMs * 2 ** this.reconnectAttempts, this.maxBackoffMs);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /** 组装握手 URL：浏览器 WS 无法带 Authorization 头，令牌经 ?token= 注入（纯内存态读取）。 */
  private _buildUrl(): string {
    const token = this.getToken?.();
    if (!token) return this.url;
    const sep = this.url.includes('?') ? '&' : '?';
    return `${this.url}${sep}token=${encodeURIComponent(token)}`;
  }

  /** 连接关闭后的分流：从未连上且令牌可能失效 → 尝试刷新一次；否则指数退避重连。 */
  private _onClosed(): void {
    if (!this.openedEver && this.refreshToken && !this.refreshTried) {
      this.refreshTried = true;
      void this._tryRefreshThenReconnect();
      return;
    }
    this._scheduleReconnect();
  }

  /** 刷新令牌成功后立即重建连接（重置退避）；失败/异常退回退避重连（不重复刷新）。 */
  private async _tryRefreshThenReconnect(): Promise<void> {
    try {
      const ok = await this.refreshToken!();
      if (ok && !this.closed) {
        this.reconnectAttempts = 0;
        this.connect();
        return;
      }
    } catch {
      // 刷新异常：退回退避重连
    }
    if (!this.closed) this._scheduleReconnect();
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.socket?.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
    }, this.heartbeatIntervalMs);
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _handleMessage(data: unknown): void {
    if (typeof data !== 'string') return;
    try {
      const parsed = JSON.parse(data) as { topic?: unknown; payload?: unknown };
      if (parsed && typeof parsed === 'object' && typeof parsed.topic === 'string') {
        this.onMessage?.({ topic: parsed.topic, payload: parsed.payload });
      }
    } catch {
      // 非法 JSON 仅告警不抛异常（spec §消息订阅与解析）
      logger.warn('[ws] 收到非法 JSON 消息，已忽略');
    }
  }
}
