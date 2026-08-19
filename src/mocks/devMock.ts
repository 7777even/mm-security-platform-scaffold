import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { Pinia } from 'pinia';
import { setActivePinia } from 'pinia';
import { useAlarmStore } from '@/stores/alarm';
import type { AlarmItem } from '@/services/alarm';
import type { ApiResponse } from '@/types';
import {
  overviewFixture,
  trendFixture,
  alarmPageFixture,
  alarmPointsFixture,
  devicePointsFixture,
  riskZonesFixture,
  menusFixture,
  makeAlarm,
} from './fixtures';

// 开发期自包含 mock：拦截 axios 请求返回 B3 包络，并定时推送 synthetic 报警到 store，
// 模拟 `alarm.push` 实时流，使监测预警模块可离线演示。仅当 VITE_USE_DEV_MOCK=true 时由 main.ts 启用。

function envelope<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'OK', data, traceId: `mock-${Date.now()}` };
}

// axios 在 adapter 前会用 baseURL 拼装 config.url（test 环境 baseURL='/api/v1'，dev 环境为绝对 URL）。
// 归一化为不含协议/域名/base 前缀的相对路径，保证各环境都能命中路由。
function normalizePath(raw: string): string {
  let url = raw.replace(/\?.*$/, '');
  url = url.replace(/^https?:\/\/[^/]+/, '');
  url = url.replace(/^\/api\/v1/, '');
  return url;
}

function route(config: InternalAxiosRequestConfig): unknown {
  const url = normalizePath(config.url ?? '');
  const method = (config.method ?? 'get').toUpperCase();
  if (method === 'POST' && url === '/audit/log') return envelope({});
  if (url === '/auth/menus') return envelope(menusFixture);
  if (url === '/dashboard/overview') return envelope(overviewFixture);
  if (url === '/dashboard/alarm-trend') return envelope(trendFixture);
  if (url === '/alarms') return envelope(alarmPageFixture);
  if (url === '/map/alarms') return envelope(alarmPointsFixture);
  if (url === '/map/devices') return envelope(devicePointsFixture);
  if (url === '/dashboard/risk-heatmap') return envelope(riskZonesFixture);
  return envelope(null);
}

export function installDevMock(http: AxiosInstance, pinia: Pinia): void {
  setActivePinia(pinia);

  // 用自定义 adapter 在客户端拦截，阻止任何真实网络请求发出
  http.defaults.adapter = (config: InternalAxiosRequestConfig) =>
    Promise.resolve<AxiosResponse>({
      data: route(config) as ApiResponse<unknown>,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });

  startSyntheticAlarms();
}

let timer: ReturnType<typeof setInterval> | null = null;
let started = false;
function startSyntheticAlarms(): void {
  if (started) return; // HMR 幂等
  started = true;
  const store = useAlarmStore();
  let seq = 1000;
  for (let i = 0; i < 4; i++) store.ingestAlarm(makeAlarm(seq++));
  timer = setInterval(() => {
    const item: AlarmItem = makeAlarm(seq++);
    item.status = 'ACTIVE';
    store.ingestAlarm(item);
  }, 5000);
}

/** 测试清理：停止定时器，避免 vitest 进程挂起。 */
export function stopSyntheticAlarms(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  started = false;
}
