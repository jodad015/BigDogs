import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Ticket } from 'lucide-react';
import { ROLE_LABELS, type OrgRole } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useOrgs } from '@/lib/orgs';
import { usePlayers } from '@/hooks/use-players';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { ClaimPlayer } from '@/components/claim-player';
import { Card, ErrorText, Page, PageSpinner, primaryButtonClass } from '@/components/ui';

function ClaimStep({ orgId, slug }: { orgId: string; slug: string }) {
  const navigate = useNavigate();
  const players = usePlayers(orgId);
  const goToOrg = useCallback(() => navigate(`/o/${slug}`, { replace: true }), [navigate, slug]);

  useEffect(() => {
    if (players.myPlayer) goToOrg();
  }, [players.myPlayer, goToOrg]);

  if (players.isLoading || players.myPlayer) return <PageSpinner />;

  return (
    <Card className="p-4">
      <h2 className="mb-3 font-semibold">Which player are you?</h2>
      <ClaimPlayer players={players} onDone={goToOrg} />
    </Card>
  );
}

export default function JoinPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { orgs, refetch: refetchOrgs } = useOrgs();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<{ orgId: string; slug: string } | null>(null);

  const fetcher = useCallback(() => supabase.rpc('get_invite', { p_code: code }), [code]);
  const { data, isLoading } = useSupabaseQuery(fetcher);
  const invite = data?.[0] ?? null;
  const alreadyMember = invite ? orgs.some((o) => o.id === invite.org_id) : false;

  const accept = async () => {
    if (!invite) return;
    setJoining(true);
    setError(null);
    const { error: err } = await supabase.rpc('accept_invite', { p_code: code });
    if (err) {
      setJoining(false);
      setError(err.message);
      return;
    }
    const [{ data: org }] = await Promise.all([
      supabase.from('organizations').select('slug').eq('id', invite.org_id).single(),
      refetchOrgs(),
    ]);
    setJoining(false);
    if (!org) return setError('Joined, but the organization could not be loaded.');

    // A player-specific invite claims that player on accept, so we're done
    if (invite.player_name) navigate(`/o/${org.slug}`, { replace: true });
    else setJoined({ orgId: invite.org_id, slug: org.slug });
  };

  if (isLoading) return <PageSpinner />;

  if (joined) {
    return (
      <Page title={`Welcome to ${invite?.org_name ?? 'the team'}`}>
        <ClaimStep orgId={joined.orgId} slug={joined.slug} />
      </Page>
    );
  }

  if (!invite || !invite.is_valid) {
    return (
      <Page title="Invite">
        <Card className="px-4 py-8 text-center">
          <Ticket className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">
            {invite ? 'This invite has expired or been used up' : "We couldn't find that invite"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Ask whoever sent it for a new link.</p>
          <Link to="/orgs" className="mt-4 inline-block text-sm font-semibold text-primary">
            Back to your organizations
          </Link>
        </Card>
      </Page>
    );
  }

  const role = invite.role as OrgRole;

  return (
    <Page title="You're invited">
      <Card className="p-5 text-center">
        <p className="text-sm text-muted-foreground">Join</p>
        <p className="mt-1 text-2xl font-bold">{invite.org_name}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {invite.player_name ? (
            <>
              as <span className="font-semibold text-foreground">{invite.player_name}</span>
            </>
          ) : (
            <>as a{role === 'admin' ? 'n' : ''} {ROLE_LABELS[role].toLowerCase()}</>
          )}
        </p>
        {alreadyMember && (
          <p className="mt-3 text-xs text-muted-foreground">You're already a member of this org.</p>
        )}
        <button
          type="button"
          onClick={accept}
          disabled={joining}
          className={`${primaryButtonClass} mt-5 w-full`}
        >
          {joining ? 'Joining…' : alreadyMember ? 'Accept invite' : `Join ${invite.org_name}`}
        </button>
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
      </Card>
    </Page>
  );
}
