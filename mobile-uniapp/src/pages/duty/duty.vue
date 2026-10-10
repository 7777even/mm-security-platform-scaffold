<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchDutyRoster, fetchDutySignIns, createDutySignIn } from '@/platform/api';
import { getItem } from '@/platform/storage';
import MobileHeader from '@/components/MobileHeader.vue';

const members = ref<any[]>([]);
const signIns = ref<any[]>([]);
const loading = ref(true);
const today = new Date().toISOString().slice(0, 10);

const signedNames = computed(() => new Set(signIns.value.map((s) => s.personName)));

async function load() {
  loading.value = true;
  try {
    const [roster, signs] = await Promise.all([fetchDutyRoster(), fetchDutySignIns()]);
    members.value = roster ?? [];
    signIns.value = signs ?? [];
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function signIn(m: any) {
  const personName = m.name || getItem('username') || '值班人员';
  try {
    await createDutySignIn({
      dutyDate: today,
      shiftName: m.shift || '',
      department: m.department || '',
      personName,
      signAction: 'SIGN_IN',
    });
    uni.showToast({ title: '签到成功', icon: 'success' });
    await load();
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '签到失败', icon: 'none' });
  }
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="值班值守" :subtitle="`今日 ${today}`" />
    <view v-if="loading" class="mb-state">加载中…</view>
    <view v-else-if="members.length === 0" class="mb-state">暂无值班安排</view>

    <view v-else class="mb-list">
      <view v-for="(m, i) in members" :key="m.id ?? i" class="mb-card mb-member">
        <view class="mb-member__info">
          <view class="mb-member__name">{{ m.name }}</view>
          <view class="mb-member__meta">{{ m.department }} · {{ m.role }} · {{ m.shift }}</view>
          <view v-if="m.phone" class="mb-member__meta">{{ m.phone }}</view>
        </view>
        <view v-if="!signedNames.has(m.name)" class="mb-member__btn" @click="signIn(m)">签到</view>
        <view v-else class="mb-member__btn mb-member__btn--done">已签到</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.mb-state {
  padding: var(--space-lg) var(--mb-pad-x);
  text-align: center;
  color: var(--mb-fz-tip);
}

.mb-list {
  margin: var(--space-md) var(--mb-pad-x);
}

.mb-card {
  background: #fff;
  border-radius: var(--mb-radius-card);
  margin-bottom: var(--space-sm);
}

.mb-member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 112rpx;
  padding: var(--space-md);
}

.mb-member__name {
  font-size: 30rpx;
  font-weight: 600;
}

.mb-member__meta {
  font-size: 24rpx;
  color: #666;
  margin-top: 6rpx;
}

.mb-member__btn {
  min-height: 64rpx;
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  color: #fff;
  background: var(--primary-mobile);
  border-radius: 999rpx;
  font-size: 26rpx;
}

.mb-member__btn--done {
  background: #ccc;
}
</style>
