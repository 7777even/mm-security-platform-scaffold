import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { setAccessToken, clearAccessToken } from '@/services/token';
import { reportAudit } from '@/services/audit';

// 脚手架阶段：角色权限体系先不展开，统一以单一「管理员」身份登录（待后端 IDP/RBAC 网关下发后再启用多角色）。
export type RoleId = 'admin';

// 角色中文名（界面展示用）
export const ROLE_NAMES: Record<RoleId, string> = {
  admin: '管理员',
};

// 管理员权限码（脚手架阶段授予全部权限；正式环境由 IDP/RBAC 网关按 角色-终端-防区 三维下发替换）
export const ROLE_PERMS: Record<RoleId, string[]> = {
  admin: [
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
    // 附加 fm-* 子应用（由后端 /auth/menus 驱动渲染）
    'rescue:view',
    'typhoon:view',
    'production-area:view',
    'major-hazard:view',
    'communication:view',
    'video-control:view',
    'video-wall:view',
  ],
};

export const useAuthStore = defineStore('auth', () => {
  const roleId = ref<RoleId>('admin');
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
