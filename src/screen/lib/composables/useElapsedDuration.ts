import { onMounted, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import {
  formatElapsedDuration,
  getElapsedParts,
  parseIncidentStartTime,
} from '../../utils/formatElapsedDuration';

type TimeInput = MaybeRefOrGetter<string | undefined>;

export interface ElapsedDurationOptions {
  startedAt?: TimeInput;
  endedAt?: TimeInput;
}

function readTime(input?: TimeInput): string | undefined {
  const raw = toValue(input)?.trim();
  return raw || undefined;
}

function isRefLike(value: unknown): value is { value: unknown } {
  return typeof value === 'object' && value !== null && 'value' in value;
}

function isGetter(value: unknown): value is () => string | undefined {
  return typeof value === 'function';
}

export function useElapsedDuration(options?: ElapsedDurationOptions | TimeInput) {
  let opts: ElapsedDurationOptions;
  if (typeof options === 'string' || isRefLike(options) || isGetter(options)) {
    opts = { startedAt: options as TimeInput };
  } else {
    opts = options ?? {};
  }

  const durationText = ref('已持续 0秒');
  let timer: ReturnType<typeof setInterval> | null = null;

  function resolveStartDate(): Date | null {
    const raw = readTime(opts.startedAt);
    if (raw) return parseIncidentStartTime(raw);
    return null;
  }

  function resolveEndDate(): Date | null {
    const raw = readTime(opts.endedAt);
    if (raw) return parseIncidentStartTime(raw);
    return null;
  }

  function update() {
    const start = resolveStartDate();
    if (!start) {
      durationText.value = '已持续 0秒';
      return;
    }
    const end = resolveEndDate() ?? new Date();
    const parts = getElapsedParts(start, end);
    durationText.value = formatElapsedDuration(parts);
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function syncTimer() {
    update();
    clearTimer();
    if (resolveStartDate() && !resolveEndDate()) {
      timer = setInterval(update, 1000);
    }
  }

  onMounted(() => syncTimer());

  onUnmounted(() => clearTimer());

  watch(
    () => [readTime(opts.startedAt), readTime(opts.endedAt)] as const,
    () => syncTimer(),
  );

  return { durationText };
}
