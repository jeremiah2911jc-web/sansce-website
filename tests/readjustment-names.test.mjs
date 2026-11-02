import test from 'node:test';
import assert from 'node:assert/strict';
import {readjustmentNameForTrack} from '../src/land-evaluation/readjustment-names.mjs';
import {systems,perspectives} from '../src/land-evaluation/generated/readjustment.mjs';

for(const [system,label] of Object.entries(systems)){
 for(const base of [label,'合成公告計畫']){
  for(const from of Object.keys(perspectives))for(const to of Object.keys(perspectives)){
   test(`${system}: ${base}: ${from} to ${to}`,()=>{
    const plan={system,planName:'合成公告計畫',track:from,name:`${base}／${perspectives[from]}`,manualArea:'1000',shareNumerator:'1',shareDenominator:'2'};
    const before=structuredClone(plan);
    assert.equal(readjustmentNameForTrack(plan,to),`${base}／${perspectives[to]}`);
    assert.deepEqual(plan,before);
   });
  }
 }
 test(`${system}: custom and empty names remain`,()=>{
  for(const name of ['自訂地主方案','地主權益討論案','合成公告計畫／地主權益／替代案','']){
   assert.equal(readjustmentNameForTrack({system,planName:'合成公告計畫',track:'owner',name},'acquisition'),name);
  }
 });
 test(`${system}: imported default title follows its current purpose`,()=>{
  const plan={system,track:'acquisition',name:`${label}／${perspectives.owner}`};
  assert.equal(readjustmentNameForTrack(plan),`${label}／${perspectives.acquisition}`);
 });
}
