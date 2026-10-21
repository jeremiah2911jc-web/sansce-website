import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
process.env.NODE_ENV='production';
const root=resolve(import.meta.dirname,'..'),app='/Users/jeremiah/src/sanze-cases-desktop',qa=resolve(root,'qa/audit-corrections');
await mkdir(qa,{recursive:true});
const {build}=createRequire(resolve(app,'package.json'))('esbuild');
const contents=`
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BonusAssessmentPanel as WebsitePanel} from '${root}/src/land-evaluation/generated/panels.mjs';
import {BonusAssessmentPanel as AppBonusPanel} from '${app}/src/components/efficiency/BonusAssessmentPanel.tsx';
import {TdrApplicationPanel as AppPanel} from '${app}/src/components/efficiency/TdrApplicationPanel.tsx';
import {newTdrApplication,newTdrSender,reviewTdrApplication,renderTdrApplication} from '${app}/src/lib/planning/tdrApplication.ts';
import {newBonusAssessment} from '${app}/src/lib/planning/bonusAssessment.ts';
import {reviewSiteRoad,newSiteRoadConditions} from '${app}/src/lib/site/siteRoadConditions.ts';
import {reviewPermittedAward} from '${app}/src/lib/planning/permittedAward.ts';
import {exampleInput,evaluate} from '${root}/src/land-evaluation/model.mjs';
export {reviewSiteRoad,newSiteRoadConditions,reviewPermittedAward,evaluate,exampleInput};
export function renderFixture(city,method){
 const input=exampleInput();input.parkingDesign.district=city==='taipei'?'臺北市':'新北市';
 const a=newBonusAssessment(false,'2026-10-21'),t=newTdrApplication(city);
 Object.assign(t,{method,cashPercent:'50',valuationUnitPrice:'12345',appraisalFee:'5000',otherFee:'600',paidAmount:'1000',cashSqm:'100'});
 t.senderParcels=[{...newTdrSender(),parcel:'模擬段001',area:'100',unitValue:'1000',purchaseCost:'900000'}];
 a.tdrApplication=t;input.regulatoryReview.bonusAssessment=a;
 const r=reviewTdrApplication(t,{site:2400,far:280,district:input.parkingDesign.district},20,30);
 return {appBonus:renderToStaticMarkup(React.createElement(AppBonusPanel,{input,edit:()=>{}})),web:renderToStaticMarkup(React.createElement(WebsitePanel,{input,edit:()=>{},financials:false})),app:renderToStaticMarkup(React.createElement(AppPanel,{assessment:a,district:input.parkingDesign.district,review:r,change:()=>{}})),details:renderTdrApplication(t,r,false)};
}`;
await build({stdin:{contents,resolveDir:root,loader:'tsx'},outfile:resolve(qa,'render-fixtures.mjs'),bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',plugins:[{name:'public-imports',setup(b){b.onResolve({filter:/^\/src\//},args=>({path:resolve(root,args.path.slice(1))}));}}]});
const fixture=await import(pathToFileURL(resolve(qa,'render-fixtures.mjs')).href+'?'+Date.now());
const finance=['每容積㎡代金估價元','估價及協檢費元','其他申請規費元','已繳／預繳代金元','取得成本元（整筆申請持分總價）','捐贈都更基金計算量','捐贈都更基金第二計算量'];
const checks=[];
for(const city of ['ntpc','taipei'])for(const method of ['land','cash','mixed']){
 const r=fixture.renderFixture(city,method);
 for(const name of finance)assert(!r.web.includes('aria-label="'+name+'"'),city+'/'+method+' leaked '+name);
 assert(!r.details.includes('取得成本合計'));assert(!r.details.includes('估價及其他規費'));
 assert(r.web.includes('資格待查證')||r.web.includes('目標假設'));
 if(city==='ntpc')assert(r.appBonus.includes('捐贈都更基金計算量'));
 if(method!=='cash')assert(r.app.includes('取得成本元（整筆申請持分總價）'));
 if(method!=='land')assert(r.app.includes('每容積㎡代金估價元'));
 await writeFile(resolve(qa,city+'-'+method+'.html'),r.web);
 checks.push(city+'/'+method+' public and App financial boundary');
}
for(const [input,expected] of [
 ['資格未知，依目標假設繼續；非核准、非已取得容積','待查證'],
 ['面積預算通過，實際排位及連續通路待圖說確認。','待圖說核對'],
 ['（資格待核）','資格待核'],
 ['附條件試算，個案審議及設備尚未確認。','待核對'],
 ['本表採獎勵細項加總；直接依原容積建築的替代路徑尚未接入，含鄰地或部分合格基地時暫不放寬一般30%核心上限。','尚未支援'],
 ])assert(publicText(input).includes(expected));
checks.push('verification status preserved in natural copy');
const road={...fixture.newSiteRoadConditions(),plannedWidth:'12',source:'模擬道路證明',checkedAt:'2099-01-01',status:'confirmed'};
assert(fixture.reviewSiteRoad(road).errors.length);
assert(fixture.reviewSiteRoad({...road,checkedAt:'2026-10-21'},'2026-10-20').errors.length);
assert(fixture.reviewPermittedAward({route:'renewal',baseSqm:'1000',awardSqm:'100',approvedAt:'2099-01-01',source:'模擬核准文件'},'renewal',1000).errors.length);
assert(fixture.reviewPermittedAward({route:'renewal',baseSqm:'1000',awardSqm:'100',approvedAt:'2026-02-30',source:'模擬核准文件'},'renewal',1000).errors.length);
checks.push('road and existing award dates');
const jsx=await readFile(resolve(root,'src/land-evaluation/ReadjustmentWorkbench.jsx'),'utf8');
assert(jsx.includes('confirmed:result.canConfirm'));assert(jsx.includes('!item.history.at(-1)?.confirmed'));assert(jsx.includes('latest.signature!==signature'));assert(jsx.includes('保留待核紀錄'));
const land=await readFile(resolve(root,'src/land-evaluation/LandWorkbench.jsx'),'utf8');assert(land.includes("newLandFact('unknown')"));assert(land.includes("status:'assumed'"));
checks.push('pending records, confirmed snapshots, stale sources and unknown land drafts');
const site=await readFile(resolve(root,'src/land-evaluation/LandEvaluation.jsx'),'utf8');assert(site.includes('financials={false}'));
await writeFile(resolve(qa,'verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));
console.log('PASS audit corrections: '+checks.length+' groups, six rendered city/method paths, App finance retained, dates, copy and snapshot boundaries.');
