<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import type { SpecialOperationRecord } from '@/services/specialOperation';

const props = defineProps<{
  item: SpecialOperationRecord;
}>();

const activeTab = ref<'basic' | 'video' | 'gas' | 'personnel'>('basic');

watch(
  () => props.item.id,
  () => {
    activeTab.value = 'basic';
  },
);

const tabs = computed(() => [
  { key: 'basic' as const, label: '基础信息' },
  { key: 'video' as const, label: `现场视频(${props.item.videoCount})` },
  { key: 'gas' as const, label: `气体监测(${props.item.gasMonitorCount})` },
  { key: 'personnel' as const, label: `人员定位(${props.item.personnelCount})` },
]);

const basicRows = computed(() => [
  { label: '作业单位', value: props.item.unit },
  { label: '作业申请单位', value: props.item.applyUnit },
  { label: '作业类型', value: props.item.type },
  { label: '作业日期', value: props.item.operationDate },
  { label: '作业地点', value: props.item.location },
  { label: '是否承包商作业', value: props.item.isContractor },
  { label: '危害识别类型', value: props.item.hazardType },
  { label: '负责人', value: props.item.leaderName },
  { label: '负责人联系方式', value: props.item.leaderPhone },
  { label: '作业位置', value: props.item.position },
  { label: '经纬度', value: `${props.item.longitude}, ${props.item.latitude}` },
  { label: '作业开始时间', value: props.item.startTime },
  { label: '作业结束时间', value: props.item.endTime },
  { label: '作业变更原因', value: props.item.changeReason },
  { label: '作业取消原因', value: props.item.cancelReason },
  { label: '监护人员姓名', value: props.item.guardianName },
  { label: '施工人员姓名', value: props.item.workers },
  { label: '作业票', value: props.item.permitNo, link: true },
  { label: '作业内容', value: props.item.content },
]);
</script>

<template>
  <PanelCard title="特殊作业详情" variant="rescue" :show-more="false">
    <div class="brigade-detail">
      <div class="brigade-detail__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="brigade-detail__tab"
          :class="{ 'brigade-detail__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'basic'" class="brigade-detail__content">
        <div v-for="row in basicRows" :key="row.label" class="detail-row">
          <span class="detail-row__label">{{ row.label }}</span>
          <span class="detail-row__value" :class="{ 'detail-row__value--link': row.link }">
            {{ row.value }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-row__label">作业附件</span>
          <span class="detail-row__value detail-row__value--links">
            <span class="detail-link">作业票照片</span>
            <span class="detail-link">人员资质照片</span>
          </span>
        </div>
      </div>

      <div v-else-if="activeTab === 'video'" class="brigade-detail__content">
        <div v-for="video in item.videos" :key="video.id" class="detail-card">
          <div class="detail-card__title">{{ video.name }}</div>
          <div class="detail-card__meta">位置：{{ video.location }}</div>
        </div>
      </div>

      <div v-else-if="activeTab === 'gas'" class="brigade-detail__content">
        <div v-for="point in item.gasPoints" :key="point.id" class="detail-card">
          <div class="detail-card__title">{{ point.name }}</div>
          <div class="detail-card__meta">读数：{{ point.value }}</div>
          <div class="detail-card__meta">状态：{{ point.status }}</div>
        </div>
      </div>

      <div v-else class="brigade-detail__content">
        <div v-for="person in item.personnel" :key="person.id" class="detail-card">
          <div class="detail-card__title">{{ person.name }}</div>
          <div class="detail-card__meta">岗位：{{ person.role }}</div>
          <div class="detail-card__meta">电话：{{ person.phone }}</div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.brigade-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.brigade-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.brigade-detail__tab {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-detail__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.brigade-detail__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 2px;
}

.detail-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
  padding: 2px 0;
}

.detail-row__label {
  font-size: 12px;
  color: var(--map-device-offline);
}

.detail-row__value {
  font-size: 12px;
  color: var(--color-text-strong);
  line-height: 1.4;
  word-break: break-word;
}

.detail-row__value--link {
  color: #4db8ff;
  text-decoration: underline;
}

.detail-row__value--links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-link {
  color: #4db8ff;
  cursor: pointer;
}

.detail-card {
  padding: 8px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
}

.detail-card__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.detail-card__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--map-device-offline);
}
</style>
