// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlarmCard from './AlarmCard.vue';

describe('AlarmCard — §9.2', () => {
  it.each([1, 2, 3, 4] as const)('level=%s 时渲染对应左侧强调色类', (level) => {
    const w = mount(AlarmCard, {
      props: { level, title: 'A 装置区火灾', time: '2026-03-17 14:21:30' },
    });
    expect(w.find('.alarm-card').classes()).toContain(`alarm-card--l${level}`);
    expect(w.find('.alarm-card__dot').classes()).toContain(`tone-alarm-${level}`);
  });

  it('time 与 desc 可选；缺省时不渲染对应块', () => {
    const w = mount(AlarmCard, { props: { level: 1, title: 'X' } });
    expect(w.find('.alarm-card__meta').exists()).toBe(false);
    expect(w.find('.alarm-card__desc').exists()).toBe(false);
  });
});
