import { describe, it, expect } from 'vitest';
import { CATEGORY_LABELS, MESSAGE_CATEGORIES, fetchMessages } from './message';

describe('message service', () => {
  it('exposes 4 categories with labels', () => {
    expect(MESSAGE_CATEGORIES).toHaveLength(4);
    expect(CATEGORY_LABELS.alarm).toBe('报警通知');
    expect(CATEGORY_LABELS.event).toBe('事件通知');
    expect(CATEGORY_LABELS.task).toBe('任务通知');
    expect(CATEGORY_LABELS.system).toBe('系统通知');
  });

  it('fetchMessages returns items with required fields', async () => {
    const list = await fetchMessages();
    expect(list.length).toBeGreaterThan(0);
    for (const m of list) {
      expect(['id', 'category', 'title', 'summary', 'time', 'read'].every((k) => k in m)).toBe(
        true,
      );
    }
  });

  it('includes unread items for badge demo', async () => {
    expect((await fetchMessages()).some((m) => !m.read)).toBe(true);
  });

  it('covers all 4 categories in mock', async () => {
    const set = new Set((await fetchMessages()).map((m) => m.category));
    expect(MESSAGE_CATEGORIES.every((c) => set.has(c))).toBe(true);
  });
});
