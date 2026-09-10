// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, h, withDirectives, defineComponent } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { vPermission } from '@/directives/permission';
import { useAuthStore } from '@/stores/auth';

/** 挂载一个带 v-permission 的元素，返回挂载根节点 */
function mountProtected(perm: string | string[]): HTMLDivElement {
  const Comp = defineComponent({
    setup() {
      return () =>
        withDirectives(h('div', { id: 'protected', class: 'target' }, 'protected'), [
          [vPermission, perm],
        ]);
    },
  });
  const root = document.createElement('div');
  document.body.appendChild(root);
  createApp(Comp).mount(root);
  return root;
}

describe('v-permission 按钮级权限指令（权限码由 /auth/me 下发）', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.body.innerHTML = '';
    // 权限码由后端 GET /auth/me 下发（V32 起退役前端硬编码 ROLE_PERMS），
    // 指令判定依赖 store 中的 perms 快照，故此处注入一份管理员快照。
    useAuthStore().setMe({
      username: 'admin',
      realName: '系统管理员',
      role: 'ADMIN',
      roles: ['ADMIN'],
      perms: ['fire-alarm:ack', 'fire-alarm:view', 'system:user:view'],
      mustChangePwd: false,
    });
  });

  it('具备权限时元素保留', () => {
    const root = mountProtected('system:user:view');
    expect(root.querySelector('.target')).not.toBeNull();
  });

  it('管理员无对应权限时元素从 DOM 移除', () => {
    const root = mountProtected('system:user:delete');
    expect(root.querySelector('.target')).toBeNull();
  });

  it('数组绑定为 hasAny 语义：任一命中即保留', () => {
    const root = mountProtected(['fire-alarm:ack', 'system:user:view']);
    expect(root.querySelector('.target')).not.toBeNull();
  });

  it('数组绑定全部未命中则移除', () => {
    const root = mountProtected(['system:user:delete', 'unknown:perm']);
    expect(root.querySelector('.target')).toBeNull();
  });

  it('无权限元素不挂载，无需重新渲染', () => {
    const root = mountProtected('system:user:delete');
    expect(root.querySelector('.target')).toBeNull();
  });
});
