-- TV display: give each standing a stable id (player or team) so the display
-- can tell when the leader changes, and an avatars array so teams show every
-- member instead of nothing. Replaces the version in the baseline.

-- Everything the TV display needs, keyed by a display link token. Callable
-- without signing in; the token is the credential.
create or replace function public.get_display(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_link public.display_links%rowtype;
  v_org public.organizations%rowtype;
  v_boards jsonb;
begin
  select * into v_link from public.display_links where token = p_token;
  if not found then
    return null;
  end if;

  update public.display_links set last_seen_at = now() where id = v_link.id;
  select * into v_org from public.organizations where id = v_link.org_id;

  select coalesce(jsonb_agg(board order by board ->> 'name'), '[]'::jsonb) into v_boards
  from (
    select jsonb_build_object(
      'id', l.id,
      'name', l.name,
      'icon', l.icon,
      'metric_type', l.metric_type,
      'unit', l.unit,
      'decimals', l.decimals,
      'direction', l.direction,
      'aggregation', l.aggregation,
      'window', l.default_window,
      'entrant_type', l.entrant_type,
      'description', l.description,
      'standings', coalesce((
        select jsonb_agg(jsonb_build_object(
          'rank', s.rank,
          'name', coalesce(p.display_name, t.name, (
            select string_agg(tp.display_name, ' & ' order by tp.display_name)
            from public.team_members tm
            join public.players tp on tp.id = tm.player_id
            where tm.team_id = s.team_id
          )),
          'id', coalesce(s.player_id, s.team_id),
          'avatars', case
            when s.player_id is not null then jsonb_build_array(p.avatar)
            else coalesce((
              select jsonb_agg(tp.avatar order by tp.display_name)
              from public.team_members tm
              join public.players tp on tp.id = tm.player_id
              where tm.team_id = s.team_id
            ), '[]'::jsonb)
          end,
          'score', s.score,
          'made', s.made,
          'attempts', s.attempts,
          'entry_count', s.entry_count,
          'last_achieved_at', s.last_achieved_at
        ) order by s.rank, s.last_achieved_at)
        from public.leaderboard_standings(l.id, p_window => l.default_window) s
        left join public.players p on p.id = s.player_id
        left join public.teams t on t.id = s.team_id
      ), '[]'::jsonb)
    ) as board
    from public.leaderboards l
    where l.org_id = v_org.id and l.archived_at is null
  ) boards;

  return jsonb_build_object(
    'org', jsonb_build_object('name', v_org.name, 'slug', v_org.slug, 'timezone', v_org.timezone),
    'display_name', v_link.name,
    'generated_at', now(),
    'leaderboards', v_boards
  );
end;
$$;
