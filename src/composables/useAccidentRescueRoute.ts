import { computed, onMounted, onUnmounted, ref, watch, isRef, type Ref } from 'vue';
import { formatDateTimeLabel } from '@/utils/formatDateTime';
import {
  getSharedMap,
  onSharedMapReady,
  sharedMapReady,
  type SharedCesiumMapExpose,
} from './sharedCesiumBridge';
import {
  accidentRescueRouteWaypoints,
  type RescueRouteWaypoint,
} from '@/services/map-data/accidentRescueMock';

export interface ScreenPoint {
  x: number;
  y: number;
}

/** 设计稿路径_0004 默认朝右（东） */
const VEHICLE_ICON_DEFAULT_DEG = 0;

function screenPosChanged(
  prev: ScreenPoint | null | undefined,
  next: ScreenPoint | null | undefined,
  threshold = 0.5,
) {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  return Math.abs(prev.x - next.x) > threshold || Math.abs(prev.y - next.y) > threshold;
}

function segmentLength(a: RescueRouteWaypoint, b: RescueRouteWaypoint) {
  const dLon = b.longitude - a.longitude;
  const dLat = b.latitude - a.latitude;
  return Math.hypot(dLon, dLat);
}

function interpolateWaypoints(waypoints: RescueRouteWaypoint[], t: number): RescueRouteWaypoint {
  if (waypoints.length === 0) {
    return { longitude: 0, latitude: 0 };
  }
  if (waypoints.length === 1 || t <= 0) return waypoints[0]!;
  if (t >= 1) return waypoints[waypoints.length - 1]!;

  const segments = waypoints.slice(1).map((point, index) => ({
    from: waypoints[index]!,
    to: point,
    len: segmentLength(waypoints[index]!, point),
  }));
  const total = segments.reduce((sum, seg) => sum + seg.len, 0);
  let remain = t * total;

  for (const seg of segments) {
    if (remain <= seg.len || seg === segments[segments.length - 1]) {
      const ratio = seg.len > 0 ? Math.min(1, remain / seg.len) : 0;
      return {
        longitude: seg.from.longitude + (seg.to.longitude - seg.from.longitude) * ratio,
        latitude: seg.from.latitude + (seg.to.latitude - seg.from.latitude) * ratio,
      };
    }
    remain -= seg.len;
  }

  return waypoints[waypoints.length - 1]!;
}

function pointsToPathD(points: ScreenPoint[]): string {
  if (points.length < 2) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

function splitScreenRouteAtProgress(points: ScreenPoint[], t: number) {
  if (points.length < 2) {
    return { traveled: [...points], remaining: [...points] };
  }

  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
    segLens.push(len);
    total += len;
  }

  if (total <= 0) {
    return { traveled: [points[0]!], remaining: [...points] };
  }

  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  const traveled: ScreenPoint[] = [points[0]!];

  for (let i = 0; i < segLens.length; i++) {
    const segLen = segLens[i]!;
    if (acc + segLen >= target) {
      const ratio = segLen > 0 ? (target - acc) / segLen : 0;
      const split = {
        x: points[i]!.x + (points[i + 1]!.x - points[i]!.x) * ratio,
        y: points[i]!.y + (points[i + 1]!.y - points[i]!.y) * ratio,
      };
      traveled.push(split);
      return { traveled, remaining: [split, ...points.slice(i + 1)] };
    }
    acc += segLen;
    traveled.push(points[i + 1]!);
  }

  return { traveled: [...points], remaining: [points[points.length - 1]!] };
}

function attachVehicleToPath(points: ScreenPoint[], vehicle: ScreenPoint | null): ScreenPoint[] {
  if (!vehicle || points.length === 0) return points;
  if (points.length === 1) return [vehicle];
  const merged = [...points];
  merged[merged.length - 1] = vehicle;
  return merged;
}

function headingFromScreenPoints(points: ScreenPoint[], t: number): number {
  const delta = 0.01;
  const t0 = Math.max(0, t - delta);
  const t1 = Math.min(1, t + delta);
  if (t1 - t0 < 1e-6) return VEHICLE_ICON_DEFAULT_DEG;

  const { traveled: a } = splitScreenRouteAtProgress(points, t0);
  const { traveled: b } = splitScreenRouteAtProgress(points, t1);
  const p0 = a[a.length - 1];
  const p1 = b[b.length - 1];
  if (!p0 || !p1) return VEHICLE_ICON_DEFAULT_DEG;

  return (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
}

export interface RouteWaypointsConfig {
  points: RescueRouteWaypoint[];
  initialProgress: number;
  endProgress: number;
  durationMs: number;
}

export interface UseAccidentRescueRouteOptions {
  onComplete?: () => void;
  /** 为 false 时不播放路线动画（应急指挥详情静态地图） */
  enabled?: boolean;
  /** 外部控制播放与倍速（救援路线回放） */
  playback?: {
    playing: { value: boolean };
    speed: { value: number };
    /** 0~1，与轨迹进度同步供底部进度条使用 */
    progress?: Ref<number> | { value: number };
  };
  /** 自定义路线节点（安防轨迹等场景） */
  waypoints?: RouteWaypointsConfig;
}

export function useAccidentRescueRoute(
  getHeight: () => number,
  options: UseAccidentRescueRouteOptions = {},
) {
  const waypointConfig = () => options.waypoints ?? accidentRescueRouteWaypoints;

  const routeProgress = ref(waypointConfig().initialProgress);
  const routeScreenPoints = ref<ScreenPoint[]>([]);
  const vehicleScreenPos = ref<ScreenPoint | null>(null);
  const vehicleHeadingDeg = ref(VEHICLE_ICON_DEFAULT_DEG);
  const vehicleTimeText = ref(formatDateTimeLabel(new Date()));
  const routeCompleted = ref(false);

  let removeListener: (() => void) | null = null;
  let offReady: (() => void) | null = null;
  let animFrameId = 0;
  let animStartMs = 0;
  let lastTickMs = 0;
  let elapsedAccMs = 0;
  let clockTimer: ReturnType<typeof setInterval> | null = null;
  let routeFinished = false;
  let completionNotified = false;

  const routeSplit = computed(() =>
    splitScreenRouteAtProgress(routeScreenPoints.value, routeProgress.value),
  );

  const traveledScreenPoints = computed(() =>
    attachVehicleToPath(routeSplit.value.traveled, vehicleScreenPos.value),
  );

  /** 仅已行驶段底层虚线，避免与剩余段虚线叠加重影 */
  const routeBasePathD = computed(() => pointsToPathD(traveledScreenPoints.value));

  const routeRemainingPathD = computed(() => {
    const remaining = routeSplit.value.remaining;
    const junction = traveledScreenPoints.value[traveledScreenPoints.value.length - 1];
    if (!junction || remaining.length < 2) return pointsToPathD(remaining);
    return pointsToPathD([junction, ...remaining.slice(1)]);
  });

  const routeTraveledPathD = computed(() => pointsToPathD(traveledScreenPoints.value));

  const routeGradient = computed(() => {
    const traveled = traveledScreenPoints.value;
    if (traveled.length < 2) return null;
    const start = traveled[0]!;
    const end = traveled[traveled.length - 1]!;
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  });

  const vehicleWorld = computed(() => {
    const pos = interpolateWaypoints(waypointConfig().points, routeProgress.value);
    return { ...pos, height: getHeight() };
  });

  function projectRoute(map: SharedCesiumMapExpose | null) {
    if (!map?.worldToScreen) return;
    const height = getHeight();
    const nextRoute: ScreenPoint[] = [];

    for (const point of waypointConfig().points) {
      const screen = map.worldToScreen(point.longitude, point.latitude, height);
      if (screen) nextRoute.push(screen);
    }

    let routeChanged = nextRoute.length !== routeScreenPoints.value.length;
    if (!routeChanged) {
      for (let i = 0; i < nextRoute.length; i++) {
        if (screenPosChanged(routeScreenPoints.value[i], nextRoute[i])) {
          routeChanged = true;
          break;
        }
      }
    }
    if (routeChanged) routeScreenPoints.value = nextRoute;

    const vehicle = vehicleWorld.value;
    const nextVehicle = map.worldToScreen(vehicle.longitude, vehicle.latitude, vehicle.height);
    if (screenPosChanged(vehicleScreenPos.value, nextVehicle)) {
      vehicleScreenPos.value = nextVehicle;
    }

    vehicleHeadingDeg.value = headingFromScreenPoints(nextRoute, routeProgress.value);
  }

  function attach(map: SharedCesiumMapExpose) {
    removeListener?.();
    removeListener = map.addRenderListener?.(() => projectRoute(map)) ?? null;
    projectRoute(map);
  }

  function detach() {
    removeListener?.();
    removeListener = null;
    routeScreenPoints.value = [];
    vehicleScreenPos.value = null;
  }

  function notifyRouteComplete() {
    if (completionNotified) return;
    completionNotified = true;
    routeCompleted.value = true;
    options.onComplete?.();
  }

  function syncPlaybackProgress(progress = routeProgress.value) {
    const external = options.playback?.progress;
    if (!external) return;
    const { initialProgress, endProgress } = waypointConfig();
    const span = endProgress - initialProgress;
    const normalized = span > 0 ? Math.max(0, Math.min(1, (progress - initialProgress) / span)) : 0;
    if (isRef(external)) {
      external.value = normalized;
      return;
    }
    external.value = normalized;
  }

  function restartRouteAnimation() {
    routeFinished = false;
    completionNotified = false;
    routeCompleted.value = false;
    elapsedAccMs = 0;
    animStartMs = 0;
    lastTickMs = 0;
    routeProgress.value = waypointConfig().initialProgress;
    syncPlaybackProgress();
    projectRoute(getSharedMap());
    cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    if (routeFinished) return;

    if (!animStartMs) animStartMs = now;
    if (!lastTickMs) lastTickMs = now;
    const delta = now - lastTickMs;
    lastTickMs = now;

    const playing = options.playback?.playing?.value ?? true;
    const speed = Math.max(0.25, Number(options.playback?.speed?.value ?? 1));
    if (playing) {
      elapsedAccMs += Math.max(0, delta) * speed;
    }

    const { initialProgress, durationMs, endProgress } = waypointConfig();
    const span = endProgress - initialProgress;

    if (elapsedAccMs >= durationMs) {
      routeProgress.value = endProgress;
      syncPlaybackProgress(endProgress);
      routeFinished = true;
      projectRoute(getSharedMap());
      notifyRouteComplete();
      return;
    }

    routeProgress.value = initialProgress + (elapsedAccMs / durationMs) * span;
    syncPlaybackProgress();
    projectRoute(getSharedMap());
    animFrameId = requestAnimationFrame(tick);
  }

  if (options.playback?.playing) {
    watch(
      () => options.playback!.playing.value,
      (playing, wasPlaying) => {
        if (playing && wasPlaying === false && routeFinished) {
          restartRouteAnimation();
        }
      },
    );
  }

  watch(routeProgress, (value) => syncPlaybackProgress(value), { immediate: true });

  onMounted(() => {
    if (!options.enabled) return;

    vehicleTimeText.value = formatDateTimeLabel(new Date());
    clockTimer = setInterval(() => {
      vehicleTimeText.value = formatDateTimeLabel(new Date());
    }, 1000);

    if (sharedMapReady.value) {
      attach(getSharedMap()!);
    }
    offReady = onSharedMapReady((map) => attach(map));
    routeFinished = false;
    completionNotified = false;
    routeProgress.value = waypointConfig().initialProgress;
    syncPlaybackProgress();
    elapsedAccMs = 0;
    lastTickMs = 0;
    animFrameId = requestAnimationFrame(tick);
  });

  onUnmounted(() => {
    offReady?.();
    offReady = null;
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
    cancelAnimationFrame(animFrameId);
    detach();
  });

  function vehicleMarkerStyle() {
    const pos = vehicleScreenPos.value;
    if (!pos) return { visibility: 'hidden' as const };
    return {
      visibility: 'visible' as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      '--vehicle-heading': `${vehicleHeadingDeg.value - VEHICLE_ICON_DEFAULT_DEG}deg`,
    } as const;
  }

  return {
    routeProgress,
    routeCompleted,
    routeBasePathD,
    routeRemainingPathD,
    routeTraveledPathD,
    routeGradient,
    vehicleMarkerStyle,
    vehicleTimeText,
    vehicleWorld,
    vehicleHeadingDeg,
  };
}
