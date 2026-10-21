import {trafficTopics} from '../shared/traffic-content.js';
import {validTrafficAction} from '../shared/traffic-actions.js';
import {reports} from './_report-records.js';
import {trafficPage,trafficPageGroups} from '../shared/traffic-pages.js';
import {createHash,timingSafeEqual} from 'node:crypto';
import {createSupabaseAdminClient} from './_supabaseAdmin.js';
import {knowledgePages} from '../shared/knowledge-pages.js';
import {basePagePaths} from '../shared/site-routes.js';
import {trafficMetadata} from './_traffic-metadata.js';
const paths=new Set([...basePagePaths,...knowledgePages.map(p=>p.path)]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sourceCategories=new Set(['threads_tagged','threads_referral','google','bing','yahoo','duckduckgo','baidu','facebook','instagram','line','other_campaign','other_referral','direct_unknown','internal']);
const origins=new Set(['https://www.sanzepm.com.tw','https://sanzepm.com.tw']);
function reply(res,status,body){res.statusCode=status;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));}
async function readBody(req){if(req.body&&typeof req.body==='object')return req.body;let text=typeof req.body==='string'?req.body:'';if(!text)for await(const part of req){text+=part.toString();if(Buffer.byteLength(text)>2048)throw Error('size');}if(Buffer.byteLength(text)>2048)throw Error('size');return JSON.parse(text);}
export function makeTrafficHandler({env=process.env,dbFactory=createSupabaseAdminClient,now=()=>Date.now()}={}){
 const attempts=new Map();
 return async(req,res)=>{
  if(req.method==='GET'){
   const expected=String(env.SITE_TRAFFIC_KEY_HASH||'');const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
   if(!/^[a-f0-9]{64}$/.test(expected))return reply(res,503,{message:'看板尚未啟用。'});
   const actual=createHash('sha256').update(token).digest('hex');
   if(!token||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return reply(res,401,{message:'請輸入看板存取碼。'});
   if(req.query?.view==='online'||new URL(req.url||'/', 'https://www.sanzepm.com.tw').searchParams.get('view')==='online'){
    try{const db=dbFactory();if(!db)throw Error();const {data,error}=await db.rpc('sanze_land_online');if(error||!data||!Number.isSafeInteger(data.count))throw Error();return reply(res,200,data);}catch{return reply(res,503,{message:'暫時無法取得在線人數。'});}
   }
   try{
    const db=dbFactory();if(!db)throw Error();
    const {data,error}=await db.rpc('sanze_traffic_snapshot',{p_topics:trafficTopics});
    if(error||!data||data.snapshotVersion!==2)throw Error();
    const reportReadings=data.reportReadings&&{...data.reportReadings,cases:Object.values(reports).map(r=>({reportId:r.id,title:r.editorial.title,totalVisits:0,uniqueVisitors:0,returningVisitors:0,todayVisits:0,rows:[],...data.reportReadings.cases.find(c=>c.reportId===r.id)}))};
    return reply(res,200,{...data,reportReadings,pages:trafficPageGroups(data.pages,'views')});
   }catch{return reply(res,503,{message:'本次完整資料未能取得；保留上次結果，請稍後更新。'});}
  }
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return reply(res,405,{message:'不支援此方法。'});}
  if(!origins.has(req.headers.origin))return reply(res,403,{ok:false});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return reply(res,415,{ok:false});
  if(String(req.headers.cookie||'').split(';').some(part=>part.trim()==='sanze_traffic_excluded=1'))return reply(res,200,{ok:true,ignored:true});
  if(/bot|crawl|spider|headless|preview/i.test(String(req.headers['user-agent']||'')))return reply(res,200,{ok:true,ignored:true});
  let b;try{b=await readBody(req);}catch{return reply(res,400,{ok:false});}
  if(!uuid.test(b?.eventId)||!uuid.test(b?.visitorId)||!paths.has(b?.path))return reply(res,400,{ok:false});
  if(b.trafficSource!==undefined&&!sourceCategories.has(b.trafficSource))return reply(res,400,{ok:false});
  if(b.sourceBasis!==undefined&&!['tag','referrer','internal','none'].includes(b.sourceBasis))return reply(res,400,{ok:false});
  const duration=b.type==='duration',action=b.type==='action';
  if(action&&b.action==='land_evaluation_complete'&&b.path!=='/land-evaluation')return reply(res,400,{ok:false});
  if(action&&(!uuid.test(b.pageEventId)||!validTrafficAction(b.action,b.target)))return reply(res,400,{ok:false});
  if((b.type!==undefined&&!duration&&!action)||(duration&&(!Number.isSafeInteger(b.visibleMs)||b.visibleMs<0||b.visibleMs>43200000)))return reply(res,400,{ok:false});
  const presence=duration&&b.isVisible!==undefined;
  if(presence&&(b.path!=='/land-evaluation'||typeof b.isVisible!=='boolean'||!Number.isSafeInteger(b.reportSequence)||b.reportSequence<1))return reply(res,400,{ok:false});
  const rateKey=b.visitorId+(duration?':duration':action?':action':'');
  const stamp=now();for(const [k,v]of attempts)if(stamp-v.start>60000)attempts.delete(k);
  const rate=attempts.get(rateKey)||{start:stamp,count:0};if(rate.count>=(duration||action?120:30)||(!attempts.has(rateKey)&&attempts.size>=5000))return reply(res,429,{ok:false});rate.count++;attempts.set(rateKey,rate);
  if(action){try{const db=dbFactory();if(!db)throw Error();const {data,error}=await db.rpc('sanze_record_visitor_action',{p_event_id:b.eventId,p_page_event_id:b.pageEventId,p_visitor_id:b.visitorId,p_source_path:b.path,p_action:b.action,p_target:b.target});if(error)throw Error();return reply(res,data?200:409,{ok:!!data});}catch{return reply(res,503,{ok:false});}}
  if(duration){try{const db=dbFactory();if(!db)throw Error();const {error}=await db.rpc(presence?'sanze_record_land_presence':'sanze_record_visible_duration',{p_event_id:b.eventId,p_visitor_id:b.visitorId,p_source_path:b.path,p_visible_ms:b.visibleMs,...(presence?{p_is_visible:b.isVisible,p_report_sequence:b.reportSequence}:{})});if(error)throw Error();return reply(res,200,{ok:true});}catch{return reply(res,503,{ok:false});}}
  try{const db=dbFactory();if(!db)throw Error();const {error}=await db.from('sanze_site_pageviews').upsert({event_id:b.eventId,visitor_id:b.visitorId,path:trafficPage(b.path),source_path:b.path,...(b.trafficSource!==undefined?{traffic_source:b.trafficSource}:{}),...(b.sourceBasis!==undefined?{source_basis:b.sourceBasis}:{}),...(b.durationTracking===true?{visible_ms:0}:{}),interaction_tracking:b.actionTracking===true,...trafficMetadata(req.headers)},{onConflict:'event_id',ignoreDuplicates:true});if(error)throw Error();return reply(res,200,{ok:true});}catch{return reply(res,503,{ok:false});}
 };
}
export default makeTrafficHandler();
