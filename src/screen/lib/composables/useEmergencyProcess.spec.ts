import { describe, it, expect, vi, afterEach } from 'vitest';

// 应急流程全景取数三态：demo 用本地默认值；offline 置空 + 显式报错；live 走真实后端。
// DEMO_MODE 在模块加载时求值，故每个用例 resetModules + 动态 import 以获得干净实例。
describe('useEmergencyProcess 取数三态', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('offline（无 base 且未开演示）：流程数据为空且 loader 显式报错', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    vi.resetModules();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('./useEmergencyProcess');
    const api = mod.useEmergencyProcess();

    expect(api.stages).toHaveLength(0);
    expect(api.phases.value).toHaveLength(0);
    expect(api.currentStage.value.name).toBe('');

    await mod.loadEmergencyProcessRemote();
    await mod.loadNodeConfigsRemote();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/emergency/process'));
    // offline 时不应请求后端
    expect(api.stages).toHaveLength(0);
  });

  it('demo（VITE_USE_DEV_MOCK=true）：用本地默认值', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    vi.resetModules();
    const mod = await import('./useEmergencyProcess');
    const api = mod.useEmergencyProcess();

    expect(api.stages.length).toBeGreaterThan(0);
    expect(api.phases.value.length).toBeGreaterThan(0);
    expect(api.currentStage.value.name).not.toBe('');
  });
});
