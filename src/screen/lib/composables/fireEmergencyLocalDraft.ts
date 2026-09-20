import type { EmergencyEventItem } from '@/services/emergencyEvent';

/**
 * 跨子应用共享的「手动新增事件」草稿存储。
 *
 * 背景：应急指挥（`fm-emergency`）里手动新增的事件只写进了前端内存，而「去处置」跳转到的
 * 事故救援页（`fm-rescue`）是**另一个 wujie 子应用**——各子应用是独立的 JS 实例，模块级
 * 内存 state 不共享，因此草稿在处置页取不到，刷新后也丢失。用同源 `sessionStorage`
 * 作为跨子应用 + 跨刷新的共享层，让草稿在两个子应用间、刷新后都仍可读到。
 *
 * 注意：这不是后端落库（后端尚无创建事件接口），仅用于前端闭环展示。同名 eventId 命中草稿
 * 时会优先于后端事件，避免与后端已有事件 id 撞车导致显示成别人的事件。
 */

const DRAFT_KEY_PREFIX = 'fe-draft-v1:';

export interface FireEmergencyLocalDraft {
  groupId: string;
  event: EmergencyEventItem;
}

/** 安全取用 sessionStorage：非浏览器环境（vitest node 环境 / SSR）返回 null。
 * useFireEmergencyEventList 在模块加载时会触发一次 load，进而回调本模块；
 * 若直接访问 sessionStorage 会在 node 测试环境抛 ReferenceError（unhandled rejection）。 */
function safeSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
}

export function saveFireEmergencyDraft(event: EmergencyEventItem, groupId: string): void {
  const storage = safeSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(DRAFT_KEY_PREFIX + event.id, JSON.stringify({ groupId, event }));
  } catch {
    // sessionStorage 不可用（隐私模式/超额）时静默降级为纯内存：跨子应用/刷新将丢失草稿
  }
}

export function loadFireEmergencyDraft(id: number | string): FireEmergencyLocalDraft | undefined {
  const storage = safeSessionStorage();
  if (!storage) return undefined;
  const raw = storage.getItem(DRAFT_KEY_PREFIX + id);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as FireEmergencyLocalDraft;
  } catch {
    return undefined;
  }
}

export function listFireEmergencyDrafts(): FireEmergencyLocalDraft[] {
  const out: FireEmergencyLocalDraft[] = [];
  const storage = safeSessionStorage();
  if (!storage) return out;
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
      const raw = storage.getItem(key);
      if (raw) {
        try {
          out.push(JSON.parse(raw) as FireEmergencyLocalDraft);
        } catch {
          // 忽略损坏条目
        }
      }
    }
  }
  return out;
}

export function draftGroupLabel(groupId: string): string {
  // 兼容旧格式（manual-drill / manual-event / manual-weather），新格式为 manual-${eventType}。
  const legacy: Record<string, string> = {
    'manual-drill': '演练事件',
    'manual-event': '突发应急事件',
    'manual-weather': '极端天气事件',
  };
  if (legacy[groupId]) return legacy[groupId];
  return groupId.startsWith('manual-') ? groupId.slice('manual-'.length) : groupId;
}
