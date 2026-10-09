import { useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import {
  AGGREGATION_LABELS,
  AGGREGATIONS,
  describeRules,
  DIRECTION_LABELS,
  DIRECTIONS,
  formatScore,
  leaderboardSchema,
  METRIC_TYPES,
  METRICS,
  TIME_WINDOWS,
  WINDOW_LABELS,
  type LeaderboardFormData,
  type MetricType,
} from '@bigdogs/shared';
import { cn } from '@/lib/utils';
import { ErrorText, inputClass, primaryButtonClass } from '@/components/ui';

export type LeaderboardValues = LeaderboardFormData;

const ICONS = [
  '🏆',
  '🧗',
  '💪',
  '⛳',
  '🏀',
  '🎯',
  '🧊',
  '✈️',
  '🌽',
  '🏓',
  '⏱️',
  '🧠',
  '🎳',
  '🥏',
  '🪵',
  '🍩',
];

const DURATION_PRECISION = ['Whole seconds', 'Tenths (1.2s)', 'Hundredths (1.23s)', 'Thousandths'];

// A sample value per metric so the preview shows something realistic
const SAMPLE: Record<MetricType, { score: number; made: number | null; attempts: number | null }> =
  {
    duration: { score: 72_437, made: null, attempts: null },
    count: { score: 18, made: null, attempts: null },
    points: { score: 21, made: null, attempts: null },
    distance: { score: 47.25, made: null, attempts: null },
    weight: { score: 225, made: null, attempts: null },
    made_of_attempts: { score: 0.7, made: 7, attempts: 10 },
  };

function defaultsForMetric(type: MetricType): Partial<LeaderboardValues> {
  const m = METRICS[type];
  return {
    metric_type: type,
    unit: m.defaultUnit,
    decimals: m.defaultDecimals,
    direction: m.defaultDirection,
    default_attempts: type === 'made_of_attempts' ? 10 : null,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function Choice({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:bg-muted/40 disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}

export function LeaderboardForm({
  initial,
  shapeLocked = false,
  submitLabel,
  onSubmit,
}: {
  initial: LeaderboardValues;
  /** Metric and entrant settings can't change once a board has entries. */
  shapeLocked?: boolean;
  submitLabel: string;
  onSubmit: (
    values: ReturnType<typeof leaderboardSchema.parse>,
  ) => Promise<{ error: string | null }>;
}) {
  const [v, setV] = useState<LeaderboardValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<LeaderboardValues>) => setV((cur) => ({ ...cur, ...patch }));

  const metric = METRICS[v.metric_type];
  const isX = v.metric_type === 'made_of_attempts';
  const showDirection = !isX && v.aggregation !== 'entry_count';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = leaderboardSchema.safeParse(v);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    setBusy(true);
    const { error: err } = await onSubmit(parsed.data);
    setBusy(false);
    setError(err);
  };

  const preview = formatScore(v, v.aggregation, SAMPLE[v.metric_type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-3">
        <input
          value={v.icon}
          onChange={(e) => set({ icon: e.target.value })}
          aria-label="Icon"
          maxLength={16}
          className={cn(inputClass, 'w-14 text-center text-xl')}
        />
        <input
          value={v.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Board name"
          aria-label="Board name"
          className={cn(inputClass, 'text-base font-semibold')}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => set({ icon })}
            aria-label={`Use ${icon}`}
            className={cn(
              'h-9 w-9 rounded-lg text-lg hover:bg-muted/50',
              v.icon === icon && 'bg-primary/15 ring-1 ring-primary',
            )}
          >
            {icon}
          </button>
        ))}
      </div>
      <textarea
        value={v.description ?? ''}
        onChange={(e) => set({ description: e.target.value || null })}
        placeholder="Rules, location, bragging rights… (optional)"
        aria-label="Description"
        rows={2}
        className={inputClass}
      />

      {shapeLocked && (
        <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          This board has scores, so what it measures and who competes are locked.
        </p>
      )}

      <Field label="What are you measuring?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {METRIC_TYPES.map((type) => (
            <Choice
              key={type}
              selected={v.metric_type === type}
              disabled={shapeLocked && v.metric_type !== type}
              onClick={() => set(defaultsForMetric(type))}
            >
              <span className="block font-semibold">{METRICS[type].label}</span>
              <span className="block text-xs text-muted-foreground">
                {METRICS[type].description}
              </span>
            </Choice>
          ))}
        </div>
      </Field>

      {v.metric_type !== 'duration' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label={isX ? 'What are they?' : 'Unit'}>
            {metric.unitOptions ? (
              <select
                value={v.unit}
                onChange={(e) => set({ unit: e.target.value })}
                aria-label="Unit"
                className={inputClass}
              >
                {metric.unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={v.unit}
                onChange={(e) => set({ unit: e.target.value })}
                placeholder={metric.defaultUnit}
                aria-label="Unit"
                className={inputClass}
              />
            )}
          </Field>
          {isX ? (
            <Field label="Usually out of">
              <input
                type="number"
                min={1}
                value={v.default_attempts ?? ''}
                onChange={(e) =>
                  set({ default_attempts: e.target.value ? Number(e.target.value) : null })
                }
                aria-label="Usually out of"
                className={inputClass}
              />
            </Field>
          ) : (
            v.metric_type !== 'count' && (
              <Field label="Decimals">
                <select
                  value={v.decimals}
                  onChange={(e) => set({ decimals: Number(e.target.value) })}
                  aria-label="Decimals"
                  className={inputClass}
                >
                  {[0, 1, 2, 3].map((d) => (
                    <option key={d} value={d}>
                      {d === 0 ? 'None' : (1.5).toFixed(d)}
                    </option>
                  ))}
                </select>
              </Field>
            )
          )}
        </div>
      )}

      {v.metric_type === 'duration' && (
        <Field label="Precision">
          <select
            value={v.decimals}
            onChange={(e) => set({ decimals: Number(e.target.value) })}
            aria-label="Precision"
            className={inputClass}
          >
            {DURATION_PRECISION.map((label, d) => (
              <option key={label} value={d}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="How do scores count?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AGGREGATIONS.map((agg) => (
            <Choice
              key={agg}
              selected={v.aggregation === agg}
              onClick={() => set({ aggregation: agg })}
            >
              <span className="block font-semibold">{AGGREGATION_LABELS[agg].label}</span>
              <span className="block text-xs text-muted-foreground">
                {AGGREGATION_LABELS[agg].description}
              </span>
            </Choice>
          ))}
        </div>
      </Field>

      {showDirection && (
        <Field label="Who wins?">
          <div className="grid grid-cols-2 gap-2">
            {DIRECTIONS.map((d) => (
              <Choice key={d} selected={v.direction === d} onClick={() => set({ direction: d })}>
                <span className="font-semibold">{DIRECTION_LABELS[d]}</span>
              </Choice>
            ))}
          </div>
        </Field>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Who competes?">
          <div className="grid grid-cols-2 gap-2">
            <Choice
              selected={v.entrant_type === 'player'}
              disabled={shapeLocked && v.entrant_type !== 'player'}
              onClick={() => set({ entrant_type: 'player', team_size: null })}
            >
              <span className="font-semibold">Players</span>
            </Choice>
            <Choice
              selected={v.entrant_type === 'team'}
              disabled={shapeLocked && v.entrant_type !== 'team'}
              onClick={() => set({ entrant_type: 'team', team_size: v.team_size ?? 2 })}
            >
              <span className="font-semibold">Teams</span>
            </Choice>
          </div>
          {v.entrant_type === 'team' && (
            <label className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Players per team</span>
              <input
                type="number"
                min={2}
                max={10}
                value={v.team_size ?? 2}
                disabled={shapeLocked}
                onChange={(e) => set({ team_size: Number(e.target.value) })}
                aria-label="Players per team"
                className={cn(inputClass, 'w-20')}
              />
            </label>
          )}
        </Field>
        <Field label="Show by default">
          <select
            value={v.default_window}
            onChange={(e) =>
              set({ default_window: e.target.value as LeaderboardValues['default_window'] })
            }
            aria-label="Default time window"
            className={inputClass}
          >
            {TIME_WINDOWS.map((w) => (
              <option key={w} value={w}>
                {WINDOW_LABELS[w]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-xl border border-dashed border-border p-3 text-sm">
        <p className="text-muted-foreground">
          {describeRules(v)} · scores look like{' '}
          <span className="font-semibold text-foreground">{preview}</span>
        </p>
      </div>

      <ErrorText>{error}</ErrorText>
      <button type="submit" disabled={busy} className={cn(primaryButtonClass, 'w-full py-3')}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
