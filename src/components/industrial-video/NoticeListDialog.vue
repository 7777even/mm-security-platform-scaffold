<!--
  NoticeListDialog — 系统消息列表（工业电视 noticeList）
  列出系统消息（前端 mock 静态数据），点击行高亮。
  图标：压缩包 fire-situation 图标（PkgIcon，bell-ringing=消息）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { showToast } from '@/composables/useToast';

interface Notice {
  id: string;
  time: string;
  text: string;
}

const notices: Notice[] = [
  { id: '1', time: '14:21:30', text: '单人登陆：通知系统' },
  {
    id: '2',
    time: '14:21:30',
    text: '设备温湿度超标：A3 管理区域设备使用湿度过程超标湿度 20%，使用人员立即清理。',
  },
  {
    id: '3',
    time: '14:21:30',
    text: '人脸识别核验：A3 管理区域核验未注册人员，请核实。',
  },
  {
    id: '4',
    time: '14:21:30',
    text: '设备温湿度超标：A3 管理区域设备使用湿度过程超标湿度 20%。',
  },
];

const emit = defineEmits<{ close: [] }>();

function view(n: Notice): void {
  showToast(`消息：${n.text.slice(0, 16)}…`);
}
</script>

<template>
  <ScreenDialog :open="true" title="系统消息" icon="bell-ringing" @close="emit('close')">
    <ul class="list">
      <li v-for="n in notices" :key="n.id" class="list__item" @click="view(n)">
        <PkgIcon name="bell-ringing" size="16px" class="list__icon" />
        <span class="list__time">{{ n.time }}</span>
        <span class="list__text">{{ n.text }}</span>
      </li>
    </ul>
  </ScreenDialog>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.list__item {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  cursor: pointer;
}

.list__item:hover {
  border-color: var(--color-accent-glow);
}

.list__icon {
  color: var(--color-accent);
  flex-shrink: 0;
  align-self: center;
}

.list__time {
  flex-shrink: 0;
  font-family: var(--font-number);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.list__text {
  font-size: var(--font-size-biz);
  color: var(--color-text);
  line-height: 1.5;
}
</style>
