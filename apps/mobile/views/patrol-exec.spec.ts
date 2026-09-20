// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

// 把写接口与读接口一并 mock，避免测试触达真实后端 / 离线告警。
const mocks = vi.hoisted(() => ({
  createPatrolExecution: vi.fn(),
  fetchPatrolExecutions: vi.fn(),
  fetchFirePatrols: vi.fn(),
}));

vi.mock('@/services/businessWrite', () => ({
  fetchPatrolExecutions: (...a: unknown[]) => mocks.fetchPatrolExecutions(...a),
  createPatrolExecution: (...a: unknown[]) => mocks.createPatrolExecution(...a),
}));

vi.mock('@/services/fireMonitoring', () => ({
  fetchFirePatrols: (...a: unknown[]) => mocks.fetchFirePatrols(...a),
}));

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus');
  return {
    ...actual,
    ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  };
});

import patrolExec from './patrol-exec.vue';

const SAMPLE_PATROL = {
  id: 1,
  patrolDate: '2026-09-20',
  shift: '上午' as const,
  dutyPerson: '张三',
  patrolCount: '5',
  locations: ['罐区A'],
  completed: false,
  checkItems: [{ itemCode: 'c1', category: '设备', content: '灭火器', result: '正常' as const }],
};

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  mocks.createPatrolExecution.mockResolvedValue({ id: 1 });
  mocks.fetchPatrolExecutions.mockResolvedValue([]);
  mocks.fetchFirePatrols.mockResolvedValue([SAMPLE_PATROL]);
});

const mountView = () =>
  mount(patrolExec, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  });

describe('移动端巡查执行页 · 写按钮接线', () => {
  it('挂载后拉取当前巡查任务并渲染检查项与操作按钮', async () => {
    const w = mountView();
    await flushPromises();
    expect(mocks.fetchFirePatrols).toHaveBeenCalled();
    expect(w.find('.patrol-exec__actions').exists()).toBe(true);
    expect(w.text()).toContain('提交巡查记录');
  });

  it('点击「提交巡查记录」调用 createPatrolExecution 写入当前巡查结果(NORMAL)', async () => {
    const w = mountView();
    await flushPromises();
    const submitBtn = w.findAll('button').find((b) => b.text().includes('提交巡查记录'))!;
    await submitBtn.trigger('click');
    await flushPromises();
    expect(mocks.createPatrolExecution).toHaveBeenCalledTimes(1);
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.execResult).toBe('NORMAL');
    expect(payload.patrolDate).toBe('2026-09-20');
    expect(payload.dutyPerson).toBeTruthy();
  });

  it('勾选「异常」后提交，写入 ABNORMAL 并把异常项带入 finding', async () => {
    const w = mountView();
    await flushPromises();
    const abnormalOpt = w.findAll('.mb-seg__opt').find((b) => b.text() === '异常')!;
    await abnormalOpt.trigger('click');
    const submitBtn = w.findAll('button').find((b) => b.text().includes('提交巡查记录'))!;
    await submitBtn.trigger('click');
    await flushPromises();
    expect(mocks.createPatrolExecution).toHaveBeenCalledTimes(1);
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.execResult).toBe('ABNORMAL');
    expect(String(payload.finding)).toContain('c1');
  });

  it('点击「签到打卡」调用 createPatrolExecution(NORMAL) 并标记已签到', async () => {
    const w = mountView();
    await flushPromises();
    const signBtn = w.findAll('button').find((b) => b.text().includes('签到打卡'))!;
    await signBtn.trigger('click');
    await flushPromises();
    expect(mocks.createPatrolExecution).toHaveBeenCalledTimes(1);
    expect(
      (mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>).execResult,
    ).toBe('NORMAL');
  });

  it('点击「上报事件」展开输入，提交后调用 createPatrolExecution(ABNORMAL) 且 finding 取用户输入', async () => {
    const w = mountView();
    await flushPromises();
    const reportBtn = w.findAll('button').find((b) => b.text().includes('上报事件'))!;
    await reportBtn.trigger('click');
    await flushPromises();
    const ta = w.find('textarea');
    expect(ta.exists()).toBe(true);
    await ta.setValue('发现管线泄漏');
    const submitReport = w.findAll('button').find((b) => b.text().includes('提交上报'))!;
    await submitReport.trigger('click');
    await flushPromises();
    expect(mocks.createPatrolExecution).toHaveBeenCalledTimes(1);
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.execResult).toBe('ABNORMAL');
    expect(payload.finding).toBe('发现管线泄漏');
  });
});
