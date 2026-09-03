<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import {
  currentLayout,
  type CellConfig,
  type VideoPage,
  videoMode,
  playbackTimeRange,
  type VideoWallFillCamera,
  pendingAutoFillCameras,
  pendingEventVideoRemovals,
  wallDisplayContext,
  setWallDisplayContext,
} from './videoWallStore';
import { videoWallBus } from './videoWallBus';
import VideoWallPlayer from './VideoWallPlayer.vue';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';

const pages = ref<VideoPage[]>(
  currentLayout.value
    ? JSON.parse(JSON.stringify(currentLayout.value.mode.pages))
    : [{ id: 'p1', name: '页面 1', rows: 3, cols: 3, cells: [] }],
);
const activePageIndex = ref(currentLayout.value ? currentLayout.value.activePageIndex : 0);

const currentPage = computed(() => pages.value[activePageIndex.value]);

const rows = computed({
  get: () => currentPage.value?.rows || 3,
  set: (val) => {
    if (currentPage.value) currentPage.value.rows = val;
    initGrid();
  },
});

const cols = computed({
  get: () => currentPage.value?.cols || 3,
  set: (val) => {
    if (currentPage.value) currentPage.value.cols = val;
    initGrid();
  },
});

const cells = computed(() => currentPage.value?.cells || []);

let isApplyingExternalLayout = false;

const syncToStore = () => {
  if (isApplyingExternalLayout) return;
  currentLayout.value = {
    mode: {
      id: 'current',
      name: '当前',
      pages: JSON.parse(JSON.stringify(pages.value)),
    },
    activePageIndex: activePageIndex.value,
  };
};

const initGrid = () => {
  if (isApplyingExternalLayout || !currentPage.value) return;
  const newCells: CellConfig[] = [];
  for (let r = 1; r <= rows.value; r++) {
    for (let c = 1; c <= cols.value; c++) {
      newCells.push({
        id: `r${r}-c${c}`,
        row: r,
        col: c,
        rowSpan: 1,
        colSpan: 1,
        hidden: false,
        selected: false,
      });
    }
  }
  currentPage.value.cells = newCells;
  syncToStore();
};

watch(
  [rows, cols],
  () => {
    if (currentPage.value && currentPage.value.cells.length === 0) {
      initGrid();
    }
  },
  { immediate: true },
);

watch(currentLayout, (newLayout) => {
  if (newLayout && newLayout.mode.id !== 'current') {
    isApplyingExternalLayout = true;
    pages.value = JSON.parse(JSON.stringify(newLayout.mode.pages));
    activePageIndex.value = newLayout.activePageIndex;

    // Default to initializing empty pages if they have no cells
    pages.value.forEach((p) => {
      if (p.cells.length === 0) {
        const newCells = [];
        for (let r = 1; r <= p.rows; r++) {
          for (let c = 1; c <= p.cols; c++) {
            newCells.push({
              id: `r${r}-c${c}`,
              row: r,
              col: c,
              rowSpan: 1,
              colSpan: 1,
              hidden: false,
              selected: false,
            });
          }
        }
        p.cells = newCells;
      }
    });

    nextTick(() => {
      isApplyingExternalLayout = false;
    });
  }
});

const addPage = () => {
  pages.value.push({
    id: 'p' + Date.now(),
    name: `页面 ${pages.value.length + 1}`,
    rows: 3,
    cols: 3,
    cells: [],
  });
  activePageIndex.value = pages.value.length - 1;
  initGrid();
  setWallDisplayContext({
    key: 'manual-layout',
    name: wallDisplayContext.value.name,
    source: '手动调整布局',
  });
};

const removePage = () => {
  if (pages.value.length <= 1) return;
  pages.value.splice(activePageIndex.value, 1);
  if (activePageIndex.value >= pages.value.length) {
    activePageIndex.value = pages.value.length - 1;
  }
  syncToStore();
  setWallDisplayContext({
    key: 'manual-layout',
    name: wallDisplayContext.value.name,
    source: '手动调整布局',
  });
};

// 自动填充视频墙逻辑（由左侧双击事件触发）
const autoFillGrid = (camerasToFill: VideoWallFillCamera[]) => {
  if (isApplyingExternalLayout) return;

  // 1. 获取全局已经展示的 videoId (去重)
  const existingVideoIds = new Set<string>();
  pages.value.forEach((p) => {
    p.cells.forEach((c) => {
      if (c.videoId) existingVideoIds.add(c.videoId);
    });
  });

  // 2. 过滤掉已经存在的摄像头
  const newCameras = camerasToFill.filter((cam) => !existingVideoIds.has(String(cam.id)));
  if (newCameras.length === 0) return;

  let currentCamIndex = 0;

  // 3. 开始填充
  while (currentCamIndex < newCameras.length) {
    const activePage = pages.value[activePageIndex.value];
    const emptyCells = activePage.cells.filter((c) => !c.hidden && !c.videoId);

    for (const cell of emptyCells) {
      if (currentCamIndex >= newCameras.length) break;
      const cam = newCameras[currentCamIndex];
      cell.videoId = String(cam.id);
      cell.videoName = cam.name;
      currentCamIndex++;
    }

    // 如果还没分完，说明当前页满了，自动加页（继承行列数）
    if (currentCamIndex < newCameras.length) {
      const newPageRows = activePage.rows || 3;
      const newPageCols = activePage.cols || 3;

      const newPage: VideoPage = {
        id: 'p' + Date.now(),
        name: `页面 ${pages.value.length + 1}`,
        rows: newPageRows,
        cols: newPageCols,
        cells: [],
      };

      for (let r = 1; r <= newPageRows; r++) {
        for (let c = 1; c <= newPageCols; c++) {
          newPage.cells.push({
            id: `r${r}-c${c}`,
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            hidden: false,
          });
        }
      }

      pages.value.push(newPage);
      activePageIndex.value = pages.value.length - 1;
    }
  }

  syncToStore();
};

watch(
  pendingAutoFillCameras,
  (cameras) => {
    if (cameras && cameras.length > 0) {
      autoFillGrid(cameras);
      // 消费后清空队列
      pendingAutoFillCameras.value = [];
    }
  },
  { deep: true, immediate: true },
);

watch(
  pendingEventVideoRemovals,
  (cameraIds) => {
    if (!cameraIds.length) return;
    const ids = new Set(cameraIds);
    pages.value.forEach((page) =>
      page.cells.forEach((cell) => {
        if (cell.videoId && ids.has(cell.videoId)) {
          cell.videoId = undefined;
          cell.videoName = undefined;
        }
      }),
    );
    pendingEventVideoRemovals.value = [];
    syncToStore();
  },
  { deep: true },
);

const prevPage = () => {
  if (activePageIndex.value > 0) {
    activePageIndex.value--;
    syncToStore();
  }
};

const nextPage = () => {
  if (activePageIndex.value < pages.value.length - 1) {
    activePageIndex.value++;
    syncToStore();
  }
};

const visibleCells = computed(() => cells.value.filter((c) => !c.hidden));
const currentPageVideoCount = computed(
  () => visibleCells.value.filter((cell) => cell.videoId).length,
);
const totalWallVideoCount = computed(() =>
  pages.value.reduce(
    (total, page) => total + page.cells.filter((cell) => !cell.hidden && cell.videoId).length,
    0,
  ),
);
const layoutLabel = computed(() => `${rows.value}×${cols.value}`);

// Selection logic
let isDraggingSelection = false;
let startCell: CellConfig | null = null;

const handleMouseDown = (cell: CellConfig) => {
  if (cell.hidden) return;
  isDraggingSelection = true;
  startCell = cell;
  // Reset previous selection
  cells.value.forEach((c) => (c.selected = false));
  cell.selected = true;
};

const handleMouseEnter = (cell: CellConfig) => {
  if (!isDraggingSelection || !startCell || cell.hidden) return;

  // Calculate bounding box between startCell and current cell
  const minRow = Math.min(startCell.row, cell.row);
  const maxRow = Math.max(startCell.row + startCell.rowSpan - 1, cell.row + cell.rowSpan - 1);
  const minCol = Math.min(startCell.col, cell.col);
  const maxCol = Math.max(startCell.col + startCell.colSpan - 1, cell.col + cell.colSpan - 1);

  cells.value.forEach((c) => {
    // Only select cells that are not hidden and fall within the bounding box
    if (!c.hidden) {
      c.selected =
        c.row >= minRow &&
        c.row + c.rowSpan - 1 <= maxRow &&
        c.col >= minCol &&
        c.col + c.colSpan - 1 <= maxCol;
    }
  });
};

const handleMouseUp = () => {
  isDraggingSelection = false;
  startCell = null;
};

const getSelectedCells = () => cells.value.filter((c) => c.selected && !c.hidden);

const canMerge = computed(() => getSelectedCells().length > 1);
const canUnmerge = computed(() => {
  const selected = getSelectedCells();
  return selected.length === 1 && (selected[0].rowSpan > 1 || selected[0].colSpan > 1);
});

const mergeCells = () => {
  const selected = getSelectedCells();
  if (selected.length < 2) return;

  const minRow = Math.min(...selected.map((c) => c.row));
  const minCol = Math.min(...selected.map((c) => c.col));
  const maxRow = Math.max(...selected.map((c) => c.row + c.rowSpan - 1));
  const maxCol = Math.max(...selected.map((c) => c.col + c.colSpan - 1));

  // Find the top-left cell in the selection to become the merged cell
  const rootCell = selected.find((c) => c.row === minRow && c.col === minCol);
  if (!rootCell) return;

  rootCell.rowSpan = maxRow - minRow + 1;
  rootCell.colSpan = maxCol - minCol + 1;
  rootCell.selected = false;

  // Hide all other cells in the bounding box (including previously hidden ones inside it)
  cells.value.forEach((c) => {
    if (
      c.row >= minRow &&
      c.row <= maxRow &&
      c.col >= minCol &&
      c.col <= maxCol &&
      c !== rootCell
    ) {
      c.hidden = true;
      c.selected = false;
    }
  });

  syncToStore();
  setWallDisplayContext({
    key: 'manual-layout',
    name: wallDisplayContext.value.name,
    source: '手动调整布局',
  });
};

const unmergeCells = () => {
  const selected = getSelectedCells();
  if (selected.length !== 1) return;

  const rootCell = selected[0];
  if (rootCell.rowSpan === 1 && rootCell.colSpan === 1) return;

  const rSpan = rootCell.rowSpan;
  const cSpan = rootCell.colSpan;

  // Restore hidden cells
  cells.value.forEach((c) => {
    if (
      c.row >= rootCell.row &&
      c.row < rootCell.row + rSpan &&
      c.col >= rootCell.col &&
      c.col < rootCell.col + cSpan &&
      c !== rootCell
    ) {
      c.hidden = false;
      // If the restored cell was part of another merged block before, we are simply resetting it to 1x1
      // For a robust system, we just reset all restored cells to 1x1
      c.rowSpan = 1;
      c.colSpan = 1;
    }
  });

  rootCell.rowSpan = 1;
  rootCell.colSpan = 1;
  rootCell.selected = false;

  syncToStore();
  setWallDisplayContext({
    key: 'manual-layout',
    name: wallDisplayContext.value.name,
    source: '手动调整布局',
  });
};

// Drag & Drop Handling
const handleDrop = (e: DragEvent, cell: CellConfig) => {
  const videoId = e.dataTransfer?.getData('video-id');
  const videoName = e.dataTransfer?.getData('video-name');

  if (videoId && videoName) {
    cell.videoId = videoId;
    cell.videoName = videoName;
    syncToStore();
    setWallDisplayContext({ key: 'mixed', name: '混合编组', source: '手动添加视频' });
  }
};

const updateGrid = () => {
  initGrid();
  setWallDisplayContext({
    key: 'manual-layout',
    name: wallDisplayContext.value.name,
    source: '手动调整布局',
  });
};

// ===================== 播放控制逻辑 =====================
const isPlaying = ref(true);
const playPercent = ref(0);
const playbackScope = ref<'all' | 'selected'>('all');

const isControlDisabled = computed(() => {
  if (playbackScope.value === 'selected') {
    const selected = getSelectedCells();
    return selected.length === 0 || !selected[0].videoId;
  }
  return false;
});

const getSelectedVideoId = () => {
  const selected = getSelectedCells();
  return selected.length > 0 ? selected[0].videoId : undefined;
};

const togglePlay = () => {
  if (isControlDisabled.value) return;
  isPlaying.value = !isPlaying.value;
  videoWallBus.$emit('playback-command', {
    action: isPlaying.value ? 'play' : 'pause',
    scope: playbackScope.value,
    targetId: getSelectedVideoId(),
  });
};

const onProgressChange = () => {
  if (isControlDisabled.value) return;
  videoWallBus.$emit('playback-command', {
    action: 'seek',
    scope: playbackScope.value,
    targetId: getSelectedVideoId(),
    percent: Number(playPercent.value),
  });
};

// 当时间范围改变时，重置进度条为0
watch(
  playbackTimeRange,
  () => {
    playPercent.value = 0;
    isPlaying.value = true;
  },
  { deep: true },
);
</script>

<template>
  <div class="video-grid-container" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
    <div class="grid-header">
      <div class="header-left">
        <h3>实时视频监控</h3>
        <!-- 页码控制移到顶部 -->
        <div class="header-page-control">
          <button class="page-btn mini" :disabled="activePageIndex === 0" @click="prevPage">
            ◀
          </button>
          <span class="page-info">{{ activePageIndex + 1 }} / {{ pages.length }}</span>
          <button
            class="page-btn mini"
            :disabled="activePageIndex === pages.length - 1"
            @click="nextPage"
          >
            ▶
          </button>
        </div>

        <!-- 新建/删除页移到顶部 -->
        <div class="header-page-actions">
          <button class="add-page-btn mini" title="新增一页" @click="addPage">➕ 新增</button>
          <button
            class="remove-page-btn mini"
            :disabled="pages.length <= 1"
            title="删除当前页"
            @click="removePage"
          >
            🗑️ 删除
          </button>
        </div>
      </div>

      <div class="grid-controls">
        <span v-if="videoMode === 'playback'" class="global-playback-warning"
          >⚠️ 历史回放模式，PTZ已锁定</span
        >
        <label
          >行: <input v-model="rows" type="number" min="1" max="4" @change="updateGrid"
        /></label>
        <label
          >列: <input v-model="cols" type="number" min="1" max="4" @change="updateGrid"
        /></label>
        <button :disabled="!canMerge" :class="{ disabled: !canMerge }" @click="mergeCells">
          合并
        </button>
        <button :disabled="!canUnmerge" :class="{ disabled: !canUnmerge }" @click="unmergeCells">
          取消合并
        </button>
      </div>
    </div>

    <div class="wall-status-bar" aria-live="polite">
      <div class="wall-status-bar__primary">
        <span class="wall-status-bar__dot"></span>
        <span>当前上墙</span>
        <strong>{{ wallDisplayContext.name }}</strong>
        <em>{{ wallDisplayContext.source }}</em>
      </div>
      <div class="wall-status-bar__metrics">
        <span>{{ totalWallVideoCount }} 路视频</span>
        <span>{{ layoutLabel }}</span>
        <span v-if="pages.length > 1"
          >第 {{ activePageIndex + 1 }}/{{ pages.length }} 页 · 本页
          {{ currentPageVideoCount }} 路</span
        >
      </div>
    </div>

    <div
      class="grid-body"
      :style="{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }"
    >
      <div
        v-for="cell in visibleCells"
        :key="cell.id"
        class="video-cell"
        :class="{ selected: cell.selected }"
        :style="{
          gridRow: `${cell.row} / span ${cell.rowSpan}`,
          gridColumn: `${cell.col} / span ${cell.colSpan}`,
        }"
        @mousedown="handleMouseDown(cell)"
        @mouseenter="handleMouseEnter(cell)"
        @dragover.prevent
        @drop="handleDrop($event, cell)"
      >
        <VideoWallPlayer
          v-if="cell.videoId"
          :video-id="cell.videoId"
          :video-name="cell.videoName || ''"
        />
        <div
          v-else
          class="video-placeholder"
          :style="{ backgroundImage: `url(${cameraThumbByIndex(cell.row * 100 + cell.col)})` }"
        >
          <span class="video-placeholder__label">通道 {{ cell.id }}</span>
        </div>
      </div>
    </div>

    <div class="grid-footer">
      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: videoMode === 'realtime' }"
          @click="videoMode = 'realtime'"
        >
          ⚡ 实时模式
        </button>
        <button
          class="mode-btn"
          :class="{ active: videoMode === 'playback' }"
          @click="videoMode = 'playback'"
        >
          ⏳ 历史回放
        </button>
      </div>

      <div v-if="videoMode === 'playback'" class="playback-controls">
        <input v-model="playbackTimeRange.start" type="datetime-local" class="time-input" />

        <!-- 在起止时间选择器之间嵌入进度条 -->
        <div class="playback-timeline-wrapper">
          <input
            v-model="playPercent"
            type="range"
            min="0"
            max="100"
            :disabled="isControlDisabled"
            class="timeline-slider"
            title="拖动跳转播放进度"
            @input="onProgressChange"
          />
          <span v-if="isControlDisabled" class="timeline-tip">⚠️ 请先选中目标分屏</span>
        </div>

        <input v-model="playbackTimeRange.end" type="datetime-local" class="time-input" />

        <!-- 控制按钮与作用范围选项 -->
        <div class="playback-btn-group">
          <button
            class="play-control-btn"
            :class="{ active: isPlaying }"
            :disabled="isControlDisabled"
            @click="togglePlay"
          >
            {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
          </button>

          <select v-model="playbackScope" class="playback-scope-select">
            <option value="all">📺 全部摄像头</option>
            <option value="selected">🎯 仅选中摄像头</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-grid-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 15px;
  background: rgb(0 16 36 / 90%);
  font-family: var(--font-body);
  pointer-events: auto;
  user-select: none;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.wall-status-bar {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid rgb(0 154 224 / 30%);
  background: linear-gradient(90deg, rgb(0 75 126 / 32%), rgb(0 26 51 / 42%));
  box-sizing: border-box;
}

.wall-status-bar__primary,
.wall-status-bar__metrics {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wall-status-bar__primary {
  min-width: 0;
  color: #83a9c2;
  font-size: 11px;
}

.wall-status-bar__primary strong {
  min-width: 0;
  overflow: hidden;
  color: #e8f8ff;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wall-status-bar__primary em {
  padding: 2px 6px;
  border: 1px solid rgb(255 174 61 / 40%);
  background: rgb(105 55 5 / 36%);
  color: var(--color-warning);
  font-size: 10px;
  font-style: normal;
  white-space: nowrap;
}

.wall-status-bar__dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px rgb(33 216 155 / 80%);
}

.wall-status-bar__metrics {
  color: #79b8d8;
  font-size: 10px;
  white-space: nowrap;
}

.wall-status-bar__metrics span {
  padding-left: 8px;
  border-left: 1px solid rgb(116 166 197 / 24%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #7cdbff;
  text-shadow: 0 0 8px rgb(124 219 255 / 40%);
}

.header-page-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgb(0 0 0 / 30%);
  padding: 2px 8px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 35%);
}

.header-page-control .page-info {
  font-size: 13px;
  color: var(--color-accent);
}

.header-page-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn.mini,
.add-page-btn.mini,
.remove-page-btn.mini {
  background: rgb(0 0 0 / 40%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: #cce8ff;
  padding: 2px 8px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.page-btn.mini:hover:not(:disabled),
.add-page-btn.mini:hover {
  background: rgb(0 180 255 / 20%);
  border-color: var(--color-accent);
  color: var(--color-text-strong);
}

.remove-page-btn.mini {
  color: var(--color-danger);
  border-color: rgb(255 107 107 / 30%);
}

.remove-page-btn.mini:hover:not(:disabled) {
  background: rgb(255 107 107 / 20%);
  border-color: var(--color-danger);
  color: var(--color-text-strong);
}

.page-btn.mini:disabled,
.remove-page-btn.mini:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.grid-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.grid-controls label {
  color: #ccc;
  font-size: 14px;
}

.grid-controls input {
  width: 40px;
  background: rgb(0 0 0 / 50%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: white;
  text-align: center;
  border-radius: 2px;
}

.grid-controls button {
  background: rgb(0 0 0 / 40%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: var(--color-text-strong);
  padding: 4px 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.grid-controls button:hover:not(.disabled) {
  background: rgb(0 130 210 / 35%);
}

.grid-controls button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.grid-body {
  flex: 1;
  display: grid;
  gap: 10px;
  min-height: 0;
  margin-bottom: 15px;
  position: relative; /* relative for absolute overlay */
}

.grid-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding-top: 10px;
  border-top: 1px solid rgb(0 130 210 / 35%);
}

.mode-switch {
  display: flex;
  gap: 8px;
  margin-left: 20px;
}

.mode-btn {
  background: rgb(0 0 0 / 40%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: #ccc;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn.active {
  background: rgb(0 180 255 / 20%);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: bold;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 15px;
  background: var(--panel-inner-bg);
  padding: 4px 12px;
  border-radius: 2px;
  border: 1px solid rgb(0 130 210 / 35%);
}

.playback-timeline-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 180px;
}

.timeline-slider {
  width: 100%;
  height: 6px;
  background: rgb(255 255 255 / 15%);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: background 0.3s;
}

.timeline-slider:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.timeline-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: var(--color-accent);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgb(0 180 255 / 80%);
  transition: transform 0.1s;
}

.timeline-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.timeline-tip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(0 0 0 / 85%);
  border: 1px solid rgb(255 77 79 / 50%);
  color: var(--color-danger);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
  animation: fade-in 0.2s;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.playback-btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid rgb(255 255 255 / 10%);
  padding-left: 12px;
}

.play-control-btn {
  background: rgb(0 180 255 / 15%);
  border: 1px solid rgb(0 180 255 / 40%);
  color: var(--color-accent);
  padding: 4px 10px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
  white-space: nowrap;
}

.play-control-btn:hover:not(:disabled) {
  background: rgb(0 180 255 / 30%);
  box-shadow: 0 0 8px rgb(0 180 255 / 30%);
}

.play-control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.playback-scope-select {
  background: rgb(0 16 36 / 90%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: #e8f4f8;
  padding: 4px 6px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

.time-input {
  background: rgb(0 0 0 / 50%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: white;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 12px;
  outline: none;
}

.global-playback-warning {
  color: #fc0;
  font-size: 13px;
  background: rgb(255 204 0 / 10%);
  padding: 4px 10px;
  border-radius: 2px;
  border: 1px solid rgb(255 204 0 / 40%);
  margin-right: auto; /* Push left if possible */
  margin-left: 10px;
}

.video-cell {
  background: black;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  cursor: crosshair;
}

.video-cell.selected {
  border-color: var(--color-accent);
  background: rgb(0 180 255 / 15%);
  box-shadow: inset 0 0 10px rgb(0 180 255 / 30%);
}

/* 未绑定码流的通道：mock 监控抓拍图打底（cameraThumbByIndex），左下角通道角标 */
.video-placeholder {
  display: flex;
  align-items: flex-end;
  background-color: var(--color-panel-soft);
  background-size: cover;
  background-position: center;
}

.video-placeholder__label {
  margin: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--color-text-muted);
  font-size: 12px;
}

.video-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a192f, #112240);
}

.video-name {
  color: var(--color-success);
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgb(100 255 218 / 50%);
}
</style>
