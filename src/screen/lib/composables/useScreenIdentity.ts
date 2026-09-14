import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

/**
 * 大屏（wujie 子应用沙箱）当前操作员身份。
 *
 * 子应用沙箱独立 Pinia，主壳 useAuthStore 不互通；身份由主壳经
 * `window.$wujie.props` 下传（见 WujieHost.vue sharedProps：user/realName/username）。
 * 业务写操作（如值班签到）需要「谁在操作」的实名，优先取 $wujie.props.realName，
 * 缺失时回退 username / user（角色标识）/ 主壳 auth store。
 */
function readIdentity(): { realName: string; username: string; role: string } {
  const props = window.$wujie?.props as
    { user?: string; realName?: string; username?: string } | undefined;
  if (props) {
    return {
      realName: props.realName ?? '',
      username: props.username ?? '',
      role: props.user ?? '',
    };
  }
  try {
    const auth = useAuthStore();
    return {
      realName: auth.realName ?? '',
      username: auth.username ?? '',
      role: auth.role ?? '',
    };
  } catch {
    return { realName: '', username: '', role: '' };
  }
}

export function useScreenIdentity() {
  const identity = computed(readIdentity);
  /** 用于写操作留痕的展示名：实名优先，缺失时回退登录名，再回退角色。 */
  const displayName = computed(
    () => identity.value.realName || identity.value.username || identity.value.role || '当前用户',
  );
  return { identity, displayName };
}
