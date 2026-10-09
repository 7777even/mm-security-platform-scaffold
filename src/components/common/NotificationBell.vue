<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  toMessageItem,
  type MessageItem,
} from '@/services/message';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

const router = useRouter();
const open = ref(false);
const items = ref<MessageItem[]>([]);
const unread = ref(0);
const loading = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await fetchNotifications({ page: 1, size: 8 });
    items.value = (r.list ?? []).map(toMessageItem);
    unread.value = r.unreadCount ?? 0;
  } finally {
    loading.value = false;
  }
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) void load();
}

async function readOne(id: string): Promise<void> {
  await markNotificationRead(id);
  await load();
}

async function readAll(): Promise<void> {
  await markAllNotificationsRead();
  await load();
}

function goCenter(): void {
  open.value = false;
  router.push('/notifications');
}

// 后端通知结构变更（新增/删除）实时广播时刷新铃铛
useDomainAutoRefresh('system.notification', load, { immediate: false });

onMounted(() => {
  void load();
  timer = setInterval(() => void load(), 30_000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="bell">
    <button
      type="button"
      class="bell__btn"
      :class="{ 'bell__btn--active': open }"
      title="消息中心"
      aria-label="消息中心"
      @click.stop="toggle"
    >
      <el-badge :value="unread" :hidden="unread === 0" :max="99" class="bell__badge">
        <el-icon class="bell__icon" :size="20"><Bell /></el-icon>
      </el-badge>
    </button>

    <div v-if="open" class="bell__panel" @click.stop>
      <div class="bell__panel-head">
        <span class="bell__panel-title">通知</span>
        <span class="bell__panel-unread" :class="{ 'is-zero': unread === 0 }">
          {{ unread }} 条未读
        </span>
        <button type="button" class="bell__panel-readall" :disabled="unread === 0" @click="readAll">
          全部已读
        </button>
      </div>

      <div class="bell__panel-body">
        <div v-if="loading && items.length === 0" class="bell__placeholder">加载中…</div>
        <div v-else-if="items.length === 0" class="bell__placeholder">暂无通知</div>
        <ul v-else class="bell__list">
          <li
            v-for="it in items"
            :key="it.id"
            class="bell__item"
            :class="['bell__item--' + it.category, { 'is-unread': !it.read }]"
          >
            <span class="bell__dot" />
            <div class="bell__item-main">
              <div class="bell__item-title">{{ it.title }}</div>
              <div class="bell__item-meta">
                <span class="bell__tag">{{ it.category }}</span>
                <span class="bell__time font-number">{{ it.time }}</span>
              </div>
            </div>
            <button
              v-if="!it.read"
              type="button"
              class="bell__item-read"
              title="标为已读"
              @click="readOne(it.id)"
            >
              已读
            </button>
          </li>
        </ul>
      </div>

      <button type="button" class="bell__panel-more" @click="goCenter">查看全部消息</button>
    </div>
  </div>
</template>

<style scoped>
.bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.bell__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.bell__btn:hover,
.bell__btn--active {
  background: var(--color-accent-soft);
  color: var(--color-text-strong);
}

.bell__badge :deep(.el-badge__content) {
  border: none;
  background: var(--color-danger);
  font-weight: 600;
}

.bell__icon {
  display: inline-flex;
}

.bell__panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-height: 460px;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated, var(--color-bg, #fff));
  border: 1px solid var(--border-glow, var(--border, #e5e7eb));
  border-radius: var(--radius-md);
  box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
  z-index: var(--z-popover, 1200);
  overflow: hidden;
}

.bell__panel-head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 12px 14px;
  border-bottom: 1px solid var(--border, #eef0f3);
}

.bell__panel-title {
  font-size: var(--font-size-subtitle);
  font-weight: 600;
  color: var(--color-text-strong);
}

.bell__panel-unread {
  font-size: var(--font-size-helper);
  color: var(--color-danger);
}

.bell__panel-unread.is-zero {
  color: var(--color-text-muted);
}

.bell__panel-readall {
  margin-left: auto;
  padding: 4px 10px;
  font-size: var(--font-size-helper);
  color: var(--color-accent);
  background: var(--color-accent-faint, #eaf3ff);
  border: 1px solid var(--border-glow, #bcd9ff);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.bell__panel-readall:disabled {
  color: var(--color-text-muted);
  border-color: var(--border, #e5e7eb);
  background: var(--color-bg-soft, #f5f6f8);
  cursor: not-allowed;
}

.bell__panel-body {
  flex: 1;
  overflow-y: auto;
}

.bell__placeholder {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-body);
}

.bell__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bell__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-soft, #f2f3f5);
}

.bell__item.is-unread {
  background: var(--color-accent-faint, #f3f8ff);
}

.bell__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: transparent;
}

.bell__item.is-unread .bell__dot {
  background: var(--color-accent);
}

.bell__item-main {
  flex: 1;
  min-width: 0;
}

.bell__item-title {
  font-size: var(--font-size-body);
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bell__item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: 2px;
}

.bell__tag {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  padding: 0 6px;
  border-radius: var(--radius-sm);
  border: 1px solid currentcolor;
  line-height: 16px;
}

.bell__time {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.bell__item--alarm .bell__tag {
  color: var(--color-danger);
}

.bell__item--system .bell__tag {
  color: var(--color-accent-2);
}

.bell__item--event .bell__tag {
  color: var(--color-warning);
}

.bell__item--task .bell__tag {
  color: var(--color-success);
}

.bell__item-read {
  flex-shrink: 0;
  padding: 3px 8px;
  font-size: var(--font-size-helper);
  color: var(--color-accent);
  background: transparent;
  border: 1px solid var(--border-glow, #bcd9ff);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.bell__panel-more {
  padding: 10px;
  font-size: var(--font-size-body);
  color: var(--color-accent);
  background: var(--color-bg-soft, #f7f8fa);
  border: none;
  border-top: 1px solid var(--border, #eef0f3);
  cursor: pointer;
}

.bell__panel-more:hover {
  background: var(--color-accent-soft);
}
</style>
