<script setup lang="ts">
// 消息中心（契约 docs/api/notification.openapi.json）
// 收件箱：本人 + 全员广播；支持分类/已读过滤、单条已读、全部已读、删除、分页。
import { onMounted, reactive, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from '@/services/message';
import type { NotificationItem as ApiNotificationItem } from '@/services/message';

const loading = ref(false);
const list = ref<ApiNotificationItem[]>([]);
const total = ref(0);
const unread = ref(0);
const page = ref(1);
const size = ref(20);

const filters = reactive<{ category: string; read: '' | 0 | 1 }>({ category: '', read: '' });

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await fetchNotifications({
      page: page.value,
      size: size.value,
      category: filters.category || undefined,
      read: filters.read === '' ? undefined : filters.read,
    });
    list.value = r.list ?? [];
    total.value = r.total ?? 0;
    unread.value = r.unreadCount ?? 0;
  } catch (e) {
    ElMessage.error(errMsg(e));
    list.value = [];
    total.value = 0;
    unread.value = 0;
  } finally {
    loading.value = false;
  }
}

function asNotify(row: unknown): ApiNotificationItem {
  return row as ApiNotificationItem;
}

function onFilter(): void {
  page.value = 1;
  void load();
}

function onPageChange(p: number): void {
  page.value = p;
  void load();
}

async function readOne(row: ApiNotificationItem): Promise<void> {
  if (row.read) return;
  try {
    await markNotificationRead(row.id as number);
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function readAll(): Promise<void> {
  if (unread.value === 0) return;
  try {
    await markAllNotificationsRead();
    ElMessage.success('已全部标为已读');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function remove(row: ApiNotificationItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除通知「${row.title}」？`, '删除确认', { type: 'warning' });
  } catch {
    return;
  }
  try {
    await deleteNotification(row.id as number);
    ElMessage.success('已删除');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

onMounted(load);

// 三端实时刷新：任一端新增/删除通知，本页自动重拉
useDomainAutoRefresh('system.notification', load, { immediate: false });
</script>

<template>
  <PanelCard title="消息中心" icon="Bell">
    <div class="nc__toolbar">
      <div class="nc__filters">
        <el-select
          v-model="filters.category"
          placeholder="全部分类"
          clearable
          style="width: 140px"
          @change="onFilter"
        >
          <el-option label="报警通知" value="alarm" />
          <el-option label="事件通知" value="event" />
          <el-option label="任务通知" value="task" />
          <el-option label="系统通知" value="system" />
        </el-select>
        <el-select
          v-model="filters.read"
          placeholder="全部状态"
          clearable
          style="width: 120px"
          @change="onFilter"
        >
          <el-option label="未读" :value="0" />
          <el-option label="已读" :value="1" />
        </el-select>
        <span class="nc__unread">未读 {{ unread }}</span>
      </div>
      <el-button size="small" type="success" :disabled="unread === 0" @click="readAll">
        全部已读
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" size="small" border row-key="id">
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag v-if="!asNotify(row).read" type="danger" size="small">未读</el-tag>
          <el-tag v-else type="info" size="small">已读</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ asNotify(row).category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="summary" label="摘要" min-width="220" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="!asNotify(row).read"
            link
            type="primary"
            @click.stop="readOne(asNotify(row))"
          >
            标为已读
          </el-button>
          <el-button link type="danger" @click.stop="remove(asNotify(row))">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="nc__pager">
      <el-pagination
        layout="total, prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>
  </PanelCard>
</template>

<style scoped>
.nc__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.nc__filters {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nc__unread {
  font-size: var(--font-size-stat-label);
  color: var(--color-danger);
}

.nc__pager {
  margin-top: var(--space-sm);
  display: flex;
  justify-content: flex-end;
}
</style>
