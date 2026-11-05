import {confirmSyntheticBonusConditions} from './helpers/bonus-conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createInput,evaluate} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,activeBonusInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {statutoryBonusLimits,bonusLimitMode,bonusPanelPatch} from '../src/land-evaluation/statutory-bonus-limits.mjs';
import {regionalInputPatch} from '../src/land-evaluation/regional-input.mjs';
import {newTaipeiRenewal} from '../src/land-evaluation/taipei-renewal/model.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
import {parseCase,serializeCase} from '../src/land-evaluation/case-file.mjs';
import {issueTarget} from '../src/land-evaluation/workspace-guidance.mjs';
function fixture(){
 const i=createWorkspaceInput(createInput);Object.assign(i,{site:'1600',coverage:'50',far:'300',scale:'0',renewal:'50',tdr:'25',coverageUse:'80',volumeUse:'100',balcony:'5',roofFloors:'3',roofHeight:'3',unitPing:'30',storePercent:'0',motoPerUnit:'1',extraCars:'0',basementSalePercent:'100'});
 i.parkingDesign={...i.parkingDesign,demandMode:'per_unit',demandPerUnit:'1'};i.basementDemand={...i.basementDemand,allowAlternatives:false};i.regulatoryReview.bonusAssessment.date='2026-11-02';return confirmSyntheticBonusConditions(i);
}
for(const [profile,cap]of [['general',30],['forty',40],['hillside',20],['narrow',15],['special50',30]])test('statutory NTPC profile '+profile,()=>{
 const i=fixture();i.regulatoryReview.bonusAssessment.tdrProfile=profile;const before=structuredClone(i),r=evaluateActiveBonuses(i),active=activeBonusInput(i);
 assert.equal(active.regulatoryReview.tdrLimitPercent,String(cap));assert.deepEqual(i,before);assert.deepEqual(r.errors,[]);assert(r.values);assert.equal(r.regulatory.bonus.tdrLimit,cap);
 const explicit=structuredClone(active);explicit.regulatoryReview.bonusLimitMode='document';explicit.regulatoryReview.bonusSource='合成法規條件驗收';assert.deepEqual(r.values,evaluate(explicit).values);
 if(profile==='special50'){assert.equal(r.regulatory.bonus.totalLimit,50);assert(r.values.renewalApplied+r.values.tdrApplied<=50);}
});
test('statutory caps follow city and route switches without retaining NTPC special rules',()=>{
 let i=fixture();i.regulatoryReview.bonusAssessment.tdrProfile='special50';assert.equal(statutoryBonusLimits(i).combined,50);
 Object.assign(i,regionalInputPatch(i,'臺北市'));Object.assign(i.basementDemand,{taipeiPlanUnspecified:true,taipeiZone:'res34'});
 for(const route of ['renewal','danger','none']){i.regulatoryReview.bonusAssessment.route=route;i.danger='26';confirmSyntheticBonusConditions(i);const a=activeBonusInput(i),r=evaluateActiveBonuses(i);assert.equal(a.regulatoryReview.tdrLimitPercent,'30');assert.equal(a.regulatoryReview.totalBonusLimitPercent,'');assert.deepEqual(r.errors,[]);assert(r.values);if(route==='danger')assert.equal(r.values.dangerApplied,26);}
});
test('Taipei conditional 40 percent and strategic limits use existing rules',()=>{
 const i=fixture();Object.assign(i,regionalInputPatch(i,'臺北市'));i.regulatoryReview.bonusAssessment.tdrApplication={city:'taipei',taipeiCap:'qualified40'};assert.equal(statutoryBonusLimits(i).tdr,40);
 const a=i.regulatoryReview.bonusAssessment;a.renewalMode='detail';a.taipei={...newTaipeiRenewal(),enabled:true,mode:'strategy',strategyDistrict:'yes',publicMethod:'yes',source:'合成驗收文件',sourceDate:'2026-10-30',unitArea:'10000'};
 assert.equal(statutoryBonusLimits(i).renewal,100);a.taipei.strategyDistrict='unknown';assert.equal(statutoryBonusLimits(i).renewal,50);
});
test('danger case retains exact quantities with blank legal caps',()=>{
 const i=fixture(),a=i.regulatoryReview.bonusAssessment;a.route='danger';a.dangerMode='detail';a.dangerEligibleSite='1600';a.dangerAdjacentSite='0';a.entries={'d-green':{choice:'2',status:'assumed'},'d-smart':{choice:'2',status:'assumed'},'d-seismic':{choice:'1',status:'assumed'}};
 confirmSyntheticBonusConditions(i);i.regulatoryReview.bonusAssessment.conditions.entries=Object.fromEntries(Object.keys(a.entries).map(k=>[k,'yes']));const r=evaluateActiveBonuses(i);assert.deepEqual(r.errors,[]);assert.equal(r.values.dangerApplied,26);assert.equal(r.values.salePing.toFixed(2),'3269.43');assert.equal(r.values.cars,97);
});
test('targets above a statutory ceiling are still capped by the shared solver',()=>{const i=fixture();i.renewal='80';i.tdr='50';const r=evaluateActiveBonuses(i);assert(r.values);assert.equal(r.values.renewalApplied,50);assert.equal(r.values.tdrApplied,30);});
test('case-specific legacy restrictions survive import and need an evidence destination',()=>{
 const i=fixture();Object.assign(i.regulatoryReview,{renewalLimitPercent:'40',tdrLimitPercent:'20',totalBonusLimitPercent:'55'});
 assert.equal(bonusLimitMode(i),'document');assert(evaluateActiveBonuses(i).errors.includes('另定上限依據未填'));assert.equal(issueTarget('另定上限依據未填',i).label,'另定上限依據');
 i.regulatoryReview.bonusSource='合成個案限制文件';i.regulatoryReview.bonusLimitMode='document';const restored=parseCase(serializeCase({'collective.input':i},'驗收')).data['collective.input'];assert.deepEqual(restored,i);assert.deepEqual(evaluateActiveBonuses(restored).values,evaluate(activeBonusInput(i)).values);
});
test('report records the effective caps and retains the explicit case eligibility',()=>{
 const i=fixture(),r=evaluateActiveBonuses(i),s=collectiveDelivery({input:i,result:r,district:'新北市',name:'板橋上限驗收'});assert(s.inputs.some(([k,v])=>k==='都更獎勵上限'&&v==='50%'));assert(s.inputs.some(([k,v])=>k==='容移上限'&&v==='30%'));assert(s.inputs.some(([k,v])=>k==='上限採用方式'&&v==='依地區與適用法規帶入'));assert.equal(i.regulatoryReview.bonusAssessment.tdrQualification,'yes');assert.equal(i.regulatoryReview.bonusSource,'');
});

test('live panel summaries never write statutory references into case evidence',()=>{
 const i=fixture(),p=activeBonusInput(i).regulatoryReview;p.bonusAssessment={...p.bonusAssessment,tdrProfile:'forty'};const patch=bonusPanelPatch(i,{regulatoryReview:p});assert.equal(patch.regulatoryReview.bonusSource,i.regulatoryReview.bonusSource);assert.equal(patch.regulatoryReview.renewalLimitPercent,'');assert.equal(patch.regulatoryReview.tdrLimitPercent,'');assert.equal(patch.regulatoryReview.bonusAssessment.tdrProfile,'forty');assert.equal(activeBonusInput({...i,...patch}).regulatoryReview.tdrLimitPercent,'40');
});

test('unused historical renewal limits do not block a danger case',()=>{const i=fixture();i.regulatoryReview.renewalLimitPercent='40';i.regulatoryReview.bonusAssessment.route='danger';i.danger='26';assert.equal(bonusLimitMode(i),'statutory');assert.deepEqual(evaluateActiveBonuses(i).errors,[]);});
