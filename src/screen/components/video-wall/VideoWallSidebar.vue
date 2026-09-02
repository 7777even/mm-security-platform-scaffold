<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import VideoWallAlarmPanel from './VideoWallAlarmPanel.vue';
import {
  savedModes,
  savedPlans,
  activePlanId,
  applyMode,
  startPlan,
  stopPlan,
  currentLayout,
  videoTree,
  targetTree,
  cameraTargetMap,
  wallDisplayContext,
  replaceWallWithCameras,
  activeEventVideoContext,
  showEventGroupOnWall,
  showAllEventVideosOnWall,
  clearEventVideoWall,
  removeCameraFromEventGroup,
  addCameraToEventGroup,
  restoreEventVideoGroups,
  createTemporaryEventGroup,
  removeTemporaryEventGroup,
  type EventVideoCamera,
  type VideoChild,
} from './videoWallStore';
import { openLinkageDialog } from '../../lib/composables/useVideoLinkageConfig';

const goLinkageConfig = () => {
  openLinkageDialog();
};

const activeTab = ref(activeEventVideoContext.value ? 'event' : 'video'); // 'event', 'video', 'target', 'mode', 'plan'
const expandedEventGroups = ref<Record<string, boolean>>({});
const eventRecordsOpen = ref(true);
const eventAddOpen = ref(false);
const eventAddSearch = ref('');
const eventAddGroupId = ref('');
const eventGroupCreateOpen = ref(false);
const eventGroupName = ref('');
const eventGroupSearch = ref('');
const eventGroupSelectedIds = ref<string[]>([]);
const eventGroupCreateError = ref('');
const eventFeedback = ref('');
let eventFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  activeEventVideoContext,
  (context) => {
    if (!context) return;
    activeTab.value = 'event';
    expandedEventGroups.value = Object.fromEntries(context.groups.map((group) => [group.id, true]));
  },
  { immediate: true },
);

const isSavingMode = ref(false);
const modeNameInput = ref('');

const openSaveModeDialog = () => {
  if (!currentLayout.value) return;
  modeNameInput.value = `自定义模式 ${savedModes.value.length + 1}`;
  isSavingMode.value = true;
};

const confirmSaveMode = () => {
  if (!currentLayout.value || !modeNameInput.value.trim()) return;
  const newMode = {
    id: 'm' + Date.now(),
    name: modeNameInput.value.trim(),
    pages: JSON.parse(JSON.stringify(currentLayout.value.mode.pages)),
  };
  savedModes.value.push(newMode);
  isSavingMode.value = false;
};

const cancelSaveMode = () => {
  isSavingMode.value = false;
};

const isAddingPlan = ref(false);
const newPlan = ref({
  name: '',
  intervalSeconds: 5,
  steps: [] as { modeId: string; pageIndex: number }[],
});
const tempModeId = ref('');
const tempPageIndex = ref(0);

const availablePagesForTempMode = computed(() => {
  const mode = savedModes.value.find((m) => m.id === tempModeId.value);
  return mode ? mode.pages : [];
});

const handleAddStep = () => {
  if (tempModeId.value) {
    newPlan.value.steps.push({
      modeId: tempModeId.value,
      pageIndex: tempPageIndex.value,
    });
  }
};

const handleRemoveStep = (index: number) => {
  newPlan.value.steps.splice(index, 1);
};

const handleSavePlan = () => {
  if (!newPlan.value.name || newPlan.value.steps.length === 0) return;
  savedPlans.value.push({
    id: 'plan_' + Date.now(),
    name: newPlan.value.name,
    intervalSeconds: newPlan.value.intervalSeconds,
    steps: [...newPlan.value.steps],
  });
  isAddingPlan.value = false;
  newPlan.value = { name: '', intervalSeconds: 5, steps: [] };
  tempModeId.value = '';
  tempPageIndex.value = 0;
};

// Removed local videoTree and targetTree, imported from store

const searchQuery = ref('');

type SidebarTreeGroup<TChild extends { id: string; name: string }> = {
  id: string;
  name: string;
  children: TChild[];
};

const filterTree = <TChild extends { id: string; name: string }>(
  tree: SidebarTreeGroup<TChild>[],
): SidebarTreeGroup<TChild>[] => {
  if (!searchQuery.value) return tree;
  const query = searchQuery.value.toLowerCase();
  return tree
    .map((group) => {
      const filteredChildren = group.children.filter((child) =>
        child.name.toLowerCase().includes(query),
      );
      if (filteredChildren.length > 0 || group.name.toLowerCase().includes(query)) {
        return {
          ...group,
          children: filteredChildren.length > 0 ? filteredChildren : group.children,
        };
      }
      return null;
    })
    .filter((g): g is SidebarTreeGroup<TChild> => g !== null);
};

const filteredVideoTree = computed(() => filterTree(videoTree.value));
const activeTargetCategoryId = ref('all');
const expandedTargetGroups = ref<Record<string, boolean>>(
  Object.fromEntries(targetTree.value.map((group, index) => [group.id, index === 0])),
);
const targetCategoryIcons = ['◇', '▧', '⇥', '▤', '═', '◎'];
const getTargetCategoryIcon = (groupId: string) =>
  targetCategoryIcons[targetTree.value.findIndex((group) => group.id === groupId)] || '◎';
const filteredTargetTree = computed(() => {
  const groups = filterTree(targetTree.value);
  if (activeTargetCategoryId.value === 'all') return groups;
  return groups.filter((group) => group.id === activeTargetCategoryId.value);
});

const filteredEventGroups = computed(() => {
  const context = activeEventVideoContext.value;
  if (!context) return [];
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return context.groups;
  return context.groups
    .map((group) => {
      if (group.name.toLowerCase().includes(query)) return group;
      return {
        ...group,
        cameras: group.cameras.filter((item) => item.name.toLowerCase().includes(query)),
      };
    })
    .filter((group) => group.cameras.length > 0);
});

const allVideoOptions = computed<EventVideoCamera[]>(() => {
  const seen = new Set<string>();
  const eventCameras =
    activeEventVideoContext.value?.groups.flatMap((group) => group.cameras) ?? [];
  return [...eventCameras, ...videoTree.value.flatMap((group) => group.children)].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
});

const availableVideoOptions = computed(() => {
  const query = eventAddSearch.value.trim().toLowerCase();
  const target = activeEventVideoContext.value?.groups.find(
    (group) => group.id === eventAddGroupId.value,
  );
  const existingIds = new Set(target?.cameras.map((item) => item.id) ?? []);
  return allVideoOptions.value
    .filter(
      (item) => !existingIds.has(item.id) && (!query || item.name.toLowerCase().includes(query)),
    )
    .slice(0, 40);
});

const temporaryGroupVideoOptions = computed(() => {
  const query = eventGroupSearch.value.trim().toLowerCase();
  return allVideoOptions.value
    .filter((item) => !query || item.name.toLowerCase().includes(query))
    .slice(0, 60);
});

function showEventFeedback(message: string) {
  eventFeedback.value = message;
  if (eventFeedbackTimer) clearTimeout(eventFeedbackTimer);
  eventFeedbackTimer = setTimeout(() => {
    eventFeedback.value = '';
  }, 4200);
}

function handleShowAllEventVideos() {
  showAllEventVideosOnWall();
  showEventFeedback('已将当前事件全部视频上墙');
}

function handleClearEventWall() {
  clearEventVideoWall();
  showEventFeedback('视频墙已清空，请选择全部或单个分组上墙');
}

function handleRestoreEventGroups() {
  const result = restoreEventVideoGroups();
  const context = activeEventVideoContext.value;
  if (context)
    expandedEventGroups.value = Object.fromEntries(context.groups.map((group) => [group.id, true]));
  showEventFeedback(
    result.changed
      ? `已恢复 ${result.groupCount} 个初始分组、${result.cameraCount} 路视频；当前视频墙未改变`
      : '当前已经是系统初始分组，无需恢复',
  );
}

function openTemporaryGroupCreate() {
  eventGroupName.value = '';
  eventGroupSearch.value = '';
  eventGroupSelectedIds.value = [];
  eventGroupCreateError.value = '';
  eventGroupCreateOpen.value = true;
}

function confirmTemporaryGroupCreate() {
  const selectedIds = new Set(eventGroupSelectedIds.value);
  const result = createTemporaryEventGroup(
    eventGroupName.value,
    allVideoOptions.value.filter((item) => selectedIds.has(item.id)),
  );
  if (!result.ok || !result.group) {
    eventGroupCreateError.value = result.message || '临时分组创建失败';
    return;
  }
  expandedEventGroups.value[result.group.id] = true;
  eventGroupCreateOpen.value = false;
  showEventFeedback(`临时分组“${result.group.name}”已创建并上墙`);
}

function deleteTemporaryGroup(groupId: string, groupName: string) {
  if (!removeTemporaryEventGroup(groupId)) return;
  delete expandedEventGroups.value[groupId];
  showEventFeedback(`临时分组“${groupName}”已删除；当前视频墙未改变`);
}

function toggleEventGroup(groupId: string) {
  expandedEventGroups.value[groupId] = !expandedEventGroups.value[groupId];
}

function openEventAdd(groupId: string) {
  eventAddGroupId.value = groupId;
  eventAddSearch.value = '';
  eventAddOpen.value = true;
}

function addEventCamera(cameraItem: EventVideoCamera) {
  if (!addCameraToEventGroup(eventAddGroupId.value, cameraItem)) return;
  eventAddOpen.value = false;
  showEventFeedback(`${cameraItem.name} 已临时加入分组并追加上墙`);
}

// 模拟小地图 Marker 数据
const mapMarkers = ref([
  { id: 1, top: '30%', left: '40%', type: 'camera' },
  { id: 2, top: '60%', left: '70%', type: 'alarm' },
  { id: 3, top: '80%', left: '20%', type: 'camera' },
]);

interface EagleEyeViewer {
  cesiumWidget: { creditContainer?: HTMLElement | null };
  camera: { flyTo(options: object): void };
  isDestroyed(): boolean;
  destroy(): void;
}

interface EagleEyeCesium {
  Viewer: new (container: Element | string, options?: object) => EagleEyeViewer;
  Cartesian3: { fromDegrees(longitude: number, latitude: number, height: number): unknown };
  Math: { toRadians(degrees: number): number };
}

const eagleEyeMapRef = ref<HTMLElement | null>(null);
const cesiumAvailable = ref(false);
let viewer: EagleEyeViewer | null = null;

onMounted(() => {
  try {
    const winCesium = window as unknown as { Cesium?: EagleEyeCesium };
    const parentCesium = window.parent as unknown as { Cesium?: EagleEyeCesium };
    const Cesium = winCesium.Cesium ?? parentCesium.Cesium;
    if (Cesium && eagleEyeMapRef.value) {
      viewer = new Cesium.Viewer(eagleEyeMapRef.value, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
      });

      const creditContainer = viewer.cesiumWidget.creditContainer;
      if (creditContainer) creditContainer.style.display = 'none';

      // 飞越到工厂中心
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(110.885, 21.673, 1000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
        duration: 0,
      });
      cesiumAvailable.value = true;
    }
  } catch {
    cesiumAvailable.value = false;
    if (viewer) {
      try {
        viewer.destroy();
      } catch {
        /* ignore */
      }
      viewer = null;
    }
  }
});

onUnmounted(() => {
  if (eventFeedbackTimer) clearTimeout(eventFeedbackTimer);
  try {
    if (viewer && !viewer.isDestroyed()) {
      viewer.destroy();
    }
  } catch {
    /* ignore */
  }
  viewer = null;
});

// 处理拖拽开始
const handleDragStart = (e: DragEvent, node: { id: string; name: string }) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('video-id', node.id);
    e.dataTransfer.setData('video-name', node.name);
    e.dataTransfer.effectAllowed = 'copy';
  }
};

// 目标树点击展开和绑定逻辑
const expandedTargets = ref<Record<string, boolean>>({});

const toggleTarget = (targetId: string) => {
  expandedTargets.value[targetId] = !expandedTargets.value[targetId];
};

const getBoundCameras = (targetId: string) => {
  const boundCameras: VideoChild[] = [];
  const vTree = videoTree.value;

  for (const group of vTree) {
    for (const cam of group.children) {
      if (cameraTargetMap.value[cam.id] && cameraTargetMap.value[cam.id].includes(targetId)) {
        boundCameras.push(cam);
      }
    }
  }
  return boundCameras;
};

const handleTargetDblClick = (targetId: string) => {
  const cameras = getBoundCameras(targetId);
  if (cameras.length > 0) {
    const target = targetTree.value
      .flatMap((group) => group.children)
      .find((item) => item.id === targetId);
    replaceWallWithCameras(cameras, target?.name || '监测目标视频', {
      key: `target:${targetId}`,
      name: target?.name || '监测目标视频',
      source: '监测目标',
    });
  }
};

const getTargetGroupCameras = (group: { children: Array<{ id: string }> }) => {
  const seen = new Set<string>();
  return group.children
    .flatMap((target) => getBoundCameras(target.id))
    .filter((camera) => {
      if (seen.has(camera.id)) return false;
      seen.add(camera.id);
      return true;
    });
};

const toggleTargetGroup = (groupId: string) => {
  expandedTargetGroups.value[groupId] = !expandedTargetGroups.value[groupId];
};

const selectTargetCategory = (groupId: string) => {
  activeTargetCategoryId.value = groupId;
  if (groupId !== 'all') expandedTargetGroups.value[groupId] = true;
};

const handleTargetGroupDblClick = (group: {
  id: string;
  name: string;
  children: Array<{ id: string }>;
}) => {
  const cameras = getTargetGroupCameras(group);
  if (!cameras.length) return;
  replaceWallWithCameras(cameras, group.name, {
    key: `target-group:${group.id}`,
    name: group.name,
    source: '业务分组',
  });
};

// 右键菜单与弹窗逻辑
const bindMenuVisible = ref(false);
const bindMenuX = ref(0);
const bindMenuY = ref(0);
const selectedVideoToBind = ref<VideoChild | null>(null);

const openBindMenu = (e: MouseEvent, video: VideoChild) => {
  bindMenuVisible.value = true;
  bindMenuX.value = e.clientX;
  bindMenuY.value = e.clientY;
  selectedVideoToBind.value = video;
};

const closeBindMenu = () => {
  bindMenuVisible.value = false;
};

// 点击外部关闭右键菜单
onMounted(() => {
  window.addEventListener('click', closeBindMenu);
});
onUnmounted(() => {
  window.removeEventListener('click', closeBindMenu);
});

const bindDialogVisible = ref(false);
const tempBoundTargets = ref<string[]>([]);

const openBindDialog = () => {
  bindDialogVisible.value = true;
  bindMenuVisible.value = false;
  // Initialize checked states
  if (selectedVideoToBind.value) {
    tempBoundTargets.value = [...(cameraTargetMap.value[selectedVideoToBind.value.id] || [])];
  }
};

const closeBindDialog = () => {
  bindDialogVisible.value = false;
  selectedVideoToBind.value = null;
};

const saveBind = () => {
  if (selectedVideoToBind.value) {
    cameraTargetMap.value[selectedVideoToBind.value.id] = [...tempBoundTargets.value];
  }
  closeBindDialog();
};
</script>

<template>
  <div class="left-sidebar">
    <div class="top-section">
      <div class="tabs">
        <div
          v-if="activeEventVideoContext"
          class="tab tab--event"
          :class="{ active: activeTab === 'event' }"
          @click="activeTab = 'event'"
        >
          事件分组
        </div>
        <div class="tab" :class="{ active: activeTab === 'video' }" @click="activeTab = 'video'">
          视频目录树
        </div>
        <div class="tab" :class="{ active: activeTab === 'target' }" @click="activeTab = 'target'">
          监测目标树
        </div>
        <div class="tab" :class="{ active: activeTab === 'mode' }" @click="activeTab = 'mode'">
          常用模式
        </div>
        <div class="tab" :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">
          预案列表 <span v-if="activePlanId" class="active-indicator">▶️</span>
        </div>
      </div>
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="🔍 搜索..." />
      </div>
      <div class="tab-content">
        <div v-if="activeTab === 'event' && activeEventVideoContext" class="event-video-container">
          <section class="event-video-summary">
            <span class="event-video-summary__eyebrow">当前事件视频归集</span>
            <strong>{{ activeEventVideoContext.eventTitle }}</strong>
            <p>
              {{ activeEventVideoContext.groups.length }} 个分组 ·
              {{
                activeEventVideoContext.groups.reduce(
                  (total, group) => total + group.cameras.length,
                  0,
                )
              }}
              路视频
            </p>
            <div class="event-video-summary__actions">
              <button type="button" @click="handleShowAllEventVideos">全部上墙</button>
              <button type="button" class="is-ghost" @click="handleClearEventWall">清空画面</button>
              <button type="button" @click="openTemporaryGroupCreate">＋ 临时分组</button>
              <button
                type="button"
                class="is-ghost"
                title="撤销临时分组和视频调整，不改变当前上墙画面"
                @click="handleRestoreEventGroups"
              >
                恢复初始分组
              </button>
            </div>
            <div v-if="eventFeedback" class="event-video-feedback" role="status">
              ✓ {{ eventFeedback }}
            </div>
          </section>

          <div v-if="filteredEventGroups.length" class="event-video-groups">
            <article
              v-for="group in filteredEventGroups"
              :key="group.id"
              class="event-video-group"
              :class="{ 'is-displaying': wallDisplayContext.key === `event-group:${group.id}` }"
            >
              <header class="event-video-group__header">
                <button
                  type="button"
                  class="event-video-group__toggle"
                  @click="toggleEventGroup(group.id)"
                >
                  <span>{{ expandedEventGroups[group.id] ? '⌄' : '›' }}</span>
                  <strong>{{ group.name }}</strong>
                  <i v-if="group.temporary">临时</i>
                  <small v-if="wallDisplayContext.key === `event-group:${group.id}`">展示中</small>
                  <em>{{ group.cameras.length }}</em>
                </button>
                <div class="event-video-group__actions">
                  <button
                    type="button"
                    title="用本分组替换当前视频墙"
                    @click="showEventGroupOnWall(group.id)"
                  >
                    上墙
                  </button>
                  <button
                    type="button"
                    title="将本分组追加到当前视频墙"
                    @click="showEventGroupOnWall(group.id, true)"
                  >
                    追加
                  </button>
                  <button
                    v-if="group.temporary"
                    type="button"
                    class="is-danger"
                    :aria-label="`删除临时分组${group.name}`"
                    @click="deleteTemporaryGroup(group.id, group.name)"
                  >
                    删除
                  </button>
                </div>
              </header>
              <div v-if="expandedEventGroups[group.id]" class="event-video-group__body">
                <div
                  v-for="cameraItem in group.cameras"
                  :key="cameraItem.id"
                  class="event-video-camera"
                  draggable="true"
                  @dragstart="handleDragStart($event, cameraItem)"
                >
                  <span>▣ {{ cameraItem.name }}</span>
                  <button
                    type="button"
                    :aria-label="`将${cameraItem.name}移出${group.name}`"
                    @click="removeCameraFromEventGroup(group.id, cameraItem.id)"
                  >
                    移出
                  </button>
                </div>
                <div v-if="group.cameras.length === 0" class="event-video-group__empty">
                  该分组暂无视频
                </div>
                <button
                  type="button"
                  class="event-video-group__add"
                  @click="openEventAdd(group.id)"
                >
                  ＋ 临时添加视频
                </button>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">无匹配的事件视频分组</div>

          <section class="event-video-records">
            <button
              type="button"
              class="event-video-records__toggle"
              @click="eventRecordsOpen = !eventRecordsOpen"
            >
              <span>调整记录</span><em>{{ activeEventVideoContext.records.length }}</em
              ><b>{{ eventRecordsOpen ? '⌃' : '⌄' }}</b>
            </button>
            <div v-if="eventRecordsOpen" class="event-video-records__list">
              <div v-for="record in activeEventVideoContext.records" :key="record.id">
                <time>{{ record.createdAt }}</time>
                <p>
                  <strong>{{ record.action }}</strong
                  >{{ record.detail }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'video'" class="tree-container">
          <div v-for="group in filteredVideoTree" :key="group.id" class="tree-group">
            <div class="group-name">{{ group.name }}</div>
            <div
              v-for="child in group.children"
              :key="child.id"
              class="tree-node"
              draggable="true"
              @dragstart="handleDragStart($event, child)"
              @contextmenu.prevent="openBindMenu($event, child)"
            >
              📹 {{ child.name }}
            </div>
          </div>
          <div v-if="filteredVideoTree.length === 0" class="empty-state">无搜索结果</div>
        </div>

        <div v-if="activeTab === 'target'" class="target-tree-container">
          <div class="target-tree-toolbar">
            <div><strong>监测目标分组</strong><span>双击分组或目标上墙</span></div>
            <button type="button" @click="goLinkageConfig">⚙ 管理绑定</button>
          </div>

          <div class="target-category-shortcuts">
            <button
              type="button"
              :class="{ active: activeTargetCategoryId === 'all' }"
              @click="selectTargetCategory('all')"
            >
              <b>▦</b><span>全部目标</span
              ><em>{{ targetTree.reduce((total, group) => total + group.children.length, 0) }}</em>
            </button>
            <button
              v-for="(group, index) in targetTree"
              :key="group.id"
              type="button"
              :class="{
                active: activeTargetCategoryId === group.id,
                displaying: wallDisplayContext.key === `target-group:${group.id}`,
              }"
              @click="selectTargetCategory(group.id)"
              @dblclick="handleTargetGroupDblClick(group)"
            >
              <b>{{ targetCategoryIcons[index] }}</b
              ><span>{{ group.name }}</span
              ><em>{{ group.children.length }}</em>
            </button>
          </div>

          <div class="target-business-groups">
            <section
              v-for="group in filteredTargetTree"
              :key="group.id"
              class="target-business-group"
              :class="{ 'is-displaying': wallDisplayContext.key === `target-group:${group.id}` }"
            >
              <header
                @click="toggleTargetGroup(group.id)"
                @dblclick.stop="handleTargetGroupDblClick(group)"
              >
                <span>{{ expandedTargetGroups[group.id] ? '⌄' : '›' }}</span>
                <b>{{ getTargetCategoryIcon(group.id) }}</b>
                <strong>{{ group.name }}</strong>
                <em>{{ group.children.length }} 个目标</em>
                <i>{{ getTargetGroupCameras(group).length }} 路</i>
                <small v-if="wallDisplayContext.key === `target-group:${group.id}`">展示中</small>
              </header>
              <div v-if="expandedTargetGroups[group.id]" class="target-business-group__body">
                <div
                  v-for="child in group.children"
                  :key="child.id"
                  class="target-object"
                  :class="{ 'is-displaying': wallDisplayContext.key === `target:${child.id}` }"
                >
                  <button
                    type="button"
                    @click="toggleTarget(child.id)"
                    @dblclick.stop="handleTargetDblClick(child.id)"
                  >
                    <span>{{ expandedTargets[child.id] ? '⌄' : '›' }}</span>
                    <b>◎</b>
                    <strong>{{ child.name }}</strong>
                    <em>{{ getBoundCameras(child.id).length }}</em>
                    <small v-if="wallDisplayContext.key === `target:${child.id}`">展示中</small>
                  </button>
                  <div v-if="expandedTargets[child.id]" class="target-cameras">
                    <div
                      v-for="cam in getBoundCameras(child.id)"
                      :key="cam.id"
                      class="target-camera"
                      draggable="true"
                      @dragstart="handleDragStart($event, cam)"
                      @contextmenu.prevent="openBindMenu($event, cam)"
                    >
                      <span>▣</span>{{ cam.name }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div v-if="filteredTargetTree.length === 0" class="empty-state">无匹配的监测目标</div>
        </div>

        <div v-if="activeTab === 'mode'" class="mode-container">
          <div class="mode-list">
            <div
              v-for="mode in savedModes.filter((m) =>
                m.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )"
              :key="mode.id"
              class="mode-item"
              @click="applyMode(mode)"
            >
              <span class="icon">🖼️</span>
              <span class="name">{{ mode.name }}</span>
            </div>
          </div>
          <button class="save-btn" @click="openSaveModeDialog">➕ 将当前网格保存为新模式</button>
        </div>

        <div v-if="activeTab === 'plan'" class="plan-container">
          <div class="plan-list">
            <div
              v-for="plan in savedPlans.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )"
              :key="plan.id"
              class="plan-item"
            >
              <div class="plan-info">
                <span class="name">📅 {{ plan.name }}</span>
                <span class="desc">轮询间隔: {{ plan.intervalSeconds }} 秒</span>
              </div>
              <div class="plan-steps-preview">
                <div v-for="(step, idx) in plan.steps" :key="idx" class="step-item">
                  <span
                    >{{ idx + 1 }}. {{ savedModes.find((m) => m.id === step.modeId)?.name }}</span
                  >
                  <span class="step-page">第{{ step.pageIndex + 1 }}页</span>
                </div>
              </div>
              <div class="plan-actions">
                <button
                  v-if="activePlanId !== plan.id"
                  class="action-btn start"
                  @click="startPlan(plan.id)"
                >
                  ▶ 启动
                </button>
                <button v-else class="action-btn stop" @click="stopPlan">■ 停止</button>
                <button class="action-btn edit">⚙️</button>
              </div>
            </div>
          </div>

          <button v-if="!isAddingPlan" class="add-plan-btn" @click="isAddingPlan = true">
            ➕ 新建预案
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="eagle-eye-header">鹰眼小地图</div>
      <div ref="eagleEyeMapRef" class="eagle-eye-map">
        <div v-if="!cesiumAvailable" class="eagle-eye-placeholder">
          <div class="eagle-eye-placeholder__grid" />
          <span class="map-text">鹰眼地图暂不可用</span>
          <span class="map-text-sub">Cesium 未加载 · 工业监控占位</span>
          <div
            v-for="marker in mapMarkers"
            :key="marker.id"
            class="map-marker"
            :class="marker.type"
            :style="{ top: marker.top, left: marker.left }"
          ></div>
        </div>
      </div>
      <!-- 告警浮层 -->
      <div class="alarm-overlay">
        <VideoWallAlarmPanel />
      </div>
    </div>

    <div
      v-if="eventAddOpen && activeEventVideoContext"
      class="modal-overlay"
      @click.self="eventAddOpen = false"
    >
      <section
        class="modal-content event-add-modal"
        role="dialog"
        aria-modal="true"
        aria-label="补充事件视频"
      >
        <header>
          <h3>补充事件视频</h3>
          <button type="button" aria-label="关闭补充视频" @click="eventAddOpen = false">×</button>
        </header>
        <label class="event-add-modal__group">
          <span>加入分组</span>
          <select v-model="eventAddGroupId">
            <option
              v-for="group in activeEventVideoContext.groups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </option>
          </select>
        </label>
        <input
          v-model="eventAddSearch"
          class="event-add-modal__search"
          type="search"
          placeholder="搜索摄像机名称"
        />
        <div class="event-add-modal__list">
          <button
            v-for="cameraItem in availableVideoOptions"
            :key="cameraItem.id"
            type="button"
            @click="addEventCamera(cameraItem)"
          >
            <span>▣ {{ cameraItem.name }}</span
            ><em>加入并上墙</em>
          </button>
          <p v-if="availableVideoOptions.length === 0">没有可添加的视频</p>
        </div>
      </section>
    </div>

    <div
      v-if="eventGroupCreateOpen && activeEventVideoContext"
      class="modal-overlay"
      @click.self="eventGroupCreateOpen = false"
    >
      <section
        class="modal-content event-group-create-modal"
        role="dialog"
        aria-modal="true"
        aria-label="新建临时视频分组"
      >
        <header>
          <div>
            <h3>新建临时视频分组</h3>
            <p>选择的视频仅加入本次事件，并在创建后立即上墙。</p>
          </div>
          <button type="button" aria-label="关闭新建临时分组" @click="eventGroupCreateOpen = false">
            ×
          </button>
        </header>
        <label class="event-group-create-modal__name">
          <span>分组名称</span>
          <input
            v-model="eventGroupName"
            maxlength="20"
            placeholder="例如：现场重点跟踪"
            @input="eventGroupCreateError = ''"
          />
        </label>
        <div class="event-group-create-modal__toolbar">
          <input v-model="eventGroupSearch" type="search" placeholder="搜索摄像机名称" />
          <span>已选择 {{ eventGroupSelectedIds.length }} 路</span>
        </div>
        <div class="event-group-create-modal__list">
          <label v-for="cameraItem in temporaryGroupVideoOptions" :key="cameraItem.id">
            <input
              v-model="eventGroupSelectedIds"
              type="checkbox"
              :value="cameraItem.id"
              @change="eventGroupCreateError = ''"
            />
            <span>▣ {{ cameraItem.name }}</span>
          </label>
          <p v-if="temporaryGroupVideoOptions.length === 0">没有匹配的视频</p>
        </div>
        <p v-if="eventGroupCreateError" class="event-group-create-modal__error">
          {{ eventGroupCreateError }}
        </p>
        <footer>
          <button type="button" class="cancel-btn" @click="eventGroupCreateOpen = false">
            取消
          </button>
          <button
            type="button"
            class="confirm-btn"
            :disabled="!eventGroupName.trim() || eventGroupSelectedIds.length === 0"
            @click="confirmTemporaryGroupCreate"
          >
            创建分组并上墙
          </button>
        </footer>
      </section>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="bindMenuVisible"
      class="context-menu"
      :style="{ top: bindMenuY + 'px', left: bindMenuX + 'px' }"
    >
      <div class="context-menu-item" @click="openBindDialog">🔗 绑定监控目标</div>
    </div>

    <!-- 绑定弹窗 -->
    <div v-if="bindDialogVisible" class="modal-overlay">
      <div class="modal-content">
        <h3>为 "{{ selectedVideoToBind?.name }}" 绑定监控目标</h3>
        <div class="target-list-container">
          <div v-for="group in targetTree" :key="group.id" class="target-group-chk">
            <div class="group-title-chk">{{ group.name }}</div>
            <div class="target-options">
              <label v-for="target in group.children" :key="target.id" class="target-option-chk">
                <input v-model="tempBoundTargets" type="checkbox" :value="target.id" />
                {{ target.name }}
              </label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeBindDialog">取消</button>
          <button class="confirm-btn" @click="saveBind">保存</button>
        </div>
      </div>
    </div>

    <!-- 保存模式弹窗 -->
    <div v-if="isSavingMode" class="modal-overlay">
      <div class="modal-content" style="width: 350px">
        <h3>保存新模式</h3>
        <div style="margin: 20px 0">
          <label style="display: block; margin-bottom: 8px; color: #7cdbff">模式名称</label>
          <input
            v-model="modeNameInput"
            type="text"
            style="
              width: 100%;
              padding: 8px;
              background: rgb(0 0 0 / 30%);
              border: 1px solid rgb(0 180 255 / 30%);
              color: white;
              border-radius: 2px;
              box-sizing: border-box;
            "
          />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelSaveMode">取消</button>
          <button class="confirm-btn" :disabled="!modeNameInput.trim()" @click="confirmSaveMode">
            确认保存
          </button>
        </div>
      </div>
    </div>

    <!-- 新增预案弹窗 -->
    <div v-if="isAddingPlan" class="modal-overlay">
      <div class="modal-content" style="width: 500px">
        <h3>新建轮播预案</h3>
        <div style="display: flex; gap: 15px; margin-bottom: 15px; margin-top: 15px">
          <div style="flex: 2">
            <label style="display: block; margin-bottom: 5px; color: #7cdbff">预案名称</label>
            <input
              v-model="newPlan.name"
              type="text"
              placeholder="如：夜班巡航"
              style="
                width: 100%;
                padding: 6px;
                background: rgb(0 0 0 / 30%);
                border: 1px solid rgb(0 180 255 / 30%);
                color: white;
                border-radius: 2px;
                box-sizing: border-box;
              "
            />
          </div>
          <div style="flex: 1">
            <label style="display: block; margin-bottom: 5px; color: #7cdbff">间隔(秒)</label>
            <input
              v-model="newPlan.intervalSeconds"
              type="number"
              min="1"
              style="
                width: 100%;
                padding: 6px;
                background: rgb(0 0 0 / 30%);
                border: 1px solid rgb(0 180 255 / 30%);
                color: white;
                border-radius: 2px;
                box-sizing: border-box;
              "
            />
          </div>
        </div>

        <div
          class="steps-builder"
          style="
            background: rgb(0 0 0 / 20%);
            padding: 10px;
            border-radius: 2px;
            margin-bottom: 15px;
            border: 1px solid rgb(0 130 210 / 35%);
          "
        >
          <div style="color: #00b4ff; font-weight: bold; margin-bottom: 10px">轮询步骤配置</div>
          <div style="max-height: 150px; overflow-y: auto; margin-bottom: 10px">
            <div
              v-for="(step, idx) in newPlan.steps"
              :key="idx"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgb(255 255 255 / 5%);
                padding: 5px 10px;
                margin-bottom: 5px;
                border-radius: 2px;
                font-size: 13px;
              "
            >
              <span
                >{{ idx + 1 }}. {{ savedModes.find((m) => m.id === step.modeId)?.name }} (第{{
                  step.pageIndex + 1
                }}页)</span
              >
              <button
                style="background: transparent; border: none; color: #ff4d4f; cursor: pointer"
                @click="handleRemoveStep(idx)"
              >
                ✖
              </button>
            </div>
            <div
              v-if="newPlan.steps.length === 0"
              style="color: #666; font-size: 13px; text-align: center; padding: 10px"
            >
              尚未添加任何轮询步骤
            </div>
          </div>

          <div style="display: flex; gap: 8px">
            <select
              v-model="tempModeId"
              style="
                flex: 2;
                padding: 6px;
                background: rgb(0 0 0 / 30%);
                border: 1px solid rgb(0 180 255 / 30%);
                color: white;
                border-radius: 2px;
              "
              @change="tempPageIndex = 0"
            >
              <option disabled value="">选择模式</option>
              <option v-for="mode in savedModes" :key="mode.id" :value="mode.id">
                {{ mode.name }}
              </option>
            </select>
            <select
              v-model="tempPageIndex"
              :disabled="!tempModeId"
              style="
                flex: 1;
                padding: 6px;
                background: rgb(0 0 0 / 30%);
                border: 1px solid rgb(0 180 255 / 30%);
                color: white;
                border-radius: 2px;
              "
            >
              <option v-for="(page, idx) in availablePagesForTempMode" :key="page.id" :value="idx">
                第 {{ idx + 1 }} 页
              </option>
            </select>
            <button
              :disabled="!tempModeId"
              style="
                background: rgb(0 180 255 / 20%);
                border: 1px solid #00b4ff;
                color: #00b4ff;
                border-radius: 2px;
                padding: 0 12px;
                cursor: pointer;
              "
              @click="handleAddStep"
            >
              ➕ 添加
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="isAddingPlan = false">取消</button>
          <button
            class="confirm-btn"
            :disabled="!newPlan.name || newPlan.steps.length === 0"
            @click="handleSavePlan"
          >
            保存预案
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: rgb(0 20 45 / 85%);
  border-right: 1px solid rgb(0 130 210 / 35%);
  backdrop-filter: blur(10px);
  color: white;
  font-family: var(--font-body);
  pointer-events: auto;
}

.top-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
}

.tabs {
  display: flex;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
  background: rgb(0 0 0 / 20%);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 5px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-muted, #aaa);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab:hover {
  color: white;
  background: rgb(255 255 255 / 10%);
}

.tab.active {
  color: #00b4ff;
  border-bottom: 2px solid #00b4ff;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-name {
  font-weight: bold;
  color: #7cdbff;
  margin-bottom: 5px;
}

.tree-node {
  padding: 6px 12px;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 2px;
  cursor: grab;
  margin-left: 10px;
  margin-bottom: 5px;
  font-size: 14px;
  transition: background 0.2s;
}

.tree-node:hover {
  background: rgb(0 180 255 / 20%);
  border-color: rgb(0 180 255 / 50%);
}

.tree-node:active {
  cursor: grabbing;
}

.sub-node {
  margin-left: 25px;
  background: rgb(0 180 255 / 5%);
  font-size: 13px;
  border-color: rgb(0 180 255 / 10%);
}

.count-badge {
  float: right;
  color: #0f6;
  font-size: 12px;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background: rgb(20 30 45 / 95%);
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 2px;
  padding: 5px 0;
  box-shadow: 0 4px 12px rgb(0 0 0 / 50%);
  min-width: 120px;
}

.context-menu-item {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 13px;
  color: #fff;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: rgb(0 180 255 / 20%);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 60%);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.modal-content {
  background: rgb(0 16 36 / 90%);
  border: 1px solid rgb(0 130 210 / 35%);
  padding: 20px;
  border-radius: 2px;
  width: 400px;
  color: #fff;
}

.modal-content h3 {
  margin-top: 0;
  color: #7cdbff;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
  padding-bottom: 10px;
}

.target-list-container {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  padding-right: 10px;
}

.target-group-chk {
  margin-bottom: 10px;
}

.group-title-chk {
  font-weight: bold;
  color: #00b4ff;
  margin-bottom: 5px;
  font-size: 14px;
}

.target-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 10px;
}

.target-option-chk {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.tree-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(255 255 255 / 50%);
  border: 1px dashed rgb(0 130 210 / 35%);
  border-radius: 2px;
}

.bottom-section {
  height: 350px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  position: relative;
}

.eagle-eye-header {
  font-size: 16px;
  font-weight: bold;
  color: #7cdbff;
  margin-bottom: 10px;
}

.eagle-eye-map {
  flex: 1;
  background: rgb(0 16 36 / 90%);
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(255 255 255 / 50%);
  position: relative;
  overflow: hidden;
}

.eagle-eye-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(180deg, rgb(0 28 58 / 95%) 0%, rgb(0 12 28 / 98%) 100%);
  z-index: 1;
}

.eagle-eye-placeholder__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(0 180 255 / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(0 180 255 / 6%) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.map-text {
  position: relative;
  z-index: 2;
  color: #7cdbff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.map-text-sub {
  position: relative;
  z-index: 2;
  color: rgb(124 219 255 / 55%);
  font-size: 11px;
}

.map-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  box-shadow: 0 0 8px rgb(255 255 255 / 50%);
}

.map-marker.camera {
  background: #00b4ff;
  border: 2px solid #fff;
}

.map-marker.alarm {
  background: #ff4d4f;
  border: 2px solid #fff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(255 77 79 / 70%);
  }

  70% {
    box-shadow: 0 0 0 10px rgb(255 77 79 / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(255 77 79 / 0%);
  }
}

.alarm-overlay {
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
  z-index: 10;
}
</style>

<style scoped>
.mode-container,
.plan-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mode-list,
.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mode-item,
.plan-item {
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.mode-item:hover {
  background: rgb(0 180 255 / 10%);
  border-color: rgb(0 180 255 / 50%);
}

.mode-item .icon {
  font-size: 18px;
  margin-right: 10px;
}

.mode-item .name {
  color: #7cdbff;
  font-weight: bold;
}

.save-btn {
  background: rgb(0 180 255 / 20%);
  border: 1px solid #00b4ff;
  color: #00b4ff;
  padding: 8px;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
}

.save-btn:hover {
  background: rgb(0 180 255 / 40%);
}

.plan-item {
  cursor: default;
  flex-direction: column;
  align-items: stretch;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-info .name {
  color: #fa0;
  font-weight: bold;
}

.plan-info .desc {
  font-size: 12px;
  color: #aaa;
}

.plan-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 20%);
  color: white;
  padding: 5px;
  border-radius: 2px;
  cursor: pointer;
}

.action-btn.start {
  background: rgb(0 255 100 / 20%);
  border-color: #0f6;
  color: #0f6;
}

.action-btn.start:hover {
  background: rgb(0 255 100 / 40%);
}

.action-btn.stop {
  background: rgb(255 50 50 / 20%);
  border-color: #f33;
  color: #f33;
}

.action-btn.stop:hover {
  background: rgb(255 50 50 / 40%);
}

.action-btn.edit {
  flex: 0 0 40px;
}

.action-btn.edit:hover {
  background: rgb(255 255 255 / 20%);
}
</style>

<style scoped>
.search-bar {
  padding: 10px 15px;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
}

.search-bar input {
  width: 100%;
  padding: 6px 12px;
  background: rgb(0 0 0 / 30%);
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  color: white;
  outline: none;
  box-sizing: border-box;
}

.search-bar input:focus {
  border-color: #00b4ff;
  box-shadow: 0 0 5px rgb(0 180 255 / 30%);
}

.empty-state {
  text-align: center;
  color: rgb(255 255 255 / 40%);
  padding: 20px 0;
  font-size: 14px;
}
</style>

<style scoped>
.plan-steps-preview {
  margin: 10px 0;
  padding: 8px;
  background: rgb(0 0 0 / 30%);
  border-radius: 2px;
  font-size: 12px;
  color: #ccc;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-item {
  display: flex;
  justify-content: space-between;
}

.step-page {
  color: #00b4ff;
  opacity: 0.8;
}

.active-indicator {
  margin-left: 4px;
  animation: pulse-indicator 1.5s infinite;
}

@keyframes pulse-indicator {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
}

.add-plan-btn {
  margin-top: 10px;
  background: rgb(0 180 255 / 10%);
  border: 1px dashed rgb(0 180 255 / 40%);
  color: #00b4ff;
  padding: 10px;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.add-plan-btn:hover {
  background: rgb(0 180 255 / 20%);
  border-color: #00b4ff;
}

.add-plan-form {
  margin-top: 15px;
  background: rgb(0 0 0 / 40%);
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-title {
  font-weight: bold;
  color: #7cdbff;
  margin-bottom: 5px;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
  padding-bottom: 5px;
}

.add-plan-form label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #ccc;
}

.add-plan-form input {
  width: 60%;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: white;
  padding: 4px 8px;
  border-radius: 2px;
  outline: none;
}

.add-plan-form input:focus {
  border-color: #00b4ff;
}

.steps-builder {
  margin-top: 5px;
  background: rgb(255 255 255 / 5%);
  padding: 8px;
  border-radius: 2px;
}

.builder-title {
  font-size: 13px;
  margin-bottom: 5px;
  color: #7cdbff;
}

.builder-step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px;
  background: rgb(0 0 0 / 30%);
  margin-bottom: 4px;
  border-radius: 2px;
}

.remove-step-btn {
  background: none;
  border: none;
  color: #f33;
  cursor: pointer;
}

.add-step-row {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.add-step-row select {
  flex: 1;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(0 130 210 / 35%);
  color: white;
  padding: 2px;
  border-radius: 2px;
  outline: none;
  font-size: 12px;
}

.add-step-row select:disabled {
  opacity: 0.5;
}

.add-step-btn {
  background: rgb(0 180 255 / 20%);
  border: 1px solid #00b4ff;
  color: #00b4ff;
  border-radius: 2px;
  cursor: pointer;
}

.add-step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 5px;
}

.cancel-btn,
.confirm-btn {
  padding: 4px 12px;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid;
}

.cancel-btn {
  background: rgb(255 255 255 / 10%);
  border-color: rgb(255 255 255 / 20%);
  color: #ccc;
}

.confirm-btn {
  background: rgb(0 180 255 / 20%);
  border-color: #00b4ff;
  color: #00b4ff;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.target-tree-container {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.target-tree-toolbar {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 9px;
  border: 1px solid rgb(0 140 211 / 30%);
  background: rgb(0 45 77 / 36%);
}

.target-tree-toolbar > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-tree-toolbar strong {
  color: #d7efff;
  font-size: 12px;
}

.target-tree-toolbar span {
  color: #6f96af;
  font-size: 9px;
}

.target-tree-toolbar button {
  flex-shrink: 0;
  height: 24px;
  border: 1px solid rgb(0 161 230 / 32%);
  background: rgb(0 69 112 / 34%);
  color: #7bd8ff;
  font-size: 10px;
  cursor: pointer;
}

.target-category-shortcuts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.target-category-shortcuts > button {
  min-width: 0;
  height: 38px;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  border: 1px solid rgb(79 129 163 / 24%);
  background: rgb(10 39 65 / 68%);
  color: #a9c4d7;
  cursor: pointer;
  text-align: left;
}

.target-category-shortcuts > button b {
  color: #48caff;
  font-size: 15px;
  text-align: center;
}

.target-category-shortcuts > button span {
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-category-shortcuts > button em {
  min-width: 19px;
  border-radius: 9px;
  background: rgb(0 150 215 / 14%);
  color: #58d4ff;
  font: normal 9px/17px var(--font-body);
  text-align: center;
}

.target-category-shortcuts > button.active {
  border-color: rgb(0 190 255 / 70%);
  background: linear-gradient(135deg, rgb(0 105 173 / 55%), rgb(0 56 101 / 64%));
  color: #fff;
  box-shadow: inset 2px 0 #21c9ff;
}

.target-category-shortcuts > button.displaying::after {
  content: '展示中';
  grid-column: 2 / 4;
  margin-top: -9px;
  color: #53e3b1;
  font-size: 8px;
}

.target-business-groups {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.target-business-group {
  border: 1px solid rgb(0 125 193 / 26%);
  background: rgb(0 16 35 / 60%);
}

.target-business-group.is-displaying {
  border-color: rgb(39 216 159 / 62%);
  box-shadow: inset 3px 0 rgb(39 216 159 / 72%);
}

.target-business-group > header {
  min-height: 35px;
  display: grid;
  grid-template-columns: 13px 19px minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  background: rgb(0 52 88 / 50%);
  cursor: pointer;
}

.target-business-group > header > span,
.target-business-group > header > b {
  color: #54cfff;
  font-size: 12px;
}

.target-business-group > header > strong {
  min-width: 0;
  overflow: hidden;
  color: #d8edf9;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-business-group > header > em,
.target-business-group > header > i {
  color: #7199b2;
  font-size: 9px;
  font-style: normal;
  white-space: nowrap;
}

.target-business-group > header > small,
.target-object button > small {
  padding: 1px 4px;
  border: 1px solid rgb(45 213 160 / 32%);
  background: rgb(17 105 78 / 28%);
  color: #5de4b7;
  font-size: 8px;
  white-space: nowrap;
}

.target-business-group__body {
  padding: 5px;
}

.target-object {
  margin-bottom: 4px;
  border: 1px solid rgb(255 255 255 / 5.5%);
  background: rgb(255 255 255 / 2.5%);
}

.target-object.is-displaying {
  border-color: rgb(42 212 159 / 50%);
  background: rgb(15 91 70 / 16%);
}

.target-object > button {
  width: 100%;
  min-height: 30px;
  display: grid;
  grid-template-columns: 13px 16px minmax(0, 1fr) 22px auto;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  color: #aac7d9;
  cursor: pointer;
  text-align: left;
}

.target-object > button > span,
.target-object > button > b {
  color: #4bc9f6;
  font-size: 10px;
}

.target-object > button > strong {
  min-width: 0;
  overflow: hidden;
  font-size: 10px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-object > button > em {
  border-radius: 8px;
  background: rgb(0 151 218 / 15%);
  color: #50d5ff;
  font: normal 9px/16px var(--font-body);
  text-align: center;
}

.target-cameras {
  padding: 0 5px 5px 31px;
}

.target-camera {
  min-height: 25px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  padding: 0 6px;
  border-left: 1px dashed rgb(0 160 220 / 28%);
  background: rgb(0 55 88 / 25%);
  color: #87aabf;
  font-size: 9px;
  cursor: grab;
}

.target-camera span {
  color: #39c8fb;
}

.linkage-config-btn {
  width: 100%;
  height: 30px;
  margin-bottom: 8px;
  border: 1px solid rgb(0 180 255 / 45%);
  border-radius: 3px;
  background: rgb(0 90 160 / 35%);
  color: #d8ecff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.tab--event {
  color: #ffb55a;
}

.tab--event.active {
  color: #ffb55a;
  border-bottom-color: #ff9f2f;
  background: rgb(255 145 38 / 8%);
}

.event-video-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-video-summary {
  padding: 11px;
  border: 1px solid rgb(255 161 54 / 42%);
  background: linear-gradient(135deg, rgb(87 43 6 / 48%), rgb(0 31 59 / 72%));
}

.event-video-summary__eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #ffb55a;
  font-size: 11px;
}

.event-video-summary > strong {
  display: block;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}

.event-video-summary p {
  margin: 5px 0 9px;
  color: #83aac6;
  font-size: 11px;
}

.event-video-summary__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.event-video-summary__actions button {
  height: 28px;
  border: 1px solid rgb(0 183 255 / 56%);
  background: rgb(0 100 174 / 48%);
  color: #fff;
  cursor: pointer;
}

.event-video-summary__actions button.is-ghost {
  border-color: rgb(137 170 195 / 32%);
  background: rgb(16 45 68 / 54%);
  color: #a8c4d7;
}

.event-video-feedback {
  margin-top: 8px;
  padding: 7px 8px;
  border: 1px solid rgb(38 214 139 / 34%);
  background: rgb(13 91 65 / 28%);
  color: #70efbd;
  font-size: 11px;
  line-height: 1.45;
}

.event-video-groups {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.event-video-group {
  border: 1px solid rgb(0 128 204 / 32%);
  background: rgb(0 15 34 / 62%);
}

.event-video-group.is-displaying {
  border-color: rgb(39 216 159 / 62%);
  box-shadow: inset 3px 0 rgb(39 216 159 / 72%);
}

.event-video-group__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  min-height: 34px;
  border-bottom: 1px solid rgb(0 110 180 / 18%);
}

.event-video-group__toggle {
  min-width: 0;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: #dcedf9;
  cursor: pointer;
  text-align: left;
}

.event-video-group__toggle strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.event-video-group__toggle i {
  padding: 1px 4px;
  border: 1px solid rgb(255 172 66 / 42%);
  background: rgb(111 62 8 / 42%);
  color: #ffc16f;
  font-size: 9px;
  font-style: normal;
  white-space: nowrap;
}

.event-video-group__toggle small {
  padding: 1px 4px;
  border: 1px solid rgb(42 216 160 / 32%);
  background: rgb(11 99 72 / 26%);
  color: #5de4b7;
  font-size: 8px;
  white-space: nowrap;
}

.event-video-group__toggle em {
  min-width: 20px;
  border-radius: 9px;
  background: rgb(0 170 238 / 16%);
  color: #50d2ff;
  font: normal 10px/17px var(--font-body);
  text-align: center;
}

.event-video-group__actions {
  display: flex;
  gap: 4px;
  padding-right: 5px;
}

.event-video-group__actions button {
  height: 23px;
  padding: 0 7px;
  border: 1px solid rgb(0 161 230 / 38%);
  background: rgb(0 72 118 / 40%);
  color: #82dfff;
  font-size: 10px;
  cursor: pointer;
}

.event-video-group__actions button.is-danger {
  border-color: rgb(255 91 91 / 38%);
  background: rgb(112 27 35 / 34%);
  color: #ff9494;
}

.event-video-group__body {
  padding: 5px;
}

.event-video-camera {
  min-height: 29px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  padding: 0 6px 0 8px;
  border: 1px solid rgb(255 255 255 / 7%);
  background: rgb(255 255 255 / 3.5%);
  color: #bcd3e5;
  font-size: 11px;
  cursor: grab;
}

.event-video-camera > span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-video-camera > button {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #e18d7c;
  font-size: 10px;
  cursor: pointer;
}

.event-video-group__empty {
  padding: 8px;
  color: #708da2;
  font-size: 11px;
  text-align: center;
}

.event-video-group__add {
  width: 100%;
  height: 26px;
  border: 1px dashed rgb(0 170 238 / 32%);
  background: rgb(0 88 140 / 12%);
  color: #65cfff;
  font-size: 10px;
  cursor: pointer;
}

.event-video-records {
  border: 1px solid rgb(0 112 181 / 25%);
  background: rgb(0 13 29 / 62%);
}

.event-video-records__toggle {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 0;
  background: rgb(0 42 75 / 50%);
  color: #b9d6e9;
  cursor: pointer;
  text-align: left;
}

.event-video-records__toggle span {
  flex: 1;
  font-size: 12px;
}

.event-video-records__toggle em {
  min-width: 20px;
  border-radius: 8px;
  background: rgb(255 166 61 / 15%);
  color: #ffb45c;
  font: normal 10px/16px var(--font-body);
  text-align: center;
}

.event-video-records__toggle b {
  font-weight: 400;
}

.event-video-records__list {
  max-height: 150px;
  overflow: auto;
  padding: 4px 8px;
}

.event-video-records__list > div {
  display: grid;
  grid-template-columns: 51px 1fr;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px dashed rgb(95 143 172 / 15%);
}

.event-video-records__list time {
  color: #6f91a8;
  font-size: 10px;
}

.event-video-records__list p {
  margin: 0;
  color: #8eabba;
  font-size: 10px;
  line-height: 1.35;
}

.event-video-records__list p strong {
  display: block;
  color: #c6dfef;
  font-size: 11px;
}

.event-add-modal {
  width: 520px;
  padding: 0;
  overflow: hidden;
}

.event-add-modal > header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
}

.event-add-modal > header h3 {
  flex: 1;
  margin: 0;
  padding: 0;
  border: 0;
}

.event-add-modal > header button {
  border: 0;
  background: transparent;
  color: #d8edff;
  font-size: 22px;
  cursor: pointer;
}

.event-add-modal__group {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 8px;
  margin: 14px 14px 8px;
  color: #8fb4cf;
  font-size: 12px;
}

.event-add-modal__group select,
.event-add-modal__search {
  height: 32px;
  border: 1px solid rgb(0 130 210 / 35%);
  background: #061e37;
  color: #fff;
  padding: 0 8px;
  outline: 0;
}

.event-add-modal__search {
  width: calc(100% - 28px);
  margin: 0 14px 8px;
  box-sizing: border-box;
}

.event-add-modal__list {
  max-height: 360px;
  overflow: auto;
  padding: 0 14px 14px;
}

.event-add-modal__list > button {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  padding: 0 10px;
  border: 1px solid rgb(0 110 180 / 25%);
  background: rgb(0 37 68 / 68%);
  color: #cbe2f2;
  cursor: pointer;
  text-align: left;
}

.event-add-modal__list > button span {
  flex: 1;
}

.event-add-modal__list > button em {
  color: #51d2ff;
  font-size: 10px;
  font-style: normal;
}

.event-add-modal__list > p {
  color: #7894a8;
  text-align: center;
}

.event-group-create-modal {
  width: 620px;
  padding: 0;
  overflow: hidden;
}

.event-group-create-modal > header {
  min-height: 54px;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid rgb(0 130 210 / 35%);
  box-sizing: border-box;
}

.event-group-create-modal > header > div {
  flex: 1;
}

.event-group-create-modal > header h3 {
  margin: 0;
  padding: 0;
  border: 0;
}

.event-group-create-modal > header p {
  margin: 4px 0 0;
  color: #789bb4;
  font-size: 11px;
}

.event-group-create-modal > header > button {
  border: 0;
  background: transparent;
  color: #d8edff;
  font-size: 22px;
  cursor: pointer;
}

.event-group-create-modal__name {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 8px;
  margin: 14px;
  color: #8fb4cf;
  font-size: 12px;
}

.event-group-create-modal__name input,
.event-group-create-modal__toolbar input {
  height: 32px;
  border: 1px solid rgb(0 130 210 / 35%);
  background: #061e37;
  color: #fff;
  padding: 0 9px;
  outline: 0;
  box-sizing: border-box;
}

.event-group-create-modal__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 14px 8px;
}

.event-group-create-modal__toolbar input {
  flex: 1;
}

.event-group-create-modal__toolbar span {
  color: #60d8ff;
  font-size: 11px;
  white-space: nowrap;
}

.event-group-create-modal__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  max-height: 330px;
  overflow: auto;
  padding: 0 14px;
}

.event-group-create-modal__list label {
  min-width: 0;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border: 1px solid rgb(0 110 180 / 25%);
  background: rgb(0 37 68 / 68%);
  color: #cbe2f2;
  font-size: 11px;
  cursor: pointer;
  box-sizing: border-box;
}

.event-group-create-modal__list label:has(input:checked) {
  border-color: rgb(0 190 255 / 70%);
  background: rgb(0 103 168 / 42%);
  color: #fff;
}

.event-group-create-modal__list label span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-group-create-modal__list > p {
  grid-column: 1 / -1;
  color: #7894a8;
  text-align: center;
}

.event-group-create-modal__error {
  margin: 8px 14px 0;
  color: #ff8f8f;
  font-size: 11px;
}

.event-group-create-modal > footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px 14px;
}

.linkage-config-btn:hover {
  background: rgb(0 120 210 / 45%);
  color: #fff;
}
</style>
