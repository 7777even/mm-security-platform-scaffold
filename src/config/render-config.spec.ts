import { describe, it, expect, vi, afterEach } from 'vitest';
import { RENDER_PRESETS, resolveRenderTier, getRenderConfig } from './render-config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('render-config 预设', () => {
  it('low 档为弱 GPU 激进降负（对应原生产硬编码）', () => {
    const low = RENDER_PRESETS.low;
    expect(low.resolutionScale).toBe(0.6);
    expect(low.msaaSamples).toBe(0);
    expect(low.globeMaximumScreenSpaceError).toBe(8);
    expect(low.globePreloadAncestors).toBe(false);
    expect(low.globePreloadSiblings).toBe(false);
    expect(low.skyAtmosphereShow).toBe(false);
    expect(low.sunShow).toBe(false);
    expect(low.fxaaEnabled).toBe(false);
  });

  it('high 档接近 Cesium 默认清晰度（独立显卡/开发机）', () => {
    const high = RENDER_PRESETS.high;
    expect(high.resolutionScale).toBe(1.0);
    expect(high.msaaSamples).toBe(4);
    expect(high.globeMaximumScreenSpaceError).toBe(2);
    expect(high.skyAtmosphereShow).toBe(true);
    expect(high.fxaaEnabled).toBe(true);
  });
});

describe('resolveRenderTier 档位解析', () => {
  it('缺省为 low（保持原生产降负行为，不依赖探测准确性）', () => {
    expect(resolveRenderTier()).toBe('low');
  });

  it('VITE_CESIUM_RENDER_TIER=high/low 显式覆盖', () => {
    vi.stubEnv('VITE_CESIUM_RENDER_TIER', 'high');
    expect(resolveRenderTier()).toBe('high');
    vi.stubEnv('VITE_CESIUM_RENDER_TIER', 'low');
    expect(resolveRenderTier()).toBe('low');
  });

  it('auto 在无 WebGL 环境下回落 high', () => {
    vi.stubEnv('VITE_CESIUM_RENDER_TIER', 'auto');
    expect(resolveRenderTier()).toBe('high');
  });
});

describe('getRenderConfig 配置合成', () => {
  it('默认 low 配置 resolutionScale=0.6', () => {
    expect(getRenderConfig().resolutionScale).toBe(0.6);
  });

  it('VITE_CESIUM_RESOLUTION_SCALE 单独覆盖 resolutionScale，其余取预设', () => {
    vi.stubEnv('VITE_CESIUM_RESOLUTION_SCALE', '0.5');
    const rc = getRenderConfig();
    expect(rc.resolutionScale).toBe(0.5);
    expect(rc.msaaSamples).toBe(0); // 仍为 low 档
  });

  it('high 档 + 覆盖 resolutionScale 仍生效', () => {
    vi.stubEnv('VITE_CESIUM_RENDER_TIER', 'high');
    vi.stubEnv('VITE_CESIUM_RESOLUTION_SCALE', '0.8');
    const rc = getRenderConfig();
    expect(rc.resolutionScale).toBe(0.8);
    expect(rc.msaaSamples).toBe(4); // 仍为 high 档
  });
});
