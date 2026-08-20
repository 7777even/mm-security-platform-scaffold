import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { setAccessToken, clearAccessToken } from '@/services/token';
import { reportAudit } from '@/services/audit';

// 五类角色：总指挥 / 值班调度 / 属地班长 / 内操 / 外操（rbac-permission spec §角色-终端-防区映射）
export type RoleId =
  'commander' | 'dispatcher' | 'shift-leader' | 'operator-inner' | 'operator-outer';

// 角色中文名（界面展示用）
export const ROLE_NAMES: Record<RoleId, string> = {
  commander: '总指挥',
  dispatcher: '值班调度',
  'shift-leader': '属地班长',
  'operator-inner': '内操',
  'operator-outer': '外操',
};

// Mock 角色权限表；正式环境由 IDP/RBAC 网关按 角色-终端-防区 三维下发替换
export const ROLE_PERMS: Record<RoleId, string[]> = {
  commander: [
    'dashboard:view',
    'weather:view',
    'fire-alarm:view',
    'fire-alarm:ack',
    'security:view',
    'video:view',
    'ops:view',
    'system:user:view',
    'system:device-code:view',
    'mobile:field-report:view',
  ],
  dispatcher: [
    'dashboard:view',
    'weather:view',
    'fire-alarm:view',
    'fire-alarm:ack',
    'security:view',
    'video:view',
    'mobile:field-report:view',
  ],
  'shift-leader': [
    'dashboard:view',
    'weather:view',
    'fire-alarm:view',
    'security:view',
    'video:view',
    'mobile:field-report:view',
  ],
  'operator-inner': ['dashboard:view', 'fire-alarm:view'],
  'operator-outer': ['fire-alarm:view'],
};

export const useAuthStore = defineStore('auth', () => {
  const roleId = ref<RoleId>('commander');
  const perms = computed(() => ROLE_PERMS[roleId.value]);
  const accessToken = ref<string | null>(null);

  function setRole(id: RoleId): void {
    roleId.value = id;
  }

  // Mock 登录（S1 §5.3）：正式环境由 IDP SSO 下发 access token 并写入内存态；
  // 刷新令牌由后端种入 HttpOnly Cookie，浏览器自动随请求发送，前端 JS 不可读。
  function login(token?: string): void {
    const t = token ?? `mock-${roleId.value}-${Date.now()}`;
    setAccessToken(t);
    accessToken.value = t;
    reportAudit({ action: 'login', module: roleId.value });
  }

  function logout(): void {
    clearAccessToken();
    accessToken.value = null;
  }

  function hasPerm(perm: string): boolean {
    return perms.value.includes(perm);
  }

  function hasAny(permsList: string[]): boolean {
    return permsList.some((p) => hasPerm(p));
  }

  return { roleId, perms, accessToken, setRole, login, logout, hasPerm, hasAny };
});
