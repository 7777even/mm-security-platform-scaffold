<script setup lang="ts">
import { useEmergencyProcess } from '@/composables/useEmergencyProcess';

const process = useEmergencyProcess();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="process.state.escalateModal.show"
      class="escalate-mask"
      @click.self="process.cancelEscalate()"
    >
      <section class="escalate-dialog" role="dialog" aria-modal="true">
        <header class="escalate-header">
          <span class="escalate-header__icon">🚨</span>
          <span class="escalate-header__title">应急预案响应级别升级确认</span>
          <button
            type="button"
            class="escalate-header__close"
            aria-label="关闭"
            @click="process.cancelEscalate()"
          >
            ×
          </button>
        </header>

        <div class="escalate-body">
          <div class="escalate-warning">
            <span class="escalate-warning__icon">⚠</span>
          </div>
          <div class="escalate-prompt">
            <div class="escalate-prompt__question">
              是否确认启动
              <span class="escalate-prompt__target">
                “{{ process.state.escalateModal.targetStageName }}”
              </span>
              ？
            </div>
            <p class="escalate-prompt__desc">
              险情处置已超出当前阶段包围拦截能力，启动后系统将切换至更高规格的预案响应指挥矩阵并展开细化救援节点。
            </p>
          </div>
        </div>

        <footer class="escalate-footer">
          <button type="button" class="escalate-footer__cancel" @click="process.cancelEscalate()">
            取消
          </button>
          <button type="button" class="escalate-footer__confirm" @click="process.confirmEscalate()">
            ⚡ 确认启动{{ process.state.escalateModal.targetStageName }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
:global(.escalate-mask) {
  position: fixed;
  inset: 0;
  z-index: 1800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgb(15 23 42 / 82%);
  backdrop-filter: blur(8px);
}

:global(.escalate-dialog) {
  width: 480px;
  max-width: 92vw;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border: 1.5px solid rgb(244 63 94 / 50%);
  border-radius: 12px;
  box-shadow:
    0 20px 50px rgb(0 0 0 / 80%),
    0 0 30px rgb(244 63 94 / 25%);
  overflow: hidden;
}

:global(.escalate-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 14px;
  background: rgb(244 63 94 / 12%);
  border-bottom: 1px solid rgb(244 63 94 / 30%);
  box-sizing: border-box;
}

:global(.escalate-header__icon) {
  font-size: 18px;
}

:global(.escalate-header__title) {
  flex: 1;
  color: #f43f5e;
  font-size: 15px;
  font-weight: 700;
}

:global(.escalate-header__close) {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
}

:global(.escalate-body) {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 22px 18px;
}

:global(.escalate-warning__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgb(244 63 94 / 14%);
  border: 1px solid rgb(244 63 94 / 45%);
  color: #f43f5e;
  font-size: 22px;
  animation: escalate-pulse 1.6s ease-in-out infinite;
}

@keyframes escalate-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.12);
    opacity: 0.75;
  }
}

:global(.escalate-prompt__question) {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

:global(.escalate-prompt__target) {
  color: #f43f5e;
}

:global(.escalate-prompt__desc) {
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.65;
}

:global(.escalate-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid #1e293b;
  background: #1e293b;
}

:global(.escalate-footer__cancel) {
  min-width: 84px;
  height: 32px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.escalate-footer__confirm) {
  min-width: 168px;
  height: 32px;
  border: 1px solid rgb(244 63 94 / 60%);
  border-radius: 6px;
  background: linear-gradient(180deg, #e11d48, #be123c);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.escalate-footer__confirm:hover) {
  filter: brightness(1.1);
}
</style>
