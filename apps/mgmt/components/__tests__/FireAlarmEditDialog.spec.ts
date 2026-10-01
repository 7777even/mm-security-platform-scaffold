// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FireAlarmEditDialog from '../FireAlarmEditDialog.vue';

const { createFireAlarm, updateFireAlarm } = vi.hoisted(() => ({
  createFireAlarm: vi.fn(),
  updateFireAlarm: vi.fn(),
}));

// 保留真实模块（含下拉选项常量），仅覆盖两个写接口
vi.mock('@/services/alarm', async () => {
  const actual = await vi.importActual<typeof import('@/services/alarm')>('@/services/alarm');
  return {
    ...actual,
    createFireAlarm: (...args: unknown[]) => createFireAlarm(...args),
    updateFireAlarm: (...args: unknown[]) => updateFireAlarm(...args),
  };
});

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
    // 直接驱动表单（时间已改为 el-date-picker，靠 DOM 索引不可靠）
    wrapper.vm.form.title = '联动测试报警';
    wrapper.vm.form.time = '2026-10-01 21:00:00';
    await flushPromises();
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
    // watch(editRow, immediate) 已把表单预填
    expect(wrapper.vm.form.alarmId).toBe('FA-1');
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
    wrapper.vm.form.title = '联动测试报警';
    wrapper.vm.form.time = '2026-10-01 21:00:00';
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted('saved')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('通知方式多选拼成逗号串写入 payload', async () => {
    const wrapper = mount(FireAlarmEditDialog, {
      props: { modelValue: true, editRow: null },
    });
    await flushPromises();
    wrapper.vm.form.title = '联动测试报警';
    wrapper.vm.form.time = '2026-10-01 21:00:00';
    wrapper.vm.notifyMethods = ['APP', 'SMS'];
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const payload = createFireAlarm.mock.calls[0]?.[0] as { notifyMethod?: string };
    expect(payload?.notifyMethod).toBe('APP,SMS');
  });
});
