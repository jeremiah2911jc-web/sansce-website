import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyReadjustmentDates} from '../scripts/apply-readjustment-dates.mjs';
import {createInput} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {regionalInputPatch} from '../src/land-evaluation/regional-input.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
import {planningDefaultRows} from '../src/land-evaluation/guided-input.mjs';
import {planningFieldApplied} from '../src/land-evaluation/applied-planning-fields.mjs';
import {dateReady,evidenceReady,newReadjustmentPlan,evaluateReadjustment,REVIEWED_AT,documentItems} from '../src/land-evaluation/generated/readjustment.mjs';

const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const system of ['public','private','expropriation'])for(const track of ['owner','acquisition'])test(`${system}/${track}: current case documents are accepted independently of catalog review date`,()=>{
 const p={...newReadjustmentPlan('date-check',system),track,referenceDate:today,planName:'合成日期驗收',membership:'in',membershipSource:'合成範圍圖及清冊',membershipDate:today,manualArea:'1000',manualSource:'合成納入面積',shareNumerator:'1',shareDenominator:'1',scopeSource:'合成權利文件',stage:'processing',evidence:Object.fromEntries(documentItems(system,track).map(d=>[d.id,{state:'reviewed',source:'合成文件 '+d.title,date:today}]))};
 const frozen=structuredClone(p),r=evaluateReadjustment(p,{parcels:[]});
 assert.deepEqual(r.errors,[]);assert.equal(r.rightsArea,1000);assert(r.canRecord);
 assert(!r.findings.some(f=>f.id==='membership'&&f.state==='pending')); 
 assert.equal(r.findings.find(f=>f.id==='ownership').state,'recorded');
 if(today>REVIEWED_AT)assert(r.findings.some(f=>f.id==='future'&&f.state==='pending'));
 assert.deepEqual(p,frozen);
 for(const key of ['membershipDate','areaDate']){
  const invalid=evaluateReadjustment({...p,allocationMode:'document',area:'100',areaSource:'合成分配表',areaStatus:'documented',areaDate:today,[key]:'2099-01-01'},{parcels:[]});
  assert(invalid.errors.some(e=>e.includes('不得晚於評估基準日或今天')));assert(!invalid.canConfirm);
 }
});
test('document date validation retains invalid, future and reference-date boundaries',()=>{
 assert(dateReady(today,today));assert(evidenceReady({state:'reviewed',source:'合成文件',date:today},today));
 assert(!dateReady('2026-02-30',today));assert(!dateReady('2099-01-01','2099-01-01'));
 assert(!dateReady(today,'2020-01-01'));assert(!evidenceReady({state:'pending',source:'合成文件',date:today},today));
});
test('date adapter is idempotent and leaves every other calculation declaration intact',()=>{
 const code=readFileSync(new URL('../src/land-evaluation/generated/readjustment.mjs',import.meta.url),'utf8');
 assert.equal(applyReadjustmentDates(code),code);assert.throws(()=>applyReadjustmentDates('unrecognized source'));
});

function fixture(city,route){
 const i=Object.assign(createWorkspaceInput(createInput),{site:'1600',coverage:'50',far:'300',renewal:'50',danger:'26',tdr:'25'});
 Object.assign(i,regionalInputPatch(i,city));i.regulatoryReview.bonusAssessment.route=route;return i;
}
for(const city of ['新北市','臺北市'])for(const route of ['renewal','danger','none'])for(const tdr of ['0','25'])test(`${city}/${route}/transfer${tdr}: report contains active inputs and preserves all numeric results`,()=>{
 const i=fixture(city,route);i.tdr=tdr;const before=structuredClone(i),r=evaluateActiveBonuses(i);assert(r.values,JSON.stringify(r.errors));
 const frozen=structuredClone(r),s=collectiveDelivery({input:i,result:r,district:city});
 assert.deepEqual(r,frozen);assert.deepEqual(i,before);
 const body=[...s.assumptions,...s.issues].join('\n');assert(!body.includes('都更及容移均為'));assert(!body.includes('都更50%依一般路徑'));
 for(const key of ['equipment','lobby','roofRate','reserve','excavation','excavationCap','basementFloors','carPerUnit','carPing','motoSqm','localParkingUnit'])assert(!planningFieldApplied(i,key),key);
 assert(!s.inputs.some(([label])=>/^(?:機電等配置比例|梯廳配置比例|屋突單層投影比例|規劃開挖率|手動地下層數|地下設備、梯間等預留|每汽車位含車道面積|每機車位含通道面積|市場規劃汽車位需求|地方規定每戶汽車位數)/.test(label)));
 assert(!planningDefaultRows(i).some(([label])=>/^(?:機電等配置比例|梯廳配置比例|屋突單層投影比例|手動地下層數)/.test(label)));
 assert(s.inputs.some(([label,value])=>label.startsWith('每戶地上分攤')&&value.startsWith('25 ')));
 assert.equal(s.metrics[0][1],r.values.salePing);assert.equal(s.metrics[4][1],r.values.equivalentFloors);assert.equal(s.metrics[5][1],r.values.floors);
});
test('legacy direct-input model retains its active ratios and fixed basement settings',()=>{
 const i={regulatoryReview:{bonusAssessment:{route:'renewal'}},basementMode:'manual',parkingRule:'localUnit'};
 for(const key of ['equipment','lobby','roofRate','excavation','basementFloors','reserve','localParkingUnit'])assert(planningFieldApplied(i,key),key);
 i.basementMode='auto';assert(!planningFieldApplied(i,'basementFloors'));
 i.quantityReserve={basementEquipmentMode:'named'};assert(!planningFieldApplied(i,'quantity.basementReservePercent'));
});
