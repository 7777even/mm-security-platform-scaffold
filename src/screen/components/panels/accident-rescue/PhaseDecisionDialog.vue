<script setup lang="ts">
import { useEmergencyProcess } from '../../../lib/composables/useEmergencyProcess';

const process = useEmergencyProcess();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="process.state.phaseDecision.show"
      class="pd-mask"
      @click.self="process.cancelPhaseDecision()"
    >
      <section class="pd-dialog" role="dialog" aria-modal="true">
        <header class="pd-header">
          <span class="pd-header__icon">🚦</span>
          <span class="pd-header__title">阶段处置完成，请选择后续路径</span>
          <button
            type="button"
            class="pd-header__close"
            aria-label="关闭"
            @click="process.cancelPhaseDecision()"
          >
            ×
          </button>
        </header>

        <div class="pd-body">
          <div class="pd-prompt">
            当前阶段（{{
              process.state.phaseDecision.escalatePhase
                ? process.currentStage.value.commandLevel
                : '收尾'
            }}）处置已完成， 险情是否已得到控制？
          </div>
          <div class="pd-actions">
            <button
              type="button"
              class="pd-btn pd-btn--finish"
              @click="process.confirmFinishPhase()"
            >
              ✅ 已控制，直接进入收尾阶段
            </button>
            <button
              v-if="process.state.phaseDecision.escalatePhase"
              type="button"
              class="pd-btn pd-btn--escalate"
              :disabled="!process.currentPhaseCompleted.value"
              :title="process.currentPhaseCompleted.value ? '' : '需先完成本阶段全部节点后再升级'"
              @click="process.confirmEscalateToPhase()"
            >
              ⚡ 仍需升级，进入“{{ process.state.phaseDecision.escalatePhase.name }}”
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
:global(.pd-mask) {
  position: fixed;
  inset: 0;
  z-index: 1900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 82%);
  backdrop-filter: blur(8px);
}

:global(.pd-dialog) {
  width: 520px;
  max-width: 92vw;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 70%);
  overflow: hidden;
}

:global(.pd-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
}

:global(.pd-header__icon) {
  font-size: 16px;
}

:global(.pd-header__title) {
  flex: 1;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 700;
}

:global(.pd-header__close) {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

:global(.pd-body) {
  padding: 20px 18px;
}

:global(.pd-prompt) {
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

:global(.pd-actions) {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

:global(.pd-btn) {
  flex: 1;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  transition: filter 0.18s ease;
}

:global(.pd-btn:hover) {
  filter: brightness(1.1);
}

:global(.pd-btn:disabled) {
  opacity: 0.4;
  cursor: not-allowed;
  filter: none;
}

:global(.pd-btn--finish) {
  border: 1px solid rgb(16 185 129 / 50%);
  background: rgb(16 185 129 / 14%);
  color: #34d399;
}

:global(.pd-btn--escalate) {
  border: 1px solid rgb(244 63 94 / 50%);
  background: linear-gradient(180deg, #e11d48, #be123c);
  color: var(--color-text-strong);
}
</style>
