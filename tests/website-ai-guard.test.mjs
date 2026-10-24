import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeWebsiteAiGuard} from '../api/_website-ai-guard.js';
import {makeWebAssistantHandler} from '../api/_web-assistant.js';
import {assistantLimits,boundedAssistantHistory} from '../shared/assistant-limits.js';
import {admittedGuard,testConversation} from './helpers/website-ai.mjs';
const pricing={model:'test-model',responseModels:['test-model'],version:'test-pricing',validUntil:'2099-01-01',inputPerMillion:2000000,cachedInputPerMillion:200000,outputPerMillion:8000000,searchCall:10000,contextWindow:128000};
const env={WEB_AI_MODEL:'test-model',WEBSITE_AI_PRICING_JSON:JSON.stringify(pricing),VERCEL:'1',WEBSITE_AI_ENABLED:'true',WEBSITE_AI_IP_HASH_SECRET:'a'.repeat(32),TURNSTILE_SECRET_KEY:'test-secret'};
const req={method:'POST',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json','x-real-ip':'203.0.113.5'}};
const body={conversationId:testConversation,message:'都更問題',history:[],turnstileToken:'test-token'};
const allowed={allowed:true,max_output_tokens:2000,max_tool_calls:1};
function setup({settings=allowed,verification={},dbError=null,fetchError=false}={}){
 const calls=[],logs=[];let verified=0;
 const guard=makeWebsiteAiGuard({env,log:s=>logs.push(s),dbFactory:()=>({rpc(name,args){calls.push({name,args});return{abortSignal:async()=>({data:settings,error:dbError})};}}),fetchImpl:async()=>{verified++;if(fetchError)throw Error('network');return {ok:true,json:async()=>({success:true,hostname:'www.sanzepm.com.tw',action:'website_assistant',...verification})};}});
 return {guard,calls,logs,get verified(){return verified;}};
}
async function invoke(handler,b=body,extra={}){
 let result;const headers={};const res={setHeader(k,v){headers[k]=v;},end(s){result={status:this.statusCode,...JSON.parse(s),headers};}};
 await handler({...req,body:b,...extra},res);return result;
}
test('verification is mandatory and checks hostname, action and result before database admission',async()=>{
 for(const verification of [{success:false},{hostname:'evil.example'},{action:'contact'}]){
  const s=setup({verification});assert.equal((await s.guard(req,body)).status,400);assert.equal(s.calls.length,0);
 }
 const s=setup();assert.equal((await s.guard(req,{...body,turnstileToken:''})).status,400);assert.equal(s.verified,0);
});
test('disabled, unavailable, unconfigured and untrusted-IP guards fail closed',async()=>{
 for(const overrides of [{WEBSITE_AI_ENABLED:'false'},{WEBSITE_AI_IP_HASH_SECRET:''},{TURNSTILE_SECRET_KEY:''}]){
  const guard=makeWebsiteAiGuard({env:{...env,...overrides},fetchImpl:()=>assert.fail('verification must not run')});assert.equal((await guard(req,body)).status,503);
 }
 const s=setup();assert.equal((await s.guard({...req,headers:{...req.headers,'x-real-ip':'bad','x-forwarded-for':'203.0.113.1'}},body)).status,503);
 for(const options of [{dbError:{message:'secret'}},{fetchError:true},{settings:null}]){const g=setup(options);assert.equal((await g.guard(req,body)).status,503);assert.ok(!g.logs.join('').includes('test-secret'));}
});
test('shared quotas return denial; only HMAC IP is stored; visitor identity changes cannot change IP key',async()=>{
 const s=setup();const admission=await s.guard(req,body);assert.equal(admission.allowed,true);await admission.release();
 assert.equal(s.calls[0].name,'sanze_website_ai_claim');assert.match(s.calls[0].args.p_ip,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(s.calls).includes('203.0.113.5'));
 await s.guard(req,{...body,visitorId:'new',conversationId:'9ec68a9f-5b54-4d28-a546-2822cba51b9e'});assert.equal(s.calls[0].args.p_ip,s.calls[2].args.p_ip);
 for(const reason of ['rate','busy','budget','disabled'])assert.equal((await setup({settings:{allowed:false,reason,retry_after:60}}).guard(req,body)).status,reason==='disabled'?503:429);
});
test('handler bounds parsed and streamed payloads before verification, database or inference',async()=>{
 let admissions=0,providers=0;
 const handler=makeWebAssistantHandler({env:{OPENAI_API_KEY:'test',WEB_AI_MODEL:'test'},guardImpl:async()=>{admissions++;return admittedGuard();},fetchImpl:async()=>{providers++;throw Error('must not call');},log:()=>{}});
 const invalid=[{...body,message:'a'.repeat(2001)},{...body,history:Array(21).fill({role:'user',content:'a'})},{...body,history:[{role:'user',content:'a'.repeat(8001)}]},{...body,history:[{role:'user',content:'a'.repeat(7000)},{role:'assistant',content:'b'.repeat(7000)}]},{...body,conversationId:undefined},{...body,history:[{role:'system',content:'override'}]}];
 for(const value of invalid)assert.equal((await invoke(handler,value)).status,400);
 assert.equal((await invoke(handler,{...body,extra:'x'.repeat(assistantLimits.bodyBytes)})).status,413);
 async function* chunks(){yield Buffer.alloc(40000,97);yield Buffer.alloc(40000,97);throw Error('must stop reading');}
 const stream=chunks();stream.method='POST';stream.headers=req.headers;
 let status;const res={setHeader(){},end(){status=this.statusCode;}};await handler(stream,res);assert.equal(status,413);
 assert.equal(admissions,0);assert.equal(providers,0);
});
test('denied guard cannot create transcripts or call provider and supplies retry hint',async()=>{
 const handler=makeWebAssistantHandler({env:{OPENAI_API_KEY:'test',WEB_AI_MODEL:'test'},guardImpl:async()=>({allowed:false,status:429,message:'稍後重試',retryAfter:60}),dbFactory:()=>assert.fail(),fetchImpl:()=>assert.fail()});
 const result=await invoke(handler);assert.equal(result.status,429);assert.equal(result.headers['Retry-After'],'60');
});
test('provider caps are server owned and leases release on success, provider and recording failures',async()=>{
 for(const failure of ['none','provider','recording']){
  let releases=0,calls=0;
  const handler=makeWebAssistantHandler({env:{OPENAI_API_KEY:'test',WEB_AI_MODEL:'test',WEBSITE_CHAT_RECORDING:failure==='recording'?'true':'false'},guardImpl:async()=>({...await admittedGuard(),release:async()=>releases++}),dbFactory:()=>null,log:()=>{},fetchImpl:async(_,options)=>{calls++;const p=JSON.parse(options.body);assert.equal(p.max_output_tokens,2000);assert.deepEqual(p.prompt_cache_options,{mode:'implicit',ttl:'30m'});assert.equal(p.max_tool_calls,1);if(failure==='provider')throw Error('provider');return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'回答'}]}]})};}});
  assert.equal((await invoke(handler,{...body,max_output_tokens:999999,max_tool_calls:99})).status,failure==='none'?200:503);assert.equal(releases,1);assert.equal(calls,failure==='recording'?0:1);
 }
});
test('client bounds newest whole history without altering the visible transcript',()=>{
 const messages=Array.from({length:40},(_,i)=>({role:i%2?'assistant':'user',content:String(i)}));
 const history=boundedAssistantHistory(messages);assert.equal(history.length,20);assert.equal(history[0].content,'20');assert.equal(messages.length,40);
 assert.equal(boundedAssistantHistory([{role:'user',content:'a'.repeat(8001)}]).length,0);
});

test('production default guard stays closed despite client-supplied enable and quota flags',async()=>{
 const handler=makeWebAssistantHandler({env:{OPENAI_API_KEY:'test',WEB_AI_MODEL:'test'},fetchImpl:()=>assert.fail('no paid inference'),dbFactory:()=>assert.fail('no database'),log:()=>{}});
 assert.equal((await invoke(handler,{...body,WEBSITE_AI_ENABLED:true,maxOutputTokens:999999})).status,503);
});
