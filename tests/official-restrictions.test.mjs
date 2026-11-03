import test from 'node:test';
import assert from 'node:assert/strict';
import {restrictionQueries,officialQueries} from '../src/land-evaluation/official-sources.mjs';
test('local restriction queries separate cities and include high speed rail and aviation',()=>{
 const n=restrictionQueries('新北市'),t=restrictionQueries('臺北市');
 assert.deepEqual(n.map(q=>q.id),['ntpc-limit','ntpc-metro-limit','hsr-limit','aviation-height']);
 assert.deepEqual(t.map(q=>q.id),['taipei-metro-limit','hsr-limit','aviation-height']);
 assert(t.find(q=>q.id==='aviation-height').title.includes('松山機場'));
 assert(t.find(q=>q.id==='aviation-height').note.includes('地面高程'));
 assert(t.find(q=>q.id==='hsr-limit').laws.some(q=>q.url.includes('K0030022')));
});
test('official links carry no case input and laws use authoritative domains',()=>{
 for(const city of ['新北市','臺北市','花蓮縣','?parcel=private']){
  const rows=[...officialQueries(city),...restrictionQueries(city)];
  assert.equal(new Set(rows.map(q=>q.id)).size,rows.length);
  for(const q of rows){assert.equal(new URL(q.url).protocol,'https:');assert(!q.url.includes('private'));for(const l of q.laws??[])assert.equal(new URL(l.url).hostname,'law.moj.gov.tw');}
 }
 assert(!restrictionQueries('花蓮縣').some(q=>q.id.includes('taipei')||q.id.includes('ntpc')));
});
