import {confirmSyntheticBonusConditions} from './helpers/bonus-conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createInput,exampleInput,evaluate} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,activeBonusInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {planningInputIssues,missingPlanningFields,requiredPlanningFields} from '../src/land-evaluation/planning-input-review.mjs';
import {regionalInputPatch} from '../src/land-evaluation/regional-input.mjs';
import {issueTarget} from '../src/land-evaluation/workspace-guidance.mjs';
function blankFilled(){
 const i=createWorkspaceInput(createInput);Object.assign(i,{site:'1600',coverage:'50',far:'300',scale:'0',renewal:'50',tdr:'25',coverageUse:'80',volumeUse:'100',balcony:'5',roofFloors:'3',roofHeight:'3',unitPing:'30',storePercent:'0',motoPerUnit:'1',extraCars:'0',basementSalePercent:'100'});

 i.parkingDesign={...i.parkingDesign,demandMode:'per_unit',demandPerUnit:'1'};
 i.basementDemand={...i.basementDemand,allowAlternatives:false};
 return confirmSyntheticBonusConditions(i);
}
test('blank Banqiao case receives statutory caps without extra required fields',()=>{
 const i=blankFilled(),before=structuredClone(i),r=evaluateActiveBonuses(i);
 assert.deepEqual(r.errors,[]);assert(r.values);assert.equal(r.values.salePing.toFixed(2),'3810.27');assert.deepEqual(i,before);
});
test('after caps are filled, the exact shared-calculator quantities are retained',()=>{
 const i=blankFilled();Object.assign(i.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30'});
 const active=activeBonusInput(i),original=evaluate(active),r=evaluateActiveBonuses(i);assert(original.values,JSON.stringify(original.errors));assert.deepEqual(r,original);
 assert.equal(Math.round(r.values.allowed),8400);assert.equal(r.values.salePing.toFixed(2),'3810.27');assert.equal(r.values.units,113);assert.equal(r.values.cars,113);
});
for(const city of ['新北市','臺北市'])for(const route of ['renewal','danger','none'])test(`${city}/${route}: every blank required field resolves to a field and inactive bonuses are excluded`,()=>{
 let i=blankFilled();Object.assign(i,regionalInputPatch(i,city));i.regulatoryReview.bonusAssessment.route=route;
 for(const [key]of requiredPlanningFields(activeBonusInput(i))){
  const copy=structuredClone(i);copy[key]='';const active=activeBonusInput(copy),missing=missingPlanningFields(active);
  const isInactive=['renewal','danger','scale'].includes(key)&&active[key]==='0';
  if(isInactive)assert(!missing.some(x=>x.key===key));else{const target=missing.find(x=>x.key===key);assert(target,`${key} not located`);assert(target.label);assert(['base','above','parking','basement'].includes(target.tab));}
 }
 const missing=planningInputIssues(activeBonusInput(i));assert(!missing.some(m=>route==='renewal'?m.includes('危老快速目標'):route==='danger'?m.includes('都更快速目標'):m.includes('危老快速目標')||m.includes('都更快速目標')));
});
test('zero bonuses do not require unused caps',()=>{const i=blankFilled();i.renewal='0';i.tdr='0';assert.deepEqual(planningInputIssues(activeBonusInput(i)),[]);});
test('automatic demand search omits legacy excavation and reserve; fixed basement asks for its active inputs',()=>{
 const i=blankFilled();Object.assign(i.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30'});
 assert(!planningInputIssues(activeBonusInput(i)).some(m=>/開挖|預留比例|地下層數/.test(m)));
 i.basementDemand.enabled=false;i.basementMode='manual';i.excavation='';i.basementFloors='';i.quantityReserve.basementReservePercent=undefined;
 assert(planningInputIssues(activeBonusInput(i)).some(m=>m.includes('規劃開挖率')));assert(planningInputIssues(activeBonusInput(i)).some(m=>m.includes('地下層數')));assert(planningInputIssues(activeBonusInput(i)).includes('地下預留比例未填'));
});
test('document and mixed cases retain their owning validation',()=>{for(const patch of [{assessmentMode:'document'},{mixedSite:{enabled:true}}])assert.deepEqual(planningInputIssues({...createInput(),...patch}),[]);});
test('every moved cap and source error has a base-tab destination',()=>{for(const m of ['都更獎勵上限未填','容移上限未填','個案獎勵及容移合計上限不得小於0','高於一般都更50%上限須附來源','高於一般容移30%上限須附來源']){const t=issueTarget(m);assert.equal(t.tab,'base');assert(t.label);}});

test('a fresh website case follows its visible renewal route before any bonus interaction',()=>{const i=createWorkspaceInput(createInput),m=planningInputIssues(activeBonusInput(i));assert(!m.some(t=>t.includes('危老快速目標')));assert(m.some(t=>t.includes('都更快速目標')));});

test('Taipei conditional excavation choices remain blocking and both locate exact fields',()=>{let i=blankFilled();Object.assign(i,regionalInputPatch(i,'臺北市'));Object.assign(i.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30'});confirmSyntheticBonusConditions(i);const errors=evaluateActiveBonuses(i).errors;for(const [pattern,label]of [[/都市計畫是否另訂地下開挖/,'都市計畫開挖規定'],[/請選擇地下開挖適用分區/,'地下開挖適用分區']]){const message=errors.find(t=>pattern.test(t));assert(message);assert.equal(issueTarget(message,i).label,label);}});
