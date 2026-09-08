import { ref, type Ref } from 'vue';
import { fetchMajorHazards, type MajorHazardItem } from '@/services/hazard';

// 大屏重大危险源数据层：fetch-once 单例。
// 取代此前直接 import 写死的 majorHazards const（静默假数据冒充后端），
// 改为由本模块统一拉取真实后端 /hazards 并暴露响应式 ref。
// VITE_API_BASE 未配置时 fetchMajorHazards 内部回落到 fixture；已配置但后端失败则告警并置空集合（见 services/hazard.ts）。
export const majorHazardsData: Ref<MajorHazardItem[]> = ref([]);
export const hazardLoading = ref(false);

let loaded = false;
let inflight: Promise<void> | null = null;

/** 拉取重大危险源真实数据（仅首次真正发起请求，之后复用加载结果）。 */
export function refreshMajorHazards(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (inflight) return inflight;
  hazardLoading.value = true;
  inflight = fetchMajorHazards()
    .then((list) => {
      majorHazardsData.value = list;
      loaded = true;
    })
    .finally(() => {
      hazardLoading.value = false;
      inflight = null;
    });
  return inflight;
}
