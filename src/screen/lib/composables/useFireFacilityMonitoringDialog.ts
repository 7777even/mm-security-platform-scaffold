import { ref } from 'vue';

export type FireFacilityDialogTab = 'monitor' | 'problem' | 'workorder';

const open = ref(false);
const activeTab = ref<FireFacilityDialogTab>('monitor');
const presetFacilityType = ref<string>('全部类型');
const presetKeyword = ref('');
const presetFaultCode = ref<string | null>(null);

export function useFireFacilityMonitoringDialog() {
  function openFireFacilityMonitoring(options?: {
    tab?: FireFacilityDialogTab;
    facilityType?: string;
    keyword?: string;
    faultCode?: string;
  }) {
    presetFacilityType.value = options?.facilityType ?? '全部类型';
    presetKeyword.value = options?.keyword ?? '';
    presetFaultCode.value = options?.faultCode ?? null;
    activeTab.value = options?.tab ?? 'monitor';
    open.value = true;
  }

  function closeFireFacilityMonitoring() {
    open.value = false;
  }

  return {
    facilityMonitoringOpen: open,
    facilityMonitoringTab: activeTab,
    facilityMonitoringPresetType: presetFacilityType,
    facilityMonitoringPresetKeyword: presetKeyword,
    facilityMonitoringPresetFaultCode: presetFaultCode,
    openFireFacilityMonitoring,
    closeFireFacilityMonitoring,
  };
}
