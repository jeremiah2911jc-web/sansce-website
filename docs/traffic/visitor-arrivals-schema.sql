-- Daily anonymous visitor arrival times; only the protected server can read this RPC.
create or replace function public.sanze_traffic_visitor_arrivals()
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Taipei')::date as today
), arrivals as (
 select visitor_id,min(created_at) as first_seen,max(created_at) as last_seen,count(*) as views
 from public.sanze_site_pageviews,bounds
 where created_at >= (today::timestamp at time zone 'Asia/Taipei')
   and created_at < ((today+1)::timestamp at time zone 'Asia/Taipei')
 group by visitor_id
), numbered as (
 select row_number() over(order by first_seen,visitor_id) as visitor_number,first_seen,last_seen,views from arrivals
), recent as (
 select * from numbered order by first_seen desc,visitor_number desc limit 500
)
select jsonb_build_object('total',(select count(*) from arrivals),'limit',500,
 'rows',coalesce((select jsonb_agg(jsonb_build_object('visitorNumber',visitor_number,'firstSeen',first_seen,'lastSeen',last_seen,'views',views) order by first_seen desc,visitor_number desc) from recent),'[]'::jsonb));
$$;
revoke all on function public.sanze_traffic_visitor_arrivals() from public,anon,authenticated;
grant execute on function public.sanze_traffic_visitor_arrivals() to service_role;
