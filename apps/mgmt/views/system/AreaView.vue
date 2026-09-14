<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MapLocation } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchSystemZones } from '@/services/system';
import type { ZoneItem } from '@/services/system';

// 茂名石化厂区配置（/area-config）：只读展示后端防区主数据（GET /system/zones）。
// 防区是数据权限（行级 ABAC）的维度主数据，后端当前为只读，故本页不提供增删改。

const rows = ref<ZoneItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const list = await fetchSystemZones();
    rows.value = Array.isArray(list) ? list : [];
  } catch (err) {
    toastErr(err, '加载防区失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="茂名石化厂区配置"
      crumb="基础信息管理 / 茂名石化厂区配置"
      :icon="MapLocation"
      icon-tone="cyan"
    />

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="防区为数据权限主数据，当前由后端只读维护；用户可访问防区在「人员与账号管理」中分配。"
      style="margin-bottom: var(--space-md)"
    />

    <section class="mgmt-card">
      <el-table v-loading="loading" :data="rows" stripe style="width: 100%">
        <el-table-column prop="zoneCode" label="防区编码" min-width="140" />
        <el-table-column prop="zoneName" label="防区名称" min-width="180" />
        <el-table-column prop="sortOrder" label="排序" width="100">
          <template #default="{ row }">{{ row.sortOrder ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <span class="tag" :class="row.status === 1 ? 'tag-success' : 'tag-info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.mgmt-card {
  padding: var(--space-md) var(--space-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}
</style>
