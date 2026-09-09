import { ref, type Ref } from 'vue';
import { fetchAlarmPage } from '@/services/alarm';
import { toScreenAlarm } from '../adapters/alarmAdapter';
import type { AlarmItem as ScreenAlarmItem } from '../data/mock';
import { backendUnavailableWarn } from '@/services/backendFallback';

// 大屏报警数据层：fetch-once 单例。
// 取代此前各组件直接 import 写死的 lib/data/mock.alarms const（静默假数据冒充后端），
// 改为由本模块统一拉取真实后端 /alarms，经 toScreenAlarm 适配为大屏 AlarmCard 形状。
// 与 useScreenHazardData / useScreenSecurityData 同范式：
// VITE_API_BASE 未配置时 fetchAlarmPage 内部回落到 dev mock；已配置但后端失败则告警并置空集合。
export const screenAlarms: Ref<ScreenAlarmItem[]> = ref([]);
export const screenAlarmLoading = ref(false);

let loaded = false;
let inflight: Promise<void> | null = null;

/** 拉取大屏真实报警（仅首次真正发起请求，之后复用加载结果；失败不置 loaded，允许后续重试）。 */
export function refreshScreenAlarms(size = 20): Promise<void> {
  if (loaded) return Promise.resolve();
  if (inflight) return inflight;
  screenAlarmLoading.value = true;
  inflight = fetchAlarmPage(1, size)
    .then((page) => {
      screenAlarms.value = (page?.list ?? []).map((item, index) => toScreenAlarm(item, index));
      loaded = true;
    })
    .catch((error: unknown) => {
      screenAlarms.value = [];
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

/** 按本地 id 查找报警（供地图点位点击等按 id 反查的场合）。 */
export function findScreenAlarm(id: number | string): ScreenAlarmItem | undefined {
  return screenAlarms.value.find((item) => String(item.id) === String(id));
}
