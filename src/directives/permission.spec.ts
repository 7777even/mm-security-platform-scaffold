// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, h, withDirectives, defineComponent } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { vPermission } from '@/directives/permission';

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

describe('v-permission 按钮级权限指令（脚手架阶段：单一管理员身份，授予全部权限）', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.body.innerHTML = '';
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
