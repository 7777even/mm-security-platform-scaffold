<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Aim } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchEmergencyEvents } from '@/services/emergencyEvent';
import type { EmergencyEventItem, EmergencyEventScene } from '@/services/emergencyEvent';

// 应急事件管理（/emergency-event）：接后端 GET /emergency-events。
// 补端间缺口：大屏与移动端此前已展示该数据源，管理端无页面（本次新增）。
// 后端按 scene 分组维度返回（FIRE 消防应急 / PRELIMINARY 先期处置），
// 且组内再按「报警来源」分组（如「消防电话报警」）；页面以页签切 scene、把来源保留为独立列。

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

const rows = ref<EventRow[]>([]);
const loading = ref(false);
const scene = ref<SceneKey>('ALL');

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

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead title="应急事件" crumb="应急及演练管理 / 应急事件" :icon="Aim" icon-tone="red">
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
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
    </MgmtProTable>
  </div>
</template>

<style scoped>
.mgmt-event-tabs {
  margin-bottom: var(--space-sm);
}
</style>
