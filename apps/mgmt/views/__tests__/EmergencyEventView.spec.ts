// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EmergencyEventView from '../emergency/EmergencyEventView.vue';
import type { VueWrapper } from '@vue/test-utils';

const {
  fetchEmergencyEvents,
  createEmergencyEvent,
  updateEmergencyEvent,
  deleteEmergencyEvent,
  subscribeDomainChange,
  unsub,
  confirmMock,
} = vi.hoisted(() => ({
  fetchEmergencyEvents: vi.fn(),
  createEmergencyEvent: vi.fn(),
  updateEmergencyEvent: vi.fn(),
  deleteEmergencyEvent: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@/services/emergencyEvent', () => ({
  fetchEmergencyEvents: (...args: unknown[]) => fetchEmergencyEvents(...args),
  createEmergencyEvent: (...args: unknown[]) => createEmergencyEvent(...args),
  updateEmergencyEvent: (...args: unknown[]) => updateEmergencyEvent(...args),
  deleteEmergencyEvent: (...args: unknown[]) => deleteEmergencyEvent(...args),
  EMERGENCY_EVENT_STATUS_OPTIONS: [
    { label: '未处置', value: 'pending' },
    { label: '处置中', value: 'processing' },
    { label: '已处置', value: 'done' },
  ],
  EMERGENCY_EVENT_TYPE_DEFS: {
    突发应急事件: {
      kind: 'event',
      eventCategory: 'default',
      groupCode: 'manual-event',
      groupLabel: '突发应急事件',
    },
    储罐消防报警: {
      kind: 'event',
      eventCategory: 'default',
      groupCode: 'tank',
      groupLabel: '储罐消防报警',
    },
  },
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

const EVENT_ROW = {
  id: 26,
  areaCode: 'refinery',
  title: '乙烯裂解炉泄漏',
  location: '化工区乙烯裂解装置东北侧',
  description: '现场报告裂解炉炉管疑似泄漏并伴有明火',
  time: '2026-03-17 14:21:54',
  reported: true,
  status: 'pending',
  statusLabel: '未处置',
  left: '47.1%',
  top: '22.6%',
  longitude: 110.88071,
  latitude: 21.684459,
  kind: 'event',
  eventCategory: 'default',
  hazardSourceLevel: '较大',
  endedAt: null,
  weatherMeta: null,
};

/** 找到弹窗里的「保存」按钮（组件内 footer 固定文案）。 */
function findSave(wrapper: VueWrapper) {
  const btn = wrapper.findAll('button').find((b) => b.text() === '保存');
  expect(btn).toBeTruthy();
  return btn!;
}

function findBtnByText(wrapper: VueWrapper, text: string) {
  const btn = wrapper.findAll('button').find((b) => b.text() === text);
  expect(btn).toBeTruthy();
  return btn!;
}

beforeEach(() => {
  vi.clearAllMocks();
  subscribeDomainChange.mockReturnValue(unsub);
  fetchEmergencyEvents.mockResolvedValue([
    { id: 'tank', label: '储罐消防报警', events: [EVENT_ROW] },
  ]);
  createEmergencyEvent.mockResolvedValue(EVENT_ROW);
  updateEmergencyEvent.mockResolvedValue(EVENT_ROW);
  deleteEmergencyEvent.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('EmergencyEventView 实时订阅与 CRUD', () => {
  it('挂载时订阅 emergency.event 域变更', () => {
    mount(EmergencyEventView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('emergency.event', expect.any(Function));
  });

  it('卸载时退订', () => {
    const wrapper = mount(EmergencyEventView);
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('点击删除并经确认后调用 deleteEmergencyEvent', async () => {
    const wrapper = mount(EmergencyEventView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    await findBtnByText(wrapper, '删除').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteEmergencyEvent).toHaveBeenCalledWith(26);
  });

  it('编辑保存：映射 left/top/time 回表单字段，提交体不含 eventType', async () => {
    const wrapper = mount(EmergencyEventView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));

    await findBtnByText(wrapper, '编辑').trigger('click');
    await flushPromises();

    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    expect(dialog.exists()).toBe(true);
    // 编辑态字段名映射：契约 left/top/time → 表单 leftPercent/topPercent/eventTime
    expect((dialog.vm as unknown as { form: Record<string, unknown> }).form.leftPercent).toBe(
      '47.1%',
    );
    expect((dialog.vm as unknown as { form: Record<string, unknown> }).form.eventTime).toBe(
      '2026-03-17 14:21:54',
    );

    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));

    expect(updateEmergencyEvent).toHaveBeenCalledTimes(1);
    const [id, payload] = updateEmergencyEvent.mock.calls[0] as [number, Record<string, unknown>];
    expect(id).toBe(26);
    // 关键：update 请求不能带 create 专属字段，否则后端 DTO 解析失败
    expect(payload).not.toHaveProperty('eventType');
    expect(payload).not.toHaveProperty('scene');
    expect(payload.title).toBe('乙烯裂解炉泄漏');
  });

  it('新增保存：事件类型展开为 kind/eventCategory/groupCode/groupLabel', async () => {
    const wrapper = mount(EmergencyEventView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));

    await findBtnByText(wrapper, '新增事件').trigger('click');
    await flushPromises();

    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    const form = (dialog.vm as unknown as { form: Record<string, unknown> }).form;
    Object.assign(form, {
      scene: 'FIRE',
      eventType: '储罐消防报警',
      title: '罐区泄漏',
      location: '罐区 T-301',
      description: '对拍脚本创建',
      eventTime: '2026-10-02 00:20:00',
      leftPercent: '48.3%',
      topPercent: '36.1%',
      longitude: 110.123456,
      latitude: 21.654321,
    });
    await flushPromises();

    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));

    expect(createEmergencyEvent).toHaveBeenCalledTimes(1);
    const payload = createEmergencyEvent.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.kind).toBe('event');
    expect(payload.eventCategory).toBe('default');
    expect(payload.groupCode).toBe('tank');
    expect(payload.groupLabel).toBe('储罐消防报警');
    expect(payload).not.toHaveProperty('eventType');
  });
});
