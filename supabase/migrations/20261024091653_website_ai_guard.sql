-- Website assistant budget and admission controls. Initially disabled.
-- Invoker functions: only service_role can access the tables or execute RPCs.
create table public.sanze_website_ai_settings (
 id boolean primary key default true check(id),
 enabled boolean not null default false,
 daily_requests integer not null default 100 check(daily_requests between 1 and 10000),
 monthly_requests integer not null default 2000 check(monthly_requests between 1 and 100000),
 max_output_tokens integer not null default 2000 check(max_output_tokens between 256 and 4000),
 max_tool_calls integer not null default 1 check(max_tool_calls=1),
 -- USD 3 per Taipei day and USD 3 per individual inference.
 daily_budget_microusd bigint not null default 3000000 check(daily_budget_microusd between 0 and 3000000),
 -- 0 means no additional monthly dollar limit; daily and request limits still apply.
 monthly_budget_microusd bigint not null default 0 check(monthly_budget_microusd>=0),
 request_budget_microusd bigint not null default 3000000 check(request_budget_microusd between 1 and 3000000)
);
insert into public.sanze_website_ai_settings(id) values(true);
create table public.sanze_website_ai_requests (
 request_id uuid primary key,
 ip_key text not null check(ip_key ~ '^[0-9a-f]{64}$'),
 conversation_id uuid not null,
 created_at timestamptz not null default clock_timestamp(),
 lease_until timestamptz not null,
 reserved_microusd bigint not null check(reserved_microusd>0 and reserved_microusd<=3000000),
 pricing jsonb not null,
 state text not null default 'reserved' check(state in ('reserved','inflight','unknown','settled','cancelled')),
 actual_microusd bigint check(actual_microusd>=0),
 provider_response_id text unique,
 usage jsonb,
 settled_at timestamptz,
 check ((state in ('settled','cancelled')) = (actual_microusd is not null)),
 check (state <> 'cancelled' or actual_microusd=0)
);
create index on public.sanze_website_ai_requests(created_at);
create index on public.sanze_website_ai_requests(ip_key,created_at);
create index on public.sanze_website_ai_requests(conversation_id,created_at);
create index on public.sanze_website_ai_requests(lease_until);
alter table public.sanze_website_ai_settings enable row level security;
alter table public.sanze_website_ai_requests enable row level security;
revoke all on public.sanze_website_ai_settings,public.sanze_website_ai_requests from public,anon,authenticated;
grant select,update on public.sanze_website_ai_settings to service_role;
grant select,insert,update,delete on public.sanze_website_ai_requests to service_role;

create function public.sanze_website_ai_claim(p_request uuid,p_ip text,p_conversation uuid,p_reserve bigint,p_pricing jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 s public.sanze_website_ai_settings;
 t timestamptz;
 day_start timestamptz;
 month_start timestamptz;
 n_day bigint; n_month bigint; b_day numeric; b_month numeric;
begin
 -- One short transaction for every admission across all serverless instances.
 perform pg_advisory_xact_lock(79072121);
 t:=clock_timestamp();
 select * into s from public.sanze_website_ai_settings where id=true for share;
 if not found or not s.enabled or s.daily_budget_microusd<=0 then
  return jsonb_build_object('allowed',false,'reason','disabled');
 end if;
 if p_reserve is null or p_reserve<=0 or p_reserve>s.request_budget_microusd or p_pricing is null then return jsonb_build_object('allowed',false,'reason','budget'); end if;
 if p_ip is null or p_ip !~ '^[0-9a-f]{64}$' or p_conversation is null or p_request is null then raise exception 'invalid admission'; end if;
 if exists(select 1 from public.sanze_website_ai_requests where request_id=p_request) then
  return jsonb_build_object('allowed',false,'reason','duplicate','retry_after',60);
 end if;
 -- A never-started expired lease cannot issue a paid request, so release it safely.
 update public.sanze_website_ai_requests set state='cancelled',actual_microusd=0,settled_at=t
 where state='reserved' and lease_until<=t;
 day_start:=date_trunc('day',t at time zone 'Asia/Taipei') at time zone 'Asia/Taipei';
 month_start:=date_trunc('month',t at time zone 'Asia/Taipei') at time zone 'Asia/Taipei';
 select count(*) filter(where created_at>=day_start),count(*) filter(where created_at>=month_start),
  coalesce(sum(coalesce(actual_microusd,reserved_microusd)) filter(where created_at>=day_start or actual_microusd is null),0),coalesce(sum(coalesce(actual_microusd,reserved_microusd)),0)
 into n_day,n_month,b_day,b_month from public.sanze_website_ai_requests where created_at>=month_start or actual_microusd is null;
 if n_day>=s.daily_requests or n_month>=s.monthly_requests or b_day+p_reserve>s.daily_budget_microusd or (s.monthly_budget_microusd>0 and b_month+p_reserve>s.monthly_budget_microusd) then
  return jsonb_build_object('allowed',false,'reason','budget','retry_after',3600);
 end if;
 if (select count(*) from public.sanze_website_ai_requests where created_at>t-interval '1 minute')>=20
 or (select count(*) from public.sanze_website_ai_requests where ip_key=p_ip and created_at>t-interval '1 minute')>=3
 or (select count(*) from public.sanze_website_ai_requests where ip_key=p_ip and created_at>=day_start)>=30
 or (select count(*) from public.sanze_website_ai_requests where conversation_id=p_conversation and created_at>=day_start)>=20 then
  return jsonb_build_object('allowed',false,'reason','rate','retry_after',60);
 end if;
 if (select count(*) from public.sanze_website_ai_requests where lease_until>t)>=4
 or exists(select 1 from public.sanze_website_ai_requests where lease_until>t and (ip_key=p_ip or conversation_id=p_conversation)) then
  return jsonb_build_object('allowed',false,'reason','busy','retry_after',10);
 end if;
 insert into public.sanze_website_ai_requests(request_id,ip_key,conversation_id,created_at,lease_until,reserved_microusd,pricing)
 values(p_request,p_ip,p_conversation,t,t+interval '90 seconds',p_reserve,p_pricing);
 return jsonb_build_object('allowed',true,'max_output_tokens',s.max_output_tokens,'max_tool_calls',s.max_tool_calls,'allocation_percent',floor(100*greatest((n_day+1)::numeric/s.daily_requests,(n_month+1)::numeric/s.monthly_requests,(b_day+p_reserve)/s.daily_budget_microusd,case when s.monthly_budget_microusd>0 then (b_month+p_reserve)/s.monthly_budget_microusd else 0 end)));
end $$;
-- Mark before sending any paid request. A lost response never refunds automatically.
create function public.sanze_website_ai_start(p_request uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(79072121);
 update public.sanze_website_ai_requests set state='inflight' where request_id=p_request and state='reserved' and lease_until>clock_timestamp();
 if not found then raise exception 'request not startable'; end if;
end $$;
create function public.sanze_website_ai_finish(p_request uuid,p_state text,p_cost bigint default null,p_usage jsonb default null,p_response text default null)
returns void language plpgsql security invoker set search_path='' as $$
declare r public.sanze_website_ai_requests;
begin
 perform pg_advisory_xact_lock(79072121);
 select * into r from public.sanze_website_ai_requests where request_id=p_request for update;
 if not found then raise exception 'unknown request'; end if;
 if p_state not in ('settled','cancelled','unknown') or p_state is null then raise exception 'invalid settlement'; end if;
 if r.state in ('settled','cancelled') then
  if p_state='settled' and (r.state<>'settled' or p_cost is distinct from r.actual_microusd or p_response is distinct from r.provider_response_id or p_usage is distinct from r.usage) then raise exception 'conflicting settlement'; end if;
  return; -- An ambiguous network retry cannot charge or refund twice.
 end if;
 if p_state='cancelled' and r.state<>'reserved' then raise exception 'cannot refund started request'; end if;
 if p_state='settled' and (r.state not in ('inflight','unknown') or p_cost is null or p_cost<0 or p_usage is null or p_response is null) then raise exception 'invalid usage'; end if;
 update public.sanze_website_ai_requests set state=p_state,
  actual_microusd=case when p_state='settled' then p_cost when p_state='cancelled' then 0 else null end,
  provider_response_id=case when p_state='settled' then p_response else null end,
  usage=case when p_state='settled' then p_usage else null end,
  settled_at=case when p_state in ('settled','cancelled') then clock_timestamp() else null end,
  lease_until=clock_timestamp() where request_id=p_request;
 -- Never hide an unexpected provider charge by clamping it to the reservation.
 if p_state='settled' and p_cost>r.reserved_microusd then
  update public.sanze_website_ai_settings set enabled=false where id=true;
 end if;
end $$;
revoke all on function public.sanze_website_ai_claim(uuid,text,uuid,bigint,jsonb),public.sanze_website_ai_start(uuid),public.sanze_website_ai_finish(uuid,text,bigint,jsonb,text) from public,anon,authenticated;
grant execute on function public.sanze_website_ai_claim(uuid,text,uuid,bigint,jsonb),public.sanze_website_ai_start(uuid),public.sanze_website_ai_finish(uuid,text,bigint,jsonb,text) to service_role;
-- Unsettled reservations never expire from budget accounting, even after midnight.
-- Remove only terminal rows older than 40 days. Unknown charges need reconciliation.
