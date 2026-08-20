<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { fetchMessages, levelLabel, type MessageItem } from '@/services/message';

const messages = ref<MessageItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    messages.value = await fetchMessages();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <footer class="msg-bar" aria-label="系统消息实时播报">
    <span class="msg-bar__brand">
      <component :is="Bell" class="msg-bar__brand-icon" />
      <span class="msg-bar__brand-text">实时播报</span>
    </span>

    <div class="msg-bar__viewport">
      <div v-if="loading" class="msg-bar__placeholder">消息加载中…</div>
      <div v-else-if="messages.length === 0" class="msg-bar__placeholder">暂无播报消息</div>
      <div v-else class="msg-bar__track">
        <template v-for="loop in 2" :key="loop">
          <span
            v-for="item in messages"
            :key="loop + '-' + item.id"
            class="msg-item"
            :class="'msg-item--' + item.level"
          >
            <span class="msg-item__tag">{{ levelLabel(item.level) }}</span>
            <span class="msg-item__text">{{ item.text }}</span>
            <span v-if="item.time" class="msg-item__time font-number">{{ item.time }}</span>
          </span>
        </template>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.msg-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  height: 56px;
  flex-shrink: 0;
  padding: 0 var(--space-lg);
  background: rgb(11 21 38 / 85%);
  backdrop-filter: blur(6px);
  border-top: 1px solid var(--glass-border);
  color: var(--color-text-muted);
}

.msg-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-accent);
  white-space: nowrap;
}

/* 图标 svg 无 width/height，需显式定尺寸；fill=currentColor 随品牌色 */
.msg-bar__brand-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.msg-bar__viewport {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.msg-bar__placeholder {
  font-size: var(--font-body);
  color: var(--color-text-muted);
}

/* 滚动轨道：重复两遍消息列表，整体平移 -50% 形成无缝循环 */
.msg-bar__track {
  display: inline-flex;
  align-items: center;
  gap: 48px;
  white-space: nowrap;
  will-change: transform;
  animation: msg-ticker 32s linear infinite;
}

@keyframes msg-ticker {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .msg-bar__track {
    animation: none;
  }
}

.msg-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-body);
}

.msg-item__tag {
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 18px;
  border: 1px solid currentcolor;
}

.msg-item--alarm {
  color: var(--color-danger);
}

.msg-item--system {
  color: var(--color-accent-2);
}

.msg-item--disposition {
  color: var(--color-success);
}

.msg-item__text {
  color: var(--color-text);
}

.msg-item__time {
  color: var(--color-text-muted);
}
</style>
