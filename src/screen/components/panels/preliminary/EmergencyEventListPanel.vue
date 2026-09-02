<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import ClipImage from '../../common/ClipImage.vue';
import { eventListIconClip } from '../../../utils/preliminaryClipConfig';
import { fireEventListIconClip } from '../../../utils/fireEmergencyClipConfig';
import {
  selectedPreliminaryEventId,
  selectPreliminaryEvent,
} from '../../../lib/composables/usePreliminaryEventSelection';
import {
  selectedFireEmergencyEventId,
  selectFireEmergencyEvent,
} from '../../../lib/composables/useFireEmergencyEventSelection';
import {
  estimatePreliminaryPageSize,
  goToPreliminaryPage,
  preliminaryCurrentPage,
  preliminaryKeyword,
  preliminaryPagedGroups,
  preliminaryTotalPages,
  preliminaryVisiblePages,
  resetPreliminarySearch,
  searchPreliminaryEvents,
  setPreliminaryPageSize,
} from '../../../lib/composables/usePreliminaryEventList';
import {
  estimateFireEmergencyPageSize,
  fireEmergencyCurrentPage,
  fireEmergencyKeyword,
  fireEmergencyPagedGroups,
  fireEmergencyTotalPages,
  fireEmergencyVisiblePages,
  goToFireEmergencyPage,
  resetFireEmergencySearch,
  searchFireEmergencyEvents,
  setFireEmergencyPageSize,
  createFireEmergencyEventFromForm,
  applyPendingFireEmergencyListPage,
  type EmergencyEventCreatePayload,
} from '../../../lib/composables/useFireEmergencyEventList';
import type { DesignModule } from '../../../utils/designAssets';
import { useAccidentRescueNavigation } from '../../../lib/composables/useAccidentRescueNavigation';
import {
  fireEmergencyListTab,
  setFireEmergencyListTab,
} from '../../../lib/composables/useFireEmergencyListTab';
import type { EmergencyEventItem } from '../../../lib/data/preliminaryMock';
import EmergencyEventCreateModal from './EmergencyEventCreateModal.vue';

const props = withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
    /** 标题区切换卡：应急事件 / 应急演练（仅应急指挥板块） */
    showEventTabs?: boolean;
  }>(),
  { module: 'preliminary', showEventTabs: false },
);

const activeListTab = fireEmergencyListTab;
const createModalOpen = ref(false);
const route = useRoute();
const router = useRouter();

function openCreateModal() {
  createModalOpen.value = true;
}

function closeCreateModal() {
  createModalOpen.value = false;
}

function handleCreateSubmit(payload: EmergencyEventCreatePayload) {
  if (!isFireEmergency.value) return;
  const createdEvent = createFireEmergencyEventFromForm(payload);
  goToEventDispose(createdEvent);
}

const isFireEmergency = computed(() => props.module === 'fireEmergency');
const { goToEventDispose } = useAccidentRescueNavigation();

function handleDispose(event: EmergencyEventItem) {
  if (isFireEmergency.value) {
    goToEventDispose(event);
  }
}

const keyword = computed({
  get: () => (isFireEmergency.value ? fireEmergencyKeyword.value : preliminaryKeyword.value),
  set: (value: string) => {
    if (isFireEmergency.value) fireEmergencyKeyword.value = value;
    else preliminaryKeyword.value = value;
  },
});

const pagedGroups = computed(() =>
  isFireEmergency.value ? fireEmergencyPagedGroups.value : preliminaryPagedGroups.value,
);
const currentPage = computed(() =>
  isFireEmergency.value ? fireEmergencyCurrentPage.value : preliminaryCurrentPage.value,
);
const totalPages = computed(() =>
  isFireEmergency.value ? fireEmergencyTotalPages.value : preliminaryTotalPages.value,
);
const visiblePages = computed(() =>
  isFireEmergency.value ? fireEmergencyVisiblePages.value : preliminaryVisiblePages.value,
);
const selectedEventId = computed(() =>
  isFireEmergency.value ? selectedFireEmergencyEventId.value : selectedPreliminaryEventId.value,
);

function selectEvent(id: number) {
  if (isFireEmergency.value) selectFireEmergencyEvent(id);
  else selectPreliminaryEvent(id);
}

function searchEvents() {
  if (isFireEmergency.value) searchFireEmergencyEvents();
  else searchPreliminaryEvents();
}

function resetSearch() {
  if (isFireEmergency.value) resetFireEmergencySearch();
  else resetPreliminarySearch();
}

function goToPage(page: number) {
  if (isFireEmergency.value) goToFireEmergencyPage(page);
  else goToPreliminaryPage(page);
}

const FIRE_EVENT_LIST_ICON = '/images/shicon.png';
const FIRE_DRILL_LIST_ICON = '/images/yaicon.png';

function eventCardIconSrc(event: EmergencyEventItem) {
  return (event.kind ?? 'event') === 'drill' ? FIRE_DRILL_LIST_ICON : FIRE_EVENT_LIST_ICON;
}

function iconClip(rowIndex: number) {
  return isFireEmergency.value ? fireEventListIconClip(rowIndex) : eventListIconClip(rowIndex);
}

const itemsRef = ref<HTMLElement | null>(null);

function pageEventIconIndex(eventId: number) {
  let index = 0;
  for (const group of pagedGroups.value) {
    for (const event of group.events) {
      if (event.id === eventId) return index;
      index += 1;
    }
  }
  return 0;
}
let resizeObserver: ResizeObserver | null = null;

function updatePageSize() {
  if (!itemsRef.value) return;
  const height = itemsRef.value.clientHeight;
  if (isFireEmergency.value) {
    setFireEmergencyPageSize(estimateFireEmergencyPageSize(height));
    applyPendingFireEmergencyListPage();
  } else {
    setPreliminaryPageSize(estimatePreliminaryPageSize(height));
  }
}

onMounted(() => {
  if (isFireEmergency.value && route.query.create === 'event') {
    setFireEmergencyListTab('event');
    openCreateModal();
    const query = { ...route.query };
    delete query.create;
    void router.replace({ query });
  }
  updatePageSize();
  resizeObserver = new ResizeObserver(updatePageSize);
  if (itemsRef.value) {
    resizeObserver.observe(itemsRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <PanelCard
    :title="showEventTabs ? '' : '应急事件列表'"
    variant="eventList"
    :module="module"
    :show-more="false"
    :hide-icon="showEventTabs"
  >
    <template v-if="showEventTabs" #header-extra>
      <button type="button" class="event-list-add-btn" @click="openCreateModal">
        {{ activeListTab === 'event' ? '新增事件' : '新增演练' }}
      </button>
    </template>
    <template v-if="showEventTabs" #title>
      <div class="event-list-tabs" :class="`event-list-tabs--${activeListTab}`">
        <button
          type="button"
          class="event-list-tabs__btn"
          :class="{ 'event-list-tabs__btn--active': activeListTab === 'event' }"
          @click="setFireEmergencyListTab('event')"
        >
          应急事件
        </button>
        <button
          type="button"
          class="event-list-tabs__btn"
          :class="{ 'event-list-tabs__btn--active': activeListTab === 'drill' }"
          @click="setFireEmergencyListTab('drill')"
        >
          应急演练
        </button>
      </div>
    </template>
    <div class="event-list" :class="showEventTabs ? `event-list--${activeListTab}` : undefined">
      <div class="event-list__toolbar">
        <input
          v-model="keyword"
          class="event-list__search"
          type="text"
          placeholder="请输入关键词"
        />
        <button
          type="button"
          class="event-list__btn event-list__btn--primary"
          @click="searchEvents"
        >
          搜索
        </button>
        <button type="button" class="event-list__btn" @click="resetSearch">重置</button>
      </div>

      <div class="event-list__filters">
        <select class="event-list__select">
          <option>事件状态</option>
          <option>进行中</option>
          <option>待处置</option>
          <option>已结束</option>
        </select>
        <select class="event-list__select">
          <option>是否预警</option>
          <option>已预警</option>
          <option>未预警</option>
        </select>
      </div>

      <div ref="itemsRef" class="event-list__items">
        <section v-for="group in pagedGroups" :key="group.id" class="event-group">
          <h4 class="event-group__title">{{ group.label }}</h4>
          <article
            v-for="event in group.events"
            :key="event.id"
            class="event-card"
            :class="{ 'event-card--active': selectedEventId === event.id }"
            @click="selectEvent(event.id)"
          >
            <img
              v-if="isFireEmergency && showEventTabs"
              class="event-card__icon"
              :src="eventCardIconSrc(event)"
              alt=""
            />
            <ClipImage
              v-else
              v-bind="iconClip(pageEventIconIndex(event.id))"
              class="event-card__icon"
            />
            <div class="event-card__main">
              <div class="event-card__head">
                <h4 class="event-card__title">{{ event.title }}</h4>
                <span
                  class="event-card__tag"
                  :class="
                    event.reported
                      ? isFireEmergency
                        ? 'event-card__tag--warning-done-green'
                        : 'event-card__tag--warning-done'
                      : 'event-card__tag--warning-pending'
                  "
                >
                  {{ event.reported ? '已预警' : '未预警' }}
                </span>
                <span
                  v-if="event.status === 'processing'"
                  class="event-card__tag event-card__tag--processing"
                >
                  进行中
                </span>
                <span
                  v-else-if="event.status === 'done'"
                  class="event-card__tag event-card__tag--done"
                >
                  已结束
                </span>
                <button
                  v-if="event.status === 'pending'"
                  type="button"
                  class="event-card__action event-card__action--dispose"
                  @click.stop="handleDispose(event)"
                >
                  去处置
                </button>
                <button
                  v-else-if="
                    isFireEmergency && (event.status === 'processing' || event.status === 'done')
                  "
                  type="button"
                  class="event-card__action event-card__action--view"
                  @click.stop="handleDispose(event)"
                >
                  查看
                </button>
              </div>
              <div class="event-card__row"><span>地点：</span>{{ event.location }}</div>
              <div class="event-card__row"><span>描述：</span>{{ event.description }}</div>
              <div class="event-card__row">
                <span>{{ isFireEmergency ? '报送时间：' : '报警时间：' }}</span
                >{{ event.time }}
              </div>
            </div>
          </article>
        </section>
      </div>

      <div class="event-list__pagination">
        <button
          type="button"
          class="page-arrow"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-if="totalPages > 5" class="page-ellipsis">…</span>
        <button
          v-if="totalPages > 5"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': currentPage === totalPages }"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
        <button
          type="button"
          class="page-arrow"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>

    <EmergencyEventCreateModal
      v-if="showEventTabs"
      :open="createModalOpen"
      :kind="activeListTab"
      @close="closeCreateModal"
      @submit="handleCreateSubmit"
    />
  </PanelCard>
</template>

<style scoped>
.event-list-tabs {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  flex: none;
}

.event-list-tabs__btn {
  height: 28px;
  padding: 0 14px;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 0;
  background: rgb(0 25 55 / 55%);
  color: #a8b8cc;
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.event-list-tabs__btn:first-child {
  border-radius: 2px 0 0 2px;
}

.event-list-tabs__btn:last-child {
  border-radius: 0 2px 2px 0;
}

.event-list-tabs__btn + .event-list-tabs__btn {
  margin-left: -1px;
}

.event-list-tabs__btn--active {
  color: #fff;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  border-color: rgb(0 160 240 / 55%);
}

.event-list-tabs--drill .event-list-tabs__btn--active {
  background: linear-gradient(180deg, rgb(210 145 45 / 92%), rgb(160 105 25 / 92%));
  border-color: rgb(236 166 65 / 60%);
}

.event-list-add-btn {
  height: 28px;
  padding: 0 14px;
  border-radius: 2px;
  border: 1px solid rgb(0 150 230 / 50%);
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 6px 12px 10px;
}

.event-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;

  --elist-accent: #7cdbff;
  --elist-accent-soft: rgb(0 180 255 / 55%);
  --elist-border: rgb(0 100 180 / 35%);
  --elist-border-strong: rgb(0 140 220 / 45%);
  --elist-btn-primary: linear-gradient(180deg, rgb(0 120 210 / 85%), rgb(0 80 170 / 85%));
  --elist-btn-primary-border: rgb(0 150 230 / 50%);
  --elist-page-active: linear-gradient(180deg, rgb(0 130 220 / 90%), rgb(0 90 180 / 90%));
  --elist-page-active-border: rgb(0 160 240 / 55%);
  --elist-card-border-left: rgb(200 50 50 / 75%);
  --elist-group-title: #7cdbff;
  --elist-action-bg: linear-gradient(180deg, rgb(0 130 220 / 90%), rgb(0 90 180 / 90%));
  --elist-action-border: rgb(0 160 240 / 50%);
  --elist-action-view-bg: rgb(0 22 48 / 72%);
  --elist-action-view-border: rgb(0 140 220 / 45%);
  --elist-card-hover-bg: rgb(0 35 70 / 82%);
  --elist-tag-processing-bg: rgb(0 55 110 / 35%);
  --elist-tag-done-color: #9aa8bc;
  --elist-tag-done-bg: rgb(28 36 48 / 72%);
  --elist-tag-done-border: rgb(110 125 145 / 55%);
}

.event-list--drill {
  --elist-accent: #eca641;
  --elist-accent-soft: rgb(236 166 65 / 55%);
  --elist-border: rgb(180 120 40 / 40%);
  --elist-border-strong: rgb(236 166 65 / 48%);
  --elist-btn-primary: linear-gradient(180deg, rgb(210 140 40 / 90%), rgb(160 100 20 / 90%));
  --elist-btn-primary-border: rgb(236 166 65 / 55%);
  --elist-page-active: linear-gradient(180deg, rgb(210 145 45 / 92%), rgb(160 105 25 / 92%));
  --elist-page-active-border: rgb(236 166 65 / 60%);
  --elist-card-border-left: rgb(236 166 65 / 85%);
  --elist-group-title: #eca641;
  --elist-action-bg: linear-gradient(180deg, rgb(210 145 45 / 92%), rgb(160 105 25 / 92%));
  --elist-action-border: rgb(236 166 65 / 55%);
  --elist-action-view-bg: rgb(52 36 10 / 72%);
  --elist-action-view-border: rgb(236 166 65 / 42%);
  --elist-card-hover-bg: rgb(52 36 10 / 88%);
  --elist-tag-processing-bg: rgb(80 52 14 / 42%);
  --elist-tag-done-color: #b8a890;
  --elist-tag-done-bg: rgb(42 36 28 / 72%);
  --elist-tag-done-border: rgb(140 125 100 / 50%);
}

.event-list__toolbar {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.event-list__search {
  flex: 1;
  height: 30px;
  padding: 0 10px;
  background: rgb(0 20 45 / 75%);
  border: 1px solid var(--elist-border);
  border-radius: 2px;
  color: #8fa8c4;
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.event-list__search::placeholder {
  color: #6a7f99;
}

.event-list__btn {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--elist-border);
  border-radius: 2px;
  background: rgb(0 25 55 / 75%);
  color: #a8b8cc;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.event-list__btn--primary {
  background: var(--elist-btn-primary);
  color: #fff;
  border-color: var(--elist-btn-primary-border);
}

.event-list__filters {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.event-list__select {
  flex: 1;
  height: 30px;
  padding: 0 8px;
  background: rgb(0 20 45 / 75%);
  border: 1px solid var(--elist-border);
  border-radius: 2px;
  color: #8fa8c4;
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.event-list__items {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.event-group + .event-group {
  margin-top: 2px;
}

.event-group__title {
  margin: 0;
  padding-left: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--elist-group-title);
  line-height: 1.3;
  border-left: 2px solid var(--elist-accent-soft);
}

.event-card {
  display: flex;
  gap: 10px;
  padding: 12px 12px 12px 10px;
  background: rgb(0 18 40 / 72%);
  border: 1px solid var(--elist-border);
  border-left: 3px solid var(--elist-card-border-left);
  border-radius: 2px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  flex-shrink: 0;
}

.event-card:hover,
.event-card--active {
  background: var(--elist-card-hover-bg);
  border-color: var(--elist-border-strong);
}

.event-card__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.event-card__main {
  flex: 1;
  min-width: 0;
}

.event-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.event-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  flex: 1;
  min-width: 0;
}

.event-card__tag {
  padding: 1px 8px;
  font-size: 12px;
  border-radius: 2px;
  white-space: nowrap;
  line-height: 1.5;
}

.event-card__tag--warning-done {
  color: #ff7070;
  background: rgb(120 20 20 / 35%);
  border: 1px solid rgb(200 60 60 / 45%);
}

.event-card__tag--warning-done-green {
  color: #3dd68c;
  background: rgb(20 72 48 / 40%);
  border: 1px solid rgb(61 214 140 / 45%);
}

.event-card__tag--warning-pending {
  color: #9aadc4;
  background: rgb(28 40 58 / 62%);
  border: 1px dashed rgb(120 140 168 / 48%);
}

.event-card__tag--processing {
  color: var(--elist-accent);
  background: var(--elist-tag-processing-bg);
  border: 1px solid var(--elist-border-strong);
  box-shadow: 0 0 8px color-mix(in srgb, var(--elist-accent) 22%, transparent);
}

.event-card__tag--done {
  color: var(--elist-tag-done-color);
  background: var(--elist-tag-done-bg);
  border: 1px dashed var(--elist-tag-done-border);
}

.event-card__action {
  margin-left: auto;
  padding: 2px 12px;
  font-size: 12px;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.5;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    filter 0.2s ease;
}

.event-card__action--dispose {
  color: #fff;
  background: var(--elist-action-bg);
  border: 1px solid var(--elist-action-border);
}

.event-card__action--dispose:hover {
  filter: brightness(1.08);
}

.event-card__action--view {
  color: var(--elist-accent);
  background: var(--elist-action-view-bg);
  border: 1px solid var(--elist-action-view-border);
}

.event-card__action--view:hover {
  background: color-mix(in srgb, var(--elist-accent) 14%, var(--elist-action-view-bg));
  border-color: var(--elist-border-strong);
}

.event-card__row {
  font-size: 12px;
  color: #9aadc4;
  line-height: 1.65;
}

.event-card__row span {
  color: #6a8098;
}

.event-list__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  height: 36px;
  margin-top: auto;
  padding-top: 4px;
  border-top: 1px solid rgb(0 100 180 / 18%);
}

.page-btn,
.page-arrow {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: rgb(0 25 55 / 65%);
  color: #a8b8cc;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn--active {
  background: var(--elist-page-active);
  color: #fff;
  border-color: var(--elist-page-active-border);
}

.page-arrow {
  color: #8795b0;
  border-color: transparent;
  background: transparent;
}

.page-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-ellipsis {
  color: #8795b0;
  font-size: 13px;
}
</style>
