import { ref } from 'vue';

export type FireEmergencyListTab = 'event' | 'drill';

export const fireEmergencyListTab = ref<FireEmergencyListTab>('event');

export function setFireEmergencyListTab(tab: FireEmergencyListTab) {
  fireEmergencyListTab.value = tab;
}
