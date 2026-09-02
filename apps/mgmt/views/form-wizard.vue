<script setup lang="ts">
import { computed, ref } from 'vue';

/*
 * MgmtFormWizard：流程填报向导（迁移自 ui-redesign FormWizard.vue）
 * - 水平步骤条（对齐 docs/UI规范-后台管理端.md：向导用水平步骤条）；
 * - 分步表单 + 上一步 / 下一步 / 提交交互；
 * - 色 / 字号 / 尺寸全部走 --mgmt-* token，禁硬编码。
 */

const steps = ['基本信息', '现场信息', '附件上传', '确认提交'] as const;

const cur = ref(0);

const isFirst = computed(() => cur.value === 0);
const isLast = computed(() => cur.value === steps.length - 1);

function prev() {
  cur.value = Math.max(0, cur.value - 1);
}
function next() {
  cur.value = Math.min(steps.length - 1, cur.value + 1);
}
function stepClass(i: number): string {
  if (i < cur.value) return 'fw-step--done';
  if (i === cur.value) return 'fw-step--on';
  return '';
}
</script>

<template>
  <div class="fw-page">
    <div class="fw-title">流程填报</div>

    <!-- 水平步骤条 -->
    <ol class="fw-steps">
      <li v-for="(s, i) in steps" :key="s" class="fw-step" :class="stepClass(i)">
        <i class="fw-step__no">{{ i < cur ? '✓' : i + 1 }}</i>
        <span class="fw-step__label">{{ s }}</span>
        <span v-if="i < steps.length - 1" class="fw-step__line" aria-hidden="true" />
      </li>
    </ol>

    <!-- 分步表单 -->
    <div class="fw-card">
      <div v-if="cur === 0" class="fw-form">
        <div class="fw-row">
          <label>工单标题</label>
          <input value="1#机泵出口压力偏高" />
        </div>
        <div class="fw-row">
          <label>所属区域</label>
          <select>
            <option>动力中心</option>
            <option>储运部</option>
          </select>
        </div>
      </div>

      <div v-else-if="cur === 1" class="fw-form">
        <div class="fw-row">
          <label>问题描述</label>
          <textarea rows="4">出口压力持续偏高，疑似调节阀卡涩，需现场排查。</textarea>
        </div>
        <div class="fw-row">
          <label>现场位置</label>
          <input value="动力中心 泵房 1#" />
        </div>
      </div>

      <div v-else-if="cur === 2" class="fw-form">
        <div class="fw-row">
          <label>附件上传</label>
          <button class="fw-btn fw-btn--ghost" type="button">＋ 选择文件</button>
        </div>
        <div class="fw-row">
          <label>备注说明</label>
          <textarea rows="3"></textarea>
        </div>
      </div>

      <div v-else class="fw-confirm">
        <div class="fw-row">
          <label>工单标题</label>
          <span>1#机泵出口压力偏高</span>
        </div>
        <div class="fw-row">
          <label>所属区域</label>
          <span>动力中心</span>
        </div>
        <div class="fw-row">
          <label>现场位置</label>
          <span>动力中心 泵房 1#</span>
        </div>
        <p class="fw-confirm__tip">请确认以上填报信息，提交后进入审批流程。</p>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="fw-actions">
      <button class="fw-btn fw-btn--ghost" type="button" :disabled="isFirst" @click="prev">
        上一步
      </button>
      <button class="fw-btn fw-btn--primary" type="button" @click="isLast ? undefined : next()">
        {{ isLast ? '提交' : '下一步' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.fw-page {
  max-width: 720px;
}

.fw-title {
  font-size: var(--mgmt-fz-header);
  font-weight: 700;
  color: var(--text-title-mgmt);
  margin-bottom: var(--space-md);
}

/* 水平步骤条 */
.fw-steps {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
  padding: 0;
  list-style: none;
}

.fw-step {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.fw-step__no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
  background: var(--mgmt-divider);
  color: var(--text-muted-mgmt);
  flex-shrink: 0;
}

.fw-step__label {
  font-size: var(--mgmt-fz-body);
  color: var(--text-muted-mgmt);
  white-space: nowrap;
}

.fw-step__line {
  width: 48px;
  height: 1px;
  background: var(--mgmt-divider);
  margin: 0 var(--space-xs);
}

.fw-step--on .fw-step__no {
  background: var(--primary-mgmt);
  color: var(--color-on-primary);
}

.fw-step--on .fw-step__label {
  color: var(--text-title-mgmt);
  font-weight: 600;
}

.fw-step--done .fw-step__no {
  background: var(--tag-success-bg);
  color: var(--tag-success-fg);
}

.fw-step--done .fw-step__label {
  color: var(--text-title-mgmt);
}

/* 表单卡 */
.fw-card {
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

.fw-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--mgmt-divider);
}

.fw-row:last-child {
  border-bottom: none;
}

.fw-row label {
  width: 96px;
  flex-shrink: 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--mgmt-detail-field-label-fg);
  padding-top: 8px;
}

.fw-row input,
.fw-row select,
.fw-row textarea {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--mgmt-form-input-border);
  border-radius: var(--mgmt-radius-md);
  padding: 0 var(--space-sm);
  background: var(--mgmt-form-input-bg);
  color: var(--text-title-mgmt);
  font-size: var(--mgmt-fz-body);
  font-family: inherit;
  height: 36px;
}

.fw-row textarea {
  height: auto;
  padding: var(--space-xs) var(--space-sm);
  resize: vertical;
}

.fw-row span {
  flex: 1;
  min-width: 0;
  font-size: var(--mgmt-fz-body);
  color: var(--text-title-mgmt);
  font-weight: 600;
  padding-top: 8px;
}

.fw-confirm__tip {
  margin: var(--space-md) 0 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* 操作区 */
.fw-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.fw-btn {
  height: var(--mgmt-btn-h);
  padding: 0 var(--space-md);
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 600;
  font-size: var(--mgmt-fz-filter);
  font-family: inherit;
}

.fw-btn--primary {
  border: none;
  background: var(--primary-mgmt);
  color: var(--color-on-primary);
}

.fw-btn--ghost {
  border: 1px solid var(--border-mgmt);
  background: var(--card-mgmt);
  color: var(--color-text);
}

.fw-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
