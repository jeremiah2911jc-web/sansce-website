begin;
alter table public.sanze_website_conversations add column if not exists visitor_id uuid;
alter table public.sanze_website_conversations add column if not exists is_internal boolean not null default false;
create or replace function public.sanze_traffic_summary()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), dates as (
 select generate_series((today-6)::timestamp,today::timestamp,'1 day')::date as day from bounds
), recent as (
 select visitor_id,path,(created_at at time zone 'Asia/Taipei')::date as day
 from public.sanze_site_pageviews,bounds
 where created_at >= ((today-6)::timestamp at time zone 'Asia/Taipei')
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
 'startedAt',(select min(created_at) from public.sanze_site_pageviews)
);
$$;
revoke all on function public.sanze_traffic_summary() from public, anon, authenticated;
grant execute on function public.sanze_traffic_summary() to service_role;

commit;
