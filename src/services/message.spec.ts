import { describe, it, expect } from 'vitest';
import { fetchMessages, levelLabel } from './message';

describe('message service', () => {
  it('返回演示消息且三条语义级别齐备', async () => {
    const list = await fetchMessages();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    const levels = new Set(list.map((m) => m.level));
    expect(levels.has('system')).toBe(true);
    expect(levels.has('alarm')).toBe(true);
    expect(levels.has('disposition')).toBe(true);
  });

  it('每条消息含 id 与文本', async () => {
    const list = await fetchMessages();
    for (const m of list) {
      expect(typeof m.id).toBe('string');
      expect(m.text.length).toBeGreaterThan(0);
    }
  });

  it('levelLabel 映射正确', () => {
    expect(levelLabel('alarm')).toBe('报警');
    expect(levelLabel('disposition')).toBe('处置');
    expect(levelLabel('system')).toBe('系统');
  });
});
