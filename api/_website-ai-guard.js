import {readPricing,reservationCost,responseCost} from './_website-ai-cost.js';
import {createHmac,randomUUID} from 'node:crypto';
import {isIP} from 'node:net';
import {createSupabaseAdminClient} from './_supabaseAdmin.js';

const unavailable={allowed:false,status:503,message:'助理暫時無法回覆，請稍後重試，或來電02-2250-8202與三策聯絡。'};
export function makeWebsiteAiGuard({env=process.env,fetchImpl=fetch,dbFactory=createSupabaseAdminClient,log=console.info}={}){
 return async function admit(req,body){
  if(env.WEBSITE_AI_ENABLED!=='true')return unavailable;
  if(!env.WEBSITE_AI_IP_HASH_SECRET||env.WEBSITE_AI_IP_HASH_SECRET.length<32||!env.TURNSTILE_SECRET_KEY)return unavailable;
  // Vercel overwrites x-real-ip; never trust the client-controlled visitor ID or forwarded-for list.
  const ip=env.VERCEL==='1'?req.headers['x-real-ip']:req.socket?.remoteAddress;
  if(typeof ip!=='string'||!isIP(ip))return unavailable;
  if(typeof body.turnstileToken!=='string'||!body.turnstileToken||body.turnstileToken.length>2048)return {allowed:false,status:400,message:'請完成安全驗證後送出。'};
  let db;
  try{
   const pricing=readPricing(env),reserve=reservationCost(pricing);
   const verification=await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:body.turnstileToken,remoteip:ip}),signal:AbortSignal.timeout(6000)});
   const result=await verification.json();
   const hostname=new URL(req.headers.origin).hostname;
   if(!verification.ok||result.success!==true||result.hostname!==hostname||result.action!=='website_assistant')return {allowed:false,status:400,message:'驗證未通過，請重新驗證後送出。'};
   db=dbFactory();if(!db)return unavailable;
   const requestId=randomUUID();
   const ipKey=createHmac('sha256',env.WEBSITE_AI_IP_HASH_SECRET).update(ip).digest('hex');
   const {data,error}=await db.rpc('sanze_website_ai_claim',{p_request:requestId,p_ip:ipKey,p_conversation:body.conversationId,p_reserve:reserve,p_pricing:pricing}).abortSignal(AbortSignal.timeout(5000));
   if(error||!data||typeof data.allowed!=='boolean')throw Error('guard_storage');
   if(!data.allowed)return {allowed:false,status:data.reason==='disabled'?503:429,message:data.reason==='budget'?'助理本期服務額度已用完，請來電02-2250-8202與三策聯絡。':'目前使用次數較多，請稍後再試。',retryAfter:Math.max(1,Number(data.retry_after)||60)};
   if(!Number.isInteger(data.max_output_tokens)||data.max_output_tokens<256||data.max_output_tokens>4000||data.max_tool_calls!==1)throw Error('guard_config');
   if(data.allocation_percent>=80)log(JSON.stringify({event:'website_ai_budget_warning',allocation_percent:data.allocation_percent}));
   let started=false,finished=false;
   async function finish(state,cost=null,usage=null,responseId=null){
    const {error}=await db.rpc('sanze_website_ai_finish',{p_request:requestId,p_state:state,p_cost:cost,p_usage:usage,p_response:responseId}).abortSignal(AbortSignal.timeout(5000));
    if(error)throw Error('settlement_storage');
    finished=true;
   }
   return {allowed:true,requestId,maxOutputTokens:data.max_output_tokens,maxToolCalls:data.max_tool_calls,
    async start(){
     // Mark locally before the RPC: an ambiguous start must retain its reservation.
     started=true;
     const {error}=await db.rpc('sanze_website_ai_start',{p_request:requestId}).abortSignal(AbortSignal.timeout(5000));
     if(error)throw Error('start_storage');
    },
    async settle(response){
     const actual=responseCost(response,pricing);
     try{await finish('settled',actual.amount,actual.usage,actual.responseId);}
     catch(error){log(JSON.stringify({event:'website_ai_settlement_pending',request_id:requestId,response_id:actual.responseId,cost_microusd:actual.amount,usage:actual.usage,pricing_version:pricing.version}));throw error;}
     if(actual.amount>reserve)throw Error('cost_envelope_exceeded');
    },
    async release(){
     if(finished)return;
     try{await finish(started?'unknown':'cancelled');}
     catch{log(JSON.stringify({event:'website_ai_guard',reason:'settlement_pending',request_id:requestId}));}
    }
   };
  }catch{log(JSON.stringify({event:'website_ai_guard',reason:'unavailable'}));return unavailable;}
 };
}
