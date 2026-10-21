-- Presentation-only classification. No stored pageviews are modified.
begin;
create temporary table source_split_before on commit drop as select public.sanze_traffic_visitor_distributions() data;
CREATE OR REPLACE FUNCTION public.sanze_traffic_visitor_distributions()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
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
 (array_agg(jsonb_build_object('country',geo_country,'county',geo_county,'region',geo_region) order by (geo_city is null and geo_county is null),(geo_country is null),(geo_region='unknown'),created_at,event_id))[1] geography,
 (array_agg(traffic_source order by created_at,event_id))[1] traffic_source,
 (array_agg(source_basis order by created_at,event_id))[1] source_basis,
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
 select period,case when traffic_source is null then 'unknown' when traffic_source in ('google','bing','yahoo','duckduckgo','baidu','facebook','instagram','line') and source_basis in ('tag','referrer') then traffic_source||'_'||source_basis else traffic_source end source,count(*) visitors from distribution group by period,source
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
$function$;
revoke all on function public.sanze_traffic_visitor_distributions() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_distributions() to service_role;
do $audit$
declare old_data jsonb;new_data jsonb; p text;old_counts jsonb;new_counts jsonb;
begin
 select data into old_data from source_split_before;
 new_data:=public.sanze_traffic_visitor_distributions();
 if old_data-'sourcePeriods' <> new_data-'sourcePeriods' then raise exception 'Non-source distributions changed';end if;
 foreach p in array array['today','week','total'] loop
  select jsonb_object_agg(k,n) into old_counts from (select value->>'key' k,sum((value->>'visitors')::bigint) n from jsonb_array_elements(old_data->'sourcePeriods'->p) group by 1) t;
  select jsonb_object_agg(k,n) into new_counts from (select regexp_replace(value->>'key','_(tag|referrer)$','') k,sum((value->>'visitors')::bigint) n from jsonb_array_elements(new_data->'sourcePeriods'->p) group by 1) t;
  if old_counts is distinct from new_counts then raise exception 'Platform totals changed for %',p;end if;
 end loop;
end $audit$;
commit;
