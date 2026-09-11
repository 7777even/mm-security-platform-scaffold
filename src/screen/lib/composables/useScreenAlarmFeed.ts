import { ref, type Ref } from 'vue';
import { fetchAlarmPage } from '@/services/alarm';
import { toScreenAlarm } from '../adapters/alarmAdapter';
import type { AlarmItem as ScreenAlarmItem } from '../data/mock';
import { backendUnavailableWarn } from '@/services/backendFallback';
import { subscribeAlarmPush } from '@/services/realtime';

// 大屏报警数据层：首屏 fetch 历史 + WS 增量实时推送（取代早期 fetch-once 永不刷新）。
// - 历史：首镒拉取真实后端 /alarms，经 toScreenAlarm 适配为大屏 AlarmCard 形状；
// - 增量：订阅 realtime `alarm.push`（/ws/alarm，后端 12s 轮询 fac_alarm 增量推送），
//   新告警插入队首；按后端 alarmId 去重（历史与推送可能重叠），队列定容防无限增长。
// 与 useScreenHazardData / useScreenSecurityData 同范式：
// VITE_API_BASE 未配置时 fetchAlarmPage 内部回落到 dev mock；已配置但后端失败则告警并置空集合。
export const screenAlarms: Ref<ScreenAlarmItem[]> = ref([]);
export const screenAlarmLoading = ref(false);

const MAX_SCREEN_ALARMS = 50;
const seenAlarmIds = new Set<string>();

/**
 * 有界去重集合：将 alarmId 记入已见集合；超出队列定容 MAX_SCREEN_ALARMS 时淘汰
 * 最旧条目（Set 保持插入顺序）。避免 kiosk 长期运行下 seenAlarmIds 只增不减导致的内存泄漏。
 */
function addSeen(id: string): void {
  if (!id) return;
  seenAlarmIds.add(id);
  if (seenAlarmIds.size > MAX_SCREEN_ALARMS) {
    const oldest = seenAlarmIds.values().next().value;
    if (oldest !== undefined) seenAlarmIds.delete(oldest);
  }
}

let loaded = false;
let inflight: Promise<void> | null = null;

/** 拉取大屏真实报警历史（仅首次真正发起请求；失败不置 loaded，允许后续重试）。 */
export function refreshScreenAlarms(size = 20): Promise<void> {
  if (loaded) return Promise.resolve();
  if (inflight) return inflight;
  screenAlarmLoading.value = true;
  inflight = fetchAlarmPage(1, size)
    .then((page) => {
      const list = page?.list ?? [];
      list.forEach((item) => {
        if (item.alarmId) addSeen(item.alarmId);
      });
      screenAlarms.value = list.map((item, index) => toScreenAlarm(item, index));
      loaded = true;
    })
    .catch((error: unknown) => {
      screenAlarms.value = [];
      seenAlarmIds.clear();
      backendUnavailableWarn(
        'screen-alarm',
        '/alarms',
        error instanceof Error ? error.message : '请求失败',
      );
    })
    .finally(() => {
      screenAlarmLoading.value = false;
      inflight = null;
    });
  return inflight;
}

// WS 增量订阅：模块级单例（本模块被多个大屏组件 import，仅注册一次监听）。
// 注：若增量先于历史返回（罕见，12s 推送间隔 vs 毫秒级首屏请求），历史加载会覆盖之，
// 下一条增量起恢复正常——以历史为准的简单语义，避免为极小概率窗口引入合并复杂度。
subscribeAlarmPush((alarm) => {
  if (!alarm.alarmId || seenAlarmIds.has(alarm.alarmId)) return;
  addSeen(alarm.alarmId);
  screenAlarms.value = [toScreenAlarm(alarm, 0), ...screenAlarms.value].slice(0, MAX_SCREEN_ALARMS);
});

/** 按本地 id 查找报警（供地图点位点击等按 id 反查的场合）。 */
export function findScreenAlarm(id: number | string): ScreenAlarmItem | undefined {
  return screenAlarms.value.find((item) => String(item.id) === String(id));
}
