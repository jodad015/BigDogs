import type { WeighIn } from '@/hooks/use-weigh-ins';

interface TrendChartProps {
  entries: WeighIn[];
}

export function TrendChart({ entries }: TrendChartProps) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((e) => e.weight);
  const trends = sorted.map((e) => e.trend_weight).filter((t): t is number => t !== null);

  const allValues = [...weights, ...trends];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const width = 400;
  const height = 140;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const toX = (i: number) => padding.left + (i / (sorted.length - 1)) * chartW;
  const toY = (val: number) => padding.top + (1 - (val - min) / range) * chartH;

  // Daily weight dots + line
  const weightPoints = weights.map((w, i) => `${toX(i)},${toY(w)}`);
  const weightLine = weightPoints.join(' ');

  // Trend line (smoother)
  const trendPoints = trends.length >= 2
    ? trends.map((t, i) => {
        const idx = sorted.length - trends.length + i;
        return `${toX(idx)},${toY(t)}`;
      }).join(' ')
    : null;

  // X-axis labels (first, middle, last)
  const labelIndices = [0, Math.floor(sorted.length / 2), sorted.length - 1];
  const formatLabel = (date: string) => {
    const d = new Date(date + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Y-axis range labels
  const yMin = Math.floor(min);
  const yMax = Math.ceil(max);

  return (
    <div className="rounded-xl bg-card overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + pct * chartH}
            y2={padding.top + pct * chartH}
            stroke="var(--color-border)"
            strokeWidth="0.5"
          />
        ))}

        {/* Daily weight line */}
        <polyline
          points={weightLine}
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />

        {/* Daily weight dots */}
        {weights.map((w, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(w)}
            r="2.5"
            fill="var(--color-muted-foreground)"
            opacity="0.5"
          />
        ))}

        {/* Trend line */}
        {trendPoints && (
          <polyline
            points={trendPoints}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X-axis labels */}
        {labelIndices.map((idx) => (
          <text
            key={idx}
            x={toX(idx)}
            y={height - 4}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
            fontSize="10"
          >
            {formatLabel(sorted[idx].date)}
          </text>
        ))}

        {/* Y-axis labels */}
        <text x={width - padding.right} y={padding.top - 4} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="9">{yMax}</text>
        <text x={width - padding.right} y={padding.top + chartH + 2} textAnchor="end" fill="var(--color-muted-foreground)" fontSize="9">{yMin}</text>
      </svg>
    </div>
  );
}
