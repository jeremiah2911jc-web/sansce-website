import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {evaluate,createInput,exampleInput} from '../src/land-evaluation/model.mjs';
import {calculatePlanning,defaultPlanningInput,newParkingDesign,defaultSmallSiteParking,defaultBasementDemand} from '../src/land-evaluation/generated/core.mjs';
const root=resolve(import.meta.dirname,'..'),qa=resolve(root,'qa');await mkdir(qa,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'src/land-evaluation/generated/source-manifest.json'),'utf8'));
for(const source of manifest.sources){const bytes=await readFile(resolve(manifest.sourceRoot,source.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,'App source has changed: '+source.path);}
const {build}=createRequire(resolve(manifest.sourceRoot,'package.json'))('esbuild');
const output=resolve(qa,'app-reference.mjs');
await build({stdin:{contents:`export {calculatePlanning} from '${manifest.sourceRoot}/src/lib/planning/autonomousPlanning.ts';export {newBonusAssessment} from '${manifest.sourceRoot}/src/lib/planning/bonusAssessment.ts';export {newTdrApplication} from '${manifest.sourceRoot}/src/lib/planning/tdrApplication.ts'`,resolveDir:manifest.sourceRoot},outfile:output,bundle:true,platform:'node',format:'esm',target:'es2020',legalComments:'none'});
const {calculatePlanning:appCalculate,newBonusAssessment,newTdrApplication}=await import(pathToFileURL(output).href+'?'+Date.now());
const a=exampleInput(),variants=[['新北一般',a],['無獎勵',{...a,renewal:'0',tdr:'0'}],['容移25%',{...a,tdr:'25'}],['地下三層',{...a,basementFloors:'3'}],['地下不足',{...a,basementFloors:'1',extraCars:'200'}],['一般屋突',{...a,quantityReserve:{...a.quantityReserve,roofEnvelope:{...a.quantityReserve.roofEnvelope,classification:'ordinary'}}}],['不符屋突用途',{...a,quantityReserve:{...a.quantityReserve,roofEnvelope:{...a.quantityReserve.roofEnvelope,qualifiedUses:false}}}],['超高屋突',{...a,roofHeight:'4'}],['臺北通則',{...a,parkingDesign:newParkingDesign('臺北市','', 'yes')}],['個案規則未確認',{...a,parkingDesign:{...a.parkingDesign,mode:'case',rule:'unresolved'}}],['道路已知不符',{...a,roadConditions:{...a.roadConditions,openedWidth:'4',frontage:'4',status:'confirmed',checkedAt:'2026-10-19',source:'測試資料'}}],['變更登記比例',{...a,basementSalePercent:'50'}]];
const smallFixture=JSON.parse(await readFile(resolve(manifest.sourceRoot,'docs/small-site-centre-road-result.json'),'utf8'));
variants.push(['中心四路升降機機械',smallFixture.input],['中心四路升降機平面',smallFixture.flat.input],['小基地法規不符',{...smallFixture.input,parkingDesign:{...smallFixture.input.parkingDesign,smallSite:{...smallFixture.input.parkingDesign.smallSite,waitingWidth:5}}}],['臺北升降機機械',{...smallFixture.input,tdr:'0',parkingDesign:{...smallFixture.input.parkingDesign,district:'臺北市中山區'}}]);
const yc=defaultPlanningInput({input:{siteAreaSqm:'471',buildingCoverageRatePercent:'45',baseFarRatePercent:'225',urbanRenewalBonusRatePercent:'0',tdrBonusRatePercent:'19.9',district:'臺北市南港區',landIdentifier:''}});
delete yc.basementDemand;yc.excavation='80';yc.regulatoryReview.bonusAssessment={...newBonusAssessment(),tdrApplication:{...newTdrApplication('taipei'),quantityBasis:'permitted',permittedSqm:'211.93',permittedSource:'108建字0209號附表註22及108年5月1日北市都新字1076014731函；歷史建物來源由使用者確認',stage:'permitted'}};
variants.push(['玉成大賞既有許可19.9%',yc]);
const ycr=evaluate(yc);assert.deepEqual(ycr.errors,[]);assert(ycr.values.totalWithoutBalcony>0);assert.equal(ycr.values.cars,6);
await writeFile(resolve(qa,'yucheng-permit-comparison.json'),JSON.stringify({input:yc,result:ycr,permitTotal:2801.95,differenceSqm:Number((ycr.values.totalWithoutBalcony-2801.95).toFixed(2)),note:'GUI independently verified in installed App and website; 80% excavation and 4 basements are planning assumptions, no ground parking or target car count'},null,2));
const demandFixture=JSON.parse(await readFile(resolve(manifest.sourceRoot,'docs/yucheng-basement-demand-result.json'),'utf8'));variants.push(['玉成大賞基地限制與倉儲式需求檢討',demandFixture.input]);assert.deepEqual(evaluate(demandFixture.input),appCalculate(demandFixture.input));
const d=demandFixture.input,copy=()=>structuredClone(d);
const restrictions=[['已知禁止替代停車',x=>{x.parkingDesign.smallSite={...defaultSmallSiteParking(),localReview:'failed',reviewSource:'測試個案禁止'};}],['搜尋不得忽略全部採用',x=>{x.parkingDesign.fillRemaining=true;}],['危老不得沿用一般南港',x=>{x.basementDemand.rule='nangang_general';}],['核准基準變更',x=>{x.site='472';}],['核准來源缺漏',x=>{x.regulatoryReview.bonusAssessment.permittedAward.source='';}],['南港資格來源缺漏',x=>{x.basementDemand.source='';}]];
for(const [name,patch] of restrictions){const x=copy();patch(x);assert.equal(evaluate(x).values,null,name);variants.push([name,x]);}
let x=copy();x.parkingDesign.rowMode='single';assert(Math.abs(evaluate(x).parking.values.motoModule-3.06)<1e-10);variants.push(['臺北單排機車',x]);
x=copy();x.parkingDesign.smallSite={...defaultSmallSiteParking(),shaftWidth:2};const shaftResult=evaluate(x);assert(shaftResult.values);assert.equal(shaftResult.parking.values.smallSite.access,'ramp');assert.equal(shaftResult.basementDemandReview.resolved.parkingDesign.smallSite.shaftWidth,2);variants.push(['機道尺寸保留並排除不符升降機',x]);
x=copy();x.regulatoryReview.bonusAssessment.date='2027-06-01';assert.equal(evaluate(x).values.allowed,1695.58);variants.push(['既有核准不依新申請期限重算',x]);
assert.equal(evaluate(d).values.totalWithoutBalcony,2805.45);assert.equal(evaluate(d).values.cars,16);assert.equal(evaluate(d).values.floors,2);
for(const [name,patch] of [['地面已知不可留設',{available:false}],['地面面積不足',{areaCap:140}],['無障礙通路不足',{routeWidth:1.2}],['地面核心不能消失',{otherArea:0}]]){x=copy();x.parkingDesign.smallSite={...defaultSmallSiteParking(),groundAccessibility:{available:true,routeWidth:1.5,routeLength:4,otherArea:54,...patch}};assert.equal(evaluate(x).parking.values.smallSite.access,'ramp');variants.push([name,x]);}
x=copy();x.parkingDesign.smallSite={...defaultSmallSiteParking(),accessibleRoute:'passenger_lift'};assert.equal(evaluate(x).parking.values.groundCars,1);variants.push(['舊客梯假設不得繞過地面無障礙',x]);
x=copy();x.parkingDesign.smallSite={...defaultSmallSiteParking(),groundAccessibility:{available:false,routeWidth:1.5,routeLength:4,otherArea:54},access:'lift',mechanical:true,mechanicalType:'warehouse'};delete x.basementDemand;x.excavation='70';x.basementFloors='2';assert.equal(evaluate(x).values,null);variants.push(['固定升降機地面不可留設阻擋',x]);
x=copy();x.quantityReserve.passengerLiftCount=2;x.quantityReserve.sharedEmergencyLift=false;assert.equal(evaluate(x).parking.values.equipmentArea,180);variants.push(['兩座載人電梯另列核心',x]);
x=copy();x.quantityReserve.sharedEmergencyLift=false;assert.equal(evaluate(x).values,null);variants.push(['一座載人電梯需明示兼用功能',x]);
x=copy();x.stair='single';assert.equal(evaluate(x).values,null);variants.push(['八層以上不得誤用單一直通樓梯10%條件',x]);
const ntpcDefault=createInput();assert.equal(ntpcDefault.basementDemand.rule,'ntpc_general');assert.equal(ntpcDefault.unitPing,'25');
const ntpcAuto={...ntpcDefault,site:'1800',coverage:'50',far:'300',renewal:'50',tdr:'25'};
const ntpcAutoResult=evaluate(ntpcAuto);assert(ntpcAutoResult.values);assert.equal(ntpcAutoResult.basementDemandReview.capPercent,62.77777777777778);assert(ntpcAutoResult.basementDemandReview.source.includes('flno=37'));variants.push(['新北1800㎡自動法規上限',ntpcAuto]);
for(const [area,cap] of [['500',70],['501',50+100.1/501*100],['1000',65]]){const n={...ntpcAuto,site:area};if(evaluate(n).basementDemandReview)assert(Math.abs(evaluate(n).basementDemandReview.capPercent-cap)<1e-10);variants.push(['新北基地面積邊界'+area,n]);}
const stricter={...ntpcAuto,basementDemand:{...ntpcAuto.basementDemand,stricterCap:'60',stricterSource:'個案都市計畫第12點'}};assert.equal(evaluate(stricter).basementDemandReview.capPercent,60);variants.push(['新北較嚴格計畫60%',stricter]);
for(const [name,patch] of [['較嚴格規定不能提高',{stricterCap:'70',stricterSource:'測試'}],['較嚴格規定需來源',{stricterCap:'60',stricterSource:''}]]){const n={...ntpcAuto,basementDemand:{...ntpcAuto.basementDemand,...patch}};assert.equal(evaluate(n).values,null);variants.push([name,n]);}
const taipeiAuto={...ntpcAuto,renewal:'0',tdr:'0',parkingDesign:newParkingDesign('臺北市大安區','','unknown'),basementDemand:{...defaultBasementDemand('臺北市'),taipeiPlanUnspecified:true,taipeiZone:'res34'}};assert.equal(evaluate(taipeiAuto).basementDemandReview.capPercent,70);variants.push(['臺北市非南港依分區70%',taipeiAuto]);
for(const zone of ['res12','commercial','industrial','protected','public','other'])variants.push(['臺北市分區'+zone,{...taipeiAuto,basementDemand:{...taipeiAuto.basementDemand,taipeiZone:zone}}]);
const taipeiUnknown={...taipeiAuto,basementDemand:{...taipeiAuto.basementDemand,taipeiPlanUnspecified:false}};assert.equal(evaluate(taipeiUnknown).values,null);variants.push(['臺北都市計畫條件未選',taipeiUnknown]);
const report=[];
for(const[name,input]of variants){const upstream=appCalculate(input),web=calculatePlanning(input);assert.deepEqual(web,upstream,name);assert.deepEqual(evaluate(input),upstream,name+' website adapter');report.push({name,errors:web.errors,values:web.values,matching:true});}
const sample=defaultPlanningInput({input:{siteAreaSqm:'2359.67',buildingCoverageRatePercent:'50',baseFarRatePercent:'280',urbanRenewalBonusRatePercent:'50',tdrBonusRatePercent:'25',district:'新北市新店區',landIdentifier:''}});delete sample.basementDemand;const r=evaluate(sample);
assert.deepEqual(r.errors,[]);assert.equal(r.values.salePing,5284.53);assert.equal(r.values.totalWithoutBalcony,19230.48);assert.equal(r.values.cars,79);assert.equal(r.values.capacity,117);assert.equal(r.values.equivalentFloors,15);
assert.equal(Number((r.values.totalWithoutBalcony*.3025).toFixed(2)),5817.22);
assert.equal(evaluate(createInput()).values,null);assert.equal(evaluate({...a,site:'0'}).values,null);assert.equal(evaluate({...a,site:'1000000000000'}).values,null);
for(const name of ['core','panels']){const content=await readFile(resolve(root,'src/land-evaluation/generated',name+'.mjs'),'utf8');assert.ok(!/localStorage|sessionStorage|indexedDB|@tauri|fetch\(/.test(content));}
const ui=await readFile(resolve(root,'src/land-evaluation/LandEvaluation.jsx'),'utf8');assert.ok(!/localStorage|sessionStorage|indexedDB|fetch\(/.test(ui));
await writeFile(resolve(qa,'calculation-parity.json'),JSON.stringify({checkedAt:new Date().toISOString(),sourceFiles:manifest.sources.length,scenarios:report,suppliedAppScreenshot:{salePing:5284.53,totalFloorPing:5817.22,cars:79,capacity:117,aboveFloors:15,matching:true},emptyAndZeroBlocked:true,storageAndNetworkCallsAbsent:true},null,2));
console.log(`PASS: ${variants.length} scenarios match upstream App; supplied App screenshot matches 5 key results; empty/zero/oversized input blocked; no storage or network in tool.`);
