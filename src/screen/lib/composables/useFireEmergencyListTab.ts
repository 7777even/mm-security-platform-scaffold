import { ref } from 'vue';
import { EMERGENCY_EVENT_TYPE_OPTIONS } from '@/services/emergencyEvent';

/** 侧栏分类 Tab 现为「事件类型」字符串（如 突发应急事件 / 演练事件 / 预警事件 / 极端天气事件）。 */
export type FireEmergencyListTab = string;

export const DEFAULT_FIRE_EMERGENCY_TAB: string = EMERGENCY_EVENT_TYPE_OPTIONS[0];

export const fireEmergencyListTab = ref<string>(DEFAULT_FIRE_EMERGENCY_TAB);

export function setFireEmergencyListTab(tab: string) {
  fireEmergencyListTab.value = tab;
}
