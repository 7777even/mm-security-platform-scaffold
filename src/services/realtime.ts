import { getActivePinia } from 'pinia';
import { RealtimeClient } from './ws';
import { logger } from '@/utils/logger';
import { useAlarmStore } from '@/stores/alarm';
import type { AlarmItem } from './alarm';
import type { WebSocketLike } from './ws';

// 监测预警实时中枢（D1 §2「监测预警」）。仅订阅只读监视流，将 `alarm.push` 分发至 alarm store。
// 严格不暴露任何硬控写端点（零下行控制红线，由 realtime-channel spec 约束）。

const ALARM_TOPIC = 'alarm.push';
const DEFAULT_URL = import.meta.env.VITE_ALARM_WS_URL ?? '/ws/alarm';

let client: RealtimeClient | null = null;

function isAlarmItem(v: unknown): v is AlarmItem {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as AlarmItem).alarmId === 'string' &&
    typeof (v as AlarmItem).level === 'number'
  );
}

// 消息分发：仅处理 alarm.push，非法负载容错忽略（不抛异常，与 ws 解析策略一致）。
function dispatch(msg: { topic: string; payload: unknown }): void {
  if (msg.topic !== ALARM_TOPIC) return;
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
}

type AlarmPushListener = (alarm: AlarmItem) => void;

const alarmPushListeners = new Set<AlarmPushListener>();

/** 订阅 WS 实时告警推送（alarm.push 增量）；返回退订函数（组件 onUnmounted 时调用防泄漏）。 */
export function subscribeAlarmPush(listener: AlarmPushListener): () => void {
  alarmPushListeners.add(listener);
  return () => {
    alarmPushListeners.delete(listener);
  };
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
