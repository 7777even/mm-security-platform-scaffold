<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchDutyRoster } from '@/services/duty';
import type { DutyPerson, DutyRoster, DutyStatus } from '@/services/duty';

const status = reactive<DutyStatus>({ view3d: true, heatmap: false, labelsDefault: true });
const persons = ref<DutyPerson[]>([]);
const actions = ref<DutyRoster['actions']>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const roster = await fetchDutyRoster();
    if (roster?.status) {
      status.view3d = roster.status.view3d;
      status.heatmap = roster.status.heatmap;
      status.labelsDefault = roster.status.labelsDefault;
    }
    persons.value = roster?.persons ?? [];
    actions.value = roster?.actions ?? [];
  } catch {
    persons.value = [];
    actions.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="值班值守" icon="User">
    <!-- 顶部交互栏：3D 视角 / 热力图 / 标注默认 -->
    <div v-if="!loading" class="duty-toolbar" data-test="duty-toolbar">
      <label class="duty-toolbar__toggle">
        <input type="checkbox" v-model="status.view3d" /> 3D 视角
      </label>
      <label class="duty-toolbar__toggle">
        <input type="checkbox" v-model="status.heatmap" /> 热力图
      </label>
      <label class="duty-toolbar__toggle">
        <input type="checkbox" v-model="status.labelsDefault" /> 标注默认
      </label>
    </div>

    <!-- 4 人值班卡组 -->
    <ul v-if="!loading" class="duty-grid" data-test="duty-grid">
      <li v-for="p in persons" :key="p.id" class="duty-card" :class="{ 'is-offline': !p.online }">
        <span class="duty-card__role">{{ p.role }}</span>
        <span class="duty-card__name">{{ p.name }}</span>
        <span class="duty-card__phone font-number">{{ p.phone }}</span>
      </li>
    </ul>

    <!-- 底部功能按钮 -->
    <div v-if="!loading" class="duty-actions">
      <button v-for="a in actions" :key="a" type="button" class="duty-actions__btn">{{ a }}</button>
    </div>
    <p v-else class="duty-empty">值班信息加载中…</p>
  </PanelCard>
</template>

<style scoped>
.duty-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 6px 0 10px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.18);
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--color-text-secondary, #cbd5e1);
}

.duty-toolbar__toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.duty-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.duty-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 4px 8px;
  align-items: center;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  font-size: 12px;
  transition: border-color 0.15s;
}

.duty-card.is-offline {
  opacity: 0.55;
  border-color: rgba(248, 113, 113, 0.3);
}

.duty-card__role {
  color: var(--color-text-muted, #94a3b8);
  font-size: 11px;
  white-space: nowrap;
}

.duty-card__name {
  color: var(--color-text-primary, #e2e8f0);
  font-weight: 600;
}

.duty-card__phone {
  color: var(--color-accent);
  font-size: 11px;
}

.duty-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.duty-actions__btn {
  flex: 1;
  padding: 6px 0;
  font-size: 12px;
  color: var(--color-text-primary, #e2e8f0);
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.duty-actions__btn:hover {
  background: rgba(0, 212, 255, 0.22);
  border-color: rgba(0, 212, 255, 0.7);
}

.duty-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
  padding: 16px 0;
}
</style>