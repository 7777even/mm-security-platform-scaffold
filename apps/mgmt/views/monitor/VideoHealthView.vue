<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Monitor } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchVideoCameras } from '@/services/video';
import type { VideoCameraItem } from '@/services/video';

// 视频健康度管理（/video-health）：接后端 /video/cameras，以状态列呈现设备健康度。
const rows = ref<VideoCameraItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchVideoCameras(1, 200);
    rows.value = Array.isArray(res?.list) ? res.list : [];
  } catch (err) {
    toastErr(err, '加载视频健康度失败：');
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
      title="视频健康度管理"
      crumb="设备管理 / 视频健康度管理"
      :icon="Monitor"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="cameraType" label="类型" min-width="120">
        <template #default="{ row }">{{ row.cameraType || '—' }}</template>
      </el-table-column>
      <el-table-column label="健康度" min-width="110" align="center">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.status === 'live'
                ? 'tag-success'
                : row.status === 'loading'
                  ? 'tag-warning'
                  : 'tag-danger'
            "
          >
            {{ row.status === 'live' ? '健康' : row.status === 'loading' ? '加载中' : '异常' }}
          </span>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
