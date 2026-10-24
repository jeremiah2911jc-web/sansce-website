import {createHash} from 'node:crypto';
import {readPricing,reservationCost} from '../../api/_website-ai-cost.js';

export const sources={
 pricing:'https://developers.openai.com/api/docs/pricing.md',
 model:'https://developers.openai.com/api/docs/models/gpt-6-luna.md',
 cache:'https://developers.openai.com/api/docs/guides/prompt-caching.md',
};
const assert=(ok,reason)=>{if(!ok)throw Error(reason);};
const cells=line=>line.trim().split('|').slice(1,-1).map(s=>s.trim());
function dollar(value){
 const m=value.match(/^\$(\d+)(?:\.(\d{1,6}))?$/);
 assert(m,'unrecognized_price');
 const amount=Number(BigInt(m[1])*1000000n+BigInt((m[2]||'').padEnd(6,'0')));
 assert(Number.isSafeInteger(amount)&&amount>0,'invalid_price');
 return amount;
}
function uniqueMatch(text,pattern,reason){
 const matches=[...text.matchAll(pattern)];assert(matches.length===1,reason);return matches[0];
}
export function parseOfficialPricing(docs){
 const {pricing,model,cache}=docs;
 assert(/Model ID:\s*\x60gpt-6-luna\x60/.test(model),'unexpected_model');
 assert(!/promotional|promotion|surcharge|fixed.block/i.test(model),'unsupported_model_pricing_change');
 const standards=[...pricing.matchAll(/### Standard pricing data\s+([\s\S]*?)(?=\n##|\n###|$)/g)].map(m=>m[1]).filter(block=>block.split('\n').some(line=>cells(line)[0]==='gpt-6-luna'));
 assert(standards.length===1,'standard_table_missing');const standard=standards[0];
 const lines=standard.split('\n').filter(l=>l.trim().startsWith('|'));
 const header=cells(lines[0]||'');
 const wanted=['Model','Short context input','Short context output','Short context cached input','Short context 30m write','Short context 12h write','Long context input','Long context output','Long context cached input','Long context 30m write','Long context 12h write'];
 assert(JSON.stringify(header)===JSON.stringify(wanted),'pricing_columns_changed');
 const rows=lines.map(cells).filter(row=>row[0]==='gpt-6-luna');
 assert(rows.length===1&&rows[0].length===wanted.length,'model_price_row_missing');
 const rates=rows[0].slice(1).map(dollar);
 const metrics=new Map(model.split('\n').filter(l=>/^\|\s*(Input|Output|Cached input|Cache writes)\s*\|/.test(l)).map(l=>{const c=cells(l);assert(c[2]==='1M tokens','model_price_unit_changed');return [c[0],dollar(c[1])];}));
 assert(metrics.size===4&&metrics.get('Input')===rates[0]&&metrics.get('Output')===rates[1]&&metrics.get('Cached input')===rates[2]&&metrics.get('Cache writes')===rates[3],'official_sources_disagree');
 const context=Number(uniqueMatch(model,/^- ([\d,]+) context window$/gm,'context_missing')[1].replaceAll(',',''));
 const long=uniqueMatch(model,/Prompts with more than (\d+)K input tokens are priced at ([\d.]+)x input and cache rates and ([\d.]+)x output for the full request\./g,'long_context_rule_missing');
 const threshold=uniqueMatch(pricing,/Short context: ≤(\d+)K input tokens\. Long context: >(\d+)K input tokens\./g,'pricing_threshold_missing');
 assert(threshold[1]===long[1]&&threshold[2]===long[1],'context_thresholds_disagree');
 const [input,output,cached,write30,write12,longInput,longOutput,longCached,longWrite30,longWrite12]=rates;
 assert(longInput===input*Number(long[2])&&longCached===cached*Number(long[2])&&longWrite30===write30*Number(long[2])&&longWrite12===write12*Number(long[2])&&longOutput===output*Number(long[3]),'long_context_prices_disagree');
 const shortTTL=uniqueMatch(cache,/^\|\s*\x60"30m"\x60 \(default\)\s*\|\s*30 minutes\s*\|\s*([\d.]+)× the uncached input-token rate\s*\|/gm,'cache_30m_rule_missing');
 const longTTL=uniqueMatch(cache,/^\|\s*\x60"12h"\x60\s*\|\s*12 hours\s*\|\s*([\d.]+)× the uncached input-token rate\s*\|/gm,'cache_12h_rule_missing');
 assert(write30===input*Number(shortTTL[1])&&write12===input*Number(longTTL[1]),'cache_prices_disagree');
 const search=uniqueMatch(pricing,/^\|\s*Web search\s*\|\s*Web search \(all models\)\s*\|\s*(\$\d+(?:\.\d+)?) \/ 1k calls \+ Search content tokens billed at model rates\.\s*\|/gm,'search_price_missing');
 const perThousand=dollar(search[1]);assert(perThousand%1000===0,'unsupported_search_precision');
 return {model:'gpt-6-luna',responseModels:['gpt-6-luna'],inputPerMillion:input,outputPerMillion:output,cachedInputPerMillion:cached,cacheWritePerMillion:write30,cacheWrite12hPerMillion:write12,searchCall:perThousand/1000,contextWindow:context,longContext:{threshold:Number(long[1])*1000,inputPerMillion:longInput,outputPerMillion:longOutput,cachedInputPerMillion:longCached,cacheWritePerMillion:longWrite30,cacheWrite12hPerMillion:longWrite12},cacheWriteDefaultTtl:'30m'};
}
const rateKeys=['model','responseModels','inputPerMillion','outputPerMillion','cachedInputPerMillion','cacheWritePerMillion','cacheWrite12hPerMillion','searchCall','contextWindow','longContext','cacheWriteDefaultTtl'];
const rates=p=>Object.fromEntries(rateKeys.map(k=>[k,p[k]]));
const stable=value=>JSON.stringify(value,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function reviewSnapshot(current,docs,{now=Date.now(),force=false}={}){
 const parsed=parseOfficialPricing(docs);
 const changedRates=stable(rates(current))!==stable(rates(parsed));
 assert(current.model===parsed.model,'model_change_not_authorized');
 const remaining=Date.parse(current.validUntil)-now;
 assert(Number.isFinite(remaining),'invalid_current_expiry');
 const needsUpdate=force||changedRates||remaining<=14*86400000;
 if(!needsUpdate)return {changed:false,changedRates,pricing:current};
 const next={...parsed,version:'openai-standard-'+new Date(now).toISOString(),reviewedAt:new Date(now).toISOString(),validUntil:new Date(now+30*86400000).toISOString(),sources:Object.values(sources),sourceEvidence:Object.entries(sources).map(([key,url])=>({url,sha256:createHash('sha256').update(docs[key]).digest('hex')}))};
 readPricing({WEB_AI_MODEL:next.model,WEBSITE_AI_PRICING_JSON:JSON.stringify(next)},now);
 reservationCost(next);
 return {changed:true,changedRates,pricing:next};
}
export async function fetchOfficialDocs(fetchImpl=fetch){
 const entries=await Promise.all(Object.entries(sources).map(async([key,url])=>{
  let last;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetchImpl(url,{headers:{Accept:'text/markdown','User-Agent':'SanzePricingMaintenance/1.0'},signal:AbortSignal.timeout(15000)});
    assert(response.ok&&new URL(response.url||url).hostname==='developers.openai.com','official_source_unavailable');
    const body=await response.text();assert(body.length>100&&body.length<=1000000,'official_document_invalid');return [key,body];
   }catch(error){last=error;}
  }
  throw Error('official_source_failed_'+key,{cause:last});
 }));
 return Object.fromEntries(entries);
}
