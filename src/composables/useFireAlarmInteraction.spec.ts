import { describe, it, expect, afterEach } from 'vitest';
import { useFireAlarmInteraction } from './useFireAlarmInteraction';

// 消防报警模块「点击 → 二级界面」统一调度状态机（模块级单例）。
// 覆盖：初始态 / 各 open 入口映射 / 互斥替换 / close / 跨调用单例一致性。
describe('useFireAlarmInteraction 消防模块二级界面调度', () => {
  afterEach(() => useFireAlarmInteraction().close());

  it('初始无二级界面打开', () => {
    const { current, openKind, isOpen } = useFireAlarmInteraction();
    expect(current.value).toBeNull();
    expect(openKind.value).toBeNull();
    expect(isOpen('alarmDetail')).toBe(false);
  });

  it('openAlarmDetail 设置 kind 与透传 payload', () => {
    const { openAlarmDetail, current, isOpen } = useFireAlarmInteraction();
    const item = { id: 'A1', title: 'A装置区火灾' };
    openAlarmDetail(item);
    expect(current.value?.kind).toBe('alarmDetail');
    // payload 经 Vue ref 的 deep reactive 代理后引用会变，结构透传相等即视为正确
    expect(current.value?.payload).toEqual(item);
    expect(isOpen('alarmDetail')).toBe(true);
  });

  it('各 open* 入口映射到对应 kind', () => {
    const ia = useFireAlarmInteraction();
    ia.openAlarmList();
    expect(ia.openKind.value).toBe('alarmList');
    ia.openFacility();
    expect(ia.openKind.value).toBe('facility');
    ia.openPatrol();
    expect(ia.openKind.value).toBe('patrol');
    ia.openVideo();
    expect(ia.openKind.value).toBe('video');
    ia.openStrength();
    expect(ia.openKind.value).toBe('strength');
    ia.openSpecialWork();
    expect(ia.openKind.value).toBe('specialWork');
    ia.openOneKeyBroadcast({ name: '高策' });
    expect(ia.openKind.value).toBe('oneKeyBroadcast');
    expect(ia.current.value?.payload).toEqual({ name: '高策' });
  });

  it('互斥：打开新界面替换当前界面', () => {
    const ia = useFireAlarmInteraction();
    ia.openAlarmDetail({ id: 'x' });
    ia.openFacility();
    expect(ia.openKind.value).toBe('facility');
    expect(ia.isOpen('alarmDetail')).toBe(false);
    expect(ia.isOpen('facility')).toBe(true);
  });

  it('close 清空当前二级界面', () => {
    const ia = useFireAlarmInteraction();
    ia.openVideo();
    ia.close();
    expect(ia.current.value).toBeNull();
    expect(ia.isOpen('video')).toBe(false);
  });

  it('跨调用保持单例状态', () => {
    useFireAlarmInteraction().openStrength();
    expect(useFireAlarmInteraction().openKind.value).toBe('strength');
  });
});
