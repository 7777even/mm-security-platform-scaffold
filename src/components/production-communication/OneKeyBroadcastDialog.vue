<!--
  OneKeyBroadcastDialog — 一键广播通知（二级界面 oneKeyBroadcast）
  对标参考 OneKeyBroadcastDialog：选择广播目标 + 播放方式 / 内容来源 + 通知内容 + 下发。
  经 CommunicationInteractionLayer 由 v-if 挂载（每次打开重建，表单态自动复位）。
  下发为前端 mock（showToast），无后端联动。
  规范约束（AGENTS.md §3）：零硬编码色，仅用 token；深蓝壳复用 ScreenDialog。
-->
<script setup lang="ts">
import { ref } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';

const emit = defineEmits<{ close: [] }>();

const deviceScope = ref('广播设备');
const playMode = ref('轮播');
const contentMode = ref('录音文件');
const content = ref('');
const noticeTime = ref('');

const scopes = ['广播设备', '电话设备', '对讲设备'];

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
  <ScreenDialog :open="true" title="一键广播通知" icon="bell-ringing" @close="emit('close')">
    <div class="broadcast">
      <aside class="broadcast__side">
        <div class="broadcast__side-title">广播对象</div>
        <button
          v-for="opt in scopes"
          :key="opt"
          type="button"
          class="broadcast__scope"
          :class="{ 'broadcast__scope--active': deviceScope === opt }"
          @click="deviceScope = opt"
        >
          {{ opt }}
        </button>
      </aside>

      <div class="broadcast__form">
        <div class="broadcast__form-row">
          <span class="broadcast__label">播放方式</span>
          <div class="broadcast__radios">
            <label class="broadcast__radio">
              <input v-model="playMode" type="radio" value="轮播" />
              <span>轮播</span>
            </label>
            <label class="broadcast__radio">
              <input v-model="playMode" type="radio" value="单次播放" />
              <span>单次播放</span>
            </label>
          </div>
        </div>

        <div class="broadcast__form-row">
          <span class="broadcast__label">内容来源</span>
          <div class="broadcast__radios">
            <label class="broadcast__radio">
              <input v-model="contentMode" type="radio" value="录音文件" />
              <span>录音文件</span>
            </label>
            <label class="broadcast__radio">
              <input v-model="contentMode" type="radio" value="文字播报" />
              <span>文字播报</span>
            </label>
          </div>
        </div>

        <label class="broadcast__form-row">
          <span class="broadcast__label">通知内容</span>
          <textarea v-model="content" class="broadcast__textarea" placeholder="请输入" rows="4" />
        </label>

        <label class="broadcast__form-row">
          <span class="broadcast__label">通知时间</span>
          <input
            v-model="noticeTime"
            class="broadcast__input"
            type="text"
            placeholder="例如：2026-08-10 15:30"
          />
        </label>

        <div class="broadcast__actions">
          <button type="button" class="broadcast__btn" @click="emit('close')">取消</button>
          <button type="button" class="broadcast__btn broadcast__btn--primary" @click="submit">
            发送广播
          </button>
        </div>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.broadcast {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-md);
  min-height: 360px;
}

.broadcast__side {
  flex-shrink: 0;
  padding: var(--space-md);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.broadcast__side-title {
  margin-bottom: var(--space-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.broadcast__scope {
  display: block;
  width: 100%;
  margin-bottom: var(--space-sm);
  padding: 8px 10px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  text-align: left;
  cursor: pointer;
}

.broadcast__scope--active {
  color: var(--color-text-strong);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.broadcast__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-width: 0;
}

.broadcast__form-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.broadcast__label {
  flex-shrink: 0;
  width: 76px;
  padding-top: 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.broadcast__radios {
  display: flex;
  gap: var(--space-lg);
  padding-top: 8px;
}

.broadcast__radio {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.broadcast__radio input {
  accent-color: var(--color-accent);
}

.broadcast__textarea {
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

.broadcast__input {
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

.broadcast__textarea:focus,
.broadcast__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.broadcast__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid color-mix(in srgb, var(--panel-border) 60%, transparent);
}

.broadcast__btn {
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

.broadcast__btn:hover {
  border-color: var(--color-accent);
}

.broadcast__btn--primary {
  border: none;
  color: var(--color-on-primary);
  background: var(--btn-bg-primary);
  font-weight: 600;
}

.broadcast__btn--primary:hover {
  filter: brightness(1.08);
}
</style>
