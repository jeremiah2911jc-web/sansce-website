begin;
create table if not exists public.sanze_website_conversations (
 request_id uuid primary key,
 conversation_id uuid not null,
 created_at timestamptz not null default now(),
 answered_at timestamptz,
 page_path text not null default '/',
 question text not null,
 answer text,
 status text not null default 'pending' check (status in ('pending','ok','failed')),
 model text not null,
 usage jsonb
);
create index if not exists sanze_website_conversations_recent on public.sanze_website_conversations (created_at desc);
create index if not exists sanze_website_conversations_thread on public.sanze_website_conversations (conversation_id, created_at);
alter table public.sanze_website_conversations enable row level security;
revoke all on public.sanze_website_conversations from public, anon, authenticated;
grant select, insert, update on public.sanze_website_conversations to service_role;
commit;
