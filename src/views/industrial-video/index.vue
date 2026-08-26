<!--
  工业视频模块占位 — §12.4 视频监控（图 5-14）
  统一 ModuleLayout 骨架（中央地图 + 两侧面板，与 dashboard 一致）；
  未来接入：视频流渲染 / 摄像头状态订阅 / AI 识别事件。
-->
<script setup lang="ts">
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AppButton from '@/components/common/AppButton.vue';

// §9.1 视频统计卡组（设计稿图 5-14 左上）
const stats = [
  { title: '视频总数 / 路', value: 665, icon: 'VideoCamera' },
  { title: '在线 / 路', value: 596, icon: 'VideoPlay' },
  { title: '故障 / 路', value: 23, icon: 'WarningFilled' },
  { title: '完好率 / %', value: 98, icon: 'DataLine' },
] as const;

const channels = [
  { id: 'CAM-101', name: '装置 A 区 01 号', state: '在线', online: true },
  { id: 'CAM-102', name: '罐区 B 区 02 号', state: '在线', online: true },
  { id: 'CAM-103', name: '装卸区 01 泊位', state: '在线', online: true },
  { id: 'CAM-104', name: '主控室入口', state: '故障', online: false },
];
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：视频概览统计卡 + 通道列表 -->
    <template #left>
      <PanelCard title="视频概览" icon="DataBoard">
        <section class="stat-grid">
          <StatCard
            v-for="s in stats"
            :key="s.title"
            :title="s.title"
            :value="s.value"
            :icon="s.icon"
          />
        </section>
        <div class="actions">
          <AppButton variant="primary" size="sm">实时监控</AppButton>
          <AppButton variant="ghost" size="sm">视频回放</AppButton>
          <AppButton variant="default" size="sm">AI 识别配置</AppButton>
        </div>
      </PanelCard>
    </template>

    <!-- 右侧：在线通道卡片列表 -->
    <template #right>
      <PanelCard title="视频通道" icon="VideoCamera" more="查看全部">
        <ul class="channel-list" data-test="channel-list">
          <li
            v-for="c in channels"
            :key="c.id"
            class="channel-card"
            :class="{ 'is-offline': !c.online }"
          >
            <span class="channel-card__id font-number">{{ c.id }}</span>
            <span class="channel-card__name">{{ c.name }}</span>
            <span class="channel-card__state" :class="c.online ? 'is-on' : 'is-fault'">
              {{ c.state }}
            </span>
          </li>
        </ul>
        <p v-if="channels.length === 0" class="channel-empty">暂无视频通道</p>
      </PanelCard>
    </template>
  </ModuleLayout>
</template>

<style scoped>
/* §9.1 统计卡网格：2 列 16px 间距 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* §9.3 按钮组 */
.actions {
  display: flex;
  gap: var(--space-sm);
}

/* 通道卡片列表：超出可滚动但隐藏滚动条 */
.channel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.channel-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.channel-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 12px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.channel-card:hover {
  border-color: var(--color-accent);
  background: var(--color-panel-soft);
}

.channel-card.is-offline {
  opacity: 0.6;
}

.channel-card__id {
  color: var(--color-text-muted);
  font-size: 11px;
}

.channel-card__name {
  color: var(--color-text);
}

.channel-card__state {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
}

.channel-card__state.is-on {
  color: var(--color-success);
}

.channel-card__state.is-fault {
  color: var(--color-danger);
}

.channel-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 16px 0;
}
</style>
