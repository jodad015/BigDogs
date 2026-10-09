import { useCallback } from 'react';
import type { OrgInvite, OrgRole } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export function inviteUrl(code: string): string {
  return `${window.location.origin}/join/${code}`;
}

export function isInviteActive(invite: OrgInvite, now = Date.now()): boolean {
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= now) return false;
  if (invite.max_uses !== null && invite.use_count >= invite.max_uses) return false;
  return true;
}

export interface NewInvite {
  role: OrgRole;
  playerId?: string | null;
  expiresInDays?: number | null;
  maxUses?: number | null;
}

export function useInvites(orgId: string) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('org_invites')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false }),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<OrgInvite[]>(fetcher);

  const createInvite = async ({ role, playerId, expiresInDays, maxUses }: NewInvite) => {
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
      : null;
    const { data: invite, error: err } = await supabase
      .from('org_invites')
      .insert({
        org_id: orgId,
        role,
        player_id: playerId ?? null,
        expires_at: expiresAt,
        max_uses: maxUses ?? null,
      })
      .select()
      .single();
    if (!err) await refetch();
    return { invite, error: friendlyError(err) };
  };

  const revokeInvite = async (id: string) => {
    const { error: err } = await supabase.from('org_invites').delete().eq('id', id);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  return { invites: data ?? [], error, isLoading, refetch, createInvite, revokeInvite };
}
