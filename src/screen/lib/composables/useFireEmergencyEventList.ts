import { computed, ref, watch } from 'vue';
import {
  fetchEmergencyEvents,
  createEmergencyEvent,
  deriveEventType,
  deriveKindCategory,
  type EmergencyEventCreateRequest,
  type EmergencyEventGroup,
  type EmergencyEventItem,
} from '@/services/emergencyEvent';
import type { FireEmergencyListTab } from './useFireEmergencyListTab';
import {
  REASON_CONTRACT_MISMATCH,
  backendUnavailableWarn,
  resolveOfflineFetch,
} from '@/services/backendFallback';
import { logger } from '@/utils/logger';
// 仅「离线演示」（VITE_USE_DEV_MOCK=true）回落用；live/offline 均不使用。
import { fireEmergencyDrillEventGroups, fireEmergencyEventGroups } from '../data/fireEmergencyMock';
import { selectFireEmergencyEvent } from './useFireEmergencyEventSelection';
import {
  fireEmergencyListTab,
  setFireEmergencyListTab,
  DEFAULT_FIRE_EMERGENCY_TAB,
} from './useFireEmergencyListTab';
import {
  PRELIMINARY_EVENT_CARD_SLOT,
  PRELIMINARY_GROUP_TITLE_SLOT,
} from './usePreliminaryEventList';
import { stagePercentStringToWorldPosition } from '@/utils/mapDesignGeo';
import { usePlantArea } from './usePlantArea';
import {
  saveFireEmergencyDraft,
  loadFireEmergencyDraft,
  listFireEmergencyDrafts,
  draftGroupLabel,
} from './fireEmergencyLocalDraft';

const { filterByPlantArea } = usePlantArea();

/** 新增事件入参的 discriminator 现为「事件类型」字符串（eventType）。 */
export type EmergencyEventCreateKind = string;

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

/** 确保每个事件都带 eventType：后端未返回时按 kind / eventCategory 推导，供侧栏按事件类型分类。 */
function withEventType(groups: EmergencyEventGroup[]): EmergencyEventGroup[] {
  return groups.map((group) => ({
    ...group,
    events: group.events.map((event) => ({
      ...event,
      eventType: event.eventType ?? deriveEventType(event.kind, event.eventCategory),
    })),
  }));
}

// 初始态为空：由 loadFireEmergencyEvents 按三态填充（live 拉后端 / demo 回落本地 fixture / offline 空态 + 报错）。
const fireEmergencyEventGroupsSnapshot = ref<EmergencyEventGroup[]>([]);
const fireEmergencyDrillEventGroupsSnapshot = ref<EmergencyEventGroup[]>([]);

export const fireEmergencyEventGroupsState = ref<EmergencyEventGroup[]>([]);
export const fireEmergencyDrillEventGroupsState = ref<EmergencyEventGroup[]>([]);

export const fireEmergencyAllEventGroups = computed<EmergencyEventGroup[]>(
  () => fireEmergencyEventGroupsState.value,
);

export const fireEmergencyEventsLoading = ref(false);
export const fireEmergencyEventsError = ref<unknown>(null);

/** 统一写入快照 + 可编辑状态（两者内容一致，快照用于 reset 还原）。 */
function applyFireEmergencyGroups(all: EmergencyEventGroup[]): void {
  const normalized = withEventType(all);
  fireEmergencyEventGroupsSnapshot.value = cloneEventGroups(normalized);
  fireEmergencyDrillEventGroupsSnapshot.value = cloneEventGroups(normalized);
  fireEmergencyEventGroupsState.value = cloneEventGroups(normalized);
  fireEmergencyDrillEventGroupsState.value = cloneEventGroups(normalized);
}

void loadFireEmergencyEvents();

async function loadFireEmergencyEvents(): Promise<void> {
  fireEmergencyEventsLoading.value = true;
  fireEmergencyEventsError.value = null;
  // 三态：live 拉后端；demo 回落本地 fixture；offline 显式报错（全局横幅）+ 空态，不回灌假数据。
  const fb = resolveOfflineFetch<{ events: EmergencyEventGroup[]; drills: EmergencyEventGroup[] }>(
    'emergencyEvent',
    '/emergency-events',
    { events: fireEmergencyEventGroups, drills: fireEmergencyDrillEventGroups },
    { events: [], drills: [] },
  );
  if (fb.mode !== 'live') {
    applyFireEmergencyGroups([...fb.value.events, ...fb.value.drills]);
    hydrateLocalDrafts();
    fireEmergencyEventsLoading.value = false;
    return;
  }
  try {
    const groups = await fetchEmergencyEvents('FIRE');
    if (!Array.isArray(groups)) {
      fireEmergencyEventsError.value = new Error('[fire-emergency] 后端未返回事件分组数组');
      backendUnavailableWarn('emergencyEvent', '/emergency-events', REASON_CONTRACT_MISMATCH);
      applyFireEmergencyGroups([]);
      return;
    }
    applyFireEmergencyGroups(groups);
    hydrateLocalDrafts();
  } catch (err) {
    fireEmergencyEventsError.value = err;
    backendUnavailableWarn('emergencyEvent', '/emergency-events');
    applyFireEmergencyGroups([]);
  } finally {
    fireEmergencyEventsLoading.value = false;
  }
}

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
  fireEmergencyListTab.value = DEFAULT_FIRE_EMERGENCY_TAB;
  fireEmergencyEventGroupsState.value = cloneEventGroups(fireEmergencyEventGroupsSnapshot.value);
  fireEmergencyDrillEventGroupsState.value = cloneEventGroups(
    fireEmergencyDrillEventGroupsSnapshot.value,
  );
  selectFireEmergencyEvent(null);
}

const typeFilteredGroups = computed(() => {
  const isDrillTab = fireEmergencyListTab.value === 'drill';
  return fireEmergencyAllEventGroups.value
    .map((group) => ({
      ...group,
      events: filterByPlantArea(group.events).filter(
        (event) => (event.kind ?? 'event') === (isDrillTab ? 'drill' : 'event'),
      ),
    }))
    .filter((group) => group.events.length > 0);
});

const filteredGroups = computed(() => {
  const q = fireEmergencyKeyword.value.trim().toLowerCase();
  const base = !q
    ? typeFilteredGroups.value
    : typeFilteredGroups.value
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

/** 将表单中无法单独映射到后端的字段（事件类型细分 / 上报人 / 电话 / 伤亡数）并入 description。 */
function composeEventDescription(payload: EmergencyEventCreatePayload): string {
  const parts: string[] = [];
  if (payload.eventType) parts.push(`事件类型：${payload.eventType}`);
  if (payload.reporter) parts.push(`上报人：${payload.reporter}`);
  if (payload.phone) parts.push(`联系电话：${payload.phone}`);
  const casualty = [
    payload.deathCount ? `死亡${payload.deathCount}` : '',
    payload.seriousInjuryCount ? `重伤${payload.seriousInjuryCount}` : '',
    payload.minorInjuryCount ? `轻伤${payload.minorInjuryCount}` : '',
  ]
    .filter(Boolean)
    .join('，');
  if (casualty) parts.push(`伤亡情况：${casualty}`);
  if (payload.description) parts.push(payload.description);
  return parts.length ? parts.join('；') : '暂无描述';
}

function upsertEventIntoGroup(
  groupsState: typeof fireEmergencyEventGroupsState,
  groupId: string,
  groupLabel: string,
  event: EmergencyEventItem,
): void {
  const groups = groupsState.value;
  const existing = groups.find((group) => group.id === groupId);
  if (existing) {
    existing.events.push(event);
  } else {
    groupsState.value = [{ id: groupId, label: groupLabel, events: [event] }, ...groups];
  }
}

/**
 * 新增应急事件。后端为主：先 POST /emergency-events 落库并拿回真实 id，使「去处置」可按 event_id
 * 定位到本事件（后端已同事务写入 fac_accident_incident，is_default=false，不再回退默认事件）。
 *
 * 成功后【不】写 sessionStorage 草稿——救援子应用（fm-rescue）在本地内存/草稿里找不到该事件时，
 * 会自然回落到后端 /accident/rescue-incident 聚合，从而拿到完整处置数据，而非前端的精简草稿。
 *
 * 弱网/离线兜底：后端不可达时回落本地草稿（sessionStorage 跨子应用 + 跨刷新共享），
 * 保证「新增事件」在处置页仍可被前端闭环展示（buildIncidentFromLocalEvent 走本地分支）。
 */
export async function createFireEmergencyEventFromForm(
  payload: EmergencyEventCreatePayload,
): Promise<EmergencyEventItem> {
  // 以表单所选「事件类型」为准，反推 kind / eventCategory / groupCode / groupLabel
  //（供路由跳转、前端分组与后端落库）。groupCode/groupLabel 来自 EMERGENCY_EVENT_TYPE_DEFS 登记表，
  // 与种子分组同码（phone/tank/facility/video/extreme-weather）时并入同一侧栏分组展示。
  const { kind, eventCategory, groupCode, groupLabel } = deriveKindCategory(payload.eventType);
  const isDrill = kind === 'drill';
  const isWeather = !isDrill && eventCategory === 'extremeWeather';
  const mapPos = defaultMapPercentForNewEvent();
  const world = stagePercentStringToWorldPosition(mapPos.left, mapPos.top);

  const groupsState = fireEmergencyEventGroupsState;

  const buildEvent = (id: number): EmergencyEventItem => ({
    id,
    title: payload.name || (isDrill ? '新增演练' : '新增事件'),
    location: locationFromPayload(payload),
    description: composeEventDescription(payload),
    time: formatDisplayTime(payload.occurTime),
    reported: false,
    status: 'pending',
    statusLabel: '未处置',
    left: mapPos.left,
    top: mapPos.top,
    longitude: world.longitude,
    latitude: world.latitude,
    kind,
    eventCategory,
    eventType: payload.eventType,
    weatherMeta: isWeather
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
  });

  try {
    const req: EmergencyEventCreateRequest = {
      scene: 'FIRE',
      kind,
      eventCategory,
      groupCode,
      groupLabel,
      title: payload.name || (isDrill ? '新增演练' : '新增事件'),
      location: locationFromPayload(payload),
      description: composeEventDescription(payload),
      eventTime: formatDisplayTime(payload.occurTime),
      hazardSourceLevel: isDrill ? undefined : payload.level,
      leftPercent: mapPos.left,
      topPercent: mapPos.top,
      longitude: world.longitude,
      latitude: world.latitude,
      ...(isWeather
        ? {
            weatherType: payload.weatherType,
            warningLevel: payload.warningLevel,
            affectedArea: payload.affectedArea,
            monitoringPeriod: payload.monitoringPeriod,
            weatherSource: payload.source,
            measures: payload.measures,
          }
        : {}),
    };
    const created = await createEmergencyEvent(req);
    const event = buildEvent(created.id);
    upsertEventIntoGroup(groupsState, groupCode, groupLabel, event);
    setFireEmergencyListTab(isDrill ? 'drill' : 'event');
    fireEmergencyCurrentPage.value = 1;
    selectFireEmergencyEvent(created.id);
    return event;
  } catch (err) {
    // 弱网/离线兜底：后端不可达时回落本地草稿。
    logger.warn('[fire-emergency] 后端落库失败，回落本地草稿', err);
    const id = nextFireEmergencyEventId();
    const event = buildEvent(id);
    upsertEventIntoGroup(groupsState, groupCode, groupLabel, event);
    saveFireEmergencyDraft(event, groupCode);
    setFireEmergencyListTab(isDrill ? 'drill' : 'event');
    fireEmergencyCurrentPage.value = 1;
    selectFireEmergencyEvent(id);
    return event;
  }
}

/** 按 id 在前端内存事件库（含手动新建的本地草稿）中查找事件。
 * isLocalDraft 标记该事件是否来自「手动新增」组（groupId 以 manual- 开头），
 * 即尚未落库、后端按 id 拉取不到的事件；处置页据此决定走前端内存展示而非调后端。 */
export interface FireEmergencyEventLookup {
  event: EmergencyEventItem;
  isLocalDraft: boolean;
}

export function getFireEmergencyEventById(id: number): FireEmergencyEventLookup | undefined {
  // 1) 同子应用内存中命中本地草稿（最快路径）
  for (const group of fireEmergencyAllEventGroups.value) {
    const found = group.events.find((e) => e.id === id);
    if (found && group.id.startsWith('manual-')) {
      return { event: found, isLocalDraft: true };
    }
  }
  // 2) 跨子应用草稿（sessionStorage 共享，覆盖刷新 / 子应用边界）：
  //    手动新增事件仅存前端，且与后端事件可能 id 撞车，必须优先于后端事件命中，
  //    否则会显示成后端里同 id 的别人的事件。
  const draft = loadFireEmergencyDraft(id);
  if (draft) {
    return { event: draft.event, isLocalDraft: true };
  }
  // 3) 内存中的后端真实事件（非本地草稿）
  for (const group of fireEmergencyAllEventGroups.value) {
    const found = group.events.find((e) => e.id === id);
    if (found) {
      return { event: found, isLocalDraft: false };
    }
  }
  return undefined;
}

/** 将 sessionStorage 中的本地草稿合并回列表状态，使刷新后列表仍展示手动新增事件。
 * 仅在 loadFireEmergencyEvents 用后端数据填充状态后调用，不覆盖后端事件。 */
function hydrateLocalDrafts(): void {
  const drafts = listFireEmergencyDrafts();
  if (!drafts.length) return;
  const groups = [...fireEmergencyEventGroupsState.value];
  const index = new Map(groups.map((g) => [g.id, g]));
  for (const { groupId, event } of drafts) {
    const group = index.get(groupId);
    if (group) {
      if (!group.events.some((e) => e.id === event.id)) {
        group.events.push(event);
      }
    } else {
      const ng = { id: groupId, label: draftGroupLabel(groupId), events: [event] };
      groups.unshift(ng);
      index.set(groupId, ng);
    }
  }
  fireEmergencyEventGroupsState.value = groups;
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
