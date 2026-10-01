<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  createFireFacilityFault,
  updateFireFacilityFault,
  FIRE_FAULT_LEVEL_OPTIONS,
  FIRE_FAULT_TYPE_OPTIONS,
  FIRE_FAULT_STATUS_OPTIONS,
  type FireFacilityFaultCreatePayload,
  type FireFacilityFaultItem,
  type FireFacilityFaultUpdatePayload,
} from '@/services/fireFacility';

// 消防设施故障新增/编辑共用弹窗（管理端台账）。
// 新增走 POST /fire-facility/faults（全字段落库）；编辑走 PUT /fire-facility/faults/{id}
// （局部更新，V91 起支持基础字段）。故障编号与设施编码编辑态禁用——编号全局唯一，避免误改。

const props = defineProps<{
  modelValue: boolean;
  editRow: Partial<FireFacilityFaultItem> | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

type FaultForm = FireFacilityFaultCreatePayload & FireFacilityFaultUpdatePayload & { id?: number };

const formRef = ref<FormInstance>();
const saving = ref(false);

function emptyForm(): FaultForm {
  return {
    id: undefined,
    faultCode: '',
    facilityCode: '',
    facilityName: '',
    facilityType: '',
    faultType: '硬件故障',
    faultLevel: '重要',
    discoverTime: '',
    discoverMethod: '',
    phenomenon: '',
    cause: '',
    faultStatus: '待确认',
    workOrderNo: '',
    repairPerson: '',
    estimatedFinish: '',
    actualFinish: '',
    repairMeasures: '',
    acceptancePerson: '',
    acceptanceResult: '',
  };
}

const form = reactive<FaultForm>(emptyForm());

const rules: FormRules = {
  faultCode: [{ required: true, message: '请输入故障编号', trigger: 'blur' }],
  facilityCode: [{ required: true, message: '请输入关联设施编码', trigger: 'blur' }],
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  faultLevel: [{ required: true, message: '请选择故障级别', trigger: 'change' }],
  discoverTime: [{ required: true, message: '请选择发现时间', trigger: 'change' }],
};

watch(
  () => props.editRow,
  (row) => {
    const base = emptyForm();
    if (row) {
      // 条目用 status 表达故障状态，写回字段名为 faultStatus，此处做映射。
      Object.assign(form, base, {
        ...row,
        faultStatus: row.status ?? base.faultStatus,
      });
    } else {
      Object.assign(form, base);
    }
  },
  { immediate: true },
);

async function submit(): Promise<void> {
  if (!formRef.value) return;
  await formRef.value.validate(async (ok: boolean) => {
    if (!ok) return;
    saving.value = true;
    try {
      if (form.id != null) {
        const payload: FireFacilityFaultUpdatePayload = {
          faultStatus: form.faultStatus,
          facilityName: form.facilityName,
          facilityType: form.facilityType,
          faultType: form.faultType,
          faultLevel: form.faultLevel,
          discoverTime: form.discoverTime,
          discoverMethod: form.discoverMethod,
          phenomenon: form.phenomenon,
          cause: form.cause,
          workOrderNo: form.workOrderNo,
          repairPerson: form.repairPerson,
          estimatedFinish: form.estimatedFinish,
          actualFinish: form.actualFinish,
          repairMeasures: form.repairMeasures,
          acceptancePerson: form.acceptancePerson,
          acceptanceResult: form.acceptanceResult,
        };
        await updateFireFacilityFault(form.id, payload);
      } else {
        const payload: FireFacilityFaultCreatePayload = {
          faultCode: form.faultCode,
          facilityCode: form.facilityCode,
          facilityName: form.facilityName,
          facilityType: form.facilityType,
          faultType: form.faultType,
          faultLevel: form.faultLevel,
          discoverTime: form.discoverTime,
          discoverMethod: form.discoverMethod,
          phenomenon: form.phenomenon,
          cause: form.cause,
          faultStatus: form.faultStatus,
          workOrderNo: form.workOrderNo,
          repairPerson: form.repairPerson,
          estimatedFinish: form.estimatedFinish,
          actualFinish: form.actualFinish,
          repairMeasures: form.repairMeasures,
          acceptancePerson: form.acceptancePerson,
          acceptanceResult: form.acceptanceResult,
        };
        await createFireFacilityFault(payload);
      }
      ElMessage.success('已保存');
      emit('saved');
      emit('update:modelValue', false);
    } finally {
      saving.value = false;
    }
  });
}

defineExpose({ form });
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id != null ? '编辑消防设施故障' : '新增消防设施故障'"
    width="660px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="108px">
      <el-form-item label="故障编号" prop="faultCode">
        <el-input
          v-model="form.faultCode"
          :disabled="form.id != null"
          placeholder="如：FLT-2026-0001（全局唯一）"
        />
      </el-form-item>
      <el-form-item label="关联设施编码" prop="facilityCode">
        <el-input
          v-model="form.facilityCode"
          :disabled="form.id != null"
          placeholder="如：XF-002"
        />
      </el-form-item>
      <el-form-item label="关联设施名称">
        <el-input v-model="form.facilityName" placeholder="如：消火栓系统-2#罐区" />
      </el-form-item>
      <el-form-item label="设施类型">
        <el-input v-model="form.facilityType" placeholder="如：消火栓系统" />
      </el-form-item>
      <el-form-item label="故障类型" prop="faultType">
        <el-select v-model="form.faultType" placeholder="请选择故障类型">
          <el-option
            v-for="opt in FIRE_FAULT_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="故障级别" prop="faultLevel">
        <el-select v-model="form.faultLevel" placeholder="请选择故障级别">
          <el-option
            v-for="opt in FIRE_FAULT_LEVEL_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发现时间" prop="discoverTime">
        <el-date-picker
          v-model="form.discoverTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择发现时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="发现方式">
        <el-input v-model="form.discoverMethod" placeholder="如：系统报警 / 巡检发现 / 人工上报" />
      </el-form-item>
      <el-form-item label="故障现象">
        <el-input
          v-model="form.phenomenon"
          type="textarea"
          :rows="2"
          placeholder="如：2#罐区消火栓压力不足"
        />
      </el-form-item>
      <el-form-item label="故障原因">
        <el-input v-model="form.cause" type="textarea" :rows="2" placeholder="如：管网阀门泄漏" />
      </el-form-item>
      <el-form-item label="故障状态">
        <el-select v-model="form.faultStatus" placeholder="请选择故障状态">
          <el-option
            v-for="opt in FIRE_FAULT_STATUS_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工单号">
        <el-input v-model="form.workOrderNo" placeholder="如：WO-20261001-001" />
      </el-form-item>
      <el-form-item label="维修责任人">
        <el-input v-model="form.repairPerson" placeholder="如：李维修" />
      </el-form-item>
      <el-form-item label="预计完成">
        <el-date-picker
          v-model="form.estimatedFinish"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择预计完成时间（可空）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="实际完成">
        <el-date-picker
          v-model="form.actualFinish"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择实际完成时间（可空）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="维修措施">
        <el-input
          v-model="form.repairMeasures"
          type="textarea"
          :rows="2"
          placeholder="如：更换泄漏阀门并复压测试"
        />
      </el-form-item>
      <el-form-item label="验收人">
        <el-input v-model="form.acceptancePerson" placeholder="如：王验收" />
      </el-form-item>
      <el-form-item label="验收结论">
        <el-input v-model="form.acceptanceResult" placeholder="如：合格" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
