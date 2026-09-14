import { computed, type ComputedRef } from 'vue';
import { useAuthStore } from '@/stores/auth';

/**
 * 大屏（wujie 子应用沙箱）权限判定。
 *
 * 子应用沙箱自带独立 Pinia，与主壳 auth store 不互通；权限集由主壳经
 * `window.$wujie.props.perms` 下传（见 WujieHost.vue sharedProps）。
 * 主壳直渲 / vite 独立开发场景（无 $wujie）回退到主壳 useAuthStore。
 *
 * 注意：主应用 `usePermission`（@/composables/usePermission）依赖主壳 Pinia，
 * 在沙箱内 store 为空会恒返回 false，故大屏组件必须用本 composable。
 */
function readPerms(): string[] {
  const fromWujie = window.$wujie?.props?.perms;
  if (Array.isArray(fromWujie)) return fromWujie as string[];
  try {
    return useAuthStore().perms ?? [];
  } catch {
    return [];
  }
}

export function useScreenPermission() {
  const perms: ComputedRef<string[]> = computed<string[]>(readPerms);

  function hasPerm(perm: string): boolean {
    return perms.value.includes(perm);
  }

  function hasAny(permissionList: string[]): boolean {
    return permissionList.some((p) => perms.value.includes(p));
  }

  return { perms, hasPerm, hasAny };
}
