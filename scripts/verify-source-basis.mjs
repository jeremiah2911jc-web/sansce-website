import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '/tmp/sanze-duration-sql-test/node_modules/@electric-sql/pglite/dist/index.js';
import {sourceKey,sourceLabel,sourceUnclear} from '../public/traffic/source-labels.js';
import {trafficSource,trafficSourceBasis} from '../src/traffic-source.js';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;
create table sanze_site_pageviews(event_id uuid,visitor_id uuid,created_at timestamptz,traffic_source text,source_basis text,geo_country text default 'TW',geo_county text default 'TPE',geo_region text default 'north',geo_city text default 'Taipei',device_type text default 'mobile');
create table sanze_traffic_period(singleton boolean,started_at timestamptz);insert into sanze_traffic_period values(true,now()-interval '10 days');`);
const cases=[['google','referrer'],['google','tag'],['google',null],['facebook','referrer'],['facebook','tag'],['facebook',null],['threads_referral','referrer'],['threads_tagged','tag'],[null,null]];
for(const [source,basis] of cases){const id=randomUUID();await db.query(`insert into sanze_site_pageviews(event_id,visitor_id,created_at,traffic_source,source_basis) values($1,$2,now()-interval '2 minutes',$3,$4)`,[randomUUID(),id,source,basis]);
// A later source must not overwrite the day's first source or missing evidence.
await db.query(`insert into sanze_site_pageviews(event_id,visitor_id,created_at,traffic_source,source_basis) values($1,$2,now()-interval '1 minute','google','referrer')`,[randomUUID(),id]);}
const before=(await db.query('select jsonb_agg(to_jsonb(p) order by event_id) data from sanze_site_pageviews p')).rows[0].data;
const prior=fs.readFileSync('docs/traffic/analytics-accuracy-schema.sql','utf8');const start=prior.indexOf('CREATE OR REPLACE FUNCTION public.sanze_traffic_visitor_distributions()');await db.exec(prior.slice(start,prior.indexOf('revoke all on function public.sanze_traffic_visitor_distributions',start)));
await db.exec(fs.readFileSync('docs/traffic/source-basis-distributions-schema.sql','utf8'));
for(const period of ['today','week','total']){
 const d=(await db.query('select sanze_traffic_visitor_distributions() data')).rows[0].data;
 const rows=d.sourcePeriods[period];assert.equal(rows.reduce((s,r)=>s+r.visitors,0),9);
 for(const [source,basis]of cases)assert.equal(rows.find(r=>r.key===sourceKey(source,basis))?.visitors,1);
 assert.equal(d.devicePeriods[period].reduce((s,r)=>s+r.visitors,0),9);
}
assert.deepEqual((await db.query('select jsonb_agg(to_jsonb(p) order by event_id) data from sanze_site_pageviews p')).rows[0].data,before);
for(const source of ['google','facebook','bing','yahoo','duckduckgo','baidu','instagram','line']){
 for(const basis of ['tag','referrer',null,'none']){const label=sourceLabel(source,basis);assert.ok(!label.includes('標記或來源'));assert.ok(label.includes(basis==='tag'?'網址註明來自':basis==='referrer'?'瀏覽器回報來自':'無法確認怎麼進站'));assert.equal(sourceUnclear(sourceKey(source,basis)),!['tag','referrer'].includes(basis));}
}
for(const [url,name]of [['https://www.google.com/search?q=private','google'],['https://l.facebook.com/','facebook']]){
assert.equal(trafficSource('',url),name);assert.equal(trafficSourceBasis('',url),'referrer');
assert.equal(trafficSource('?utm_source='+name,url),name);assert.equal(trafficSourceBasis('?utm_source='+name,url),'tag');}
assert.equal((await db.query("select has_function_privilege('anon','sanze_traffic_visitor_distributions()','execute') allowed")).rows[0].allowed,false);
await db.close();console.log('PASS: first-event source and basis stay paired; 9 distinct categories across today/week/total, missing history preserved, no raw rows changed, browser/tag precedence and private RPC access.');
