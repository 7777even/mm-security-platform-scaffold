// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import PatrolView from '../fire/PatrolView.vue';

const {
  fetchFirePatrols,
  createFirePatrol,
  updateFirePatrol,
  deleteFirePatrol,
  subscribeDomainChange,
  unsub,
  confirmMock,
  errorMock,
} = vi.hoisted(() => ({
  fetchFirePatrols: vi.fn(),
  createFirePatrol: vi.fn(),
  updateFirePatrol: vi.fn(),
  deleteFirePatrol: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock('@/services/fireMonitoring', () => ({
  fetchFirePatrols: (...args: unknown[]) => fetchFirePatrols(...args),
  createFirePatrol: (...args: unknown[]) => createFirePatrol(...args),
  updateFirePatrol: (...args: unknown[]) => updateFirePatrol(...args),
  deleteFirePatrol: (...args: unknown[]) => deleteFirePatrol(...args),
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return {
    ...mod,
    ElMessage: { ...mod.ElMessage, error: (...args: unknown[]) => errorMock(...args) },
    ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) },
  };
});

const PATROL_ROW = {
  id: 7,
  patrolDate: '2026-10-03',
  shift: '上午' as const,
  dutyPerson: '张三',
  patrolCount: '第1次',
  locations: ['A区', 'B区'],
  completed: true,
  workOrderNo: 'WO202610030001',
  checkItems: [],
};

function findBtn(wrapper: VueWrapper, text: string) {
  const btn = wrapper.findAll('button').find((b) => b.text() === text);
  expect(btn).toBeTruthy();
  return btn!;
}

async function mountLoaded(): Promise<VueWrapper> {
  const wrapper = mount(PatrolView as never);
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
  return wrapper;
}

async function saveDialog(
  wrapper: VueWrapper,
  openText: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await findBtn(wrapper, openText).trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
  const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
  expect(dialog.exists()).toBe(true);
  Object.assign((dialog.vm as unknown as { form: Record<string, unknown> }).form, patch);
  await flushPromises();
  await findBtn(wrapper, '保存').trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
}

async function clickDelete(wrapper: VueWrapper): Promise<void> {
  await findBtn(wrapper, '删除').trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  vi.clearAllMocks();
  subscribeDomainChange.mockReturnValue(unsub);
  fetchFirePatrols.mockResolvedValue([PATROL_ROW]);
  createFirePatrol.mockResolvedValue(null);
  updateFirePatrol.mockResolvedValue(null);
  deleteFirePatrol.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('日常防火巡查管理（PatrolView）实时订阅与 CRUD', () => {
  it('挂载时订阅 fire.patrol-record 域，卸载时退订', async () => {
    const wrapper = await mountLoaded();
    expect(subscribeDomainChange).toHaveBeenCalledWith('fire.patrol-record', expect.any(Function));
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('删除经二次确认后调用 deleteFirePatrol', async () => {
    const wrapper = await mountLoaded();
    await clickDelete(wrapper);
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteFirePatrol).toHaveBeenCalledWith(7);
    expect(fetchFirePatrols.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('用户取消确认时不调用 deleteFirePatrol', async () => {
    confirmMock.mockRejectedValue('cancel');
    const wrapper = await mountLoaded();
    await clickDelete(wrapper);
    expect(deleteFirePatrol).not.toHaveBeenCalled();
  });

  it('新增保存：必填 patrolDate 走 createFirePatrol，locations 逗号/顿号拆分', async () => {
    const wrapper = await mountLoaded();
    await saveDialog(wrapper, '新增', { patrolDate: '2026-10-03', locations: 'A区、B区、C区' });
    expect(createFirePatrol).toHaveBeenCalledTimes(1);
    const payload = createFirePatrol.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.patrolDate).toBe('2026-10-03');
    expect(payload.locations).toEqual(['A区', 'B区', 'C区']);
    expect(payload).not.toHaveProperty('status');
    expect(updateFirePatrol).not.toHaveBeenCalled();
  });

  it('编辑保存：带 id 走 updateFirePatrol，locations 保留数组', async () => {
    const wrapper = await mountLoaded();
    await saveDialog(wrapper, '编辑', { dutyPerson: '李四' });
    expect(updateFirePatrol).toHaveBeenCalledTimes(1);
    const [id, payload] = updateFirePatrol.mock.calls[0] as [number, Record<string, unknown>];
    expect(id).toBe(7);
    expect(payload.patrolDate).toBe('2026-10-03');
    expect(payload.dutyPerson).toBe('李四');
    expect(payload.locations).toEqual(['A区', 'B区']);
    expect(createFirePatrol).not.toHaveBeenCalled();
  });

  it('点击编辑以行数据直接回填，不拉详情接口', async () => {
    const wrapper = await mountLoaded();
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    expect(dialog.props('modelValue')).toBe(true);
    const editRow = dialog.props('editRow') as Record<string, unknown>;
    expect(editRow.id).toBe(7);
    expect(editRow.patrolDate).toBe('2026-10-03');
    // locations 数组在回填时转为顿号拼接串供 input 展示
    expect(editRow.locations).toBe('A区、B区');
  });

  it('新增态弹窗为空白表单', async () => {
    const wrapper = await mountLoaded();
    await findBtn(wrapper, '新增').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    expect(dialog.props('editRow')).toBeNull();
  });
});
