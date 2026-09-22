<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { EditPen, View } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import MgmtProTable from '../components/MgmtProTable.vue';
import MgmtPageHead from '../components/MgmtPageHead.vue';
import { confirm, toastErr, toastOk } from '../utils/feedback';
import {
  createFormRecord,
  fetchFormRecords,
  FORM_TYPES,
  updateFormRecord,
  type FormRecordCreateRequest,
  type FormRecordItem,
  type FormType,
} from '@/services/formRecords';

// mgmt 端 /form 流程填报向导：列表 + 多步填报 + ADMIN 审核。
// 解冻来源：docs/frozen-prototype.md（原为 module-embed iframe 占位 / 空壳）。
// 权限语义：新增（POST）一线人员即可提交；审核（PUT 状态流转）需 ADMIN。

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

const TYPE_FIELDS: Record<FormType, FieldDef[]> = {
  隐患排查: [
    { key: 'location', label: '隐患地点', type: 'text' },
    { key: 'level', label: '隐患等级', type: 'select', options: ['一般', '较大', '重大'] },
    { key: 'measure', label: '整改措施', type: 'textarea' },
    { key: 'owner', label: '责任人', type: 'text' },
  ],
  设备巡检: [
    { key: 'deviceNo', label: '设备编号', type: 'text' },
    { key: 'deviceName', label: '设备名称', type: 'text' },
    { key: 'result', label: '巡检结果', type: 'select', options: ['正常', '异常'] },
    { key: 'abnormal', label: '异常情况说明', type: 'textarea' },
  ],
  值班交接: [
    { key: 'shiftFrom', label: '交班人', type: 'text' },
    { key: 'shiftTo', label: '接班人', type: 'text' },
    { key: 'handover', label: '交接事项', type: 'textarea' },
    { key: 'major', label: '重大事项', type: 'textarea' },
  ],
  其他: [{ key: 'note', label: '说明', type: 'textarea' }],
};

const STATUS_META: Record<string, { label: string; type: 'info' | 'warning' | 'success' }> = {
  DRAFT: { label: '草稿', type: 'info' },
  SUBMITTED: { label: '已提交', type: 'warning' },
  REVIEWED: { label: '已审核', type: 'success' },
};

const auth = useAuthStore();
const isAdmin = computed(() => auth.roles.includes('ADMIN') || auth.role === 'ADMIN');

const rows = ref<FormRecordItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFormRecords({ page: 1, size: 50 });
    rows.value = Array.isArray(res?.list) ? res.list : [];
  } catch (err) {
    toastErr(err, '加载填报记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function statusMeta(s?: string): { label: string; type: 'info' | 'warning' | 'success' } {
  return STATUS_META[s ?? ''] ?? STATUS_META.DRAFT;
}

// —— 查看详情（解析结构化 detailJson）——
const detailOpen = ref(false);
const detailRow = ref<FormRecordItem | null>(null);
const detailMap = computed<Record<string, string>>(() =>
  detailRow.value ? safeParse(detailRow.value.detailJson) : {},
);
function openDetail(row: FormRecordItem): void {
  detailRow.value = row;
  detailOpen.value = true;
}
function safeParse(json?: string): Record<string, string> {
  if (!json) return {};
  try {
    const v = JSON.parse(json);
    return v && typeof v === 'object' ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// —— 多步填报向导 ——
const wizardOpen = ref(false);
const activeStep = ref(0);
const submitting = ref(false);
const wizard = reactive({
  formType: '' as FormType | '',
  title: '',
  reporter: '',
  department: '',
  fillAt: '',
});
const detail = reactive<Record<string, string>>({});

function nowStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}
function clearDetail(): void {
  for (const k of Object.keys(detail)) delete detail[k];
}
function openWizard(): void {
  activeStep.value = 0;
  wizard.formType = '';
  wizard.title = '';
  wizard.reporter = '';
  wizard.department = '';
  wizard.fillAt = nowStr();
  clearDetail();
  wizardOpen.value = true;
}
function onFormTypeChange(): void {
  clearDetail();
}
const currentFields = computed<FieldDef[]>(() =>
  wizard.formType ? TYPE_FIELDS[wizard.formType] : [],
);

async function submitWizard(): Promise<void> {
  if (!wizard.formType) {
    toastErr(new Error('请选择填报类型'));
    return;
  }
  if (!wizard.reporter.trim()) {
    toastErr(new Error('请填写填报人'));
    return;
  }
  const payload: FormRecordCreateRequest = {
    formType: wizard.formType as FormType,
    title: wizard.title || undefined,
    reporter: wizard.reporter,
    department: wizard.department || undefined,
    fillAt: wizard.fillAt || undefined,
    detailJson: JSON.stringify(detail),
    status: 'SUBMITTED',
  };
  submitting.value = true;
  try {
    await createFormRecord(payload);
    toastOk('填报已提交');
    wizardOpen.value = false;
    await load();
  } catch (err) {
    toastErr(err, '提交失败：');
  } finally {
    submitting.value = false;
  }
}

// —— ADMIN 审核 ——
async function review(row: FormRecordItem): Promise<void> {
  if (!(await confirm(`确认审核通过「${row.formNo}」？`))) return;
  try {
    await updateFormRecord(row.id as number, {
      status: 'REVIEWED',
      version: row.version,
      remark: row.remark ?? '审核通过',
    });
    toastOk('已审核通过');
    await load();
  } catch (err) {
    toastErr(err, '审核失败：');
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="流程填报" crumb="业务填报 / 流程填报向导" :icon="EditPen" icon-tone="blue">
      <template #actions>
        <el-button type="primary" @click="openWizard()">新建填报</el-button>
        <el-button :loading="loading" @click="load()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="formNo" label="填报编号" width="160" />
      <el-table-column prop="formType" label="类型" width="110">
        <template #default="{ row }"
          ><el-tag>{{ row.formType }}</el-tag></template
        >
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="reporter" label="填报人" width="100" />
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="fillAt" label="填报时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMeta(row.status).type">{{ statusMeta(row.status).label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="openDetail(row)">查看</el-button>
          <el-button
            v-if="isAdmin && row.status !== 'REVIEWED'"
            link
            type="success"
            @click="review(row)"
            >审核通过</el-button
          >
        </template>
      </el-table-column>
    </MgmtProTable>

    <!-- 详情抽屉 -->
    <el-dialog v-model="detailOpen" title="填报详情" width="560px">
      <el-descriptions v-if="detailRow" :column="1" border>
        <el-descriptions-item label="填报编号">{{ detailRow.formNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailRow.formType }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailRow.title || '—' }}</el-descriptions-item>
        <el-descriptions-item label="填报人">{{ detailRow.reporter }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detailRow.department || '—' }}</el-descriptions-item>
        <el-descriptions-item label="填报时间">{{ detailRow.fillAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          statusMeta(detailRow.status).label
        }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">结构化填报内容</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="(val, key) in detailMap" :key="key" :label="key">
          {{ val || '—' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="Object.keys(detailMap).length === 0" label="提示">
          无结构化内容
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 多步填报向导 -->
    <el-dialog
      v-model="wizardOpen"
      title="新建流程填报"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="选择类型" />
        <el-step title="填写内容" />
        <el-step title="预览提交" />
      </el-steps>

      <div class="wizard-body">
        <!-- Step 0 -->
        <div v-show="activeStep === 0">
          <p class="tip">请选择本次填报的类型：</p>
          <el-radio-group v-model="wizard.formType" @change="onFormTypeChange">
            <el-radio-button v-for="t in FORM_TYPES" :key="t" :value="t">{{ t }}</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Step 1 -->
        <div v-show="activeStep === 1">
          <el-form label-width="92px">
            <el-form-item label="填报标题">
              <el-input v-model="wizard.title" placeholder="选填" />
            </el-form-item>
            <el-form-item label="填报人" required>
              <el-input v-model="wizard.reporter" placeholder="必填" />
            </el-form-item>
            <el-form-item label="填报部门">
              <el-input v-model="wizard.department" placeholder="选填" />
            </el-form-item>
            <el-form-item label="填报时间">
              <el-input v-model="wizard.fillAt" placeholder="缺省取当前时间" />
            </el-form-item>
            <el-divider content-position="left">结构化内容（按类型）</el-divider>
            <el-form-item v-for="f in currentFields" :key="f.key" :label="f.label">
              <el-select v-if="f.type === 'select'" v-model="detail[f.key]" placeholder="请选择">
                <el-option v-for="o in f.options" :key="o" :label="o" :value="o" />
              </el-select>
              <el-input
                v-else-if="f.type === 'textarea'"
                v-model="detail[f.key]"
                type="textarea"
                :rows="2"
              />
              <el-input v-else v-model="detail[f.key]" />
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2 -->
        <div v-show="activeStep === 2">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="类型">{{ wizard.formType || '—' }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ wizard.title || '—' }}</el-descriptions-item>
            <el-descriptions-item label="填报人">{{ wizard.reporter }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ wizard.department || '—' }}</el-descriptions-item>
            <el-descriptions-item label="填报时间">{{ wizard.fillAt || '—' }}</el-descriptions-item>
            <el-descriptions-item label="状态">已提交（提交后由管理员审核）</el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">结构化内容预览</el-divider>
          <pre class="preview">{{ JSON.stringify(detail, null, 2) }}</pre>
        </div>
      </div>

      <template #footer>
        <el-button @click="activeStep > 0 ? (activeStep -= 1) : (wizardOpen = false)">
          {{ activeStep > 0 ? '上一步' : '取消' }}
        </el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="activeStep += 1">下一步</el-button>
        <el-button v-else type="primary" :loading="submitting" @click="submitWizard()">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.wizard-body {
  margin-top: 18px;
  min-height: 280px;
}

.tip {
  color: var(--el-text-color-secondary);
  margin: 6px 0 14px;
}

.preview {
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  max-height: 220px;
  overflow: auto;
}
</style>
