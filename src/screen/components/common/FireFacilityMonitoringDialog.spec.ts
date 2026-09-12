// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import FireFacilityMonitoringDialog from './FireFacilityMonitoringDialog.vue';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';

// 故障数据由 service 提供，此处给出稳定可控的一条「待确认」故障。
const { makeFault } = vi.hoisted(() => ({
  makeFault: (status: string) => ({
    id: 1,
    faultCode: 'F-2026-001',
    facilityCode: 'FA-001',
    facilityName: '1号消防泵',
    facilityType: '消防泵',
    faultType: '硬件故障',
    faultLevel: '一级',
    discoverTime: '2026-08-20 09:00:00',
    discoverMethod: '系统自检',
    phenomenon: '出口压力不足',
    cause: '',
    status,
    timeline: [],
  }),
}));

vi.mock('@/services/map-data/fireFacilityMonitoringMock', () => ({
  loadFireFacilityFaults: vi.fn(() => Promise.resolve([makeFault('待确认')])),
  loadFireFacilityMonitors: vi.fn(() => Promise.resolve([])),
  loadFireFacilityLedger: vi.fn(() => Promise.resolve([])),
}));

const { openFireFacilityMonitoring, closeFireFacilityMonitoring } =
  useFireFacilityMonitoringDialog();

// 弹窗内容整体包在 <Teleport to="body"> 内：wrapper 自身只渲染 teleport 锚点注释，
// 直接 w.findAll('button') 恒为 0。故必须 attachTo body 并改查 document.body。
let wrapper: VueWrapper | null = null;

/**
 * 直接落到「故障」页签挂载，跳过监测页。
 *
 * 注意：组件的数据加载挂在 `watch(() => props.open)` 上且**非 immediate**，
 * 直接以 `open: true` 挂载不会触发取数（弹窗内列表恒为空）。
 * 必须按真实交互路径「先关后开」触发一次 open 变更。
 */
async function mountDialog() {
  openFireFacilityMonitoring({ tab: 'problem' });
  const w = mount(FireFacilityMonitoringDialog, {
    props: { open: false },
    attachTo: document.body,
  });
  wrapper = w;
  await w.setProps({ open: true });
  await flushPromises();
  await flushPromises();
  return w;
}

function buttons(): HTMLButtonElement[] {
  return Array.from(document.body.querySelectorAll('button'));
}

function btnByText(_w: VueWrapper, text: string): HTMLButtonElement | undefined {
  return buttons().find((b) => (b.textContent ?? '').trim() === text);
}

async function clickBtn(w: VueWrapper, text: string) {
  const b = btnByText(w, text);
  if (!b) {
    throw new Error(
      `未找到按钮：${text}（当前按钮：${buttons()
        .map((x) => (x.textContent ?? '').trim())
        .join('|')}）`,
    );
  }
  b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await flushPromises();
}

/**
 * 取故障处置状态徽标文本。
 *
 * 注意：一行故障里有两个 `.ffm__badge`（前者是故障等级「一级」、后者才是处置状态），
 * 直接取第一个会拿到等级，故按状态文案集合筛选。
 */
function badgeText(): string {
  const STATUSES = ['待确认', '已确认', '已派单', '维修中', '待验收', '已闭环'];
  const all = Array.from(document.body.querySelectorAll('.ffm__badge'));
  const hit = all.find((el) => STATUSES.includes((el.textContent ?? '').trim()));
  return (hit?.textContent ?? '').trim();
}

describe('FireFacilityMonitoringDialog 故障处置状态机', () => {
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    closeFireFacilityMonitoring();
  });

  it('待确认故障只暴露「确认」操作，后续流转按钮不出现', async () => {
    const w = await mountDialog();
    expect(badgeText()).toBe('待确认');
    expect(btnByText(w, '确认')).toBeTruthy();
    expect(btnByText(w, '派单')).toBeUndefined();
    expect(btnByText(w, '开始维修')).toBeUndefined();
  });

  it('确认后状态推进为已确认，操作切换为「派单」', async () => {
    const w = await mountDialog();
    await clickBtn(w, '确认');
    expect(badgeText()).toBe('已确认');
    expect(btnByText(w, '派单')).toBeTruthy();
    expect(btnByText(w, '确认')).toBeUndefined();
  });

  it('派单后状态推进为已派单，并生成工单号', async () => {
    const w = await mountDialog();
    await clickBtn(w, '确认');
    await clickBtn(w, '派单');
    expect(badgeText()).toBe('已派单');
    expect(btnByText(w, '开始维修')).toBeTruthy();
    // 工单号挂在「工单跟踪」页签（问题设备页只显示状态与操作），切过去再校验。
    // 形如 WO-20260820-001，由 nextWorkOrderNo 按既有最大值递增生成。
    await clickBtn(w, '工单跟踪');
    expect(document.body.textContent ?? '').toMatch(/WO-20260820-\d{3}/);
  });
});
