<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchFirePatrols, fetchPatrolExecutions, createPatrolExecution } from '@/platform/api';
import { getItem } from '@/platform/storage';
import MobileHeader from '@/components/MobileHeader.vue';
import IconTile from '@/components/IconTile.vue';

const patrol = ref<any>(null);
const history = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);

const location = ref<string>('');
const execResult = ref<'NORMAL' | 'ABNORMAL'>('NORMAL');
const finding = ref<string>('');

const person = computed(() => getItem('username') ?? '');

async function load() {
  loading.value = true;
  try {
    const records = await fetchFirePatrols();
    patrol.value = (records ?? [])[0] ?? null;
    if (patrol.value) {
      location.value = (patrol.value.locations ?? [])[0] ?? '';
    }
    history.value = await fetchPatrolExecutions();
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!patrol.value) {
    uni.showToast({ title: '无巡查任务', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    await createPatrolExecution({
      patrolDate: patrol.value.patrolDate ?? '',
      shiftName: patrol.value.shift ?? '',
      dutyPerson: person.value || patrol.value.dutyPerson || '',
      location: location.value,
      execResult: execResult.value,
      finding: finding.value || undefined,
    });
    uni.showToast({ title: '提交成功', icon: 'success' });
    finding.value = '';
    await load();
  } catch (e: any) {
    uni.showToast({ title: e?.message ?? '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

onLoad(load);
</script>

<template>
  <view class="mb-page">
    <MobileHeader variant="back" title="巡查执行" />
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="!patrol" class="state">暂无巡查任务</view>
    <view v-else class="exec">
      <view class="patrol-head">
        <IconTile name="patrol" tone="blue" />
        <view class="head-body">
          <view class="title">{{ patrol.patrolDate || '—' }} · {{ patrol.shift || '—' }}</view>
          <view class="meta">值班人 {{ patrol.dutyPerson || '—' }}</view>
        </view>
      </view>

      <view class="form">
        <view class="field">
          <text class="label">巡查地点</text>
          <input v-model="location" class="input" placeholder="请输入巡查地点" />
        </view>
        <view class="field">
          <text class="label">执行结果</text>
          <view class="seg">
            <view
              class="seg-item"
              :class="{ active: execResult === 'NORMAL' }"
              @click="execResult = 'NORMAL'"
              >正常</view
            >
            <view
              class="seg-item"
              :class="{ active: execResult === 'ABNORMAL' }"
              @click="execResult = 'ABNORMAL'"
              >异常</view
            >
          </view>
        </view>
        <view class="field">
          <text class="label">发现描述</text>
          <textarea v-model="finding" class="textarea" placeholder="填写巡查发现（可选）" />
        </view>
      </view>

      <view class="history">
        <view class="hist-title">历史执行记录</view>
        <view v-if="history.length === 0" class="hist-empty">暂无记录</view>
        <view v-for="h in history" :key="h.id" class="hist-item">
          <text>{{ h.patrolDate || '—' }} · {{ h.shiftName || '—' }}</text>
          <text class="hist-result" :class="h.execResult === 'NORMAL' ? 'ok' : 'bad'">{{
            h.execResult || '—'
          }}</text>
        </view>
      </view>
    </view>

    <view v-if="!loading && patrol" class="submit-bar">
      <button class="submit-btn" :disabled="submitting" @click="submit">
        {{ submitting ? '提交中…' : '提交巡查' }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.state {
  text-align: center;
  padding: 80rpx 0;
  color: rgb(0 0 0 / 45%);
}

.exec {
  padding: var(--mb-pad-x);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.patrol-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #fff;
  border-radius: var(--mb-radius-card);
}

.head-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
}

.meta {
  font-size: 24rpx;
  color: rgb(0 0 0 / 55%);
}

.form {
  background: #fff;
  border-radius: var(--mb-radius-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.label {
  font-size: 26rpx;
  color: rgb(0 0 0 / 50%);
}

.input,
.textarea {
  min-height: 72rpx;
  padding: var(--space-sm);
  border: 1rpx solid rgb(0 0 0 / 12%);
  border-radius: var(--mb-radius-card);
  font-size: 26rpx;
  background: #fafafa;
}

.textarea {
  height: 160rpx;
}

.seg {
  display: flex;
  gap: var(--space-sm);
}

.seg-item {
  flex: 1;
  min-height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: var(--mb-radius-card);
  background: #f0f0f0;
  font-size: 26rpx;
}

.seg-item.active {
  background: var(--primary-mobile);
  color: #fff;
}

.history {
  background: #fff;
  border-radius: var(--mb-radius-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.hist-title {
  font-size: 28rpx;
  font-weight: 600;
}

.hist-empty {
  font-size: 24rpx;
  color: rgb(0 0 0 / 45%);
}

.hist-item {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: rgb(0 0 0 / 60%);
}

.hist-result.ok {
  color: var(--success-mobile);
}

.hist-result.bad {
  color: var(--danger-mobile);
}

.submit-bar {
  padding: var(--mb-pad-x) var(--mb-pad-x) calc(var(--space-lg) + env(safe-area-inset-bottom));
  background: #fff;
}

.submit-btn {
  width: 100%;
  min-height: 88rpx;
  line-height: 88rpx;
  background: var(--primary-mobile);
  color: #fff;
  border-radius: var(--mb-radius-card);
  font-size: 28rpx;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
