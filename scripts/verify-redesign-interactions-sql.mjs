import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {PGlite} from '/tmp/sanze-duration-sql-test/node_modules/@electric-sql/pglite/dist/index.js';
import {interactionTargets} from '../shared/traffic-actions.js';
const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
create table public.sanze_site_pageviews(event_id uuid primary key,visitor_id uuid,path text,source_path text,created_at timestamptz default now());grant select on public.sanze_site_pageviews to service_role;`);
await db.exec(fs.readFileSync('docs/traffic/visitor-actions-schema.sql','utf8').split('-- Preserve existing')[0]);
const visitor=randomUUID(),page=randomUUID(),old=randomUUID();await db.query("insert into public.sanze_site_pageviews(event_id,visitor_id,path,source_path,interaction_tracking) values($1,$2,'/contact','/contact',true)",[page,visitor]);await db.query("insert into public.sanze_visitor_actions(event_id,page_event_id,action,target) values($1,$2,'contact_click','line')",[old,page]);
await db.exec(fs.readFileSync('docs/traffic/redesign-interactions-schema.sql','utf8'));
await db.exec('set role service_role');let count=1;
for(const [action,targets] of Object.entries({...interactionTargets,contact_success:['accepted']}))for(const target of targets){const id=randomUUID();let args=[id,page,visitor,'/contact',action,target];assert.equal((await db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6) ok',args)).rows[0].ok,true);await db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6)',args);count++;}
assert.equal(Number((await db.query('select count(*) n from public.sanze_visitor_actions')).rows[0].n),count,'retries deduplicate');assert.equal(Number((await db.query('select count(*) n from public.sanze_site_pageviews')).rows[0].n),1,'actions do not add pageviews');assert((await db.query('select event_id from public.sanze_visitor_actions where event_id=$1',[old])).rows.length);
assert.equal((await db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6) ok',[randomUUID(),page,randomUUID(),'/contact','service_select','site'])).rows[0].ok,false,'wrong visitor rejected');
await assert.rejects(()=>db.query("insert into public.sanze_visitor_actions(event_id,page_event_id,action,target) values($1,$2,'assistant_question','私人問題')",[randomUUID(),page]));
await db.exec('reset role;set role anon');await assert.rejects(()=>db.query('select * from public.sanze_visitor_actions'));await assert.rejects(()=>db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6)',[randomUUID(),page,visitor,'/contact','service_select','site']));
await db.close();console.log('PASS SQL: all new fixed codes, constraint privacy rejection, parent/visitor scope, idempotency, preserved historical rows/pageviews, no anonymous grants. Isolated database only.');
