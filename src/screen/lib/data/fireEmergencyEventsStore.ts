import { fireEmergencyAllEventGroups } from '../composables/useFireEmergencyEventList';
import type { EmergencyEventItem } from './preliminaryMock';

export function findFireEmergencyEventById(eventId?: number): EmergencyEventItem | undefined {
  const events = fireEmergencyAllEventGroups.value.flatMap((group) => group.events);
  if (!eventId) return events[0];
  return events.find((event) => event.id === eventId);
}
