import {
  fetchCommunicationDevices,
  type CommunicationDeviceGroups,
} from '@/services/communication';
import {
  backendUnavailableWarn,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

export type CommunicationTab = 'broadcast' | 'phone' | 'intercom';

export interface CommunicationDevice {
  id: string;
  type: 'broadcast' | 'phone' | 'intercom';
  name: string;
  area: string;
  location: string;
  status: '在线' | '离线' | '故障';
  longitude: number;
  latitude: number;
  detail: {
    category: string;
    installTime: string;
    owner: string;
    ip: string;
    lastCheck: string;
  };
}

export interface CommunicationGroup {
  key: string;
  label: string;
  devices: CommunicationDevice[];
}

export const communicationDeviceGroups: Record<CommunicationTab, CommunicationGroup[]> = {
  broadcast: [
    {
      key: 'area-a',
      label: 'A装置区 (6)',
      devices: [
        {
          id: 'bc-a1',
          type: 'broadcast',
          name: 'A装置区1#广播',
          area: 'A装置区',
          location: 'A装置区东北角',
          status: '在线',
          longitude: 110.881,
          latitude: 21.671,
          detail: {
            category: '室外防爆广播',
            installTime: '2024-03-12',
            owner: '安环部',
            ip: '10.20.31.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
        {
          id: 'bc-a2',
          type: 'broadcast',
          name: 'A装置区2#广播',
          area: 'A装置区',
          location: 'A装置区西南角',
          status: '在线',
          longitude: 110.879,
          latitude: 21.669,
          detail: {
            category: '室外防爆广播',
            installTime: '2024-03-12',
            owner: '安环部',
            ip: '10.20.31.102',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
        {
          id: 'bc-a3',
          type: 'broadcast',
          name: 'A装置区3#广播',
          area: 'A装置区',
          location: 'A装置区北侧',
          status: '故障',
          longitude: 110.882,
          latitude: 21.672,
          detail: {
            category: '室外防爆广播',
            installTime: '2024-05-20',
            owner: '安环部',
            ip: '10.20.31.103',
            lastCheck: '2026-08-09 20:15:00',
          },
        },
      ],
    },
    {
      key: 'area-b',
      label: 'B装置区 (2)',
      devices: [
        {
          id: 'bc-b1',
          type: 'broadcast',
          name: 'B装置区1#广播',
          area: 'B装置区',
          location: 'B装置区东侧',
          status: '在线',
          longitude: 110.886,
          latitude: 21.668,
          detail: {
            category: '室外防爆广播',
            installTime: '2024-06-01',
            owner: '安环部',
            ip: '10.20.32.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
        {
          id: 'bc-b2',
          type: 'broadcast',
          name: 'B装置区2#广播',
          area: 'B装置区',
          location: 'B装置区西侧',
          status: '离线',
          longitude: 110.884,
          latitude: 21.667,
          detail: {
            category: '室外防爆广播',
            installTime: '2024-06-01',
            owner: '安环部',
            ip: '10.20.32.102',
            lastCheck: '2026-08-08 18:00:00',
          },
        },
      ],
    },
    {
      key: 'public',
      label: '公共区 (1)',
      devices: [
        {
          id: 'bc-p1',
          type: 'broadcast',
          name: '厂区大门广播',
          area: '公共区',
          location: '厂区大门西侧',
          status: '在线',
          longitude: 110.878,
          latitude: 21.674,
          detail: {
            category: '室内广播',
            installTime: '2024-02-10',
            owner: '综合部',
            ip: '10.20.30.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
      ],
    },
  ],
  phone: [
    {
      key: 'area-a',
      label: 'A装置区 (2)',
      devices: [
        {
          id: 'ph-a1',
          type: 'phone',
          name: 'A装置区1#电话',
          area: 'A装置区',
          location: 'A装置区控制室',
          status: '在线',
          longitude: 110.881,
          latitude: 21.671,
          detail: {
            category: '防爆电话',
            installTime: '2023-11-18',
            owner: '生产部',
            ip: '10.20.41.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
        {
          id: 'ph-a2',
          type: 'phone',
          name: 'A装置区2#电话',
          area: 'A装置区',
          location: 'A装置区东北角',
          status: '在线',
          longitude: 110.882,
          latitude: 21.672,
          detail: {
            category: '防爆电话',
            installTime: '2023-11-18',
            owner: '生产部',
            ip: '10.20.41.102',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
      ],
    },
    {
      key: 'area-b',
      label: 'B装置区 (1)',
      devices: [
        {
          id: 'ph-b1',
          type: 'phone',
          name: 'B装置区1#电话',
          area: 'B装置区',
          location: 'B装置区控制室',
          status: '在线',
          longitude: 110.885,
          latitude: 21.668,
          detail: {
            category: '防爆电话',
            installTime: '2024-01-08',
            owner: '生产部',
            ip: '10.20.42.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
      ],
    },
  ],
  intercom: [
    {
      key: 'area-a',
      label: 'A装置区 (2)',
      devices: [
        {
          id: 'ic-a1',
          type: 'intercom',
          name: 'A装置区1#对讲',
          area: 'A装置区',
          location: 'A装置区巡检点1',
          status: '在线',
          longitude: 110.88,
          latitude: 21.67,
          detail: {
            category: 'IP对讲终端',
            installTime: '2024-07-15',
            owner: '安环部',
            ip: '10.20.51.101',
            lastCheck: '2026-08-10 08:30:00',
          },
        },
        {
          id: 'ic-a2',
          type: 'intercom',
          name: 'A装置区2#对讲',
          area: 'A装置区',
          location: 'A装置区巡检点2',
          status: '故障',
          longitude: 110.883,
          latitude: 21.67,
          detail: {
            category: 'IP对讲终端',
            installTime: '2024-07-15',
            owner: '安环部',
            ip: '10.20.51.102',
            lastCheck: '2026-08-09 22:00:00',
          },
        },
      ],
    },
  ],
};

export function getCommunicationDevice(id: string | null) {
  if (!id) return null;
  for (const groups of Object.values(communicationDeviceGroups)) {
    for (const group of groups) {
      const found = group.devices.find((d) => d.id === id);
      if (found) return found;
    }
  }
  return null;
}

/** 通讯设备分组：demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态。 */
export async function loadCommunicationDevices(): Promise<CommunicationDeviceGroups> {
  const fb = resolveOfflineFetch(
    'communication',
    '/communication/devices',
    communicationDeviceGroups,
    {
      broadcast: [],
      phone: [],
      intercom: [],
    } as CommunicationDeviceGroups,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await fetchCommunicationDevices();
    if (!data || !data.broadcast || !data.phone || !data.intercom) {
      backendUnavailableWarn('communication', '/communication/devices', REASON_CONTRACT_MISMATCH);
      return { broadcast: [], phone: [], intercom: [] };
    }
    return data;
  } catch {
    backendUnavailableWarn('communication', '/communication/devices');
    return { broadcast: [], phone: [], intercom: [] };
  }
}
