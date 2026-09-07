import { describe, it, expect } from 'vitest';
import { resolveTileSource, type WeatherTileSourceId } from './weatherTileSources';

describe('weatherTileSources: 层级 → 源解析', () => {
  it('z=0 使用 JMA', () => {
    const r = resolveTileSource(0);
    expect<WeatherTileSourceId>(r.id).toBe('jma');
    expect(r.maxNativeZoom).toBe(5);
    expect(r.capped).toBe(false);
  });

  it('z=5 仍使用 JMA（JMA 的最大可用层级，z6 返回 404）', () => {
    const r = resolveTileSource(5);
    expect(r.id).toBe('jma');
    expect(r.maxNativeZoom).toBe(5);
    expect(r.capped).toBe(false);
  });

  it('z=6 切到 GIBS IR，且尚未封顶', () => {
    const r = resolveTileSource(6);
    expect(r.id).toBe('gibs-ir');
    expect(r.maxNativeZoom).toBe(6);
    expect(r.capped).toBe(false);
  });

  it('z=7 仍用 GIBS IR 但标记封顶（10 分钟级源物理上限 2km）', () => {
    const r = resolveTileSource(7);
    expect(r.id).toBe('gibs-ir');
    expect(r.maxNativeZoom).toBe(6);
    expect(r.capped).toBe(true);
  });

  it('z=9 封顶标记保持为真', () => {
    const r = resolveTileSource(9);
    expect(r.id).toBe('gibs-ir');
    expect(r.maxNativeZoom).toBe(6);
    expect(r.capped).toBe(true);
  });

  it('极端层级（z=18）不越界且仍封顶', () => {
    const r = resolveTileSource(18);
    expect(r.maxNativeZoom).toBe(6);
    expect(r.capped).toBe(true);
  });

  it('非法层级回落到 JMA 而非抛错', () => {
    expect(resolveTileSource(Number.NaN).id).toBe('jma');
    expect(resolveTileSource(-3).id).toBe('jma');
  });

  it('解析结果带可用于来源行展示的标签', () => {
    expect(resolveTileSource(3).label).toContain('JMA');
    expect(resolveTileSource(6).label).toContain('GIBS');
  });
});
