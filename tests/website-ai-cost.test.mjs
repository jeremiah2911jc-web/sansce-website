import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPricing,reservationCost,responseCost} from '../api/_website-ai-cost.js';
import {makeWebsiteAiGuard} from '../api/_website-ai-guard.js';
import {makeWebAssistantHandler} from '../api/_web-assistant.js';
import {testConversation} from './helpers/website-ai.mjs';
const pricing={model:'test-model',responseModels:['test-model-snapshot'],version:'synthetic-test-only',validUntil:'2099-01-01',inputPerMillion:2000000,cachedInputPerMillion:200000,outputPerMillion:8000000,searchCall:10000,contextWindow:128000};
const provider=(usage={input_tokens:1000,input_tokens_details:{cached_tokens:400},output_tokens:200},output=[])=>({id:'resp_test',model:'test-model-snapshot',service_tier:'default',usage,output});
const env={WEB_AI_MODEL:'test-model',OPENAI_API_KEY:'fake',VERCEL:'1',WEBSITE_AI_ENABLED:'true',WEBSITE_AI_IP_HASH_SECRET:'x'.repeat(32),TURNSTILE_SECRET_KEY:'fake',WEBSITE_AI_PRICING_JSON:JSON.stringify(pricing)};
const request={method:'POST',headers:{origin:'https://www.sanzepm.com.tw','x-real-ip':'203.0.113.1','content-type':'application/json'},body:{conversationId:testConversation,message:'您好',history:[],turnstileToken:'test'}};
const verify={ok:true,json:async()=>({success:true,hostname:'www.sanzepm.com.tw',action:'website_assistant'})};
const admitted={allowed:true,max_output_tokens:2000,max_tool_calls:1};
test('actual input/cache/output and search actions are charged with integer precision',()=>{
 assert.equal(responseCost(provider(),pricing).amount,2880);
 assert.equal(responseCost(provider(undefined,[{type:'web_search_call',action:{type:'search'}}]),pricing).amount,12880);
 assert.equal(responseCost(provider(undefined,[{type:'web_search_call',action:{type:'open_page'}}]),pricing).amount,2880);
 assert.equal(responseCost(provider({input_tokens:1,output_tokens:0}),{...pricing,inputPerMillion:1}).amount,1);
 // output_tokens already includes reasoning: never add its breakdown a second time.
 assert.equal(responseCost(provider({input_tokens:0,output_tokens:100,output_tokens_details:{reasoning_tokens:90}}),pricing).amount,800);
 assert.equal(reservationCost(pricing),554000);assert.ok(responseCost(provider(),pricing).amount<reservationCost(pricing));
});
test('missing, wrong-model, expired and unsupported price snapshots fail closed',()=>{
 for(const overrides of [{WEBSITE_AI_PRICING_JSON:''},{WEB_AI_MODEL:'other'},{WEBSITE_AI_PRICING_JSON:JSON.stringify({...pricing,validUntil:'2020-01-01'})}])assert.throws(()=>readPricing({...env,...overrides}));
 assert.throws(()=>reservationCost({...pricing,inputPerMillion:100000000}),/request_budget/);
 for(const bad of [{...provider(),usage:null},{...provider(),model:'other'},{...provider(),service_tier:'priority'},provider({input_tokens:-1,output_tokens:3}),provider({input_tokens:1,output_tokens:3,input_tokens_details:{cached_tokens:2}}),provider(undefined,[{type:'web_search_call'}])])assert.throws(()=>responseCost(bad,pricing));
});
function fixture({settlementError=false}={}){
 const calls=[];
 const guard=makeWebsiteAiGuard({env,log:()=>{},fetchImpl:async()=>verify,dbFactory:()=>({rpc(name,args){calls.push({name,args});return {abortSignal:async()=>({data:admitted,error:settlementError&&name==='sanze_website_ai_finish'?{message:'offline'}:null})};}})});
 return {guard,calls};
}
test('admission reserves computed worst case, then settles usage once and releases unused credit',async()=>{
 const s=fixture();const a=await s.guard(request,request.body);assert.equal(s.calls[0].args.p_reserve,554000);
 await a.start();await a.settle(provider());await a.release();assert.deepEqual(s.calls.map(c=>c.name),['sanze_website_ai_claim','sanze_website_ai_start','sanze_website_ai_finish']);
 assert.equal(s.calls[2].args.p_cost,2880);assert.equal(s.calls[2].args.p_state,'settled');assert.equal(s.calls[2].args.p_response,'resp_test');
});
test('pre-call cancellation refunds; timeout, malformed usage and failed settlement retain reserves',async()=>{
 let s=fixture(),a=await s.guard(request,request.body);await a.release();assert.equal(s.calls.at(-1).args.p_state,'cancelled');
 s=fixture();a=await s.guard(request,request.body);await a.start();await a.release();assert.equal(s.calls.at(-1).args.p_state,'unknown');assert.equal(s.calls.at(-1).args.p_cost,null);
 s=fixture();a=await s.guard(request,request.body);await a.start();await assert.rejects(()=>a.settle({}));await a.release();assert.equal(s.calls.at(-1).args.p_state,'unknown');
 s=fixture({settlementError:true});a=await s.guard(request,request.body);await a.start();await assert.rejects(()=>a.settle(provider()));await a.release();assert.equal(s.calls.at(-1).args.p_state,'unknown');
});
test('handler settles before formatting/storage and never refunds a paid response if recording fails',async()=>{
 const events=[];let updates=0;
 const response={...provider(),output:[{type:'message',content:[{type:'output_text',text:'回答'}]}]};
 const handler=makeWebAssistantHandler({env:{...env,WEBSITE_CHAT_RECORDING:'true'},log:()=>{},guardImpl:async()=>({allowed:true,maxOutputTokens:2000,maxToolCalls:1,start:async()=>events.push('start'),settle:async d=>{events.push('settle');assert.equal(d.id,'resp_test');},release:async()=>events.push('release')}),dbFactory:()=>({from(){return {insert:async()=>({error:null}),update(){updates++;return {eq:async()=>({error:{message:'offline'}})};}}}}),fetchImpl:async(_,options)=>{events.push('provider');assert.equal(JSON.parse(options.body).service_tier,'default');return {ok:true,json:async()=>response};}});
 const res={setHeader(){},end(){}};await handler(request,res);assert.equal(res.statusCode,503);assert.ok(updates>0);assert.deepEqual(events,['start','provider','settle','release']);
});

test('cache writes use their total lifetime rates once and malformed breakdown fails closed',()=>{
 const p={...pricing,cacheWritePerMillion:2500000,cacheWrite12hPerMillion:5000000};
 const usage={input_tokens:12000,input_tokens_details:{cached_tokens:4000,cache_write_tokens:7000,cache_write_tokens_details:{ttl_30m_tokens:3000,ttl_12h_tokens:4000}},output_tokens:0};
 assert.equal(responseCost(provider(usage),p).amount,30300);
 assert.equal(reservationCost(p),1322000);
 assert.throws(()=>responseCost(provider({...usage,input_tokens:1}),p));
 assert.throws(()=>responseCost(provider({...usage,input_tokens_details:{cache_write_tokens:1}}),p));
 assert.throws(()=>responseCost(provider(usage),pricing));
});

test('reviewed production snapshot bounds both model passes, long context and cache writes',()=>{
 const p=JSON.parse(readFileSync(new URL('./fixtures/website-ai-pricing.json',import.meta.url)));
 assert.equal(reservationCost(p),1063000);
 const data={id:'resp_long',model:p.model,service_tier:'default',usage:{input_tokens:300000,input_tokens_details:{cached_tokens:100000,cache_write_tokens:100000,cache_write_tokens_details:{ttl_30m_tokens:100000,ttl_12h_tokens:0}},output_tokens:2000},output:[{type:'web_search_call',action:{type:'search'}}]};
 assert.equal(responseCost(data,p).amount,58500);
});

test('production legacy cache-write aggregate uses the pinned 30m lifetime',()=>{
 const p=JSON.parse(readFileSync(new URL('./fixtures/website-ai-pricing.json',import.meta.url)));
 const data={id:'resp_legacy',model:p.model,service_tier:'default',usage:{input_tokens:12656,input_tokens_details:{cache_write_tokens:12653,cached_tokens:0},output_tokens:84},output:[]};
 assert.equal(responseCost(data,p).amount,1624);
 assert.equal(responseCost(data,p).usage.cache_write_30m_tokens,12653);
 assert.throws(()=>responseCost(data,{...p,cacheWriteDefaultTtl:undefined}));
});
