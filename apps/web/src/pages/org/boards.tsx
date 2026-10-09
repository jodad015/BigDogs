import { Link } from 'react-router';
import { Trophy } from 'lucide-react';
import { useCurrentOrg } from '@/lib/current-org';
import { usePlayers } from '@/hooks/use-players';
import { ClaimPlayer } from '@/components/claim-player';
import { Card, Page } from '@/components/ui';

export default function BoardsPage() {
  const { org } = useCurrentOrg();
  const players = usePlayers(org.id);

  return (
    <Page title={org.name}>
      {!players.isLoading && !players.myPlayer && (
        <Card className="p-4">
          <h2 className="mb-3 font-semibold">Which player are you?</h2>
          <ClaimPlayer players={players} />
        </Card>
      )}

      <Card className="px-4 py-10 text-center">
        <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="font-semibold">No leaderboards yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Leaderboards are on the way. In the meantime,{' '}
          <Link to={`/o/${org.slug}/people`} className="font-semibold text-primary">
            add your players
          </Link>{' '}
          and{' '}
          <Link to={`/o/${org.slug}/invites`} className="font-semibold text-primary">
            invite your coworkers
          </Link>
          .
        </p>
      </Card>
    </Page>
  );
}
