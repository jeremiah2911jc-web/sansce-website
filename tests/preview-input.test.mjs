import test from 'node:test';
import assert from 'node:assert/strict';
import {previewInput} from '../src/land-evaluation/preview-input.mjs';
import {createInput} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {newMultiBuilding} from '../src/land-evaluation/multi-building.mjs';
const single=()=>({...createWorkspaceInput(createInput),site:'1600',coverage:'50',far:'300',renewal:'50',tdr:'25'});
test('return from multi-building calculates the single renderer schema before deferred state catches up',()=>{
 const old={...single(),multiBuilding:newMultiBuilding()},current={...old,multiBuilding:{...old.multiBuilding,enabled:false}};
 assert(evaluateActiveBonuses(old).multiBuilding);
 const r=evaluateActiveBonuses(previewInput(current,old));assert.deepEqual(r.errors,[]);
 assert(!r.multiBuilding);assert(Number.isFinite(r.values.capacity));assert(Number.isFinite(r.values.footprint));
});
test('mode switches use the current model; typing inside the same model may remain deferred',()=>{
 const input=single(),typed={...input,site:'1800'};assert.equal(previewInput(typed,input),input);
 for(const next of [{...input,multiBuilding:newMultiBuilding()},{...input,commercialIntensity:{enabled:true}},{...input,mixedSite:{enabled:true}},{...input,assessmentMode:'document'}]){
  assert.equal(previewInput(next,input),next);assert.equal(previewInput(input,next),input);
 }
});
