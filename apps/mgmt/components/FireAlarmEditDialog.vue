<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  createFireAlarm,
  updateFireAlarm,
  type AlarmStatus,
  type FireAlarmEditPayload,
  type FireAlarmItem,
  type FireAlarmTypeTone,
} from '@/services/alarm';

const props = defineProps<{ modelValue: boolean; editRow: Partial<FireAlarmItem> | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const formRef = ref<FormInstance>();
const saving = ref(false);

function emptyForm(): FireAlarmEditPayload & { alarmId?: string } {
  return {
    alarmId: '',
    title: '',
    time: '',
    typeLabel: '',
    typeTone: 'fire' as FireAlarmTypeTone,
    source: '',
    objectType: '',
    objectName: '',
    level: '',
    description: '',
    location: '',
    falseAlarm: '未核实',
    status: 'ACTIVE' as AlarmStatus,
    rescueEventId: '',
    monitorId: '',
    monitorLabel: '',
    onsiteMonitorId: '',
    onsiteMonitorLabel: '',
    handleResult: '',
    handleTime: '',
    dispatchPersonnel: '',
    notifyMethod: '',
  };
}

const form = reactive<FireAlarmEditPayload & { alarmId?: string }>(emptyForm());

const rules: FormRules = {
  title: [{ required: true, message: '请输入报警名称', trigger: 'blur' }],
  time: [{ required: true, message: '请输入报警时间', trigger: 'blur' }],
};

watch(
  () => props.editRow,
  (row) => {
    if (row) {
      Object.assign(form, emptyForm(), row);
    } else {
      Object.assign(form, emptyForm());
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
      // 表单含 alarmId（仅编辑态有值），后端按已知字段局部更新，alarmId 会被忽略，无需剔除。
      const payload: FireAlarmEditPayload = { ...form };
      if (form.alarmId) {
        await updateFireAlarm(form.alarmId, payload);
      } else {
        await createFireAlarm(payload);
      }
      ElMessage.success('已保存');
      emit('saved');
      emit('update:modelValue', false);
    } finally {
      saving.value = false;
    }
  });
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.alarmId ? '编辑消防报警' : '新增消防报警'"
    width="640px"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="报警名称" prop="title">
        <el-input v-model="form.title" placeholder="如：蜡油加氢装置火灾" />
      </el-form-item>
      <el-form-item label="报警时间" prop="time">
        <el-input v-model="form.time" placeholder="yyyy-MM-dd HH:mm:ss" />
      </el-form-item>
      <el-form-item label="类型">
        <el-input v-model="form.typeLabel" placeholder="火灾报警/烟雾报警/GDS报警/设备故障" />
      </el-form-item>
      <el-form-item label="类型色调">
        <el-select v-model="form.typeTone">
          <el-option label="fire" value="fire" />
          <el-option label="smoke" value="smoke" />
          <el-option label="gds" value="gds" />
          <el-option label="muted" value="muted" />
        </el-select>
      </el-form-item>
      <el-form-item label="事发位置">
        <el-input v-model="form.location" />
      </el-form-item>
      <el-form-item label="对象类型">
        <el-input v-model="form.objectType" placeholder="装置/储罐/仓库/管网" />
      </el-form-item>
      <el-form-item label="对象名称">
        <el-input v-model="form.objectName" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status">
          <el-option label="活动" value="ACTIVE" />
          <el-option label="已确认" value="ACKED" />
          <el-option label="已派单" value="DISPATCHED" />
          <el-option label="已闭环" value="CLOSED" />
        </el-select>
      </el-form-item>
      <el-form-item label="误报核实">
        <el-select v-model="form.falseAlarm">
          <el-option label="未核实" value="未核实" />
          <el-option label="是" value="是" />
          <el-option label="否" value="否" />
        </el-select>
      </el-form-item>
      <el-form-item label="监控点名称">
        <el-input v-model="form.monitorLabel" />
      </el-form-item>
      <el-form-item label="处置情况">
        <el-input v-model="form.handleResult" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="处置时间">
        <el-input v-model="form.handleTime" placeholder="yyyy-MM-dd HH:mm:ss" />
      </el-form-item>
      <el-form-item label="派单人员">
        <el-input v-model="form.dispatchPersonnel" placeholder="张三,李四" />
      </el-form-item>
      <el-form-item label="通知方式">
        <el-input v-model="form.notifyMethod" placeholder="APP,SMS" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
