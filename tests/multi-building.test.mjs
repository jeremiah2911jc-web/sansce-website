import test from 'node:test';
import assert from 'node:assert/strict';
import {createInput,evaluate} from '../src/land-evaluation/model.mjs';
import {createWorkspaceInput,activeBonusInput,evaluateActiveBonuses} from '../src/land-evaluation/active-bonus-input.mjs';
import {newMultiBuilding,newBuilding,newFloorGroup,newBasement,compareMultiReference,multiBuildingShapeIssues} from '../src/land-evaluation/multi-building.mjs';
import {collectiveDelivery} from '../src/land-evaluation/delivery-model.mjs';
import {collectiveDisplayNotes} from '../src/land-evaluation/collective-notes.mjs';
import {comparisonMetrics} from '../src/land-evaluation/collective-comparison.mjs';
import {serializeCase,parseCase} from '../src/land-evaluation/case-file.mjs';
function fixture(){let i=createWorkspaceInput(createInput);i={...i,site:'1600',coverage:'50',far:'300',renewal:'50',tdr:'25',multiBuilding:newMultiBuilding()};const b=i.multiBuilding.buildings[0];b.footprint='400';b.floors[0]={...b.floors[0],to:'8',area:'400',equipment:'10',lobby:'20',balcony:'20',common:'20',units:'4'};return i;}
const run=i=>evaluateActiveBonuses(i);
test('single tower quantities use repeat counts and one shared basement',()=>{const i=fixture(),before=structuredClone(i),r=run(i);assert.deepEqual(r.errors,[]);assert.equal(r.values.totalWithoutBalcony,3200+120+600);assert.equal(r.values.units,32);assert.equal(r.values.basement,600);assert.equal(r.values.sale,(400+20)*8+120+80);assert.equal(r.multiBuilding.above.equipmentExempt,80);assert.deepEqual(i,before);});
test('unequal A B C towers sum independently without multiplying shared basement',()=>{const i=fixture(),a=i.multiBuilding.buildings[0],b=newBuilding('B棟'),c=newBuilding('C棟');b.floors[0].to='2';b.floors[0].area='300';c.floors[0].to='3';c.floors[0].area='100';c.footprint='100';c.floors[0].common='10';c.roof.projection='10';c.roof.levels='1';i.multiBuilding.buildings=[a,b,c];let r=run(i);assert.deepEqual(r.errors,[]);assert.equal(r.values.totalWithoutBalcony,3200+600+300+120+120+10+600);assert.equal(r.values.basement,600);assert.equal(r.multiBuilding.buildings[2].floors,3);assert.equal(r.values.units,32+8+12);});
test('equipment cap applies to full site once, excess counts toward FAR',()=>{const i=fixture();i.site='100';i.far='100';i.renewal='0';i.tdr='0';i.multiBuilding.basements=[];const b=i.multiBuilding.buildings[0];b.floors[0]={...b.floors[0],to:'1',area:'100',equipment:'50',lobby:'0',balcony:'0',common:'0'};const c=structuredClone(b);c.id='other';c.name='B棟';c.floors[0].id='otherfloor';i.multiBuilding.buildings.push(c);const r=run(i);assert.equal(r.values.allowed,100);assert.equal(r.multiBuilding.equipmentCap,15);assert.equal(r.multiBuilding.above.equipmentExempt,15);assert.equal(r.values.aboveCounted,185);assert(r.multiBuilding.checks.some(x=>x.includes('超過允建')));});
test('common podium can serve A and B without blocking independent C floor',()=>{const i=fixture(),b=i.multiBuilding.buildings[0],c=newBuilding('C棟');b.floors[0].from='2';c.floors[0].to='3';const shared={...newFloorGroup(),from:'1',to:'1',members:[b.id]};i.multiBuilding.sharedFloors=[shared];i.multiBuilding.buildings.push(c);const r=run(i);assert.deepEqual(r.errors,[]);b.floors[0].from='1';assert(run(i).errors.some(x=>x.includes('重複')));});
test('repeated floors and duplicate names are rejected',()=>{const i=fixture(),b=i.multiBuilding.buildings[0];b.floors.push({...newFloorGroup(),from:'8',to:'9'});assert(run(i).errors.some(x=>x.includes('重複')));const j=fixture();j.multiBuilding.buildings.push({...structuredClone(j.multiBuilding.buildings[0]),id:'x'});assert(multiBuildingShapeIssues(j.multiBuilding).some(x=>x.includes('重複')));});
test('basement pools conserve area, allocation does not create area',()=>{const i=fixture(),r=run(i);assert.equal(r.multiBuilding.below.balanced,true);assert(Math.abs(r.multiBuilding.below.counted+r.multiBuilding.below.exempt-r.values.basement)<1e-8);i.multiBuilding.basements[0].houseCommon='90';const s=run(i);assert.equal(s.values.totalWithoutBalcony,r.values.totalWithoutBalcony);assert.equal(s.values.sale-r.values.sale,10);i.multiBuilding.basements[0].other='30';assert(run(i).errors.some(x=>x.includes('合計須等於')));});
test('reference totals have no influence on solver output, tolerance compares unrounded numbers',()=>{const i=fixture(),r=run(i);i.multiBuilding.reference={source:'參考文件',salePing:'999999',gross:'1',allowed:'2'};assert.deepEqual(run(i).values,r.values);const c=compareMultiReference({totalWithoutBalcony:10001,salePing:1,allowed:1},{gross:'10000',salePing:'',allowed:''});assert.equal(c[0].withinTolerance,true);assert.equal(c[1].withinTolerance,null);assert.equal(compareMultiReference({totalWithoutBalcony:10001.01},{gross:'10000',salePing:'',allowed:''})[0].withinTolerance,false);});
test('fractional repeated plates keep full precision until display',()=>{const i=fixture();i.multiBuilding.buildings[0].floors[0].area='123.456789';const r=run(i);assert(Math.abs(r.values.totalWithoutBalcony-(123.456789*8+120+600))<1e-9);});
test('oversized, infinite and corrupt imported building inputs fail safely',()=>{for(const mutate of [m=>m.buildings=null,m=>m.buildings=[null],m=>m.buildings[0].floors=Array(101).fill({}),m=>m.buildings[0].roof.projection=Infinity,m=>m.basements[0].level='-1']){const i=fixture();mutate(i.multiBuilding);assert.doesNotThrow(()=>evaluate(activeBonusInput(i)));assert(evaluate(activeBonusInput(i)).errors.length);}const i=fixture();i.multiBuilding.buildings[0].floors[0].to='9999999';assert(run(i).errors.length);});
test('case file preserves per-tower rows and references; malformed extras rejected',()=>{const i=fixture(),data={'collective.input':i,'collective.district':'新北市','collective.name':'合成分棟驗收'};const restored=parseCase(serializeCase(data,'multi test')).data['collective.input'];assert.deepEqual(restored.multiBuilding,i.multiBuilding);assert.deepEqual(run(restored).values,run(i).values);i.multiBuilding.buildings[0].floors=Array(101).fill({});assert.throws(()=>serializeCase(data,'test'));});
test('report reflects tower, shared basement, comparison and limitations',()=>{const i=fixture();i.multiBuilding.reference.gross='4000';const r=run(i),s=collectiveDelivery({input:i,result:r,district:'新北市',name:'分棟驗收'});assert.equal(s.kind,'分棟建築評估');assert(s.sections.some(x=>x.title==='分棟面積'));assert(s.sections.some(x=>x.title==='共用地下室'));assert(s.sections.some(x=>x.title.startsWith('參考文件面積比對')));assert(s.issues.some(x=>x.includes('分配文件')));assert(!JSON.stringify(s).includes('NaN'));});
test('mutually exclusive award routes remain enforced',()=>{const i=fixture();i.danger='26';i.regulatoryReview.bonusAssessment.route='danger';const r=run(i);assert.deepEqual(r.errors,[]);assert.equal(r.values.renewalApplied,0);assert.equal(r.values.dangerApplied,26);assert.equal(r.values.allowed,4800*1.51);});
test('legacy result is identical with disabled multi model',()=>{const i=fixture();delete i.multiBuilding;const before=run(i);i.multiBuilding={...newMultiBuilding(),enabled:false};const after=run(i);assert.deepEqual(after.values,before.values);assert.deepEqual(after.errors,before.errors);});
test('document unit list is a separate audit and never replaces model sale',()=>{const i=fixture(),r=run(i);i.multiBuilding.registration={source:'合成逐戶清冊',rows:[{label:'A棟2F-A1',ping:'20.123456'},{label:'A棟2F-A2',ping:'30.654321'}]};const s=run(i);assert.deepEqual(s.values,r.values);assert(Math.abs(s.multiBuilding.registration.salePing-50.777777)<1e-10);assert(s.multiBuilding.checks.some(x=>x.includes('戶數不同')));const report=collectiveDelivery({input:i,result:s,name:'合成',district:'新北市'});assert(report.sections.some(x=>x.title==='逐戶文件面積加總'));i.multiBuilding.registration.rows.push({label:'A棟2F-A1',ping:'3'});assert(run(i).errors.length);});
test('one building cannot reuse shared basement equipment allowance per floor',()=>{const i=fixture();i.multiBuilding.basements[0].cars='0';i.multiBuilding.basements[0].car='0';i.multiBuilding.basements[0].equipment='580';i.multiBuilding.basements[0].ramp='0';i.multiBuilding.basements[0].other='20';const second={...structuredClone(i.multiBuilding.basements[0]),id:'B2',level:'2'};i.multiBuilding.basements.push(second);const r=run(i);assert(r.multiBuilding.below.globalEquipmentExempt<=r.multiBuilding.equipmentCap-r.multiBuilding.above.equipmentExempt+1e-9);assert.equal(r.values.basement,1200);});
test('changing only stair counts does not invent floor area',()=>{const i=fixture(),r=run(i);i.multiBuilding.buildings[0].stairs='1';const s=run(i);assert.deepEqual(s.values,r.values);assert(s.multiBuilding.checks.some(x=>x.includes('樓梯數')));});

test('multi comparison uses actual floor quantities and carries pending data',()=>{const i=fixture(),r=run(i),s={input:i,result:r};i.unitPing='999';assert.equal(comparisonMetrics.find(m=>m.label==='每戶地上分攤').value(s),3360*.3025/32);assert.equal(comparisonMetrics.find(m=>m.label==='平面車位').value(s),15);assert(collectiveDisplayNotes(i,r).includes(r.multiBuilding.pending[0]));i.multiBuilding.uncertainties=['缺少分配表'];const t=run(i);assert.equal(collectiveDelivery({input:i,result:t}).status,'可售面積驗收尚未完成');});


test('roof that fails height or use qualification consumes FAR without changing physical area',()=>{
 const i=fixture(),r=run(i);i.multiBuilding.buildings[0].roof.height='4';const s=run(i);
 assert.equal(s.values.totalWithoutBalcony,r.values.totalWithoutBalcony);
 assert.equal(s.values.roofCounted,120);assert.equal(s.values.aboveCounted-r.values.aboveCounted,120);
 assert(s.multiBuilding.checks.some(x=>x.includes('暫計入容積')));
 i.multiBuilding.buildings[0].roof.height='3';i.multiBuilding.buildings[0].roof.qualified=false;
 assert.equal(run(i).values.roofCounted,120);
});
test('roof projection and aggregate shared-building cap are checked',()=>{
 const i=fixture();i.multiBuilding.buildings[0].roof.projection='60';
 const r=run(i);assert.equal(r.values.roofCounted,180);assert(r.multiBuilding.checks.some(x=>x.includes('投影超過')));
});
test('a shared podium wider than towers participates in site coverage check',()=>{
 const i=fixture(),b=i.multiBuilding.buildings[0];b.floors[0].from='2';
 i.multiBuilding.sharedFloors=[{...newFloorGroup(),from:'1',to:'1',area:'900',members:[b.id]}];
 const r=run(i);assert(r.multiBuilding.checks.some(x=>x.includes('全案建築投影')));
});
test('housing basement common area cannot take car-serving ramp area',()=>{
 const i=fixture();i.multiBuilding.basements[0].houseCommon='101';
 assert(run(i).errors.some(x=>x.includes('扣除汽車與其服務車道')));
});
test('individual document versions remain separate and cannot change quantities',()=>{
 const i=fixture(),r=run(i);i.multiBuilding.basis='schedule';i.multiBuilding.referenceVersions=[{title:'舊版',source:'合成舊版面積表',gross:'4000',salePing:'1000',allowed:'8400'}];
 const s=run(i);assert.deepEqual(s.values,r.values);assert.equal(s.multiBuilding.referenceSets.length,2);assert.equal(s.multiBuilding.referenceSets[1].rows[0].expected,4000);
 const report=collectiveDelivery({input:i,result:s,district:'新北市'});
 assert(report.sections.some(x=>x.title==='參考文件面積比對｜舊版'));
 assert(report.conditions.find(x=>x[0]==='獎勵與容移')[1].includes('都更50%'));
 assert(!report.conditions.find(x=>x[0]==='獎勵與容移')[1].includes('危老'));
 assert(report.conditions.some(x=>x[1]==='依圖說逐層核算'));
});
test('blank numeric field has an exact record key for focus navigation',()=>{
 const i=fixture(),b=i.multiBuilding.buildings[0],row=b.floors[0];row.area='';const r=run(i);
 assert(r.errors.length);assert.equal(r.multiBuilding.fieldIssues.find(x=>x.message.includes('樓板')).field,row.id+':area');
});
test('malformed stair counts and duplicate shared members fail safely',()=>{
 const i=fixture();i.multiBuilding.buildings[0].stairs='infinite';assert(run(i).errors.length);
 const j=fixture(),b=j.multiBuilding.buildings[0];j.multiBuilding.sharedFloors=[{...newFloorGroup(),members:[b.id,b.id]}];assert(run(j).errors.length);
});
