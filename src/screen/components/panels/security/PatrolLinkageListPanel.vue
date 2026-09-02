<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import {
  activePatrolZoneLabel,
  closePatrolLinkage,
  openPatrolLinkageVideoWall,
  patrolLinkagePoints,
  selectPatrolPoint,
} from '../../../lib/composables/usePatrolLinkage';

function statusClass(status: string) {
  if (status === '离线') return 'patrol-linkage-list__status--offline';
  if (status === '故障') return 'patrol-linkage-list__status--fault';
  return 'patrol-linkage-list__status--ok';
}
</script>

<template>
  <PanelCard title="" variant="patrolLeft" module="security" :show-more="false">
    <template #title>
      <div class="patrol-linkage-list__title">
        <h3 class="patrol-linkage-list__heading">联动巡查 · {{ activePatrolZoneLabel }}</h3>
        <span class="patrol-linkage-list__count">共 {{ patrolLinkagePoints.length }} 个点位</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="patrol-linkage-list__btn" @click="openPatrolLinkageVideoWall">
        视频墙调阅
      </button>
      <button type="button" class="patrol-linkage-list__btn" @click="closePatrolLinkage">
        返回
      </button>
    </template>

    <div class="patrol-linkage-list">
      <div class="patrol-linkage-list__head">
        <span>点位名称</span>
        <span>位置</span>
        <span>状态</span>
        <span>操作</span>
      </div>

      <div class="patrol-linkage-list__rows">
        <div v-for="point in patrolLinkagePoints" :key="point.id" class="patrol-linkage-list__row">
          <span class="patrol-linkage-list__name">{{ point.name }}</span>
          <span class="patrol-linkage-list__location">{{ point.location }}</span>
          <span class="patrol-linkage-list__status" :class="statusClass(point.status)">
            {{ point.status }}
          </span>
          <button type="button" class="patrol-linkage-list__play" @click="selectPatrolPoint(point)">
            视频调阅
          </button>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.patrol-linkage-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.patrol-linkage-list__heading {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.patrol-linkage-list__count {
  color: #8aa4c4;
  font-size: 12px;
}

.patrol-linkage-list__btn {
  height: 26px;
  padding: 0 10px;
  margin-left: 6px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.patrol-linkage-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.patrol-linkage-list__head,
.patrol-linkage-list__row {
  display: grid;
  grid-template-columns: 1.1fr 1.3fr 0.7fr auto;
  gap: 8px;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.patrol-linkage-list__head {
  height: 32px;
  flex-shrink: 0;
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
  background: rgb(0 40 78 / 45%);
  color: #8aa4c4;
  font-size: 12px;
}

.patrol-linkage-list__rows {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.patrol-linkage-list__row {
  min-height: 42px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  color: #e8f2fc;
  font-size: 12px;
  cursor: pointer;
}

.patrol-linkage-list__row:hover {
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 35 70 / 55%);
}

.patrol-linkage-list__name,
.patrol-linkage-list__location {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patrol-linkage-list__status--ok {
  color: #3ecf8e;
}

.patrol-linkage-list__status--offline {
  color: #8aa4c4;
}

.patrol-linkage-list__status--fault {
  color: #ff6b5a;
}

.patrol-linkage-list__play {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 180 255 / 40%);
  border-radius: 2px;
  background: rgb(0 90 160 / 40%);
  color: #e8f4ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}
</style>
