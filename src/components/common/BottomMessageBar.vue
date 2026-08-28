<!--
  BottomMessageBar — §11.2 底部消息栏（设计稿图 5-9 右）
  56px 高；滚动消息列表；消息级 / 系统级 / 处置级三种色调
-->
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

    <button type="button" class="msg-bar__more" title="查看全部消息">查看全部</button>
  </footer>
</template>

<style scoped>
.msg-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  height: var(--message-bar-h);
  flex-shrink: 0;
  padding: 0 var(--space-lg);
  background: var(--message-bar-bg);
  backdrop-filter: blur(6px);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  position: relative;
  z-index: var(--z-chrome);
}

/* §11.2 顶部 1px 青色光带（与 header 底部对称） */
.msg-bar::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--layout-header-line), transparent);
  pointer-events: none;
}

.msg-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-subtitle);
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-accent);
  white-space: nowrap;
}

.msg-bar__brand-icon {
  width: var(--icon-md);
  height: var(--icon-md);
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
  font-size: var(--font-size-helper);
  line-height: 18px;
  border: 1px solid currentcolor;
}

/* §13.2 报警/系统/处置三类消息色调（与 dashboard tone-* 对齐） */
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

.msg-bar__more {
  flex-shrink: 0;
  padding: 4px 14px;
  font-size: var(--font-size-helper);
  color: var(--color-accent);
  background: rgb(0 212 255 / 8%);
  border: 1px solid rgb(0 212 255 / 40%);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  white-space: nowrap;
}

.msg-bar__more:hover {
  background: rgb(0 212 255 / 18%);
  border-color: rgb(0 212 255 / 70%);
}
</style>
