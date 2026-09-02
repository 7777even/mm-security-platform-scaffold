import { computed, ref } from 'vue';
import {
  getPlantAreaDefinition,
  plantAreaDefinitions,
  resolvePlantAreaCode,
  type ConcretePlantAreaCode,
  type PlantAreaCode,
} from '../data/plantAreas';

const selectedPlantArea = ref<PlantAreaCode>('refinery');

export function usePlantArea() {
  const selectedPlantAreaDefinition = computed(() =>
    getPlantAreaDefinition(selectedPlantArea.value),
  );

  function setSelectedPlantArea(code: PlantAreaCode) {
    selectedPlantArea.value = code;
  }

  function matchesPlantArea(
    item: { areaCode?: ConcretePlantAreaCode; id?: string | number } | undefined,
    index = 0,
  ) {
    return (
      selectedPlantArea.value === 'all' ||
      resolvePlantAreaCode(item, index) === selectedPlantArea.value
    );
  }

  function filterByPlantArea<T extends object>(items: T[]) {
    if (selectedPlantArea.value === 'all') return items;
    return items.filter((item, index) =>
      matchesPlantArea(item as Parameters<typeof matchesPlantArea>[0], index),
    );
  }

  function areaScopedItems<T extends object>(items: T[]) {
    return computed(() => filterByPlantArea(items));
  }

  function scaleAreaCount(value: number) {
    if (selectedPlantArea.value === 'all') return value;
    const ratio: Record<ConcretePlantAreaCode, number> = {
      refinery: 0.46,
      chemical: 0.34,
      port: 0.2,
    };
    return Math.max(value > 0 ? 1 : 0, Math.round(value * ratio[selectedPlantArea.value]));
  }

  return {
    plantAreaOptions: plantAreaDefinitions,
    selectedPlantArea,
    selectedPlantAreaDefinition,
    setSelectedPlantArea,
    matchesPlantArea,
    filterByPlantArea,
    areaScopedItems,
    scaleAreaCount,
  };
}
