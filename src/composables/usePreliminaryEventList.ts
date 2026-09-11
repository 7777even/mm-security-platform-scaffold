import { computed, ref, watch } from 'vue';
import {
  loadPreliminaryEvents,
  type EmergencyEventGroup,
  type EmergencyEventItem,
} from '@/services/map-data/preliminaryMock';
import { selectPreliminaryEvent } from './usePreliminaryEventSelection';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

// 先期处置事件：初始为空，模块加载/刷新时按三态拉取（live 后端 / demo 本地 fixture / offline 空态 + 告警）。
const preliminaryGroups = ref<EmergencyEventGroup[]>([]);

export function refreshPreliminaryEvents() {
  void loadPreliminaryEvents('PRELIMINARY').then((groups) => {
    preliminaryGroups.value = groups;
  });
}

export const PRELIMINARY_EVENT_CARD_SLOT = 114;
export const PRELIMINARY_GROUP_TITLE_SLOT = 26;

export const preliminaryKeyword = ref('');
export const preliminaryCurrentPage = ref(1);
export const preliminaryPageSize = ref(5);

export function setPreliminaryPageSize(size: number) {
  const next = Math.max(1, Math.floor(size));
  if (preliminaryPageSize.value !== next) {
    preliminaryPageSize.value = next;
  }
}

export function estimatePreliminaryPageSize(listHeight: number) {
  if (listHeight <= 0) return 1;
  return Math.max(
    1,
    Math.floor((listHeight - PRELIMINARY_GROUP_TITLE_SLOT) / PRELIMINARY_EVENT_CARD_SLOT),
  );
}

export function resetPreliminaryEventList() {
  preliminaryKeyword.value = '';
  preliminaryCurrentPage.value = 1;
  selectPreliminaryEvent(null);
}

const filteredGroups = computed(() => {
  const q = preliminaryKeyword.value.trim().toLowerCase();
  const areaGroups = preliminaryGroups.value
    .map((group) => ({
      ...group,
      events: filterByPlantArea(group.events),
    }))
    .filter((group) => group.events.length > 0);
  if (!q) return areaGroups;

  return areaGroups
    .map((group) => ({
      ...group,
      events: group.events.filter(
        (event) =>
          event.title.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          group.label.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.events.length > 0);
});

const flatFilteredEvents = computed(() =>
  filteredGroups.value.flatMap((group) => group.events.map((event) => ({ group, event }))),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(flatFilteredEvents.value.length / preliminaryPageSize.value)),
);

const pageSlice = computed(() => {
  const start = (preliminaryCurrentPage.value - 1) * preliminaryPageSize.value;
  return flatFilteredEvents.value.slice(start, start + preliminaryPageSize.value);
});

export const preliminaryPagedEvents = computed<EmergencyEventItem[]>(() =>
  pageSlice.value.map(({ event }) => event),
);

export const preliminaryPagedGroups = computed<EmergencyEventGroup[]>(() => {
  const groupMap = new Map<string, EmergencyEventGroup>();

  for (const { group, event } of pageSlice.value) {
    const existing = groupMap.get(group.id);
    if (existing) {
      existing.events.push(event);
    } else {
      groupMap.set(group.id, {
        id: group.id,
        label: group.label,
        events: [event],
      });
    }
  }

  return Array.from(groupMap.values());
});

export const preliminaryTotalPages = totalPages;

export const preliminaryVisiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  return [1, 2, 3, 4, 5];
});

watch([preliminaryPageSize, flatFilteredEvents], () => {
  if (preliminaryCurrentPage.value > totalPages.value) {
    preliminaryCurrentPage.value = totalPages.value;
  }
});

export function goToPreliminaryPage(page: number) {
  const next = Math.min(Math.max(1, page), totalPages.value);
  if (preliminaryCurrentPage.value !== next) {
    preliminaryCurrentPage.value = next;
    selectPreliminaryEvent(null);
  }
}

export function searchPreliminaryEvents() {
  preliminaryCurrentPage.value = 1;
  selectPreliminaryEvent(null);
}

export function resetPreliminarySearch() {
  resetPreliminaryEventList();
}

// 配置后端时模块加载即拉取一次真实数据（无后端为 no-op，保持本地 fixture）。
refreshPreliminaryEvents();
