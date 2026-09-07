<script setup lang="ts">
import PanelCard from '../../common/PanelCard.vue';
import { countPlayableCameras, patrolCameras, type PatrolCameraItem } from '@/services/security';
import {
  closePatrolCameraListView,
  goToPatrolCameraPage,
  openPatrolCameraListVideoWall,
  patrolCameraCurrentPage,
  patrolCameraPagedItems,
  patrolCameraSearchKeyword,
  patrolCameraTotalPages,
  patrolCameraVisiblePages,
  resetPatrolCameraSearch,
} from '../../../lib/composables/usePatrolCameraListView';

function statusClass(status: PatrolCameraItem['status']) {
  if (status === '正常') return 'camera-table__status--normal';
  if (status === '离线') return 'camera-table__status--offline';
  return 'camera-table__status--fault';
}

const videoWallCount = countPlayableCameras(patrolCameras);

function handlePlay(item: PatrolCameraItem) {
  if (item.status !== '正常') return;
  // 占位：单路播放（由地图撒点点击弹窗触发，这里后续可复用同一弹窗）
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="camera-list__title">
        <h3 class="camera-list__heading">联动巡查摄像头</h3>
        <span class="camera-list__count">共 {{ patrolCameras.length }} 路</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="camera-list__wall-btn" @click="openPatrolCameraListVideoWall">
        视频墙巡查
        <span v-if="videoWallCount > 0" class="camera-list__wall-badge">{{ videoWallCount }}</span>
      </button>
      <button type="button" class="camera-list__back" @click="closePatrolCameraListView">
        返回
      </button>
    </template>

    <div class="camera-list">
      <div class="camera-list__toolbar">
        <input
          v-model="patrolCameraSearchKeyword"
          type="text"
          class="camera-list__search"
          placeholder="请输入摄像头名称 / 防控区域"
        />
        <button
          v-if="patrolCameraSearchKeyword"
          type="button"
          class="camera-list__reset"
          @click="resetPatrolCameraSearch"
        >
          重置
        </button>
      </div>

      <div class="camera-table">
        <div class="camera-table__head">
          <span>摄像头名称</span>
          <span>状态</span>
          <span>操作</span>
        </div>

        <div v-for="item in patrolCameraPagedItems" :key="item.id" class="camera-table__row">
          <span class="camera-table__name">
            {{ item.name }}
            <em>{{ item.zone }}</em>
          </span>
          <span class="camera-table__status" :class="statusClass(item.status)">{{
            item.status
          }}</span>
          <span class="camera-table__action">
            <button
              v-if="item.status === '正常'"
              type="button"
              class="camera-table__play"
              @click="handlePlay(item)"
            >
              播放
            </button>
            <span v-else class="camera-table__dash">—</span>
          </span>
        </div>
      </div>

      <div class="camera-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="patrolCameraCurrentPage <= 1"
          @click="goToPatrolCameraPage(patrolCameraCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in patrolCameraVisiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': patrolCameraCurrentPage === page }"
          @click="goToPatrolCameraPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="patrolCameraCurrentPage >= patrolCameraTotalPages"
          @click="goToPatrolCameraPage(patrolCameraCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.camera-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.camera-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.camera-list__count {
  font-size: 13px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.camera-list__back {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.camera-list__wall-btn {
  position: relative;
  height: 26px;
  padding: 0 10px;
  margin-left: 6px;
  border: 1px solid var(--border-glow);
  border-radius: 2px;
  background: rgb(0 90 160 / 35%);
  color: #e8f4ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.camera-list__wall-btn:hover {
  background: rgb(0 180 255 / 15%);
  border-color: var(--color-accent);
  color: var(--color-text-strong);
}

.camera-list__wall-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--color-warning);
  color: #1a1200;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.camera-list__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.camera-list__search {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  background: rgb(0 22 48 / 75%);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.camera-list__search::placeholder {
  color: #6a84a4;
}

.camera-list__search:focus {
  border-color: rgb(0 180 255 / 70%);
}

.camera-list__reset {
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.camera-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.camera-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: 2px;
}

.camera-table__head,
.camera-table__row {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.7fr;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.camera-table__head {
  padding: 0 10px 4px;
  font-size: 12px;
  color: var(--map-device-offline);
}

.camera-table__row {
  padding: 10px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: var(--color-text-strong);
}

.camera-table__name {
  font-size: 14px;
  font-weight: 500;
  min-width: 0;
}

.camera-table__name em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  font-size: 12px;
  color: var(--map-device-offline);
  font-weight: 400;
}

.camera-table__status {
  font-size: 13px;
  font-weight: 600;
}

.camera-table__status--normal {
  color: var(--color-success);
}

.camera-table__status--offline {
  color: var(--map-device-offline);
}

.camera-table__status--fault {
  color: var(--color-warning);
}

.camera-table__action {
  display: flex;
  justify-content: flex-end;
}

.camera-table__play {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.camera-table__play:hover {
  color: #6df;
  text-decoration: underline;
}

.camera-table__dash {
  color: #6a84a4;
}

.camera-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}
</style>
