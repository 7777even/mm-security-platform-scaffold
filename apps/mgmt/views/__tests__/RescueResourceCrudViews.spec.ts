// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import EmergencyExpertView from '../emergency/EmergencyExpertView.vue';
import EmergencyTeamView from '../emergency/EmergencyTeamView.vue';
import EmergencyVehicleView from '../emergency/EmergencyVehicleView.vue';
import ResourceView from '../emergency/ResourceView.vue';

const {
  fetchRescuePersonnel,
  fetchRescueVehicles,
  fetchRescueEquipment,
  fetchFireBrigades,
  deleteRescuePersonnel,
  deleteRescueBrigade,
  deleteRescueVehicle,
  deleteRescueEquipment,
  subscribeDomainChange,
  unsub,
  confirmMock,
} = vi.hoisted(() => ({
  fetchRescuePersonnel: vi.fn(),
  fetchRescueVehicles: vi.fn(),
  fetchRescueEquipment: vi.fn(),
  fetchFireBrigades: vi.fn(),
  deleteRescuePersonnel: vi.fn(),
  deleteRescueBrigade: vi.fn(),
  deleteRescueVehicle: vi.fn(),
  deleteRescueEquipment: vi.fn(),
  subscribeDomainChange: vi.fn(),
  unsub: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@/services/rescueResource', () => ({
  fetchRescuePersonnel: (...args: unknown[]) => fetchRescuePersonnel(...args),
  fetchRescueVehicles: (...args: unknown[]) => fetchRescueVehicles(...args),
  fetchRescueEquipment: (...args: unknown[]) => fetchRescueEquipment(...args),
  fetchFireBrigades: (...args: unknown[]) => fetchFireBrigades(...args),
  createRescuePersonnel: vi.fn(),
  updateRescuePersonnel: vi.fn(),
  deleteRescuePersonnel: (...args: unknown[]) => deleteRescuePersonnel(...args),
  createRescueBrigade: vi.fn(),
  updateRescueBrigade: vi.fn(),
  deleteRescueBrigade: (...args: unknown[]) => deleteRescueBrigade(...args),
  createRescueVehicle: vi.fn(),
  updateRescueVehicle: vi.fn(),
  deleteRescueVehicle: (...args: unknown[]) => deleteRescueVehicle(...args),
  createRescueEquipment: vi.fn(),
  updateRescueEquipment: vi.fn(),
  deleteRescueEquipment: (...args: unknown[]) => deleteRescueEquipment(...args),
  DUTY_STATUS_OPTIONS: [{ label: '在岗', value: '在岗' }],
  VEHICLE_STATUS_OPTIONS: [{ label: '待命', value: '待命' }],
  EQUIPMENT_STATUS_OPTIONS: [{ label: '完好', value: '完好' }],
}));
// useDomainAutoRefresh 内部走 realtime 中枢，mock 到这一层即可捕获订阅与退订
vi.mock('@/services/realtime', () => ({
  subscribeDomainChange: (...args: unknown[]) => subscribeDomainChange(...args),
}));
vi.mock('element-plus', async (importOriginal) => {
  const mod = await importOriginal<typeof import('element-plus')>();
  return { ...mod, ElMessageBox: { confirm: (...args: unknown[]) => confirmMock(...args) } };
});

const PERSON = {
  id: 5,
  name: '王强',
  squadron: '炼油中队',
  role: '指挥员',
  personGroup: '危化品处置组',
  phone: '13800000001',
  dutyStatus: '在岗',
};
const TEAM = {
  id: 3,
  name: '化工特勤队',
  area: '化工区',
  memberCount: 32,
  leaderName: '李队',
  leaderPhone: '13800000002',
  location: '化工消防站',
  longitude: 110.88,
  latitude: 21.68,
  description: '',
  rescuePersonnel: 30,
  rescueVehicles: 4,
  vehicles: [],
  personnel: [],
  equipment: [],
};
const VEHICLE = {
  id: 9,
  plate: '粤K12345',
  type: '泡沫消防车',
  squadron: '炼油中队',
  leaderName: '张车长',
  leaderPhone: '13800000003',
  status: '待命',
  businessName: '灭火救援',
};
const EQUIPMENT = {
  id: 11,
  name: '正压式空气呼吸器',
  squadron: '炼油中队',
  category: '防护装备',
  unit: '具',
  quantity: 40,
  leaderName: '赵装备',
  leaderPhone: '13800000004',
  stockQuantity: 36,
  model: 'RHZK6.8',
  equipmentStatus: '完好',
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

beforeEach(() => {
  vi.clearAllMocks();
  subscribeDomainChange.mockReturnValue(unsub);
  fetchRescuePersonnel.mockResolvedValue({ items: [PERSON], roles: ['指挥员'] });
  fetchFireBrigades.mockResolvedValue({ items: [TEAM], areas: ['化工区'] });
  fetchRescueVehicles.mockResolvedValue({ items: [VEHICLE], squadrons: [], types: [] });
  fetchRescueEquipment.mockResolvedValue({ items: [EQUIPMENT], squadrons: [] });
  deleteRescuePersonnel.mockResolvedValue(undefined);
  deleteRescueBrigade.mockResolvedValue(undefined);
  deleteRescueVehicle.mockResolvedValue(undefined);
  deleteRescueEquipment.mockResolvedValue(undefined);
  confirmMock.mockResolvedValue('confirm');
});

describe('救援资源四台账 · 实时订阅与删除', () => {
  it('应急专家页订阅 rescue.personnel 并在确认后删除', async () => {
    const wrapper = await mountLoaded(EmergencyExpertView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('rescue.personnel', expect.any(Function));

    await findBtn(wrapper, '删除').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(confirmMock).toHaveBeenCalled();
    expect(deleteRescuePersonnel).toHaveBeenCalledWith(5);
  });

  it('应急队伍页订阅 rescue.brigade 并在确认后删除', async () => {
    const wrapper = await mountLoaded(EmergencyTeamView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('rescue.brigade', expect.any(Function));

    await findBtn(wrapper, '删除').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(deleteRescueBrigade).toHaveBeenCalledWith(3);
  });

  it('应急车辆页订阅 rescue.vehicle 并在确认后删除', async () => {
    const wrapper = await mountLoaded(EmergencyVehicleView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('rescue.vehicle', expect.any(Function));

    await findBtn(wrapper, '删除').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(deleteRescueVehicle).toHaveBeenCalledWith(9);
  });

  it('应急物资页订阅 rescue.equipment 并在确认后删除', async () => {
    const wrapper = await mountLoaded(ResourceView);
    expect(subscribeDomainChange).toHaveBeenCalledWith('rescue.equipment', expect.any(Function));

    await findBtn(wrapper, '删除').trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 0));
    expect(deleteRescueEquipment).toHaveBeenCalledWith(11);
  });

  it('四页卸载时均退订', async () => {
    for (const component of [
      EmergencyExpertView,
      EmergencyTeamView,
      EmergencyVehicleView,
      ResourceView,
    ]) {
      const wrapper = await mountLoaded(component);
      wrapper.unmount();
    }
    expect(unsub).toHaveBeenCalledTimes(4);
  });

  it('应急车辆编辑只回传车辆本体字段，不含子集合', async () => {
    const wrapper = await mountLoaded(EmergencyVehicleView);
    await findBtn(wrapper, '编辑').trigger('click');
    await flushPromises();

    const dialog = wrapper.findComponent({ name: 'MgmtRecordEditDialog' });
    const form = (dialog.vm as unknown as { form: Record<string, unknown> }).form;
    expect(form.plate).toBe('粤K12345');
    // 子集合字段不应出现在表单里（避免保存时被回传给后端）
    expect(form).not.toHaveProperty('crew');
    expect(form).not.toHaveProperty('onboardEquipment');
  });
});
