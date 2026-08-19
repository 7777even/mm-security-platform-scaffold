// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { setAccessToken, getAccessToken, clearAccessToken } from '@/services/token';

describe('token 内存态（§5.3 等保红线）', () => {
  beforeEach(() => {
    clearAccessToken();
    localStorage.clear();
  });

  it('set 后 get 可读取', () => {
    setAccessToken('abc123');
    expect(getAccessToken()).toBe('abc123');
  });

  it('clear 后 get 返回 null', () => {
    setAccessToken('abc123');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('不写入 localStorage（禁明文持久化）', () => {
    setAccessToken('secret');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
