import { ref } from 'vue';

/** 侧栏分类 Tab：仅「应急事件 / 应急演练」两级（事件类型在新增弹窗内选择）。 */
export type FireEmergencyListTab = 'event' | 'drill';

export const DEFAULT_FIRE_EMERGENCY_TAB: FireEmergencyListTab = 'event';

export const fireEmergencyListTab = ref<FireEmergencyListTab>(DEFAULT_FIRE_EMERGENCY_TAB);

export function setFireEmergencyListTab(tab: FireEmergencyListTab) {
  fireEmergencyListTab.value = tab;
}
