<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Aim } from '@element-plus/icons-vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createEmergencyEvent,
  deleteEmergencyEvent,
  EMERGENCY_EVENT_STATUS_OPTIONS,
  EMERGENCY_EVENT_TYPE_DEFS,
  fetchEmergencyEvents,
  updateEmergencyEvent,
} from '@/services/emergencyEvent';
import type {
  EmergencyEventCreateRequest,
  EmergencyEventItem,
  EmergencyEventScene,
  EmergencyEventUpdateRequest,
} from '@/services/emergencyEvent';

// 应急事件管理（/emergency-event）：接后端 /emergency-events。
// 全量 CRUD：POST 新增、PUT 编辑（局部更新）、DELETE 删除。写操作受 emergency:event:write
// 权限码控制（V92 已登记）；create 仍是「仅登录态」自助场景，与大屏手动新增同源。
//
// ⚠️ 新增与编辑的字段集不同（后端 CreateRequest 需落图坐标与分组维度，UpdateRequest 是
// 局部更新且不接受 scene/kind 等分组字段），故按模式切换 FieldDef 清单——
// 绝不能把 create 的字段直接塞给 update：DTO 未知字段会触发 Jackson 解析失败。

type SceneKey = EmergencyEventScene | 'ALL';

interface EventRow extends EmergencyEventItem {
  /** 事件来源分组名（后端 groups[].label，如「消防电话报警」）。 */
  groupLabel: string;
}

const SCENES: { key: SceneKey; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'FIRE', label: '消防应急' },
  { key: 'PRELIMINARY', label: '先期处置' },
];

/** 事件类型：event 事件 / drill 演练（后端 kind 缺省按事件处理）。 */
const KIND_LABEL: Record<string, string> = { event: '事件', drill: '演练' };

/** 事件类型下拉：取自登记表（kind/eventCategory/groupCode/groupLabel 由其推导，无需用户分别填）。 */
const EVENT_TYPE_OPTIONS = Object.keys(EMERGENCY_EVENT_TYPE_DEFS).map((k) => ({
  label: k,
  value: k,
}));

const SCENE_OPTIONS = [
  { label: '消防应急', value: 'FIRE' },
  { label: '先期处置', value: 'PRELIMINARY' },
];

/** 危害源等级：后端无字典表，取值来自大屏既有口径，故仍用下拉而非自由文本。 */
const LEVEL_OPTIONS = [
  { label: '一般', value: '一般' },
  { label: '较大', value: '较大' },
  { label: '重大', value: '重大' },
  { label: '特别重大', value: '特别重大' },
];

const CREATE_FIELDS: FieldDef[] = [
  { prop: 'scene', label: '事件场景', type: 'select', required: true, options: SCENE_OPTIONS },
  {
    prop: 'eventType',
    label: '事件类型',
    type: 'select',
    required: true,
    options: EVENT_TYPE_OPTIONS,
  },
  {
    prop: 'title',
    label: '事件标题',
    type: 'input',
    required: true,
    placeholder: '如 催化裂化装置泄漏起火',
  },
  {
    prop: 'location',
    label: '所处位置',
    type: 'input',
    required: true,
    placeholder: '如 炼油一部 1#催化装置',
  },
  { prop: 'description', label: '事件描述', type: 'textarea', required: true },
  { prop: 'eventTime', label: '发生时间', type: 'date', required: true },
  { prop: 'hazardSourceLevel', label: '危害源等级', type: 'select', options: LEVEL_OPTIONS },
  {
    prop: 'leftPercent',
    label: '舞台左偏移',
    type: 'input',
    required: true,
    placeholder: '如 48.3%',
  },
  {
    prop: 'topPercent',
    label: '舞台上偏移',
    type: 'input',
    required: true,
    placeholder: '如 36.1%',
  },
  { prop: 'longitude', label: '经度', type: 'number', required: true },
  { prop: 'latitude', label: '纬度', type: 'number', required: true },
];

const EDIT_FIELDS: FieldDef[] = [
  { prop: 'title', label: '事件标题', type: 'input', required: true },
  { prop: 'location', label: '所处位置', type: 'input', required: true },
  { prop: 'description', label: '事件描述', type: 'textarea' },
  { prop: 'eventTime', label: '发生时间', type: 'date', required: true },
  {
    prop: 'status',
    label: '处置状态',
    type: 'select',
    required: true,
    options: EMERGENCY_EVENT_STATUS_OPTIONS,
  },
  { prop: 'hazardSourceLevel', label: '危害源等级', type: 'select', options: LEVEL_OPTIONS },
  { prop: 'leftPercent', label: '舞台左偏移', type: 'input' },
  { prop: 'topPercent', label: '舞台上偏移', type: 'input' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
  { prop: 'endedAt', label: '结束时间', type: 'date' },
];

const rows = ref<EventRow[]>([]);
const loading = ref(false);
const scene = ref<SceneKey>('ALL');

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);
const mode = ref<'create' | 'edit'>('create');
const fields = computed<FieldDef[]>(() => (mode.value === 'create' ? CREATE_FIELDS : EDIT_FIELDS));

async function load(): Promise<void> {
  loading.value = true;
  try {
    const groups = await fetchEmergencyEvents(scene.value === 'ALL' ? undefined : scene.value);
    // 平铺为单表时把 groups[].label（报警来源）保留为列，避免丢失该维度；
    // 缺 groups 按空态处理，不回灌任何演示数据。
    rows.value = (Array.isArray(groups) ? groups : []).flatMap((g) =>
      (g.events ?? []).map((e) => ({ ...e, groupLabel: g.label })),
    );
  } catch (err) {
    toastErr(err, '加载应急事件失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  mode.value = 'create';
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: EventRow): void {
  mode.value = 'edit';
  // 编辑态把契约字段映射回表单字段名（展示 left/top、更新用 leftPercent/topPercent）
  editRow.value = {
    ...row,
    leftPercent: row.left,
    topPercent: row.top,
    eventTime: row.time,
  } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

/** 把「事件类型」下拉值展开为落库所需的 kind/eventCategory/groupCode/groupLabel。 */
function expandEventType(payload: Record<string, unknown>): EmergencyEventCreateRequest {
  const { eventType, ...rest } = payload as Record<string, unknown> & { eventType?: string };
  const def = eventType
    ? EMERGENCY_EVENT_TYPE_DEFS[eventType as keyof typeof EMERGENCY_EVENT_TYPE_DEFS]
    : undefined;
  return {
    ...rest,
    kind: def?.kind ?? 'event',
    eventCategory: def?.eventCategory ?? 'default',
    groupCode: def?.groupCode ?? 'manual-event',
    groupLabel: def?.groupLabel ?? '突发应急事件',
  } as unknown as EmergencyEventCreateRequest;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    if (id == null) {
      await createEmergencyEvent(expandEventType(payload));
      toastOk('应急事件已新增');
    } else {
      await updateEmergencyEvent(id, payload as EmergencyEventUpdateRequest);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: EventRow): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除应急事件「${row.title || String(row.id)}」？其关联的事故救援行与详情字段将一并清理，删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteEmergencyEvent(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：大屏/移动端新增或推进事件状态，本列表自动重拉
useDomainAutoRefresh('emergency.event', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead title="应急事件" crumb="应急及演练管理 / 应急事件" :icon="Aim" icon-tone="red">
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
        <el-button v-permission="'emergency:event:write'" type="primary" @click="openCreate">
          新增事件
        </el-button>
      </template>
    </MgmtPageHead>

    <el-tabs v-model="scene" class="mgmt-event-tabs" @tab-change="() => load()">
      <el-tab-pane v-for="s in SCENES" :key="s.key" :label="s.label" :name="s.key" />
    </el-tabs>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="事件编号" width="100" />
      <el-table-column prop="title" label="事件标题" min-width="200">
        <template #default="{ row }">{{ row.title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="groupLabel" label="报警来源" width="150" />
      <el-table-column label="事件类型" width="100">
        <template #default="{ row }">{{ KIND_LABEL[row.kind ?? 'event'] ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="所处位置" min-width="170">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="time" label="发生时间" width="165" />
      <el-table-column label="危害源等级" width="110">
        <template #default="{ row }">{{ row.hazardSourceLevel || '—' }}</template>
      </el-table-column>
      <el-table-column prop="statusLabel" label="状态" width="100" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'emergency:event:write'"
            link
            type="primary"
            @click="openEdit(row as EventRow)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'emergency:event:write'"
            link
            type="danger"
            @click="onDelete(row as EventRow)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="fields"
      title="应急事件"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.mgmt-event-tabs {
  margin-bottom: var(--space-sm);
}
</style>
