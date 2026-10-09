import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, Maximize, Pause, Play, WifiOff } from 'lucide-react';
import {
  describeRules,
  formatScore,
  formatScoreDetail,
  WINDOW_LABELS,
  type DisplayBoard,
  type DisplayData,
  type TimeWindow,
} from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { avatarSrc } from '@/lib/avatars';
import { cn } from '@/lib/utils';

const POLL_MS = 15_000;
const CELEBRATE_MS = 12_000;
const MAX_ROWS = 8;

interface Celebration {
  boardId: string;
  boardName: string;
  name: string;
  avatars: string[];
}

function leaderIds(board: DisplayBoard): Set<string> {
  return new Set(board.standings.filter((s) => s.rank === 1).map((s) => s.id));
}

/** Fetches the display every POLL_MS and reports boards whose #1 changed. */
function useDisplay(token: string, onNewLeader: (c: Celebration) => void) {
  const [data, setData] = useState<DisplayData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'invalid' | 'offline'>('loading');
  const leaders = useRef<Map<string, Set<string>> | null>(null);

  const load = useCallback(async () => {
    const { data: result, error } = await supabase.rpc('get_display', { p_token: token });
    if (error) {
      setStatus((s) => (s === 'loading' ? 'offline' : s === 'ok' ? 'offline' : s));
      return;
    }
    if (!result) {
      setStatus('invalid');
      return;
    }
    const next = result as unknown as DisplayData;

    // Compare #1s with the last poll (not on first load)
    const previous = leaders.current;
    const current = new Map(next.leaderboards.map((b) => [b.id, leaderIds(b)]));
    if (previous) {
      for (const board of next.leaderboards) {
        const before = previous.get(board.id) ?? new Set<string>();
        const newcomer = board.standings.find((s) => s.rank === 1 && !before.has(s.id));
        if (newcomer) {
          onNewLeader({
            boardId: board.id,
            boardName: board.name,
            name: newcomer.name,
            avatars: newcomer.avatars,
          });
          break;
        }
      }
    }
    leaders.current = current;
    setData(next);
    setStatus('ok');
  }, [token, onNewLeader]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, then poll
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, status };
}

/** Keeps a tablet from sleeping while the display is open, where supported. */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        // Not supported or not allowed; the display still works
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => {});
    };
  }, []);
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
    </span>
  );
}

function Avatars({ avatars, size }: { avatars: string[]; size: string }) {
  return (
    <span className="flex shrink-0 -space-x-[1.2vmin]">
      {(avatars.length ? avatars : ['slate']).slice(0, 3).map((a, i) => (
        <img
          key={i}
          src={avatarSrc(a)}
          alt=""
          className={cn('rounded-full ring-[0.4vmin] ring-background', size)}
        />
      ))}
    </span>
  );
}

const MEDALS = ['bg-gold text-black', 'bg-silver text-black', 'bg-bronze text-black'];

function BoardView({ board }: { board: DisplayBoard }) {
  const rows = board.standings.slice(0, MAX_ROWS);
  const more = board.standings.length - rows.length;
  const format = { metric_type: board.metric_type, unit: board.unit, decimals: board.decimals };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-[3vmin] flex items-center gap-[2vmin]">
        <span className="text-[7vmin] leading-none" aria-hidden="true">
          {board.icon}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[6vmin] font-black leading-tight">{board.name}</h1>
          <p className="truncate text-[2.4vmin] text-muted-foreground">
            {describeRules(board)} · {WINDOW_LABELS[board.window as TimeWindow] ?? board.window}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <p className="text-[5vmin] font-bold">No scores yet</p>
            <p className="text-[2.6vmin] text-muted-foreground">First one on the board wins.</p>
          </div>
        </div>
      ) : (
        <ol className="flex flex-1 flex-col gap-[1.2vmin]">
          {rows.map((s) => {
            const detail = formatScoreDetail(format, board.aggregation, s);
            const leader = s.rank === 1;
            return (
              <li
                key={s.id}
                className={cn(
                  'flex max-h-[13vmin] min-h-0 flex-1 items-center gap-[2vmin] rounded-[1.5vmin] bg-card px-[2.5vmin]',
                  leader && 'ring-[0.4vmin] ring-gold',
                )}
              >
                <span
                  className={cn(
                    'grid h-[6vmin] w-[6vmin] shrink-0 place-items-center rounded-full text-[3vmin] font-black',
                    MEDALS[s.rank - 1] ?? 'bg-muted',
                  )}
                >
                  {s.rank}
                </span>
                <Avatars avatars={s.avatars} size="h-[6vmin] w-[6vmin]" />
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate font-bold',
                    leader ? 'text-[4.5vmin]' : 'text-[3.6vmin]',
                  )}
                >
                  {s.name}
                </span>
                <span className="text-right">
                  <span
                    className={cn(
                      'block font-black tabular-nums',
                      leader ? 'text-[5vmin]' : 'text-[3.8vmin]',
                    )}
                  >
                    {formatScore(format, board.aggregation, s)}
                  </span>
                  {detail && (
                    <span className="block text-[2.2vmin] text-muted-foreground">{detail}</span>
                  )}
                </span>
              </li>
            );
          })}
          {more > 0 && (
            <li className="text-center text-[2.4vmin] text-muted-foreground">+{more} more</li>
          )}
        </ol>
      )}
    </div>
  );
}

function CelebrationBanner({ c }: { c: Celebration }) {
  return (
    <div
      role="status"
      className="tv-pop absolute inset-x-[4vmin] bottom-[5vmin] z-20 flex items-center gap-[3vmin] rounded-[2vmin] bg-primary px-[4vmin] py-[3vmin] text-primary-foreground shadow-2xl"
    >
      <span className="text-[8vmin] leading-none" aria-hidden="true">
        👑
      </span>
      <Avatars avatars={c.avatars} size="h-[9vmin] w-[9vmin]" />
      <div className="min-w-0">
        <p className="truncate text-[5.5vmin] font-black leading-tight">{c.name} took #1</p>
        <p className="truncate text-[3vmin] opacity-90">{c.boardName}</p>
      </div>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-8 text-center">
      <div>
        <p className="text-[5vmin] font-bold">{title}</p>
        <p className="mt-2 text-[2.6vmin] text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export default function TvPage() {
  const { token = '' } = useParams();
  const [params] = useSearchParams();
  const pinned = params.get('board');
  const intervalSec = Math.max(5, Number(params.get('interval')) || 12);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideControls = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { theme } = useTheme();
  const onNewLeader = useCallback((c: Celebration) => setCelebration(c), []);
  const { data, status } = useDisplay(token, onNewLeader);
  useWakeLock();

  const boards = data?.leaderboards.filter((b) => !pinned || b.id === pinned) ?? [];
  const count = boards.length;
  const current = count ? boards[index % count] : undefined;

  // Jump to a board when its #1 changes, and hold rotation while celebrating
  useEffect(() => {
    if (!celebration) return;
    const at = boards.findIndex((b) => b.id === celebration.boardId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- respond to a new #1
    if (at >= 0) setIndex(at);
    const id = setTimeout(() => setCelebration(null), CELEBRATE_MS);
    return () => clearTimeout(id);
    // boards changes every poll; only react to a new celebration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration]);

  useEffect(() => {
    if (paused || celebration || count <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), intervalSec * 1000);
    return () => clearInterval(id);
  }, [paused, celebration, count, intervalSec, index]);

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideControls.current);
    hideControls.current = setTimeout(() => setControlsVisible(false), 4000);
  };

  if (status === 'loading') return <Message title="Loading…" body="Fetching the leaderboards." />;
  if (status === 'invalid') {
    return (
      <Message
        title="This display link isn't active"
        body="It may have been revoked. Ask an admin for a new link from Settings → TV displays."
      />
    );
  }
  if (!data) return <Message title="Can't reach BigDogs" body="Retrying every few seconds…" />;

  return (
    <div
      className="relative flex h-dvh select-none flex-col overflow-hidden bg-background px-[4vmin] pt-[3vmin] pb-[4vmin] text-foreground"
      onPointerMove={showControls}
      onPointerDown={showControls}
    >
      <header className="mb-[3vmin] flex items-center justify-between text-[2.6vmin] text-muted-foreground">
        <span className="flex items-center gap-[1.5vmin] font-semibold">
          <img
            src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'}
            alt=""
            className="h-[3vmin]"
          />
          <span className="font-extrabold uppercase tracking-[0.2em] text-foreground">BigDogs</span>
          <span>· {data.org.name}</span>
        </span>
        <span className="flex items-center gap-[2vmin]">
          {status === 'offline' && (
            <span className="flex items-center gap-1 text-warning">
              <WifiOff className="h-[2.6vmin] w-[2.6vmin]" /> Reconnecting
            </span>
          )}
          {count > 1 && (
            <span className="tabular-nums">
              {(index % count) + 1}/{count}
            </span>
          )}
          <Clock />
        </span>
      </header>

      <main className="min-h-0 flex-1">
        {current ? (
          <BoardView key={current.id} board={current} />
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-[5vmin] font-bold">No leaderboards yet</p>
              <p className="text-[2.6vmin] text-muted-foreground">
                Create one in BigDogs and it shows up here.
              </p>
            </div>
          </div>
        )}
      </main>

      {count > 1 && !paused && !celebration && (
        <div className="absolute inset-x-0 bottom-0 h-[0.8vmin] bg-muted">
          <div
            key={`${index}-${intervalSec}`}
            className="tv-progress h-full bg-primary"
            style={{ animationDuration: `${intervalSec}s` }}
          />
        </div>
      )}

      {celebration && <CelebrationBanner c={celebration} />}

      <div
        className={cn(
          'absolute bottom-[3vmin] right-[3vmin] z-30 flex gap-2 rounded-full bg-card/90 p-2 shadow-xl transition-opacity',
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <button
          type="button"
          aria-label="Previous board"
          onClick={() => setIndex((i) => (i - 1 + count) % Math.max(count, 1))}
          className="rounded-full p-3 hover:bg-muted"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
          onClick={() => setPaused((p) => !p)}
          className="rounded-full p-3 hover:bg-muted"
        >
          {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </button>
        <button
          type="button"
          aria-label="Next board"
          onClick={() => setIndex((i) => i + 1)}
          className="rounded-full p-3 hover:bg-muted"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Full screen"
          onClick={() => void document.documentElement.requestFullscreen?.().catch(() => {})}
          className="rounded-full p-3 hover:bg-muted"
        >
          <Maximize className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
