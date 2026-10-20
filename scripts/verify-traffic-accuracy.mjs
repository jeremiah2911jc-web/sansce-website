import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {PGlite} from '/tmp/sanze-duration-sql-test/node_modules/@electric-sql/pglite/dist/index.js';
import {trafficTopics} from '../shared/traffic-content.js';
// SQL tests cover corrected functions, not just text matching.
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
create table public.sanze_site_pageviews(event_id uuid primary key,visitor_id uuid,path text,source_path text,created_at timestamptz default now(),geo_country text,geo_county text,geo_region text default 'unknown',geo_city text,device_type text default 'unknown',traffic_source text,visible_ms bigint,interaction_tracking boolean default false);
create table public.sanze_traffic_period(singleton boolean primary key,started_at timestamptz);insert into public.sanze_traffic_period values(true,now()-interval '3 days');
create table public.sanze_visitor_actions(event_id uuid primary key,page_event_id uuid,action text,target text,created_at timestamptz default now());
create table public.sanze_website_conversations(visitor_id uuid,page_path text,status text,created_at timestamptz default now(),is_internal boolean default false);
create table public.sanze_report_reads(report_id text,visitor_id uuid,viewed_at timestamptz,device_type text);
`);
for(const t of ['sanze_site_pageviews','sanze_visitor_actions','sanze_website_conversations','sanze_report_reads','sanze_traffic_period'])await db.exec(`alter table public.${t} enable row level security;grant select on public.${t} to service_role;`);
const definitions=JSON.parse(fs.readFileSync('work/traffic-audit-20261018/live-functions-before.json'));await db.exec(definitions.find(d=>d.proname==='sanze_report_read_summary').definition);
await db.exec('revoke all on function public.sanze_report_read_summary() from public,anon,authenticated;grant execute on function public.sanze_report_read_summary() to service_role;');
await db.exec(fs.readFileSync('docs/traffic/analytics-accuracy-schema.sql','utf8'));
const visitor=randomUUID(),first=randomUUID(),second=randomUUID(),unknown=randomUUID();
await db.query(`insert into public.sanze_site_pageviews(event_id,visitor_id,path,source_path,created_at,geo_country,geo_county,geo_region,geo_city,device_type,traffic_source,visible_ms,interaction_tracking) values
($1,$2,'/insights','/insights',(now() at time zone 'Asia/Taipei')::date::timestamp at time zone 'Asia/Taipei'+interval '1 minute','TW','TPE','north',null,'mobile','internal',0,true),
($3,$2,'/','/',(now() at time zone 'Asia/Taipei')::date::timestamp at time zone 'Asia/Taipei'+interval '2 minute','US',null,'overseas','Los Angeles','desktop','threads_referral',15000,true),
($4,$5,'/','/',now(),'IE',null,'overseas',null,'desktop',null,null,false)`,[first,visitor,second,randomUUID(),unknown]);
// More than 200 timeline entries: last-action field must not derive from truncated UI list.
for(let i=0;i<205;i++)await db.query(`insert into public.sanze_visitor_actions values($1,$2,'contact_click','line',(now() at time zone 'Asia/Taipei')::date::timestamp at time zone 'Asia/Taipei'+interval '3 minute'+$3*interval '1 second')`,[randomUUID(),first,i]);
await db.query("insert into public.sanze_website_conversations(visitor_id,page_path,status) values($1,'/insights/example','pending'),($1,'/insights/example','ok'),($1,'/insights/example','failed')",[visitor]);
await db.query("update public.sanze_site_pageviews set source_basis='internal' where event_id=$1",[first]);
await db.exec('set role service_role');
const s=(await db.query('select public.sanze_traffic_snapshot($1) s',[trafficTopics])).rows[0].s;
assert.equal(s.snapshotVersion,2);assert.equal(s.todayViews,3);assert.equal(s.todayVisitors,2);assert.equal(s.weekViews,s.daily.reduce((n,d)=>n+d.views,0));assert.equal(s.todayAiQuestions,3);assert.equal(s.todayAiPending,1);assert.equal(s.todayAiVisitors,1);assert.equal(s.aiPages[0].path,'/insights/example');
const r=s.visitorArrivals.rows.find(r=>r.views===2);assert.equal(r.entryPath,'/insights');assert.equal(r.deviceType,'mobile');assert.equal(r.trafficSource,'internal');assert.equal(r.sourceBasis,'internal');assert.equal(r.geoCountry,'TW');assert.equal(r.geoCounty,'TPE');assert.equal(r.visibleMs,15000);assert.equal(r.durationTrackedViews,1);assert.equal(r.timeline.length,200);assert.equal(r.timelineTotal,207);assert(r.lastActionAt>r.timeline.at(-1).at);
assert.equal(s.visitorArrivals.rows.find(r=>r.views===1).visibleMs,null);
assert.equal(s.visitorDistributions.sourcePeriods.today.find(r=>r.key==='internal').visitors,1);
const tw=s.audienceContent.periods.today.find(r=>r.country==='TW');assert.equal(tw.views,2);assert.equal(tw.visitors,1);assert.equal(tw.visibleMs,15000);assert.equal(tw.durationViews,1);
assert.equal(s.audienceContent.periods.today.reduce((n,r)=>n+r.views,0),s.todayViews);assert.equal(s.audienceContent.countryPeriods.today.reduce((n,r)=>n+r.visitors,0),s.todayVisitors);
assert(!JSON.stringify(s).includes(visitor),'private browser ID never returned');
await db.exec('reset role');for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(()=>db.query('select public.sanze_traffic_snapshot()'));await db.exec('reset role');}
await db.close();
// Midnight rollover and BFCache must not repeat stale external referral; ignored pageviews stay unaccepted.
const code=fs.readFileSync('src/traffic-tracker.js','utf8').replace(/^import .*;\n/gm,'').replace('export function','function');
let id=randomUUID(),interval,now=0,ignore=false;const calls=[],listeners={},win={};class Clock extends Date{static now(){return now;}}
const c={trafficSourceBasis:()=>'referrer',Date:Clock,crypto:{randomUUID},trafficSource:()=> 'threads_referral',trafficLinkAction:()=>null,visitorTrackingMetadata:()=>({visitorId:id,excludeFromTraffic:false}),location:{hostname:'www.sanzepm.com.tw',pathname:'/insights'},navigator:{webdriver:false},document:{visibilityState:'visible',addEventListener:(n,f)=>listeners[n]=f},window:{addEventListener:(n,f)=>win[n]=f},setInterval:f=>interval=f,setTimeout:()=>1,clearTimeout(){},AbortSignal,fetch:async(_,o)=>{calls.push(JSON.parse(o.body));return {ok:true,status:200,json:async()=>({ignored:ignore})};}};
vm.runInNewContext(code+';trackPageView()',c);const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};await flush();assert.equal(calls[0].trafficSource,'threads_referral');id=randomUUID();now=15000;interval();await flush();assert.equal(calls.filter(c=>!c.type).length,2);assert.equal(calls.at(-1).trafficSource,'internal');now=30000;interval();await flush();assert.equal(calls.at(-1).type,'duration');assert.equal(calls.at(-1).visitorId,id);
win.pageshow({persisted:true});await flush();assert.equal(calls.at(-1).trafficSource,'internal');ignore=true;win.pageshow({persisted:true});await flush();const n=calls.length;now=45000;interval();await flush();assert.equal(calls.length,n,'ignored requests never send duration/actions');
// Data quality distinguishes unavailable/zero and covers unknown source categories.
const src=fs.readFileSync('public/traffic/dashboard.js','utf8'),els=new Map(),element=()=>({children:[],append(...x){this.children.push(...x);},replaceChildren(){this.children=[];}});
const cx={latestData:{...s,visitorArrivals:{total:1,rows:[{views:1,durationTrackedViews:0}]}},$:id=>{if(!els.has(id))els.set(id,element());return els.get(id);},document:{createElement:element},number:String};
vm.runInNewContext(src.slice(src.indexOf('function renderQuality()'))+';renderQuality()',cx);assert.match(JSON.stringify(els.get('quality-details')),/不一致/);
console.log('PASS accuracy: snapshot totals, AI pending, zero/unknown duration, internal first source, stable geography, truncated timeline last action, permissions, midnight rollover, BFCache source, ignored events and quality mismatch.');
