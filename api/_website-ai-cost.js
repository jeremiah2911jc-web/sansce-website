// Pricing is server-owned and must match the deployed model and standard service tier.
// Use a reviewed snapshot, never rates or usage supplied in the visitor's request.
export function readPricing(env,now=Date.now()){
 const p=JSON.parse(env.WEBSITE_AI_PRICING_JSON||'null');
 if(!p||p.model!==(env.WEB_AI_MODEL||env.LINE_AI_MODEL)||typeof p.version!=='string'||!p.version||!Array.isArray(p.responseModels)||!p.responseModels.length||p.responseModels.some(m=>typeof m!=='string'||!m)||!Number.isFinite(Date.parse(p.validUntil))||Date.parse(p.validUntil)<=now)throw Error('pricing_unavailable');
 for(const key of ['inputPerMillion','cachedInputPerMillion','outputPerMillion','searchCall','contextWindow'])if(!Number.isSafeInteger(p[key])||p[key]<0)throw Error('pricing_invalid');
 if(p.inputPerMillion<=0||p.outputPerMillion<=0||p.contextWindow<4000||p.contextWindow>2000000||p.cachedInputPerMillion>p.inputPerMillion)throw Error('pricing_invalid');
 for(const key of ['cacheWritePerMillion','cacheWrite12hPerMillion'])if(p[key]!==undefined&&(!Number.isSafeInteger(p[key])||p[key]<p.inputPerMillion))throw Error('pricing_invalid');
 if(p.longContext){for(const key of ['threshold','inputPerMillion','cachedInputPerMillion','outputPerMillion'])if(!Number.isSafeInteger(p.longContext[key])||p.longContext[key]<=0)throw Error('pricing_invalid');}
 // These two models have special fixed-block search billing; do not apply linear usage pricing.
 if(/^gpt-(4o-mini|4\.1-mini)(-|$)/.test(p.model))throw Error('unsupported_search_pricing');
 return Object.freeze(p);
}
const ceilDivide=(n,d)=>(n+d-1n)/d;
function tokensCost(input,cached,output,p,writes30=0,writes12=0){
 return ceilDivide(BigInt(input-cached-writes30-writes12)*BigInt(p.inputPerMillion)+BigInt(writes30)*BigInt(p.cacheWritePerMillion??p.inputPerMillion)+BigInt(writes12)*BigInt(p.cacheWrite12hPerMillion??p.inputPerMillion)+BigInt(cached)*BigInt(p.cachedInputPerMillion)+BigInt(output)*BigInt(p.outputPerMillion),1000000n);
}
export function reservationCost(p){
 // At most one web tool and two model passes. Bound each pass by the full context,
 // including tool results, framing and hidden instructions. No character/token guess.
 const tier=p.longContext?{inputPerMillion:Math.max(p.inputPerMillion,p.longContext.inputPerMillion),outputPerMillion:Math.max(p.outputPerMillion,p.longContext.outputPerMillion),cachedInputPerMillion:0}:{...p};
 tier.inputPerMillion=Math.max(tier.inputPerMillion,p.cacheWritePerMillion??0,p.cacheWrite12hPerMillion??0,p.longContext?.cacheWritePerMillion??0,p.longContext?.cacheWrite12hPerMillion??0);
 const amount=Number(tokensCost(p.contextWindow*2,0,4000,tier)+BigInt(p.searchCall));
 if(!Number.isSafeInteger(amount)||amount<=0||amount>3000000)throw Error('request_budget');
 return amount;
}
export function responseCost(data,p){
 if(!p.responseModels.includes(data.model)||data.service_tier!=='default'||typeof data.id!=='string'||!data.id.startsWith('resp_')||!data.usage||!Array.isArray(data.output))throw Error('usage_unavailable');
 const u=data.usage,input=u.input_tokens,output=u.output_tokens,cached=u.input_tokens_details?.cached_tokens??0;
 for(const n of [input,output,cached])if(!Number.isSafeInteger(n)||n<0)throw Error('usage_invalid');
 const details=u.input_tokens_details||{},writes=details.cache_write_tokens??0;
 // Older Responses payloads omit the lifetime breakdown; only a pinned server TTL permits fallback.
 const writes30=details.cache_write_tokens_details?.ttl_30m_tokens??(details.cache_write_tokens_details===undefined&&p.cacheWriteDefaultTtl==='30m'?writes:0),writes12=details.cache_write_tokens_details?.ttl_12h_tokens??0;
 for(const n of [writes,writes30,writes12])if(!Number.isSafeInteger(n)||n<0)throw Error('usage_invalid');
 if(cached+writes>input||writes30+writes12!==writes)throw Error('usage_invalid');
 if(writes&&(!p.cacheWritePerMillion||!p.cacheWrite12hPerMillion))throw Error('pricing_unavailable');
 const searches=data.output.filter(o=>o.type==='web_search_call');
 if(searches.some(o=>!['search','open_page','find_in_page'].includes(o.action?.type)))throw Error('tool_usage_unknown');
 const calls=searches.filter(o=>o.action.type==='search').length;
 if(data.output.some(o=>o.type?.endsWith('_call')&&o.type!=='web_search_call'))throw Error('tool_usage_unknown');
 const tier=p.longContext&&input>p.longContext.threshold?p.longContext:p;
 const amount=Number(tokensCost(input,cached,output,tier,writes30,writes12)+BigInt(calls)*BigInt(p.searchCall));
 if(!Number.isSafeInteger(amount))throw Error('usage_invalid');
 return {amount,usage:{input_tokens:input,cached_tokens:cached,cache_write_30m_tokens:writes30,cache_write_12h_tokens:writes12,output_tokens:output,web_search_calls:calls},responseId:data.id};
}
