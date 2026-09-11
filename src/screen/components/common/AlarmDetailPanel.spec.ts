// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import AlarmDetailPanel from './AlarmDetailPanel.vue';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';
import type { AlarmDetailItem, AlarmDetailStatus } from '../../lib/data/alarmDetailMock';

// 派单人员下拉由后端提供，此处给出稳定的选项源，避免测试依赖真实网络。
const { personnel } = vi.hoisted(() => ({
  personnel: [
    { id: 1, name: '张三', role: '值班员', department: '消防队', phone: '13800000001' },
    { id: 2, name: '李四', role: '班长', department: '消防队', phone: '13800000002' },
  ],
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/services/emergency', () => ({
  fetchDispatchPersonnel: vi.fn(() => Promise.resolve(personnel)),
}));

const { openAlarmDetail, activeAlarmDetail, closeAlarmDetail } = useAlarmDetailPanel();

function makeItem(overrides: Partial<AlarmDetailItem> = {}): AlarmDetailItem {
  return {
    id: 'AL-1',
    alarmCode: 'AL-2026-001',
    title: '罐区温度超限',
    alarmType: 'DCS',
    source: 'DCS 系统',
    level: '一级',
    status: '未确认',
    falseAlarm: '未核实',
    time: '2026-08-20 10:00:00',
    objectType: '储罐',
    objectName: 'T-101',
    location: '罐区 A',
    description: '温度超过设定阈值',
    typeFields: { 测点: 'TI-101', 当前值: '86℃' },
    longitude: 110.92,
    latitude: 21.65,
    dispatchPersonnel: [],
    notifyApp: false,
    notifySms: false,
    handleResult: '',
    handleTime: '',
    attachments: [],
    timeline: [],
    ...overrides,
  };
}

function btn(w: VueWrapper, text: string) {
  return w.findAll('button').find((b) => b.text() === text);
}

async function clickByText(w: VueWrapper, text: string) {
  const b = btn(w, text);
  if (!b) throw new Error(`未找到按钮：${text}`);
  await b.trigger('click');
  await nextTick();
}

async function mountPanel(status: AlarmDetailStatus, overrides: Partial<AlarmDetailItem> = {}) {
  openAlarmDetail(makeItem({ status, ...overrides }));
  const w = mount(AlarmDetailPanel);
  await flushPromises();
  await nextTick();
  return w;
}

describe('AlarmDetailPanel 告警处置状态机', () => {
  afterEach(() => {
    closeAlarmDetail();
  });

  it('未确认时只暴露「确认」主操作，后续流转按钮不出现', async () => {
    const w = await mountPanel('未确认');
    expect(btn(w, '确认')).toBeTruthy();
    expect(btn(w, '开始处置')).toBeUndefined();
    expect(btn(w, '提交处置')).toBeUndefined();
  });

  it('未确认 → 确认：状态变为已确认并写入一条时间线', async () => {
    const w = await mountPanel('未确认');
    await clickByText(w, '确认');
    expect(activeAlarmDetail.value?.status).toBe('已确认');
    expect(activeAlarmDetail.value?.timeline).toHaveLength(1);
    expect(activeAlarmDetail.value?.timeline[0]?.action).toBe('确认告警');
  });

  it('已确认时只暴露「开始处置」，「确认」按钮消失', async () => {
    const w = await mountPanel('已确认');
    expect(btn(w, '开始处置')).toBeTruthy();
    expect(btn(w, '确认')).toBeUndefined();
  });

  it('已确认 → 开始处置：状态变为处理中', async () => {
    const w = await mountPanel('已确认');
    await clickByText(w, '开始处置');
    expect(activeAlarmDetail.value?.status).toBe('处理中');
  });

  it('处理中 → 提交处置：状态变为已处理并回填处置时间', async () => {
    const w = await mountPanel('处理中', { handleResult: '现场已降温' });
    await clickByText(w, '提交处置');
    expect(activeAlarmDetail.value?.status).toBe('已处理');
    expect(activeAlarmDetail.value?.handleTime).not.toBe('');
    expect(activeAlarmDetail.value?.timeline.at(-1)?.detail).toBe('现场已降温');
  });

  it('已处理后不再提供「标记误报」入口（终态守卫）', async () => {
    const w = await mountPanel('已处理');
    expect(btn(w, '标记误报')).toBeUndefined();
    expect(btn(w, '提交处置')).toBeUndefined();
  });

  it('标记误报：falseAlarm 置为「是」并记录时间线', async () => {
    const w = await mountPanel('已确认');
    await clickByText(w, '标记误报');
    expect(activeAlarmDetail.value?.falseAlarm).toBe('是');
    expect(activeAlarmDetail.value?.timeline.at(-1)?.action).toBe('标记误报');
  });
});

describe('AlarmDetailPanel 派单人员管理', () => {
  afterEach(() => {
    closeAlarmDetail();
  });

  it('下拉选项来自后端派单名册（/emergency/dispatch-personnel）', async () => {
    const w = await mountPanel('已确认');
    const options = w.findAll('select option').map((o) => o.text());
    // 首项为占位「请选择」，其后为后端返回人名（带角色后缀）
    expect(options.some((t) => t.includes('张三'))).toBe(true);
    expect(options.some((t) => t.includes('李四'))).toBe(true);
  });

  it('添加人员后进入派单列表，且同名不重复添加', async () => {
    const w = await mountPanel('已确认');
    await w.find('select').setValue('张三');
    await clickByText(w, '添加');
    expect(activeAlarmDetail.value?.dispatchPersonnel).toEqual(['张三']);

    // 再次添加同一人，应被去重逻辑拦截
    await w.find('select').setValue('张三');
    await clickByText(w, '添加');
    expect(activeAlarmDetail.value?.dispatchPersonnel).toEqual(['张三']);
  });

  it('可从派单列表移除人员', async () => {
    const w = await mountPanel('已确认', { dispatchPersonnel: ['张三', '李四'] });
    expect(w.findAll('.alarm-detail__tag')).toHaveLength(2);
    await w.findAll('.alarm-detail__tag-remove')[0]?.trigger('click');
    await nextTick();
    expect(activeAlarmDetail.value?.dispatchPersonnel).toEqual(['李四']);
  });
});
