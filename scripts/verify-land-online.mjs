import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID,createHash} from 'node:crypto';
import {makeTrafficHandler} from '../api/_site-traffic.js';
const source=readFileSync('src/traffic-tracker.js','utf8').replace(/^import .*;\n/gm,'').replace('export function','function');
async function tracker({eligible=true,excluded=false}={}){
 const calls=[],listeners={},windowListeners={};let tick;const visitorId=randomUUID();
 const document={visibilityState:'visible',addEventListener:(n,f)=>listeners[n]=f};
 const context={location:{hostname:'www.sanzepm.com.tw',pathname:'/land-evaluation',search:''},navigator:{},document,window:{matchMedia:()=>({matches:eligible}),addEventListener:(n,f)=>windowListeners[n]=f},crypto:{randomUUID},AbortSignal,Date,setTimeout,clearTimeout,setInterval:f=>tick=f,visitorTrackingMetadata:()=>({visitorId,excludeFromTraffic:excluded}),trafficSource:()=> 'direct_unknown',trafficSourceBasis:()=> 'none',validTrafficAction:()=>true,fetch:async(u,o)=>{calls.push(JSON.parse(o.body));return {ok:true,status:200,json:async()=>({ok:true})};}};
 vm.runInNewContext(source+';trackPageView()',context);
 const flush=()=>new Promise(r=>setImmediate(r));await flush();
 return {calls,flush,tick:async()=>{tick?.();await flush();},hide:async()=>{document.visibilityState='hidden';listeners.visibilitychange();await flush();},show:async()=>{document.visibilityState='visible';listeners.visibilitychange();await flush();},close:async()=>{windowListeners.pagehide();await flush();}};
}
let s=await tracker();assert.equal(s.calls.filter(x=>x.isVisible===true).length,1,'immediate presence after accepted page');
await s.tick();assert.equal(s.calls.filter(x=>x.isVisible===true).length,2,'reuse 15-second timer');
await s.hide();assert.equal(s.calls.at(-1).isVisible,false);const n=s.calls.length;await s.tick();assert.equal(s.calls.length,n,'background does not keep sending presence');
await s.show();assert.equal(s.calls.at(-1).isVisible,true);await s.close();assert.equal(s.calls.at(-1).isVisible,false,'pagehide overrides visible document');
const reports=s.calls.filter(x=>x.isVisible!==undefined);assert.deepEqual(reports.map(x=>x.reportSequence),reports.map((_,i)=>i+1));
s=await tracker({eligible:false});assert(!s.calls.some(x=>x.isVisible!==undefined),'mobile gate does not count');s=await tracker({excluded:true});assert.equal(s.calls.length,0);
const key='online-test',hash=createHash('sha256').update(key).digest('hex'),rpcCalls=[];
const api=makeTrafficHandler({env:{SITE_TRAFFIC_KEY_HASH:hash},dbFactory:()=>({rpc:async(name,args)=>{rpcCalls.push({name,args});return {data:name==='sanze_land_online'?{count:2,checkedAt:new Date().toISOString(),windowSeconds:45}:null};}})});
async function call({method='GET',token=key,body,url='/api/site-traffic?view=online'}={}){const res={setHeader(){},end(x){this.body=JSON.parse(x);}};await api({url,method,headers:{authorization:'Bearer '+token,origin:'https://www.sanzepm.com.tw','content-type':'application/json'},body},res);return res;}
assert.equal((await call({token:'wrong'})).statusCode,401);assert.equal(rpcCalls.length,0);
assert.equal((await call()).body.count,2);assert.equal(rpcCalls.at(-1).name,'sanze_land_online','online query does not run historical snapshot');
const body={type:'duration',eventId:randomUUID(),visitorId:randomUUID(),path:'/land-evaluation',visibleMs:100,isVisible:true,reportSequence:1};
assert.equal((await call({method:'POST',body})).statusCode,200);assert.equal(rpcCalls.at(-1).name,'sanze_record_land_presence');
for(const patch of [{path:'/'},{isVisible:'yes'},{reportSequence:0},{reportSequence:1.5}])assert.equal((await call({method:'POST',body:{...body,...patch}})).statusCode,400);
console.log('PASS online: foreground/background/close, duplicate-time heartbeat, sequence, mobile/excluded browsers, authenticated lightweight query and validated presence writes.');
