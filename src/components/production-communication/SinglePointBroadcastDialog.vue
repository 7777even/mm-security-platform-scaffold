<!--
  SinglePointBroadcastDialog — 单点广播通知（二级界面 singleBroadcast）
  对标参考 SinglePointBroadcastDialog：针对单个通讯设备下发广播（播放方式 / 内容来源 / 通知内容 / 下发）。
  经 CommunicationInteractionLayer 由 v-if 挂载（每次打开重建，表单态自动复位）。
  下发为前端 mock（showToast），无后端联动。
  规范约束（AGENTS.md §3）：零硬编码色，仅用 token；深蓝壳复用 ScreenDialog。
-->
<script setup lang="ts">
import { ref } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import type { CommunicationDevice } from '@/services/map-data/communicationDeviceMock';

const props = defineProps<{ device?: CommunicationDevice }>();
const emit = defineEmits<{ close: [] }>();

const playMode = ref('轮播');
const contentMode = ref('录音文件');
const content = ref('');
const noticeTime = ref('');

function submit(): void {
  if (!content.value.trim()) {
    showToast('请输入通知内容');
    return;
  }
  showToast('广播已发送');
  emit('close');
}
</script>

<template>
  <ScreenDialog
    :open="true"
    :title="`单点广播通知（${props.device?.name ?? '未选择设备'}）`"
    icon="bell-ringing"
    @close="emit('close')"
  >
    <div class="single">
      <div v-if="props.device" class="single__target">
        广播目标：{{ props.device.name }}（{{ props.device.area }} · {{ props.device.location }}）
      </div>

      <div class="single__form-row">
        <span class="single__label">播放方式</span>
        <div class="single__radios">
          <label class="single__radio">
            <input v-model="playMode" type="radio" value="轮播" />
            <span>轮播</span>
          </label>
          <label class="single__radio">
            <input v-model="playMode" type="radio" value="单次播放" />
            <span>单次播放</span>
          </label>
        </div>
      </div>

      <div class="single__form-row">
        <span class="single__label">内容来源</span>
        <div class="single__radios">
          <label class="single__radio">
            <input v-model="contentMode" type="radio" value="录音文件" />
            <span>录音文件</span>
          </label>
          <label class="single__radio">
            <input v-model="contentMode" type="radio" value="文字播报" />
            <span>文字播报</span>
          </label>
        </div>
      </div>

      <label class="single__form-row">
        <span class="single__label">通知内容</span>
        <textarea v-model="content" class="single__textarea" placeholder="请输入" rows="4" />
      </label>

      <label class="single__form-row">
        <span class="single__label">通知时间</span>
        <input
          v-model="noticeTime"
          class="single__input"
          type="text"
          placeholder="例如：2026-08-10 15:30"
        />
      </label>

      <div class="single__footer">
        <button type="button" class="single__btn" @click="emit('close')">取消</button>
        <button type="button" class="single__btn single__btn--primary" @click="submit">
          发送广播
        </button>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.single {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 320px;
}

.single__target {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

.single__form-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.single__label {
  flex-shrink: 0;
  width: 76px;
  padding-top: 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.single__radios {
  display: flex;
  gap: var(--space-lg);
  padding-top: 8px;
}

.single__radio {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.single__radio input {
  accent-color: var(--color-accent);
}

.single__textarea {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  outline: none;
  resize: none;
}

.single__input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  outline: none;
}

.single__textarea:focus,
.single__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.single__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  flex-shrink: 0;
  padding-top: var(--space-md);
  border-top: 1px solid color-mix(in srgb, var(--panel-border) 60%, transparent);
}

.single__btn {
  height: 34px;
  padding: 0 18px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
}

.single__btn:hover {
  border-color: var(--color-accent);
}

.single__btn--primary {
  border: none;
  color: var(--color-on-primary);
  background: var(--btn-bg-primary);
  font-weight: 600;
}

.single__btn--primary:hover {
  filter: brightness(1.08);
}
</style>
