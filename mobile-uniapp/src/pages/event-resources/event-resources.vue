<script setup lang="ts">
import { ref } from 'vue';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

interface ResourceItem {
  id: string;
  name: string;
  detail: string;
  phone: string;
  tileName: string;
  tone:
    | 'red'
    | 'orange'
    | 'blue'
    | 'green'
    | 'teal'
    | 'cyan'
    | 'indigo'
    | 'amber'
    | 'purple'
    | 'navy'
    | 'slate';
}

// 纯前端静态资源（无后端）。事件现场可用力量占位示例。
const vehicles = ref<ResourceItem[]>([
  {
    id: 'v1',
    name: '应急指挥车',
    detail: '车牌 沪A·0001 · 现场调度',
    phone: '13800000001',
    tileName: 'vehicle',
    tone: 'blue',
  },
  {
    id: 'v2',
    name: '泡沫消防车',
    detail: '车牌 沪A·F002 · 载液 6T',
    phone: '13800000002',
    tileName: 'fire',
    tone: 'red',
  },
]);
const equipment = ref<ResourceItem[]>([
  {
    id: 'e1',
    name: '移动抽水泵',
    detail: '流量 100m³/h · 2 台',
    phone: '13800000003',
    tileName: 'tool',
    tone: 'teal',
  },
  {
    id: 'e2',
    name: '正压呼吸器',
    detail: ' SCBA · 6 套',
    phone: '13800000004',
    tileName: 'mask',
    tone: 'orange',
  },
]);
const waterSources = ref<ResourceItem[]>([
  {
    id: 'w1',
    name: '厂区消防水池',
    detail: '容量 500m³ · 东门',
    phone: '13800000005',
    tileName: 'water',
    tone: 'cyan',
  },
  {
    id: 'w2',
    name: '市政消火栓',
    detail: ' DN150 · 主干道 12 号',
    phone: '13800000006',
    tileName: 'hydrant',
    tone: 'indigo',
  },
]);

function call(phone: string): void {
  uni.makePhoneCall({ phoneNumber: phone });
}
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="事件资源" subtitle="现场可用力量" />

    <view class="mb-stack">
      <text class="mb-block__title">车辆</text>
      <view v-for="v in vehicles" :key="v.id" class="mb-card">
        <view class="mb-card__head">
          <IconTile :name="v.tileName" :tone="v.tone" />
          <view class="mb-card__headtext">
            <text class="mb-card__title">{{ v.name }}</text>
            <text class="mb-card__desc">{{ v.detail }}</text>
          </view>
        </view>
        <button type="button" class="mb-btn-call" @click="call(v.phone)">一键拨打</button>
      </view>

      <text class="mb-block__title">器材</text>
      <view v-for="e in equipment" :key="e.id" class="mb-card">
        <view class="mb-card__head">
          <IconTile :name="e.tileName" :tone="e.tone" />
          <view class="mb-card__headtext">
            <text class="mb-card__title">{{ e.name }}</text>
            <text class="mb-card__desc">{{ e.detail }}</text>
          </view>
        </view>
        <button type="button" class="mb-btn-call" @click="call(e.phone)">一键拨打</button>
      </view>

      <text class="mb-block__title">水源</text>
      <view v-for="w in waterSources" :key="w.id" class="mb-card">
        <view class="mb-card__head">
          <IconTile :name="w.tileName" :tone="w.tone" />
          <view class="mb-card__headtext">
            <text class="mb-card__title">{{ w.name }}</text>
            <text class="mb-card__desc">{{ w.detail }}</text>
          </view>
        </view>
        <button type="button" class="mb-btn-call" @click="call(w.phone)">一键拨打</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md) var(--mb-pad-x);
}

.mb-block__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
  margin-top: var(--space-sm);
}

.mb-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--card-mobile);
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-card);
}

.mb-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.mb-card__headtext {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}

.mb-card__title {
  font-size: var(--mb-fz-form-label);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.mb-card__desc {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
}

.mb-btn-call {
  flex-shrink: 0;
  min-width: 132rpx;
  min-height: 64rpx;
  padding: 0 var(--space-md);
  background: var(--primary-mobile);
  color: #fff;
  border: none;
  border-radius: var(--mb-radius-ctrl);
  font-size: var(--mb-fz-help);
}
</style>
