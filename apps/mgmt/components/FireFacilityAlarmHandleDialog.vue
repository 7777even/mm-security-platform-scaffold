<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import {
  updateFireFacilityAlarm,
  type FireFacilityAlarmItem,
  type FireFacilityFaultUpdatePayload,
  type FireFacilityFaultTimelineCreate,
} from '@/services/fireFacility';

export type AlarmHandleAction = 'confirm' | 'dispatch' | 'repair' | 'accept' | 'close';

interface ActionConfig {
  /** 目标故障状态（写回 faultStatus）。 */
  status: string;
  /** 按钮/对话框标题用词。 */
  label: string;
  /** 除「处理意见」外，本动作需填写的字段。 */
  fields: Array<
    | 'repairPerson'
    | 'workOrderNo'
    | 'repairMeasures'
    | 'estimatedFinish'
    | 'acceptancePerson'
    | 'acceptanceResult'
    | 'actualFinish'
  >;
}

const ACTION_CONFIG: Record<AlarmHandleAction, ActionConfig> = {
  confirm: { status: '已确认', label: '确认', fields: [] },
  dispatch: { status: '已派单', label: '派单', fields: ['repairPerson', 'workOrderNo'] },
  repair: { status: '维修中', label: '维修', fields: ['repairMeasures', 'estimatedFinish'] },
  accept: { status: '待验收', label: '验收', fields: ['acceptancePerson', 'acceptanceResult'] },
  close: { status: '已闭环', label: '闭环', fields: ['actualFinish'] },
};

const props = defineProps<{
  modelValue: boolean;
  alarm: FireFacilityAlarmItem | null;
  action: AlarmHandleAction;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const auth = useAuthStore();
const formRef = ref<FormInstance>();
const saving = ref(false);

const cfg = computed(() => ACTION_CONFIG[props.action]);
const title = computed(() => `报警处置 · ${cfg.value.label}`);

const form = reactive<{
  repairPerson: string;
  workOrderNo: string;
  repairMeasures: string;
  estimatedFinish: string;
  acceptancePerson: string;
  acceptanceResult: string;
  actualFinish: string;
  note: string;
}>({
  repairPerson: '',
  workOrderNo: '',
  repairMeasures: '',
  estimatedFinish: '',
  acceptancePerson: '',
  acceptanceResult: '',
  actualFinish: '',
  note: '',
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.repairPerson = '';
      form.workOrderNo = '';
      form.repairMeasures = '';
      form.estimatedFinish = '';
      form.acceptancePerson = '';
      form.acceptanceResult = '';
      form.actualFinish = '';
      form.note = '';
    }
  },
);

function nowStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function submit(): Promise<void> {
  if (!formRef.value || !props.alarm) return;
  if (!form.note.trim()) {
    ElMessage.warning('请填写处理意见');
    return;
  }
  saving.value = true;
  try {
    const payload: FireFacilityFaultUpdatePayload = {
      faultStatus: cfg.value.status,
    };
    if (form.repairPerson.trim()) payload.repairPerson = form.repairPerson.trim();
    if (form.workOrderNo.trim()) payload.workOrderNo = form.workOrderNo.trim();
    if (form.repairMeasures.trim()) payload.repairMeasures = form.repairMeasures.trim();
    if (form.estimatedFinish) payload.estimatedFinish = form.estimatedFinish;
    if (form.acceptancePerson.trim()) payload.acceptancePerson = form.acceptancePerson.trim();
    if (form.acceptanceResult.trim()) payload.acceptanceResult = form.acceptanceResult.trim();
    if (form.actualFinish) payload.actualFinish = form.actualFinish;

    const timeline: FireFacilityFaultTimelineCreate = {
      time: nowStr(),
      operator: auth.realName || auth.username || '操作员',
      action: cfg.value.label,
      detail: form.note.trim(),
    };
    payload.timelines = [timeline];

    await updateFireFacilityAlarm(props.alarm.id, payload);
    ElMessage.success(`报警「${props.alarm.faultCode || props.alarm.id}」已${cfg.value.label}`);
    emit('saved');
    emit('update:modelValue', false);
  } catch (err) {
    ElMessage.error((err as Error)?.message || '报警处置失败');
  } finally {
    saving.value = false;
  }
}

function close(): void {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog :model-value="modelValue" :title="title" width="520px" @update:model-value="close">
    <el-form ref="formRef" :model="form" label-width="92px">
      <el-descriptions :column="1" border size="small" class="alarm-meta">
        <el-descriptions-item label="报警编号">{{
          alarm?.faultCode || alarm?.id
        }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ alarm?.source || '—' }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ alarm?.content || '—' }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">{{ alarm?.status || '—' }}</el-descriptions-item>
      </el-descriptions>

      <el-form-item v-if="cfg.fields.includes('repairPerson')" label="派单人">
        <el-input v-model="form.repairPerson" placeholder="请输入派单人" />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('workOrderNo')" label="工单号">
        <el-input v-model="form.workOrderNo" placeholder="请输入工单号" />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('repairMeasures')" label="维修措施">
        <el-input
          v-model="form.repairMeasures"
          type="textarea"
          :rows="2"
          placeholder="请输入维修措施"
        />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('estimatedFinish')" label="预计完成">
        <el-date-picker
          v-model="form.estimatedFinish"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择预计完成时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('acceptancePerson')" label="验收人">
        <el-input v-model="form.acceptancePerson" placeholder="请输入验收人" />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('acceptanceResult')" label="验收结论">
        <el-input v-model="form.acceptanceResult" placeholder="如：合格 / 不合格" />
      </el-form-item>
      <el-form-item v-if="cfg.fields.includes('actualFinish')" label="实际完成">
        <el-date-picker
          v-model="form.actualFinish"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择实际完成时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="处理意见" required>
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          placeholder="请填写处理意见（将记入故障时间线）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">{{ cfg.label }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.alarm-meta {
  margin-bottom: 16px;
}
</style>
