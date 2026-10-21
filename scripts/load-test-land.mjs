// HTTP virtual users through the canonical production site. Requires the temporary,
// signed test router and isolated test tables; refuses to run without both signals.
import fs from 'node:fs';
import {randomUUID,createHmac} from 'node:crypto';
import {performance,monitorEventLoopDelay} from 'node:perf_hooks';
import {evaluate,exampleInput} from '../src/land-evaluation/model.mjs';
const run='sanze-20261021-d76fbfa8-872e-481f-aace-e42ea813d79a';
const base='https://www.sanzepm.com.tw';
const arg=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.split('=')[1];
const levels=(arg('stages')||'1,25,100').split(',').map(Number);
const duration=Number(arg('duration')||75)*1000,ramp=Number(arg('ramp')||15000);
const output=arg('output')||'work/load-test/results.json';
if(!process.env.SANZE_CAPACITY_KEY||levels.some(n=>!Number.isInteger(n)||n<1||n>100)||duration<30000||ramp<1000)throw Error('Missing credentials or invalid workload bounds');
const signature=createHmac('sha256',process.env.SANZE_CAPACITY_KEY).update(run).digest('hex');
const ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 SanzeCapacityTest/20261021';
const testHeaders={'x-sanze-capacity-run':signature,Authorization:'Bearer '+signature,Origin:base,'Content-Type':'application/json','User-Agent':ua};
const sleep=ms=>new Promise(r=>setTimeout(r,Math.max(0,ms)));
const report={run,base,startedAt:new Date().toISOString(),workload:{durationMs:duration,rampMs:ramp,heartbeatMs:15000,levels,isolatedWrites:true},cold:[],stages:[]};
const save=()=>fs.writeFileSync(output,JSON.stringify(report,null,2));
function stats(items){const a=items.map(x=>x.ms).sort((a,b)=>a-b),statuses={};for(const x of items)statuses[x.status]=(statuses[x.status]||0)+1;return {requests:items.length,failed:items.filter(x=>!x.ok).length,statuses,p50Ms:a[Math.floor(a.length*.5)]||0,p95Ms:a[Math.floor(a.length*.95)]||0,p99Ms:a[Math.floor(a.length*.99)]||0,maxMs:a.at(-1)||0,bytes:items.reduce((n,x)=>n+x.bytes,0)};}
async function request(kind,url,{body,stage,headers=testHeaders,signal}={}){
 const t=performance.now();let status='network',ok=false,bytes=0,data;
 try{const res=await fetch(base+url,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000)});status=res.status;const text=await res.text();bytes=Buffer.byteLength(text);if(res.headers.get('content-type')?.includes('application/json')){try{data=JSON.parse(text);}catch{}}
 ok=res.ok;if(url.startsWith('/api/')&&headers===testHeaders){ok=ok&&res.headers.get('x-sanze-capacity-run')===run&&data?.ignored!==true;if(body)ok=ok&&data?.ok===true;}
 if(kind==='page'||kind==='health')ok=ok&&text.includes('土地開發評估');
 }catch(e){status=e.name==='TimeoutError'?'timeout':e.name==='AbortError'?'aborted':'network';}
 const row={kind,status,ok,ms:performance.now()-t,bytes,at:Date.now()};stage?.requests.push(row);return {...row,data};
}
const pre=await request('online','/api/site-traffic?view=online');if(!pre.ok||!Number.isInteger(pre.data?.count))throw Error('Signed isolated route not ready: '+pre.status);
// Actual cold HTML + currently referenced JS/CSS, bounded 20 new visitors.
const html=await (await fetch(base+'/land-evaluation')).text();
const assets=[...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+\.(?:js|css))"/g)].map(m=>m[1]))];
if(!assets.length)throw Error('No production bundles found');
for(const entry of [...assets].filter(x=>x.endsWith('.js'))){const text=await(await fetch(base+entry)).text();for(const match of text.matchAll(/[\"'](?:\.\/)?((?:assets\/)?ConsultingSite-[A-Za-z0-9_.-]+\.(?:js|css))[\"']/g)){const path=match[1].startsWith('assets/')?'/'+match[1]:'/assets/'+match[1];if(!assets.includes(path))assets.push(path);}}
report.workload.coldAssets=assets;
console.log(JSON.stringify({event:'ready',base,assets:assets.length,testOnline:pre.data.count}));
const coldStage={requests:[]};
for(let offset=0;offset<20;offset+=4)await Promise.all(Array.from({length:4},async()=>{await request('cold-html','/land-evaluation',{stage:coldStage,headers:{'User-Agent':ua}});await Promise.all(assets.map(url=>request('cold-asset',url,{stage:coldStage,headers:{'User-Agent':ua}})));}));
report.cold=stats(coldStage.requests);save();console.log(JSON.stringify({event:'cold',...report.cold}));
for(const users of levels){
 const start=Date.now(),stage={users,startAt:new Date().toISOString(),requests:[],online:[],computeMs:[],actors:[],abortReason:null,maxInflight:0};report.stages.push(stage);
 const abort=new AbortController(),loop=monitorEventLoopDelay({resolution:20});loop.enable();let active=0,inflight=0,badWindows=0;
 const api=async(kind,body)=>{inflight++;stage.maxInflight=Math.max(stage.maxInflight,inflight);if(inflight>600){stage.abortReason='load-generator-inflight-limit';abort.abort();}try{return await request(kind,'/api/site-traffic',{body,stage,signal:abort.signal});}finally{inflight--;}};
 const monitor=setInterval(async()=>{
  const recent=stage.requests.filter(x=>x.at>Date.now()-15000&&x.kind!=='leave');const s=stats(recent);
  if(recent.length>=100&&(s.failed/s.requests>.01||s.p95Ms>3000))badWindows++;else badWindows=0;
  if(badWindows>=2&&!stage.abortReason){stage.abortReason='sustained-api-errors-or-p95-over-3s';abort.abort();}
  const r=await request('online','/api/site-traffic?view=online',{stage,signal:abort.signal});if(r.ok)stage.online.push({at:new Date().toISOString(),count:r.data.count});
  if(Math.round((Date.now()-start)/1000)%30<5)await request('dashboard','/api/site-traffic',{stage,signal:abort.signal});
  const health=await request('health','/land-evaluation',{stage,headers:{'User-Agent':ua},signal:abort.signal});
  if(!health.ok&&!stage.abortReason){stage.abortReason='public-page-health-failed';abort.abort();}
  console.log(JSON.stringify({event:'progress',users,active,inflight,elapsedSeconds:Math.round((Date.now()-start)/1000),recent:s,online:r.data?.count,health:health.status}));
 },10000);
 const actors=Array.from({length:users},(_,i)=>(async()=>{
  await sleep(i*ramp/users);if(abort.signal.aborted)return;
  const actor={visitorId:randomUUID(),eventId:randomUUID(),joinedAt:null,completed:0,heartbeats:0};stage.actors.push(actor);
  const page=await request('page','/land-evaluation',{stage,headers:{'User-Agent':ua},signal:abort.signal});if(!page.ok)return;
  const event={eventId:actor.eventId,visitorId:actor.visitorId,path:'/land-evaluation',durationTracking:true,actionTracking:true,trafficSource:'direct_unknown',sourceBasis:'none'};
  if(!(await api('pageview',event)).ok)return;actor.joinedAt=Date.now();active++;let sequence=0;
  const presence=async(visible,kind='presence')=>{const r=await api(kind,{...event,type:'duration',visibleMs:Date.now()-actor.joinedAt,isVisible:visible,reportSequence:++sequence});if(r.ok)actor.heartbeats++;return r;};
  await presence(true);
  const end=actor.joinedAt+duration;let next=actor.joinedAt+15000,step=0;
  while(Date.now()<end&&!abort.signal.aborted){await sleep(Math.min(next,end)-Date.now());if(abort.signal.aborted||Date.now()>=end)break;await presence(true);step++;
   if(step%2===0){const t=performance.now();const z=evaluate({...exampleInput(),site:String(2000+(i%20)*50)});stage.computeMs.push(performance.now()-t);if(!z.values||z.errors.length){stage.abortReason='calculation-invalid';abort.abort();break;}
    const result=await api('calculation',{type:'action',eventId:randomUUID(),pageEventId:actor.eventId,visitorId:actor.visitorId,path:'/land-evaluation',action:'land_evaluation_complete',target:'result'});if(result.ok)actor.completed++;
   }next+=15000;
  }
  if(!abort.signal.aborted)await presence(false,'leave');active--;
 })());
 const settled=await Promise.allSettled(actors);clearInterval(monitor);loop.disable();if(settled.some(x=>x.status==='rejected'))stage.abortReason||='virtual-user-exception';
 stage.finishedAt=new Date().toISOString();stage.elapsedSeconds=(Date.now()-start)/1000;stage.summary=stats(stage.requests);stage.byKind=Object.fromEntries([...new Set(stage.requests.map(x=>x.kind))].map(k=>[k,stats(stage.requests.filter(x=>x.kind===k))]));stage.peakOnline=Math.max(0,...stage.online.map(x=>x.count));stage.successfullyJoined=stage.actors.filter(x=>x.joinedAt).length;stage.calculations=stage.actors.reduce((n,x)=>n+x.completed,0);stage.eventLoopP99Ms=loop.percentile(99)/1e6;stage.memoryMb=process.memoryUsage().rss/1024/1024;
 stage.passed=!stage.abortReason&&stage.successfullyJoined===users&&stage.summary.failed===0&&stage.byKind.presence?.p95Ms<3000&&stage.peakOnline===users;
 console.log(JSON.stringify({event:'stage-complete',users,passed:stage.passed,abort:stage.abortReason,summary:stage.summary,joined:stage.successfullyJoined,peakOnline:stage.peakOnline,eventLoopP99Ms:stage.eventLoopP99Ms}));save();
 if(!stage.passed)break;await sleep(5000);
}
report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({event:'complete',output,stages:report.stages.map(s=>({users:s.users,passed:s.passed,peakOnline:s.peakOnline,abort:s.abortReason}))}));
