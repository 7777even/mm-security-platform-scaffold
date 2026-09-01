<script setup lang="ts">
import { SANDBOX_TOOLS, useSandboxScene } from '@/composables/useSandboxScene';

const emit = defineEmits<{
  close: [];
}>();

const sandbox = useSandboxScene();

const windDirectionOptions = [
  { value: 45, label: '45°（东北风）' },
  { value: 135, label: '135°（东南风）' },
  { value: 225, label: '225°（西南风）' },
  { value: 315, label: '315°（西北风）' },
];

function handleExit() {
  sandbox.exitSandbox();
  emit('close');
}
</script>

<template>
  <aside class="sandbox-panel ar-scroll">
    <header class="sandbox-panel__header">
      <div class="sandbox-panel__title-area">
        <span class="sandbox-panel__icon">&#128163;</span>
        <h3 class="sandbox-panel__title">3D 作战沙盘推演</h3>
      </div>
      <button type="button" class="sandbox-panel__close" aria-label="关闭沙盘" @click="handleExit">
        ×
      </button>
    </header>

    <div class="sandbox-panel__body">
      <section class="sandbox-section">
        <h4 class="sandbox-section__title">&#128451; 3D 地图应急处置标绘工具</h4>
        <div class="sandbox-tools">
          <button
            v-for="tool in SANDBOX_TOOLS"
            :key="tool.kind"
            type="button"
            class="sandbox-tool"
            :class="{ 'sandbox-tool--active': sandbox.activeTool.value === tool.kind }"
            @click="sandbox.setActiveTool(tool.kind)"
          >
            <span class="sandbox-tool__icon">{{ tool.icon }}</span>
            <span class="sandbox-tool__label">{{ tool.label }}</span>
          </button>
        </div>
        <div class="sandbox-tool-hint">
          <span v-if="sandbox.activeTool.value" class="sandbox-tool-hint__active">
            &#128073; 当前工具：<strong>{{ sandbox.activeTool.value }}</strong
            >，点击地图打点放置
          </span>
          <span v-else class="sandbox-tool-hint__idle">
            选择上方工具后，在地图上点击放置标绘要素
          </span>
        </div>
      </section>

      <section class="sandbox-section">
        <h4 class="sandbox-section__title">&#128200; 高斯气体羽流扩散模拟分析</h4>
        <div class="sandbox-plume-grid">
          <label class="sandbox-field">
            <span class="sandbox-field__label">主导风向：</span>
            <select
              v-model.number="sandbox.plumeParams.windDirectionDeg"
              class="sandbox-field__select"
            >
              <option
                v-for="option in windDirectionOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="sandbox-field">
            <span class="sandbox-field__label">风速 (m/s)：</span>
            <input
              v-model.number="sandbox.plumeParams.windSpeed"
              type="number"
              step="0.5"
              min="0.5"
              class="sandbox-field__input"
            />
          </label>
          <label class="sandbox-field">
            <span class="sandbox-field__label">泄漏速率 (kg/s)：</span>
            <input
              v-model.number="sandbox.plumeParams.leakRate"
              type="number"
              step="1"
              min="1"
              class="sandbox-field__input"
            />
          </label>
          <button type="button" class="sandbox-run-btn" @click="sandbox.runPlumeAnalysis()">
            &#9851; 重新演算羽流受灾范围
          </button>
        </div>
      </section>

      <section class="sandbox-section">
        <h4 class="sandbox-section__title">&#128038; 3D 作战沙盘图层显隐</h4>
        <div class="sandbox-layers">
          <label class="sandbox-layer">
            <input v-model="sandbox.layerToggles.isolationCircle" type="checkbox" />
            <span>防爆隔离半透明圈（爆炸极限范围）</span>
          </label>
          <label class="sandbox-layer">
            <input v-model="sandbox.layerToggles.plumeModel" type="checkbox" />
            <span>风向羽流扩散模型（有毒气体动态扩散）</span>
          </label>
          <label class="sandbox-layer">
            <input v-model="sandbox.layerToggles.evacuationRoutes" type="checkbox" />
            <span>全厂人员紧急疏散路径与集合点</span>
          </label>
          <label class="sandbox-layer">
            <input v-model="sandbox.layerToggles.hydrants" type="checkbox" />
            <span>消防水炮与周边消火栓位置</span>
          </label>
        </div>
      </section>
    </div>

    <footer class="sandbox-panel__footer">
      <button
        type="button"
        class="sandbox-panel__btn sandbox-panel__btn--ghost"
        @click="sandbox.clearSandboxItems()"
      >
        清空标绘
      </button>
      <button
        type="button"
        class="sandbox-panel__btn sandbox-panel__btn--primary"
        @click="handleExit"
      >
        退出沙盘
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.sandbox-panel {
  position: absolute;
  top: calc(var(--header-height, 105px) + 18px);
  right: 39px;
  bottom: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 419px;
  min-height: 0;
  box-sizing: border-box;
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgb(7 38 70 / 97%) 0%, rgb(4 24 46 / 97%) 100%),
    radial-gradient(circle at 25% 15%, rgb(0 148 236 / 20%), transparent 55%);
  box-shadow:
    0 12px 32px rgb(0 0 0 / 42%),
    inset 0 0 22px rgb(0 120 210 / 16%);
  overflow: hidden;
  pointer-events: auto;
}

.sandbox-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px 0 14px;
  border-bottom: 1px solid rgb(0 120 210 / 36%);
  background: rgb(2 28 52 / 86%);
  box-sizing: border-box;
  flex-shrink: 0;
}

.sandbox-panel__title-area {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sandbox-panel__icon {
  color: #7cdbff;
  font-size: 16px;
  line-height: 1;
}

.sandbox-panel__title {
  margin: 0;
  color: #e6f3ff;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
}

.sandbox-panel__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #a8b8cc;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.sandbox-panel__close:hover {
  color: #fff;
  background: rgb(0 120 210 / 25%);
}

.sandbox-panel__body {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
  box-sizing: border-box;
}

.sandbox-section + .sandbox-section {
  margin-top: 12px;
}

.sandbox-section {
  padding: 10px;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 6px;
  background: rgb(0 30 58 / 60%);
}

.sandbox-section__title {
  margin: 0 0 10px;
  color: #7cdbff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.sandbox-tools {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sandbox-tool {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgb(0 110 190 / 40%);
  border-radius: 5px;
  background: rgb(0 22 48 / 82%);
  color: #cfe3f7;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    filter 0.18s ease,
    background 0.18s ease;
}

.sandbox-tool:hover {
  border-color: rgb(0 166 244 / 70%);
  filter: brightness(1.08);
}

.sandbox-tool--active {
  border-color: rgb(0 180 255 / 90%);
  background: linear-gradient(180deg, rgb(0 90 160 / 82%), rgb(0 52 110 / 82%));
  color: #fff;
  box-shadow: inset 0 0 12px rgb(0 150 235 / 28%);
}

.sandbox-tool__icon {
  width: 18px;
  font-size: 13px;
  line-height: 1;
  text-align: center;
}

.sandbox-tool__label {
  line-height: 1.2;
  white-space: nowrap;
}

.sandbox-tool-hint {
  margin-top: 8px;
  min-height: 18px;
  font-size: 11px;
  line-height: 1.45;
}

.sandbox-tool-hint__active {
  color: #eca641;
}

.sandbox-tool-hint__idle {
  color: #7ea5ca;
}

.sandbox-plume-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sandbox-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.sandbox-field__label {
  color: #9fb4cc;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.sandbox-field__select,
.sandbox-field__input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 210 / 45%);
  border-radius: 4px;
  background: rgb(0 22 48 / 90%);
  color: #dbe7f8;
  font-size: 12px;
  font-family: var(--font-body);
  box-sizing: border-box;
  outline: none;
}

.sandbox-field__select:focus,
.sandbox-field__input:focus {
  border-color: #00b4ff;
  box-shadow: 0 0 8px rgb(0 180 255 / 35%);
}

.sandbox-run-btn {
  grid-column: 1 / -1;
  height: 32px;
  border: 1px solid rgb(0 180 255 / 65%);
  border-radius: 5px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: #fff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: filter 0.18s ease;
}

.sandbox-run-btn:hover {
  filter: brightness(1.1);
}

.sandbox-layers {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sandbox-layer {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #cfe3f7;
  font-size: 12px;
  line-height: 1.35;
  cursor: pointer;
}

.sandbox-layer input {
  flex-shrink: 0;
  accent-color: #00b4ff;
}

.sandbox-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid rgb(0 120 210 / 30%);
  background: rgb(2 24 46 / 86%);
  box-sizing: border-box;
  flex-shrink: 0;
}

.sandbox-panel__btn {
  height: 30px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: filter 0.18s ease;
}

.sandbox-panel__btn--ghost {
  border: 1px solid rgb(0 120 210 / 50%);
  background: rgb(0 22 48 / 86%);
  color: #cfe3f7;
}

.sandbox-panel__btn--primary {
  border: 1px solid rgb(255 120 90 / 65%);
  background: linear-gradient(180deg, rgb(200 60 45 / 92%), rgb(150 36 30 / 92%));
  color: #fff;
}

.sandbox-panel__btn:hover {
  filter: brightness(1.1);
}
</style>
