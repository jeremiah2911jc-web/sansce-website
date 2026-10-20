-- Interactions are separate from pageviews and never change traffic totals.
alter table public.sanze_site_pageviews add column if not exists interaction_tracking boolean not null default false;
create table public.sanze_visitor_actions (
 event_id uuid primary key,
 page_event_id uuid not null references public.sanze_site_pageviews(event_id),
 action text not null,
 target text not null,
 created_at timestamptz not null default clock_timestamp(),
 constraint sanze_action_allowed check (
  (action='scroll' and target in ('25','50','75','100')) or
  (action='service_click' and target in ('/consulting','/services/urban-renewal','/services/dangerous-old-rebuilding','/services/joint-construction','/services/project-management')) or
  (action='checkup_click' and target='/checkup') or
  (action='contact_click' and target in ('/contact','line','phone','email'))
 )
);
create index sanze_actions_page_time_idx on public.sanze_visitor_actions(page_event_id,created_at,event_id);
create unique index sanze_actions_scroll_once_idx on public.sanze_visitor_actions(page_event_id,target) where action='scroll';
alter table public.sanze_visitor_actions enable row level security;
revoke all on public.sanze_visitor_actions from public,anon,authenticated;
grant select,insert on public.sanze_visitor_actions to service_role;
create or replace function public.sanze_record_visitor_action(p_event_id uuid,p_page_event_id uuid,p_visitor_id uuid,p_source_path text,p_action text,p_target text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 -- Serialize per page; a supplied visitor ID alone cannot attach to another pageview.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_page_event_id::text,0));
 perform 1 from public.sanze_site_pageviews where event_id=p_page_event_id and visitor_id=p_visitor_id and coalesce(source_path,path)=p_source_path and interaction_tracking and created_at>=now()-interval '24 hours';
 if not found then return false; end if;
 if exists(select 1 from public.sanze_visitor_actions where event_id=p_event_id) then return true;end if;
 if (select count(*) from public.sanze_visitor_actions where page_event_id=p_page_event_id)>=128 then return false;end if;
 insert into public.sanze_visitor_actions(event_id,page_event_id,action,target) values(p_event_id,p_page_event_id,p_action,p_target) on conflict do nothing;
 return true;
end;
$$;
revoke all on function public.sanze_record_visitor_action(uuid,uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.sanze_record_visitor_action(uuid,uuid,uuid,text,text,text) to service_role;

-- Preserve existing daily numbering, geography, duration, sources and page counts.
create or replace function public.sanze_traffic_visitor_arrivals()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), events as (
 select event_id,visitor_id,coalesce(source_path,path) as path,created_at,visible_ms,interaction_tracking,traffic_source,geo_country,geo_county,geo_region
 from public.sanze_site_pageviews,bounds
 where created_at >= greatest((today::timestamp at time zone 'Asia/Taipei'),(select started_at from public.sanze_traffic_period where singleton))
 and created_at < ((today+1)::timestamp at time zone 'Asia/Taipei')
), arrivals as (
 select visitor_id,(array_agg(jsonb_build_object('country',geo_country,'county',geo_county,'region',geo_region) order by (geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geography,coalesce((array_agg(traffic_source order by created_at,event_id))[1],'unknown') traffic_source,min(created_at) first_seen,max(created_at) last_seen,count(*) views,sum(visible_ms) visible_ms,count(visible_ms) duration_tracked_views,count(*) filter(where interaction_tracking) interaction_tracked_views from events group by visitor_id
), numbered as (
 select visitor_id,row_number() over(order by first_seen,visitor_id) visitor_number,first_seen,last_seen,views,visible_ms,duration_tracked_views,interaction_tracked_views,traffic_source,geography from arrivals
), recent as (
 select * from numbered order by first_seen desc,visitor_number desc limit 500
), page_counts as (
 select e.visitor_id,e.path,count(*) views,min(e.created_at) first_seen,max(e.created_at) last_seen
 from events e join recent r using(visitor_id) group by e.visitor_id,e.path
), page_lists as (
 select visitor_id,jsonb_agg(jsonb_build_object('path',path,'views',views,'firstSeen',first_seen,'lastSeen',last_seen) order by first_seen,path) pages from page_counts group by visitor_id
), timeline_events as (
 select e.visitor_id,e.event_id,e.created_at,'pageview'::text action,e.path target,e.path
 from events e join recent r using(visitor_id)
 union all
 select e.visitor_id,a.event_id,a.created_at,a.action,a.target,e.path
 from public.sanze_visitor_actions a join events e on e.event_id=a.page_event_id join recent r on r.visitor_id=e.visitor_id
 where a.created_at < (((now() at time zone 'Asia/Taipei')::date+1)::timestamp at time zone 'Asia/Taipei')
), timeline_ranked as (
 select *,row_number() over(partition by visitor_id order by created_at,event_id) rn,count(*) over(partition by visitor_id) total from timeline_events
), timeline_lists as (
 select visitor_id,max(total) total,jsonb_agg(jsonb_build_object('at',created_at,'action',action,'target',target,'path',path) order by created_at,event_id) filter(where rn<=200) timeline from timeline_ranked group by visitor_id
)
select jsonb_build_object('total',(select count(*) from arrivals),'limit',500,
 'rows',coalesce((select jsonb_agg(jsonb_build_object('visitorNumber',r.visitor_number,'firstSeen',r.first_seen,'lastSeen',r.last_seen,'views',r.views,'geoCountry',r.geography->>'country','geoCounty',r.geography->>'county','geoRegion',r.geography->>'region','locationKey',coalesce(r.geography->>'county',case when r.geography->>'country' <> 'TW' then 'country:'||(r.geography->>'country') when r.geography->>'region' in ('north','central','south','east','islands') then (r.geography->>'region')||'_unknown' else coalesce(r.geography->>'region','unknown') end),'trafficSource',case when r.traffic_source='internal' then 'direct_unknown' else r.traffic_source end,'visibleMs',r.visible_ms,'durationTrackedViews',r.duration_tracked_views,'pages',p.pages,'interactionTrackedViews',r.interaction_tracked_views,'timeline',t.timeline,'timelineTotal',t.total,'timelineLimit',200) order by r.first_seen desc,r.visitor_number desc) from recent r join page_lists p using(visitor_id) join timeline_lists t using(visitor_id)),'[]'::jsonb));
$$;
revoke all on function public.sanze_traffic_visitor_arrivals() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_arrivals() to service_role;
