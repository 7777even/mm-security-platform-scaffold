// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlarmListItem from './AlarmListItem.vue';
import type { AlarmItem } from '@/services/alarm';

const baseAlarm = (overrides: Partial<AlarmItem> = {}): AlarmItem => ({
  alarmId: 'MOCK-0001',
  level: 1,
  type: 'FIRE',
  status: 'ACTIVE',
  deviceCode: 'DEV-1001',
  location: 'A 装置区西侧',
  ts: '2026-03-17T14:21:30.000Z',
  description: '烟雾浓度异常，请立即核实',
  ...overrides,
});

describe('AlarmListItem — §12.1 报警列表卡片（图 5-10 消防告警）', () => {
  it.each([1, 2, 3, 4] as const)('level=%s 渲染对应左侧 3px 等级色边类', (level) => {
    const w = mount(AlarmListItem, { props: { alarm: baseAlarm({ level }) } });
    expect(w.find('.alarm-list-item').classes()).toContain(`alarm-list-item--l${level}`);
  });

  it('显示状态标签（待处理/已确认/已派单/已闭环）', () => {
    const w = mount(AlarmListItem, { props: { alarm: baseAlarm({ status: 'ACTIVE' }) } });
    expect(w.find('.alarm-list-item__status').text()).toBe('未处置');
    expect(w.find('.alarm-list-item__status').classes()).toContain(
      'alarm-list-item__status--ACTIVE',
    );
  });

  it('当 showActions=false 时隐藏快捷操作行', () => {
    const w = mount(AlarmListItem, {
      props: { alarm: baseAlarm(), showActions: false },
    });
    expect(w.find('.alarm-list-item__actions').exists()).toBe(false);
  });

  it('点击 详情 触发 open 事件并携带 alarm', () => {
    const w = mount(AlarmListItem, { props: { alarm: baseAlarm() } });
    w.findAll('.alarm-list-item__action').at(-1)?.trigger('click');
    expect(w.emitted('open')?.[0]?.[0]).toMatchObject({ alarmId: 'MOCK-0001' });
  });

  it('CLOSED 状态下 一键应急/音视频通话 按钮被禁用', () => {
    const w = mount(AlarmListItem, { props: { alarm: baseAlarm({ status: 'CLOSED' }) } });
    const actions = w.findAll('.alarm-list-item__action');
    expect(actions.length).toBe(4);
    expect((actions[1].element as HTMLButtonElement).disabled).toBe(true);
    expect((actions[2].element as HTMLButtonElement).disabled).toBe(true);
  });
});
