import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  GIBS_HIMAWARI_IR_LAYER,
  GIBS_MAX_ZOOM,
  GIBS_TILE_MATRIX_SET,
  buildGibsDescribeDomainsUrl,
  buildGibsTileUrl,
  fetchGibsHimawariTimes,
  formatGibsQueryDate,
  parseGibsTimeDomain,
  pickNearestGibsTime,
} from './gibsHimawariApi';

describe('gibsHimawariApi: 时次解析', () => {
  it('解析单个时次', () => {
    expect(parseGibsTimeDomain('2026-09-03T00:00:00Z')).toEqual(['2026-09-03T00:00:00Z']);
  });

  it('按 PT10M 步长展开区间（含首尾）', () => {
    const times = parseGibsTimeDomain('2026-09-03T00:00:00Z/2026-09-03T00:30:00Z/PT10M');
    expect(times).toEqual([
      '2026-09-03T00:00:00Z',
      '2026-09-03T00:10:00Z',
      '2026-09-03T00:20:00Z',
      '2026-09-03T00:30:00Z',
    ]);
  });

  it('按 P1D 步长展开日档（区别于分钟档）', () => {
    const times = parseGibsTimeDomain('2026-09-01T00:00:00Z/2026-09-03T00:00:00Z/P1D');
    expect(times).toEqual(['2026-09-01T00:00:00Z', '2026-09-02T00:00:00Z', '2026-09-03T00:00:00Z']);
  });

  it('展开逗号分隔的多段区间', () => {
    const times = parseGibsTimeDomain(
      '2026-09-03T00:00:00Z/2026-09-03T00:20:00Z/PT10M,2026-09-03T01:00:00Z/2026-09-03T01:10:00Z/PT10M',
    );
    expect(times).toHaveLength(5);
    expect(times[0]).toBe('2026-09-03T00:00:00Z');
    expect(times[4]).toBe('2026-09-03T01:10:00Z');
  });

  it('日期型边界（仅年月日）也可解析', () => {
    const times = parseGibsTimeDomain('2026-09-03/2026-09-03T00:20:00Z/PT10M');
    expect(times[0]).toBe('2026-09-03T00:00:00Z');
    expect(times).toHaveLength(3);
  });

  it('空串返回空数组', () => {
    expect(parseGibsTimeDomain('')).toEqual([]);
  });

  it('超长区间有上限保护，不会无限展开', () => {
    const times = parseGibsTimeDomain('2000-01-01T00:00:00Z/2026-01-01T00:00:00Z/PT10M');
    expect(times.length).toBeLessThanOrEqual(2000);
  });
});

describe('gibsHimawariApi: URL 构造', () => {
  it('瓦片 URL 使用 z/y/x 顺序与 Level6 矩阵集', () => {
    const url = buildGibsTileUrl('2026-09-03T00:00:00Z', 6, 51, 28);
    expect(url).toBe(
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${GIBS_HIMAWARI_IR_LAYER}/default/2026-09-03T00:00:00Z/${GIBS_TILE_MATRIX_SET}/6/28/51.png`,
    );
  });

  it('DescribeDomains URL 携带图层与查询日', () => {
    const url = buildGibsDescribeDomainsUrl(new Date('2026-09-03T12:00:00Z'));
    expect(url).toContain('LAYER=Himawari_AHI_Band13_Clean_Infrared');
    expect(url).toContain('REQUEST=DescribeDomains');
    expect(url).toContain('TIME=2026-09-03T00%3A00%3A00Z');
  });

  it('formatGibsQueryDate 取 UTC 日期', () => {
    expect(formatGibsQueryDate(new Date('2026-09-03T12:00:00Z'))).toBe('2026-09-03');
  });

  it('最大层级为 6（超出后 GIBS 返回 400）', () => {
    expect(GIBS_MAX_ZOOM).toBe(6);
  });
});

describe('gibsHimawariApi: 最近时次选择', () => {
  it('返回时间上最接近的时次', () => {
    const times = ['2026-09-03T00:00:00Z', '2026-09-03T00:10:00Z', '2026-09-03T00:20:00Z'];
    expect(pickNearestGibsTime(Date.parse('2026-09-03T00:12:00Z') / 1000, times)).toBe(
      '2026-09-03T00:10:00Z',
    );
  });

  it('空列表返回 undefined', () => {
    expect(pickNearestGibsTime(0, [])).toBeUndefined();
  });
});

describe('gibsHimawariApi: 时次拉取', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('解析 DescribeDomains 返回的 Domain', async () => {
    const xml =
      '<?xml version="1.0"?><Domains><Domain>2026-09-03T00:00:00Z/2026-09-03T00:20:00Z/PT10M</Domain></Domains>';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => xml }),
    );

    const times = await fetchGibsHimawariTimes(new Date('2026-09-03T12:00:00Z'));
    expect(times).toHaveLength(3);
    expect(times[0]).toBe('2026-09-03T00:00:00Z');
  });

  it('无 Domain 节点时返回空数组', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '<Domains></Domains>' }),
    );
    await expect(fetchGibsHimawariTimes()).resolves.toEqual([]);
  });

  it('非 2xx 抛错', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => '' }),
    );
    await expect(fetchGibsHimawariTimes()).rejects.toThrow('503');
  });
});
