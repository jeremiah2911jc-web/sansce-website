import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {sourceExplanation,sourceLabel,sourceUnclear} from '../public/traffic/source-labels.js';
const dashboard=fs.readFileSync('public/traffic/dashboard.js','utf8');
const refresh=dashboard.slice(dashboard.indexOf('async function refresh()'),dashboard.indexOf('\n\nconst regionNames='));
for(const [name,message,expected] of [['TypeError','Load failed','更新失敗'],['TimeoutError','signal timed out','更新等候逾時']]){
 for(const hidden of [true,false]){const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:id==='dashboard'?hidden:false});return elements.get(id);};
 const context={token:'test',busy:false,document:{hidden:false},$:el,AbortSignal,fetch:async()=>{const e=new Error(message);e.name=name;throw e;}};
 await vm.runInNewContext(refresh+';refresh()',context);assert.match(el('status').textContent,new RegExp(expected));assert(!el('status').textContent.includes(message));assert.equal(el('status').textContent.includes('保留上次'),!hidden);assert.equal(context.busy,false);assert.equal(el('refresh').disabled,false);}
}
assert(sourceExplanation('other_campaign','tag').includes('原始名稱沒有保存'));assert(sourceUnclear('other_campaign'));
assert(sourceExplanation('other_referral','referrer').includes('沒有保存網站名稱'));assert(sourceUnclear('other_referral'));
assert(sourceExplanation('direct_unknown','none').includes('不能判定'));assert(sourceExplanation('internal','internal').includes('跨過午夜'));
assert(sourceLabel('facebook',null).includes('無法確認怎麼進站'));assert(sourceLabel('facebook','tag').includes('網址註明'));assert(sourceLabel('facebook','referrer').includes('瀏覽器回報'));
const format=vm.runInNewContext(dashboard.slice(dashboard.indexOf('function formatStay('),dashboard.indexOf('function renderVisitorArrivals()'))+';formatStay');assert.equal(format(null),'沒有顯示時間紀錄');assert.equal(format(0),'沒有顯示時間紀錄');assert.equal(format(999),'未滿1秒');
console.log('PASS dashboard wording: unknown-source evidence and colors, no guessed history, missing vs sub-second duration, Chinese network/timeout errors and honest stale-data notice.');
