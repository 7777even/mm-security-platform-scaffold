// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import MgmtRecordEditDialog, { type FieldDef } from '../MgmtRecordEditDialog.vue';

const FIELDS: FieldDef[] = [
  { prop: 'code', label: '编码', type: 'input', required: true },
  {
    prop: 'action',
    label: '动作',
    type: 'select',
    required: true,
    options: [
      { label: '指派', value: 'ASSIGN' },
      { label: '释放', value: 'RELEASE' },
    ],
  },
  { prop: 'remark', label: '备注', type: 'textarea' },
];

function findSave(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text() === '保存')!;
}

describe('MgmtRecordEditDialog（管理端台账通用弹窗）', () => {
  it('新增模式：必填校验失败时不派发 save', async () => {
    const wrapper = mount(MgmtRecordEditDialog, {
      props: { modelValue: true, editRow: null, fields: FIELDS, title: '测试台账' },
    });
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.emitted('save')).toBeFalsy();
  });

  it('新增模式：填必填项后派发 save 且 id 为 null', async () => {
    const wrapper = mount(MgmtRecordEditDialog, {
      props: { modelValue: true, editRow: null, fields: FIELDS, title: '测试台账' },
    });
    await flushPromises();
    wrapper.vm.form.code = 'C-1';
    wrapper.vm.form.action = 'ASSIGN';
    await flushPromises();
    await findSave(wrapper).trigger('click');
    await flushPromises();
    const emitted = wrapper.emitted('save');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[1]).toBeNull();
    expect(emitted?.[0]?.[0]).toMatchObject({ code: 'C-1', action: 'ASSIGN' });
  });

  it('编辑模式：editRow 带 id 时预填表单且 save 携带 id', async () => {
    const wrapper = mount(MgmtRecordEditDialog, {
      props: {
        modelValue: true,
        editRow: { id: 9, code: 'C-9', action: 'RELEASE', remark: '历史备注' },
        fields: FIELDS,
        title: '测试台账',
      },
    });
    await flushPromises();
    // watch(editRow, immediate) 已预填
    expect(wrapper.vm.form.code).toBe('C-9');
    expect(wrapper.vm.form.action).toBe('RELEASE');
    expect(wrapper.vm.isEdit).toBe(true);

    await findSave(wrapper).trigger('click');
    await flushPromises();
    const emitted = wrapper.emitted('save');
    expect(emitted?.[0]?.[1]).toBe(9);
    expect(emitted?.[0]?.[0]).toMatchObject({ code: 'C-9', action: 'RELEASE' });
  });
});
