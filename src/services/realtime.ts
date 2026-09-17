import { getActivePinia } from 'pinia';
import { RealtimeClient } from './ws';
import { logger } from '@/utils/logger';
import { useAlarmStore } from '@/stores/alarm';
import type { AlarmItem } from './alarm';
import type { WebSocketLike } from './ws';

// 监测预警实时中枢（D1 §2「监测预警」）。仅订阅只读监视流，将 `alarm.push` / `<domain>.changed`
// 分发至对应消费方。严格不暴露任何硬控写端点（零下行控制红线，由 realtime-channel spec 约束）。

const ALARM_TOPIC = 'alarm.push';
const DEFAULT_URL = import.meta.env.VITE_ALARM_WS_URL ?? '/ws/alarm';

// 多域变更通知：后端经 WS 广播 `<domain>.changed`（仅刷新通知，不携带/执行任何硬控写指令）。
const DOMAIN_CHANGED_SUFFIX = '.changed';
// 客户端按域去抖：同一域 400ms 内的多次变更合并为一次回调，避免高频写造成视图抖动。
const DOMAIN_DEBOUNCE_MS = 400;

let client: RealtimeClient | null = null;

function isAlarmItem(v: unknown): v is AlarmItem {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as AlarmItem).alarmId === 'string' &&
    typeof (v as AlarmItem).level === 'number'
  );
}

// ---- alarm.push 订阅（增量推送，大屏告警流 / alarm store 直接入库）----

type AlarmPushListener = (alarm: AlarmItem) => void;
const alarmPushListeners = new Set<AlarmPushListener>();

/** 订阅 WS 实时告警推送（alarm.push 增量）；返回退订函数（组件 onUnmounted 时调用防泄漏）。 */
export function subscribeAlarmPush(listener: AlarmPushListener): () => void {
  alarmPushListeners.add(listener);
  return () => {
    alarmPushListeners.delete(listener);
  };
}

// ---- <domain>.changed 订阅（多域实时刷新，三端共用）----

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

/**
 * 订阅某业务域的变更通知（`<domain>.changed`）；返回退订函数。
 * 各端列表/详情组件在 onMounted 订阅、onUnmounted 退订。回调按域去抖（见 DOMAIN_DEBOUNCE_MS），
 * 同一窗口内的多次变更合并为一次调用（events 含全部累积事件）。
 */
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

// 消息分发：alarm.push 走增量入库；<domain>.changed 走多域刷新总线；其余非法 topic 容错忽略。
function dispatch(msg: { topic: string; payload: unknown }): void {
  if (msg.topic === ALARM_TOPIC) {
    const alarm = msg.payload;
    if (!isAlarmItem(alarm)) {
      logger.warn('[realtime] 收到非法 alarm 负载，已忽略');
      return;
    }
    // 实时告警发布-订阅：store 入库之外，任何消费方（如大屏告警流 useScreenAlarmFeed）
    // 均可订阅增量推送。与 store 解耦——无 Pinia（子应用早期）也不影响订阅者。
    alarmPushListeners.forEach((listener) => {
      try {
        listener(alarm);
      } catch (err) {
        logger.warn('[realtime] alarm.push 订阅者处理失败，已跳过', err);
      }
    });
    // 子应用独立 Pinia：无活跃实例时仅建立 WS 连接（不入库），避免崩溃；
    // 子应用需在入口创建 Pinia 后才能消费实时告警。
    const pinia = getActivePinia();
    if (!pinia) {
      logger.warn(
        '[realtime] 无活跃 Pinia，跳过 alarm 入库（子应用入口需 createPinia 才能消费实时告警）',
      );
      return;
    }
    useAlarmStore(pinia).ingestAlarm(alarm);
    return;
  }

  if (msg.topic.endsWith(DOMAIN_CHANGED_SUFFIX)) {
    const domain = msg.topic.slice(0, -DOMAIN_CHANGED_SUFFIX.length);
    // alarm 域兼有 push 与 changed：changed 触发整域重新拉取，保证 REST 写（管理端）
    // 亦能实时反映到依赖该 store 的大屏 / 管理端视图。
    if (domain === 'alarm') {
      const pinia = getActivePinia();
      if (pinia) {
        const store = useAlarmStore(pinia);
        if (typeof store.refresh === 'function') store.refresh();
      }
    }
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
  if (client) return; // 已启动则幂等
  client = new RealtimeClient({
    url: opts.url ?? DEFAULT_URL,
    createSocket: opts.createSocket,
    onMessage: dispatch,
  });
  client.connect();
}

export function stopRealtime(): void {
  client?.close();
  client = null;
}
