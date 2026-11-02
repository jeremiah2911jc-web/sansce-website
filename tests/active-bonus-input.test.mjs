import {confirmSyntheticBonusConditions} from './helpers/bonus-conditions.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createInput,exampleInput,evaluate} from '../src/land-evaluation/model.mjs';
import {defaultBasementDemand} from '../src/land-evaluation/generated/core.mjs';
import {activeBonusInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
function fixture(city,route,mode='quick'){
 const merge=(base,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries([...new Set([...Object.keys(base||{}),...Object.keys(value)])].map(key=>[key,key in value?merge(base?.[key],value[key]):base[key]])):value;
 const i=merge(createInput(),exampleInput());Object.assign(i,{renewal:'20',danger:'10',scale:'0',tdr:'0'});i.parkingDesign.district=city;i.basementDemand={...defaultBasementDemand(city),enabled:false};
 Object.assign(i.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30',bonusAssessment:{version:'bonus-assessment.2026-10-19.v1',route,renewalMode:mode,tdrMode:'quick',dangerMode:mode,date:'2026-11-02',entries:{'u-green':{choice:'2',status:'assumed'},'d-green':{choice:'1',status:'assumed'}},renewalQualification:'unknown',dangerQualification:'unknown',tdrQualification:'unknown',source:'',deduction:'0',tdrProfile:'general',dangerOriginal:'',dangerEligibleSite:'2400',dangerAdjacentSite:'0'}});
 return confirmSyntheticBonusConditions(i);
}
for(const city of ['臺北市','新北市'])for(const route of ['renewal','danger','none'])for(const mode of ['quick','detail']){
 test(`${city}/${route}/${mode}: unused values never block or change quantities`,()=>{
  const i=fixture(city,route,mode),original=evaluate(i);assert(original.values,JSON.stringify(original.errors));
  const unused=Object.keys(activeBonusInput(i)).filter(k=>['renewal','danger','scale'].includes(k)&&activeBonusInput(i)[k]!==i[k]);
  // Include zero-valued unused scale in the danger case.
  if(route==='danger'&&!unused.includes('scale'))unused.push('scale');
  for(const value of ['', ' ', 'invalid', '-5','999999']){
   const copy=structuredClone(i);for(const key of unused)copy[key]=value;
   const frozen=structuredClone(copy),result=evaluateActiveBonuses(copy);assert.deepEqual(result.errors,[]);assert.deepEqual(result.values,original.values);assert.deepEqual(copy,frozen);
   const summary=collectiveDelivery({input:copy,result,name:'合成驗收',district:city});assert(summary);assert(!summary.inputs.some(([label])=>route==='renewal'?label.includes('危老獎勵目標'):route==='danger'?label.includes('都更獎勵目標'):label.includes('都更獎勵目標')||label.includes('危老獎勵目標')));
  }
 });
 if(route!=='none'&&mode==='quick')test(`${city}/${route}: active target still requires a valid number`,()=>{const i=fixture(city,route);for(const value of ['', 'invalid','-1']){i[route]=value;assert.equal(evaluateActiveBonuses(i).values,null);assert(evaluateActiveBonuses(i).errors.length);}});
 if(route==='danger'&&mode==='detail')test(`${city}: active danger site area is still mandatory`,()=>{const i=fixture(city,route,mode);i.regulatoryReview.bonusAssessment.dangerEligibleSite='';assert.equal(evaluateActiveBonuses(i).values,null);assert(evaluateActiveBonuses(i).errors.some(e=>e.includes('危老原合格基地面積及鄰地面積')));});
}
test('switching back retains and validates the original quick target',()=>{const i=fixture('臺北市','renewal');i.danger='';const frozen=structuredClone(i);assert(evaluateActiveBonuses(i).values);assert.deepEqual(i,frozen);i.regulatoryReview.bonusAssessment.route='danger';assert.equal(evaluateActiveBonuses(i).values,null);i.danger='12';assert(evaluateActiveBonuses(i).values);});
test('legacy inputs with awards require route eligibility first',()=>{const i=fixture('新北市','renewal');delete i.regulatoryReview.bonusAssessment;i.danger='';assert.equal(activeBonusInput(i),i);assert.equal(evaluateActiveBonuses(i).values,null);assert(evaluateActiveBonuses(i).errors.some(e=>e.includes('重建獎勵路徑')));});
for(const city of ['臺北市','新北市'])test(`${city}: automatic basement ignores the unused fixed percentage and legacy reserve`,()=>{
 const i=fixture(city,'renewal');i.basementDemand={...defaultBasementDemand(city),enabled:true,...(city==='臺北市'?{taipeiPlanUnspecified:true,taipeiZone:'res34'}:{})};
 const before=evaluate(i);assert(before.values,JSON.stringify(before.errors));
 i.reserve='';i.quantityReserve.basementReservePercent=undefined;const frozen=structuredClone(i),after=evaluateActiveBonuses(i);
 assert(after.values,JSON.stringify(after.errors));assert.deepEqual(after.values,before.values);assert.deepEqual(i,frozen);
});
for(const city of ['臺北市','新北市'])for(const route of ['renewal','danger'])test(`${city}/${route}: approved award does not require an unused quick target`,()=>{
 const i=fixture(city,route);Object.assign(i.regulatoryReview.bonusAssessment,{awardBasis:'permitted',permittedAward:{route,baseSqm:'6720',awardSqm:'672',approvedAt:'2026-10-30',source:'合成核准文件'}});
 const before=evaluate(i);assert(before.values,JSON.stringify(before.errors));i.renewal='';i.danger='';const after=evaluateActiveBonuses(i);assert.deepEqual(after.errors,[]);assert.deepEqual(after.values,before.values);
});
