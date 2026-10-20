-- Private LINE storage; never exposed to browser clients.
create table if not exists public.sanze_line_sessions (
 user_key text primary key, paused boolean not null default false,
 history jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now(),
 locked_until timestamptz, lock_event text
);
create table if not exists public.sanze_line_events (
 event_id text primary key, user_key text not null,
 status text not null default 'processing', created_at timestamptz not null default now()
);
create index if not exists sanze_line_events_created on public.sanze_line_events(created_at);
create index if not exists sanze_line_events_user_created on public.sanze_line_events(user_key,created_at);
alter table public.sanze_line_sessions enable row level security;
alter table public.sanze_line_events enable row level security;
revoke all on public.sanze_line_sessions, public.sanze_line_events from anon, authenticated;
grant all on public.sanze_line_sessions, public.sanze_line_events to service_role;
create or replace function public.sanze_line_claim(p_event text,p_user text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare s public.sanze_line_sessions; n integer;
begin
 perform pg_advisory_xact_lock(79071007);
 if exists(select 1 from public.sanze_line_events where event_id=p_event) then return jsonb_build_object('status','duplicate'); end if;
 insert into public.sanze_line_sessions(user_key) values(p_user) on conflict do nothing;
 select * into s from public.sanze_line_sessions where user_key=p_user for update;
 if s.locked_until>now() then return jsonb_build_object('status','busy'); end if;
 if s.paused then
  insert into public.sanze_line_events(event_id,user_key,status) values(p_event,p_user,'manual');
  return jsonb_build_object('status','paused');
 end if;
 select count(*) into n from public.sanze_line_events where created_at>now()-interval '24 hours' and status in ('processing','sent','failed');
 if n>=100 then return jsonb_build_object('status','limited'); end if;
 select count(*) into n from public.sanze_line_events where user_key=p_user and created_at>now()-interval '24 hours' and status in ('processing','sent','failed');
 if n>=20 then return jsonb_build_object('status','limited'); end if;
 insert into public.sanze_line_events(event_id,user_key) values(p_event,p_user);
 update public.sanze_line_sessions set locked_until=now()+interval '55 seconds',lock_event=p_event where user_key=p_user;
 return jsonb_build_object('status','claimed','history',case when s.updated_at>now()-interval '24 hours' then s.history else '[]'::jsonb end);
end $$;
create or replace function public.sanze_line_finish(p_event text,p_user text,p_history jsonb,p_paused boolean,p_status text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
 update public.sanze_line_sessions set history=p_history,paused=p_paused,updated_at=now(),locked_until=null,lock_event=null where user_key=p_user and lock_event=p_event;
 update public.sanze_line_events set status=p_status where event_id=p_event and user_key=p_user;
end $$;
revoke all on function public.sanze_line_claim(text,text),public.sanze_line_finish(text,text,jsonb,boolean,text) from public,anon,authenticated;
grant execute on function public.sanze_line_claim(text,text),public.sanze_line_finish(text,text,jsonb,boolean,text) to service_role;
