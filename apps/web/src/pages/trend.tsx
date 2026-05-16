import { useState } from 'react';
import { useWeighIns, type WeighIn } from '@/hooks/use-weigh-ins';
import { TrendChart } from '@/components/trend-chart';
import { Scale, ArrowDown, ArrowUp } from 'lucide-react';

type Range = '2W' | '1M' | 'ALL';

function filterByDays(entries: WeighIn[], days: number) {
  const now = Date.now();
  return entries.filter((e) => {
    const diff = (now - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days;
  });
}

export default function TrendPage() {
  const { entries, trend, isLoading } = useWeighIns(365);
  const [range, setRange] = useState<Range>('1M');

  const rangeDays = range === '2W' ? 14 : range === '1M' ? 30 : 9999;
  const filtered = filterByDays(entries, rangeDays);

  const firstEntry = filtered.length > 0 ? filtered[filtered.length - 1] : null;
  const lastEntry = filtered.length > 0 ? filtered[0] : null;
  const totalChange = firstEntry && lastEntry
    ? Math.round((lastEntry.weight - firstEntry.weight) * 10) / 10
    : null;

  const weekFiltered = filterByDays(entries, 7);
  const weekChange = weekFiltered.length >= 2
    ? Math.round((weekFiltered[0]!.weight - weekFiltered[weekFiltered.length - 1]!.weight) * 10) / 10
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Scale className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-20">
        <Scale className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-bold mb-2">No data yet</h2>
        <p className="text-muted-foreground">Log your first weigh-in to start seeing your trend.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-center mb-4">Your Trend</h1>

      {/* Range Selector */}
      <div className="flex justify-center gap-2 mb-5">
        {(['2W', '1M', 'ALL'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              range === r
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      {filtered.length >= 2 ? (
        <TrendChart entries={filtered} />
      ) : (
        <div className="rounded-xl bg-card h-32 flex items-center justify-center mb-4">
          <p className="text-sm text-muted-foreground">Not enough data for this range</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-xl bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Trend</p>
          <p className="text-2xl font-extrabold mt-1">
            {trend ? `${trend} lb` : entries.length < 5 ? 'Building...' : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
          {weekChange !== null ? (
            <p className={`text-2xl font-extrabold mt-1 flex items-center gap-1 ${
              weekChange <= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {weekChange <= 0 ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
              {Math.abs(weekChange)} lb
            </p>
          ) : (
            <p className="text-2xl font-extrabold mt-1">—</p>
          )}
        </div>
        <div className="rounded-xl bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Change</p>
          {totalChange !== null ? (
            <p className={`text-2xl font-extrabold mt-1 flex items-center gap-1 ${
              totalChange <= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {totalChange <= 0 ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
              {Math.abs(totalChange)} lb
            </p>
          ) : (
            <p className="text-2xl font-extrabold mt-1">—</p>
          )}
        </div>
        <div className="rounded-xl bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Days Tracked</p>
          <p className="text-2xl font-extrabold mt-1">{filtered.length}</p>
        </div>
      </div>

      {entries.length < 5 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          Keep logging daily — your trend line starts after 5 days
        </p>
      )}
    </div>
  );
}
