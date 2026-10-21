import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as web from '../src/land-evaluation/generated/readjustment.mjs';
const root=resolve(import.meta.dirname,'..'),app='/Users/jeremiah/src/sanze-cases-desktop';
const shared=await import(pathToFileURL(resolve(app,'src/cases/land-readjustment/model.mjs')));
const row={id:'r1',name:'臺北官方示範',area:'1497.46',numerator:'1',denominator:'1',locationMode:'same',appreciation:'2',frontWidth:'30.66',frontScale:'1',sideLength:'12.55',sideScale:'0.5',cornerPercent:'0'};
const expro={totalArea:'10000',ratio:'50',farmArea:'2000',extraRatio:'5',blocks:[{id:'a',area:'3000',priceRatio:'1'},{id:'b',area:'3000',priceRatio:'2'}],compensationShare:'1',farmTotalCompensationShare:'20',farmCompensationShare:'2',selectedPriceRatio:'1.5',usedRightPercent:'0'};
const proof={state:'reviewed',source:'模擬驗收來源；非核定個案',date:'2026-10-21'};
const land={parcels:[]};let cases=0;
function evaluate(p){const r=web.evaluateReadjustment(p,land);assert.deepEqual(r,shared.evaluateReadjustment(p,land));cases++;return r;}
for(const system of ['public','private','expropriation'])for(const track of ['owner','acquisition']){
 const p={...web.newReadjustmentPlan(system+'-'+track,system),track,stage:'allocation',planName:'模擬驗收計畫',manualArea:system==='expropriation'?'1000':'1497.46',manualSource:'模擬範圍',shareNumerator:'1',shareDenominator:'1',scopeSource:'模擬權利',membership:'in',membershipSource:'模擬範圍',membershipDate:'2026-10-21',buildability:'conditional',target:'award',tradeDate:'2026-10-22',rightState:'exists',transfer:'reviewed',handled:'已領及承接範圍已核對（模擬）',compensationChoice:'land',applicationState:'approved',evidence:Object.fromEntries(web.documentItems(system,track).map(d=>[d.id,{...proof}])),allocationMode:'statutory',statutory:{...proof,specialCases:'reviewed',districtBurdenRate:'40',...(system==='expropriation'?expro:{generalCoefficient:'0.20577906',expenseCoefficient:'0.05329133',rows:[row]})}};
 let r=evaluate(p);assert.equal(r.allocationArea,system==='expropriation'?52:805.18);assert.equal(r.canConfirm,true);assert.equal(r.canCreateLand,false);
 for(const patch of [{date:'2099-01-01'},{state:'pending'},{source:''},{specialCases:'pending'}]){r=evaluate({...p,statutory:{...p.statutory,...patch}});assert.equal(r.canConfirm,false);}
 const s={...p.statutory,comparisonArea:'800',comparisonSource:'模擬分配清冊',comparisonDate:'2026-10-21'};assert.equal(evaluate({...p,statutory:s}).canConfirm,false);assert.equal(evaluate({...p,statutory:{...s,differenceState:'reviewed',differenceReason:'模擬核定調整原因'}}).canConfirm,true);
 if(system!=='expropriation'){
  assert.equal(evaluate({...p,statutory:{...p.statutory,districtBurdenRate:'46'}}).canConfirm,false);
  assert.equal(evaluate({...p,statutory:{...p.statutory,districtBurdenRate:'46',excessConsentState:'reviewed'}}).canConfirm,true);
  assert.equal(evaluate({...p,statutory:{...p.statutory,rows:[row,{...row,id:'r2'}]}}).allocationArea,null);
 }else{assert.equal(evaluate({...p,statutory:{...p.statutory,usedRightPercent:'25'}}).allocationArea,39);assert.equal(evaluate({...p,statutory:{...p.statutory,compensationShare:'0'}}).allocationArea,null);}
}
const bundle=await readFile(resolve(root,'src/land-evaluation/generated/readjustment.mjs'),'utf8');
assert(!/calculateDistrictCoefficients|calculateIndividualExpropriation|totalCompensation|appliedCompensation|usedRightValue|engineering/.test(bundle));
for(const path of ['src/land-evaluation/StatutoryFields.jsx','src/land-evaluation/ReadjustmentWorkbench.jsx'])assert(!/localStorage|sessionStorage|indexedDB|fetch\(|收購總價|年利率|單價元|總地價（元）/.test(await readFile(resolve(root,path),'utf8')));
const qa=resolve(root,'qa/statutory-core');await mkdir(qa,{recursive:true});await writeFile(resolve(qa,'verification.json'),JSON.stringify({version:web.READJUSTMENT_VERSION,formulaVersion:web.STATUTORY_VERSION,cases,systems:3,tracks:2,officialOracles:['Taipei LDA presentation page11:805.18sqm','Hsinchu FAQ:125sqm','Hualien phase17 B/C coefficients'],scope:'formulas and reviewed quantity inputs; no deployment or installed-App acceptance',checkedAt:new Date().toISOString()},null,2)+'\n');
console.log(`PASS ${cases} statutory integration checks across three systems and two tracks; source/date/scope/45%/comparison gates and App monetary boundary.`);
