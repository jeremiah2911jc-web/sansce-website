import {validTrafficAction} from '../shared/traffic-actions.js';
import {trafficSource} from '../src/traffic-source.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {randomUUID} from 'node:crypto';
import {trafficPage} from '../shared/traffic-pages.js';
const source=readFileSync(new URL('../src/traffic-tracker.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function','function');
function setup({hidden=false,owner=false,webdriver=false,path='/landowner-comparison',search='',referrer='',responses=[200]}={}){
 const calls=[],events=new Map(),timers=new Map(),visitors=randomUUID();let timer=0,index=0;
 const listeners={},windowListeners={};
 const context={validTrafficAction,trafficSourceBasis:()=>'none',trafficSource,location:{hostname:'www.sanzepm.com.tw',pathname:path,search},navigator:{webdriver},document:{referrer,visibilityState:hidden?'hidden':'visible',addEventListener:(n,f)=>listeners[n]=f},window:{addEventListener:(n,f)=>windowListeners[n]=f},crypto:{randomUUID},trafficPage,visitorTrackingMetadata:()=>({excludeFromTraffic:owner,visitorId:visitors}),AbortSignal,setTimeout:(f)=>{timers.set(++timer,f);return timer;},clearTimeout:id=>timers.delete(id),fetch:async(url,options)=>{calls.push(JSON.parse(options.body));const outcome=responses[Math.min(index++,responses.length-1)];if(outcome==='network')throw Error('offline');if(outcome==='lost-response'){events.set(calls.at(-1).eventId,1);throw Error('response lost');}if(outcome===200)events.set(calls.at(-1).eventId,1);return {ok:outcome===200,status:outcome};}};
 const start=runInNewContext(source+';trackPageView;',context);start();
 const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
 return {context,calls,events,flush,visible:()=>{context.document.visibilityState='visible';listeners.visibilitychange?.();},online:()=>windowListeners.online?.(),show:persisted=>windowListeners.pageshow?.({persisted}),retry:async()=>{const [id,f]=timers.entries().next().value||[];if(f){timers.delete(id);await f();await flush();}},timers};
}
let s=setup();await s.flush();assert.equal(s.calls[0].path,'/landowner-comparison');s.visible();s.online();s.show(false);await s.flush();assert.equal(s.calls.length,1);
s.show(true);await s.flush();assert.equal(s.calls.length,2);assert.notEqual(s.calls[0].eventId,s.calls[1].eventId);assert.equal(s.calls[0].visitorId,s.calls[1].visitorId);
s=setup({hidden:true});await s.flush();assert.equal(s.calls.length,0);s.visible();await s.flush();assert.equal(s.calls.length,1);
s=setup({responses:['network',503,200]});await s.flush();await s.retry();await s.retry();assert.equal(s.calls.length,3);assert.equal(new Set(s.calls.map(x=>x.eventId)).size,1);assert.equal(s.events.size,1);
s=setup({responses:['lost-response',200]});await s.flush();await s.retry();assert.equal(s.calls.length,2);assert.equal(s.events.size,1);
s=setup({responses:[503]});await s.flush();await s.retry();await s.retry();s.online();await s.flush();assert.equal(s.calls.length,3);assert.equal(s.timers.size,0);
s=setup({responses:[400]});await s.flush();s.visible();s.online();await s.flush();assert.equal(s.calls.length,1);assert.equal(s.timers.size,0);
for(const opts of [{owner:true},{webdriver:true},{path:'/traffic'},{path:'/traffic/'}]){s=setup(opts);await s.flush();assert.equal(s.calls.length,0);}
s=setup({path:'/insights/renewal-distribution'});await s.flush();assert.equal(s.calls[0].path,'/insights/renewal-distribution');
console.log('PASS: calculator intake, visibility, BFCache visits, bounded retries, stable event deduplication, owner/bot/dashboard exclusion, exact article path recording.');

s=setup({search:'?utm_source=threads&utm_medium=social',referrer:'https://www.google.com/search?q=private'});await s.flush();assert.equal(s.calls[0].trafficSource,'threads_tagged');assert(!JSON.stringify(s.calls).includes('private'));
