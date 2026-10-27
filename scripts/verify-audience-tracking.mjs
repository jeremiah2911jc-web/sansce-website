import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {servicePaths,interactionTargets,trafficLinkAction} from '../shared/traffic-actions.js';
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create table public.sanze_site_pageviews(event_id uuid primary key,visitor_id uuid,path text,source_path text,created_at timestamptz default now());grant select on public.sanze_site_pageviews to service_role;`);
 await db.exec(readFileSync('docs/traffic/visitor-actions-schema.sql','utf8').split('-- Preserve existing')[0]);
 const visitor=randomUUID(),page=randomUUID(),old=randomUUID();await db.query("insert into public.sanze_site_pageviews(event_id,visitor_id,path,source_path,interaction_tracking) values($1,$2,'/consulting','/consulting',true)",[page,visitor]);
 await db.query("insert into public.sanze_visitor_actions(event_id,page_event_id,action,target) values($1,$2,'contact_click','line')",[old,page]);
 await db.exec(readFileSync('docs/traffic/land-evaluation-interactions-schema.sql','utf8'));
 await db.exec('set role service_role');
 for(const target of servicePaths){const action=trafficLinkAction('https://www.sanzepm.com.tw'+target,'https://www.sanzepm.com.tw/');assert.deepEqual(action,{action:'service_click',target});assert.equal((await db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6) ok',[randomUUID(),page,visitor,'/consulting','service_click',target])).rows[0].ok,true);}
 for(const [action,targets] of Object.entries(interactionTargets))for(const target of targets)assert.equal((await db.query('select public.sanze_record_visitor_action($1,$2,$3,$4,$5,$6) ok',[randomUUID(),page,visitor,'/consulting',action,target])).rows[0].ok,true);
 assert.equal((await db.query('select count(*) n from public.sanze_visitor_actions where event_id=$1',[old])).rows[0].n,1);
 await assert.rejects(()=>db.query("insert into public.sanze_visitor_actions(event_id,page_event_id,action,target) values($1,$2,'service_click','/contact?private=not-allowed')",[randomUUID(),page]));
 await db.exec('reset role;set role anon');await assert.rejects(()=>db.query('select * from public.sanze_visitor_actions'));
 console.log('PASS: independent service target, all existing action codes, historical row preservation, restricted fixed paths and anonymous access denial. Local PGlite only; no remote changes.');
}finally{await db.close();}
