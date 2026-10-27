import {createHmac,createHash,randomUUID as cryptoRandomUUID,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {reports,readerReport} from './_report-records.js';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createSupabaseAdminClient} from './_supabaseAdmin.js';
import {trafficMetadata} from './_traffic-metadata.js';
const COOKIE='sanze_report_session', AGE=1800;
const digest=s=>createHash('sha256').update(s).digest();
const equal=(a,b)=>timingSafeEqual(digest(a),digest(b));
export function makeReportsHandler({env=process.env,now=()=>Date.now(),dbFactory=createSupabaseAdminClient}={}) {
 const rates=new Map();
 return async (req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options','nosniff');
  const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(405,{error:'不支援的操作。'});}
  let access={};try{access={...JSON.parse(env.REPORT_ADDITIONAL_ACCESS_HASHES||'{}'),...JSON.parse(env.REPORT_ACCESS_HASHES||'{}')};}catch{}
  if(!env.REPORT_SESSION_SECRET||env.REPORT_SESSION_SECRET.length<32)return send(503,{error:'報告專區尚未開放，請聯絡三策。'});
  const sign=value=>createHmac('sha256',env.REPORT_SESSION_SECRET).update(value).digest('base64url');
  const cookie=value=>res.setHeader('Set-Cookie',`${COOKIE}=${value}; Path=/api/reports; HttpOnly; SameSite=Strict; ${env.NODE_ENV==='production'?'Secure; ':''}Max-Age=${value?AGE:0}`);
  let session=null;
  try{
   const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
   const [payload,signature]=raw.split('.');
   if(payload&&signature&&equal(signature,sign(payload))){const p=JSON.parse(Buffer.from(payload,'base64url'));if(p.exp>now()&&p.exp<=now()+AGE*1000&&access[p.id]&&p.rev===sign(access[p.id]))session=p;}
  }catch{}
  if(req.method==='GET'){
   if(!session||!reports[session.id])return send(401,{error:'請輸入案件編號及密碼。'});
   const url=new URL(req.url||'/api/reports','https://www.sanzepm.com.tw');
   if(url.searchParams.get('asset')){
    const name=url.searchParams.get('asset');
    const allowed=new Set(['permit-status-2026-10-16.png','progress-2026-10-16.png','street-2020-screen.png','street-2025-screen.png','street-2020.jpg','street-2025.jpg','permit.pdf','mortgage.pdf','ownership.pdf','mortgage-1.png','ownership-1.png',...Array.from({length:6},(_,i)=>`permit-${i+1}.png`)]);
    const permitted = session.id==='SZ202613' ? allowed : new Set(reports[session.id].assets || []);
    if(!permitted.has(name))return send(404,{error:'找不到文件。'});
    try{
     const bytes=await readFile(join(process.cwd(),'private/reports',session.id,name));
     res.setHeader('Content-Type',name.endsWith('.pdf')?'application/pdf':name.endsWith('.jpg')?'image/jpeg':name.endsWith('.woff2')?'font/woff2':'image/png');
     res.setHeader('Content-Disposition',`inline; filename="${name}"`);
     res.statusCode=200;return res.end(bytes);
    }catch{return send(404,{error:'找不到文件。'});}
   }
   return send(200,{report:readerReport(reports[session.id]),expiresAt:session.exp});
  }
  const origins=new Set(['https://www.sanzepm.com.tw','https://sanzepm.com.tw',env.REPORT_PREVIEW_ORIGIN].filter(Boolean));
  if(env.NODE_ENV!=='production'){origins.add('http://localhost:4173');origins.add('http://127.0.0.1:4173');}
  if(!origins.has(req.headers.origin))return send(403,{error:'請從三策報告專區操作。'});
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return send(415,{error:'資料格式不正確。'});
  let body;try{let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>4096)throw Error();}body=JSON.parse(data);}catch{return send(400,{error:'資料格式不正確。'});}
  if(body?.action==='logout'){cookie('');return send(200,{ok:true});}
  if(body?.action==='read'){
   if(!session||!reports[session.id])return send(401,{error:'請重新登入。'});
   if(body.exclude===true||/sanze_traffic_excluded=1(?:;|$)/.test(req.headers.cookie||'')||/bot|crawl|spider|headless|preview/i.test(String(req.headers['user-agent']||'')))return send(200,{ok:true,ignored:true});
   if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.eventId||''))return send(400,{error:'閱讀紀錄格式不正確。'});
   let visitor='';
   const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('sanze_report_visitor='))?.slice(21)||'';
   const [id,sig]=raw.split('.');
   if(/^[a-f0-9-]{36}$/.test(id||'')&&sig&&equal(sig,sign('visitor:'+id)))visitor=id;
   if(!visitor){visitor=cryptoRandomUUID();res.setHeader('Set-Cookie',`sanze_report_visitor=${visitor}.${sign('visitor:'+visitor)}; Path=/api/reports; HttpOnly; SameSite=Strict; ${env.NODE_ENV==='production'?'Secure; ':''}Max-Age=31536000`);}
   try{const db=dbFactory();if(!db)throw Error();const {error}=await db.from('sanze_report_reads').upsert({event_id:body.eventId,report_id:session.id,visitor_id:visitor,device_type:trafficMetadata(req.headers).device_type},{onConflict:'event_id',ignoreDuplicates:true});if(error)throw Error();return send(200,{ok:true});}catch{return send(503,{error:'暫時無法記錄閱讀次數。'});}
  }
  const ip=String(req.headers['x-real-ip']||req.socket?.remoteAddress||'unknown');
  const key=digest(ip).toString('hex'),time=now();
  for(const [k,v] of rates)if(time-v.start>=900000)rates.delete(k);
  const rate=rates.get(key)||{start:time,count:0};
  if(rate.count>=5||(!rates.has(key)&&rates.size>=5000)){res.setHeader('Retry-After','900');return send(429,{error:'嘗試次數較多，請15分鐘後再試。'});}
  const persistentKey=sign('login-ip:'+ip);
  if(env.NODE_ENV==='production'){
   try{const db=dbFactory();if(!db)throw Error();const {data,error}=await db.rpc('sanze_report_login_attempt',{p_key:persistentKey});if(error)throw Error();if(data!==true){res.setHeader('Retry-After','900');return send(429,{error:'嘗試次數較多，請15分鐘後再試。'});}}catch{return send(503,{error:'登入驗證暫時無法使用，請稍後再試。'});}
  }
  rate.count++;rates.set(key,rate);
  const id=typeof body?.reportId==='string'?body.reportId.trim().toUpperCase():'';
  const password=typeof body?.password==='string'?body.password:'';
  let valid=false;try{const [salt,hash]=(access[id]||'').split(':');if(/^[a-f0-9]{32}$/.test(salt)&&/^[a-f0-9]{128}$/.test(hash)&&password.length<=256)valid=equal(scryptSync(password,salt,64).toString('hex'),hash);}catch{}
  if(!valid||!reports[id])return send(401,{error:'案件編號或密碼不正確。'});
  rates.delete(key);
  if(env.NODE_ENV==='production'){try{await dbFactory().from('sanze_report_login_limits').delete().eq('key',persistentKey);}catch{}}
  const payload=Buffer.from(JSON.stringify({id,exp:time+AGE*1000,nonce:randomBytes(16).toString('hex'),rev:sign(access[id])})).toString('base64url');
  cookie(`${payload}.${sign(payload)}`);
  return send(200,{ok:true});
 };
}
export default makeReportsHandler();
