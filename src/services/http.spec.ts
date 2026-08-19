import { describe, it, expect, beforeEach } from 'vitest';
import http from '@/services/http';
import { setAccessToken, clearAccessToken } from '@/services/token';
import type { AxiosAdapter, AxiosHeaders, AxiosResponse } from 'axios';

// §5.3 集成断言：请求拦截应注入 Authorization: Bearer <token>，且无令牌时不注入。
// 通过 per-request 自定义 adapter 捕获经请求拦截后的最终 config.headers。
function captureAdapter(captured: { headers?: AxiosHeaders }) {
  const adapter: AxiosAdapter = (config) => {
    captured.headers = config.headers;
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
