// 防爆手机端离线优先回传（详细设计 §3.2 移动端 + 弱网/防爆约束 + 现场图文视频回传业务闭环）
//
// 设计要点：
// - 入队即持久化，不依赖网络（断网也能采集，对应"防爆手机 5G 内网弱覆盖"场景）；
// - 联网后自动补传（监听 online 事件 + 主动 flush），实现"离线先缓存、联网后自动补传"；
// - 回传适配器可注入（默认 createHttpSubmit：POST /api/v1/field-reports），便于测试与后端 T7 对接；
// - 存储可注入（默认 LocalStorageStore；生产建议换 IndexedDB 大对象存储），遵循 services/adapter 分离。
// - 只监不控：本模块仅负责"现场采集数据上行回传"，不含任何下行硬控写端点。

export type OutboxItemKind = 'field-report' | 'task-ack';
export type OutboxItemStatus = 'pending' | 'syncing' | 'done' | 'failed';

export interface FieldReportMedia {
  type: 'image' | 'video';
  name: string;
  size: number;
}

export interface FieldReportItem {
  id: string;
  kind: OutboxItemKind;
  title: string;
  note?: string;
  deviceCode?: string; // 关联 20 位 MDM 设备编码（若有）
  media?: FieldReportMedia[];
  createdAt: number;
  status: OutboxItemStatus;
  attempts: number;
  lastError?: string;
  syncedAt?: number;
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export interface OutboxOptions {
  storage: KeyValueStore;
  submit: (item: FieldReportItem) => Promise<void>;
  onlineCheck?: () => boolean;
  storageKey?: string;
  maxRetries?: number;
}

export type OutboxEnqueueInput = Omit<FieldReportItem, 'id' | 'createdAt' | 'status' | 'attempts'>;

type Listener = (items: FieldReportItem[]) => void;

const DEFAULT_STORAGE_KEY = 'mm.outbox.v1';

function defaultOnlineCheck(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function byCreatedDesc(a: FieldReportItem, b: FieldReportItem): number {
  return b.createdAt - a.createdAt;
}

/**
 * 离线优先回传队列（防爆手机现场采集回传核心能力）。
 * 入队即持久化，联网自动补传；回传失败按 maxRetries 重试，超限置 failed 不阻塞其他项。
 */
export class OfflineOutbox {
  private readonly storage: KeyValueStore;
  private readonly submitFn: (item: FieldReportItem) => Promise<void>;
  private readonly onlineCheck: () => boolean;
  private readonly storageKey: string;
  private readonly maxRetries: number;
  private readonly listeners = new Set<Listener>();
  private flushing = false;
  private readonly boundOnOnline = (): void => {
    void this.flush();
  };

  constructor(opts: OutboxOptions) {
    this.storage = opts.storage;
    this.submitFn = opts.submit;
    this.onlineCheck = opts.onlineCheck ?? defaultOnlineCheck;
    this.storageKey = opts.storageKey ?? DEFAULT_STORAGE_KEY;
    this.maxRetries = opts.maxRetries ?? 5;
  }

  /** 入队并持久化；若当前在线则立即尝试补传。离线时静默留存（待 online 事件触发）。 */
  async enqueue(input: OutboxEnqueueInput): Promise<FieldReportItem> {
    const item: FieldReportItem = {
      ...input,
      id: genId(),
      createdAt: Date.now(),
      status: 'pending',
      attempts: 0,
    };
    const items = await this.read();
    items.push(item);
    await this.write(items);
    this.emit(items);
    if (this.onlineCheck()) void this.flush();
    return item;
  }

  /** 当前队列快照（按创建时间倒序）。 */
  async list(): Promise<FieldReportItem[]> {
    return (await this.read()).slice().sort(byCreatedDesc);
  }

  /**
   * 补传：遍历未达成项，逐个提交。离线或正在补传则直接返回。
   * @returns 本次补传结果（成功/失败计数，已 done 的不计入）。
   */
  async flush(): Promise<{ synced: number; failed: number }> {
    if (this.flushing) return { synced: 0, failed: 0 };
    if (!this.onlineCheck()) return { synced: 0, failed: 0 };
    this.flushing = true;
    let synced = 0;
    let failed = 0;
    try {
      const items = await this.read();
      for (const item of items) {
        if (item.status === 'done') continue;
        if (item.attempts >= this.maxRetries) {
          if (item.status !== 'failed') {
            item.status = 'failed';
            await this.write(items);
            this.emit(items);
          }
          failed++;
          continue;
        }
        item.status = 'syncing';
        item.attempts += 1;
        await this.write(items);
        this.emit(items);
        try {
          await this.submitFn(item);
          item.status = 'done';
          item.syncedAt = Date.now();
          item.lastError = undefined;
          synced++;
        } catch (err) {
          item.status = 'failed';
          item.lastError = err instanceof Error ? err.message : String(err);
          failed++;
        }
        await this.write(items);
        this.emit(items);
      }
    } finally {
      this.flushing = false;
    }
    return { synced, failed };
  }

  /** 单项重试：重置状态与重试计数后（若在线）立即补传。用于人工/后端介入恢复失败项。 */
  async retry(id: string): Promise<void> {
    const items = await this.read();
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.status = 'pending';
    it.attempts = 0;
    it.lastError = undefined;
    await this.write(items);
    this.emit(items);
    if (this.onlineCheck()) void this.flush();
  }

  /** 启动自动补传：监听 window online 事件，并在启动时若在线补传一次。 */
  startAutoFlush(): void {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', this.boundOnOnline);
    }
    if (this.onlineCheck()) void this.flush();
  }

  stopAutoFlush(): void {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('online', this.boundOnOnline);
    }
  }

  /** 订阅队列变更（用于 UI 响应式）；返回取消订阅函数。订阅即推送当前快照。 */
  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    void this.list().then(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit(items: FieldReportItem[]): void {
    const snapshot = items.slice().sort(byCreatedDesc);
    for (const l of this.listeners) l(snapshot);
  }

  private async read(): Promise<FieldReportItem[]> {
    const raw = await this.storage.get(this.storageKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as FieldReportItem[]) : [];
    } catch {
      return [];
    }
  }

  private async write(items: FieldReportItem[]): Promise<void> {
    await this.storage.set(this.storageKey, JSON.stringify(items));
  }
}

/** 浏览器 localStorage 存储适配（KV 语义）；生产大对象场景建议换 IndexedDB。 */
export class LocalStorageStore implements KeyValueStore {
  constructor(private readonly ns = 'mm') {}

  private key(k: string): string {
    return `${this.ns}:${k}`;
  }

  async get(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.key(key));
  }

  async set(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.key(key), value);
  }
}

/**
 * 默认回传适配器：POST 现场采集数据至后端（B3 待补字段；T7 到位仅改此函数）。
 * 仅上行，不承载任何下行硬控。
 */
export function createHttpSubmit(baseUrl = '/api/v1'): (item: FieldReportItem) => Promise<void> {
  return async (item: FieldReportItem): Promise<void> => {
    const res = await fetch(`${baseUrl}/field-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      throw new Error(`回传失败 HTTP ${res.status}`);
    }
  };
}
