<script setup lang="ts">
import { computed } from 'vue';
import { useEmergencyProcess } from '../../../lib/composables/useEmergencyProcess';

const process = useEmergencyProcess();

/** 实时值班表（来自后端指引接口，加载前为本地默认值）。 */
const roster = computed(() => process.dutyRoster.value);
</script>

<template>
  <Teleport to="body">
    <Transition name="guidance-fade">
      <div
        v-if="process.state.guidanceModal.show"
        class="guidance-mask"
        @click.self="process.closeGuidance()"
      >
        <section class="guidance-dialog" role="dialog" aria-modal="true">
          <header class="guidance-header">
            <div class="guidance-header__title">
              <span class="guidance-header__icon">?</span>
              <h3 class="guidance-header__name">
                [{{ process.currentNodeGuidance.value.nodeName }}] 应急处置过程指导
              </h3>
            </div>
            <button
              type="button"
              class="guidance-header__close"
              aria-label="关闭"
              @click="process.closeGuidance()"
            >
              ×
            </button>
          </header>

          <div class="guidance-body">
            <div class="guidance-roster">
              <span class="guidance-roster__group">
                👥 实时值班表 <b>{{ roster.shiftGroup }}</b>
              </span>
              <div class="guidance-roster__tags">
                <span class="guidance-roster__tag"
                  >🧑‍💼 班组长 <b>{{ roster.supervisor }}</b></span
                >
                <span class="guidance-roster__tag"
                  >🧑‍💻 内操 <b>{{ roster.boardOperator }}</b></span
                >
                <span class="guidance-roster__tag"
                  >🧑‍🔧 外操 <b>{{ roster.fieldOperator }}</b></span
                >
              </div>
            </div>

            <div class="guidance-section">
              <div class="guidance-section__title">📞 汇报关系链（由谁向谁汇报）</div>
              <div class="guidance-chain">
                <div
                  v-for="item in process.currentNodeGuidance.value.reportingChain"
                  :key="item.step"
                  class="guidance-chain__item"
                >
                  <span class="guidance-chain__step">第 {{ item.step }} 步</span>
                  <div class="guidance-chain__content">
                    <div class="guidance-chain__flow">
                      <span class="guidance-chain__from">{{ item.fromRole }}</span>
                      <span class="guidance-chain__arrow">➤</span>
                      <span class="guidance-chain__to">{{ item.toRole }}</span>
                      <span class="guidance-chain__method">📡 {{ item.method }}</span>
                    </div>
                    <div class="guidance-chain__notice">📌 汇报要点：{{ item.notice }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="guidance-section">
              <div class="guidance-section__title">🧑‍🚒 各岗位具体处置任务（岗位分工 CheckList）</div>
              <div class="guidance-roles">
                <div
                  v-for="role in process.currentNodeGuidance.value.roleTasks"
                  :key="role.roleName"
                  class="guidance-role"
                >
                  <div class="guidance-role__header">
                    <span class="guidance-role__icon">{{ role.avatarIcon }}</span>
                    <div class="guidance-role__names">
                      <span class="guidance-role__type">{{ role.roleName }}岗位</span>
                      <span class="guidance-role__person">{{ role.personName }}</span>
                    </div>
                    <span class="guidance-role__phone">📞 {{ role.phone }}</span>
                  </div>
                  <div class="guidance-role__title">{{ role.roleTitle }}具体事项：</div>
                  <ul class="guidance-role__tasks">
                    <li v-for="(task, index) in role.tasks" :key="index">
                      <span class="guidance-role__check">☑</span> {{ task }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="guidance-notice">
              {{ process.currentNodeGuidance.value.generalNotice }}
            </div>
          </div>

          <footer class="guidance-footer">
            <button type="button" class="guidance-footer__btn" @click="process.closeGuidance()">
              确定
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(.guidance-mask) {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: rgb(2 6 23 / 86%);
}

:global(.guidance-fade-enter-active),
:global(.guidance-fade-leave-active) {
  transition: opacity 0.22s ease;
}

:global(.guidance-fade-enter-from),
:global(.guidance-fade-leave-to) {
  opacity: 0;
}

:global(.guidance-dialog) {
  width: min(900px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 25% 15%, rgb(56 189 248 / 10%), transparent 48%), #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 62%);
  overflow: hidden;
}

:global(.guidance-fade-enter-active .guidance-dialog),
:global(.guidance-fade-leave-active .guidance-dialog) {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}

:global(.guidance-fade-enter-from .guidance-dialog),
:global(.guidance-fade-leave-to .guidance-dialog) {
  transform: translateY(10px) scale(0.985);
  opacity: 0;
}

:global(.guidance-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
  box-sizing: border-box;
}

:global(.guidance-header__title) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

:global(.guidance-header__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgb(56 189 248 / 18%);
  border: 1px solid rgb(56 189 248 / 50%);
  color: var(--map-sky-soft);
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

:global(.guidance-header__name) {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.guidance-header__close) {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

:global(.guidance-header__close:hover) {
  background: #334155;
  color: var(--color-text-strong);
}

:global(.guidance-body) {
  flex: 1;
  min-height: 0;
  padding: 12px 14px 14px;
  overflow-y: auto;
  box-sizing: border-box;
}

:global(.guidance-roster) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid rgb(56 189 248 / 30%);
  border-radius: 6px;
  background: rgb(2 132 199 / 10%);
}

:global(.guidance-roster__group) {
  color: #cbd5e1;
  font-size: 12px;
}

:global(.guidance-roster__group b) {
  color: var(--map-sky-soft);
}

:global(.guidance-roster__tags) {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

:global(.guidance-roster__tag) {
  color: #94a3b8;
  font-size: 11px;
}

:global(.guidance-roster__tag b) {
  color: #e2e8f0;
}

:global(.guidance-section) {
  margin-top: 10px;
}

:global(.guidance-section__title) {
  margin-bottom: 6px;
  color: var(--map-sky-soft);
  font-size: 13px;
  font-weight: 700;
}

:global(.guidance-chain) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:global(.guidance-chain__item) {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

:global(.guidance-chain__step) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 0 6px;
  border-radius: 4px;
  background: rgb(56 189 248 / 14%);
  border: 1px solid rgb(56 189 248 / 40%);
  color: var(--map-sky-soft);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

:global(.guidance-chain__flow) {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

:global(.guidance-chain__from),
:global(.guidance-chain__to) {
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
}

:global(.guidance-chain__arrow) {
  color: var(--map-sky);
  font-size: 12px;
}

:global(.guidance-chain__method) {
  padding: 1px 6px;
  border-radius: 3px;
  background: rgb(245 158 11 / 14%);
  border: 1px solid rgb(245 158 11 / 40%);
  color: var(--color-warning);
  font-size: 10px;
}

:global(.guidance-chain__notice) {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.45;
}

:global(.guidance-roles) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

:global(.guidance-role) {
  padding: 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

:global(.guidance-role__header) {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

:global(.guidance-role__icon) {
  font-size: 18px;
}

:global(.guidance-role__names) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

:global(.guidance-role__type) {
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

:global(.guidance-role__person) {
  color: var(--map-sky-soft);
  font-size: 10px;
}

:global(.guidance-role__phone) {
  margin-left: auto;
  color: #94a3b8;
  font-size: 10px;
  white-space: nowrap;
}

:global(.guidance-role__title) {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 11px;
}

:global(.guidance-role__tasks) {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:global(.guidance-role__tasks li) {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: #cbd5e1;
  font-size: 11px;
  line-height: 1.45;
}

:global(.guidance-role__check) {
  color: var(--map-sky);
  font-size: 11px;
  flex-shrink: 0;
}

:global(.guidance-notice) {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid rgb(239 68 68 / 40%);
  border-radius: 6px;
  background: rgb(127 29 29 / 16%);
  color: var(--color-danger);
  font-size: 12px;
  line-height: 1.55;
}

:global(.guidance-footer) {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px;
  border-top: 1px solid #1e293b;
  background: #1e293b;
}

:global(.guidance-footer__btn) {
  min-width: 96px;
  height: 30px;
  padding: 0 18px;
  border: 1px solid var(--map-sky);
  border-radius: 4px;
  background: linear-gradient(180deg, #0284c7, #0369a1);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.guidance-footer__btn:hover) {
  filter: brightness(1.1);
}
</style>
