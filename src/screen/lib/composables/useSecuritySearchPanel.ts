import { computed, nextTick, ref } from 'vue';
import { closeSecuritySearchDetail } from './useSecuritySearchDetail';
import { closePatrolCameraListView } from './usePatrolCameraListView';
import { bollardDrawerActive, closeBollardList, openBollardList } from './useBollardListView';
import {
  gateControlDrawerActive,
  closeGateControlList,
  openGateControlList,
} from './useGateControlListView';
import { showToast } from './useToast';
import { openBlacklistDialog } from './useBlacklistDialog';

export type SecuritySearchPanelMode = 'vehicle' | 'person';

export const securitySearchPanelMode = ref<SecuritySearchPanelMode | null>(null);

/** 列表切换过渡中保持抽屉层激活，避免侧栏闪回 */
const securitySearchListSwitching = ref(false);

export const securitySearchDrawerActive = computed(
  () => securitySearchPanelMode.value !== null || securitySearchListSwitching.value,
);

async function setSearchMode(mode: SecuritySearchPanelMode) {
  if (securitySearchPanelMode.value === mode) {
    closeSecuritySearchDetail();
    securitySearchPanelMode.value = null;
    return;
  }

  if (securitySearchPanelMode.value != null) {
    closeSecuritySearchDetail();
    securitySearchListSwitching.value = true;
    securitySearchPanelMode.value = null;
    await nextTick();
    securitySearchPanelMode.value = mode;
    await nextTick();
    securitySearchListSwitching.value = false;
    return;
  }

  securitySearchPanelMode.value = mode;
}

export function openVehicleSearch() {
  void setSearchMode('vehicle');
}

export function openPersonSearch() {
  void setSearchMode('person');
}

/** 打开指定模式的检索列表（不切换关闭） */
export function openSearchPanelForMode(mode: SecuritySearchPanelMode) {
  securitySearchPanelMode.value = mode;
}

export function closeSearchPanel() {
  closeSecuritySearchDetail();
  securitySearchPanelMode.value = null;
}

export function onToolbarAction(key: string) {
  if (key === 'vehicleSearch') {
    closePatrolCameraListView();
    closeBollardList();
    closeGateControlList();
    openVehicleSearch();
  } else if (key === 'personSearch') {
    closePatrolCameraListView();
    closeBollardList();
    closeGateControlList();
    openPersonSearch();
  } else if (key === 'bollard') {
    closePatrolCameraListView();
    closeSecuritySearchDetail();
    securitySearchPanelMode.value = null;
    closeGateControlList();
    if (bollardDrawerActive.value) closeBollardList();
    else openBollardList();
  } else if (key === 'gate') {
    closePatrolCameraListView();
    closeSecuritySearchDetail();
    securitySearchPanelMode.value = null;
    closeBollardList();
    if (gateControlDrawerActive.value) closeGateControlList();
    else openGateControlList();
  } else if (key === 'drone') {
    showToast('跳转无人机平台');
  } else if (key === 'comm') {
    showToast('跳转设备通讯页面');
  } else if (key === 'meeting') {
    showToast('弹出融合通讯插件/页面');
  } else if (key === 'blacklist') {
    openBlacklistDialog();
  }
}

export function isToolbarActive(key: string) {
  if (key === 'vehicleSearch') return securitySearchPanelMode.value === 'vehicle';
  if (key === 'personSearch') return securitySearchPanelMode.value === 'person';
  return false;
}

export function useSecuritySearchPanel() {
  return {
    securitySearchPanelMode,
    securitySearchDrawerActive,
    openVehicleSearch,
    openPersonSearch,
    openSearchPanelForMode,
    closeSearchPanel,
    onToolbarAction,
    isToolbarActive,
  };
}
