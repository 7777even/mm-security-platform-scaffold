<script setup lang="ts">
import { computed, ref } from 'vue';
import { parseDeviceCode } from '@/constants/deviceCode';
import PanelCard from '@/components/common/PanelCard.vue';

// 设备编码解析演示（device-code 能力串通）
const raw = ref('');
const result = computed(() => parseDeviceCode(raw.value));

const samples = ['12345678901234567890', '44090000000000000001', '12345', 'ABCDEFGHIJKLMNOPQRST'];

function onInput(value: string): void {
  raw.value = value.replace(/\D/g, '');
}
</script>

<template>
  <PanelCard title="设备编码解析">
    <p class="desc">
      输入中石化统一集采 20 位 MDM 主数据设备编码，实时解析分段（类别 / 区域 / 序列）。
    </p>

    <el-input
      :model-value="raw"
      maxlength="20"
      clearable
      placeholder="请输入 20 位数字设备编码"
      class="code-input"
      @input="onInput"
    />

    <div class="samples">
      <el-tag v-for="s in samples" :key="s" size="small" class="sample" @click="raw = s">
        {{ s }}
      </el-tag>
    </div>

    <template v-if="raw">
      <p v-if="!result.isValid" class="invalid">编码不合法：须为 20 位纯数字。</p>
      <div v-else class="parts">
        <div class="part">
          <span class="part-label">类别</span>
          <span class="part-value">{{ result.category }}</span>
        </div>
        <div class="part">
          <span class="part-label">区域</span>
          <span class="part-value">{{ result.region }}</span>
        </div>
        <div class="part">
          <span class="part-label">序列</span>
          <span class="part-value">{{ result.sequence }}</span>
        </div>
        <div class="join">
          三段拼接 = {{ result.category }}{{ result.region }}{{ result.sequence }}
        </div>
      </div>
    </template>
  </PanelCard>
</template>

<style scoped>
.desc {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
  font-size: 13px;
}

.code-input {
  margin-top: var(--space-md);
  max-width: 420px;
}

.samples {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.sample {
  cursor: pointer;
}

.invalid {
  margin-top: var(--space-md);
  color: var(--color-danger);
}

.parts {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  max-width: 420px;
}

.part {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-accent-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
}

.part-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.part-value {
  font-family: Consolas, 'Courier New', monospace;
  color: var(--color-accent);
  font-size: 15px;
  letter-spacing: 1px;
}

.join {
  margin-top: var(--space-sm);
  color: var(--color-text);
  font-size: 13px;
  font-family: Consolas, 'Courier New', monospace;
}
</style>
