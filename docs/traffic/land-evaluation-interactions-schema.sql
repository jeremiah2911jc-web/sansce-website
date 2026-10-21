-- Apply only when releasing the reviewed interaction tracking update.
-- Existing RLS, service-role grants, RPC signature and historical records are unchanged.
begin;
alter table public.sanze_visitor_actions drop constraint sanze_action_allowed;
alter table public.sanze_visitor_actions add constraint sanze_action_allowed check (
  (action='tool_entry' and target='/land-evaluation') or
  (action='land_evaluation_complete' and target='result') or
  (action='scroll' and target in ('25','50','75','100')) or
  (action='service_click' and target in ('/consulting','/services/urban-renewal','/services/dangerous-old-rebuilding','/services/joint-construction','/services/project-management')) or
  (action='checkup_click' and target='/checkup') or
  (action='contact_click' and target in ('/contact','line','phone','email')) or
  (action='service_select' and target in ('site','contract','checkup','management')) or
  (action='stage_select' and target in ('integration','association','submitted','blocked','feasibility','cooperation','progress')) or
  (action='calculator_example' and target in ('fixed','development','separate')) or
  (action='calculator_complete' and target in ('single','comparison')) or
  (action='assistant_open' and target in ('launcher','calculator')) or
  (action='assistant_question' and target='send') or
  (action='contact_open' and target in ('rail','mobile')) or
  (action='contact_success' and target='accepted')
);
commit;
