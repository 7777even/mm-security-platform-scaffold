// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EmergencyCommandView from '../emergency/EmergencyCommandView.vue';
import DutySignInView from '../emergency/DutySignInView.vue';
import TyphoonDispatchView from '../typhoon/TyphoonDispatchView.vue';
import PatrolExecutionView from '../fire/PatrolExecutionView.vue';

const {
  fetchEmergencyCommandRecords,
  updateEmergencyCommandRecord,
  deleteEmergencyCommandRecord,
  fetchDutySignIns,
  deleteDutySignIn,
  fetchTyphoonDispatchOrders,
  deleteTyphoonDispatchOrder,
  fetchPatrolExecutions,
  deletePatrolExecution,
  confirmMock,
} = vi.hoisted(() => ({
  fetchEmergencyCommandRecords: vi.fn(),
  updateEmergencyCommandRecord: vi.fn(),
  deleteEmergencyCommandRecord: vi.fn(),
  fetchDutySignIns: vi.fn(),
  deleteDutySignIn: vi.fn(),
  fetchTyphoonDispatchOrders: vi.fn(),
  deleteTyphoonDispatchOrder: vi.fn(),
  fetchPatrolExecutions: vi.fn(),
  deletePatrolExecution: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@/services/businessWrite', () => ({
  fetchEmergencyCommandRecords: (...a: unknown[]) => fetchEmergencyCommandRecords(...a),
  createEmergencyCommandRecord: vi.fn(),
  updateEmergencyCommandRecord: (...a: unknown[]) => updateEmergencyCommandRecord(...a),
  deleteEmergencyCommandRecord: (...a: unknown[]) => deleteEmergencyCommandRecord(...a),
  fetchDutySignIns: (...a: unknown[]) => fetchDutySignIns(...a),
  createDutySignIn: vi.fn(),
  updateDutySignIn: vi.fn(),
  deleteDutySignIn: (...a: unknown[]) => deleteDutySignIn(...a),
  fetchTyphoonDispatchOrders: (...a: unknown[]) => fetchTyphoonDispatchOrders(...a),
  createTyphoonDispatchOrder: vi.fn(),
  updateTyphoonDispatchOrder: vi.fn(),
  deleteTyphoonDispatchOrder: (...a: unknown[]) => deleteTyphoonDispatchOrder(...a),
  fetchPatrolExecutions: (...a: unknown[]) => fetchPatrolExecutions(...a),
  createPatrolExecution: vi.fn(),
  updatePatrolExecution: vi.fn(),
  deletePatrolExecution: (...a: unknown[]) => deletePatrolExecution(...a),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...a: unknown[]) => confirmMock(...a) } };
});

beforeEach(() => {
  vi.clearAllMocks();
  confirmMock.mockResolvedValue('confirm');
  fetchEmergencyCommandRecords.mockResolvedValue([
    { id: 5, commandCode: 'CMD-1', commandName: '罐区泡沫联锁', currStatus: '已下发' },
  ]);
  fetchDutySignIns.mockResolvedValue([{ id: 6, personName: '张三', signAction: 'SIGN_IN' }]);
  fetchTyphoonDispatchOrders.mockResolvedValue([
    { id: 7, orderNo: 'DO-1', resourceCode: 'TY-R-12' },
  ]);
  fetchPatrolExecutions.mockResolvedValue([{ id: 8, dutyPerson: '李四', execResult: 'NORMAL' }]);
  updateEmergencyCommandRecord.mockResolvedValue({ id: 5 });
});

async function clickDelete(wrapper: ReturnType<typeof mount>): Promise<void> {
  const delBtn = wrapper.findAll('button').find((b) => b.text() === '删除');
  expect(delBtn).toBeTruthy();
  await delBtn!.trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
}

describe('businessWrite 四域 mgmt 页删除链路', () => {
  it('应急指令：确认后按 id 调用 deleteEmergencyCommandRecord', async () => {
    const wrapper = mount(EmergencyCommandView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    await clickDelete(wrapper);
    expect(deleteEmergencyCommandRecord).toHaveBeenCalledWith(5);
  });

  it('值班签到：确认后按 id 调用 deleteDutySignIn', async () => {
    const wrapper = mount(DutySignInView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    await clickDelete(wrapper);
    expect(deleteDutySignIn).toHaveBeenCalledWith(6);
  });

  it('台风调度：确认后按 id 调用 deleteTyphoonDispatchOrder', async () => {
    const wrapper = mount(TyphoonDispatchView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    await clickDelete(wrapper);
    expect(deleteTyphoonDispatchOrder).toHaveBeenCalledWith(7);
  });

  it('巡更执行：确认后按 id 调用 deletePatrolExecution', async () => {
    const wrapper = mount(PatrolExecutionView);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    await clickDelete(wrapper);
    expect(deletePatrolExecution).toHaveBeenCalledWith(8);
  });
});
