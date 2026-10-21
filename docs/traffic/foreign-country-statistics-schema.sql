-- Preserve per-browser/day and per-page/topic deduplication before country grouping.
begin;
CREATE OR REPLACE FUNCTION public.sanze_traffic_audience_content(p_topics jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date today,(select started_at from public.sanze_traffic_period where singleton) started_at
), events as (
 select p.*,(p.created_at at time zone 'Asia/Taipei')::date as day,coalesce(source_path,path) content_path
 from public.sanze_site_pageviews p cross join bounds b
 where p.created_at>=b.started_at and p.created_at<((b.today+1)::timestamp at time zone 'Asia/Taipei')
), chosen_geo as (
 select visitor_id,day,(array_agg(jsonb_build_object('country',coalesce(geo_country,case when geo_county is not null or geo_region in ('north','central','south','east','islands','taiwan_unknown') then 'TW' end),'county',geo_county,'city',case when geo_county is not null then null else geo_city end,'region',geo_region)
 order by (geo_city is null and geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geo
 from events group by visitor_id,day
), daily_geo as (
 select visitor_id,day,case when geo->>'country' is not null and geo->>'country'<>'TW'
 then jsonb_build_object('country',geo->>'country','county',null,'city',null,'region','overseas') else geo end geo from chosen_geo
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
 sum(nullif(visible_ms,0)) visible_ms,count(nullif(visible_ms,0)) duration_views,count(*) filter(where interaction_tracking) action_views,
 max(scroll_depth) max_scroll,count(*) filter(where scroll_depth>=75) deep_views,sum(contact_clicks) contact_clicks,sum(service_clicks) service_clicks
 from expanded group by period,geo,content_path
), topic_stats as (
 select period,geo,topic,count(*) views,count(distinct (visitor_id,day)) visitors
 from expanded group by period,geo,topic
), location_stats as (
 select period,geo,count(*) views,count(distinct (visitor_id,day)) visitors,sum(nullif(visible_ms,0)) visible_ms,count(nullif(visible_ms,0)) duration_views,
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
$function$
;
revoke all on function public.sanze_traffic_audience_content(jsonb) from public,anon,authenticated;
grant execute on function public.sanze_traffic_audience_content(jsonb) to service_role;
commit;
