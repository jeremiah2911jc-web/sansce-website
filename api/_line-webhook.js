import { sealRecipient } from './_line-timeout.js';
import { createHmac } from 'node:crypto';
import { createSupabaseAdminClient } from './_supabaseAdmin.js';
import { verifyLineSignature, wantsHuman, wantsAI, generateLineAnswer } from './_line-ai.js';
export const config = { api: { bodyParser: false }, maxDuration: 60 };
async function readRaw(req) {
 const chunks=[];let bytes=0;
 for await (const chunk of req) {bytes+=Buffer.byteLength(chunk);if(bytes>65536)throw new Error('size');chunks.push(Buffer.from(chunk));}
 return Buffer.concat(chunks);
}
const manual='已切換為真人回覆，您可以留下問題，三策人員會在這裡接續處理。如想繼續詢問助理，輸入「恢復AI」即可。若想維持真人，輸入「保持真人」。';
export function makeLineHandler({env=process.env,fetchImpl=fetch,dbFactory=createSupabaseAdminClient,generate=generateLineAnswer}={}) {
 return async (req,res)=>{
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  const respond=(status)=>{res.statusCode=status;res.end(JSON.stringify({ok:status===200}));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(405);}
  let raw;try{raw=await readRaw(req);}catch{return respond(413);}
  if(!verifyLineSignature(raw,req.headers['x-line-signature'],env.LINE_CHANNEL_SECRET))return respond(401);
  let body;try{body=JSON.parse(raw);}catch{return respond(400);}
  if(!Array.isArray(body.events)||body.events.length>10)return respond(400);
  if(!body.events.length){
   if(body.sanzeDiagnostic===true){
    const probe=dbFactory();let database=false;
    if(probe){const {error}=await probe.from('sanze_line_sessions').select('user_key').limit(0);database=!error;}
    res.statusCode=200;return res.end(JSON.stringify({ok:true,database,aiConfigured:Boolean(env.OPENAI_API_KEY&&env.LINE_AI_MODEL),lineConfigured:Boolean(env.LINE_CHANNEL_ACCESS_TOKEN),enabled:env.LINE_AI_ENABLED==='true',testMode:Boolean(env.LINE_AI_TEST_USER_ID)}));
   }
   return respond(200);
  }
  if(env.LINE_AI_ENABLED!=='true')return respond(200);
  const db=dbFactory();if(!db||!env.LINE_CHANNEL_ACCESS_TOKEN||!env.OPENAI_API_KEY||!env.LINE_AI_MODEL)return respond(503);
  try {
   for(const event of body.events){
    // Reply privately in one-to-one chats only. Never ingest group conversations.
    if(event.source?.type!=='user'||event.type!=='message'||!event.replyToken||!event.webhookEventId)continue;
    if(typeof event.source.userId!=='string')continue;
    if(env.LINE_AI_TEST_USER_ID){
     try{await db.from('sanze_line_test_diagnostics').upsert({event_id:event.webhookEventId,user_id:event.source.userId,reason:event.source.userId===env.LINE_AI_TEST_USER_ID?'allowed':'test_account_mismatch'},{onConflict:'event_id'});}catch{}
     if(event.source.userId!==env.LINE_AI_TEST_USER_ID)continue;
    }
    if(!Number.isFinite(event.timestamp)||Math.abs(Date.now()-event.timestamp)>55000)continue;
    const userKey=createHmac('sha256',env.LINE_CHANNEL_SECRET).update(event.source.userId).digest('hex');
    const text=event.message?.type==='text'?String(event.message.text||'').slice(0,2000):null;
    const hold=Boolean(text&&/^(?:保持真人|維持真人|取消自動回覆)[。！!\s]*$/.test(text.trim()));
    const resume=Boolean(text&&wantsAI(text));
    if(resume||hold){const {error:cancelError}=await db.rpc('sanze_line_timeout_cancel',{p_user:userKey,p_hold:hold});if(cancelError)throw Error('storage');}
    const {data:claim,error}=await db.rpc(resume?'sanze_line_resume_claim':'sanze_line_claim',{p_event:event.webhookEventId,p_user:userKey});
    if(error)throw new Error('storage');
    if(claim.status==='busy')return respond(503);
    if(claim.status==='limited_notice'){
     try{await fetchImpl('https://api.line.me/v2/bot/message/reply',{method:'POST',headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({replyToken:event.replyToken,messages:[{type:'text',text:'目前 AI 助理暫時無法繼續回覆，您可以留下問題，或來電 02-2250-8202 與三策聯絡。'}]}),signal:AbortSignal.timeout(8000)});}catch{}
     continue;
    }
    if(claim.status!=='claimed'){if(claim.status==='paused'&&!hold&&!resume&&env.LINE_TIMEOUT_ENABLED==='true'){const {error:queueError}=await db.rpc('sanze_line_timeout_schedule',{p_user:userKey,p_recipient:sealRecipient(event.source.userId,env.LINE_CHANNEL_SECRET)});if(queueError)throw Error('storage');}if(hold&&claim.status==='paused'){await fetchImpl('https://api.line.me/v2/bot/message/reply',{method:'POST',headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({replyToken:event.replyToken,messages:[{type:'text',text:'已保持真人回覆，不會自動切回 AI。需要時輸入「恢復AI」即可。'}]}),signal:AbortSignal.timeout(8000)});}continue;}
    if(event.message?.markAsReadToken){
     try{await fetchImpl('https://api.line.me/v2/bot/chat/markAsRead',{method:'POST',headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({markAsReadToken:event.message.markAsReadToken}),signal:AbortSignal.timeout(3000)});}catch{}
    }
    const history=Array.isArray(claim.history)?claim.history:[];
    let answer,paused=false,status='sent';
    try{
     if(hold){answer='已保持真人回覆，不會自動切回 AI。需要時輸入「恢復AI」即可。';paused=true;}
     else if(resume){answer='已恢復 AI 助理回覆。您可以接著說明問題，我會協助您了解。';}
     else if(text&&wantsHuman(text)){answer=manual;paused=true;}
     else if(event.message?.type==='sticker'){answer='收到，謝謝您。若有想詢問的事情，直接打字告訴我就可以。';}
     else if(!text){answer='這份內容需要三策人員查看，我已將這個聊天室切為真人回覆。您可以補充想了解的問題；輸入「恢復AI」可繼續文字諮詢。';paused=true;}
     else{answer=(await generate({text,history,first:history.length===0,apiKey:env.OPENAI_API_KEY,model:env.LINE_AI_MODEL,fetchImpl})).text;}
    }catch{answer='目前由三策人員接續回覆，請留下您的問題。';paused=true;status='failed';}
    // Persist handoff before attempting delivery. An ambiguous reply failure is not retried.
    const next=text?[...history,{role:'user',content:text},{role:'assistant',content:answer}].slice(-10):history;
    if(paused){const {error:e}=await db.from('sanze_line_sessions').update({paused:true}).eq('user_key',userKey);if(e)throw new Error('handoff');}
    let delivered=false;
    try{const r=await fetchImpl('https://api.line.me/v2/bot/message/reply',{method:'POST',headers:{Authorization:`Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({replyToken:event.replyToken,messages:[{type:'text',text:answer}]}),signal:AbortSignal.timeout(8000)});delivered=r.ok;}catch{}
    const {error:finishError}=await db.rpc('sanze_line_finish',{p_event:event.webhookEventId,p_user:userKey,p_history:next,p_paused:paused||!delivered,p_status:delivered?status:'failed'});
    if(finishError)throw new Error('storage');
   }
   return respond(200);
  }catch{console.error('LINE assistant processing unavailable');return respond(503);}
 };
}
export default makeLineHandler();
