import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AlarmItem, AlarmStatus, AlarmLevel } from '@/services/alarm';

// 监测预警实时状态（D1 §2「监测预警」二级功能）。
// 实时报警由 ws `alarm.push` topic 经 ingestAlarm 入流；ack 仅软件协同处置，不下行硬控。

export interface AlarmPageQuery {
  page: number;
  size: number;
  level?: AlarmLevel;
  status?: AlarmStatus;
}

export interface AlarmPage {
  list: AlarmItem[];
  total: number;
  page: number;
  size: number;
}

// 允许的状态跃迁：逐向前进一步（仅软件协同处置）。
const ACK_FLOW: AlarmStatus[] = ['ACTIVE', 'ACKED', 'DISPATCHED', 'CLOSED'];

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref<AlarmItem[]>([]);

  const activeCount = computed(() => alarms.value.filter((a) => a.status === 'ACTIVE').length);

  function ingestAlarm(item: AlarmItem): void {
    const idx = alarms.value.findIndex((a) => a.alarmId === item.alarmId);
    if (idx >= 0)
      alarms.value[idx] = item; // 去重：同 id 以最新为准
    else alarms.value.push(item);
  }

  function paged(query: AlarmPageQuery): AlarmPage {
    const { page, size, level, status } = query;
    const filtered = alarms.value.filter(
      (a) =>
        (level === undefined || a.level === level) && (status === undefined || a.status === status),
    );
    const start = (page - 1) * size;
    return { list: filtered.slice(start, start + size), total: filtered.length, page, size };
  }

  // 仅允许沿 ACK_FLOW 前进一格；跨级/重复/越界均视为无效并忽略。
  function ack(alarmId: string, next: AlarmStatus): boolean {
    const item = alarms.value.find((a) => a.alarmId === alarmId);
    if (!item) return false;
    const curIdx = ACK_FLOW.indexOf(item.status);
    const nextIdx = ACK_FLOW.indexOf(next);
    if (nextIdx !== curIdx + 1) return false;
    item.status = next;
    return true;
  }

  return { alarms, activeCount, ingestAlarm, paged, ack };
});
