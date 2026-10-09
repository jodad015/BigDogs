import { Link, useSearchParams } from 'react-router';
import { Ticket } from 'lucide-react';
import { useCurrentOrg } from '@/lib/current-org';
import { usePlayers } from '@/hooks/use-players';
import { useMembers } from '@/hooks/use-members';
import { PlayersList } from '@/components/players-list';
import { MembersList } from '@/components/members-list';
import { ErrorText, Page, PageSpinner, secondaryButtonClass } from '@/components/ui';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'players', label: 'Players' },
  { key: 'members', label: 'Members' },
] as const;

export default function PeoplePage() {
  const { org } = useCurrentOrg();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'members' ? 'members' : 'players';
  const players = usePlayers(org.id);
  const members = useMembers(org.id);

  return (
    <Page
      title="People"
      action={
        <Link to={`/o/${org.slug}/invites`} className={secondaryButtonClass}>
          <Ticket className="h-4 w-4" /> Invite
        </Link>
      }
    >
      <div role="tablist" className="flex rounded-lg bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setParams(t.key === 'players' ? {} : { tab: t.key }, { replace: true })}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {t.label}
            <span className="ml-1.5 font-normal opacity-70">
              {t.key === 'players' ? players.players.length : members.members.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'players' ? (
        players.isLoading ? (
          <PageSpinner />
        ) : (
          <>
            <ErrorText>{players.error}</ErrorText>
            <PlayersList players={players} />
          </>
        )
      ) : members.isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <ErrorText>{members.error}</ErrorText>
          <MembersList members={members} />
        </>
      )}
    </Page>
  );
}
