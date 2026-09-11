import { computed, ref, watch } from 'vue';
import {
  loadFireEmergencyEventGroups,
  type EmergencyEventGroup,
  type EmergencyEventItem,
} from '@/services/map-data/fireEmergencyMock';
import { selectFireEmergencyEvent } from './useFireEmergencyEventSelection';
import {
  fireEmergencyListTab,
  setFireEmergencyListTab,
  type FireEmergencyListTab,
} from './useFireEmergencyListTab';
import {
  PRELIMINARY_EVENT_CARD_SLOT,
  PRELIMINARY_GROUP_TITLE_SLOT,
} from './usePreliminaryEventList';
import { stagePercentStringToWorldPosition } from '@/utils/mapDesignGeo';
import { usePlantArea } from './usePlantArea';

const { filterByPlantArea } = usePlantArea();

export type EmergencyEventCreateKind = FireEmergencyListTab;

export interface EmergencyEventCreatePayload {
  kind: EmergencyEventCreateKind;
  eventCategory: 'default' | 'extremeWeather';
  name: string;
  level: string;
  occurTime: string;
  eventType: string;
  description: string;
  device: string;
  chemical: string;
  source: string;
  reporter: string;
  receiver: string;
  phone: string;
  deathCount: string;
  seriousInjuryCount: string;
  minorInjuryCount: string;
  measures: string;
  weatherType: string;
  warningLevel: string;
  affectedArea: string;
  monitoringPeriod: string;
}

function cloneEventGroups(groups: EmergencyEventGroup[]): EmergencyEventGroup[] {
  return groups.map((group) => ({
    ...group,
    events: group.events.map((event) => ({ ...event })),
  }));
}

// 初始态为空：由 refreshFireEmergencyEventGroups 按三态填充（live 后端 / demo 本地 fixture / offline 空态）。
// 快照记录最近一次生效的数据，供 reset 还原（而非回退到本地 fixture）。
let fireEmergencyEventGroupsSnapshot: EmergencyEventGroup[] = [];
let fireEmergencyDrillEventGroupsSnapshot: EmergencyEventGroup[] = [];

export const fireEmergencyEventGroupsState = ref<EmergencyEventGroup[]>([]);
export const fireEmergencyDrillEventGroupsState = ref<EmergencyEventGroup[]>([]);

export const fireEmergencyAllEventGroups = computed<EmergencyEventGroup[]>(() => [
  ...fireEmergencyEventGroupsState.value,
  ...fireEmergencyDrillEventGroupsState.value,
]);

export const fireEmergencyKeyword = ref('');
export const fireEmergencyCurrentPage = ref(1);
export const fireEmergencyPageSize = ref(5);

interface FireEmergencyListRestoreSnapshot {
  kind: FireEmergencyListTab;
  page: number;
  eventId?: number;
}

/** 进入详情前记录列表 tab / 分页 / 事件，供返回时恢复 */
const fireEmergencyListRestoreSnapshot = ref<FireEmergencyListRestoreSnapshot | null>(null);

/** 列表区域高度变化后待恢复的分页 */
export const fireEmergencyPendingListPage = ref<number | null>(null);

export function rememberFireEmergencyListForReturn(event: EmergencyEventItem) {
  fireEmergencyListRestoreSnapshot.value = {
    kind: (event.kind ?? 'event') as FireEmergencyListTab,
    page: fireEmergencyCurrentPage.value,
    eventId: event.id,
  };
}

export function setFireEmergencyPageSize(size: number) {
  const next = Math.max(1, Math.floor(size));
  if (fireEmergencyPageSize.value !== next) {
    fireEmergencyPageSize.value = next;
  }
}

export function estimateFireEmergencyPageSize(listHeight: number) {
  if (listHeight <= 0) return 1;
  return Math.max(
    1,
    Math.floor((listHeight - PRELIMINARY_GROUP_TITLE_SLOT) / PRELIMINARY_EVENT_CARD_SLOT),
  );
}

export function resetFireEmergencyEventList() {
  fireEmergencyKeyword.value = '';
  fireEmergencyCurrentPage.value = 1;
  fireEmergencyListTab.value = 'event';
  fireEmergencyEventGroupsState.value = cloneEventGroups(fireEmergencyEventGroupsSnapshot);
  fireEmergencyDrillEventGroupsState.value = cloneEventGroups(
    fireEmergencyDrillEventGroupsSnapshot,
  );
  selectFireEmergencyEvent(null);
}

/** 统一写入快照 + 可编辑状态（两者内容一致，快照用于 reset 还原）。 */
function applyFireEmergencyGroups(
  events: EmergencyEventGroup[],
  drills: EmergencyEventGroup[],
): void {
  fireEmergencyEventGroupsSnapshot = cloneEventGroups(events);
  fireEmergencyDrillEventGroupsSnapshot = cloneEventGroups(drills);
  fireEmergencyEventGroupsState.value = cloneEventGroups(events);
  fireEmergencyDrillEventGroupsState.value = cloneEventGroups(drills);
}

/** 按三态拉取消防应急事件/演练分组（live 后端 / demo 本地 fixture / offline 空态 + 告警）。 */
export function refreshFireEmergencyEventGroups() {
  void loadFireEmergencyEventGroups().then(({ events, drills }) => {
    applyFireEmergencyGroups(events, drills);
  });
}

const kindFilteredGroups = computed(() => {
  const kind = fireEmergencyListTab.value;
  return fireEmergencyAllEventGroups.value
    .map((group) => ({
      ...group,
      events: filterByPlantArea(group.events).filter((event) => (event.kind ?? 'event') === kind),
    }))
    .filter((group) => group.events.length > 0);
});

const filteredGroups = computed(() => {
  const q = fireEmergencyKeyword.value.trim().toLowerCase();
  const base = !q
    ? kindFilteredGroups.value
    : kindFilteredGroups.value
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

  return sortFireEmergencyGroups(base);
});

function parseEventTime(time: string): number {
  const normalized = time.trim().replace(' ', 'T');
  const ts = Date.parse(normalized);
  return Number.isNaN(ts) ? 0 : ts;
}

function sortEventsByTimeDesc(events: EmergencyEventItem[]): EmergencyEventItem[] {
  return [...events].sort((a, b) => parseEventTime(b.time) - parseEventTime(a.time));
}

function sortFireEmergencyGroups(groups: EmergencyEventGroup[]): EmergencyEventGroup[] {
  return [...groups]
    .map((group) => ({
      ...group,
      events: sortEventsByTimeDesc(group.events),
    }))
    .sort((groupA, groupB) => {
      const latestA = groupA.events[0] ? parseEventTime(groupA.events[0].time) : 0;
      const latestB = groupB.events[0] ? parseEventTime(groupB.events[0].time) : 0;
      return latestB - latestA;
    });
}

const flatFilteredEvents = computed(() => {
  const items = filteredGroups.value.flatMap((group) =>
    group.events.map((event) => ({ group, event })),
  );
  return items.sort((a, b) => parseEventTime(b.event.time) - parseEventTime(a.event.time));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(flatFilteredEvents.value.length / fireEmergencyPageSize.value)),
);

const pageSlice = computed(() => {
  const start = (fireEmergencyCurrentPage.value - 1) * fireEmergencyPageSize.value;
  return flatFilteredEvents.value.slice(start, start + fireEmergencyPageSize.value);
});

export const fireEmergencyPagedEvents = computed<EmergencyEventItem[]>(() =>
  pageSlice.value.map(({ event }) => event),
);

export const fireEmergencyPagedGroups = computed<EmergencyEventGroup[]>(() => {
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

export const fireEmergencyTotalPages = totalPages;

export const fireEmergencyVisiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  return [1, 2, 3, 4, 5];
});

function nextFireEmergencyEventId() {
  const all = fireEmergencyAllEventGroups.value.flatMap((group) => group.events);
  return all.reduce((max, event) => Math.max(max, event.id), 0) + 1;
}

function defaultMapPercentForNewEvent() {
  const jitter = Math.random() * 8 - 4;
  const left = 48 + jitter;
  const top = 36 + jitter * 0.6;
  return {
    left: `${left.toFixed(1)}%`,
    top: `${top.toFixed(1)}%`,
  };
}

function formatDisplayTime(occurTime: string) {
  if (!occurTime) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  const parsed = new Date(occurTime);
  if (Number.isNaN(parsed.getTime())) return occurTime;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
}

function locationFromPayload(payload: EmergencyEventCreatePayload) {
  if (payload.eventCategory === 'extremeWeather') return payload.affectedArea || '全厂区';
  const parts = [payload.device, payload.chemical].filter(Boolean);
  return parts.length ? parts.join('-') : '厂区待标注';
}

export function createFireEmergencyEventFromForm(payload: EmergencyEventCreatePayload) {
  const isDrill = payload.kind === 'drill';
  const mapPos = defaultMapPercentForNewEvent();
  const world = stagePercentStringToWorldPosition(mapPos.left, mapPos.top);
  const id = nextFireEmergencyEventId();

  const event: EmergencyEventItem = {
    id,
    title: payload.name || (isDrill ? '新增演练' : '新增事件'),
    location: locationFromPayload(payload),
    description: payload.description,
    time: formatDisplayTime(payload.occurTime),
    reported: false,
    status: 'pending',
    statusLabel: '未处置',
    left: mapPos.left,
    top: mapPos.top,
    longitude: world.longitude,
    latitude: world.latitude,
    kind: payload.kind,
    eventCategory: payload.kind === 'event' ? payload.eventCategory : 'default',
    weatherMeta:
      payload.kind === 'event' && payload.eventCategory === 'extremeWeather'
        ? {
            weatherType: payload.weatherType,
            warningLevel: payload.warningLevel,
            affectedArea: payload.affectedArea,
            monitoringPeriod: payload.monitoringPeriod,
            source: payload.source,
            measures: payload.measures,
          }
        : undefined,
    hazardSourceLevel: isDrill ? undefined : payload.level,
  };

  const isWeather = !isDrill && payload.eventCategory === 'extremeWeather';
  const groupId = isDrill ? 'manual-drill' : isWeather ? 'manual-weather' : 'manual-event';
  const groupLabel = isDrill ? '手动新增演练' : isWeather ? '极端天气' : '手动新增';
  const groupsState = isDrill ? fireEmergencyDrillEventGroupsState : fireEmergencyEventGroupsState;

  const groups = groupsState.value;
  const existing = groups.find((group) => group.id === groupId);
  if (existing) {
    existing.events.push(event);
  } else {
    groupsState.value = [{ id: groupId, label: groupLabel, events: [event] }, ...groups];
  }

  setFireEmergencyListTab(payload.kind);
  fireEmergencyCurrentPage.value = 1;
  selectFireEmergencyEvent(id);
  return event;
}

watch(fireEmergencyListTab, () => {
  fireEmergencyCurrentPage.value = 1;
  selectFireEmergencyEvent(null);
});

watch([fireEmergencyPageSize, flatFilteredEvents], () => {
  if (fireEmergencyCurrentPage.value > totalPages.value) {
    fireEmergencyCurrentPage.value = totalPages.value;
  }
});

export function goToFireEmergencyPage(page: number) {
  const next = Math.min(Math.max(1, page), totalPages.value);
  if (fireEmergencyCurrentPage.value !== next) {
    fireEmergencyCurrentPage.value = next;
    selectFireEmergencyEvent(null);
  }
}

export function searchFireEmergencyEvents() {
  fireEmergencyCurrentPage.value = 1;
  selectFireEmergencyEvent(null);
}

export function resetFireEmergencySearch() {
  resetFireEmergencyEventList();
}

/** 从详情页返回时恢复应急指挥列表 tab、分页与选中项 */
export function restoreFireEmergencyListView(kind: FireEmergencyListTab, eventId?: number) {
  setFireEmergencyListTab(kind);

  const snapshot = fireEmergencyListRestoreSnapshot.value;
  let targetPage = 1;
  let targetEventId: number | null = null;

  if (snapshot && snapshot.kind === kind) {
    targetPage = Math.max(1, snapshot.page);
    targetEventId = snapshot.eventId ?? null;
    fireEmergencyListRestoreSnapshot.value = null;
  } else if (eventId) {
    const events = sortEventsByTimeDesc(
      fireEmergencyAllEventGroups.value
        .flatMap((group) => group.events)
        .filter((event) => (event.kind ?? 'event') === kind),
    );
    const index = events.findIndex((event) => event.id === eventId);

    if (index >= 0) {
      const pageSize = Math.max(1, fireEmergencyPageSize.value);
      targetPage = Math.floor(index / pageSize) + 1;
      targetEventId = eventId;
    }
  }

  fireEmergencyPendingListPage.value = targetPage;
  fireEmergencyCurrentPage.value = Math.min(Math.max(1, targetPage), totalPages.value);

  if (targetEventId) {
    selectFireEmergencyEvent(targetEventId);
  } else if (eventId) {
    selectFireEmergencyEvent(eventId);
  } else {
    selectFireEmergencyEvent(null);
  }
}

/** 列表高度重算分页容量后，再次应用待恢复页码 */
export function applyPendingFireEmergencyListPage() {
  const pending = fireEmergencyPendingListPage.value;
  if (pending === null) return;

  const next = Math.min(Math.max(1, pending), totalPages.value);
  if (fireEmergencyCurrentPage.value !== next) {
    fireEmergencyCurrentPage.value = next;
  }
  fireEmergencyPendingListPage.value = null;
}

// 配置后端时模块加载即拉取一次真实数据（无后端为 no-op，保持本地 fixture）。
refreshFireEmergencyEventGroups();
