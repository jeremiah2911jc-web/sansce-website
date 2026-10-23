import assert from 'node:assert/strict';
import {serializeDraft,parseDraft,encodeValue,decodeValue,comparable,MAX_DRAFT_SIZE,persistDraft,DRAFT_KEY} from '../src/land-evaluation/local-draft.mjs';
import {collectiveDelivery,landDelivery,layoutDelivery,readjustmentDelivery,displayNumber} from '../src/land-evaluation/delivery-model.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
import {createInput,exampleInput,evaluate} from '../src/land-evaluation/model.mjs';
import {newLandAssessment,newLandFact,newLegalInputs,evaluateLand,newLayout,newHouse,newFloor,calculateLayout} from '../src/land-evaluation/generated/land.mjs';
import {newReadjustmentPlan,evaluateReadjustment} from '../src/land-evaluation/generated/readjustment.mjs';
import {layoutPresentation} from '../src/land-evaluation/layout-presentation.mjs';
let cases=0;function test(name,fn){fn();cases++;}
const input=createInput();input.quantityReserve.basementReservePercent=NaN;input.basementDemand=undefined;
const source={'nav.section':'collective','collective.input':input,'land.plans':[{input:{id:'p'},history:[{confirmed:true,result:{area:999}}]}],'readjustment.items':[{input:{id:'r'},history:[{confirmed:true}]}],submitted:{values:{salePing:999}},unknown:'excluded'};
const serialized=serializeDraft(source,'rules1','revision1','2026-10-23T00:00:00Z');const restored=parseDraft(serialized);
test('unknown remains unknown',()=>{assert(Number.isNaN(restored.data['collective.input'].quantityReserve.basementReservePercent));assert(Object.hasOwn(restored.data['collective.input'],'basementDemand'));assert.equal(restored.data['collective.input'].basementDemand,undefined);});
test('input only, no previous calculated or confirmed output',()=>{assert.deepEqual(restored.data['land.plans'][0].history,[]);assert.deepEqual(restored.data['readjustment.items'][0].history,[]);assert(!Object.hasOwn(restored.data,'submitted'));assert(!Object.hasOwn(restored.data,'unknown'));assert.equal(source['land.plans'][0].history.length,1);});
for(const bad of ['{','null',JSON.stringify({...JSON.parse(serialized),schema:99}),JSON.stringify({...JSON.parse(serialized),savedAt:'bad'}),'x'.repeat(MAX_DRAFT_SIZE+1)])test('reject malformed envelope',()=>assert.throws(()=>parseDraft(bad)));
test('reject dangerous keys',()=>assert.throws(()=>decodeValue(['object',[['__proto__',['value','x']]]])));
test('reject excessively deep input',()=>{let x=['value','x'];for(let i=0;i<72;i++)x=['array',[x]];assert.throws(()=>decodeValue(x));});
test('preserve nonfinite and blank distinctly',()=>assert.deepEqual(decodeValue(encodeValue([NaN,undefined,Infinity,-Infinity,null,'',0])),[NaN,undefined,Infinity,-Infinity,null,'',0]));
test('empty land baseline ignores volatile identifiers only',()=>assert.equal(comparable('land.assessment',{...newLandAssessment('a'),updatedAt:'x'}),comparable('land.assessment',{...newLandAssessment('b'),updatedAt:'y'})));
test('changed rules stay explicit',()=>assert.notEqual(restored.rules,'rules2'));
test('bound saved draft size',()=>assert.throws(()=>serializeDraft({'collective.name':'x'.repeat(MAX_DRAFT_SIZE)},'r','r')));
const memory=new Map([[DRAFT_KEY,serialized]]);const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
test('write rejected by quota preserves original data and input',()=>{assert.throws(()=>persistDraft({...storage,setItem:()=>{throw Error('QuotaExceededError');}},serialized,source,true,'r','r'));assert.equal(memory.get(DRAFT_KEY),serialized);assert.equal(source['land.plans'][0].history.length,1);});
test('read blocked by browser permissions cannot overwrite',()=>{assert.throws(()=>persistDraft({...storage,getItem:()=>{throw Error('SecurityError');}},serialized,source,true,'r','r'));assert.equal(memory.get(DRAFT_KEY),serialized);});
test('another tab wins until user explicitly resolves conflict',()=>{assert.throws(()=>persistDraft(storage,'older-version',source,true,'r','r'),e=>e.code==='DRAFT_CONFLICT');assert.equal(memory.get(DRAFT_KEY),serialized);});
test('clearing all input removes old draft instead of restoring old data',()=>{assert.deepEqual(persistDraft(storage,serialized,{},false,'r','r'),{raw:null,savedAt:''});assert.equal(storage.getItem(DRAFT_KEY),null);});
test('size failure never replaces previous draft',()=>{memory.set(DRAFT_KEY,serialized);assert.throws(()=>persistDraft(storage,serialized,{'collective.name':'x'.repeat(MAX_DRAFT_SIZE)},true,'r','r'));assert.equal(storage.getItem(DRAFT_KEY),serialized);});
for(const i of [exampleInput(),{...createInput(),site:'1800',coverage:'50',far:'300'}]){
 const r=evaluate(i),before=structuredClone(r),s=collectiveDelivery({input:i,result:r,name:'合成驗收',district:'新北市',calculatedAt:'2026-10-23T00:00:00Z'});
 test('collective output mapped without recalculation or mutation',()=>{assert.equal(s.metrics[0][1],r.values.salePing);assert.equal(s.createdAt,'2026-10-23T00:00:00Z');assert.deepEqual(r,before);assert(!s.ruleVersion.includes('待核'));});
 test('area chart uses nonoverlapping floor components',()=>assert(Math.abs(s.charts[1].rows.reduce((a,x)=>a+x[1],0)-r.values.total)<.02));
 test('volume chart preserves core precision',()=>assert(Math.abs(s.charts[0].rows.reduce((a,x)=>a+x[1],0)-r.values.allowed)<.02));
 test('all core assumptions retained without duplicate issue/assumption paragraphs',()=>{assert.deepEqual(new Set([...s.issues,...s.assumptions]),new Set(r.notes.map(publicText)));assert(s.assumptions.every(x=>!s.issues.includes(x)));});
}
test('unknown values and small positives are distinct from zero',()=>{assert.equal(displayNumber(null),'待確認');assert.equal(displayNumber(NaN),'待確認');assert.equal(displayNumber(undefined),'待確認');assert.equal(displayNumber(0),'0');assert.equal(displayNumber(.001),'<0.01');});
const a={...newLandAssessment('synthetic'),intendedUse:'housing',legalInputs:newLegalInputs(),routePlans:[],parcels:[{...newLandFact('unknown'),areaSqm:'300',landNumber:'模擬001'}]};
test('land counts missing area independently',()=>{a.parcels.push({...newLandFact('unknown'),areaSqm:''});const s=landDelivery(a,{result:evaluateLand(a)});assert.equal(s.metrics[1][1],300);assert.equal(s.metrics[2][1],1);assert(s.issues.length>0);a.parcels.pop();});
const p=newLayout(a,'single');Object.assign(p.groups[0],{baseArea:'300',width:'20',depth:'15',parcelIds:[a.parcels[0].id],houses:[{...newHouse(),floors:[{...newFloor(),area:'40',height:'3',privateArea:'40'}]}]});
const r=calculateLayout(p,a),pres=layoutPresentation(p,a,r);
test('layout chart equals core floor and registration sums',()=>{const s=layoutDelivery(p,a,r,pres);assert.equal(s.metrics[0][1],r.gross);assert.equal(s.charts[0].rows.reduce((a,x)=>a+x[1],0),r.gross);assert.equal(s.charts[1].rows.reduce((a,x)=>a+x[1],0),r.gross);assert(s.issues.length>0);});
test('layout summary blocked for stale or incomplete basis',()=>{assert.equal(layoutDelivery(p,a,{...r,stale:true},pres),null);assert.equal(layoutDelivery(p,a,r,{...pres,showAreas:false}),null);});
for(const system of ['public','private','expropriation'])for(const track of ['owner','acquisition']){
 const p={...newReadjustmentPlan('s',system),track,manualArea:'1800',shareNumerator:'1',shareDenominator:'2'};const r=evaluateReadjustment(p,a),s=readjustmentDelivery(p,a,r);
 test('readjustment unknown allocation is not zero in any system or track',()=>{assert.equal(s.charts[0].rows[0][1],1800);assert.equal(s.charts[0].rows[1][1],900);assert.equal(s.charts[0].rows[2][1],null);assert.equal(s.metrics[2][1],null);assert(s.issues.length>0);});
}
console.log(`PASS ${cases} local-draft and summary/chart checks: malformed and unknown values, input-only restore, core-derived numbers, stale gates, six readjustment modes.`);
