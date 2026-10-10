// 实时域刷新组合式（port of @/composables/useDomainAutoRefresh）。
// 订阅 <domain>.changed，组件挂载时订阅、卸载时退订。
import { onMounted, onUnmounted } from 'vue';
import { subscribeDomainChange, type DomainChangeEvent } from '@/platform/realtime';

export function useDomainAutoRefresh(
  domain: string,
  handler: (events: DomainChangeEvent[]) => void,
  opts: { immediate?: boolean } = {},
): void {
  let unsub: (() => void) | null = null;
  onMounted(() => {
    unsub = subscribeDomainChange(domain, handler);
    if (opts.immediate) handler([]);
  });
  onUnmounted(() => {
    unsub?.();
    unsub = null;
  });
}
