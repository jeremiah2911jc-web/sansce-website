-- Add city classifications prospectively. Never backfill guessed cities or alter totals.
alter table public.sanze_site_pageviews add column if not exists geo_city text check (length(geo_city)<=100);
-- Preserve existing daily numbering, geography, duration, sources and page counts.
create or replace function public.sanze_traffic_visitor_arrivals()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), events as (
 select event_id,visitor_id,coalesce(source_path,path) as path,created_at,visible_ms,interaction_tracking,traffic_source,geo_country,geo_county,geo_region,geo_city
 from public.sanze_site_pageviews,bounds
 where created_at >= greatest((today::timestamp at time zone 'Asia/Taipei'),(select started_at from public.sanze_traffic_period where singleton))
 and created_at < ((today+1)::timestamp at time zone 'Asia/Taipei')
), arrivals as (
 select visitor_id,(array_agg(jsonb_build_object('country',geo_country,'county',geo_county,'region',geo_region,'city',geo_city) order by (geo_city is null),(geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geography,coalesce((array_agg(traffic_source order by created_at,event_id))[1],'unknown') traffic_source,min(created_at) first_seen,max(created_at) last_seen,count(*) views,sum(visible_ms) visible_ms,count(visible_ms) duration_tracked_views,count(*) filter(where interaction_tracking) interaction_tracked_views from events group by visitor_id
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
 'rows',coalesce((select jsonb_agg(jsonb_build_object('visitorNumber',r.visitor_number,'firstSeen',r.first_seen,'lastSeen',r.last_seen,'views',r.views,'geoCountry',r.geography->>'country','geoCity',r.geography->>'city','geoCounty',r.geography->>'county','geoRegion',r.geography->>'region','locationKey',coalesce(r.geography->>'county',case when r.geography->>'country' <> 'TW' then 'country:'||(r.geography->>'country') when r.geography->>'region' in ('north','central','south','east','islands') then (r.geography->>'region')||'_unknown' else coalesce(r.geography->>'region','unknown') end),'trafficSource',case when r.traffic_source='internal' then 'direct_unknown' else r.traffic_source end,'visibleMs',r.visible_ms,'durationTrackedViews',r.duration_tracked_views,'pages',p.pages,'interactionTrackedViews',r.interaction_tracked_views,'timeline',t.timeline,'timelineTotal',t.total,'timelineLimit',200) order by r.first_seen desc,r.visitor_number desc) from recent r join page_lists p using(visitor_id) join timeline_lists t using(visitor_id)),'[]'::jsonb));
$$;
revoke all on function public.sanze_traffic_visitor_arrivals() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_arrivals() to service_role;

create or replace function public.sanze_traffic_audience_content(p_topics jsonb default '{}'::jsonb)
returns jsonb language sql stable security invoker set search_path='' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date today,(select started_at from public.sanze_traffic_period where singleton) started_at
), events as (
 select p.*,(p.created_at at time zone 'Asia/Taipei')::date as day,coalesce(source_path,path) content_path
 from public.sanze_site_pageviews p cross join bounds b
 where p.created_at>=b.started_at and p.created_at<((b.today+1)::timestamp at time zone 'Asia/Taipei')
), daily_geo as (
 select visitor_id,day,(array_agg(jsonb_build_object('country',coalesce(geo_country,case when geo_county is not null or geo_region in ('north','central','south','east','islands','taiwan_unknown') then 'TW' end),'county',geo_county,'city',case when geo_county is not null then null else geo_city end,'region',geo_region)
 order by (geo_city is null),(geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geo
 from events group by visitor_id,day
), action_counts as (
 select a.page_event_id,max(case when action='scroll' then target::int end) scroll_depth,
 count(*) filter(where action='contact_click') contact_clicks,
 count(*) filter(where action in ('service_click','checkup_click')) service_clicks
 from public.sanze_visitor_actions a join events e on e.event_id=a.page_event_id cross join bounds b
 where a.created_at<((b.today+1)::timestamp at time zone 'Asia/Taipei') group by a.page_event_id
), expanded as (
 select e.*,g.geo,period.name period,coalesce(p_topics->>e.content_path,'其他頁面') topic,
 coalesce(a.scroll_depth,0) scroll_depth,coalesce(a.contact_clicks,0) contact_clicks,coalesce(a.service_clicks,0) service_clicks
 from events e join daily_geo g using(visitor_id,day) left join action_counts a on a.page_event_id=e.event_id cross join bounds b
 cross join (values('today'),('week'),('total')) period(name)
 where period.name='total' or (period.name='today' and e.day=b.today) or (period.name='week' and e.day between b.today-6 and b.today)
), page_stats as (
 select period,geo,content_path,count(*) views,count(distinct (visitor_id,day)) visitors,
 sum(visible_ms) visible_ms,count(visible_ms) duration_views,count(*) filter(where interaction_tracking) action_views,
 max(scroll_depth) max_scroll,count(*) filter(where scroll_depth>=75) deep_views,sum(contact_clicks) contact_clicks,sum(service_clicks) service_clicks
 from expanded group by period,geo,content_path
), topic_stats as (
 select period,geo,topic,count(*) views,count(distinct (visitor_id,day)) visitors
 from expanded group by period,geo,topic
), location_stats as (
 select period,geo,count(*) views,count(distinct (visitor_id,day)) visitors,sum(visible_ms) visible_ms,count(visible_ms) duration_views,
 count(*) filter(where interaction_tracking) action_views,count(*) filter(where scroll_depth>=75) deep_views,sum(contact_clicks) contact_clicks,sum(service_clicks) service_clicks
 from expanded group by period,geo
), locations as (
 select l.period,jsonb_build_object('key',md5(l.geo::text),'country',l.geo->>'country','county',l.geo->>'county','city',l.geo->>'city','region',l.geo->>'region',
 'visitors',l.visitors,'views',l.views,'visibleMs',l.visible_ms,'durationViews',l.duration_views,'actionViews',l.action_views,'deepViews',l.deep_views,'contactClicks',l.contact_clicks,'serviceClicks',l.service_clicks,
 'topics',(select jsonb_agg(jsonb_build_object('name',t.topic,'visitors',t.visitors,'views',t.views) order by t.visitors desc,t.views desc,t.topic) from topic_stats t where t.period=l.period and t.geo=l.geo),
 'pages',(select jsonb_agg(jsonb_build_object('path',p.content_path,'topic',coalesce(p_topics->>p.content_path,'其他頁面'),'views',p.views,'visitors',p.visitors,'visibleMs',p.visible_ms,'durationViews',p.duration_views,'actionViews',p.action_views,'maxScroll',p.max_scroll,'deepViews',p.deep_views,'contactClicks',p.contact_clicks,'serviceClicks',p.service_clicks) order by p.visitors desc,p.views desc,p.content_path) from page_stats p where p.period=l.period and p.geo=l.geo)) row,l.visitors,l.views
 from location_stats l
), countries as (
 select period,geo->>'country' country,count(distinct (visitor_id,day)) visitors,count(*) views from expanded group by period,geo->>'country'
), periods as (select name from (values('today'),('week'),('total')) p(name))
select jsonb_build_object('metric','visitor_days','cityStartedAt',(select min(created_at) from events where geo_city is not null),
 'periods',(select jsonb_object_agg(name,coalesce((select jsonb_agg(row order by visitors desc,views desc,row->>'key') from locations where period=name),'[]'::jsonb)) from periods),
 'countryPeriods',(select jsonb_object_agg(name,coalesce((select jsonb_agg(jsonb_build_object('country',country,'visitors',visitors,'views',views) order by visitors desc,country) from countries where period=name),'[]'::jsonb)) from periods));
$$;
revoke all on function public.sanze_traffic_audience_content(jsonb) from public,anon,authenticated;
grant execute on function public.sanze_traffic_audience_content(jsonb) to service_role;
