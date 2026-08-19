import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { getAccessToken, clearAccessToken } from '@/services/token';

describe('auth store：§5.3 令牌内存态', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    clearAccessToken();
  });

  it('login 后写入内存令牌且可被 http 拦截读取', () => {
    const auth = useAuthStore();
    auth.login();
    expect(auth.accessToken).not.toBeNull();
    expect(getAccessToken()).toBe(auth.accessToken);
  });

  it('logout 后清空内存令牌', () => {
    const auth = useAuthStore();
    auth.login('tok-123');
    auth.logout();
    expect(auth.accessToken).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
