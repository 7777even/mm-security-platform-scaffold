<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  countPlayableCameras,
  patrolCameraPageSize,
  patrolCameras,
  type PatrolCameraItem,
} from '../../../lib/data/securityCameraMock';

const props = defineProps<{
  open: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const currentPage = ref(1);

const dialogTitle = computed(() => props.title ?? '防控摄像头');

const totalPages = computed(() =>
  Math.max(1, Math.ceil(patrolCameras.length / patrolCameraPageSize)),
);

const pagedCameras = computed(() => {
  const start = (currentPage.value - 1) * patrolCameraPageSize;
  return patrolCameras.slice(start, start + patrolCameraPageSize);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i);
  return pages;
});

const videoWallCount = computed(() => countPlayableCameras(patrolCameras));

watch(
  () => props.open,
  (visible) => {
    if (visible) currentPage.value = 1;
  },
);

function closeDialog() {
  emit('close');
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function statusClass(status: PatrolCameraItem['status']) {
  if (status === '正常') return 'camera-list__status--normal';
  if (status === '离线') return 'camera-list__status--offline';
  return 'camera-list__status--fault';
}

function handlePlay(item: PatrolCameraItem) {
  if (item.status !== '正常') return;
  // 占位：单路播放
}

function handleVideoWall() {
  // 占位：视频墙播放
}
</script>

<template>
  <Teleport to="body">
    <Transition name="camera-list-fade">
      <div v-if="open" class="camera-list" @click.self="closeDialog">
        <section
          class="camera-list__dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="dialogTitle"
          @click.stop
        >
          <header class="camera-list__header">
            <div class="camera-list__header-main">
              <h3 class="camera-list__title">{{ dialogTitle }}</h3>
              <button type="button" class="camera-list__wall-btn" @click="handleVideoWall">
                视频墙播放
                <span v-if="videoWallCount > 0" class="camera-list__wall-badge">{{
                  videoWallCount
                }}</span>
              </button>
            </div>
            <button type="button" class="camera-list__close" @click="closeDialog">×</button>
          </header>

          <div class="camera-list__body">
            <div class="camera-list__table-wrap">
              <table class="camera-list__table">
                <thead>
                  <tr>
                    <th>摄像头名称</th>
                    <th>摄像头状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pagedCameras" :key="`${item.id}-${item.status}`">
                    <td>{{ item.name }}</td>
                    <td>
                      <span class="camera-list__status" :class="statusClass(item.status)">
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <button
                        v-if="item.status === '正常'"
                        type="button"
                        class="camera-list__action"
                        @click="handlePlay(item)"
                      >
                        播放
                      </button>
                      <span v-else class="camera-list__action-placeholder">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="camera-list__pagination">
              <button
                type="button"
                class="camera-list__page-btn"
                :disabled="currentPage <= 1"
                @click="goToPage(currentPage - 1)"
              >
                ‹
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                type="button"
                class="camera-list__page-btn"
                :class="{ 'camera-list__page-btn--active': currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="camera-list__page-btn"
                :disabled="currentPage >= totalPages"
                @click="goToPage(currentPage + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.camera-list {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.camera-list__dialog {
  display: flex;
  flex-direction: column;
  width: min(720px, 100%);
  max-height: min(640px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.camera-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
  background: rgb(0 18 40 / 60%);
}

.camera-list__header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.camera-list__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.camera-list__wall-btn {
  position: relative;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border-glow);
  border-radius: 2px;
  background: rgb(0 90 160 / 35%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
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

.camera-list__close {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.camera-list__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 14px;
  gap: 12px;
}

.camera-list__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 130 210 / 22%);
  border-radius: 2px;
}

.camera-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.camera-list__table thead {
  position: sticky;
  top: 0;
  z-index: var(--z-chrome);
  background: rgb(0 28 58 / 95%);
}

.camera-list__table th,
.camera-list__table td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid rgb(0 100 180 / 18%);
}

.camera-list__table th {
  color: var(--map-device-offline);
  font-weight: 500;
}

.camera-list__table td {
  color: #e8f2fc;
}

.camera-list__table tbody tr:hover {
  background: rgb(0 55 100 / 22%);
}

.camera-list__status--normal {
  color: var(--color-success);
}

.camera-list__status--offline {
  color: var(--map-device-offline);
}

.camera-list__status--fault {
  color: var(--color-warning);
}

.camera-list__action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.camera-list__action:hover {
  color: #6df;
  text-decoration: underline;
}

.camera-list__action-placeholder {
  color: #6a84a4;
}

.camera-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.camera-list__page-btn {
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

.camera-list__page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.camera-list__page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.camera-list-fade-enter-active,
.camera-list-fade-leave-active {
  transition: opacity 0.22s ease;
}

.camera-list-fade-enter-from,
.camera-list-fade-leave-to {
  opacity: 0;
}
</style>
