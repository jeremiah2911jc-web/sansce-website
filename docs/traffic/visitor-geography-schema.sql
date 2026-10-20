-- Read existing country/county classifications; no data rewrite or new collection.
create or replace function public.sanze_traffic_visitor_distributions()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date today,
 (select started_at from public.sanze_traffic_period where singleton) started_at
), events as (
 select p.*, (p.created_at at time zone 'Asia/Taipei')::date as day
 from public.sanze_site_pageviews p cross join bounds b
 where p.created_at >= b.started_at
 and p.created_at < ((b.today+1)::timestamp at time zone 'Asia/Taipei')
), visitors as (
 select visitor_id,day,
 (array_agg(jsonb_build_object('country',geo_country,'county',geo_county,'region',geo_region) order by (geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geography,
 (array_agg(traffic_source order by created_at,event_id))[1] traffic_source,
 (array_agg(geo_county order by created_at,event_id) filter(where geo_county is not null))[1] geo_county,
 (array_agg(geo_region order by (geo_region='unknown'),created_at,event_id))[1] geo_region,
 (array_agg(device_type order by (device_type='unknown'),created_at,event_id))[1] device_type
 from events group by visitor_id,day
), distribution as (
 select v.*,period.name period from visitors v cross join bounds b
 cross join (values ('today'),('week'),('total')) period(name)
 where period.name='total' or (period.name='today' and v.day=b.today)
 or (period.name='week' and v.day between b.today-6 and b.today)
), regions as (
 select period,geo_region,count(*) visitors from distribution group by period,geo_region
), counties as (
 select period,coalesce(geo_county,case when geo_region in ('north','central','south','east','islands') then geo_region||'_unknown' else geo_region end) county,count(*) visitors
 from distribution group by period,county
), locations as (
 select period,coalesce(geography->>'county',case when geography->>'country' <> 'TW' then 'country:'||(geography->>'country') when geography->>'region' in ('north','central','south','east','islands') then (geography->>'region')||'_unknown' else coalesce(geography->>'region','unknown') end) location_key,count(*) visitors from distribution group by period,location_key
), sources as (
 select period,case when traffic_source is null then 'unknown' when traffic_source='internal' then 'direct_unknown' else traffic_source end source,count(*) visitors from distribution group by period,source
), devices as (
 select period,device_type,count(*) visitors from distribution group by period,device_type
)
select jsonb_build_object('metric','visitor_days',
 'regionPeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='total'),'[]'::jsonb)),
 'countyPeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',county,'visitors',visitors) order by visitors desc,county) from counties where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',county,'visitors',visitors) order by visitors desc,county) from counties where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',county,'visitors',visitors) order by visitors desc,county) from counties where period='total'),'[]'::jsonb)),
 'locationPeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',location_key,'visitors',visitors) order by visitors desc,location_key) from locations where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',location_key,'visitors',visitors) order by visitors desc,location_key) from locations where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',location_key,'visitors',visitors) order by visitors desc,location_key) from locations where period='total'),'[]'::jsonb)),
 'sourcePeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',source,'visitors',visitors) order by visitors desc,source) from sources where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',source,'visitors',visitors) order by visitors desc,source) from sources where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',source,'visitors',visitors) order by visitors desc,source) from sources where period='total'),'[]'::jsonb)),
 'devicePeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='total'),'[]'::jsonb)));
$$;
revoke all on function public.sanze_traffic_visitor_distributions() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_distributions() to service_role;

-- Add the same first-event source used by distributions to each visitor card.
create or replace function public.sanze_traffic_visitor_arrivals()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), events as (
 select event_id,visitor_id,coalesce(source_path,path) as path,created_at,visible_ms,traffic_source,geo_country,geo_county,geo_region
 from public.sanze_site_pageviews,bounds
 where created_at >= greatest((today::timestamp at time zone 'Asia/Taipei'),(select started_at from public.sanze_traffic_period where singleton))
 and created_at < ((today+1)::timestamp at time zone 'Asia/Taipei')
), arrivals as (
 select visitor_id,(array_agg(jsonb_build_object('country',geo_country,'county',geo_county,'region',geo_region) order by (geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geography,coalesce((array_agg(traffic_source order by created_at,event_id))[1],'unknown') traffic_source,min(created_at) first_seen,max(created_at) last_seen,count(*) views,sum(visible_ms) visible_ms,count(visible_ms) duration_tracked_views from events group by visitor_id
), numbered as (
 select visitor_id,row_number() over(order by first_seen,visitor_id) visitor_number,first_seen,last_seen,views,visible_ms,duration_tracked_views,traffic_source,geography from arrivals
), recent as (
 select * from numbered order by first_seen desc,visitor_number desc limit 500
), page_counts as (
 select e.visitor_id,e.path,count(*) views,min(e.created_at) first_seen,max(e.created_at) last_seen
 from events e join recent r using(visitor_id) group by e.visitor_id,e.path
), page_lists as (
 select visitor_id,jsonb_agg(jsonb_build_object('path',path,'views',views,'firstSeen',first_seen,'lastSeen',last_seen) order by first_seen,path) pages from page_counts group by visitor_id
)
select jsonb_build_object('total',(select count(*) from arrivals),'limit',500,
 'rows',coalesce((select jsonb_agg(jsonb_build_object('visitorNumber',r.visitor_number,'firstSeen',r.first_seen,'lastSeen',r.last_seen,'views',r.views,'geoCountry',r.geography->>'country','geoCounty',r.geography->>'county','geoRegion',r.geography->>'region','locationKey',coalesce(r.geography->>'county',case when r.geography->>'country' <> 'TW' then 'country:'||(r.geography->>'country') when r.geography->>'region' in ('north','central','south','east','islands') then (r.geography->>'region')||'_unknown' else coalesce(r.geography->>'region','unknown') end),'trafficSource',case when r.traffic_source='internal' then 'direct_unknown' else r.traffic_source end,'visibleMs',r.visible_ms,'durationTrackedViews',r.duration_tracked_views,'pages',p.pages) order by r.first_seen desc,r.visitor_number desc) from recent r join page_lists p using(visitor_id)),'[]'::jsonb));
$$;
revoke all on function public.sanze_traffic_visitor_arrivals() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_arrivals() to service_role;
