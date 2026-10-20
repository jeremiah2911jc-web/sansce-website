begin;
alter table public.sanze_site_pageviews
 add column if not exists geo_country text check (geo_country is null or geo_country ~ '^[A-Z]{2}$'),
 add column if not exists geo_region text not null default 'unknown' check (geo_region in ('north','central','south','east','islands','overseas','taiwan_unknown','unknown')),
 add column if not exists device_type text not null default 'unknown' check (device_type in ('mobile','desktop','tablet','unknown'));
create or replace function public.sanze_traffic_summary()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), dates as (
 select generate_series((today-6)::timestamp,today::timestamp,'1 day')::date as day from bounds
), recent as (
 select visitor_id,path,geo_region,device_type,(created_at at time zone 'Asia/Taipei')::date as day
 from public.sanze_site_pageviews,bounds
 where created_at >= ((today-6)::timestamp at time zone 'Asia/Taipei')
), all_daily as (
 select (created_at at time zone 'Asia/Taipei')::date as day,count(distinct visitor_id) as visitors
 from public.sanze_site_pageviews group by 1
), distribution as (
 select p.geo_region,p.device_type,period.name as period,count(*) as views
 from public.sanze_site_pageviews p cross join bounds
 cross join (values ('today'),('week'),('total')) as period(name)
 where (period.name='total' or (period.name='today' and p.created_at >= (today::timestamp at time zone 'Asia/Taipei'))
 or (period.name='week' and p.created_at >= ((today-6)::timestamp at time zone 'Asia/Taipei')))
 group by p.geo_region,p.device_type,period.name
), region_counts as (
 select period,geo_region,sum(views) as views from distribution group by period,geo_region
), device_counts as (
 select period,device_type,sum(views) as views from distribution group by period,device_type
), ai_recent as (
 select visitor_id,page_path,status,(created_at at time zone 'Asia/Taipei')::date as day
 from public.sanze_website_conversations,bounds
 where not is_internal and created_at >= ((today-6)::timestamp at time zone 'Asia/Taipei')
), ai_popular as (
 select page_path,count(*)::int as questions from ai_recent group by page_path
), daily as (
 select d.day,count(r.path)::int as views,count(distinct r.visitor_id)::int as visitors
 from dates d left join recent r on r.day=d.day group by d.day
), popular as (
 select path,count(*)::int as views from recent group by path order by count(*) desc,path
)
select jsonb_build_object(
 'today',(select today from bounds),'timezone','Asia/Taipei','updatedAt',now(),
 'todayViews',coalesce((select views from daily,bounds where day=today),0),
 'todayVisitors',coalesce((select visitors from daily,bounds where day=today),0),
 'yesterdayViews',coalesce((select views from daily,bounds where day=today-1),0),
 'weekViews',(select coalesce(sum(views),0) from daily),
 'daily',(select jsonb_agg(jsonb_build_object('day',day,'views',views,'visitors',visitors) order by day) from daily),
 'pages',coalesce((select jsonb_agg(jsonb_build_object('path',path,'views',views) order by views desc,path) from popular),'[]'::jsonb),
 'todayAiQuestions',(select count(*) from ai_recent,bounds where day=today),
 'todayAiVisitors',(select count(distinct visitor_id) from ai_recent,bounds where day=today),
 'todayAiAnswered',(select count(*) from ai_recent,bounds where day=today and status='ok'),
 'todayAiFailed',(select count(*) from ai_recent,bounds where day=today and status='failed'),
 'todayAiUnlinkedQuestions',(select count(*) from ai_recent,bounds where day=today and visitor_id is null),
 'weekAiQuestions',(select count(*) from ai_recent),
 'aiPages',coalesce((select jsonb_agg(jsonb_build_object('path',page_path,'questions',questions) order by questions desc,page_path) from ai_popular),'[]'::jsonb),
 'totalViews',(select count(*) from public.sanze_site_pageviews),
 'totalVisitorDays',(select coalesce(sum(visitors),0) from all_daily),
 'regionPeriods',jsonb_build_object(
  'today',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'views',views)) from region_counts where period='today'),'[]'::jsonb),
  'week',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'views',views)) from region_counts where period='week'),'[]'::jsonb),
  'total',coalesce((select jsonb_agg(jsonb_build_object('key',geo_region,'views',views)) from region_counts where period='total'),'[]'::jsonb)),
 'devicePeriods',jsonb_build_object(
  'today',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'views',views)) from device_counts where period='today'),'[]'::jsonb),
  'week',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'views',views)) from device_counts where period='week'),'[]'::jsonb),
  'total',coalesce((select jsonb_agg(jsonb_build_object('key',device_type,'views',views)) from device_counts where period='total'),'[]'::jsonb)),
 'metadataStartedAt',(select min(created_at) from public.sanze_site_pageviews where geo_country is not null or device_type <> 'unknown'),
 'startedAt',(select min(created_at) from public.sanze_site_pageviews)
);
$$;
revoke all on function public.sanze_traffic_summary() from public, anon, authenticated;
grant execute on function public.sanze_traffic_summary() to service_role;

commit;
