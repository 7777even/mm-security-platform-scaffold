<!--
  OneKeyBroadcastDialog — 一键应急 / 广播（二级界面 oneKeyBroadcast）
  对标参考 OneKeyBroadcastDialog：选择应急广播目标（中队/人员）+ 广播内容 + 下发。
  数据消费 fireBrigadeMock（fireBrigadeTeams 作广播目标）。
  下发为前端 mock（showToast），无后端联动；contact 为面板透传的值班联络人。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import { fireBrigadeTeams } from '@/services/map-data/fireBrigadeMock';

const props = defineProps<{ contact?: { name: string; phone: string } }>();
const emit = defineEmits<{ close: [] }>();

const checked = ref<number[]>([]);
const content = ref('');
const urgency = ref<'紧急' | '重要' | '一般'>('紧急');

function has(id: number): boolean {
  return checked.value.includes(id);
}
function toggle(id: number): void {
  checked.value = has(id) ? checked.value.filter((x) => x !== id) : [...checked.value, id];
}
function send(): void {
  if (!content.value.trim()) {
    showToast('请输入广播内容');
    return;
  }
  if (checked.value.length === 0 && !props.contact) {
    showToast('请选择至少一个广播目标');
    return;
  }
  showToast('应急广播已下发');
}
</script>

<template>
  <ScreenDialog :open="true" title="一键应急广播" icon="bell-ringing" @close="emit('close')">
    <div class="broadcast">
      <aside class="broadcast__targets">
        <h4>广播目标（消防中队）</h4>
        <label v-for="t in fireBrigadeTeams" :key="t.id" class="target">
          <input type="checkbox" :checked="has(t.id)" @change="toggle(t.id)" />
          <span class="target__name">{{ t.name }}</span>
          <span class="target__meta">{{ t.area }} · {{ t.leaderName }}</span>
        </label>
        <label v-if="props.contact" class="target target--contact">
          <input type="checkbox" checked disabled />
          <span class="target__name">{{ props.contact.name }}</span>
          <span class="target__meta">值班联络 · {{ props.contact.phone }}</span>
        </label>
      </aside>

      <section class="broadcast__compose">
        <div v-if="props.contact" class="broadcast__contact">
          联络对象：{{ props.contact.name }}（{{ props.contact.phone }}）
        </div>

        <label class="field">
          <span class="field__label">紧急程度</span>
          <select v-model="urgency" class="field__select">
            <option value="紧急">紧急</option>
            <option value="重要">重要</option>
            <option value="一般">一般</option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">广播内容</span>
          <textarea
            v-model="content"
            class="field__area"
            rows="6"
            placeholder="请输入应急广播内容，如：A装置区发生火灾，请立即前往处置……"
          />
        </label>

        <div class="broadcast__actions">
          <button type="button" class="btn-ghost" @click="emit('close')">取消</button>
          <button type="button" class="btn-send" @click="send">立即下发</button>
        </div>
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.broadcast {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-md);
  height: 100%;
}

.broadcast__targets {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: var(--space-sm);
}

.broadcast__targets h4 {
  margin: 0 0 4px;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.target {
  display: grid;
  grid-template-columns: 18px 1fr;
  grid-template-rows: auto auto;
  column-gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  cursor: pointer;
}

.target--contact {
  border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.target input {
  grid-row: 1 / 3;
  accent-color: var(--color-accent);
}

.target__name {
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.target__meta {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.broadcast__compose {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.broadcast__contact {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.field__select {
  height: 34px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-biz);
}

.field__area {
  resize: vertical;
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: var(--panel-inner-bg);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  font-family: var(--font-body, sans-serif);
  line-height: 1.6;
}

.field__area:focus,
.field__select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.broadcast__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: auto;
}

.btn-ghost,
.btn-send {
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-biz);
  cursor: pointer;
  border: 1px solid var(--panel-border);
}

.btn-ghost {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
}

.btn-ghost:hover {
  border-color: var(--color-accent);
}

.btn-send {
  border: none;
  color: #fff;
  background: var(--btn-bg-primary);
  font-weight: 600;
}

.btn-send:hover {
  filter: brightness(1.08);
}
</style>
