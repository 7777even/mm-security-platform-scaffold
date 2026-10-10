<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchEmergencyPhones } from '@/platform/api';
import { go } from '@/platform/nav';
import MobileHeader from '@/components/MobileHeader.vue';
import Icon from '@/components/Icon.vue';

const list = ref<any[]>([]);
const loading = ref(true);
const keyword = ref('');

const groups = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  const filtered = list.value.filter((e) => {
    if (!kw) return true;
    return (
      (e.name ?? '').toLowerCase().includes(kw) ||
      (e.number ?? '').toLowerCase().includes(kw) ||
      (e.category ?? '').toLowerCase().includes(kw)
    );
  });
  const map = new Map<string, any[]>();
  for (const e of filtered) {
    const cat = e.category || '其他';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(e);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
});

async function load() {
  loading.value = true;
  try {
    list.value = await fetchEmergencyPhones();
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function call(number: string) {
  uni.makePhoneCall({ phoneNumber: String(number) });
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="应急通讯录" subtitle="遇险一键拨打" />
    <view class="mb-search">
      <Icon name="search" />
      <input
        v-model="keyword"
        class="mb-search__input"
        type="text"
        placeholder="搜索名称 / 号码 / 分类"
        confirm-type="search"
      />
    </view>

    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="groups.length === 0" class="mb-state">暂无通讯录数据</view>

    <view v-else class="mb-list">
      <view v-for="g in groups" :key="g.category" class="mb-group">
        <view class="mb-group__title">{{ g.category }}</view>
        <view v-for="e in g.items" :key="e.id" class="mb-card mb-row" @click="call(e.number)">
          <view class="mb-row__main">
            <view class="mb-row__name">{{ e.name }}</view>
            <view class="mb-row__num">{{ e.number }}</view>
          </view>
          <view class="mb-row__action">拨号</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: var(--space-md) var(--mb-pad-x);
  padding: 0 var(--space-md);
  height: 72rpx;
  background: #fff;
  border-radius: var(--mb-radius-card);
}

.mb-search__input {
  flex: 1;
  font-size: 28rpx;
}

.mb-state {
  padding: var(--space-lg) var(--mb-pad-x);
  text-align: center;
  color: var(--mb-fz-tip);
}

.mb-group {
  margin: var(--space-sm) var(--mb-pad-x);
}

.mb-group__title {
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--primary-mobile);
  margin: var(--space-sm) 0;
}

.mb-card {
  background: #fff;
  border-radius: var(--mb-radius-card);
  margin-bottom: var(--space-sm);
}

.mb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: var(--space-md);
}

.mb-row__name {
  font-size: 30rpx;
  font-weight: 600;
}

.mb-row__num {
  font-size: 26rpx;
  color: #666;
  margin-top: 6rpx;
}

.mb-row__action {
  min-width: 120rpx;
  min-height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-md);
  color: #fff;
  background: var(--primary-mobile);
  border-radius: 999rpx;
  font-size: 26rpx;
}
</style>
