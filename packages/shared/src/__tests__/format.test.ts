import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatEntryValue,
  formatScore,
  formatScoreDetail,
  parseDuration,
  parseEntryValue,
} from '../leaderboard/format';

const duration = { metric_type: 'duration', unit: 'sec', decimals: 1 };
const reps = { metric_type: 'count', unit: 'reps', decimals: 0 };
const putts = { metric_type: 'made_of_attempts', unit: 'putts', decimals: 0 };
const feet = { metric_type: 'distance', unit: 'ft', decimals: 1 };

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(58_900, 1)).toBe('58.9s');
    expect(formatDuration(72_400, 1)).toBe('1:12.4');
    expect(formatDuration(3_723_000, 0)).toBe('1:02:03');
    expect(formatDuration(48_230, 2)).toBe('48.23s');
  });

  it('rounds up across minute boundaries', () => {
    expect(formatDuration(59_960, 1)).toBe('1:00.0');
  });
});

describe('parseDuration', () => {
  it('accepts seconds and stopwatch formats', () => {
    expect(parseDuration('72.4')).toBe(72_400);
    expect(parseDuration('72.4s')).toBe(72_400);
    expect(parseDuration('1:12.4')).toBe(72_400);
    expect(parseDuration('1:02:03.5')).toBe(3_723_500);
  });

  it('rejects junk and zero', () => {
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('1:75')).toBeNull();
    expect(parseDuration('0')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });
});

describe('parseEntryValue', () => {
  it('parses durations to milliseconds', () => {
    expect(parseEntryValue(duration, '1:05')).toEqual({ ok: true, value: 65_000, attempts: null });
  });

  it('requires whole counts', () => {
    expect(parseEntryValue(reps, '12')).toEqual({ ok: true, value: 12, attempts: null });
    expect(parseEntryValue(reps, '12.5').ok).toBe(false);
  });

  it('validates made of attempts', () => {
    expect(parseEntryValue(putts, '7', '10')).toEqual({ ok: true, value: 7, attempts: 10 });
    expect(parseEntryValue(putts, '11', '10').ok).toBe(false);
    expect(parseEntryValue(putts, '7', '').ok).toBe(false);
  });

  it('rejects negatives and blanks', () => {
    expect(parseEntryValue(feet, '-3').ok).toBe(false);
    expect(parseEntryValue(feet, '').ok).toBe(false);
  });
});

describe('formatScore', () => {
  it('formats by metric', () => {
    expect(formatScore(duration, 'best', { score: 81_200, made: null, attempts: null })).toBe(
      '1:21.2',
    );
    expect(formatScore(reps, 'best', { score: 18, made: null, attempts: null })).toBe('18 reps');
    expect(formatScore(feet, 'best', { score: 47, made: null, attempts: null })).toBe('47.0 ft');
  });

  it('shows made/attempts with a percentage detail', () => {
    const standing = { score: 0.7, made: 14, attempts: 20 };
    expect(formatScore(putts, 'sum', standing)).toBe('14/20');
    expect(formatScoreDetail(putts, 'sum', standing)).toBe('70%');
    expect(formatScore(putts, 'average', standing)).toBe('70% avg');
  });

  it('adds a decimal for averages and labels entry counts', () => {
    expect(formatScore(reps, 'average', { score: 12.25, made: null, attempts: null })).toBe(
      '12.3 reps',
    );
    expect(formatScore(reps, 'entry_count', { score: 1, made: null, attempts: null })).toBe(
      '1 entry',
    );
  });
});

describe('formatEntryValue', () => {
  it('formats single entries', () => {
    expect(formatEntryValue(putts, 7, 10)).toBe('7/10 putts');
    expect(formatEntryValue(duration, 65_000)).toBe('1:05.0');
  });
});
