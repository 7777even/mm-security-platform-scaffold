import { useRouter } from 'vue-router';
import type { EmergencyEventItem } from '@/services/map-data/preliminaryMock';
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
      name: 'fire-alarm-rescue',
      query: { eventId: String(eventId) },
    });
  }

  function goToDrillEmergencyDetail(eventId: number) {
    router.push({
      name: 'dashboard-rescue',
      query: { eventId: String(eventId) },
    });
  }

  function goToTyphoonEmergencyDetail(eventId: number) {
    router.push({
      name: 'extreme-weather-typhoon',
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
    router.push({ name: 'fire-alarm' });
  }

  return {
    goToAccidentRescue,
    goToDrillEmergencyDetail,
    goToTyphoonEmergencyDetail,
    goToEventDispose,
    goToEmergencyList,
  };
}
