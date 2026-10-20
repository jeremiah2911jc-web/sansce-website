import {createSupabaseAdminClient} from './_supabaseAdmin.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function recordContactSuccess({tracking,requestId,headers,dbFactory=createSupabaseAdminClient}){
 // Called only after Turnstile and the mail provider succeed. Never accept a browser success event.
 if(headers.cookie?.split(';').some(v=>v.trim()==='sanze_traffic_excluded=1')||/bot|crawl|spider|headless|preview/i.test(String(headers['user-agent']||'')))return;
 if(!tracking||tracking.path!=='/contact'||!uuid.test(tracking.visitorId)||!uuid.test(tracking.pageEventId)||!uuid.test(requestId))return;
 const db=dbFactory();if(!db)return;
 const {data,error}=await db.rpc('sanze_record_visitor_action',{p_event_id:requestId,p_page_event_id:tracking.pageEventId,p_visitor_id:tracking.visitorId,p_source_path:'/contact',p_action:'contact_success',p_target:'accepted'}).abortSignal(AbortSignal.timeout(2000));
 if(error||data!==true)throw new Error('Contact analytics was not recorded');
}
