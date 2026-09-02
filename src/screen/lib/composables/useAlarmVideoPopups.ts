import { computed, ref } from 'vue';
import type { AlarmItem } from '../data/mock';

export interface AlarmVideoPopupCamera {
  id: string;
  name: string;
  role: string;
}

const activeAlarm = ref<AlarmItem | null>(null);
const hiddenCameraIds = ref<string[]>([]);

export const alarmVideoPopupsOpen = computed(() => activeAlarm.value !== null);
export const alarmVideoPopupAlarm = computed(() => activeAlarm.value);
export const alarmVideoPopupCameras = computed<AlarmVideoPopupCamera[]>(() => {
  if (!activeAlarm.value) return [];
  const alarm = activeAlarm.value;
  return [
    { id: alarm.onsiteMonitorId, name: alarm.onsiteMonitorLabel, role: '告警点最近' },
    { id: alarm.monitorId, name: alarm.monitorLabel, role: '周边联动' },
  ].filter((camera) => camera.id && !hiddenCameraIds.value.includes(camera.id));
});

export function openAlarmVideoPopups(alarm: AlarmItem) {
  activeAlarm.value = alarm;
  hiddenCameraIds.value = [];
}

export function closeAlarmVideoPopup(cameraId: string) {
  hiddenCameraIds.value = [...hiddenCameraIds.value, cameraId];
  if (alarmVideoPopupCameras.value.length === 0) activeAlarm.value = null;
}

export function closeAllAlarmVideoPopups() {
  activeAlarm.value = null;
  hiddenCameraIds.value = [];
}
