import { useMemo, useState } from 'react';
import { useWeighIns, type WeighIn } from '@/hooks/use-weigh-ins';
import { TrendChart } from '@/components/trend-chart';
import { ChevronLeft, ChevronRight, CalendarDays, ArrowDown, ArrowUp } from 'lucide-react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Mode = 'single' | 'range';

function ymd(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatLongDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryPage() {
  const { entries, isLoading } = useWeighIns(365);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [mode, setMode] = useState<Mode>('single');
  const [selectedDate, setSelectedDate] = useState<string | null>(() => ymd(new Date()));
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const todayStr = ymd(new Date());
  const thisMonthStart = startOfMonth(new Date());

  const byDate = useMemo(() => {
    const map = new Map<string, WeighIn>();
    for (const e of entries) map.set(e.date, e);
    return map;
  }, [entries]);

  const cells = useMemo(() => {
    const firstOfMonth = viewMonth;
    const firstWeekday = firstOfMonth.getDay();
    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - firstWeekday);

    const result: { date: Date; iso: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      result.push({
        date: d,
        iso: ymd(d),
        inMonth: d.getMonth() === firstOfMonth.getMonth(),
      });
    }
    return result;
  }, [viewMonth]);

  const canGoForward = viewMonth < thisMonthStart;
  const monthLogged = cells.filter((c) => c.inMonth && byDate.has(c.iso)).length;

  const handleCellClick = (iso: string, isFuture: boolean) => {
    if (isFuture) return;
    if (mode === 'single') {
      setSelectedDate(iso);
      return;
    }
    // Range mode
    if (rangeStart === null || rangeEnd !== null) {
      // start a new range
      setRangeStart(iso);
      setRangeEnd(null);
      return;
    }
    // we have a start, fill the end
    if (iso === rangeStart) return;
    const [s, e] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso];
    setRangeStart(s);
    setRangeEnd(e);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    if (next === 'range') {
      setRangeStart(selectedDate);
      setRangeEnd(null);
    } else {
      setSelectedDate(rangeStart ?? todayStr);
    }
  };

  const selectedEntry = mode === 'single' && selectedDate ? byDate.get(selectedDate) ?? null : null;

  const rangeEntries = useMemo(() => {
    if (mode !== 'range' || !rangeStart || !rangeEnd) return [];
    return entries
      .filter((e) => e.date >= rangeStart && e.date <= rangeEnd)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [mode, rangeStart, rangeEnd, entries]);

  const rangeStats = useMemo(() => {
    if (rangeEntries.length < 2) return null;
    const first = rangeEntries[0]!;
    const last = rangeEntries[rangeEntries.length - 1]!;
    const rawChange = Math.round((last.weight - first.weight) * 10) / 10;
    const trendChange =
      first.trend_weight !== null && last.trend_weight !== null
        ? Math.round((last.trend_weight - first.trend_weight) * 10) / 10
        : null;
    return { rawChange, trendChange, first, last };
  }, [rangeEntries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CalendarDays className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center mb-4">History</h1>

      {/* Mode toggle */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex rounded-full bg-card p-1">
          {(['single', 'range'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'single' ? 'Day' : 'Range'}
            </button>
          ))}
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          className="p-2 rounded-lg hover:bg-card transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="text-center">
          <p className="font-bold">{formatMonth(viewMonth)}</p>
          <p className="text-xs text-muted-foreground">{monthLogged} day{monthLogged === 1 ? '' : 's'} logged</p>
        </div>
        <button
          onClick={() => canGoForward && setViewMonth(addMonths(viewMonth, 1))}
          disabled={!canGoForward}
          className="p-2 rounded-lg hover:bg-card transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isFuture = cell.iso > todayStr;
          const isToday = cell.iso === todayStr;
          const entry = byDate.get(cell.iso);
          const logged = !!entry;

          const isSingleSelected = mode === 'single' && cell.iso === selectedDate && logged;
          const isRangeAnchor = mode === 'range' && (cell.iso === rangeStart || cell.iso === rangeEnd);
          const isInRange =
            mode === 'range' &&
            rangeStart !== null &&
            rangeEnd !== null &&
            cell.iso > rangeStart &&
            cell.iso < rangeEnd;

          const primaryFill = isSingleSelected || isRangeAnchor;
          const rangeFill = isInRange;
          const cardFill = !primaryFill && !rangeFill && logged;

          return (
            <button
              key={cell.iso}
              onClick={() => handleCellClick(cell.iso, isFuture)}
              disabled={isFuture}
              className={[
                'aspect-square rounded-lg flex flex-col items-center justify-center transition-colors px-0.5',
                cell.inMonth ? '' : 'opacity-30',
                isFuture ? 'opacity-30' : '',
                primaryFill ? 'bg-primary text-primary-foreground' : '',
                rangeFill ? 'bg-primary/15' : '',
                cardFill ? 'bg-card hover:bg-muted/50' : '',
                isToday && !primaryFill ? 'ring-1 ring-primary' : '',
              ].join(' ')}
            >
              <span className={`text-xs font-semibold leading-tight ${primaryFill ? '' : !logged ? 'text-muted-foreground' : ''}`}>
                {cell.date.getDate()}
              </span>
              {logged && (
                <span className={`text-[9px] leading-tight mt-0.5 ${primaryFill ? 'opacity-90' : 'text-muted-foreground'}`}>
                  {entry!.weight.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="mt-5">
        {mode === 'single' ? (
          selectedEntry ? (
            <div className="rounded-xl bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {formatLongDate(selectedEntry.date)}
              </p>
              <p className="text-3xl font-extrabold mt-1">
                {selectedEntry.weight}
                <span className="text-base font-semibold text-muted-foreground ml-1">lb</span>
              </p>
              {selectedEntry.trend_weight !== null && (
                <p className="text-sm text-muted-foreground mt-1">
                  Trend: <span className="font-semibold text-foreground">{selectedEntry.trend_weight} lb</span>
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {selectedDate
                  ? `No weigh-in on ${formatLongDate(selectedDate)}`
                  : 'Tap a logged day to see details'}
              </p>
            </div>
          )
        ) : (
          <RangeDetail
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            rangeEntries={rangeEntries}
            rangeStats={rangeStats}
          />
        )}
      </div>
    </div>
  );
}

interface RangeDetailProps {
  rangeStart: string | null;
  rangeEnd: string | null;
  rangeEntries: WeighIn[];
  rangeStats: {
    rawChange: number;
    trendChange: number | null;
    first: WeighIn;
    last: WeighIn;
  } | null;
}

function RangeDetail({ rangeStart, rangeEnd, rangeEntries, rangeStats }: RangeDetailProps) {
  if (rangeStart === null) {
    return (
      <div className="rounded-xl bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Tap a date to start a range</p>
      </div>
    );
  }
  if (rangeEnd === null) {
    return (
      <div className="rounded-xl bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Start: <span className="font-semibold text-foreground">{formatShortDate(rangeStart)}</span> — tap a second date
        </p>
      </div>
    );
  }
  if (!rangeStats || rangeEntries.length < 2) {
    return (
      <div className="rounded-xl bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {formatShortDate(rangeStart)} — {formatShortDate(rangeEnd)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Need at least two weigh-ins in this range
        </p>
      </div>
    );
  }

  const { rawChange, trendChange } = rangeStats;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-card p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {formatShortDate(rangeStart)} — {formatShortDate(rangeEnd)}
        </p>
        <p className={`text-3xl font-extrabold mt-1 flex items-center gap-1 ${
          rawChange <= 0 ? 'text-success' : 'text-destructive'
        }`}>
          {rawChange <= 0 ? <ArrowDown className="w-6 h-6" /> : <ArrowUp className="w-6 h-6" />}
          {Math.abs(rawChange)}
          <span className="text-base font-semibold text-muted-foreground ml-1">lb</span>
        </p>
        {trendChange !== null && (
          <p className="text-sm text-muted-foreground mt-1">
            Trend: <span className="font-semibold text-foreground">
              {trendChange > 0 ? '+' : trendChange < 0 ? '−' : ''}{Math.abs(trendChange)} lb
            </span>
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {rangeEntries.length} weigh-ins
        </p>
      </div>

      <TrendChart entries={rangeEntries} />
    </div>
  );
}
