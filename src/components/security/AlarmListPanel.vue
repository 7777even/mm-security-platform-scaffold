<!--
  AlarmListPanel — §安全防范「告警列表」
  顶部筛选（危险源/告警类型）+ 告警条目（标题 + 处理状态徽标 + 告警源 + 描述 + 时间）。
  状态徽标：未处理（红）/处理中（橙）/已处理（绿），左侧边框色同步。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

type Status = '未处理' | '处理中' | '已处理';

interface AlarmListItem {
  id: string;
  title: string;
  source: string;
  desc: string;
  time: string;
  status: Status;
}

const items: AlarmListItem[] = [
  {
    id: '1',
    title: '人员异常聚集',
    source: '危化品库房',
    desc: '监控视频识别到人员进入危化品库房聚集，已报警',
    time: '2026-03-17 14:21:34',
    status: '未处理',
  },
  {
    id: '2',
    title: '闯岗事件',
    source: '北门岗哨',
    desc: '未授权人员强行通过北门岗哨区域，请核实',
    time: '2026-03-17 14:20:30',
    status: '处理中',
  },
  {
    id: '3',
    title: '危险事件',
    source: '罐区视频监控',
    desc: '罐区发现可疑人员活动，建议立刻派员核查',
    time: '2026-03-17 13:50:12',
    status: '已处理',
  },
  {
    id: '4',
    title: '危险区域入侵',
    source: '罐区视频监控',
    desc: '非授权人员闯入厂区北侧区域，人员已清退',
    time: '2026-03-17 12:42:06',
    status: '已处理',
  },
];

const statusColor: Record<Status, string> = {
  未处理: '#ff6b6b',
  处理中: '#ffc24b',
  已处理: '#2ee6a8',
};

function onMore(): void {
  // 打开告警详情（占位）
  console.warn('[alarm-list] more');
}
</script>

<template>
  <PanelCard title="告警列表" icon="List" more="危险源" @more="onMore">
    <div class="filter">
      <span class="filter__label">危险源</span>
      <span class="filter__divider">|</span>
      <button type="button" class="filter__btn filter__btn--active">告警类型</button>
    </div>

    <ul class="alarm-list">
      <li
        v-for="i in items"
        :key="i.id"
        class="alarm-item"
        :style="{ borderLeftColor: statusColor[i.status] }"
      >
        <div class="alarm-item__head">
          <span class="alarm-item__title">{{ i.title }}</span>
          <span
            class="alarm-item__status"
            :style="{
              color: statusColor[i.status],
              background: statusColor[i.status] + '22',
              borderColor: statusColor[i.status] + '66',
            }"
          >
            {{ i.status }}
          </span>
        </div>
        <div class="alarm-item__source">告警源：{{ i.source }}</div>
        <div class="alarm-item__desc">{{ i.desc }}</div>
        <div class="alarm-item__time">{{ i.time }}</div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.filter {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.filter__divider {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.filter__btn {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(0 225 255 / 10%);
  color: var(--color-accent);
  border: 1px solid rgb(0 225 255 / 40%);
  font-size: 12px;
  cursor: pointer;
}

.alarm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: none;
}

.alarm-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.alarm-item {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
  border-left-width: 3px;
  border-left-style: solid;
}

.alarm-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.alarm-item__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.alarm-item__status {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
  border: 1px solid;
}

.alarm-item__source {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.alarm-item__desc {
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.5;
  margin-bottom: 4px;
}

.alarm-item__time {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-number);
}
</style>
