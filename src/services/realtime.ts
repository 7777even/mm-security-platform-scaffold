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
  if (isAlarmItem(msg.payload)) {
    useAlarmStore().ingestAlarm(msg.payload);
  } else {
    logger.warn('[realtime] 收到非法 alarm 负载，已忽略');
  }
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
