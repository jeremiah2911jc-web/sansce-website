-- Additive draft: deploy this schema before the tracker/API update. Do not reset the reporting period.
-- NULL means no historic duration measurement. A measured instant visit is 0, not NULL.
alter table public.sanze_site_pageviews add column if not exists visible_ms bigint
 check (visible_ms >= 0 and visible_ms <= 43200000);
alter table public.sanze_site_pageviews add column if not exists source_path text check(length(source_path)<=160);
grant update (visible_ms) on public.sanze_site_pageviews to service_role;
create or replace function public.sanze_record_visible_duration(
 p_event_id uuid,p_visitor_id uuid,p_source_path text,p_visible_ms bigint
) returns void language sql security invoker set search_path = '' as $$
 update public.sanze_site_pageviews
 set visible_ms=greatest(coalesce(visible_ms,0),least(p_visible_ms,
   greatest(0,floor(extract(epoch from (statement_timestamp()-created_at))*1000)::bigint)))
 where event_id=p_event_id and visitor_id=p_visitor_id and coalesce(source_path,path)=p_source_path
 and p_visible_ms between 0 and 43200000;
$$;
revoke all on function public.sanze_record_visible_duration(uuid,uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.sanze_record_visible_duration(uuid,uuid,text,bigint) to service_role;
-- Retain exact public path for per-visitor details; aggregate path remains unchanged.
create or replace function public.sanze_traffic_visitor_arrivals()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), events as (
 select visitor_id,coalesce(source_path,path) as path,created_at,visible_ms
 from public.sanze_site_pageviews,bounds
 where created_at >= greatest((today::timestamp at time zone 'Asia/Taipei'),(select started_at from public.sanze_traffic_period where singleton))
 and created_at < ((today+1)::timestamp at time zone 'Asia/Taipei')
), arrivals as (
 select visitor_id,min(created_at) first_seen,max(created_at) last_seen,count(*) views,sum(visible_ms) visible_ms,count(visible_ms) duration_tracked_views from events group by visitor_id
), numbered as (
 select visitor_id,row_number() over(order by first_seen,visitor_id) visitor_number,first_seen,last_seen,views,visible_ms,duration_tracked_views from arrivals
), recent as (
 select * from numbered order by first_seen desc,visitor_number desc limit 500
), page_counts as (
 select e.visitor_id,e.path,count(*) views,min(e.created_at) first_seen,max(e.created_at) last_seen
 from events e join recent r using(visitor_id) group by e.visitor_id,e.path
), page_lists as (
 select visitor_id,jsonb_agg(jsonb_build_object('path',path,'views',views,'firstSeen',first_seen,'lastSeen',last_seen) order by first_seen,path) pages from page_counts group by visitor_id
)
select jsonb_build_object('total',(select count(*) from arrivals),'limit',500,
 'rows',coalesce((select jsonb_agg(jsonb_build_object('visitorNumber',r.visitor_number,'firstSeen',r.first_seen,'lastSeen',r.last_seen,'views',r.views,'visibleMs',r.visible_ms,'durationTrackedViews',r.duration_tracked_views,'pages',p.pages) order by r.first_seen desc,r.visitor_number desc) from recent r join page_lists p using(visitor_id)),'[]'::jsonb));
$$;
revoke all on function public.sanze_traffic_visitor_arrivals() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_arrivals() to service_role;
