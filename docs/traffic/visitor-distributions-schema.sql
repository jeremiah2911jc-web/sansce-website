-- Visitor-day distributions; additive RPC, no change to pageviews or reporting start.
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
), devices as (
 select period,device_type,count(*) visitors from distribution group by period,device_type
)
select jsonb_build_object('metric','visitor_days',
 'regionPeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'visitors',visitors) order by geo_region) from regions where period='total'),'[]'::jsonb)),
 'devicePeriods',jsonb_build_object(
 'today',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='today'),'[]'::jsonb),
 'week',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='week'),'[]'::jsonb),
 'total',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'visitors',visitors) order by device_type) from devices where period='total'),'[]'::jsonb)));
$$;
revoke all on function public.sanze_traffic_visitor_distributions() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_distributions() to service_role;
