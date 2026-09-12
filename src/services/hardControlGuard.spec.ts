import { describe, it, expect } from 'vitest';
import {
  isHardControl,
  guardHardControl,
  applyHardControlPaths,
  HardControlViolation,
} from '@/services/hardControlGuard';

describe('hardControlGuard 零下行控制红线（D1 C-3）', () => {
  it('命中硬控路径', () => {
    expect(isHardControl('/fire-pump/start')).toBe(true);
    expect(isHardControl('/broadcast/force-cut')).toBe(true);
    expect(isHardControl('/door-lock/power-off')).toBe(true);
    expect(isHardControl('/evacuation/trigger')).toBe(true);
    expect(isHardControl('/sprinkler/control')).toBe(true);
  });

  it('软协同/只读路径不命中', () => {
    expect(isHardControl('/dashboard')).toBe(false);
    expect(isHardControl('/audit/log')).toBe(false);
    expect(isHardControl('/fire-alarm/ack')).toBe(false);
  });

  it('后端历史命名路径同样命中（D5 单一真源，补齐此前前端未覆盖的缺口）', () => {
    expect(isHardControl('/devices/cmd')).toBe(true);
    expect(isHardControl('/fire/release')).toBe(true);
    expect(isHardControl('/doors/lock')).toBe(true);
    expect(isHardControl('/broadcast/issue')).toBe(true);
    expect(isHardControl('/emergency/trigger')).toBe(true);
  });

  it('applyHardControlPaths 可用后端清单校准，空项与非法项忽略', () => {
    applyHardControlPaths(['/api/v1/foo/bar', '', '  ', 'pump/start']);
    expect(isHardControl('/foo/bar')).toBe(true);
    expect(isHardControl('/pump/start')).toBe(true);
    applyHardControlPaths([]); // 复位，避免污染其他用例
  });

  it('guardHardControl 命中抛 HardControlViolation', () => {
    expect(() => guardHardControl('/sprinkler/control')).toThrow(HardControlViolation);
  });

  it('guardHardControl 放行软协同', () => {
    expect(() => guardHardControl('/fire-alarm/ack')).not.toThrow();
  });
});
