import { computed } from 'vue';
import { fireBrigadeViewActive } from './useFireBrigadeView';
import { rescueEquipmentViewActive } from './useRescueEquipmentView';
import { rescuePersonnelViewActive } from './useRescuePersonnelView';
import { rescueVehicleViewActive } from './useRescueVehicleView';
import { specialOperationViewActive } from './useSpecialOperationView';

export const rescueDrawerActive = computed(
  () =>
    fireBrigadeViewActive.value ||
    rescueEquipmentViewActive.value ||
    rescuePersonnelViewActive.value ||
    rescueVehicleViewActive.value ||
    specialOperationViewActive.value,
);
