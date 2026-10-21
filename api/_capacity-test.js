// Temporary, signed production capacity run. Removed after verification.
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {createSupabaseAdminClient} from './_supabaseAdmin.js';
export const capacityRun='sanze-20261021-d76fbfa8-872e-481f-aace-e42ea813d79a';
const expiresAt=Date.parse('2026-10-21T12:00:00Z');
export function makeCapacityTestHandler(factory){
 const key=process.env.SANZE_CAPACITY_KEY||'';
 const signature=createHmac('sha256',key).update(capacityRun).digest('hex');
 const tables={sanze_site_pageviews:'capacity_20261021_pageviews'};
 const rpcs={sanze_record_land_presence:'capacity_20261021_presence',sanze_record_visible_duration:'capacity_20261021_duration',sanze_record_visitor_action:'capacity_20261021_action',sanze_land_online:'capacity_20261021_online',sanze_traffic_snapshot:'sanze_traffic_snapshot'};
 const handler=factory({env:{...process.env,SITE_TRAFFIC_KEY_HASH:createHash('sha256').update(signature).digest('hex')},dbFactory:()=>{const db=createSupabaseAdminClient();if(!db)return null;return {from(name){if(!tables[name])throw Error('test_table');return db.from(tables[name]);},rpc(name,args){if(!rpcs[name])throw Error('test_rpc');return db.rpc(rpcs[name],args);}};}});
 return (req,res)=>{const supplied=String(req.headers['x-sanze-capacity-run']||'');if(!key||Date.now()>expiresAt||supplied.length!==signature.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(signature))){res.statusCode=403;res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify({ok:false}));}res.setHeader('X-Sanze-Capacity-Run',capacityRun);return handler(req,res);};
}
