import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setAccessToken, clearAccessToken } from '@/services/token';
import { logout as logoutApi, fetchCurrentUser, refresh } from '@/services/auth';
import type { MeResult } from '@/services/auth';
import { reportAudit } from '@/services/audit';
import { subscribeDomainChange, setRealtimeTokenRefresher } from '@/services/realtime';

// 权限来源后端化（rbac-permission spec §权限来源后端化）：
// 权限码不再硬编码在前端（旧 ROLE_PERMS 已退役），改由 GET /auth/me 的 perms 下发，
// 数据源为后端 sys_role_menu → sys_menu.perm_code（角色授权变更即时生效）。
// mustChangePwd=true 时前端须强制跳转改密页（后端亦在变更类请求上兜底拒绝）。

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const username = ref('');
  const realName = ref('');
  /** 当前角色标识（单角色，如 ADMIN / SCHEDULER） */
  const role = ref('');
  /** 角色标识列表（当前为长度 ≤1 的列表，预留多角色演进） */
  const roles = ref<string[]>([]);
  /** 权限码全集（后端下发，前端判定的唯一来源） */
  const perms = ref<string[]>([]);
  /** 是否需强制修改口令 */
  const mustChangePwd = ref(false);

  /** 写入后端下发的用户与权限快照 */
  function setMe(me: MeResult): void {
    username.value = me.username ?? '';
    realName.value = me.realName ?? '';
    role.value = me.role ?? '';
    roles.value = Array.isArray(me.roles) ? [...me.roles] : [];
    perms.value = Array.isArray(me.perms) ? [...me.perms] : [];
    mustChangePwd.value = Boolean(me.mustChangePwd);
  }

  /** 清空身份快照（未登录 / 401） */
  function clearMe(): void {
    username.value = '';
    realName.value = '';
    role.value = '';
    roles.value = [];
    perms.value = [];
    mustChangePwd.value = false;
  }

  /**
   * 记录登录令牌。
   * - 真实后端模式：传入 /auth/login 返回的 accessToken；
   * - dev 自包含 mock 模式：不传参，落一个占位令牌供 devMock 适配器识别。
   */
  function login(token?: string): void {
    const t = token ?? `mock-${Date.now()}`;
    setAccessToken(t);
    accessToken.value = t;
    reportAudit({ action: 'login', module: role.value || 'anonymous' });
  }

  // 主动登出：先同步清本地内存态（保持同步语义，单测友好），
  // 再 fire-and-forget 通知后端清除 HttpOnly 刷新 Cookie（rt），后端失败不阻塞本地登出。
  function logout(): void {
    clearAccessToken();
    accessToken.value = null;
    clearMe();
    void logoutApi().catch(() => {});
  }

  /** 拉取并写入后端下发的身份与权限快照（启动装配路由前必须完成） */
  async function loadMe(): Promise<MeResult> {
    const me = await fetchCurrentUser();
    setMe(me);
    return me;
  }

  function hasPerm(perm: string): boolean {
    return perms.value.includes(perm);
  }

  function hasAny(permsList: string[]): boolean {
    return permsList.some((p) => hasPerm(p));
  }

  // 三端实时刷新（realtime-channel spec）：管理员在任何端改动「本用户」账号 / 角色 / 菜单授权（system.user 域），
  // 本端重取 /auth/me 刷新权限快照，实现授权变更即时生效。未登录（无内存令牌）时跳过，避免无 token 触发 401。
  async function refetchMe(): Promise<void> {
    if (!accessToken.value) return;
    try {
      setMe(await fetchCurrentUser());
    } catch {
      // 401 / 网络异常：保持现有快照，交由 http 层统一处理
    }
  }

  subscribeDomainChange('system.user', () => {
    void refetchMe();
  });

  // 注册实时通道令牌刷新器（单向依赖 realtime，避免循环引用）：
  // WS 握手被拒（access 令牌失效）时，由 ws.ts 触发一次续期（依赖 HttpOnly 刷新 Cookie）。
  // 成功则将新令牌写入内存态；失败（刷新 Cookie 亦失效）返回 false，由实时层退回退避重连。
  async function refreshRealtimeToken(): Promise<boolean> {
    try {
      const res = await refresh();
      setAccessToken(res.accessToken);
      accessToken.value = res.accessToken;
      return true;
    } catch {
      return false;
    }
  }

  setRealtimeTokenRefresher(refreshRealtimeToken);

  return {
    accessToken,
    username,
    realName,
    role,
    roles,
    perms,
    mustChangePwd,
    setMe,
    clearMe,
    login,
    logout,
    loadMe,
    refetchMe,
    hasPerm,
    hasAny,
  };
});
