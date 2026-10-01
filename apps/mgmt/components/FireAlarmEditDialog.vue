<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  createFireAlarm,
  updateFireAlarm,
  FIRE_ALARM_TYPE_LABEL_OPTIONS,
  FIRE_ALARM_SOURCE_OPTIONS,
  FIRE_ALARM_OBJECT_TYPE_OPTIONS,
  FIRE_ALARM_LEVEL_OPTIONS,
  FIRE_ALARM_FALSE_OPTIONS,
  FIRE_ALARM_NOTIFY_OPTIONS,
  FIRE_ALARM_TYPE_TONE_OPTIONS,
  FIRE_ALARM_STATUS_OPTIONS,
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
// 通知方式（APP/SMS）多选：表单内部用数组，提交时拼成逗号串。
const notifyMethods = ref<string[]>([]);

function emptyForm(): FireAlarmEditPayload & { alarmId?: string } {
  return {
    alarmId: '',
    title: '',
    time: '',
    typeLabel: '火灾报警',
    typeTone: 'fire' as FireAlarmTypeTone,
    source: '火灾报警',
    objectType: '装置',
    objectName: '',
    level: '-',
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
  time: [{ required: true, message: '请选择报警时间', trigger: 'change' }],
};

watch(
  () => props.editRow,
  (row) => {
    const base = emptyForm();
    if (row) {
      Object.assign(form, base, row);
      notifyMethods.value = row.notifyMethod
        ? String(row.notifyMethod).split(',').filter(Boolean)
        : [];
    } else {
      Object.assign(form, base);
      notifyMethods.value = [];
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
      const payload: FireAlarmEditPayload = {
        ...form,
        notifyMethod: notifyMethods.value.join(','),
      };
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

defineExpose({ form, notifyMethods });
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
        <el-date-picker
          v-model="form.time"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择报警时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报警类型">
        <el-select v-model="form.typeLabel" placeholder="请选择报警类型">
          <el-option
            v-for="opt in FIRE_ALARM_TYPE_LABEL_OPTIONS"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型色调">
        <el-select v-model="form.typeTone" placeholder="请选择类型色调">
          <el-option
            v-for="opt in FIRE_ALARM_TYPE_TONE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="报警来源">
        <el-select v-model="form.source" placeholder="请选择报警来源">
          <el-option
            v-for="opt in FIRE_ALARM_SOURCE_OPTIONS"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对象类型">
        <el-select v-model="form.objectType" placeholder="请选择对象类型">
          <el-option
            v-for="opt in FIRE_ALARM_OBJECT_TYPE_OPTIONS"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对象名称">
        <el-input v-model="form.objectName" placeholder="如：蜡油加氢装置" />
      </el-form-item>
      <el-form-item label="报警等级">
        <el-select v-model="form.level" placeholder="请选择报警等级">
          <el-option v-for="opt in FIRE_ALARM_LEVEL_OPTIONS" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="事发位置">
        <el-input v-model="form.location" placeholder="如：化工区-蜡油加氢装置区" />
      </el-form-item>
      <el-form-item label="报警描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="请描述报警现场情况"
        />
      </el-form-item>
      <el-form-item label="处置状态">
        <el-select v-model="form.status" placeholder="请选择处置状态">
          <el-option
            v-for="opt in FIRE_ALARM_STATUS_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="误报核实">
        <el-select v-model="form.falseAlarm" placeholder="请选择误报核实结果">
          <el-option v-for="opt in FIRE_ALARM_FALSE_OPTIONS" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="监控点名称">
        <el-input v-model="form.monitorLabel" placeholder="如：蜡油加氢东侧监控" />
      </el-form-item>
      <el-form-item label="处置情况">
        <el-input
          v-model="form.handleResult"
          type="textarea"
          :rows="2"
          placeholder="如：已现场核实现场无明火，持续观察"
        />
      </el-form-item>
      <el-form-item label="处置时间">
        <el-date-picker
          v-model="form.handleTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择处置时间（可空）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="派单人员">
        <el-input
          v-model="form.dispatchPersonnel"
          placeholder="多人以英文逗号分隔，如：张三,李四"
        />
      </el-form-item>
      <el-form-item label="通知方式">
        <el-select
          v-model="notifyMethods"
          multiple
          collapse-tags
          placeholder="可多选，如 APP + SMS"
          style="width: 100%"
        >
          <el-option
            v-for="opt in FIRE_ALARM_NOTIFY_OPTIONS"
            :key="opt"
            :label="opt"
            :value="opt"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
