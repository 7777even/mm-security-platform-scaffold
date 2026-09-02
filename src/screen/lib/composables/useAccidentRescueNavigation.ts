import { useRouter } from 'vue-router';
import type { EmergencyEventItem } from '../data/preliminaryMock';
import { accidentRescueFlyTarget } from './sharedCesiumBridge';
import {
  restoreFireEmergencyListView,
  rememberFireEmergencyListForReturn,
  type EmergencyEventCreateKind,
} from './useFireEmergencyEventList';

export function useAccidentRescueNavigation() {
  const router = useRouter();

  function goToAccidentRescue(eventId: number) {
    router.push({
      name: 'fireAccidentRescue',
      query: { eventId: String(eventId) },
    });
  }

  function goToDrillEmergencyDetail(eventId: number) {
    router.push({
      name: 'drillEmergencyDetail',
      query: { eventId: String(eventId) },
    });
  }

  function goToTyphoonEmergencyDetail(eventId: number) {
    router.push({
      name: 'typhoonEmergencyDetail',
      query: { eventId: String(eventId) },
    });
  }

  function goToEventDispose(event: EmergencyEventItem) {
    rememberFireEmergencyListForReturn(event);
    accidentRescueFlyTarget.value = {
      longitude: event.longitude,
      latitude: event.latitude,
    };
    if (event.kind === 'drill') {
      goToDrillEmergencyDetail(event.id);
      return;
    }
    if (event.eventCategory === 'extremeWeather') {
      goToTyphoonEmergencyDetail(event.id);
      return;
    }
    goToAccidentRescue(event.id);
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
