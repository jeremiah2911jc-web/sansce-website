import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
await db.exec(readFileSync(new URL('../supabase/migrations/20261024091653_website_ai_guard.sql',import.meta.url),'utf8'));
const ip=n=>createHash('sha256').update(String(n)).digest('hex');
let seq=0;
async function claim(reserve=500000,i=++seq,conversation=randomUUID(),id=randomUUID()){
 const r=await db.query('select public.sanze_website_ai_claim($1,$2,$3,$4,$5) as result',[id,ip(i),conversation,reserve,{version:'test'}]);return {...r.rows[0].result,id};
}
async function start(id){await db.query('select public.sanze_website_ai_start($1)',[id]);}
async function finish(id,state='settled',cost=10000,response=`resp_${id}`){await db.query('select public.sanze_website_ai_finish($1,$2,$3,$4,$5)',[id,state,state==='settled'?cost:null,state==='settled'?{input_tokens:100}:null,state==='settled'?response:null]);}
async function row(id){return (await db.query('select * from public.sanze_website_ai_requests where request_id=$1',[id])).rows[0];}
async function reset(){await db.exec(`reset role;truncate public.sanze_website_ai_requests;update public.sanze_website_ai_settings set enabled=true,daily_requests=100,monthly_requests=2000,daily_budget_microusd=3000000,monthly_budget_microusd=0,request_budget_microusd=3000000;set role service_role;`);}
assert.equal((await claim()).reason,'disabled');
assert.equal(Number((await db.query('select daily_budget_microusd from public.sanze_website_ai_settings')).rows[0].daily_budget_microusd),3000000);
await assert.rejects(()=>db.exec('update public.sanze_website_ai_settings set daily_budget_microusd=3000001'),/check constraint/);
await assert.rejects(()=>db.exec('update public.sanze_website_ai_settings set request_budget_microusd=3000001'),/check constraint/);
await reset();
for(const role of ['anon','authenticated']){
 await db.exec(`reset role;set role ${role};`);
 await assert.rejects(()=>db.query('select * from public.sanze_website_ai_settings'),/permission denied/);
 await assert.rejects(()=>claim(),/permission denied/);
 await assert.rejects(()=>start(randomUUID()),/permission denied/);
 await assert.rejects(()=>finish(randomUUID()),/permission denied/);
}
await reset();
// Same day supports multiple actual-usage settlements instead of charging USD 3 each time.
for(let i=0;i<6;i++){const c=await claim(1000000);assert.equal(c.allowed,true);await start(c.id);await finish(c.id,'settled',10000);}
assert.equal(Number((await db.query('select sum(actual_microusd) as total from public.sanze_website_ai_requests')).rows[0].total),60000);
assert.equal((await claim(3000001)).reason,'budget');
// Concurrent reservations cannot overspend the last USD 3.
await reset();
const burst=await Promise.all(Array.from({length:8},()=>claim(1000000)));
assert.equal(burst.filter(r=>r.allowed).length,3);
assert.ok(burst.filter(r=>!r.allowed).every(r=>r.reason==='budget'));
// Settle one at USD .01; exactly its unused .99 becomes available.
const accepted=burst.find(r=>r.allowed);await start(accepted.id);await finish(accepted.id,'settled',10000);
assert.equal((await claim(990000)).allowed,true);assert.equal((await claim(1)).reason,'budget');
await reset();
const whole=await claim(3000000);await start(whole.id);await finish(whole.id,'settled',3000000);assert.equal((await claim(1)).reason,'budget');
// Identical settlement is idempotent; conflicting or duplicate provider response is rejected.
await finish(whole.id,'settled',3000000);await assert.rejects(()=>finish(whole.id,'settled',1),/conflicting/);
await finish(whole.id,'unknown');assert.equal(Number((await row(whole.id)).actual_microusd),3000000);
await reset();
const cancel=await claim(3000000);await finish(cancel.id,'cancelled');assert.equal((await claim(3000000)).allowed,true);
await reset();
const unknown=await claim(3000000);await start(unknown.id);await finish(unknown.id,'unknown');
await assert.rejects(()=>finish(unknown.id,'cancelled'),/cannot refund/);
await db.exec("update public.sanze_website_ai_requests set created_at=clock_timestamp()-interval '45 days',lease_until=clock_timestamp()-interval '1 second'");
assert.equal((await claim(1)).reason,'budget'); // Pending charges survive lease expiry/day/month rollover.
await finish(unknown.id,'settled',10000);assert.equal((await claim(500000)).allowed,true);
await reset();
const overrun=await claim(10000);await start(overrun.id);await finish(overrun.id,'settled',10001);
assert.equal((await claim()).reason,'disabled');assert.equal(Number((await row(overrun.id)).actual_microusd),10001);
await reset();
const concurrency=await Promise.all(Array.from({length:8},()=>claim(10000)));assert.equal(concurrency.filter(r=>r.allowed).length,4);
assert.ok(concurrency.filter(r=>!r.allowed).every(r=>r.reason==='busy'));
await reset();
const conversation=randomUUID();const first=await claim(10000,1,conversation);assert.equal(first.allowed,true);
assert.equal((await claim(10000,1)).reason,'busy');assert.equal((await claim(10000,2,conversation)).reason,'busy');
await finish(first.id,'cancelled');
for(let i=0;i<2;i++){const c=await claim(10000,1);await finish(c.id,'cancelled');}
assert.equal((await claim(10000,1)).reason,'rate');
await reset();
await db.exec('update public.sanze_website_ai_settings set monthly_budget_microusd=10000');
const monthly=await claim(10000);await start(monthly.id);await finish(monthly.id,'settled',10000);assert.equal((await claim(1)).reason,'budget');
await reset();
await db.exec('update public.sanze_website_ai_settings set daily_requests=1');const once=await claim();await finish(once.id,'cancelled');assert.equal((await claim()).reason,'budget');
await reset();
const previous=await claim();await start(previous.id);await finish(previous.id,'settled',10000);
await db.exec("update public.sanze_website_ai_requests set created_at=(date_trunc('day',clock_timestamp() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei')-interval '1 second';update public.sanze_website_ai_settings set daily_requests=1");
assert.equal((await claim()).allowed,true);
// A stale reservation that never started is safe to cancel; an inflight charge is not.
await reset();
const stale=await claim(3000000);
await db.exec("update public.sanze_website_ai_requests set lease_until=clock_timestamp()-interval '1 second'");
assert.equal((await claim(3000000)).allowed,true);assert.equal((await row(stale.id)).state,'cancelled');
await assert.rejects(()=>start(stale.id),/not startable/);
await db.close();
console.log('PASS: PostgreSQL permissions, multiple daily actual-usage settlements, USD 3 request/day ceilings, atomic concurrent reservations, unused balance release, idempotency, unknown charges across midnight, pre-call refunds, cost-overrun shutdown and rate/concurrency controls.');
