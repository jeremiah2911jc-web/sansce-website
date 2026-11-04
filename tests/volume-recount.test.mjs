import test from 'node:test';import assert from 'node:assert/strict';
import {volumeRecount,volumeRecountSections} from '../src/land-evaluation/volume-recount.mjs';
import {createInput} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {newMultiBuilding} from '../src/land-evaluation/multi-building.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
const fixture=()=>({...createWorkspaceInput(createInput),site:'1600',coverage:'50',far:'300',renewal:'50',tdr:'25'});
const near=(actual,expected)=>assert(Math.abs(actual-expected)<.025,`${actual} != ${expected}`);
test('single-building recount shows underground consumption and preserves solver output',()=>{
 const i=fixture(),r=evaluateActiveBonuses(i),before=structuredClone(r),x=volumeRecount(r);
 near(x.belowCounted,r.values.basementCounted);near(x.rows.filter(row=>row.field==='basement').reduce((sum,row)=>sum+row.counted,0),x.belowCounted);
 near(x.ordinaryBudget,r.values.allowed-x.counted);near(x.aboveBudget,r.values.allowed-r.values.basementCounted);
 assert(x.rows.some(row=>row.id==='bicycle'&&row.counted>0));assert.deepEqual(r,before);
 assert(collectiveDelivery({input:i,result:r}).sections.some(s=>s.title==='反計容積與空間占用'));
});
test('raising balcony ratio exposes counted excess instead of silently treating it all exempt',()=>{
 const i=fixture();i.balcony='20';const r=evaluateActiveBonuses(i),x=volumeRecount(r),balcony=x.rows.find(row=>row.id==='balcony');
 assert(balcony.adopted>balcony.exempt);assert(balcony.counted>0);near(balcony.counted,r.floorReview.balcony-r.floorReview.balconyExempt);
 near(x.aboveCounted,r.floorReview.countedExtras);
});
test('multi-building roof failure and above/below recount each enter budget once',()=>{
 const i={...fixture(),multiBuilding:newMultiBuilding()};i.multiBuilding.buildings[0].roof.height='4';const r=evaluateActiveBonuses(i),x=volumeRecount(r);
 assert.equal(x.rows.find(row=>row.id==='roof').counted,120);near(x.counted,x.rows.reduce((sum,row)=>sum+row.counted,0));
 near(x.counted,x.aboveCounted+r.values.basementCounted);assert.equal(volumeRecountSections(r,String).length,2);
});
test('missing or invalid calculation does not fabricate a zero-counted summary',()=>{assert.equal(volumeRecount({values:null}),null);assert.equal(volumeRecount({values:{allowed:100}}),null);});
