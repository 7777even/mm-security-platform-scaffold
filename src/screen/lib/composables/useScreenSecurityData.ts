import { ref, type Ref } from 'vue';
import {
  fetchBollards,
  fetchGateControls,
  fetchPatrolCameras,
  type BollardItem,
  type GateControlItem,
  type PatrolCameraItem,
} from '@/services/security';

// 大屏安全防恐数据层：fetch-once 单例，统一拉取三大列表并暴露响应式 ref，
// 取代此前直接 import 写死的 patrolCameras / gateControls / bollards const（静默假数据冒充后端）。
// VITE_API_BASE 未配置时，各 fetch* 内部回落到对应 fixture；已配置但后端失败则告警并置空集合。
export const bollardsData: Ref<BollardItem[]> = ref([]);
export const gateControlsData: Ref<GateControlItem[]> = ref([]);
export const patrolCamerasData: Ref<PatrolCameraItem[]> = ref([]);
export const securityLoading = ref(false);

let loaded = false;
let inflight: Promise<void> | null = null;

/** 拉取安全防恐三列表真实数据（仅首次真正发起请求，之后复用加载结果）。 */
export function refreshSecurityData(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (inflight) return inflight;
  securityLoading.value = true;
  // 任一列表失败不影响其余；Promise.allSettled 保证不因单点失败而整体 reject。
  inflight = Promise.allSettled([fetchBollards(), fetchGateControls(), fetchPatrolCameras()])
    .then(([b, g, p]) => {
      if (b.status === 'fulfilled') bollardsData.value = b.value;
      if (g.status === 'fulfilled') gateControlsData.value = g.value;
      if (p.status === 'fulfilled') patrolCamerasData.value = p.value;
      loaded = true;
    })
    .finally(() => {
      securityLoading.value = false;
      inflight = null;
    });
  return inflight;
}
