<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ALL_NODE_IDS,
  CAMERA_ANCHOR_METADATA,
  DEFAULT_NODE_PHASE_CONFIGS,
  type CameraAnchorType,
  type NodePhaseConfig,
} from '../../../lib/data/nodeConfigData';
import { useEmergencyProcess } from '../../../lib/composables/useEmergencyProcess';

const process = useEmergencyProcess();

const selectedNodeId = ref<string>(process.currentNodeId.value);
const draft = ref<NodePhaseConfig>(
  JSON.parse(JSON.stringify(process.nodeConfigs.value[selectedNodeId.value])),
);
const savedTip = ref(false);

watch(
  () => process.state.nodeConfigOpen,
  (open) => {
    if (open) {
      selectedNodeId.value = process.currentNodeId.value;
      draft.value = JSON.parse(JSON.stringify(process.nodeConfigs.value[selectedNodeId.value]));
      savedTip.value = false;
    }
  },
);

watch(selectedNodeId, (id) => {
  draft.value = JSON.parse(JSON.stringify(process.nodeConfigs.value[id]));
  savedTip.value = false;
});

const availableAnchors = computed(() => {
  const used = new Set(draft.value.mapCamera.anchorPriorityList);
  return (Object.keys(CAMERA_ANCHOR_METADATA) as CameraAnchorType[]).filter(
    (anchor) => !used.has(anchor),
  );
});

function moveAnchor(index: number, direction: -1 | 1) {
  const list = [...draft.value.mapCamera.anchorPriorityList];
  const target = index + direction;
  if (target < 0 || target >= list.length) return;
  const tmp = list[index];
  list[index] = list[target];
  list[target] = tmp;
  draft.value.mapCamera.anchorPriorityList = list;
}

function removeAnchor(index: number) {
  draft.value.mapCamera.anchorPriorityList = draft.value.mapCamera.anchorPriorityList.filter(
    (_, i) => i !== index,
  );
}

function addAnchor(anchor: CameraAnchorType) {
  if (!draft.value.mapCamera.anchorPriorityList.includes(anchor)) {
    draft.value.mapCamera.anchorPriorityList.push(anchor);
  }
}

function toggleRightPanel(id: string) {
  const list = draft.value.rightPanelHiddenTabs;
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
}

function toggleLeftPanel(id: string) {
  const list = draft.value.leftPanelHiddenPanels;
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
}

function handleSave() {
  const next = {
    ...process.nodeConfigs.value,
    [selectedNodeId.value]: JSON.parse(JSON.stringify(draft.value)),
  };
  process.saveNodeConfig(next);
  savedTip.value = true;
  setTimeout(() => {
    savedTip.value = false;
  }, 1600);
}

function handleReset() {
  const next = JSON.parse(JSON.stringify(DEFAULT_NODE_PHASE_CONFIGS));
  process.saveNodeConfig(next);
  draft.value = JSON.parse(JSON.stringify(next[selectedNodeId.value]));
}

const nodeLabel = (id: string) => process.nodeConfigs.value[id]?.nodeName ?? id;
</script>

<template>
  <Teleport to="body">
    <Transition name="nodecfg-fade">
      <div
        v-if="process.state.nodeConfigOpen"
        class="nodecfg-mask"
        @click.self="process.closeNodeConfig()"
      >
        <section class="nodecfg-dialog" role="dialog" aria-modal="true">
          <header class="nodecfg-header">
            <div class="nodecfg-header__title">
              <span class="nodecfg-header__icon">⚙</span>
              <h3 class="nodecfg-header__name">节点联动配置</h3>
            </div>
            <button
              type="button"
              class="nodecfg-header__close"
              aria-label="关闭"
              @click="process.closeNodeConfig()"
            >
              ×
            </button>
          </header>

          <div class="nodecfg-body">
            <aside class="nodecfg-side">
              <div class="nodecfg-side__title">流程节点</div>
              <button
                v-for="id in ALL_NODE_IDS"
                :key="id"
                type="button"
                class="nodecfg-node"
                :class="{ 'is-active': selectedNodeId === id }"
                @click="selectedNodeId = id"
              >
                {{ nodeLabel(id) }}
              </button>
            </aside>

            <div class="nodecfg-main">
              <div class="nodecfg-section">
                <div class="nodecfg-section__title">🎥 3D 地图视角（镜头中心锚点优先级）</div>
                <div class="nodecfg-anchors">
                  <div
                    v-for="(anchor, index) in draft.mapCamera.anchorPriorityList"
                    :key="anchor"
                    class="nodecfg-anchor"
                  >
                    <span class="nodecfg-anchor__index">{{ index + 1 }}</span>
                    <div class="nodecfg-anchor__info">
                      <span class="nodecfg-anchor__label">
                        {{ CAMERA_ANCHOR_METADATA[anchor].label }}
                      </span>
                      <span class="nodecfg-anchor__desc">{{
                        CAMERA_ANCHOR_METADATA[anchor].desc
                      }}</span>
                    </div>
                    <div class="nodecfg-anchor__ops">
                      <button type="button" :disabled="index === 0" @click="moveAnchor(index, -1)">
                        ↑
                      </button>
                      <button
                        type="button"
                        :disabled="index === draft.mapCamera.anchorPriorityList.length - 1"
                        @click="moveAnchor(index, 1)"
                      >
                        ↓
                      </button>
                      <button type="button" @click="removeAnchor(index)">×</button>
                    </div>
                  </div>
                </div>
                <div class="nodecfg-add-anchor">
                  <select
                    v-model="draft.mapCamera.bufferRadiusMeters"
                    class="nodecfg-buffer"
                    title="缓冲区半径"
                  >
                    <option :value="180">180m</option>
                    <option :value="260">260m</option>
                    <option :value="380">380m</option>
                    <option :value="520">520m</option>
                    <option :value="900">900m</option>
                    <option :value="1400">1400m</option>
                  </select>
                  <select
                    class="nodecfg-anchor-select"
                    :value="''"
                    @change="
                      (e: Event) =>
                        addAnchor((e.target as HTMLSelectElement).value as CameraAnchorType)
                    "
                  >
                    <option value="" disabled>+ 添加锚点</option>
                    <option v-for="anchor in availableAnchors" :key="anchor" :value="anchor">
                      {{ CAMERA_ANCHOR_METADATA[anchor].label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="nodecfg-section">
                <div class="nodecfg-section__title">🖥 右侧面板显隐</div>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.rightPanelHiddenTabs.includes('duty')"
                    @change="toggleRightPanel('duty')"
                  />
                  <span>值班值守</span>
                </label>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.rightPanelHiddenTabs.includes('auxiliary')"
                    @change="toggleRightPanel('auxiliary')"
                  />
                  <span>辅助信息</span>
                </label>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.rightPanelHiddenTabs.includes('dynamics')"
                    @change="toggleRightPanel('dynamics')"
                  />
                  <span>响应动态</span>
                </label>
              </div>

              <div class="nodecfg-section">
                <div class="nodecfg-section__title">🗂 左侧面板显隐</div>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.leftPanelHiddenPanels.includes('incident')"
                    @change="toggleLeftPanel('incident')"
                  />
                  <span>事件详情</span>
                </label>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.leftPanelHiddenPanels.includes('plan')"
                    @change="toggleLeftPanel('plan')"
                  />
                  <span>应急预案</span>
                </label>
                <label class="nodecfg-check">
                  <input
                    type="checkbox"
                    :checked="!draft.leftPanelHiddenPanels.includes('info')"
                    @change="toggleLeftPanel('info')"
                  />
                  <span>事故信息</span>
                </label>
              </div>

              <div class="nodecfg-section">
                <div class="nodecfg-section__title">👥 值班配置</div>
                <label class="nodecfg-check">
                  <input v-model="draft.duty.autoRoster" type="checkbox" />
                  <span>自动排班（按节点切换值班小组）</span>
                </label>
              </div>
            </div>
          </div>

          <footer class="nodecfg-footer">
            <span v-if="savedTip" class="nodecfg-footer__tip">✅ 配置已保存</span>
            <button type="button" class="nodecfg-footer__reset" @click="handleReset">
              恢复默认
            </button>
            <button type="button" class="nodecfg-footer__save" @click="handleSave">保存配置</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
:global(.nodecfg-mask) {
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

:global(.nodecfg-fade-enter-active),
:global(.nodecfg-fade-leave-active) {
  transition: opacity 0.22s ease;
}

:global(.nodecfg-fade-enter-from),
:global(.nodecfg-fade-leave-to) {
  opacity: 0;
}

:global(.nodecfg-dialog) {
  width: min(1080px, 100%);
  height: min(720px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 25% 12%, rgb(56 189 248 / 10%), transparent 45%), #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 22px 60px rgb(0 0 0 / 62%);
  overflow: hidden;
}

:global(.nodecfg-fade-enter-active .nodecfg-dialog),
:global(.nodecfg-fade-leave-active .nodecfg-dialog) {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}

:global(.nodecfg-fade-enter-from .nodecfg-dialog),
:global(.nodecfg-fade-leave-to .nodecfg-dialog) {
  transform: translateY(10px) scale(0.985);
  opacity: 0;
}

:global(.nodecfg-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  border-bottom: 1px solid #1e293b;
  background: #1e293b;
  box-sizing: border-box;
}

:global(.nodecfg-header__title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:global(.nodecfg-header__icon) {
  color: var(--map-sky);
  font-size: 16px;
}

:global(.nodecfg-header__name) {
  margin: 0;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
}

:global(.nodecfg-header__close) {
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

:global(.nodecfg-header__close:hover) {
  color: var(--color-text-strong);
}

:global(.nodecfg-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

:global(.nodecfg-side) {
  width: 190px;
  flex-shrink: 0;
  padding: 10px;
  border-right: 1px solid #1e293b;
  background: #0b1220;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:global(.nodecfg-side__title) {
  color: #64748b;
  font-size: 11px;
  margin-bottom: 4px;
}

:global(.nodecfg-node) {
  padding: 8px 10px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
}

:global(.nodecfg-node:hover) {
  border-color: var(--map-sky);
}

:global(.nodecfg-node.is-active) {
  border-color: var(--map-sky);
  background: rgb(2 132 199 / 18%);
  color: var(--color-text-strong);
}

:global(.nodecfg-main) {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  overflow-y: auto;
  box-sizing: border-box;
}

:global(.nodecfg-section) {
  padding: 10px 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
}

:global(.nodecfg-section + .nodecfg-section) {
  margin-top: 10px;
}

:global(.nodecfg-section__title) {
  margin-bottom: 8px;
  color: var(--map-sky-soft);
  font-size: 13px;
  font-weight: 700;
}

:global(.nodecfg-anchors) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:global(.nodecfg-anchor) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #0f172a;
}

:global(.nodecfg-anchor__index) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgb(56 189 248 / 16%);
  color: var(--map-sky-soft);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

:global(.nodecfg-anchor__info) {
  flex: 1;
  min-width: 0;
}

:global(.nodecfg-anchor__label) {
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
}

:global(.nodecfg-anchor__desc) {
  display: block;
  color: #64748b;
  font-size: 10px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.nodecfg-anchor__ops) {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

:global(.nodecfg-anchor__ops button) {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
}

:global(.nodecfg-anchor__ops button:disabled) {
  opacity: 0.35;
  cursor: not-allowed;
}

:global(.nodecfg-anchor__ops button:hover:not(:disabled)) {
  color: var(--map-sky);
  border-color: var(--map-sky);
}

:global(.nodecfg-add-anchor) {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

:global(.nodecfg-buffer),
:global(.nodecfg-anchor-select) {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #475569;
  border-radius: 5px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

:global(.nodecfg-check) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: #cbd5e1;
  font-size: 12px;
  cursor: pointer;
}

:global(.nodecfg-check input) {
  accent-color: var(--map-sky);
}

:global(.nodecfg-footer) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid #1e293b;
  background: #1e293b;
}

:global(.nodecfg-footer__tip) {
  margin-right: auto;
  color: var(--color-success);
  font-size: 12px;
}

:global(.nodecfg-footer__reset) {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #475569;
  border-radius: 5px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

:global(.nodecfg-footer__save) {
  height: 30px;
  padding: 0 20px;
  border: 1px solid var(--map-sky);
  border-radius: 5px;
  background: linear-gradient(180deg, #0284c7, #0369a1);
  color: var(--color-text-strong);
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
}
</style>
