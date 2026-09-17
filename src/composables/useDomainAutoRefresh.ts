import { onMounted, onUnmounted } from 'vue';
import { subscribeDomainChange } from '@/services/realtime';

// 多域实时刷新接线 composable（realtime-channel spec §多域变更订阅与刷新）。
// 任一端列表 / 详情组件挂载时订阅自身业务域的 `<domain>.changed` 通知，变更到达即重新拉取该域数据，
// 实现「管理端 / 大屏 / 移动端任意一端改写，三端同源实时刷新」。接线零下行控制：回调只做只读 refetch。

export interface UseDomainAutoRefreshOptions {
  /** 挂载时是否立即拉取一次（默认 false，仅响应变更通知）。 */
  immediate?: boolean;
}

/**
 * 订阅 domain 的变更通知并在到达时调用 fetcher（去抖由 realtime 中枢统一处理，单次回调即可安全重拉）。
 *
 * @param domain  业务域，须与后端 `@RealtimeSync(domain=...)` 一致（如 system.user / alarm / emergency.command）。
 * @param fetcher 重新拉取该域数据的函数（可同步或异步；异常由中枢吞掉不影响其它订阅者）。
 */
export function useDomainAutoRefresh(
  domain: string,
  fetcher: () => void | Promise<void>,
  options: UseDomainAutoRefreshOptions = {},
): void {
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = subscribeDomainChange(domain, () => {
      void fetcher();
    });
    if (options.immediate) {
      void fetcher();
    }
  });

  onUnmounted(() => {
    unsubscribe?.();
    unsubscribe = null;
  });
}
