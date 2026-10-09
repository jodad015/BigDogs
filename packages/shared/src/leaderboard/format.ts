import type { Aggregation, MetricType } from './config';

/** The leaderboard fields needed to display or parse a value. */
export interface ValueFormat {
  metric_type: MetricType | string;
  unit: string;
  decimals: number;
}

function fixed(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats milliseconds as a stopwatch reading: "58.9s", "1:12.4", "1:02:03".
 * Rounds rather than truncates so 59.96s at one decimal shows "1:00.0".
 */
export function formatDuration(ms: number, decimals = 1): string {
  const factor = 10 ** decimals;
  const totalUnits = Math.round((ms / 1000) * factor);
  const totalSeconds = Math.floor(totalUnits / factor);
  const fraction = totalUnits % factor;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const fractionStr = decimals > 0 ? `.${String(fraction).padStart(decimals, '0')}` : '';

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${fractionStr}`;
  }
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}${fractionStr}`;
  }
  return `${seconds}${fractionStr}s`;
}

/**
 * Parses stopwatch input into milliseconds. Accepts "72.4", "72.4s",
 * "1:12.4" and "1:02:03.5". Returns null for anything else.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim().replace(/s$/i, '');
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(trimmed)) return null;

  const parts = trimmed.split(':');
  const secondsPart = Number(parts.pop());
  const minutes = parts.length > 0 ? Number(parts.pop()) : 0;
  const hours = parts.length > 0 ? Number(parts.pop()) : 0;

  // In "m:ss" form the seconds field must be under 60
  if (trimmed.includes(':') && secondsPart >= 60) return null;

  const ms = Math.round(((hours * 60 + minutes) * 60 + secondsPart) * 1000);
  return ms > 0 ? ms : null;
}

/** Formats a single logged value (one entry). */
export function formatEntryValue(
  format: ValueFormat,
  value: number,
  attempts: number | null = null,
): string {
  switch (format.metric_type) {
    case 'duration':
      return formatDuration(value, format.decimals);
    case 'made_of_attempts':
      return `${fixed(value, 0)}/${fixed(attempts ?? 0, 0)} ${format.unit}`;
    default:
      return `${fixed(value, format.decimals)} ${format.unit}`;
  }
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Formats a standings score, which depends on how entries are aggregated. */
export function formatScore(
  format: ValueFormat,
  aggregation: Aggregation | string,
  standing: { score: number; made: number | null; attempts: number | null },
): string {
  if (aggregation === 'entry_count') {
    return `${standing.score} ${standing.score === 1 ? 'entry' : 'entries'}`;
  }

  if (format.metric_type === 'made_of_attempts') {
    if (aggregation === 'average') return `${formatPercent(standing.score)} avg`;
    return `${fixed(standing.made ?? 0, 0)}/${fixed(standing.attempts ?? 0, 0)}`;
  }

  // Averages get one extra decimal so 12 vs 12.3 reps is visible
  const decimals = aggregation === 'average' ? format.decimals + 1 : format.decimals;
  if (format.metric_type === 'duration') return formatDuration(standing.score, decimals);
  return `${fixed(standing.score, decimals)} ${format.unit}`;
}

/** Secondary text for a made_of_attempts score, e.g. "70%". Null for other metrics. */
export function formatScoreDetail(
  format: ValueFormat,
  aggregation: Aggregation | string,
  standing: { score: number },
): string | null {
  if (format.metric_type !== 'made_of_attempts') return null;
  if (aggregation === 'entry_count' || aggregation === 'average') return null;
  return formatPercent(standing.score);
}

export type ParsedValue =
  | { ok: true; value: number; attempts: number | null }
  | { ok: false; error: string };

/**
 * Parses user input for one entry into the stored value. Durations become
 * milliseconds; made_of_attempts takes the attempts count separately.
 */
export function parseEntryValue(
  format: ValueFormat,
  input: string,
  attemptsInput?: string,
): ParsedValue {
  if (format.metric_type === 'duration') {
    const ms = parseDuration(input);
    return ms === null
      ? { ok: false, error: 'Enter a time like 45.2 or 1:12.4' }
      : { ok: true, value: ms, attempts: null };
  }

  const value = Number(input.trim());
  if (input.trim() === '' || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: 'Enter a number' };
  }

  if (format.metric_type === 'made_of_attempts') {
    const attempts = Number((attemptsInput ?? '').trim());
    if (!Number.isInteger(value) || !Number.isInteger(attempts) || attempts <= 0) {
      return { ok: false, error: 'Enter whole numbers for made and attempts' };
    }
    if (value > attempts) {
      return { ok: false, error: "Made can't be more than attempts" };
    }
    return { ok: true, value, attempts };
  }

  if (format.metric_type === 'count' && !Number.isInteger(value)) {
    return { ok: false, error: 'Enter a whole number' };
  }

  return { ok: true, value, attempts: null };
}
