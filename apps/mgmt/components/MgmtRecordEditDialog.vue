<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { type FormInstance, type FormRules } from 'element-plus';

// 管理端台账「新增/编辑」通用弹窗（schema 驱动）。
//
// 背景：mgmt 有 30+ 个台账模块需要补齐 CRUD，若每个模块各写一个弹窗会产生大量重复代码。
// 这里用字段定义数组（FieldDef）驱动表单渲染与校验，模块侧只需声明字段清单 + 枚举选项。
//
// 约定：
// - 新增：editRow 为空 → emit('save', payload)；编辑：editRow 带 id → emit('save', payload, id)
// - 具体写接口由父组件调用（service 调用保持在视图层，与既有模式一致）
// - 枚举字段一律 type='select' + options（有既定字典/枚举取值才用下拉，无字典用 input，绝不臆造）

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDef {
  /** 字段名（与后端写请求字段同名）。 */
  prop: string;
  /** 中文标签。 */
  label: string;
  /** 控件类型。select 用于有既定枚举的字段；date 用于时间；textarea 用于长文本。 */
  type: 'input' | 'textarea' | 'select' | 'date' | 'number';
  /** 是否必填（参与表单校验）。 */
  required?: boolean;
  /** select 的选项（有既定字典/枚举取值时必填）。 */
  options?: FieldOption[];
  /** 编辑态禁用（如唯一编码 / 主键，避免改后出现语义歧义）。 */
  disabledOnEdit?: boolean;
  /** 仅 type='date' 生效：日期选择器精度，默认 datetime。 */
  dateType?: 'date' | 'datetime';
  /** 仅 type='date' 生效：提交格式，默认 YYYY-MM-DD HH:mm:ss（date 精度时通常传 YYYY-MM-DD）。 */
  valueFormat?: string;
  placeholder?: string;
}

const props = defineProps<{
  modelValue: boolean;
  editRow: Record<string, unknown> | null;
  fields: FieldDef[];
  title: string;
  /** 主键字段名，默认 id。 */
  idKey?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'save', payload: Record<string, unknown>, id: number | null): void;
}>();

const formRef = ref<FormInstance>();
const isEdit = computed(() => props.editRow != null && props.editRow[props.idKey ?? 'id'] != null);
const recordId = computed<number | null>(() => {
  const raw = props.editRow?.[props.idKey ?? 'id'];
  return typeof raw === 'number' ? raw : raw == null ? null : Number(raw);
});

const form = reactive<Record<string, unknown>>({});

const rules = computed<FormRules>(() => {
  const r: FormRules = {};
  for (const f of props.fields) {
    if (f.required) {
      r[f.prop] = [
        {
          required: true,
          message: f.type === 'select' ? `请选择${f.label}` : `请输入${f.label}`,
          trigger: f.type === 'select' || f.type === 'date' ? 'change' : 'blur',
        },
      ];
    }
  }
  return r;
});

function blankValue(f: FieldDef): unknown {
  return f.type === 'number' ? null : '';
}

watch(
  () => [props.editRow, props.fields] as const,
  () => {
    const next: Record<string, unknown> = {};
    for (const f of props.fields) next[f.prop] = blankValue(f);
    if (props.editRow) {
      for (const f of props.fields) {
        const v = props.editRow[f.prop];
        if (v !== undefined && v !== null) next[f.prop] = v;
      }
    }
    Object.assign(form, next);
  },
  { immediate: true, deep: true },
);

function isDisabled(f: FieldDef): boolean {
  return Boolean(f.disabledOnEdit && isEdit.value);
}

async function submit(): Promise<void> {
  if (!formRef.value) return;
  await formRef.value.validate((ok: boolean) => {
    if (!ok) return;
    const payload: Record<string, unknown> = {};
    for (const f of props.fields) {
      const v = form[f.prop];
      if (v === '' || v === null || v === undefined) continue;
      payload[f.prop] = v;
    }
    emit('save', payload, isEdit.value ? recordId.value : null);
  });
}

defineExpose({ form, isEdit });
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? `编辑${title}` : `新增${title}`"
    width="640px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="108px">
      <el-form-item v-for="f in fields" :key="f.prop" :label="f.label" :prop="f.prop">
        <el-select
          v-if="f.type === 'select'"
          :model-value="form[f.prop] as string"
          :disabled="isDisabled(f)"
          :placeholder="f.placeholder ?? `请选择${f.label}`"
          style="width: 100%"
          @update:model-value="(v: string | number | undefined) => (form[f.prop] = v ?? '')"
        >
          <el-option
            v-for="opt in f.options ?? []"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-date-picker
          v-else-if="f.type === 'date'"
          :model-value="form[f.prop] as string"
          :type="f.dateType ?? 'datetime'"
          :value-format="f.valueFormat ?? 'YYYY-MM-DD HH:mm:ss'"
          :format="f.valueFormat ?? 'YYYY-MM-DD HH:mm:ss'"
          :disabled="isDisabled(f)"
          :placeholder="f.placeholder ?? `选择${f.label}`"
          style="width: 100%"
          @update:model-value="(v: string | null) => (form[f.prop] = v ?? '')"
        />

        <el-input-number
          v-else-if="f.type === 'number'"
          :model-value="form[f.prop] as number"
          :disabled="isDisabled(f)"
          style="width: 100%"
          @update:model-value="(v: number | null | undefined) => (form[f.prop] = v ?? null)"
        />

        <el-input
          v-else
          :model-value="form[f.prop] as string"
          :type="f.type === 'textarea' ? 'textarea' : 'text'"
          :rows="f.type === 'textarea' ? 2 : undefined"
          :disabled="isDisabled(f)"
          :placeholder="f.placeholder ?? `请输入${f.label}`"
          @update:model-value="(v: string | number) => (form[f.prop] = v)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
