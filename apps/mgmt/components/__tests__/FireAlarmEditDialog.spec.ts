// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FireAlarmEditDialog from '../FireAlarmEditDialog.vue';

const { createFireAlarm, updateFireAlarm } = vi.hoisted(() => ({
  createFireAlarm: vi.fn(),
  updateFireAlarm: vi.fn(),
}));

vi.mock('@/services/alarm', () => ({
  createFireAlarm: (...args: unknown[]) => createFireAlarm(...args),
  updateFireAlarm: (...args: unknown[]) => updateFireAlarm(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  createFireAlarm.mockResolvedValue({ alarmId: 'FA-NEW', title: 'x', time: 't' });
  updateFireAlarm.mockResolvedValue({ alarmId: 'FA-1', title: 'x', time: 't' });
});

function findSave(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text() === '保存')!;
}

describe('FireAlarmEditDialog', () => {
  it('新增模式：必填校验失败时不调用任何写接口', async () => {
    const wrapper = mount(FireAlarmEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    expect(createFireAlarm).not.toHaveBeenCalled();
    expect(updateFireAlarm).not.toHaveBeenCalled();
  });

  it('新增模式：填必填项后保存调用 createFireAlarm', async () => {
    const wrapper = mount(FireAlarmEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    const inputs = wrapper.findAll('input');
    // 表单顺序：title(0) / time(1) 为必填；其余 el-select 也渲染 input，但前两个必为 title/time。
    await inputs[0]!.setValue('联动测试报警');
    await inputs[1]!.setValue('2026-10-01 21:00:00');
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(createFireAlarm).toHaveBeenCalledTimes(1);
    expect(updateFireAlarm).not.toHaveBeenCalled();
  });

  it('编辑模式：editRow 带 alarmId 时保存调用 updateFireAlarm', async () => {
    const wrapper = mount(FireAlarmEditDialog, {
      props: {
        modelValue: true,
        editRow: {
          alarmId: 'FA-1',
          title: '原报警',
          time: '2026-10-01 09:00:00',
          status: 'ACTIVE',
        },
      },
    });
    await flushPromises();
    // watch(editRow, immediate) 已把表单预填，校验可通过
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(updateFireAlarm).toHaveBeenCalledTimes(1);
    expect(updateFireAlarm).toHaveBeenCalledWith('FA-1', expect.any(Object));
    expect(createFireAlarm).not.toHaveBeenCalled();
  });

  it('保存成功后派发 saved 与 update:modelValue(false)', async () => {
    const wrapper = mount(FireAlarmEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue('联动测试报警');
    await inputs[1]!.setValue('2026-10-01 21:00:00');
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted('saved')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
