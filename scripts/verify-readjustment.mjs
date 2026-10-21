import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as web from '../src/land-evaluation/generated/readjustment.mjs';
const root=resolve(import.meta.dirname,'..'),manifest=JSON.parse(await readFile(resolve(root,'src/land-evaluation/generated/readjustment-manifest.json'),'utf8'));
for(const s of manifest.sources)assert.equal(createHash('sha256').update(await readFile(resolve(manifest.sourceRoot,s.path))).digest('hex'),s.sha256);
const shared=await import(pathToFileURL(resolve(manifest.sourceRoot,'src/cases/land-readjustment/model.mjs')).href);
let checks=0;
const land={parcels:[{id:'p1',areaSqm:'1000',city:'新北市',section:'模擬段',landNumber:'模擬001',status:'assumed'}]};
const base=(system='public')=>({...web.newReadjustmentPlan('test',system),planName:'記憶體模擬計畫',stage:'processing',parcelIds:['p1'],parcelRights:{p1:{includedArea:'1000',shareNumerator:'1',shareDenominator:'2',source:'模擬逐筆權利範圍',date:'2026-10-21'}},shareNumerator:'1',shareDenominator:'2',scopeSource:'模擬持分文件',membership:'in',membershipSource:'模擬範圍文件',membershipDate:'2026-10-21'});
function evaluate(p,a=land){const r=web.evaluateReadjustment(p,a);assert.deepEqual(r,shared.evaluateReadjustment(p,a));checks++;return r;}
for(const system of Object.keys(web.systems))for(const track of Object.keys(web.perspectives)){const p={...base(system),track};const r=evaluate(p);assert.equal(r.rightsArea,500);assert(r.canRecord);assert(!r.canConfirm);assert(r.pending>0);assert.equal(r.allocationArea,null);if(track==='acquisition')assert(r.findings.some(x=>x.id==='target'));}
let p=base();Object.assign(p,{allocationMode:'average',burdenRate:'40',areaSource:'模擬平均負擔情境'});let r=evaluate(p);assert.equal(r.allocationArea,300);assert.match(r.areaLabel,/假設/);assert(!r.canCreateLand);
assert.equal(evaluate({...p,burdenRate:'0'}).allocationArea,500);assert.equal(evaluate({...p,burdenRate:'100'}).allocationArea,0);assert(evaluate({...p,burdenRate:'101'}).errors.length);assert(evaluate({...p,burdenRate:'-2'}).errors.length);
assert.equal(evaluate({...p,system:'expropriation'}).allocationArea,null);
for(const [n,d] of [['2','1'],['0','1'],['1','0'],['1.5','2']])assert(evaluate({...p,parcelRights:{p1:{...p.parcelRights.p1,shareNumerator:n,shareDenominator:d}}}).errors.length);
assert.equal(evaluate({...p,parcelRights:{p1:{...p.parcelRights.p1,shareNumerator:''}}}).rightsArea,null);
assert.equal(evaluate(p,{parcels:[{...land.parcels[0],areaSqm:''}]}).allocationArea,null);
assert(evaluate({...p,parcelIds:['p1','p1']}).errors.length);assert(evaluate({...p,parcelIds:['missing']}).errors.length);
const checked=(p)=>({...p,stage:'allocation',buildability:'conditional',evidence:Object.fromEntries(web.documentItems(p.system,p.track).map(d=>[d.id,{state:'reviewed',source:'模擬本案文件 '+d.title,date:'2026-10-21'}]))});
const doc={...checked(base()),allocationMode:'document',area:'280',areaSource:'模擬核定表第3頁，本方案持分',areaDate:'2026-10-21',areaStatus:'documented'};
r=evaluate(doc);assert.equal(r.allocationArea,280);assert(r.canCreateLand);
assert.equal(evaluate({...doc,areaSource:''}).allocationArea,null);assert(!evaluate({...doc,areaDate:'2026-02-30'}).canCreateLand);assert(!evaluate({...doc,areaStatus:'assumed'}).canCreateLand);
assert.equal(evaluate({...doc,membership:'out'}).allocationArea,null);assert(!evaluate({...doc,membership:'unknown'}).canCreateLand);
assert(evaluate({...doc,minimumArea:'300',minimumSource:'模擬街廓規定'}).findings.some(x=>x.id==='minimum'&&x.state==='review'));
assert(!evaluate({...doc,track:'acquisition'}).canCreateLand);
const reviewedBuy={...doc,track:'acquisition',target:'land',tradeDate:'2026-10-21',rightState:'exists',transfer:'reviewed',handled:'模擬義務已覆核',evidence:{...doc.evidence,succession:{state:'reviewed',source:'模擬契約與承接審查',date:'2026-10-21'}}};assert(evaluate(reviewedBuy).canCreateLand);assert(!evaluate({...reviewedBuy,target:'invalid-target'}).canCreateLand);assert(!evaluate({...reviewedBuy,evidence:{succession:{...reviewedBuy.evidence.succession,state:'excluded'}}}).canCreateLand);
const buy={...doc,track:'acquisition',tradeDate:'2026-10-21',target:'land',rightState:'terminated'};
r=evaluate(buy);assert(r.blocked);assert.equal(r.allocationArea,null);assert(!r.canCreateLand);assert(r.findings.some(x=>x.id==='terminated'));
assert(evaluate({...buy,target:'award',transfer:'unknown'}).findings.some(x=>x.id==='transfer'&&x.state==='pending'));
assert(evaluate({...doc,referenceDate:'2027-01-01'}).findings.some(x=>x.id==='future'));
for(const plan of web.publishedPlans){const edition=plan.versions[0];const x={...base(plan.system),catalogId:plan.id,catalogVersion:edition.id};r=evaluate(x);assert(r.findings.some(x=>x.id==='plan-scope'));assert(r.findings.some(x=>x.id==='plan-version'));assert(r.findings.some(x=>x.id==='catalog-review'));if(['planning','suspended'].includes(plan.publicationState))assert(r.blocked);assert.equal(r.allocationArea,null);assert(!r.findings.some(x=>x.id==='plan-burden'&&x.state==='recorded'));assert(evaluate({...x,system:plan.system==='public'?'private':'public'}).errors.length);}
assert.equal(web.publishedPlans.length,94);assert.equal(web.catalogCoverage.datasetRows,85);assert.equal(web.publishedPlans.filter(x=>['planning','suspended'].includes(x.publicationState)).length,7);assert.equal(new Set(web.publishedPlans.map(x=>x.id)).size,94);assert.equal(new Set(web.publishedPlans.map(x=>x.system)).size,3);
// Inventory is not approval: creating a land draft needs a reviewed applicable edition.
const indexed={...doc,catalogId:'ntpc-wenzizun-1',catalogVersion:'inventory-20261021',evidence:{...doc.evidence,version:{state:'available',source:'模擬原件',date:'2026-10-21'}},planChecks:Object.fromEntries(web.getPublishedPlan('ntpc-wenzizun-1','inventory-20261021').edition.conditions.map(c=>[c.id,{state:'reviewed',source:'模擬個案適用 '+c.title,date:'2026-10-21'}]))};
assert(!evaluate(indexed).canCreateLand);assert(evaluate({...indexed,evidence:{...doc.evidence,version:{state:'reviewed',source:'模擬本案書圖、修正沿革與適用版本覆核',date:'2026-10-21'}}}).canCreateLand);
assert(!evaluate({...indexed,evidence:{...doc.evidence,version:{state:'excluded',source:'模擬不適用不能代替版本覆核',date:'2026-10-21'}}}).canCreateLand);
assert(!evaluate({...indexed,evidence:{...doc.evidence,version:{state:'available',source:'模擬',date:'2026-10-21'}}}).canCreateLand);
assert(!evaluate({...doc,parcelIds:[],manualArea:'1000',manualSource:''}).canConfirm);
assert(!evaluate({...doc,stage:'fabricated'}).canConfirm);
assert(evaluate({...doc,parcelRights:{p1:{...doc.parcelRights.p1,shareNumerator:'-1'}}}).errors.length);
// Independent date and rights oracles; incomplete records remain distinct from confirmation.
for(const key of ['areaDate','membershipDate']){
 const invalid=evaluate({...doc,[key]:'2099-01-01'});assert(invalid.errors.length);assert(!invalid.canConfirm);assert(!invalid.canCreateLand);assert.equal(invalid.allocationArea,null);
}
assert(!evaluate({...doc,referenceDate:'2020-01-01'}).canConfirm);
assert(!evaluate({...doc,evidence:{...doc.evidence,ownership:{...doc.evidence.ownership,date:'2099-01-01'}}}).canCreateLand);
assert(!evaluate({...doc,parcelRights:{p1:{...doc.parcelRights.p1,date:'2099-01-01'}}}).canCreateLand);
assert(!web.evidenceReady({state:'reviewed',source:'文件',date:'2026-10-21'},'2026-10-20'));
assert(!web.evidenceReady({state:'reviewed',source:'文件',date:'2099-01-01'}));
const multiLand={parcels:[{...land.parcels[0]},{id:'p2',areaSqm:'2000'}]};
const multi={...doc,parcelIds:['p1','p2'],parcelRights:{p1:{includedArea:'600',shareNumerator:'1',shareDenominator:'2',source:'模擬第一筆範圍及持分',date:'2026-10-21'},p2:{includedArea:'1200',shareNumerator:'1',shareDenominator:'3',source:'模擬第二筆範圍及持分',date:'2026-10-21'}}};
const mr=evaluate(multi,multiLand);assert.equal(mr.registeredArea,3000);assert.equal(mr.includedArea,1800);assert.equal(mr.rightsArea,700);assert(mr.canConfirm);assert(mr.canCreateLand);
assert.equal(evaluate({...multi,allocationMode:'average',burdenRate:'40'},multiLand).allocationArea,420);
assert(!evaluate({...multi,parcelRights:{...multi.parcelRights,p2:{...multi.parcelRights.p2,includedArea:'2001'}}},multiLand).canConfirm);
assert(!evaluate({...multi,parcelRights:{...multi.parcelRights,p2:{...multi.parcelRights.p2,source:''}}},multiLand).canConfirm);
const legacy=evaluate({...doc,parcelRights:undefined});assert.equal(legacy.rightsArea,null);assert(legacy.canRecord);assert(!legacy.canConfirm);assert(!legacy.canCreateLand);
assert(!evaluate(doc,{parcels:[{...land.parcels[0],status:'conflict'}]}).canConfirm);
assert(!evaluate(doc,{parcels:[{...land.parcels[0],evidenceDate:'2099-01-01'}]}).canCreateLand);
const missingArea=evaluate(doc,{parcels:[{...land.parcels[0],areaSqm:''}]});assert(!missingArea.canConfirm);assert(!missingArea.canCreateLand);
for(const patch of [{planName:''},{stage:'unknown'},{stage:'processing'},{membership:'unknown'},{buildability:'unknown'},{buildability:'no'},{scopeSource:''},{areaStatus:'assumed'},{referenceDate:'2027-01-01'}])assert(!evaluate({...doc,...patch}).canCreateLand);
for(const id of ['version','boundary','ownership','allocationRules','plan','individual'])assert(!evaluate({...doc,evidence:{...doc.evidence,[id]:{state:'excluded',source:'模擬不適用',date:'2026-10-21'}}}).canConfirm);
const partial=evaluate({...doc,evidence:{}});assert(partial.canRecord);assert(!partial.canConfirm);assert(!partial.canCreateLand);
for(const system of Object.keys(web.systems))for(const track of Object.keys(web.perspectives)){
 let complete=checked({...doc,system,track});if(track==='acquisition')complete={...complete,target:'land',tradeDate:'2027-01-01',rightState:'exists',transfer:'reviewed',handled:'模擬承接義務'};
 if(system==='expropriation')complete={...complete,compensationChoice:'land',applicationState:'approved'};
 const cr=evaluate(complete);assert(cr.canConfirm);assert(cr.canCreateLand);
}
for(const c of web.publishedPlans){assert(c.source.startsWith('https://'));assert(c.audit.fullReview===false);if(c.versions[0].id==='review-20261021'){assert.equal(c.versions[0].publishedAt,c.assessmentReview.publicationDate??null);assert(c.versions[0].conditions.some(r=>r.id==='current-lineage'));assert(!c.assessmentReview.latestVerified);}else assert(c.versions[0].publishedAt===null);assert(c.audit.gaps.length);for(const d of c.versions[0].documents){assert(d.url.startsWith('https://'));if(d.retrieved&&d.sha256)assert.match(d.sha256,/^[a-f0-9]{64}$/);}}
// Every original dataset row must occur exactly once, even when detailed project aliases differ.
for(const ds of web.catalogCoverage.datasets){const rows=web.publishedPlans.flatMap(p=>p.evidenceRows??[]).filter(r=>r.dataset===ds.title).map(r=>r.row).sort((a,b)=>a-b);assert.deepEqual(rows,Array.from({length:ds.rows},(_,i)=>i+1));}
assert.equal(web.publishedPlans.find(p=>p.name.includes('灣潭')).evidenceRows[0].note.includes('0980151290'),true);
assert(web.publishedPlans.find(p=>p.id==='ntpc-public-8778').versions[0].documents.some(d=>d.category==='amendment'&&d.reviewNote));
const original=base(),sig=web.readjustmentSignature(original,land);assert.notEqual(sig,web.readjustmentSignature({...original,track:'acquisition'},land));assert.notEqual(sig,web.readjustmentSignature(original,{parcels:[{...land.parcels[0],areaSqm:'1100'}]}));assert.equal(sig,web.readjustmentSignature(original,{parcels:[...land.parcels,{id:'unselected',areaSqm:'3'}]}));
assert(!web.evidenceReady({state:'reviewed',source:'',date:'2026-10-21'}));assert(!web.evidenceReady({state:'available',source:'文件',date:'2026-10-21'}));assert(web.evidenceReady({state:'reviewed',source:'文件',date:'2026-10-21'}));
for(const file of ['src/land-evaluation/generated/readjustment.mjs','src/land-evaluation/ReadjustmentWorkbench.jsx']){const text=await readFile(resolve(root,file),'utf8');assert(!/localStorage|sessionStorage|indexedDB|@tauri|fetch\(|land-finance/.test(text));assert(!/貸款成數|年利率|收購總價|IRR|XIRR/.test(text));}
const jsx=await readFile(resolve(root,'src/land-evaluation/LandWorkbench.jsx'),'utf8');assert(jsx.includes('ReadjustmentWorkbench key={a.caseId}'));assert(jsx.includes("hidden={section!=='readjustment'}"));assert(jsx.includes("newLandFact('unknown')"));
const qa=resolve(root,'qa/readjustment');await mkdir(qa,{recursive:true});await writeFile(resolve(qa,'verification.json'),JSON.stringify({checks,systems:3,tracks:2,catalogEntries:web.publishedPlans.length,version:web.READJUSTMENT_VERSION,catalogVersion:web.CATALOG_VERSION,scope:'preliminary conditions, rights and area only',verifiedAt:new Date().toISOString()},null,2)+'\n');
console.log(`PASS ${checks} shared/App-web result parity cases; independent scope/share/area/rights/catalog/stale/zero/unknown assertions; no finance or persistence.`);
