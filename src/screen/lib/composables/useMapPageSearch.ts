import { onUnmounted, watch, type WatchSource } from 'vue';
import { useShellRoute } from './useShellRoute';
import {
  registerMapSearchMarkers,
  unregisterMapSearchMarkers,
  type SearchableMapMarker,
} from './useMapSearchRegistry';

/**
 * 当前地图页向共享搜索索引注册「本页已渲染点位」。
 * 传入一个返回归一化点位的 getter（可为 ref/computed 或普通函数），组件挂载即注册、
 * 数据变化时同步、卸载时注销——保证搜索浮层只搜到当前页真实渲染的点。
 *
 * @param source 点位来源（响应式 ref/computed 或直接函数）
 * @param pageKeyOverride 可选：显式指定注册桶（默认取当前 shell 路由名，页内稳定）
 */
export function useMapPageSearch(
  source: WatchSource<SearchableMapMarker[]>,
  pageKeyOverride?: string,
): void {
  const shellRoute = useShellRoute();
  const pageKey = pageKeyOverride ?? shellRoute.name.value;

  // 兼容传入 ref/computed 或普通 getter 两种写法
  const read = (): SearchableMapMarker[] =>
    typeof source === 'function' ? source() : source.value;

  const sync = () => registerMapSearchMarkers(pageKey, read());
  sync();

  watch(source, sync, { deep: true });
  onUnmounted(() => unregisterMapSearchMarkers(pageKey));
}
