import { computed, ref } from 'vue';
import {
  fetchCommunicationDevices,
  type CommunicationTab,
  type CommunicationGroup,
} from '@/services/communication';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea, matchesPlantArea } = usePlantArea();

export const communicationTab = ref<CommunicationTab>('broadcast');
export const selectedDeviceId = ref<string | null>(null);
export const communicationDrawerOpen = ref(false);

// 后端返回的三组结构（broadcast / phone / intercom），按 tab 切到对应数组。
const communicationDeviceGroups = ref<Record<CommunicationTab, CommunicationGroup[]>>({
  broadcast: [],
  phone: [],
  intercom: [],
});

// 模块级 immediate fetch：回填设备分组，依赖组件零改动。
fetchCommunicationDevices()
  .then((data) => {
    communicationDeviceGroups.value = data;
  })
  .catch(() => {});

function getCommunicationDevice(id: string | null) {
  if (!id) return null;
  for (const groups of Object.values(communicationDeviceGroups.value)) {
    for (const group of groups) {
      const found = group.devices.find((d) => d.id === id);
      if (found) return found;
    }
  }
  return null;
}

export const selectedDevice = computed(() => {
  const device = getCommunicationDevice(selectedDeviceId.value);
  return device && matchesPlantArea(device) ? device : null;
});

export const activeGroups = computed(() =>
  (communicationDeviceGroups.value[communicationTab.value] ?? [])
    .map((group) => {
      const devices = filterByPlantArea(group.devices);
      return {
        ...group,
        label: group.label.replace(/\s*\(\d+\)$/, ` (${devices.length})`),
        devices,
      };
    })
    .filter((group) => group.devices.length > 0),
);

export const allDevices = computed(() => activeGroups.value.flatMap((group) => group.devices));

export function selectCommunicationDevice(id: string | null) {
  selectedDeviceId.value = id;
}

export function openCommunicationDevices() {
  communicationDrawerOpen.value = true;
}

export function closeCommunicationDevices() {
  communicationDrawerOpen.value = false;
  selectedDeviceId.value = null;
}

export function switchCommunicationTab(tab: CommunicationTab) {
  communicationTab.value = tab;
  selectedDeviceId.value = null;
}

export function useCommunicationDevices() {
  return {
    communicationTab,
    selectedDeviceId,
    selectedDevice,
    activeGroups,
    communicationDrawerOpen,
    selectCommunicationDevice,
    openCommunicationDevices,
    closeCommunicationDevices,
    switchCommunicationTab,
  };
}
