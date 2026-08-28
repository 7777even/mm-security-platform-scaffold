<!--
  SystemNoticeBar — §工业电视「系统消息」全宽底部横条
  左侧公告图标 + 滚动消息列表 + 右侧"查看全部"链接。
  配合 ModuleLayout 的 #bottom 插槽使用；默认贴底部全宽（宿主视图覆盖定位）。
-->
<script setup lang="ts">
import { BellFilled } from '@element-plus/icons-vue';

interface Notice {
  id: string;
  text: string;
}

const notices: Notice[] = [
  { id: '1', text: '单人登陆：通知系统' },
  {
    id: '2',
    text: '设备温湿度超标：2026-03-17 14:21:30，A3 管理区域设备使用湿度过程超标湿度 20%，使用人员立即清理。',
  },
  {
    id: '3',
    text: '人脸识别核验：2026-03-17 14:21:30，A3 管理区域核验未注册人员，请核实。',
  },
  {
    id: '4',
    text: '设备温湿度超标：2026-03-17 14:21:30，A3 管理区域设备使用湿度过程超标湿度 20%。',
  },
];

function viewAll(): void {
  // 跳转通知中心（占位）
  console.warn('[notice] view-all');
}
</script>

<template>
  <div class="notice">
    <div class="notice__head">
      <BellFilled class="notice__icon" />
      <span class="notice__title">系统消息</span>
    </div>
    <ul class="notice__list">
      <li v-for="n in notices" :key="n.id" class="notice__item">{{ n.text }}</li>
    </ul>
    <button type="button" class="notice__more" @click="viewAll">
      查看全部 <span class="arrow">›</span>
    </button>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 22px rgb(0 0 0 / 35%);
}

.notice__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 12px;
  border-right: 1px solid var(--panel-border);
  flex-shrink: 0;
}

.notice__icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
}

.notice__title {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  color: var(--color-text-strong);
  letter-spacing: 1px;
}

.notice__list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 18px;
  overflow-x: auto;
  scrollbar-width: none;
}

.notice__list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.notice__item {
  flex-shrink: 0;
  font-size: var(--font-size-helper);
  color: var(--color-text);
  white-space: nowrap;
}

.notice__more {
  flex-shrink: 0;
  background: transparent;
  border: none;
  font-size: var(--font-size-helper);
  color: var(--color-accent);
  cursor: pointer;
  padding: 2px 6px;
}

.notice__more:hover {
  text-decoration: underline;
}

.arrow {
  margin-left: 2px;
}
</style>
