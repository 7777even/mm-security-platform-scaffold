<!--
  FireStrengthDialog — 消防数据力量（二级界面 strength）
  对标参考救援力量列表/详情：左侧中队列表 + 右侧详情（车辆 / 人员 / 装备）。
  数据消费 fireBrigadeMock（fireBrigadeTeams / getFireBrigadeTeam）。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { allFireBrigadeTeams } from '@/composables/useFireBrigadeView';

const emit = defineEmits<{ close: [] }>();

const selectedId = ref<number>(allFireBrigadeTeams.value[0]?.id ?? 1);
const team = computed(
  () => allFireBrigadeTeams.value.find((t) => t.id === selectedId.value) ?? null,
);

function dutyTone(s: string): 'ok' | 'warn' | 'muted' {
  if (s === '在岗') return 'ok';
  if (s === '备勤') return 'warn';
  return 'muted';
}
function equipTone(s: string): 'ok' | 'warn' | 'danger' {
  if (s === '完好') return 'ok';
  if (s === '待维护') return 'warn';
  return 'danger';
}
</script>

<template>
  <ScreenDialog :open="true" title="消防数据力量" icon="helmet" @close="emit('close')">
    <div class="strength">
      <aside class="strength__list">
        <button
          v-for="t in allFireBrigadeTeams"
          :key="t.id"
          type="button"
          :class="['team', { 'team--active': selectedId === t.id }]"
          @click="selectedId = t.id"
        >
          <span class="team__name">{{ t.name }}</span>
          <span class="team__area">{{ t.area }}</span>
          <span class="team__meta">{{ t.memberCount }} 人 · 队长 {{ t.leaderName }}</span>
        </button>
      </aside>

      <section v-if="team" class="strength__detail">
        <div class="strength__overview">
          <div>
            <b class="num">{{ team.rescuePersonnel }}</b
            ><i>救援人员</i>
          </div>
          <div>
            <b class="num">{{ team.rescueVehicles }}</b
            ><i>救援车辆</i>
          </div>
          <div>
            <b class="num">{{ team.memberCount }}</b
            ><i>编制人数</i>
          </div>
          <div>
            <b>{{ team.location }}</b
            ><i>驻地</i>
          </div>
        </div>

        <div class="block">
          <h4>救援车辆</h4>
          <div class="tbl">
            <div v-for="v in team.vehicles" :key="v.id" class="trow">
              <span class="num">{{ v.plate }}</span>
              <span>{{ v.type }}</span>
              <span
                class="tag"
                :class="
                  v.status === '待命' ? 'is-ok' : v.status === '出动' ? 'is-warn' : 'is-danger'
                "
              >
                {{ v.status }}
              </span>
              <span class="desc">{{ v.parkingLocation }}</span>
            </div>
          </div>
        </div>

        <div class="block">
          <h4>救援人员</h4>
          <div class="tbl">
            <div v-for="p in team.personnel" :key="p.id" class="trow">
              <span>{{ p.name }}</span>
              <span>{{ p.role }}</span>
              <span class="tag" :class="`is-${dutyTone(p.dutyStatus)}`">{{ p.dutyStatus }}</span>
              <span class="num">{{ p.phone }}</span>
            </div>
          </div>
        </div>

        <div class="block">
          <h4>救援装备</h4>
          <div class="tbl">
            <div v-for="e in team.equipment" :key="e.id" class="trow">
              <span>{{ e.name }}</span>
              <span>{{ e.category }}</span>
              <span class="num">{{ e.count }} {{ e.unit }}</span>
              <span class="tag" :class="`is-${equipTone(e.status)}`">{{ e.status }}</span>
            </div>
          </div>
        </div>
      </section>
      <p v-else class="strength__empty">
        <PkgIcon name="helmet" size="36px" class="empty__icon" />
        暂无中队数据
      </p>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.strength {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: var(--space-md);
  height: 100%;
}

.strength__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow: auto;
}

.team {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: var(--panel-inner-bg);
  cursor: pointer;
  text-align: left;
  color: var(--color-text);
}

.team--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.team__name {
  font-size: var(--font-size-biz);
  font-weight: 600;
  color: var(--color-text-strong);
}

.team__area {
  font-size: var(--font-size-helper);
  color: var(--color-accent);
}

.team__meta {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.strength__detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  overflow: auto;
  min-height: 0;
}

.strength__overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.strength__overview div {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.strength__overview b {
  font-family: var(--font-number);
  font-size: var(--font-size-h2);
  font-weight: 700;
  color: var(--color-text-strong);
}

.strength__overview i {
  font-style: normal;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  margin-top: 4px;
}

.block h4 {
  margin: 0 0 8px;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 60%, transparent);
}

.tbl {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trow {
  display: grid;
  grid-template-columns: 120px 1fr 96px 1fr;
  gap: 8px;
  align-items: center;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.trow .num {
  font-family: var(--font-number);
}

.trow .desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.tag {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.tag.is-ok {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
}

.tag.is-warn {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 50%, transparent);
}

.tag.is-danger {
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
}

.tag.is-muted {
  color: var(--color-text-muted);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.strength__empty,
.strength__detail + .strength__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-lg);
}

.empty__icon {
  color: var(--color-text-muted);
}
</style>
