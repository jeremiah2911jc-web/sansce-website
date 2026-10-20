-- Source category only; no raw URL/IP/search query. Historic NULL stays unmeasured.
alter table public.sanze_site_pageviews add column if not exists traffic_source text check(traffic_source in ('threads_tagged','threads_referral','google','bing','yahoo','duckduckgo','baidu','facebook','instagram','line','other_campaign','other_referral','direct_unknown','internal'));
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
