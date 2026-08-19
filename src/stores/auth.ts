import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
    'fire-alarm:view',
    'fire-alarm:ack',
    'video:view',
    'system:user:view',
    'system:device-code:view',
    'mobile:field-report:view',
  ],
  dispatcher: [
    'dashboard:view',
    'fire-alarm:view',
    'fire-alarm:ack',
    'video:view',
    'mobile:field-report:view',
  ],
  'shift-leader': ['dashboard:view', 'fire-alarm:view', 'video:view', 'mobile:field-report:view'],
  'operator-inner': ['dashboard:view', 'fire-alarm:view'],
  'operator-outer': ['fire-alarm:view'],
};

export const useAuthStore = defineStore('auth', () => {
  const roleId = ref<RoleId>('commander');
  const perms = computed(() => ROLE_PERMS[roleId.value]);

  function setRole(id: RoleId): void {
    roleId.value = id;
  }

  function hasPerm(perm: string): boolean {
    return perms.value.includes(perm);
  }

  function hasAny(permsList: string[]): boolean {
    return permsList.some((p) => hasPerm(p));
  }

  return { roleId, perms, setRole, hasPerm, hasAny };
});
