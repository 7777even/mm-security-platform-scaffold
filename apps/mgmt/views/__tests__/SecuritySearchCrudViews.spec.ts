// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import PersonnelRegView from '../security/PersonnelRegView.vue';
import VehicleRegView from '../security/VehicleRegView.vue';

const {
  fetchPersonSearch,
  createPersonSearch,
  updatePersonSearch,
  deletePersonSearch,
  fetchVehicleSearch,
  createVehicleSearch,
  updateVehicleSearch,
  deleteVehicleSearch,
  subscribeDomainChange,
  unsub,
  confirmMock,
} = vi.hoisted(() => ({
  fetchPersonSearch: vi.fn(),
  createPersonSearch: vi.fn(),
  updatePersonSearch: vi.fn(),
  deletePersonSearch: vi.fn(),
  fetchVehicleSearch: vi.fn(),
  createVehicleSearch: vi.fn(),
  updateVehicleSearch: vi.fn(),
  deleteVehicleSearch: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@/services/security', () => ({
  fetchPersonSearch: (...args: unknown[]) => fetchPersonSearch(...args),
  createPersonSearch: (...args: unknown[]) => createPersonSearch(...args),
  updatePersonSearch: (...args: unknown[]) => updatePersonSearch(...args),
  deletePersonSearch: (...args: unknown[]) => deletePersonSearch(...args),
  fetchVehicleSearch: (...args: unknown[]) => fetchVehicleSearch(...args),
  createVehicleSearch: (...args: unknown[]) => createVehicleSearch(...args),
  updateVehicleSearch: (...args: unknown[]) => updateVehicleSearch(...args),
  deleteVehicleSearch: (...args: unknown[]) => deleteVehicleSearch(...args),
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

const PERSON_ROW = { id: 7, name: '张三', gate: '东门-入', status: '入厂', date: '2026-10-03' };
const VEHICLE_ROW = {
  id: 12,
  plate: '粤KA4543',
  confidence: 92,
  gate: '东门-入',
  status: '入厂',
  time: '2026-10-03 09:12:00',
};

function findBtn(wrapper: VueWrapper, text: string) {
  const btn = wrapper.findAll('button').find((b) => b.text() === text);
  expect(btn).toBeTruthy();
  return btn!;
}

/** 挂载 → 等列表渲染完成。 */
async function mountLoaded(component: unknown): Promise<VueWrapper> {
  const wrapper = mount(component as never);
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
  return wrapper;
}

/** 打开弹窗 → 灌表单 → 点保存 → 等写接口回调完成。 */
async function saveDialog(
  wrapper: VueWrapper,
  openText: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await findBtn(wrapper, openText).trigger('click');
  await flushPromises();
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
  fetchPersonSearch.mockResolvedValue([PERSON_ROW]);
  fetchVehicleSearch.mockResolvedValue([VEHICLE_ROW]);
  createPersonSearch.mockResolvedValue(null);
  updatePersonSearch.mockResolvedValue(null);
  deletePersonSearch.mockResolvedValue(undefined);
  createVehicleSearch.mockResolvedValue(null);
  updateVehicleSearch.mockResolvedValue(null);
  deleteVehicleSearch.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('人员备案管理（PersonnelRegView）实时订阅与 CRUD', () => {
  it('挂载时订阅 security.person-search 域，卸载时退订', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    expect(subscribeDomainChange).toHaveBeenCalledWith(
      'security.person-search',
      expect.any(Function),
    );
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('删除经二次确认后调用 deletePersonSearch', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    await clickDelete(wrapper);
    expect(confirmMock).toHaveBeenCalled();
    expect(deletePersonSearch).toHaveBeenCalledWith(7);
    // 删完重新 load
    expect(fetchPersonSearch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('用户取消确认时不调用 deletePersonSearch', async () => {
    confirmMock.mockRejectedValue('cancel');
    const wrapper = await mountLoaded(PersonnelRegView);
    await clickDelete(wrapper);
    expect(deletePersonSearch).not.toHaveBeenCalled();
  });

  it('新增保存：必填 name 走 createPersonSearch', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    await saveDialog(wrapper, '新增', { name: '李四', gate: '南门-入', status: '入厂' });
    expect(createPersonSearch).toHaveBeenCalledTimes(1);
    const payload = createPersonSearch.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.name).toBe('李四');
    expect(payload.gate).toBe('南门-入');
    expect(updatePersonSearch).not.toHaveBeenCalled();
  });

  it('编辑保存：带 id 走 updatePersonSearch', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    await saveDialog(wrapper, '编辑', { visitPurpose: '设备检修' });
    expect(updatePersonSearch).toHaveBeenCalledTimes(1);
    const [id, payload] = updatePersonSearch.mock.calls[0] as [number, Record<string, unknown>];
    expect(id).toBe(7);
    expect(payload.name).toBe('张三');
    expect(payload.visitPurpose).toBe('设备检修');
    expect(createPersonSearch).not.toHaveBeenCalled();
  });
});

describe('车辆备案管理（VehicleRegView）实时订阅与 CRUD', () => {
  it('挂载时订阅 security.vehicle-search 域，卸载时退订', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    expect(subscribeDomainChange).toHaveBeenCalledWith(
      'security.vehicle-search',
      expect.any(Function),
    );
    wrapper.unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('删除经二次确认后调用 deleteVehicleSearch', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    await clickDelete(wrapper);
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteVehicleSearch).toHaveBeenCalledWith(12);
    expect(fetchVehicleSearch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('新增保存：必填 plate 走 createVehicleSearch', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    await saveDialog(wrapper, '新增', { plate: '粤K·B8821', gate: '西门-出', status: '出厂' });
    expect(createVehicleSearch).toHaveBeenCalledTimes(1);
    const payload = createVehicleSearch.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.plate).toBe('粤K·B8821');
    expect(updateVehicleSearch).not.toHaveBeenCalled();
  });

  it('编辑保存：带 id 走 updateVehicleSearch', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    await saveDialog(wrapper, '编辑', { cargo: '工业乙醇', driverName: '刘师傅' });
    expect(updateVehicleSearch).toHaveBeenCalledTimes(1);
    const [id, payload] = updateVehicleSearch.mock.calls[0] as [number, Record<string, unknown>];
    expect(id).toBe(12);
    expect(payload.plate).toBe('粤KA4543');
    expect(payload.cargo).toBe('工业乙醇');
    expect(createVehicleSearch).not.toHaveBeenCalled();
  });
});
