import { useRouter } from 'vue-router';
import type { EmergencyEventItem } from '../data/preliminaryMock';
import { accidentRescueFlyTarget } from './sharedCesiumBridge';
import {
  restoreFireEmergencyListView,
  rememberFireEmergencyListForReturn,
  type EmergencyEventCreateKind,
} from './useFireEmergencyEventList';

export type EventDisposeNavMode = 'push' | 'replace';

export function useAccidentRescueNavigation() {
  const router = useRouter();

  function goToAccidentRescue(eventId: number, mode: EventDisposeNavMode = 'push') {
    const navigate = mode === 'replace' ? router.replace : router.push;
    navigate({
      name: 'fireAccidentRescue',
      query: { eventId: String(eventId) },
    });
  }

  function goToDrillEmergencyDetail(eventId: number, mode: EventDisposeNavMode = 'push') {
    const navigate = mode === 'replace' ? router.replace : router.push;
    navigate({
      name: 'drillEmergencyDetail',
      query: { eventId: String(eventId) },
    });
  }

  function goToTyphoonEmergencyDetail(eventId: number, mode: EventDisposeNavMode = 'push') {
    const navigate = mode === 'replace' ? router.replace : router.push;
    navigate({
      name: 'typhoonEmergencyDetail',
      query: { eventId: String(eventId) },
    });
  }

  /**
   * 事件处置跳转。mode='replace' 用于「带 ?create=event 进入后提交」的场景：
   * 直接以 replace 直达处置页，把 /emergency?create=event 历史记录整体换成目标页，
   * 后退不会重放参数再次弹窗；也避免「先清参数再 push」两次导航在 shell 侧竞争。
   */
  function goToEventDispose(event: EmergencyEventItem, mode: EventDisposeNavMode = 'push') {
    rememberFireEmergencyListForReturn(event);
    accidentRescueFlyTarget.value = {
      longitude: event.longitude,
      latitude: event.latitude,
    };
    if (event.kind === 'drill') {
      goToDrillEmergencyDetail(event.id, mode);
      return;
    }
    if (event.eventCategory === 'extremeWeather') {
      goToTyphoonEmergencyDetail(event.id, mode);
      return;
    }
    goToAccidentRescue(event.id, mode);
  }

  function goToEmergencyList(kind: EmergencyEventCreateKind, eventId?: number) {
    restoreFireEmergencyListView(kind, eventId);
    router.push({ name: 'emergency' });
  }

  return {
    goToAccidentRescue,
    goToDrillEmergencyDetail,
    goToTyphoonEmergencyDetail,
    goToEventDispose,
    goToEmergencyList,
  };
}
