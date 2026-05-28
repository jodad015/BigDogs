import { useMemo, useState } from 'react';
import { useWeighIns, type WeighIn } from '@/hooks/use-weigh-ins';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

export default function HistoryPage() {
  const { entries, isLoading } = useWeighIns(365);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(() => ymd(new Date()));

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

  const selectedEntry = selectedDate ? byDate.get(selectedDate) ?? null : null;
  const canGoForward = viewMonth < thisMonthStart;
  const monthLogged = cells.filter((c) => c.inMonth && byDate.has(c.iso)).length;

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
          const logged = byDate.has(cell.iso);
          const isSelected = cell.iso === selectedDate;

          return (
            <button
              key={cell.iso}
              onClick={() => logged && setSelectedDate(cell.iso)}
              disabled={!logged}
              className={[
                'aspect-square rounded-lg flex flex-col items-center justify-center transition-colors',
                cell.inMonth ? '' : 'opacity-30',
                isFuture ? 'opacity-30' : '',
                logged && !isSelected ? 'bg-card cursor-pointer hover:bg-muted/50' : '',
                isSelected ? 'bg-primary text-primary-foreground' : '',
                !logged && !isSelected ? 'cursor-default' : '',
                isToday && !isSelected ? 'ring-1 ring-primary' : '',
              ].join(' ')}
            >
              <span className={`text-sm font-semibold ${isSelected ? '' : logged ? '' : 'text-muted-foreground'}`}>
                {cell.date.getDate()}
              </span>
              {logged && (
                <span className={`mt-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="mt-5">
        {selectedEntry ? (
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
        )}
      </div>
    </div>
  );
}
