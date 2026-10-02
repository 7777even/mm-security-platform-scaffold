// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import PersonnelRegView from '../security/PersonnelRegView.vue';
import VehicleRegView from '../security/VehicleRegView.vue';

const {
  fetchPersonSearch,
  fetchPersonSearchDetail,
  createPersonSearch,
  updatePersonSearch,
  deletePersonSearch,
  fetchVehicleSearch,
  fetchVehicleSearchDetail,
  createVehicleSearch,
  updateVehicleSearch,
  deleteVehicleSearch,
  subscribeDomainChange,
  unsub,
  confirmMock,
  errorMock,
} = vi.hoisted(() => ({
  fetchPersonSearch: vi.fn(),
  fetchPersonSearchDetail: vi.fn(),
  createPersonSearch: vi.fn(),
  updatePersonSearch: vi.fn(),
  deletePersonSearch: vi.fn(),
  fetchVehicleSearch: vi.fn(),
  fetchVehicleSearchDetail: vi.fn(),
  createVehicleSearch: vi.fn(),
  updateVehicleSearch: vi.fn(),
  deleteVehicleSearch: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock('@/services/security', () => ({
  fetchPersonSearch: (...args: unknown[]) => fetchPersonSearch(...args),
  fetchPersonSearchDetail: (...args: unknown[]) => fetchPersonSearchDetail(...args),
  createPersonSearch: (...args: unknown[]) => createPersonSearch(...args),
  updatePersonSearch: (...args: unknown[]) => updatePersonSearch(...args),
  deletePersonSearch: (...args: unknown[]) => deletePersonSearch(...args),
  fetchVehicleSearch: (...args: unknown[]) => fetchVehicleSearch(...args),
  fetchVehicleSearchDetail: (...args: unknown[]) => fetchVehicleSearchDetail(...args),
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
  return {
    ...mod,
    ElMessage: { ...mod.ElMessage, error: (...args: unknown[]) => errorMock(...args) },
    ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) },
  };
});

const PERSON_ROW = { id: 7, name: '张三', gate: '东门-入', status: '入厂', date: '2026-10-03' };
// 详情接口返回体：摘要字段 + 列表不带的扩展字段
const PERSON_DETAIL = {
  ...PERSON_ROW,
  gender: '男',
  phone: '13800138000',
  company: '茂名石化检修公司',
  idNumber: '440902199001011234',
  appointmentNo: 'YY202610030021',
  appointmentTime: '08:00 — 17:00',
  visitPurpose: '设备检修',
  specialOperation: '高处作业',
  operationArea: '炼油二区',
};
const VEHICLE_ROW = {
  id: 12,
  plate: '粤KA4543',
  confidence: 92,
  gate: '东门-入',
  status: '入厂',
  time: '2026-10-03 09:12:00',
};
const VEHICLE_DETAIL = {
  ...VEHICLE_ROW,
  vehicleType: '危化品运输车',
  driverName: '刘师傅',
  driverPhone: '13900139000',
  company: '茂名顺达物流有限公司',
  appointmentNo: 'YY202610030001',
  appointmentTime: '09:00 — 18:00',
  visitPurpose: '原料配送',
  waybillNo: 'YD202610030001',
  cargo: '工业乙醇',
  destination: '炼油一区装卸点',
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

/** 点「编辑」→ 等详情接口返回 → 返回已打开的通用弹窗实例（不存在则断言失败）。 */
async function openEditDialog(wrapper: VueWrapper): Promise<VueWrapper> {
  await findBtn(wrapper, '编辑').trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0));
  const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
  expect(dialog.exists()).toBe(true);
  return dialog as unknown as VueWrapper;
}

/** 打开弹窗 → 灌表单 → 点保存 → 等写接口回调完成。 */
async function saveDialog(
  wrapper: VueWrapper,
  openText: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await findBtn(wrapper, openText).trigger('click');
  await flushPromises();
  await new Promise((r) => setTimeout(r, 0)); // 编辑态需等详情接口回填
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
  fetchPersonSearchDetail.mockResolvedValue(PERSON_DETAIL);
  fetchVehicleSearch.mockResolvedValue([VEHICLE_ROW]);
  fetchVehicleSearchDetail.mockResolvedValue(VEHICLE_DETAIL);
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

  it('点编辑先拉详情，弹窗 editRow 含列表没有的扩展字段', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    const dialog = await openEditDialog(wrapper);
    expect(fetchPersonSearchDetail).toHaveBeenCalledWith(7);
    const editRow = dialog.props('editRow') as Record<string, unknown>;
    expect(editRow).toBeTruthy();
    expect(editRow.id).toBe(7);
    // 详情扩展字段必须回填，否则编辑态除摘要外全空、用户误以为数据丢失
    expect(editRow.gender).toBe('男');
    expect(editRow.phone).toBe('13800138000');
    expect(editRow.company).toBe('茂名石化检修公司');
    expect(editRow.idNumber).toBe('440902199001011234');
    expect(editRow.appointmentNo).toBe('YY202610030021');
    expect(editRow.specialOperation).toBe('高处作业');
    expect(editRow.operationArea).toBe('炼油二区');
    // 表单同步回填（弹窗以 editRow 为源）
    expect((dialog.vm as unknown as { form: Record<string, unknown> }).form.idNumber).toBe(
      '440902199001011234',
    );
  });

  it('详情返回空：提示失败且不打开弹窗，避免残缺数据被保存', async () => {
    fetchPersonSearchDetail.mockResolvedValue(null);
    const wrapper = await mountLoaded(PersonnelRegView);
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(errorMock).toHaveBeenCalled();
    const msg = String(errorMock.mock.calls[0][0]);
    expect(msg).toContain('加载人员备案详情失败');
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(false);
  });

  it('详情接口抛错：提示失败且不打开弹窗', async () => {
    fetchPersonSearchDetail.mockRejectedValue(new Error('网络异常'));
    const wrapper = await mountLoaded(PersonnelRegView);
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(errorMock).toHaveBeenCalled();
    expect(String(errorMock.mock.calls[0][0])).toContain('网络异常');
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(false);
  });

  it('详情加载中重复点同一行不重复请求', async () => {
    let resolve: (v: unknown) => void = () => {};
    fetchPersonSearchDetail.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }) as never,
    );
    const wrapper = await mountLoaded(PersonnelRegView);
    const btn = findBtn(wrapper, '编辑');
    await btn.trigger('click');
    await btn.trigger('click');
    await flushPromises();
    expect(fetchPersonSearchDetail).toHaveBeenCalledTimes(1);
    resolve(PERSON_DETAIL);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(true);
  });

  it('新增态不拉详情，弹窗为空白表单', async () => {
    const wrapper = await mountLoaded(PersonnelRegView);
    await findBtn(wrapper, '新增').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchPersonSearchDetail).not.toHaveBeenCalled();
    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    expect(dialog.props('editRow')).toBeNull();
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

  it('点编辑先拉详情，弹窗 editRow 含列表没有的扩展字段', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    const dialog = await openEditDialog(wrapper);
    expect(fetchVehicleSearchDetail).toHaveBeenCalledWith(12);
    const editRow = dialog.props('editRow') as Record<string, unknown>;
    expect(editRow).toBeTruthy();
    expect(editRow.id).toBe(12);
    expect(editRow.vehicleType).toBe('危化品运输车');
    expect(editRow.driverName).toBe('刘师傅');
    expect(editRow.driverPhone).toBe('13900139000');
    expect(editRow.waybillNo).toBe('YD202610030001');
    expect(editRow.cargo).toBe('工业乙醇');
    expect(editRow.destination).toBe('炼油一区装卸点');
    expect((dialog.vm as unknown as { form: Record<string, unknown> }).form.driverName).toBe(
      '刘师傅',
    );
  });

  it('详情返回空：提示失败且不打开弹窗，避免残缺数据被保存', async () => {
    fetchVehicleSearchDetail.mockResolvedValue(null);
    const wrapper = await mountLoaded(VehicleRegView);
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(errorMock).toHaveBeenCalled();
    expect(String(errorMock.mock.calls[0][0])).toContain('加载车辆备案详情失败');
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(false);
  });

  it('详情接口抛错：提示失败且不打开弹窗', async () => {
    fetchVehicleSearchDetail.mockRejectedValue(new Error('网络异常'));
    const wrapper = await mountLoaded(VehicleRegView);
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(errorMock).toHaveBeenCalled();
    expect(String(errorMock.mock.calls[0][0])).toContain('网络异常');
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(false);
  });

  it('详情加载中重复点同一行不重复请求', async () => {
    let resolve: (v: unknown) => void = () => {};
    fetchVehicleSearchDetail.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }) as never,
    );
    const wrapper = await mountLoaded(VehicleRegView);
    const btn = findBtn(wrapper, '编辑');
    await btn.trigger('click');
    await btn.trigger('click');
    await flushPromises();
    expect(fetchVehicleSearchDetail).toHaveBeenCalledTimes(1);
    resolve(VEHICLE_DETAIL);
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('modelValue')).toBe(true);
  });

  it('新增态不拉详情，弹窗为空白表单', async () => {
    const wrapper = await mountLoaded(VehicleRegView);
    await findBtn(wrapper, '新增').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchVehicleSearchDetail).not.toHaveBeenCalled();
    expect(wrapper.findComponent({ name: 'MgmtRecordEditDialog' }).props('editRow')).toBeNull();
  });
});
