import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/services/http', () => ({
  request: vi.fn(),
  default: { get: vi.fn() },
  http: { get: vi.fn() },
}));

import { request } from '@/services/http';
import http from '@/services/http';
import {
  fetchVideoNavigation,
  fetchVideoWallNavigation,
  fetchImportantVideoGroups,
  fetchVideoCameras,
  createVideoCamera,
  updateVideoCamera,
  deleteVideoCamera,
  fetchVideoLinkages,
  fetchVideoLinkageRules,
  createVideoLinkage,
  updateVideoLinkage,
  deleteVideoLinkage,
  fetchVideoSnapshotUrl,
  fetchVideoLinkageOptions,
} from './video';

const fn = request as unknown as ReturnType<typeof vi.fn>;
const httpGet = (http as unknown as { get: ReturnType<typeof vi.fn> }).get;

describe('video 域（2026-10-05 覆盖率修复）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_BASE', 'http://api.example.com');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'false');
    fn.mockResolvedValue([]);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('基础导航/分组/联动选项拉取', async () => {
    await fetchVideoNavigation();
    await fetchVideoWallNavigation();
    await fetchImportantVideoGroups();
    await fetchVideoLinkageOptions();
    expect(fn).toHaveBeenCalled();
  });

  it('摄像头分页与写端点（增改删）', async () => {
    await fetchVideoCameras(1, 9);
    await createVideoCamera({} as never);
    await updateVideoCamera(1, {} as never);
    await deleteVideoCamera(1);
    expect(fn).toHaveBeenCalled();
  });

  it('视频联动 规则查询与写端点（增改删）', async () => {
    await fetchVideoLinkages();
    await fetchVideoLinkageRules('CFG-1');
    await createVideoLinkage({} as never);
    await updateVideoLinkage('CFG-1', {} as never);
    await deleteVideoLinkage('CFG-1');
    expect(fn).toHaveBeenCalled();
  });

  it('视频快照 URL 拉取', async () => {
    httpGet.mockResolvedValue({ data: 'blobdata' });
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn().mockReturnValue('blob://x') });
    const url = await fetchVideoSnapshotUrl(1);
    expect(httpGet).toHaveBeenCalled();
    expect(url).toBe('blob://x');
    vi.unstubAllGlobals();
  });
});
