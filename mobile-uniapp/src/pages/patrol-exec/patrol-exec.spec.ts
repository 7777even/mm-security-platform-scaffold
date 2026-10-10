// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

// 读接口与写接口一并 mock，避免测试触达真实后端 / 离线告警。
const mocks = vi.hoisted(() => ({
  fetchFirePatrols: vi.fn(),
  fetchPatrolExecutions: vi.fn(),
  createPatrolExecution: vi.fn(),
}));

vi.mock('@/platform/api', () => ({
  fetchFirePatrols: (...a: unknown[]) => mocks.fetchFirePatrols(...a),
  fetchPatrolExecutions: (...a: unknown[]) => mocks.fetchPatrolExecutions(...a),
  createPatrolExecution: (...a: unknown[]) => mocks.createPatrolExecution(...a),
}));

import patrolExec from './patrol-exec.vue';

const SAMPLE_PATROL = {
  id: 1,
  patrolDate: '2026-09-20',
  shift: '上午',
  dutyPerson: '张三',
  locations: ['罐区A'],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchFirePatrols.mockResolvedValue([SAMPLE_PATROL]);
  mocks.fetchPatrolExecutions.mockResolvedValue([]);
  mocks.createPatrolExecution.mockResolvedValue({ id: 1 });
});

const mountView = () => mount(patrolExec);

describe('移动端巡查执行页 · 写按钮接线', () => {
  it('挂载后拉取当前巡查任务并渲染提交栏', async () => {
    const w = mountView();
    await flushPromises();
    expect(mocks.fetchFirePatrols).toHaveBeenCalled();
    expect(w.find('.submit-bar').exists()).toBe(true);
    expect(w.find('.submit-btn').exists()).toBe(true);
  });

  it('默认执行结果为 NORMAL，点击「提交巡查」调用 createPatrolExecution(NORMAL)', async () => {
    const w = mountView();
    await flushPromises();
    const submitBtn = w.find('.submit-btn');
    await submitBtn.trigger('click');
    await flushPromises();
    expect(mocks.createPatrolExecution).toHaveBeenCalledTimes(1);
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.execResult).toBe('NORMAL');
    expect(payload.patrolDate).toBe('2026-09-20');
    expect(payload.dutyPerson).toBeTruthy();
  });

  it('选择「异常」后提交写入 ABNORMAL', async () => {
    const w = mountView();
    await flushPromises();
    const abnormalOpt = w.findAll('.seg-item').find((b) => b.text() === '异常')!;
    await abnormalOpt.trigger('click');
    const submitBtn = w.find('.submit-btn');
    await submitBtn.trigger('click');
    await flushPromises();
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.execResult).toBe('ABNORMAL');
  });

  it('填写发现描述后提交，finding 取用户输入', async () => {
    const w = mountView();
    await flushPromises();
    const ta = w.find('textarea');
    expect(ta.exists()).toBe(true);
    await ta.setValue('发现管线泄漏');
    await w.find('.submit-btn').trigger('click');
    await flushPromises();
    const payload = mocks.createPatrolExecution.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.finding).toBe('发现管线泄漏');
  });
});
