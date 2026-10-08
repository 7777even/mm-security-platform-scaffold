<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import OverviewGridItem from '../../common/OverviewGridItem.vue';
import {
  fetchProductionOverview,
  type OverviewGridItem as OverviewGridItemType,
} from '@/services/production';
import { usePlantArea } from '../../../lib/composables/usePlantArea';
import type { OverviewItemAction } from '../../../lib/overviewItemAction';

const router = useRouter();
const { scaleAreaCount } = usePlantArea();

/** 重大危险源卡片 id，与后端 production 总览 facilities[].id 保持一致 */
const MAJOR_HAZARD_FACILITY_ID = 4;

/* 交互语义：设施卡点下去一律打开独立子应用页（生产区域详情 / 重大危险源清单），
   目标页自带「返回生产应急」入口。角标文案取自 lib/overviewItemAction.ts。 */
const FACILITY_ACTION: OverviewItemAction = 'navigate';

const facilityItems = ref<OverviewGridItemType[]>([]);

async function loadOverview() {
  try {
    const overview = await fetchProductionOverview();
    facilityItems.value = overview.facilities;
  } catch {
    facilityItems.value = [];
  }
}

// 生产设施总览随设备/报警变化（device / alarm / production.alarm）实时刷新
['device', 'alarm', 'production.alarm'].forEach((domain) =>
  useDomainAutoRefresh(domain, loadOverview, { immediate: false }),
);

onMounted(loadOverview);

function openFacility(facilityId: number) {
  if (facilityId === MAJOR_HAZARD_FACILITY_ID) {
    void router.push({ name: 'majorHazardList' });
    return;
  }
  void router.push({ name: 'productionArea', params: { facilityId: String(facilityId) } });
}
</script>

<template>
  <PanelCard title="生产设施总览" variant="facilities" module="production">
    <div class="overview-scroll">
      <div class="overview-grid">
        <button
          v-for="item in facilityItems"
          :key="item.id"
          type="button"
          class="overview-grid__btn"
          @click="openFacility(item.id)"
        >
          <OverviewGridItem
            :image="item.image"
            :name="item.name"
            :count="scaleAreaCount(item.count)"
            :action="FACILITY_ACTION"
          />
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 12px;
}

/*
 * 滚动容器必须是网格的**外层**（与「设备总览」的 .device-groups 同构）：
 * 若把 overflow-y 直接挂在 .overview-grid 上，滚动条会占掉网格 8px 宽度，
 * 导致本面板卡片比设备总览的窄一圈，反而制造新的「不统一」。
 */
.overview-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/*
 * 行高与「设备总览」共用 --overview-item-h（70px）。原写 1fr + align-content:stretch，
 * 5 张卡被压缩成实测 48.9px，与相邻设备总览的 70px 明显不一致；现固定行高，
 * 放不下时由外层滚动，卡片不再被压扁变形。
 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: var(--overview-item-h, 70px);
  gap: 12px;
  align-content: start;
}

.overview-grid__btn {
  height: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.overview-grid__btn :deep(.overview-item) {
  height: 100%;
}

/* 悬停态由 OverviewGridItem 统一提供，此处不再各写一份。 */
</style>
