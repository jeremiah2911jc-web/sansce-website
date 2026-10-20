import { landownerGuidance } from './_landowner-guidance.js';
import { createSupabaseAdminClient } from './_supabaseAdmin.js';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { taipeiTime } from './_line-ai.js';
import { assistantRules as rules } from './_assistant-rules.js';
import { retrieveProfessionalKnowledge, knowledgeInstructions, officialDomains, formatAssistantOutput } from './_assistant-knowledge.js';
const knowledge = JSON.parse(readFileSync(new URL('../docs/website-assistant/content.json', import.meta.url),'utf8'));
function sourcesFor(text,path){
 const terms = [...new Set((text.match(/[\p{Script=Han}]{2,}|[a-z0-9]+/giu)||[]).flatMap(t=>t.length>2&&/\p{Script=Han}/u.test(t)?Array.from({length:t.length-1},(_,i)=>t.slice(i,i+2)):[t.toLowerCase()]))];
 const scores=knowledge.map(p=>({...p,score:terms.reduce((n,t)=>n+(p.text.toLowerCase().includes(t)?1:0),0)+(p.path===path?3:0)})).sort((a,b)=>b.score-a.score);
 return [...new Map([knowledge.find(p=>p.path==='/consulting'),...scores.slice(0,3)].filter(Boolean).map(p=>[p.path,p])).values()];
}
export function makeWebAssistantHandler({env=process.env,fetchImpl=fetch,log=console.info,dbFactory=createSupabaseAdminClient}={}){
 return async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{message:'請使用聊天視窗提問。'});}
  const allowed=new Set(['https://www.sanzepm.com.tw','https://sanzepm.com.tw',env.CONTACT_PREVIEW_ORIGIN].filter(Boolean));
  if(!allowed.has(req.headers.origin)||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(403,{message:'請從三策網站開啟助理。'});
  let body;
  try{if(req.body!==undefined)body=typeof req.body==='string'?JSON.parse(req.body):req.body;else{const chunks=[];for await(const c of req)chunks.push(Buffer.from(c));body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}}catch{return reply(400,{message:'訊息格式不正確，請重新送出。'});}
  if(!body||typeof body.message!=='string'||!body.message.trim()||!Array.isArray(body.history)||body.history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'))return reply(400,{message:'請輸入您想詢問的內容。'});
  if(!env.OPENAI_API_KEY||!(env.WEB_AI_MODEL||env.LINE_AI_MODEL))return reply(503,{message:'助理暫時無法回覆，請稍後重試，或與三策聯絡。'});
  if(body.conversationId!==undefined&&!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.conversationId))return reply(400,{message:'對話編號不正確，請重新整理後重試。'});
  if(body.visitorId!=null&&!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitorId))return reply(400,{message:'訪客編號不正確，請重新整理後重試。'});
  if(body.excludeFromTraffic!==undefined&&typeof body.excludeFromTraffic!=='boolean')return reply(400,{message:'訊息格式不正確，請重新送出。'});
  const id=randomUUID(),model=env.WEB_AI_MODEL||env.LINE_AI_MODEL;
  let db=null;
  if(env.WEBSITE_CHAT_RECORDING==='true'){
   try{db=dbFactory();if(!db)throw Error('not_configured');const {error}=await db.from('sanze_website_conversations').insert({request_id:id,conversation_id:body.conversationId||id,page_path:typeof body.path==='string'?body.path.slice(0,2048):'/',question:body.message.trim(),model,status:'pending',visitor_id:body.visitorId||null,is_internal:body.excludeFromTraffic===true||String(req.headers.cookie||'').split(';').some(part=>part.trim()==='sanze_traffic_excluded=1')||/bot|crawl|spider|headless|preview/i.test(String(req.headers['user-agent']||''))});if(error)throw Error('storage');}
   catch{log(JSON.stringify({event:'website_ai_recording',request_id:id,status:'failed'}));return reply(503,{message:'助理暫時無法回覆，請稍後重試。'});}
  }
  const professional=retrieveProfessionalKnowledge(body.message,body.history);
  const sources=professional.cards.length && !/575|580|三箭|專案|TOD/i.test(body.message)
   ? knowledge.filter(p=>p.path==='/consulting') : sourcesFor(body.message,body.path);
  const input=[...body.history.map(m=>({role:m.role,content:m.content})),{role:'user',content:body.message}];
  try{
   const searchOptions=professional.context.professional?{tools:[{type:'web_search',filters:{allowed_domains:officialDomains},user_location:{type:'approximate',country:'TW',timezone:'Asia/Taipei'}}],tool_choice:professional.needsSearch?'required':'auto'}:{};
   const response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model,instructions:rules+landownerGuidance(body.message,body.history,typeof body.path==='string'?body.path:'')+'\n台灣現在時間：'+taipeiTime()+knowledgeInstructions(professional)+'\n以下為公司網站資料：\n'+sources.map(p=>`${p.url}\n${p.text}\n相關連結：${p.links.join('\n')}`).join('\n\n'),input,store:false,...searchOptions,metadata:{channel:'sanze_website',request_id:id,knowledge_version:professional.version}}),signal:AbortSignal.timeout(50000)});
   if(!response.ok)throw new Error('provider_'+response.status);
   const data=await response.json();const answer=formatAssistantOutput(data);
   if(!answer)throw new Error('empty');
   if(db){const {error}=await db.from('sanze_website_conversations').update({answer,answered_at:new Date().toISOString(),usage:data.usage||null,status:'ok'}).eq('request_id',id);if(error)throw Error('storage');}
   log(JSON.stringify({event:'website_ai_usage',request_id:id,model,usage:data.usage||null,status:'ok',knowledge_version:professional.version,knowledge_cards:professional.cards.map(c=>c.id),web_search_calls:(data.output||[]).filter(o=>o.type==='web_search_call').length}));
   return reply(200,{answer});
  }catch(error){if(db){try{await db.from('sanze_website_conversations').update({status:'failed'}).eq('request_id',id);}catch{}}log(JSON.stringify({event:'website_ai_usage',request_id:id,model,status:'failed',reason:error.name==='TimeoutError'?'timeout':/^provider_\d+$/.test(error.message)?error.message:'unavailable'}));return reply(503,{message:'助理暫時無法回覆，請稍後重試，或來電02-2250-8202與三策聯絡。'});}
 };
}
export default makeWebAssistantHandler();
