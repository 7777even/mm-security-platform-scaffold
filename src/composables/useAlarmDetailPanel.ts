import { ref } from 'vue';
import type { AlarmDetailItem } from '@/services/map-data/alarmDetailMock';

export type AlarmDetailFocus = 'disposal';

export interface AlarmMapTarget {
  id: string;
  title: string;
  location: string;
  longitude: number;
  latitude: number;
}

const open = ref(false);
const detail = ref<AlarmDetailItem | null>(null);
const mapTarget = ref<AlarmMapTarget | null>(null);
const focusSection = ref<AlarmDetailFocus | null>(null);

export function useAlarmDetailPanel() {
  function openAlarmDetail(item: AlarmDetailItem, focus: AlarmDetailFocus | null = null) {
    detail.value = {
      ...item,
      timeline: [...item.timeline],
      dispatchPersonnel: [...item.dispatchPersonnel],
      attachments: [...item.attachments],
    };
    open.value = true;
    focusSection.value = focus;
    mapTarget.value = {
      id: item.id,
      title: item.title,
      location: item.location,
      longitude: item.longitude,
      latitude: item.latitude,
    };
  }

  function closeAlarmDetail() {
    open.value = false;
    mapTarget.value = null;
    focusSection.value = null;
  }

  function patchAlarmDetail(partial: Partial<AlarmDetailItem>) {
    if (!detail.value) return;
    detail.value = { ...detail.value, ...partial };
  }

  function reflyAlarmTarget() {
    if (mapTarget.value) {
      mapTarget.value = { ...mapTarget.value };
    }
  }

  return {
    alarmDetailOpen: open,
    activeAlarmDetail: detail,
    alarmMapTarget: mapTarget,
    alarmDetailFocus: focusSection,
    openAlarmDetail,
    closeAlarmDetail,
    patchAlarmDetail,
    reflyAlarmTarget,
  };
}
