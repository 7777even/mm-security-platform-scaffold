<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  personBlacklist,
  vehicleBlacklist,
  type BlacklistPersonItem,
  type BlacklistVehicleItem,
} from '../../../lib/data/blacklistMock';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref<'vehicle' | 'person'>('vehicle');

watch(
  () => props.open,
  (visible) => {
    if (visible) activeTab.value = 'vehicle';
  },
);

function removeVehicle(item: BlacklistVehicleItem) {
  const index = vehicleBlacklist.findIndex((v) => v.id === item.id);
  if (index >= 0) vehicleBlacklist.splice(index, 1);
}

function removePerson(item: BlacklistPersonItem) {
  const index = personBlacklist.findIndex((p) => p.id === item.id);
  if (index >= 0) personBlacklist.splice(index, 1);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="blacklist-fade">
      <div v-if="open" class="blacklist" @click.self="emit('close')">
        <section class="blacklist__dialog" role="dialog" aria-modal="true" aria-label="黑名单">
          <header class="blacklist__header">
            <h3 class="blacklist__title">黑名单</h3>
            <button type="button" class="blacklist__close" @click="emit('close')">×</button>
          </header>

          <div class="blacklist__body">
            <div class="blacklist__tabs">
              <button
                type="button"
                class="blacklist__tab"
                :class="{ 'blacklist__tab--active': activeTab === 'vehicle' }"
                @click="activeTab = 'vehicle'"
              >
                车辆黑名单
              </button>
              <button
                type="button"
                class="blacklist__tab"
                :class="{ 'blacklist__tab--active': activeTab === 'person' }"
                @click="activeTab = 'person'"
              >
                人员黑名单
              </button>
            </div>

            <div class="blacklist__table-wrap">
              <table v-if="activeTab === 'vehicle'" class="blacklist__table">
                <thead>
                  <tr>
                    <th>车牌号</th>
                    <th>拉黑原因</th>
                    <th>拉黑时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in vehicleBlacklist" :key="item.id">
                    <td>{{ item.plate }}</td>
                    <td>{{ item.reason }}</td>
                    <td class="blacklist__time">{{ item.time }}</td>
                    <td>
                      <span
                        class="blacklist__status"
                        :class="{ 'blacklist__status--disabled': item.status === '已解除' }"
                      >
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="blacklist__row-btn" @click="removeVehicle(item)">
                        移除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table v-else class="blacklist__table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>证件号</th>
                    <th>拉黑原因</th>
                    <th>拉黑时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in personBlacklist" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.idCard }}</td>
                    <td>{{ item.reason }}</td>
                    <td class="blacklist__time">{{ item.time }}</td>
                    <td>
                      <span
                        class="blacklist__status"
                        :class="{ 'blacklist__status--disabled': item.status === '已解除' }"
                      >
                        {{ item.status }}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="blacklist__row-btn" @click="removePerson(item)">
                        移除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.blacklist {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.blacklist__dialog {
  display: flex;
  flex-direction: column;
  width: min(900px, 100%);
  height: min(560px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.blacklist__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.blacklist__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.blacklist__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.blacklist__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px;
  gap: 10px;
}

.blacklist__tabs {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.blacklist__tab {
  height: 32px;
  padding: 0 18px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--map-device-offline);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.blacklist__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 50%);
}

.blacklist__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
}

.blacklist__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--map-layer-divider);
}

.blacklist__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
}

.blacklist__table td {
  padding: 10px;
  border-bottom: 1px solid var(--list-divider);
}

.blacklist__time {
  white-space: nowrap;
}

.blacklist__status {
  color: #ff6b5a;
}

.blacklist__status--disabled {
  color: var(--map-device-offline);
}

.blacklist__row-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.blacklist-fade-enter-active,
.blacklist-fade-leave-active {
  transition: opacity 0.22s ease;
}

.blacklist-fade-enter-from,
.blacklist-fade-leave-to {
  opacity: 0;
}
</style>
