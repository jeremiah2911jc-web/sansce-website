import test from 'node:test';
import assert from 'node:assert/strict';
import {createInput} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {regionalInputPatch} from '../src/land-evaluation/regional-input.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
import {planningDefaultRows} from '../src/land-evaluation/guided-input.mjs';
import {newMultiBuilding} from '../src/land-evaluation/multi-building.mjs';
import {bonusItemMessages,bonusItemCondition,publicText} from '../src/land-evaluation/public-copy.mjs';

function fixture(city,route,awardMode,tdrMode){
 const i=createWorkspaceInput(createInput);
 Object.assign(i,regionalInputPatch(i,city),{site:'1600',coverage:'50',far:'300',renewal:'50',danger:'26',tdr:tdrMode==='detail'?'0':'25'});
 i.roadConditions.plannedWidth='12';
 Object.assign(i.regulatoryReview.bonusAssessment,{route,renewalMode:awardMode,dangerMode:awardMode,tdrMode,date:'2026-11-04',entries:{'u-green':{choice:'2'},'d-green':{choice:'2'},'d-smart':{choice:'2'},'d-seismic':{choice:'1'},...(tdrMode==='detail'?{'t-base':{choice:'yes',amount:'12'}}:{})}});
 return i;
}
function report(i){
 const r=evaluateActiveBonuses(i);assert(r.values,JSON.stringify(r.errors));
 const before=structuredClone(r),inputBefore=structuredClone(i);
 const s=collectiveDelivery({input:i,result:r,district:i.parkingDesign.district});
 assert.deepEqual(r,before);assert.deepEqual(i,inputBefore);
 return {r,s,body:[...s.issues,...s.assumptions].join('\n')};
}
for(const city of ['新北市','臺北市'])for(const route of ['renewal','danger','none'])for(const awardMode of ['quick','detail'])for(const tdrMode of ['quick','detail'])test(`${city}/${route}/${awardMode}/${tdrMode}: report identifies adopted values and omits unused targets`,()=>{
 const i=fixture(city,route,awardMode,tdrMode),{r,s,body}=report(i);
 const unused=new Set([...(route!=='renewal'||awardMode==='detail'?['都更獎勵目標（以基準容積為母數）']:[]),...(route!=='danger'||awardMode==='detail'?['危老獎勵目標']:[]),...(tdrMode==='detail'?['容積移轉目標']:[])]);
 for(const [label]of [...s.inputs,...planningDefaultRows(i)])assert(!unused.has(label),label);
 if(route!=='none')assert(s.inputs.some(([label,value])=>label===(route==='renewal'?'都更採計方式':'危老採計方式')&&value.includes(awardMode==='detail'?'細項評定':'快速估算')&&value.includes(String(route==='renewal'?r.values.renewalApplied:r.values.dangerApplied)+'%')));
 if(tdrMode==='quick'||r.values.tdrApplied>0){assert(s.inputs.some(([label,value])=>label==='容移採計方式'&&value.includes(String(r.values.tdrApplied)+'%')));assert(body.includes('；容移'+(tdrMode==='detail'?'細項評定':'快速估算')));}
 if(awardMode==='quick'||route!=='renewal')assert(!body.includes('都更中央'));
 if(awardMode==='quick'||route!=='danger')assert(!body.includes('危老第3'));
 if(route==='none')assert(!s.inputs.some(([label])=>/^(都更|危老)採計方式/.test(label)));
});
test('NTPC detail12 with stale quick0 retains the scoring formula and reports12, not0',()=>{
 const i=fixture('新北市','renewal','quick','detail'),{r,s,body}=report(i);
 assert.equal(r.values.tdrApplied,12);assert.equal(r.values.allowed,7776);
 assert(body.includes('容移評點'));assert(body.includes('本次採用：都更（快速估算）；容移細項評定。'));
 assert(!s.inputs.some(([label])=>label==='容積移轉目標'));
 assert(s.sources.some(source=>source.includes('fcode=C0150118')));
 i.tdr='999';const other=report(i);assert.deepEqual(other.r.values,r.values);assert.deepEqual(other.s.inputs,s.inputs);
});
test('an approved award is labelled by its document basis and excludes the unused quick input',()=>{
 const i=fixture('新北市','renewal','quick','quick');
 i.tdr='0';
 Object.assign(i.regulatoryReview.bonusAssessment,{awardBasis:'permitted',permittedAward:{route:'renewal',baseSqm:'4800',awardSqm:'480',approvedAt:'2026-10-30',source:'合成核准文件及適用範圍'}});
 const {s,body}=report(i);assert(s.inputs.some(([label,value])=>label==='都更採計方式'&&value==='依核准文件；本次採10%'));
 assert(!s.inputs.some(([label])=>label.startsWith('都更獎勵目標')));assert(body.includes('都更（依核准文件）'));
});
test('multi-building reports retain TDR scoring and pending qualification notes',()=>{
 const i=fixture('新北市','renewal','quick','detail');i.multiBuilding=newMultiBuilding();
 const {r,s,body}=report(i);assert.equal(r.values.tdrApplied,12);
 assert(s.inputs.some(([label,value])=>label==='容移採計方式'&&value==='細項評定；本次採12%'));
 assert(body.includes('容移評點'));assert(body.includes('容移接受基地、道路及移入資格須先確認符合'));
 assert(!body.includes('都更中央'));assert(s.sources.some(source=>source.startsWith('容移上限：')));
 assert(s.sources.some(source=>source.includes('fcode=C0150118')));
});
test('a partial capacity report also omits inactive award notes and keeps the blocking reason',()=>{
 const i=fixture('新北市','renewal','quick','detail'),r={values:null,errors:['停車配置尚未完成'],aboveGround:{base:4800,bonus:2976,allowed:7776,footprint:640},notes:['採計方式：都更；容移細項評定','危老第3–6條合計0%，原合格基地NaN㎡','都更中央0.00%＋地方0.00%','容移接受基地及道路仍待核對']};
 const s=collectiveDelivery({input:i,result:r,district:'新北市'}),text=JSON.stringify(s);
 assert(s.issues.includes('停車配置尚未完成'));assert(!text.includes('NaN'));assert(!text.includes('都更中央'));
 assert(text.includes('容移細項評定'));assert(!s.metrics.some(([label])=>label.includes('可售')));assert.equal(s.reviewedAt,'2026-11-03');
});
test('a road base uses the shared width for its missing-data explanation without changing12% calculation',()=>{
 const i=fixture('新北市','renewal','quick','detail');i.regulatoryReview.bonusAssessment.entries['t-base'].amount='';
 const {r}=report(i),row=r.regulatory.bonus.assessment.rows.find(row=>row.id==='t-base'),before=structuredClone(row);
 assert.equal(r.values.tdrApplied,12);assert(row.messages.some(message=>message.startsWith('缺計算量')));
 assert(!bonusItemMessages({id:'t-base'},row,i).some(message=>message.startsWith('缺計算量')));assert.deepEqual(row,before);
 i.roadConditions.plannedWidth='';assert(bonusItemMessages({id:'t-base'},row,i).some(message=>message.includes('基地道路條件')));
});
test('the road-specific explanation preserves missing data for other award items',()=>{
 const row={messages:['缺計算量，該項先0，其餘選項繼續加總','另須核對用途']};
 assert.deepEqual(bonusItemMessages({id:'t-setback'},row,{roadConditions:{plannedWidth:'12'}}),row.messages);
 assert.deepEqual(bonusItemMessages({id:'t-base'},row,{roadConditions:{plannedWidth:'12'}}),['另須核對用途']);
});
test('road and transfer instructions state the conditions directly',()=>{
 assert.equal(bonusItemCondition({id:'t-base',condition:'不是地籍圖上名目路寬即合格。'},'ntpc'),'道路條件依實際開闢、連通及基地面寬核對。');
 assert.equal(publicText('上限30%，不能把勾選視為核准。'),'上限30%；核准比例依主管機關文件確認。');
});
