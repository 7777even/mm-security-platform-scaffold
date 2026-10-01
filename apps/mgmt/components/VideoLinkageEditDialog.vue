<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  createVideoLinkage,
  updateVideoLinkage,
  fetchVideoLinkageOptions,
  fetchVideoLinkageRules,
  type VideoLinkageItem,
  type VideoLinkageOptionSet,
  type VideoLinkageRuleInput,
  type VideoLinkageSaveRequest,
} from '@/services/video';
import { toastErr } from '../utils/feedback';

// 应急自动联动配置新增/编辑共用弹窗（管理端）。
// 后端写端点齐备（POST/PUT/DELETE /video/linkages），本弹窗只负责接通写链路：
// 新增走 createVideoLinkage，编辑走 updateVideoLinkage（按 configCode 定位）。
// 下拉选项全部取自后端 /video/linkage-options（零下行控制红线：不回灌假选项）。

const props = defineProps<{ modelValue: boolean; editRow: Partial<VideoLinkageItem> | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const formRef = ref<FormInstance>();
const saving = ref(false);
const rulesLoading = ref(false);

const options = ref<VideoLinkageOptionSet>({
  monitorNames: [],
  presetPoints: [],
  businessObjectCategories: [],
  businessObjects: [],
});

function emptyRule(): VideoLinkageRuleInput {
  return { presetPoint: '', objectCategory: '', objectName: '' };
}

const form = reactive<VideoLinkageSaveRequest & { codeLocked: boolean }>({
  name: '',
  code: '',
  category: '',
  rules: [emptyRule()],
  codeLocked: false,
});

const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入配置编码', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
} satisfies FormRules;

watch(
  () => props.editRow,
  (row) => {
    if (row) {
      form.name = row.name ?? '';
      form.code = row.code ?? '';
      form.category = row.category ?? '';
      form.codeLocked = true; // 编码是定位键，编辑态锁定
      form.rules = [emptyRule()];
      if (row.code) {
        void loadRules(row.code);
      }
    } else {
      form.name = '';
      form.code = '';
      form.category = '';
      form.codeLocked = false;
      form.rules = [emptyRule()];
    }
  },
  { immediate: true },
);

async function loadRules(configCode: string): Promise<void> {
  rulesLoading.value = true;
  try {
    const rows = await fetchVideoLinkageRules(configCode);
    form.rules = rows.length
      ? rows.map((r) => ({
          presetPoint: r.presetPoint ?? '',
          objectCategory: r.objectCategory ?? '',
          objectName: r.objectName ?? '',
        }))
      : [emptyRule()];
  } catch (err) {
    toastErr(err, '加载联动规则失败：');
    form.rules = [emptyRule()];
  } finally {
    rulesLoading.value = false;
  }
}

onMounted(async () => {
  try {
    options.value = await fetchVideoLinkageOptions();
  } catch (err) {
    toastErr(err, '加载联动选项失败：');
  }
});

function addRule(): void {
  form.rules.push(emptyRule());
}
function removeRule(index: number): void {
  form.rules.splice(index, 1);
  if (!form.rules.length) form.rules.push(emptyRule());
}

async function submit(): Promise<void> {
  if (!formRef.value) return;
  await formRef.value.validate(async (ok: boolean) => {
    if (!ok) return;
    saving.value = true;
    try {
      const payload: VideoLinkageSaveRequest = {
        name: form.name,
        code: form.code,
        category: form.category,
        rules: form.rules
          .filter((r) => r.presetPoint || r.objectCategory || r.objectName)
          .map((r) => ({
            presetPoint: r.presetPoint,
            objectCategory: r.objectCategory,
            objectName: r.objectName,
          })),
      };
      if (form.codeLocked) {
        await updateVideoLinkage(form.code, payload);
      } else {
        await createVideoLinkage(payload);
      }
      ElMessage.success('已保存');
      emit('saved');
      emit('update:modelValue', false);
    } finally {
      saving.value = false;
    }
  });
}

defineExpose({ form, options });
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.codeLocked ? '编辑联动配置' : '新增联动配置'"
    width="720px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="规则名称" prop="name">
        <el-input v-model="form.name" placeholder="如：装置区火灾联动" />
      </el-form-item>
      <el-form-item label="配置编码" prop="code">
        <el-input
          v-model="form.code"
          :disabled="form.codeLocked"
          placeholder="如：LKG-001（唯一，编辑时不可改）"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input v-model="form.category" placeholder="如：火灾报警联动" />
      </el-form-item>

      <el-form-item label="联动规则">
        <div v-loading="rulesLoading" style="width: 100%">
          <div
            v-for="(rule, idx) in form.rules"
            :key="idx"
            style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center"
          >
            <el-select
              v-model="rule.presetPoint"
              filterable
              allow-create
              clearable
              placeholder="预置点"
              style="flex: 1"
            >
              <el-option v-for="o in options.presetPoints" :key="o" :label="o" :value="o" />
            </el-select>
            <el-select
              v-model="rule.objectCategory"
              filterable
              allow-create
              clearable
              placeholder="对象分类"
              style="flex: 1"
            >
              <el-option
                v-for="o in options.businessObjectCategories"
                :key="o"
                :label="o"
                :value="o"
              />
            </el-select>
            <el-select
              v-model="rule.objectName"
              filterable
              allow-create
              clearable
              placeholder="业务对象"
              style="flex: 1"
            >
              <el-option v-for="o in options.businessObjects" :key="o" :label="o" :value="o" />
            </el-select>
            <el-button type="danger" link @click="removeRule(idx)">移除</el-button>
          </div>
          <el-button size="small" @click="addRule">+ 添加规则</el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
