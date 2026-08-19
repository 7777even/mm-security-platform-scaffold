import { describe, it, expect } from 'vitest';
import { isHardControl, guardHardControl, HardControlViolation } from '@/services/hardControlGuard';

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

  it('guardHardControl 命中抛 HardControlViolation', () => {
    expect(() => guardHardControl('/sprinkler/control')).toThrow(HardControlViolation);
  });

  it('guardHardControl 放行软协同', () => {
    expect(() => guardHardControl('/fire-alarm/ack')).not.toThrow();
  });
});
