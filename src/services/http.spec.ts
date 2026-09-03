import { describe, it, expect, beforeEach, vi } from 'vitest';
import http from '@/services/http';
import { setAccessToken, clearAccessToken } from '@/services/token';
import type { AxiosAdapter, AxiosHeaders, AxiosResponse } from 'axios';
import {
  SIGN_HEADER_TIMESTAMP,
  SIGN_HEADER_NONCE,
  SIGN_HEADER_SIGNATURE,
} from '@/services/requestSigner';

// 让防重放签名在生产开关为 true 的测试环境下确定性启用
vi.mock('@/services/requestSigner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/requestSigner')>()),
  isSigningEnabled: () => true,
  buildSignature: vi.fn(async () => 'sig-fixed'),
  createNonce: vi.fn(() => 'nonce-fixed'),
}));

// §5.3 集成断言：请求拦截应注入 Authorization: Bearer <token>，且无令牌时不注入。
// 通过 per-request 自定义 adapter 捕获经请求拦截后的最终 config.headers / config.data。
function captureAdapter(captured: { headers?: AxiosHeaders; data?: unknown }) {
  const adapter: AxiosAdapter = (config) => {
    captured.headers = config.headers;
    captured.data = config.data;
    const resp: AxiosResponse = {
      data: { code: 0, message: 'ok', data: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    };
    return Promise.resolve(resp);
  };
  return adapter;
}

describe('http 请求拦截：§5.3 注入 Authorization', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('存在内存令牌时注入 Authorization: Bearer <token>', async () => {
    setAccessToken('tok-abc');
    const captured: { headers?: AxiosHeaders } = {};
    await http.request({
      url: '/test',
      method: 'GET',
      adapter: captureAdapter(captured),
    });
    expect(captured.headers?.get('Authorization')).toBe('Bearer tok-abc');
  });

  it('无令牌时不注入 Authorization', async () => {
    const captured: { headers?: AxiosHeaders } = {};
    await http.request({
      url: '/test',
      method: 'GET',
      adapter: captureAdapter(captured),
    });
    expect(captured.headers?.get('Authorization')).toBeUndefined();
  });
});

describe('http 请求拦截：防重放签名头', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('存在令牌且签名启用时注入 X-Timestamp / X-Nonce / X-Signature', async () => {
    setAccessToken('tok-abc');
    const captured: { headers?: AxiosHeaders } = {};
    await http.request({
      url: '/test',
      method: 'GET',
      adapter: captureAdapter(captured),
    });
    expect(captured.headers?.get(SIGN_HEADER_TIMESTAMP)).toMatch(/^\d+$/);
    expect(captured.headers?.get(SIGN_HEADER_NONCE)).toBe('nonce-fixed');
    expect(captured.headers?.get(SIGN_HEADER_SIGNATURE)).toBe('sig-fixed');
  });

  it('无令牌时不注入签名头', async () => {
    const captured: { headers?: AxiosHeaders } = {};
    await http.request({
      url: '/test',
      method: 'GET',
      adapter: captureAdapter(captured),
    });
    expect(captured.headers?.get(SIGN_HEADER_TIMESTAMP)).toBeUndefined();
    expect(captured.headers?.get(SIGN_HEADER_NONCE)).toBeUndefined();
    expect(captured.headers?.get(SIGN_HEADER_SIGNATURE)).toBeUndefined();
  });
});

describe('http 请求拦截：Strict-XSS 出站净化', () => {
  it('纯 JSON 请求体字符串字段被 HTML 转义', async () => {
    const body = { name: '<script>alert(1)</script>', note: 'a & b' };
    const captured: { data?: unknown } = {};
    await http.request({
      url: '/test',
      method: 'POST',
      data: body,
      adapter: captureAdapter(captured),
    });
    const raw = typeof captured.data === 'string' ? captured.data : JSON.stringify(captured.data);
    expect(raw).toContain('&lt;script&gt;');
    expect(raw).not.toContain('<script>');
    expect(raw).toContain('a &amp; b');
  });
});

describe('http 请求拦截：零下行控制硬控拦截', () => {
  it('命中硬控黑名单路径的请求被 HardControlViolation 拒绝', async () => {
    await expect(
      http.request({
        url: '/fire-pump/start',
        method: 'POST',
        adapter: captureAdapter({}),
      }),
    ).rejects.toThrow(/hard-control/);
  });

  it('普通路径不受硬控拦截', async () => {
    const captured: { headers?: AxiosHeaders } = {};
    await expect(
      http.request({
        url: '/api/alarm/list',
        method: 'GET',
        adapter: captureAdapter(captured),
      }),
    ).resolves.toBeDefined();
    expect(captured.headers?.get('Authorization')).toBeUndefined();
  });
});
