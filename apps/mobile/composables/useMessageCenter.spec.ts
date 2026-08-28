import { describe, it, expect } from 'vitest';
import { useMessageCenter } from './useMessageCenter';

describe('useMessageCenter', () => {
  it('loads messages and exposes unread count', async () => {
    const c = useMessageCenter();
    expect(c.loading.value).toBe(false);
    await c.load();
    expect(c.messages.value.length).toBeGreaterThan(0);
    expect(c.unreadCount.value).toBeGreaterThan(0);
  });

  it('filters by category', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    expect(c.activeFilter.value).toBe('alarm');
    expect(c.filtered.value.length).toBeGreaterThan(0);
    expect(c.filtered.value.every((m) => m.category === 'alarm')).toBe(true);
  });

  it('markAllRead clears unread in current filter', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    c.markAllRead();
    expect(c.filtered.value.every((m) => m.read)).toBe(true);
  });

  it('resets to all filter', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('system');
    c.setFilter('all');
    expect(c.filtered.value.length).toBe(c.messages.value.length);
  });
});
