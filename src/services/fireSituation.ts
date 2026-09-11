import { request } from '@/services/http';
import { backendUnavailableWarn, REASON_CONTRACT_MISMATCH } from '@/services/backendFallback';

// 消防态势地图聚合点位接口，对齐 docs/api/fire-situation.openapi.json。
// 取代 fireSituationMapMock 中的业务数据（事件/处置/告警聚合点位）。

export type FireSituationMarkerKind = 'event' | 'operation' | 'alarm';

export interface FireSituationMarkerItem {
  id: string;
  kind: FireSituationMarkerKind;
  title: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  important: boolean;
  iconUrl: string;
  level?: string;
  targetId: number;
}

export interface FireSituationMarkerSummary {
  items: FireSituationMarkerItem[];
}

/** 后端不可用时的空态（绝不回灌假数据）。 */
const EMPTY_MARKERS: FireSituationMarkerSummary = { items: [] };

/** 消防态势地图聚合点位：事件/处置/告警三类点位。 */
export async function fetchFireSituationMarkers(): Promise<FireSituationMarkerSummary> {
  try {
    const data = await request<FireSituationMarkerSummary>({
      url: '/fire-situation/markers',
      method: 'GET',
    });
    if (!data || !Array.isArray(data.items)) {
      backendUnavailableWarn('fire-situation', '/fire-situation/markers', REASON_CONTRACT_MISMATCH);
      return EMPTY_MARKERS;
    }
    return data;
  } catch {
    backendUnavailableWarn('fire-situation', '/fire-situation/markers');
    return EMPTY_MARKERS;
  }
}
