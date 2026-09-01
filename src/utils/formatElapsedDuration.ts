export interface ElapsedParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function parseIncidentStartTime(value: string): Date {
  const normalized = value.trim().replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function getElapsedParts(start: Date, now: Date): ElapsedParts {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

/** 格式：已持续XX年XX月XX日XX小时XX分XX秒；为 0 的单位不显示 */
export function formatElapsedDuration(parts: ElapsedParts): string {
  const segments: string[] = [];

  if (parts.years > 0) segments.push(`${parts.years}年`);
  if (parts.months > 0) segments.push(`${parts.months}月`);
  if (parts.days > 0) segments.push(`${parts.days}日`);
  if (parts.hours > 0) segments.push(`${parts.hours}小时`);
  if (parts.minutes > 0) segments.push(`${parts.minutes}分`);
  segments.push(`${parts.seconds}秒`);

  return `已持续 ${segments.join('')}`;
}
