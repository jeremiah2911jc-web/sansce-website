import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOfficialPricing,reviewSnapshot,fetchOfficialDocs} from '../scripts/lib/website-ai-price-review.mjs';
import {makeAssistantPricingStatus,pricingHash} from '../api/_website-ai-status.js';
import {readPricing} from '../api/_website-ai-cost.js';
import {matchesDeployment} from '../scripts/maintain-assistant-pricing.mjs';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/website-ai-pricing.json',import.meta.url),'utf8'));
const now=Date.parse('2026-10-24T10:00:00Z');
function docsFor(p=fixture){
 const usd=n=>'$'+n/1000000,q=String.fromCharCode(96),l=p.longContext;
 return {
  pricing:['### Standard pricing data','| Model | Short context input | Short context output | Short context cached input | Short context 30m write | Short context 12h write | Long context input | Long context output | Long context cached input | Long context 30m write | Long context 12h write |','| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |','| gpt-6-luna | '+[p.inputPerMillion,p.outputPerMillion,p.cachedInputPerMillion,p.cacheWritePerMillion,p.cacheWrite12hPerMillion,l.inputPerMillion,l.outputPerMillion,l.cachedInputPerMillion,l.cacheWritePerMillion,l.cacheWrite12hPerMillion].map(usd).join(' | ')+' |','### Batch pricing data','| gpt-6-luna | $999 |','### Tool pricing','Short context: ≤272K input tokens. Long context: >272K input tokens.','| Web search | Web search (all models) | '+usd(p.searchCall*1000)+' / 1k calls + Search content tokens billed at model rates. |'].join('\n'),
  model:['Model ID: '+q+'gpt-6-luna'+q,'- 1,050,000 context window','| Input | '+usd(p.inputPerMillion)+' | 1M tokens |','| Output | '+usd(p.outputPerMillion)+' | 1M tokens |','| Cached input | '+usd(p.cachedInputPerMillion)+' | 1M tokens |','| Cache writes | '+usd(p.cacheWritePerMillion)+' | 1M tokens |','Prompts with more than 272K input tokens are priced at 2x input and cache rates and 1.5x output for the full request.'].join('\n'),
  cache:['Cache lifetime rules used by this synthetic documentation fixture.','| '+q+'"30m"'+q+' (default) | 30 minutes | 1.25× the uncached input-token rate |','| '+q+'"12h"'+q+' | 12 hours | 2.5× the uncached input-token rate |'].join('\n'),
 };
}
test('official Standard rates are cross-checked against model and cache rules; Batch is excluded',()=>{
 const p=parseOfficialPricing(docsFor());
 for(const key of ['inputPerMillion','outputPerMillion','cachedInputPerMillion','cacheWritePerMillion','cacheWrite12hPerMillion','searchCall','contextWindow'])assert.equal(p[key],fixture[key]);
 assert.deepEqual(p.longContext,fixture.longContext);
});
test('unchanged fresh prices do not extend expiry; due prices get a documented 30-day review',()=>{
 const fresh=reviewSnapshot(fixture,docsFor(),{now});assert.equal(fresh.changed,false);assert.equal(fresh.pricing,fixture);
 const due=Date.parse('2026-11-10T00:00:00Z'),result=reviewSnapshot(fixture,docsFor(),{now:due});
 assert.equal(result.changed,true);assert.equal(result.changedRates,false);
 assert.equal(Date.parse(result.pricing.validUntil),due+30*86400000);
 assert.equal(result.pricing.sourceEvidence.length,3);
 assert.ok(result.pricing.sourceEvidence.every(e=>/^[0-9a-f]{64}$/.test(e.sha256)));
 assert.equal(reviewSnapshot(fixture,docsFor(),{now,force:true}).changed,true);
});
test('verified price changes update immediately but never bypass the USD 3 reservation envelope',()=>{
 const doubled=structuredClone(fixture);
 for(const p of [doubled,doubled.longContext])for(const k of ['inputPerMillion','outputPerMillion','cachedInputPerMillion','cacheWritePerMillion','cacheWrite12hPerMillion'])p[k]*=2;
 const result=reviewSnapshot(fixture,docsFor(doubled),{now});
 assert.equal(result.changedRates,true);assert.equal(result.pricing.inputPerMillion,200000);
 for(const p of [doubled,doubled.longContext])for(const k of ['inputPerMillion','outputPerMillion','cachedInputPerMillion','cacheWritePerMillion','cacheWrite12hPerMillion'])p[k]*=100;
 assert.throws(()=>reviewSnapshot(fixture,docsFor(doubled),{now}),/request_budget/);
});
test('source disagreement, unsupported billing changes, missing columns and duplicate rows block renewal',()=>{
 const docs=docsFor();
 for(const broken of [
  {...docs,model:docs.model.replace('| Input | $0.1','| Input | $0.2')},
  {...docs,pricing:docs.pricing.replace('Short context 12h write','Unknown fee')},
  {...docs,model:docs.model+'\nPromotional pricing applies.'},
  {...docs,cache:docs.cache.replace('2.5×','3×')},
  {...docs,model:docs.model.replace('272K','300K')},
  {...docs,pricing:docs.pricing.replace('### Batch pricing data',docs.pricing.split('\n')[3]+'\n### Batch pricing data')},
 ])assert.throws(()=>reviewSnapshot(fixture,broken,{now,force:true}));
 assert.throws(()=>reviewSnapshot({...fixture,model:'different'},docs,{now}),/model_change_not_authorized/);
});
test('cloud source reads retry transient failures and reject off-domain redirects',async()=>{
 let calls=0;const seen=new Set();
 const result=await fetchOfficialDocs(async url=>{calls++;if(!seen.has(url)){seen.add(url);return {ok:false,url};}return {ok:true,url,text:async()=>Object.values(docsFor()).find(s=>url.includes('/models/')?s.startsWith('Model ID:'):url.includes('prompt-caching')?s.startsWith('Cache lifetime'):s.startsWith('###'))};});
 assert.equal(calls,6);assert.ok(result.pricing.includes('Standard pricing'));
 await assert.rejects(()=>fetchOfficialDocs(async()=>({ok:true,url:'https://invalid.example/price',text:async()=>'x'.repeat(1000)})),/official_source_failed/);
});
test('production must serve the candidate hash, model, source and expiry, not just HTTP 200',()=>{
 const p={...fixture,validUntil:new Date(now+30*86400000).toISOString()};
 const status={status:'ok',pricing:{model:p.model,version:p.version,validUntil:p.validUntil,sha256:pricingHash(p),source:'bundled'}};
 assert.equal(matchesDeployment(status,p,now),true);
 for(const patch of [{sha256:'stale'},{model:'different'},{source:'environment'},{version:'old'},{validUntil:'2020-01-01'}])assert.equal(matchesDeployment({...status,pricing:{...status.pricing,...patch}},p,now),false);
});
test('bundled production prices ignore obsolete environment JSON and health never reveals credentials',()=>{
 const env={WEB_AI_MODEL:'gpt-6-luna',WEBSITE_AI_PRICING_SOURCE:'bundled',WEBSITE_AI_PRICING_JSON:'obsolete invalid JSON',WEBSITE_AI_ENABLED:'true',OPENAI_API_KEY:'private-test-key'};
 const p=readPricing(env,now);assert.equal(p.model,fixture.model);
 let payload;const headers={};const res={setHeader(k,v){headers[k]=v;},end(v){payload=JSON.parse(v);}};
 makeAssistantPricingStatus({env,now:()=>now})({method:'GET'},res);
 assert.equal(res.statusCode,200);assert.equal(payload.pricing.sha256,pricingHash(p));assert.equal(payload.pricing.source,'bundled');
 assert.equal(headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(payload).includes('private-test-key'));
 makeAssistantPricingStatus({env:{...env,WEB_AI_MODEL:'wrong'},now:()=>now})({method:'GET'},res);assert.equal(res.statusCode,503);
 makeAssistantPricingStatus({env,now:()=>now})({method:'POST'},res);assert.equal(res.statusCode,405);
});
