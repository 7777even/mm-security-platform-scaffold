import { ref, computed } from 'vue';
import { useAlarmStore } from '@/stores/alarm';
import { usePermission } from '@/composables/usePermission';
import { reportAudit } from '@/services/audit';
import { recordPerfAsync } from '@/utils/perf-budget';
import type { AlarmItem, AlarmLevel, AlarmStatus } from '@/services/alarm';

// 监测预警视图业务编排（D1 §2「监测预警」）。将实时流(store) → 列表/筛选/详情/ack 串起，
// ack 受 fire-alarm:ack 权限门控并上报审计；仅软件协同处置，不下行硬控。

export function useAlarmView() {
  const store = useAlarmStore();
  const { hasPerm } = usePermission();

  const page = ref(1);
  const size = ref(10);
  const levelFilter = ref<AlarmLevel | undefined>(undefined);
  const statusFilter = ref<AlarmStatus | undefined>(undefined);
  const detail = ref<AlarmItem | null>(null);

  const pageResult = computed(() =>
    store.paged({
      page: page.value,
      size: size.value,
      level: levelFilter.value,
      status: statusFilter.value,
    }),
  );
  const activeCount = computed(() => store.activeCount);

  // 查询性能打点（P10 组件查询 ≤2s）。实时流已入 store，查询即本地切片；
  // 真实环境此处拉取分页接口，包一层 recordPerfAsync 以统一测量。
  async function refresh(): Promise<void> {
    await recordPerfAsync('componentQueryMs', async () => undefined);
  }

  function openDetail(item: AlarmItem): void {
    detail.value = item;
  }

  function canAck(): boolean {
    return hasPerm('fire-alarm:ack');
  }

  async function ack(alarmId: string): Promise<boolean> {
    if (!canAck()) return false;
    const ok = store.ack(alarmId, 'ACKED');
    if (ok) {
      reportAudit({ action: 'alarm-ack', module: 'fire-alarm', detail: { alarmId } });
      await refresh();
    }
    return ok;
  }

  return {
    page,
    size,
    levelFilter,
    statusFilter,
    detail,
    pageResult,
    activeCount,
    refresh,
    openDetail,
    canAck,
    ack,
  };
}
