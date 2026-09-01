import { computed, ref } from 'vue';
import {
  communicationDeviceGroups,
  getCommunicationDevice,
  type CommunicationTab,
} from '@/services/map-data/communicationDeviceMock';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea, matchesPlantArea } = usePlantArea();

export const communicationTab = ref<CommunicationTab>('broadcast');
export const selectedDeviceId = ref<string | null>(null);
export const communicationDrawerOpen = ref(false);

export const selectedDevice = computed(() => {
  const device = getCommunicationDevice(selectedDeviceId.value);
  return device && matchesPlantArea(device) ? device : null;
});

export const activeGroups = computed(() =>
  (communicationDeviceGroups[communicationTab.value] ?? [])
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
