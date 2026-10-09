import { Link, useSearchParams } from 'react-router';
import { Ticket } from 'lucide-react';
import { useCurrentOrg } from '@/lib/current-org';
import { usePlayers } from '@/hooks/use-players';
import { useMembers } from '@/hooks/use-members';
import { useTeams } from '@/hooks/use-teams';
import { PlayersList } from '@/components/players-list';
import { MembersList } from '@/components/members-list';
import { TeamsList } from '@/components/teams-list';
import { ErrorText, Page, PageSpinner, secondaryButtonClass } from '@/components/ui';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'players', label: 'Players' },
  { key: 'teams', label: 'Teams' },
  { key: 'members', label: 'Members' },
] as const;

type Tab = (typeof TABS)[number]['key'];

export default function PeoplePage() {
  const { org } = useCurrentOrg();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = requested === 'members' || requested === 'teams' ? requested : 'players';
  const players = usePlayers(org.id);
  const members = useMembers(org.id);
  const teams = useTeams(org.id);

  const counts: Record<Tab, number> = {
    players: players.players.length,
    teams: teams.teams.length,
    members: members.members.length,
  };

  const content = () => {
    if (tab === 'players') {
      if (players.isLoading) return <PageSpinner />;
      return (
        <>
          <ErrorText>{players.error}</ErrorText>
          <PlayersList players={players} />
        </>
      );
    }
    if (tab === 'teams') {
      if (teams.isLoading || players.isLoading) return <PageSpinner />;
      return (
        <>
          <ErrorText>{teams.error}</ErrorText>
          <TeamsList teams={teams} players={players.players} />
        </>
      );
    }
    if (members.isLoading) return <PageSpinner />;
    return (
      <>
        <ErrorText>{members.error}</ErrorText>
        <MembersList members={members} />
      </>
    );
  };

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
            <span className="ml-1.5 font-normal opacity-70">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {content()}
    </Page>
  );
}
