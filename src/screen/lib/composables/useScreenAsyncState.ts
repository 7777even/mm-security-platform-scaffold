import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { backendUnavailableWarn } from '@/services/backendFallback';

/**
 * 大屏统一异步四态封装：data / loading / error / isEmpty + retry。
 *
 * 取代此前各面板零散的手写 `loading/failed ref + onMounted try/catch`（详见
 * RiskHeatmapPanel.vue 等的旧模式），并把「后端失败 → 空态 + console 告警」
 * 的既有口径（backendFallback.ts）收敛到统一入口：
 * - 失败时 error 置文案、data 保持上次成功值（首次失败即保持 initialData 空态）；
 * - 失败经 backendUnavailableWarn 打印域级告警，缺口立刻可见（不冒充真实数据）；
 * - 同一 state 的并发调用合并为单次 inflight，retry 可安全重复触发。
 */

export interface ScreenAsyncState<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  /** 最近一次失败的错误文案；成功后清空 */
  error: Ref<string | null>;
  isEmpty: ComputedRef<boolean>;
  /** 手动重试（失败态 UI 的重试按钮入口） */
  retry: () => Promise<void>;
}

export interface ScreenAsyncStateOptions<T> {
  /** data 初始值；数组类业务传 `[]` 即可让失败态落在「空集合」既有口径上 */
  initialData?: T | null;
  /** 自定义空判定；默认 null 或空数组视为空 */
  isEmpty?: (data: T | null) => boolean;
  /** 创建时是否立即执行 fetcher（默认 true；由调用方 onMounted 触发时传 false） */
  immediate?: boolean;
}

export function useScreenAsyncState<T>(
  domain: string,
  endpoint: string,
  fetcher: () => Promise<T>,
  options: ScreenAsyncStateOptions<T> = {},
): ScreenAsyncState<T> {
  const data = ref(options.initialData ?? null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isEmpty = computed(() => {
    if (options.isEmpty) return options.isEmpty(data.value);
    if (data.value == null) return true;
    if (Array.isArray(data.value)) return data.value.length === 0;
    return false;
  });

  let inflight: Promise<void> | null = null;

  function run(): Promise<void> {
    if (inflight) return inflight;
    loading.value = true;
    error.value = null;
    inflight = fetcher()
      .then((result) => {
        data.value = result;
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : '请求失败';
        error.value = message;
        backendUnavailableWarn(domain, endpoint, message);
      })
      .finally(() => {
        loading.value = false;
        inflight = null;
      });
    return inflight;
  }

  if (options.immediate !== false) {
    void run();
  }

  return { data, loading, error, isEmpty, retry: run };
}
