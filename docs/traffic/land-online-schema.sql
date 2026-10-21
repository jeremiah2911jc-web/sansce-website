-- Presence is a lease on an existing pageview, not another visit/action.
-- Historical rows remain NULL; never infer presence from created_at or visible_ms.
alter table public.sanze_site_pageviews
 add column if not exists presence_at timestamptz,
 add column if not exists presence_visible boolean,
 add column if not exists presence_sequence bigint;
grant update(presence_at,presence_visible,presence_sequence) on public.sanze_site_pageviews to service_role;
create index if not exists sanze_land_presence_recent on public.sanze_site_pageviews(presence_at) include(visitor_id)
 where presence_visible and coalesce(source_path,path)='/land-evaluation';
create or replace function public.sanze_record_land_presence(p_event_id uuid,p_visitor_id uuid,p_source_path text,p_visible_ms bigint,p_is_visible boolean,p_report_sequence bigint)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_source_path <> '/land-evaluation' or p_is_visible is null or p_report_sequence is null or p_report_sequence < 1 or p_visible_ms is null or p_visible_ms not between 0 and 43200000 then return; end if;
 -- One update handles duration and presence. Sequence prevents late requests from
 -- resurrecting a page after its background/close message already arrived.
 update public.sanze_site_pageviews
 set visible_ms=greatest(coalesce(visible_ms,0),least(p_visible_ms,greatest(0,floor(extract(epoch from (statement_timestamp()-created_at))*1000)::bigint))),
 presence_at=statement_timestamp(),presence_visible=p_is_visible,presence_sequence=p_report_sequence
 where event_id=p_event_id and visitor_id=p_visitor_id and coalesce(source_path,path)=p_source_path
 and (presence_sequence is null or presence_sequence < p_report_sequence);
end;
$$;
revoke all on function public.sanze_record_land_presence(uuid,uuid,text,bigint,boolean,bigint) from public,anon,authenticated;
grant execute on function public.sanze_record_land_presence(uuid,uuid,text,bigint,boolean,bigint) to service_role;
create or replace function public.sanze_land_online()
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('count',count(distinct visitor_id),'checkedAt',statement_timestamp(),'windowSeconds',45)
 from public.sanze_site_pageviews
 where presence_visible and coalesce(source_path,path)='/land-evaluation'
 and presence_at > statement_timestamp()-interval '45 seconds' and presence_at <= statement_timestamp();
$$;
revoke all on function public.sanze_land_online() from public,anon,authenticated;
grant execute on function public.sanze_land_online() to service_role;
