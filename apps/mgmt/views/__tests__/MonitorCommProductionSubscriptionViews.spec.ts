// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import type { Component } from 'vue';
import VideoMgmtView from '../monitor/VideoMgmtView.vue';
import VideoHealthView from '../monitor/VideoHealthView.vue';
import BroadcastDeviceView from '../monitor/BroadcastDeviceView.vue';
import PhoneMgmtView from '../monitor/PhoneMgmtView.vue';
import RadioMgmtView from '../monitor/RadioMgmtView.vue';
import MonitorPointView from '../monitor/MonitorPointView.vue';
import CommRecordView from '../comm/CommRecordView.vue';
import DeviceView from '../production/DeviceView.vue';
import HazardMgmtView from '../production/HazardMgmtView.vue';
import SpecialOpsView from '../production/SpecialOpsView.vue';

// 监测 / 通信 / 生产三批共 11 个视图组件的实时订阅接线：
// 每个视图都应在挂载时订阅后端 @RealtimeSync 的对应域，卸载时退订，
// 且收到广播回调后要重新拉取列表（而非只在上架时拉一次）。

const {
  fetchVideoCameras,
  fetchCommunicationDevices,
  fetchCommunicationRecords,
  fetchDevicePage,
  fetchMajorHazards,
  fetchMonitoringPoints,
  fetchSpecialOperations,
  subscribeDomainChange,
  unsub,
} = vi.hoisted(() => ({
  fetchVideoCameras: vi.fn(),
  fetchCommunicationDevices: vi.fn(),
  fetchCommunicationRecords: vi.fn(),
  fetchDevicePage: vi.fn(),
  fetchMajorHazards: vi.fn(),
  fetchMonitoringPoints: vi.fn(),
  fetchSpecialOperations: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
}));

vi.mock('@/services/video', () => ({
  fetchVideoCameras: (...args: unknown[]) => fetchVideoCameras(...args),
}));
vi.mock('@/services/communication', () => ({
  fetchCommunicationDevices: (...args: unknown[]) => fetchCommunicationDevices(...args),
  fetchCommunicationRecords: (...args: unknown[]) => fetchCommunicationRecords(...args),
}));
vi.mock('@/services/device', () => ({
  fetchDevicePage: (...args: unknown[]) => fetchDevicePage(...args),
}));
vi.mock('@/services/hazard', () => ({
  fetchMajorHazards: (...args: unknown[]) => fetchMajorHazards(...args),
  fetchMonitoringPoints: (...args: unknown[]) => fetchMonitoringPoints(...args),
}));
vi.mock('@/services/specialOperation', () => ({
  fetchSpecialOperations: (...args: unknown[]) => fetchSpecialOperations(...args),
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
// CommRecordView 用当前路由决定记录类型
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/comm-sms', params: {}, query: {} }),
}));

async function mountLoaded(component: Component): Promise<VueWrapper> {
  const wrapper = mount(component, {
    global: { stubs: { MgmtProTable: true, MgmtPageHead: true } },
  });
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
  subscribeDomainChange.mockReturnValue(unsub);
  fetchVideoCameras.mockResolvedValue({ list: [], total: 0 });
  fetchCommunicationDevices.mockResolvedValue({ broadcast: [], phone: [], intercom: [] });
  fetchCommunicationRecords.mockResolvedValue({ items: [], total: 0 });
  fetchDevicePage.mockResolvedValue({ list: [], total: 0 });
  fetchMajorHazards.mockResolvedValue([]);
  fetchMonitoringPoints.mockResolvedValue([]);
  fetchSpecialOperations.mockResolvedValue({ list: [], total: 0 });
});

describe('视频监控域（video.camera）订阅', () => {
  it('VideoMgmtView 挂载订阅 video.camera，卸载退订', async () => {
    const wrapper = await mountLoaded(VideoMgmtView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('video.camera', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('VideoHealthView 与列表页同域订阅，卸载退订', async () => {
    const wrapper = await mountLoaded(VideoHealthView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('video.camera', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('收到广播回调后重新拉取摄像头列表', async () => {
    await mountLoaded(VideoMgmtView);
    const callsBefore = fetchVideoCameras.mock.calls.length;
    const callback = subscribeDomainChange.mock.calls[0][1] as () => void;
    callback();
    await flushPromises();
    expect(fetchVideoCameras.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});

describe('通讯设备域（communication.device）订阅', () => {
  const cases: Array<[string, Component]> = [
    ['BroadcastDeviceView', BroadcastDeviceView],
    ['PhoneMgmtView', PhoneMgmtView],
    ['RadioMgmtView', RadioMgmtView],
  ];

  it.each(cases)('%s 挂载订阅 communication.device，卸载退订', async (_name, component) => {
    const wrapper = await mountLoaded(component);
    expect(subscribeDomainChange).toHaveBeenCalledWith(
      'communication.device',
      expect.any(Function),
    );
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('广播回调触发通讯设备重拉', async () => {
    await mountLoaded(BroadcastDeviceView);
    const callsBefore = fetchCommunicationDevices.mock.calls.length;
    const callback = subscribeDomainChange.mock.calls[0][1] as () => void;
    callback();
    await flushPromises();
    expect(fetchCommunicationDevices.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});

describe('通讯记录域（communication.record）订阅', () => {
  it('CommRecordView 挂载订阅 communication.record，卸载退订', async () => {
    const wrapper = await mountLoaded(CommRecordView);
    expect(subscribeDomainChange).toHaveBeenCalledWith(
      'communication.record',
      expect.any(Function),
    );
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});

describe('设备台账域（device）订阅', () => {
  it('DeviceView 挂载订阅 device，卸载退订', async () => {
    const wrapper = await mountLoaded(DeviceView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('device', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});

describe('危险源与监测点位域（hazard / hazard.point）订阅', () => {
  it('HazardMgmtView 挂载订阅 hazard，卸载退订', async () => {
    const wrapper = await mountLoaded(HazardMgmtView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('hazard', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('MonitorPointView 挂载订阅 hazard.point，卸载退订', async () => {
    const wrapper = await mountLoaded(MonitorPointView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('hazard.point', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('两个域相互独立，不会串到对方通道', async () => {
    await mountLoaded(HazardMgmtView);
    const domains = subscribeDomainChange.mock.calls.map((call) => call[0]);
    expect(domains).not.toContain('hazard.point');
    expect(new Set(domains).size).toBe(1);
  });
});

describe('特殊作业域（special-operation）订阅', () => {
  it('SpecialOpsView 挂载订阅 special-operation，卸载退订', async () => {
    const wrapper = await mountLoaded(SpecialOpsView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('special-operation', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('广播回调重拉时保留当前过滤条件下的分页参数', async () => {
    await mountLoaded(SpecialOpsView);
    const queryBefore = fetchSpecialOperations.mock.calls[0][0] as Record<string, unknown>;
    const callback = subscribeDomainChange.mock.calls[0][1] as () => void;
    callback();
    await flushPromises();
    const queryAfter = fetchSpecialOperations.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(queryAfter).toEqual(queryBefore);
  });
});
