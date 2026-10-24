import assistantPricingStatus from './_website-ai-status.js';
import {recordContactSuccess} from './_contact-tracking.js';
import reportsHandler from './_reports.js';
import siteTraffic from './_site-traffic.js';
import webAssistant from './_web-assistant.js';
import lineTimeout from './_line-timeout.js';
import lineWebhook from './_line-webhook.js';
export const config = { api: { bodyParser: false }, maxDuration: 60 };
import { createHash, createHmac } from 'node:crypto';
import { contactFields, stages, promoters } from '../shared/contact-fields.js';
const unavailable = '目前無法送出，請稍後重試，或來電 0916-711-323 與我們聯絡。';
const invalid = '請確認必填欄位、電話與電子郵件格式。';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function reply(res, status, payload) { res.statusCode = status; res.end(JSON.stringify(payload)); }
async function bodyOf(req) {
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > 16384) throw new Error('size');
    return JSON.parse(raw);
  }
  const chunks = []; let bytes = 0;
  for await (const chunk of req) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > 16384) throw new Error('size');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export function makeContactHandler({ env = process.env, fetchImpl = (...args) => fetch(...args), now = () => Date.now(), recordSuccess = recordContactSuccess } = {}) {
  // Per-instance burst protection. Platform firewall also limits POST /api/contact across instances.
  const attempts = new Map();
  return async function contact(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(res,405,{ok:false,message:'請使用諮詢表單送出資料。'}); }
    const allowed = new Set(['https://sanzepm.com.tw','https://www.sanzepm.com.tw']);
    if (env.CONTACT_PREVIEW_ORIGIN) allowed.add(env.CONTACT_PREVIEW_ORIGIN);
    if (env.NODE_ENV !== 'production') { allowed.add('http://127.0.0.1:4173'); allowed.add('http://localhost:4173'); }
    if (!allowed.has(req.headers.origin)) return reply(res,403,{ok:false,message:'請從三策網站送出諮詢。'});
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return reply(res,415,{ok:false,message:invalid});
    let body;
    try { body = await bodyOf(req); } catch { return reply(res,400,{ok:false,message:invalid}); }
    if (!body || Array.isArray(body) || typeof body !== 'object' || (typeof body.requestId !== 'string' || !uuid.test(body.requestId)) || body.consent !== true || body.website) return reply(res,400,{ok:false,message:invalid});
    const data = {};
    for (const [key,,max,required] of contactFields) {
      if (typeof body[key] !== 'string') return reply(res,400,{ok:false,message:invalid});
      data[key] = body[key].trim();
      if ((required && !data[key]) || data[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(data[key])) return reply(res,400,{ok:false,message:invalid});
    }
    if (!/^[+0-9()\s-]{6,30}$/.test(data.phone) || data.phone.replace(/\D/g,'').length < 6 || /[\r\n]/.test(data.phone) || (data.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) || !stages.includes(data.stage) || !promoters.includes(data.association)) return reply(res,400,{ok:false,message:invalid});
    if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL || !env.TURNSTILE_SECRET_KEY) return reply(res,503,{ok:false,message:unavailable});
    const time = now();
    for (const [key,value] of attempts) if (time-value.start >= 600000) attempts.delete(key);
    const ip = req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const ipKey = createHash('sha256').update(String(ip)).digest('hex');
    const rate = attempts.get(ipKey) || {start:time,count:0};
    if (rate.count >= 5 || (!attempts.has(ipKey) && attempts.size >= 5000)) { res.setHeader('Retry-After','600'); return reply(res,429,{ok:false,message:'送出次數較多，請稍候重試，或來電與我們聯絡。'}); }
    rate.count++; attempts.set(ipKey,rate);
    if (typeof body.turnstileToken !== 'string' || !body.turnstileToken || body.turnstileToken.length > 2048) return reply(res,400,{ok:false,message:'請完成安全驗證後送出。'});
    try {
      const verification=await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
        method:'POST',signal:AbortSignal.timeout(6000),headers:{'Content-Type':'application/json'},
        body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:body.turnstileToken})
      });
      const result=await verification.json();
      if(!verification.ok || result.success!==true || !['sanzepm.com.tw','www.sanzepm.com.tw'].includes(result.hostname) || result.action!=='contact') return reply(res,400,{ok:false,message:'驗證未通過，請重新驗證後送出。您填寫的內容仍保留。'});
    } catch {return reply(res,503,{ok:false,message:'驗證暫時無法完成，請稍後重試。您填寫的內容仍保留。'});}
    const reference = body.requestId;
    const text = `三策網站案件諮詢\n諮詢編號：${reference}\n\n` + contactFields.map(([key,label])=>`${label}：${data[key] || '未提供'}`).join('\n') + '\n\n聯絡人已同意將以上資料用於案件諮詢與聯絡。';
    // Stable across retries; changing any content creates a distinct provider request.
    const digest = createHmac('sha256', env.RESEND_API_KEY).update(JSON.stringify({reference,data})).digest('hex');
    try {
      const result = await fetchImpl('https://api.resend.com/emails', {
        method:'POST', signal:AbortSignal.timeout(10000),
        headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`contact/${digest}`},
        body:JSON.stringify({from:env.CONTACT_FROM_EMAIL,to:[env.CONTACT_TO_EMAIL],subject:'三策網站｜新案件諮詢',text,...(data.email?{reply_to:data.email}:{})})
      });
      const payload = await result.json();
      if (!result.ok || typeof payload.id !== 'string' || !payload.id) return reply(res,502,{ok:false,message:unavailable});
      try{await recordSuccess({tracking:body.tracking,requestId:reference,headers:req.headers});}catch{console.warn('contact_success_tracking_unavailable');}
      return reply(res,200,{ok:true,reference});
    } catch { return reply(res,502,{ok:false,message:unavailable}); }
  };
}
const contactHandler = makeContactHandler();
export default function handler(req,res) {
 const url=new URL(req.url || '/', 'https://www.sanzepm.com.tw');
 if(url.pathname==='/api/reports'||url.searchParams.get('route')==='reports'||req.query?.route==='reports')return reportsHandler(req,res);
 if(url.pathname==='/api/site-traffic'||url.searchParams.get('route')==='site-traffic'||req.query?.route==='site-traffic')return siteTraffic(req,res);
 if(url.pathname==='/api/assistant-pricing-status'||url.searchParams.get('route')==='assistant-pricing-status'||req.query?.route==='assistant-pricing-status')return assistantPricingStatus(req,res);
 if(url.pathname==='/api/website-assistant'||url.searchParams.get('route')==='website-assistant'||req.query?.route==='website-assistant')return webAssistant(req,res);
 if(url.pathname==='/api/line-timeout'||url.searchParams.get('route')==='line-timeout'||req.query?.route==='line-timeout')return lineTimeout(req,res);
 return (url.pathname === '/api/line-webhook' || url.searchParams.get('route') === 'line' || req.query?.route === 'line') ? lineWebhook(req,res) : contactHandler(req,res);
}
