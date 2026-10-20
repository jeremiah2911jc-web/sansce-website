import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {randomUUID,scryptSync} from 'node:crypto';
import {makeReportsHandler} from '../api/_reports.js';
const salt='1234567890abcdef1234567890abcdef',password='test-reading-secret';
const env={NODE_ENV:'production',REPORT_SESSION_SECRET:'report-tests-long-signing-secret-1234',REPORT_ACCESS_HASHES:JSON.stringify({SZ202613:salt+':'+scryptSync(password,salt,64).toString('hex')})};
function setup(){let now=Date.now();const rows=new Map(),limits=new Map();let unavailable=false;
 const db={rpc:async(_,p)=>{if(unavailable)return {error:{message:'offline'}};limits.set(p.p_key,(limits.get(p.p_key)||0)+1);return {data:limits.get(p.p_key)<=5};},from:table=>({delete:()=>({eq:async(_,key)=>{limits.delete(key);return {error:null};}}),upsert:async row=>{if(unavailable)return {error:{message:'offline'}};assert.equal(table,'sanze_report_reads');if(!rows.has(row.event_id))rows.set(row.event_id,row);return {error:null};}})};
 const create=()=>makeReportsHandler({env,now:()=>now,dbFactory:()=>db});
 async function call(fn,body,cookie=''){const req=Readable.from([JSON.stringify(body)]);Object.assign(req,{method:'POST',url:'/api/reports',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json','x-real-ip':'test-ip','user-agent':'Mozilla/5.0 Safari',cookie}});const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(s){this.body=JSON.parse(s);}};await fn(req,res);return res;}
 return {create,call,rows,advance:t=>now+=t,offline:()=>unavailable=true};
}
const credentials={reportId:'SZ202613',password};
test('authenticated reading deduplicates retries and recognizes cross-day returns',async()=>{
 const h=setup(),fn=h.create();assert.equal((await h.call(fn,{action:'read',eventId:randomUUID()})).statusCode,401);
 let login=await h.call(fn,credentials),auth=login.headers['Set-Cookie'].split(';')[0];const id=randomUUID();
 const first=await h.call(fn,{action:'read',eventId:id},auth);assert.equal(first.statusCode,200);const visitor=first.headers['Set-Cookie'].split(';')[0];assert.match(visitor,/sanze_report_visitor=/);
 await h.call(fn,{action:'read',eventId:id},auth+'; '+visitor);assert.equal(h.rows.size,1);
 h.advance(86400001);login=await h.call(fn,credentials);auth=login.headers['Set-Cookie'].split(';')[0];
 await h.call(fn,{action:'read',eventId:randomUUID()},auth+'; '+visitor);const entries=[...h.rows.values()];assert.equal(entries.length,2);assert.equal(entries[0].visitor_id,entries[1].visitor_id);assert.equal(entries[0].report_id,'SZ202613');
 await h.call(fn,{action:'read',eventId:randomUUID()},auth+'; '+visitor+'; sanze_traffic_excluded=1');assert.equal(h.rows.size,2);
 await h.call(fn,{action:'read',eventId:randomUUID()},auth+'; sanze_report_visitor='+randomUUID()+'.forged');assert.notEqual([...h.rows.values()][2].visitor_id,entries[0].visitor_id);
});
test('production login limit persists across handler instances and fails closed on database outage',async()=>{
 const h=setup();for(let i=0;i<5;i++)assert.equal((await h.call(h.create(),{...credentials,password:'wrong'})).statusCode,401);
 assert.equal((await h.call(h.create(),credentials)).statusCode,429);
 const other=setup();other.offline();assert.equal((await other.call(other.create(),credentials)).statusCode,503);
});
