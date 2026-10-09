import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';

/** One avatar for a player, or overlapping avatars for a team. */
export function CompetitorAvatar({
  avatars,
  className,
}: {
  avatars: string[];
  className?: string;
}) {
  if (avatars.length <= 1) return <Avatar name={avatars[0] ?? 'slate'} className={className} />;
  return (
    <span className="flex shrink-0 -space-x-3">
      {avatars.slice(0, 3).map((a, i) => (
        <Avatar key={i} name={a} className={cn('ring-2 ring-card', className)} />
      ))}
    </span>
  );
}

const MEDALS = ['bg-gold text-black', 'bg-silver text-black', 'bg-bronze text-black'];

export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return (
    <span
      className={cn(
        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold tabular-nums',
        MEDALS[rank - 1] ?? 'bg-muted text-foreground',
        className,
      )}
    >
      {rank}
    </span>
  );
}
