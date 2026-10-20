import {createHash,createCipheriv,createDecipheriv,randomBytes,timingSafeEqual} from 'node:crypto';
import {createSupabaseAdminClient} from './_supabaseAdmin.js';
export const timeoutMessage='不好意思，讓您久等了。三策人員可能正在忙，尚未能回覆您的訊息，請您稍候。您可以留下問題，等人員回覆；若想由 AI 助理協助，請輸入「恢復AI」。';
export function sealRecipient(user,secret){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',createHash('sha256').update(secret).digest(),iv);return Buffer.concat([iv,c.update(user),c.final(),c.getAuthTag()]).toString('base64');}
export function openRecipient(value,secret){const b=Buffer.from(value,'base64'),c=createDecipheriv('aes-256-gcm',createHash('sha256').update(secret).digest(),b.subarray(0,12));c.setAuthTag(b.subarray(-16));return Buffer.concat([c.update(b.subarray(12,-16)),c.final()]).toString();}
export function makeTimeoutHandler({env=process.env,dbFactory=createSupabaseAdminClient,fetchImpl=fetch}={}){return async(req,res)=>{
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 const supplied=String(req.headers.authorization||''),expected=`Bearer ${env.LINE_TIMEOUT_SECRET||''}`;
 if(req.method!=='POST')return reply(405,{ok:false});
 const suppliedBytes=Buffer.from(supplied),expectedBytes=Buffer.from(expected);
 if(!env.LINE_TIMEOUT_SECRET||suppliedBytes.length!==expectedBytes.length||!timingSafeEqual(suppliedBytes,expectedBytes))return reply(401,{ok:false});
 if(env.LINE_AI_ENABLED!=='true'||env.LINE_TIMEOUT_ENABLED!=='true')return reply(200,{ok:true,enabled:false});
 const db=dbFactory();if(!db)return reply(503,{ok:false});
 try{
  const quota=await fetchImpl('https://api.line.me/v2/bot/message/quota',{headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`},signal:AbortSignal.timeout(5000)});
  const consumption=await fetchImpl('https://api.line.me/v2/bot/message/quota/consumption',{headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`},signal:AbortSignal.timeout(5000)});
  if(!quota.ok||!consumption.ok)return reply(503,{ok:false});
  const q=await quota.json(),used=await consumption.json();
  // Never change plan or buy extra messages. Stay within the current account allocation.
  if(q.type==='limited'&&used.totalUsage>=q.value)return reply(200,{ok:true,quotaExhausted:true});
  const budget=q.type==='limited'?Math.max(0,q.value-used.totalUsage):5;
  const {data:jobs,error}=await db.rpc('sanze_line_timeout_claim',{p_limit:Math.min(5,budget)});if(error)throw Error('storage');
  let sent=0,failed=0;
  for(const job of jobs||[]){
   const {data:active,error:e}=await db.rpc('sanze_line_timeout_active',{p_id:job.id});if(e)throw Error('storage');if(!active)continue;
   let delivered=false;
   try{const result=await fetchImpl('https://api.line.me/v2/bot/message/push',{method:'POST',headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json','X-Line-Retry-Key':job.id},body:JSON.stringify({to:openRecipient(job.recipient,env.LINE_CHANNEL_SECRET),messages:[{type:'text',text:timeoutMessage}]}),signal:AbortSignal.timeout(6000)});delivered=result.ok||result.status===409;}catch{}
   const {error:f}=await db.rpc('sanze_line_timeout_finish',{p_id:job.id,p_sent:delivered,p_text:timeoutMessage});if(f)throw Error('storage');delivered?sent++:failed++;
  }
  return reply(200,{ok:true,sent,failed});
 }catch{return reply(503,{ok:false});}
};}
export default makeTimeoutHandler();
