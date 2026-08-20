// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MapPin from './MapPin.vue';

describe('MapPin — §10.3', () => {
  it.each([1, 2, 3, 4] as const)('level=%s 渲染对应发光等级类', (level) => {
    const w = mount(MapPin, { props: { level } });
    expect(w.find('span').classes()).toContain(`map-pin--l${level}`);
  });

  it('无 icon 时显示默认 !', () => {
    const w = mount(MapPin, { props: { level: 1 } });
    expect(w.text()).toContain('!');
  });
});
