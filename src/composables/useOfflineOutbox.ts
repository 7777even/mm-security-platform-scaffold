import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import {
  LocalStorageStore,
  OfflineOutbox,
  type FieldReportItem,
  type OutboxEnqueueInput,
} from '@/services/offlineOutbox';

export interface UseOfflineOutboxOptions {
  /** 回传适配器（demo 用模拟提交；生产注入 createHttpSubmit()）。 */
  submit: (item: FieldReportItem) => Promise<void>;
  storageKey?: string;
}

/**
 * 防爆手机离线优先回传组合式：在 OfflineOutbox 之上提供响应式队列与"模拟断网"开关，
 * 便于在桌面浏览器演示"离线先缓存、联网后自动补传"闭环（真实防爆终端由 5G 内网可用性决定）。
 */
export function useOfflineOutbox(opts: UseOfflineOutboxOptions) {
  const items = ref<FieldReportItem[]>([]);
  const realOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const simulatedOffline = ref(false);
  const flushing = ref(false);

  const isOnline = computed(() => realOnline.value && !simulatedOffline.value);

  const outbox = shallowRef<OfflineOutbox>(
    new OfflineOutbox({
      storage: new LocalStorageStore('mm-demo'),
      submit: opts.submit,
      storageKey: opts.storageKey ?? 'mm.outbox.demo',
      onlineCheck: () => isOnline.value,
    }),
  );

  const unsubscribe = outbox.value.subscribe((list) => {
    items.value = list;
  });

  function handleOnline(): void {
    realOnline.value = true;
    void outbox.value.flush();
  }
  function handleOffline(): void {
    realOnline.value = false;
  }

  onMounted(() => {
    outbox.value.startAutoFlush();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
  });

  onUnmounted(() => {
    outbox.value.stopAutoFlush();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
    unsubscribe();
  });

  async function enqueue(input: OutboxEnqueueInput): Promise<FieldReportItem> {
    return outbox.value.enqueue(input);
  }

  async function flush(): Promise<{ synced: number; failed: number }> {
    flushing.value = true;
    try {
      return await outbox.value.flush();
    } finally {
      flushing.value = false;
    }
  }

  async function retry(id: string): Promise<void> {
    await outbox.value.retry(id);
  }

  function toggleSimulatedOffline(): void {
    simulatedOffline.value = !simulatedOffline.value;
    if (!simulatedOffline.value) void outbox.value.flush();
  }

  const stats = computed(() => {
    let pending = 0;
    let done = 0;
    let failed = 0;
    for (const it of items.value) {
      if (it.status === 'done') done++;
      else if (it.status === 'failed') failed++;
      else pending++;
    }
    return { pending, done, failed, total: items.value.length };
  });

  return {
    items,
    isOnline,
    simulatedOffline,
    flushing,
    stats,
    enqueue,
    flush,
    retry,
    toggleSimulatedOffline,
  };
}
