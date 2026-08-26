<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import AlarmListItem from '@/components/common/AlarmListItem.vue';
import {
  createEmergencyEvent,
  deleteEmergencyEvent,
  fetchAlarmPage,
  updateEmergencyEvent,
  type AlarmItem,
  type AlarmLevel,
  type AlarmStatus,
  type AlarmType,
} from '@/services/alarm';

const props = withDefaults(defineProps<{ title?: string }>(), { title: '应急事件' });

type TabKey = 'event' | 'drill';
const activeTab = ref<TabKey>('event');

// ---- 应急事件：分页列表 + 搜索/筛选 ----
const events = ref<AlarmItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);
const keyword = ref('');
const levelFilter = ref<AlarmLevel | ''>('');
const statusFilter = ref<AlarmStatus | ''>('');

async function loadEvents() {
  const page = await fetchAlarmPage(currentPage.value, pageSize.value);
  let list = page.list;
  if (keyword.value.trim()) {
    const kw = keyword.value.trim();
    list = list.filter(
      (a) => a.location.includes(kw) || a.description.includes(kw) || a.deviceCode.includes(kw),
    );
  }
  if (levelFilter.value) list = list.filter((a) => a.level === levelFilter.value);
  if (statusFilter.value) list = list.filter((a) => a.status === statusFilter.value);
  events.value = list;
  total.value = page.total;
}

function onSearch() {
  currentPage.value = 1;
  loadEvents();
}

function onPageChange(p: number) {
  currentPage.value = p;
  loadEvents();
}

// ---- 应急演练：本地演示数据 ----
interface DrillItem {
  id: string;
  title: string;
  scope: string;
  status: '计划' | '执行中' | '已完成';
  date: string;
}
const drills = ref<DrillItem[]>([
  {
    id: 'd1',
    title: '罐区泄漏综合应急演练',
    scope: '储运车间',
    status: '已完成',
    date: '2026-08-18',
  },
  { id: 'd2', title: '消防疏散专项演练', scope: '全厂', status: '执行中', date: '2026-08-26' },
  { id: 'd3', title: '防化洗消联合演练', scope: '化工装置区', status: '计划', date: '2026-09-02' },
  { id: 'd4', title: '极端天气停产撤人演练', scope: '全厂', status: '计划', date: '2026-09-10' },
]);

// ---- 新增 / 查看 / 编辑 ----
const createDialogVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive<Partial<AlarmItem>>({
  level: 2,
  type: 'FIRE',
  status: 'ACTIVE',
  deviceCode: '',
  location: '',
  description: '',
});
const createRules: FormRules = {
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
};

const viewDialogVisible = ref(false);
const viewPayload = ref<AlarmItem | null>(null);

const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const editForm = reactive<Partial<AlarmItem>>({});
const editRules: FormRules = {
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
};

function openCreate() {
  Object.assign(createForm, {
    level: 2,
    type: 'FIRE',
    status: 'ACTIVE',
    deviceCode: '',
    location: '',
    description: '',
  });
  createDialogVisible.value = true;
}

async function submitCreate() {
  const ok = await createFormRef.value?.validate().catch(() => false);
  if (!ok) return;
  await createEmergencyEvent({
    level: createForm.level as AlarmLevel,
    type: createForm.type as AlarmType,
    status: createForm.status as AlarmStatus,
    deviceCode: createForm.deviceCode ?? '',
    location: createForm.location ?? '',
    description: createForm.description ?? '',
  });
  createDialogVisible.value = false;
  loadEvents();
}

function openView(a: AlarmItem) {
  viewPayload.value = a;
  viewDialogVisible.value = true;
}

function openEdit(a: AlarmItem) {
  Object.assign(editForm, a);
  editDialogVisible.value = true;
}

async function submitEdit() {
  const ok = await editFormRef.value?.validate().catch(() => false);
  if (!ok || !editForm.alarmId) return;
  await updateEmergencyEvent(editForm.alarmId, {
    level: editForm.level as AlarmLevel,
    type: editForm.type as AlarmType,
    status: editForm.status as AlarmStatus,
    deviceCode: editForm.deviceCode ?? '',
    location: editForm.location ?? '',
    description: editForm.description ?? '',
  });
  editDialogVisible.value = false;
  loadEvents();
}

async function remove(a: AlarmItem) {
  await deleteEmergencyEvent(a.alarmId);
  loadEvents();
}

onMounted(loadEvents);
</script>

<template>
  <div class="event-crud">
    <div class="ec-tabs">
      <button
        class="ec-tab"
        :class="{ active: activeTab === 'event' }"
        @click="activeTab = 'event'"
      >
        应急事件
      </button>
      <button
        class="ec-tab"
        :class="{ active: activeTab === 'drill' }"
        @click="activeTab = 'drill'"
      >
        应急演练
      </button>
      <el-button
        v-if="activeTab === 'event'"
        class="ec-add"
        size="small"
        type="primary"
        @click="openCreate"
      >
        新增
      </el-button>
    </div>

    <!-- 应急事件 -->
    <template v-if="activeTab === 'event'">
      <div class="ec-filter">
        <el-input
          v-model="keyword"
          size="small"
          placeholder="搜索位置 / 描述 / 编码"
          clearable
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <el-select
          v-model="levelFilter"
          size="small"
          placeholder="等级"
          clearable
          @change="onSearch"
        >
          <el-option v-for="n in 4" :key="n" :label="`${n} 级`" :value="n" />
        </el-select>
        <el-select
          v-model="statusFilter"
          size="small"
          placeholder="状态"
          clearable
          @change="onSearch"
        >
          <el-option label="激活" value="ACTIVE" />
          <el-option label="已确认" value="ACKED" />
          <el-option label="已派发" value="DISPATCHED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>
      </div>

      <div class="ec-list">
        <AlarmListItem
          v-for="a in events"
          :key="a.alarmId"
          :alarm="a"
          @view="openView"
          @edit="openEdit"
          @delete="remove"
        />
        <el-empty v-if="!events.length" description="暂无事件" :image-size="60" />
      </div>

      <div class="ec-pager">
        <el-pagination
          small
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
        />
      </div>
    </template>

    <!-- 应急演练 -->
    <template v-else>
      <ul class="drill-list">
        <li v-for="d in drills" :key="d.id" class="drill-item">
          <div class="drill-main">
            <span class="drill-title">{{ d.title }}</span>
            <span class="drill-scope">{{ d.scope }}</span>
          </div>
          <div class="drill-foot">
            <span class="drill-date">{{ d.date }}</span>
            <span class="drill-status" :class="d.status">{{ d.status }}</span>
          </div>
        </li>
      </ul>
    </template>

    <!-- 新增 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="`新增${props.title}`"
      width="460px"
      append-to-body
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="84px">
        <el-form-item label="等级" prop="level">
          <el-select v-model="createForm.level" placeholder="请选择">
            <el-option v-for="n in 4" :key="n" :label="`${n} 级`" :value="n" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择">
            <el-option label="火灾" value="FIRE" />
            <el-option label="气体" value="GAS" />
            <el-option label="温度" value="TEMP" />
            <el-option label="视频" value="CCTV" />
            <el-option label="SOS" value="SOS" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择">
            <el-option label="激活" value="ACTIVE" />
            <el-option label="已确认" value="ACKED" />
            <el-option label="已派发" value="DISPATCHED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编码" prop="deviceCode">
          <el-input v-model="createForm.deviceCode" placeholder="20 位 MDM 设备编码" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="createForm.location" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看 -->
    <el-dialog v-model="viewDialogVisible" title="事件详情" width="460px" append-to-body>
      <el-descriptions v-if="viewPayload" :column="1" border>
        <el-descriptions-item label="事件 ID">{{ viewPayload.alarmId }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ viewPayload.level }} 级</el-descriptions-item>
        <el-descriptions-item label="类型">{{ viewPayload.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ viewPayload.status }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ viewPayload.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ viewPayload.location }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ viewPayload.ts }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ viewPayload.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑 -->
    <el-dialog v-model="editDialogVisible" title="编辑事件" width="460px" append-to-body>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="84px">
        <el-form-item label="等级" prop="level">
          <el-select v-model="editForm.level" placeholder="请选择">
            <el-option v-for="n in 4" :key="n" :label="`${n} 级`" :value="n" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择">
            <el-option label="火灾" value="FIRE" />
            <el-option label="气体" value="GAS" />
            <el-option label="温度" value="TEMP" />
            <el-option label="视频" value="CCTV" />
            <el-option label="SOS" value="SOS" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option label="激活" value="ACTIVE" />
            <el-option label="已确认" value="ACKED" />
            <el-option label="已派发" value="DISPATCHED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编码" prop="deviceCode">
          <el-input v-model="editForm.deviceCode" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="editForm.location" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.event-crud {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ec-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ec-tab {
  flex: 0 0 auto;
  padding: 5px 14px;
  font-size: 13px;
  color: var(--color-text-muted);
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ec-tab:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}

.ec-tab.active {
  color: #fff;
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.ec-add {
  margin-left: auto;
}

.ec-filter {
  display: flex;
  gap: 6px;
}

.ec-filter :deep(.el-input),
.ec-filter :deep(.el-select) {
  flex: 1 1 0;
  min-width: 0;
}

.ec-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 96px;
}

.ec-pager {
  display: flex;
  justify-content: center;
}

.drill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drill-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel-soft);
}

.drill-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.drill-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drill-scope {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--color-text-muted);
}

.drill-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drill-date {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.drill-status {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
}

.drill-status.已完成 {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 16%, transparent);
}

.drill-status.执行中 {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}

.drill-status.计划 {
  color: var(--color-info);
  background: color-mix(in srgb, var(--color-info) 16%, transparent);
}
</style>
