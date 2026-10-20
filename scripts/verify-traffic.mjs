import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {makeTrafficHandler} from '../api/_site-traffic.js';
import {basePagePaths} from '../shared/site-routes.js';
import {knowledgePages} from '../shared/knowledge-pages.js';
import {trafficMetadata} from '../api/_traffic-metadata.js';
let inserts=0,rpcs=0,lastInsert;const hash=createHash('sha256').update('test-private-key').digest('hex');
const handler=makeTrafficHandler({env:{SITE_TRAFFIC_KEY_HASH:hash},dbFactory:()=>({rpc:async()=>{rpcs++;return {data:{snapshotVersion:2,todayViews:2,todayVisitors:1,pages:[{path:"/insights",views:1},{path:"/insights/renewal-distribution",views:1}],aiPages:[{path:"/insights/renewal-distribution",questions:3}],weekAiQuestions:3}};},from:()=>({upsert:async(row)=>{lastInsert=row;inserts++;return {error:null};}})})});
async function call(method,headers={},body){const res={setHeader(){},end(v){this.body=JSON.parse(v);}};await handler({method,headers,body},res);return res;}
assert.equal((await call('GET')).statusCode,401);assert.equal(rpcs,0);
assert.equal((await call('GET',{authorization:'Bearer wrong'})).statusCode,401);
assert.equal((await call('GET',{authorization:'Bearer test-private-key'})).body.todayVisitors,1);
const summary=(await call('GET',{authorization:'Bearer test-private-key'})).body;
assert.deepEqual(summary.pages,[{path:'/insights',views:2}]);
assert.deepEqual(summary.aiPages,[{path:'/insights/renewal-distribution',questions:3}]);
assert.equal(summary.weekAiQuestions,3);
const arrivals={total:2,limit:500,rows:[{visitorNumber:2,firstSeen:'2026-10-15T03:21:00Z',lastSeen:'2026-10-15T03:25:00Z',views:2}]};
for(const unavailable of [false,true]){
 const api=makeTrafficHandler({env:{SITE_TRAFFIC_KEY_HASH:hash},dbFactory:()=>({rpc:async(name)=>{assert.equal(name,'sanze_traffic_snapshot');return unavailable?{error:{message:'unavailable'}}:{data:{snapshotVersion:2,pages:[],todayVisitors:2,aiPages:[],visitorArrivals:arrivals}};}})});
 const response={setHeader(){},end(v){this.body=JSON.parse(v);}};
 await api({method:'GET',headers:{authorization:'Bearer test-private-key'}},response);
 assert.equal(response.statusCode,unavailable?503:200);if(!unavailable)assert.deepEqual(response.body.visitorArrivals,arrivals);
}
const headers={origin:'https://www.sanzepm.com.tw','content-type':'application/json','user-agent':'Safari'};
const event={eventId:randomUUID(),visitorId:randomUUID(),path:'/'};
assert.equal((await call('POST',{},event)).statusCode,403);
assert.equal((await call('POST',headers,{...event,path:'/traffic'})).statusCode,400);
assert.equal((await call('POST',{...headers,'user-agent':'Googlebot'},event)).body.ignored,true);
assert.equal((await call('POST',{...headers,cookie:'sanze_traffic_excluded=1'},event)).body.ignored,true);assert.equal(inserts,0);assert.equal((await call('POST',headers,event)).statusCode,200);assert.equal(inserts,1);
assert.equal(lastInsert.geo_region,'unknown');assert.equal(lastInsert.device_type,'unknown');
assert.equal((await call('POST',{...headers,'x-vercel-ip-country':'TW','x-vercel-ip-country-region':'KHH','user-agent':'Mozilla/5.0 (iPhone) Mobile Safari'}, {...event,visitorId:randomUUID(),geo_region:'north',device_type:'desktop',ip:'1.2.3.4'})).statusCode,200);
assert.equal(lastInsert.geo_region,'south');assert.equal(lastInsert.device_type,'mobile');assert(!('ip' in lastInsert));
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-country-region':'TPE'}).geo_region,'north');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-country-region':'TXG'}).geo_region,'central');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-country-region':'HUA'}).geo_region,'east');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-country-region':'KIN'}).geo_region,'islands');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-city':'New%20Taipei'}).geo_region,'north');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-city':'%E9%AB%98%E9%9B%84%E5%B8%82'}).geo_region,'south');
assert.equal(trafficMetadata({'x-vercel-ip-country':'US','x-vercel-ip-city':'Taipei'}).geo_region,'overseas');
assert.equal(trafficMetadata({'x-vercel-ip-country':'TW','x-vercel-ip-city':'%invalid'}).geo_region,'taiwan_unknown');
assert.equal(trafficMetadata({'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}).device_type,'desktop');
assert.equal(trafficMetadata({'user-agent':'Mozilla/5.0 (Linux; Android 14) Mobile'}).device_type,'mobile');
assert.equal(trafficMetadata({'user-agent':'Mozilla/5.0 (Linux; Android 14)'}).device_type,'tablet');
assert.equal(trafficMetadata({'user-agent':'Mozilla/5.0 (iPad)'}).device_type,'tablet');
for(let i=0;i<29;i++)assert.equal((await call('POST',headers,event)).statusCode,200);
assert.equal((await call('POST',headers,event)).statusCode,429);
const down=makeTrafficHandler({env:{SITE_TRAFFIC_KEY_HASH:hash},dbFactory:()=>null});let res={setHeader(){},end(){}};await down({method:'GET',headers:{authorization:'Bearer test-private-key'}},res);assert.equal(res.statusCode,503);
for(const path of [...basePagePaths,...knowledgePages.map(p=>p.path)]){assert.equal((await call('POST',headers,{...event,visitorId:randomUUID(),path})).statusCode,200,path);assert.equal(lastInsert.path,path.startsWith('/insights/')?'/insights':path);assert.equal(lastInsert.source_path,path);}
console.log('PASS: private access, rejected paths/origins, bot filtering, rate limit, unavailable data.');
