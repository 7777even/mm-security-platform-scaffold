<!--
  OneKeyDispatchDialog — 通用一键调度（广播 / 控制，跨模块复用）
  对标 fire OneKeyBroadcastDialog：选择目标 + 内容 + 下发；kind 控制文案与图标。
  目标由调用方透传（targets），不耦合具体模块数据；下发为前端 mock（showToast）。
  图标：压缩包 fire-situation 图标（PkgIcon，bell-ringing=广播 / confined-space=控制）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import type { DispatchTarget } from './dispatchTypes';

const props = withDefaults(
  defineProps<{
    kind?: 'broadcast' | 'control';
    title?: string;
    targets?: DispatchTarget[];
    contact?: { name: string; phone: string };
  }>(),
  { kind: 'broadcast', title: '一键调度', targets: () => [], contact: undefined },
);
const emit = defineEmits<{ close: [] }>();

const checked = ref<number[]>([]);
const content = ref('');
const urgency = ref<'紧急' | '重要' | '一般'>('紧急');

const isBroadcast = props.kind === 'broadcast';
const iconName = isBroadcast ? 'bell-ringing' : 'confined-space';

function has(id: number): boolean {
  return checked.value.includes(id);
}
function toggle(id: number): void {
  checked.value = has(id) ? checked.value.filter((x) => x !== id) : [...checked.value, id];
}
function send(): void {
  if (!content.value.trim()) {
    showToast('请输入调度内容');
    return;
  }
  if (checked.value.length === 0 && !props.contact) {
    showToast('请选择至少一个调度目标');
    return;
  }
  showToast(isBroadcast ? '应急广播已下发' : '一键控制指令已下发');
}
</script>

<template>
  <ScreenDialog :open="true" :title="title" :icon="iconName" @close="emit('close')">
    <div class="dispatch">
      <aside class="dispatch__targets">
        <h4>调度目标（{{ isBroadcast ? '广播接收' : '控制对象' }}）</h4>
        <label v-for="t in targets" :key="t.id" class="target">
          <input type="checkbox" :checked="has(t.id)" @change="toggle(t.id)" />
          <span class="target__name">{{ t.name }}</span>
          <span class="target__meta">{{ t.meta }}</span>
        </label>
        <label v-if="props.contact" class="target target--contact">
          <input type="checkbox" checked disabled />
          <span class="target__name">{{ props.contact.name }}</span>
          <span class="target__meta">值班联络 · {{ props.contact.phone }}</span>
        </label>
        <p v-if="!targets.length && !props.contact" class="dispatch__empty">暂无可调度的目标</p>
      </aside>

      <section class="dispatch__compose">
        <div v-if="props.contact" class="dispatch__contact">
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
          <span class="field__label">{{ isBroadcast ? '广播内容' : '控制指令' }}</span>
          <textarea
            v-model="content"
            class="field__area"
            rows="6"
            :placeholder="
              isBroadcast
                ? '请输入应急广播内容，如：A装置区发生异常，请立即前往处置……'
                : '请输入一键控制指令，如：远程切断阀门 V-102 并启动应急排风……'
            "
          />
        </label>

        <div class="dispatch__actions">
          <button type="button" class="btn-ghost" @click="emit('close')">取消</button>
          <button type="button" class="btn-send" @click="send">
            {{ isBroadcast ? '立即下发' : '下发指令' }}
          </button>
        </div>
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.dispatch {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-md);
  height: 100%;
}

.dispatch__targets {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: var(--space-sm);
}

.dispatch__targets h4 {
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

.dispatch__empty {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.dispatch__compose {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.dispatch__contact {
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

.dispatch__actions {
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
