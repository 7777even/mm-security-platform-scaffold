import { describe, it, expect } from 'vitest';
import { MAP_TILE_URL } from '@/constants/map';

describe('map 瓦片源（§9.4 离线）', () => {
  it('默认同源离线瓦片，不请求公网', () => {
    expect(MAP_TILE_URL).toBe('/tiles/{z}/{x}/{y}.png');
  });
});
