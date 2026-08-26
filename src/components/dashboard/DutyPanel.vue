<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchDutyRoster, type DutyPerson, type DutyRoster } from '@/services/duty';

const roster = ref<DutyRoster | null>(null);

const persons = computed<DutyPerson[]>(() => roster.value?.persons ?? []);

onMounted(async () => {
  roster.value = await fetchDutyRoster();
});
</script>

<template>
  <div class="duty" data-test="duty-toolbar">
    <ul class="duty-list">
      <li v-for="p in persons" :key="p.id" class="duty-item">
        <span class="status-dot" :class="{ online: p.online }" />
        <div class="duty-meta">
          <span class="duty-name">{{ p.name }}</span>
          <span class="duty-role">{{ p.role }}</span>
        </div>
        <span class="duty-phone">{{ p.phone }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.duty-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.duty-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel-soft);
}

.status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--color-text-muted);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-text-muted) 18%, transparent);
}

.status-dot.online {
  background: var(--color-success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 22%, transparent);
}

.duty-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
}

.duty-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.duty-role {
  font-size: 12px;
  color: var(--color-text-muted);
}

.duty-phone {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
