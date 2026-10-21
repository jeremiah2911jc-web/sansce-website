import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateReadjustmentArea,calculateExpropriationArea,calculateConsent,calculatePeriod,newReadjustmentPlan,evaluateReadjustment,publishedPlans,getPublishedPlan,documentItems} from '../src/land-evaluation/generated/readjustment.mjs';

// Independent quantity oracles, checked without the private App checkout.
const row={area:'1000',numerator:'1',denominator:'2',locationMode:'same',appreciation:'1',generalCoefficient:'0.1',expenseCoefficient:'0.2',frontWidth:'10',frontScale:'2',sideLength:'20',sideScale:'1',cornerPercent:'50'};
test('重劃一般、正街、側面與費用負擔分列，再換算持分',()=>{
 const r=calculateReadjustmentArea(row);assert.deepEqual(r.errors,[]);assert.equal(r.parcelArea,696);assert.equal(r.area,348);
 assert(calculateReadjustmentArea({...row,numerator:'3',denominator:'2'}).errors.length);
 assert(calculateReadjustmentArea({...row,expenseCoefficient:'1'}).errors.length);
});
const ex={totalArea:'10000',ratio:'50',farmArea:'2000',extraRatio:'5',blocks:[{id:'a',area:'3000',priceRatio:'1'},{id:'b',area:'3000',priceRatio:'2'}],compensationShare:'1',farmTotalCompensationShare:'20',farmCompensationShare:'2',selectedPriceRatio:'1.5',usedRightPercent:'0'};
test('抵價地按權利比例、街廓價格及已分配部分核算，不以個人面積乘41%',()=>{
 assert.equal(calculateExpropriationArea(ex).area,52);assert.equal(calculateExpropriationArea({...ex,usedRightPercent:'25'}).area,39);
 assert.equal(calculateExpropriationArea({...ex,usedRightPercent:'100'}).area,0);
 assert(calculateExpropriationArea({...ex,ratio:'39'}).errors.length);
 assert(calculateExpropriationArea({...ex,ratio:'40',extraRatio:'4'}).errors.length);
});
const person=(id,area,consent='agree')=>({ownerId:id,area:String(area),ownership:'private',eligibility:'include',consent,source:'記憶體模擬名冊'});
test('自辦同意人數達半數、面積須超過半數，籌備會30%為嚴格超過',()=>{
 assert.equal(calculateConsent({procedure:'implementation',rows:[person('a',50),person('b',50,'disagree')]}).passes,false);
 assert.equal(calculateConsent({procedure:'implementation',rows:[person('a',51),person('b',49,'disagree')]}).passes,true);
 const ten=Array.from({length:10},(_,i)=>person(String(i),10,i<3?'agree':'disagree'));
 assert.equal(calculateConsent({procedure:'formation',rows:ten}).passes,false);
 ten[3].consent='agree';assert.equal(calculateConsent({procedure:'formation',rows:ten}).passes,true);
});
test('期間計算保留日曆與適用門檻，無效日期不回傳截止日',()=>{
 const p={eventDate:'2026-10-21',referenceDate:'2026-10-21',count:'10',unit:'days',firstDay:'exclude',holidayRule:'admin48',holidays:[],workdays:[]};
 const r=calculatePeriod(p);assert.equal(r.nominalEnd,'2026-10-31');assert.equal(r.endDate,'2026-11-02');assert.equal(r.canConfirm,false);
 assert(calculatePeriod({...p,eventDate:'2026-02-30'}).errors.length);
});
const base=(system,track)=>({...newReadjustmentPlan('public-ci',system),track,planName:'記憶體模擬計畫',stage:'allocation',manualArea:'1000',manualSource:'模擬範圍',shareNumerator:'1',shareDenominator:'2',scopeSource:'模擬持分',membership:'in',membershipSource:'模擬書圖',membershipDate:'2026-10-21',allocationMode:'document',area:'300',areaSource:'模擬分配表',areaDate:'2026-10-21',areaStatus:'documented',buildability:'conditional'});
test('三制度雙主線的缺件、未來文件與取得權利障礙均阻止確認',()=>{
 for(const system of ['public','private','expropriation'])for(const track of ['owner','acquisition']){
  const p=base(system,track),r=evaluateReadjustment(p,{parcels:[]});assert.equal(r.rightsArea,500);assert.equal(r.canConfirm,false);assert.equal(r.canCreateLand,false);
  assert(evaluateReadjustment({...p,areaDate:'2099-01-01'},{parcels:[]}).errors.length);
  if(track==='acquisition')assert.equal(evaluateReadjustment({...p,target:'land',rightState:'terminated'},{parcels:[]}).allocationArea,null);
 }
});
test('文件已齊的地主分回可建立草稿，任一必要來源撤回即失效',()=>{
 const p=base('public','owner');p.evidence=Object.fromEntries(documentItems('public','owner').map(d=>[d.id,{state:'reviewed',source:'模擬本案原件',date:'2026-10-21'}]));
 assert.equal(evaluateReadjustment(p,{parcels:[]}).canCreateLand,true);
 p.membership='unknown';assert.equal(evaluateReadjustment(p,{parcels:[]}).canCreateLand,false);
});
test('近期七案與歷史版本並存，未完成原件覆核不能因發布改為已確認',()=>{
 const current=publishedPlans.filter(p=>p.assessmentReview.scope==='active');assert.equal(current.length,7);
 for(const p of current){assert.equal(p.assessmentReview.latestVerified,false);assert(p.versions[0].documentAudit.gaps.length);assert(getPublishedPlan(p.id,'review-20261021'));}
 assert(getPublishedPlan('ntpc-shisizhang-b','1140221-supplement'));
});
test('公開依賴不帶入案件儲存、金額或財務模組',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../src/land-evaluation/generated/source-manifest.json',import.meta.url)));
 assert(manifest.sources.every(s=>!/land-finance|workflow\/store|casePackage/.test(s.path)));
 const ra=readFileSync(new URL('../src/land-evaluation/generated/readjustment.mjs',import.meta.url),'utf8');
 assert(!/localStorage|sessionStorage|indexedDB|@tauri|calculateInvestment|calculateDistrictCoefficients/.test(ra));
});
