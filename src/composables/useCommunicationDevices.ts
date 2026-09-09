import { computed, ref } from 'vue';
import {
  communicationDeviceGroups,
  loadCommunicationDevices,
} from '@/services/map-data/communicationDeviceMock';
import {
  type CommunicationDevice,
  type CommunicationDeviceGroups,
  type CommunicationTab,
} from '@/services/communication';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea, matchesPlantArea } = usePlantArea();

export const communicationTab = ref<CommunicationTab>('broadcast');
export const selectedDeviceId = ref<string | null>(null);
export const communicationDrawerOpen = ref(false);

export const deviceGroups = ref<CommunicationDeviceGroups>(communicationDeviceGroups);

export const selectedDevice = computed<CommunicationDevice | null>(() => {
  if (!selectedDeviceId.value) return null;
  const all = Object.values(deviceGroups.value).flatMap((groups) =>
    groups.flatMap((g) => g.devices),
  );
  const device = all.find((d) => d.id === selectedDeviceId.value) ?? null;
  return device && matchesPlantArea(device) ? device : null;
});

export const activeGroups = computed(() =>
  (deviceGroups.value[communicationTab.value] ?? [])
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
  void loadCommunicationDevices().then((groups) => {
    deviceGroups.value = groups;
  });
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
