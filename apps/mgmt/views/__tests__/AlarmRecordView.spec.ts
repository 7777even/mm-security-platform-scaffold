// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AlarmRecordView from '../alarm/AlarmRecordView.vue';

const { fetchFireAlarmPage, deleteFireAlarm, subscribeDomainChange, unsub, confirmMock } =
  vi.hoisted(() => ({
    fetchFireAlarmPage: vi.fn(),
    deleteFireAlarm: vi.fn(),
    subscribeDomainChange: vi.fn(),
    unsub: vi.fn(),
    confirmMock: vi.fn(),
  }));

vi.mock('@/services/alarm', () => ({
  fetchFireAlarmPage: (...args: unknown[]) => fetchFireAlarmPage(...args),
  deleteFireAlarm: (...args: unknown[]) => deleteFireAlarm(...args),
}));
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

beforeEach(() => {
  subscribeDomainChange.mockReturnValue(unsub);
  fetchFireAlarmPage.mockResolvedValue({ list: [], total: 0, page: 1, size: 10 });
  deleteFireAlarm.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('AlarmRecordView 实时订阅与删除', () => {
  it('挂载时订阅 fire-alarm.alarm 域变更', () => {
    mount(AlarmRecordView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('fire-alarm.alarm', expect.any(Function));
  });

  it('卸载时退订', () => {
    const wrapper = mount(AlarmRecordView);
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('点击删除并经确认后调用 deleteFireAlarm', async () => {
    fetchFireAlarmPage.mockResolvedValue({
      list: [{ alarmId: 'FA-9', title: '测试报警', time: '2026-10-01 09:00:00', status: 'ACTIVE' }],
      total: 1,
      page: 1,
      size: 10,
    });
    const wrapper = mount(AlarmRecordView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const delBtn = wrapper.findAll('button').find((b) => b.text() === '删除');
    expect(delBtn).toBeTruthy();
    await delBtn!.trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteFireAlarm).toHaveBeenCalledWith('FA-9');
  });
});
