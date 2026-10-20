-- One-time start of a new reporting period; existing raw records remain intact.
create table public.sanze_traffic_period (
 singleton boolean primary key default true check(singleton),
 started_at timestamptz not null
);
alter table public.sanze_traffic_period enable row level security;
revoke all on public.sanze_traffic_period from public,anon,authenticated;
grant select on public.sanze_traffic_period to service_role;
insert into public.sanze_traffic_period(singleton,started_at) values(true,now());
do $migration$
declare target text; definition text;
begin
 foreach target in array array['public.sanze_traffic_summary()','public.sanze_traffic_visitor_arrivals()'] loop
  definition:=pg_get_functiondef(target::regprocedure);
  if position('with bounds as (' in definition)=0 or position('tracked_pageviews' in definition)>0 then raise exception 'Unexpected function body: %',target; end if;
  definition:=replace(definition,'public.sanze_site_pageviews','tracked_pageviews');
  definition:=replace(definition,'public.sanze_website_conversations','tracked_questions');
  definition:=replace(definition,'''startedAt'',(select min(created_at) from tracked_pageviews)', '''startedAt'',(select started_at from public.sanze_traffic_period where singleton)');
  definition:=replace(definition,'with bounds as (', E'with tracked_pageviews as (\n select * from public.sanze_site_pageviews where created_at >= (select started_at from public.sanze_traffic_period where singleton)\n), tracked_questions as (\n select * from public.sanze_website_conversations where created_at >= (select started_at from public.sanze_traffic_period where singleton)\n), bounds as (');
  execute definition;
 end loop;
end;
$migration$;
