import {taipeiRenewalLaw,taipeiRenewalTable} from './taipei-renewal/model.mjs';
import {collectiveDisplayNotes,bonusResultRows,bonusInputVisible} from './collective-notes.mjs';
import {commercialInputs} from './summary-presentation.mjs';
import {landJudgement,readjustmentJudgement} from './judgement.mjs';
import sourceManifest from './generated/source-manifest.json' with {type:'json'};
import readjustmentManifest from './generated/readjustment-manifest.json' with {type:'json'};
import {planningFields,PLANNING_VERSION} from './generated/core.mjs';
import {RULE_VERSION,LAYOUT_VERSION,REVIEWED_AT,landRegimes,intendedUses,buildingForms,lawSources} from './generated/land.mjs';
import {systems,perspectives,READJUSTMENT_VERSION,documentItems,getPublishedPlan,formulaSources} from './generated/readjustment.mjs';
import {publicText} from './public-copy.mjs';
import {statutoryBonusLimits,bonusLimitMode} from './statutory-bonus-limits.mjs';
export function displayRuleVersion(value){const match=String(value||'').match(/(\d{4}-\d{2}-\d{2})\.(?:v)?(\d+)(?=\D|$)/i);return match?`${match[1]} · V${match[2]}`:'版本待確認';}
export const displayNumber=(n,d=2)=>typeof n==='number'&&Number.isFinite(n)?(n>0&&n<10**-d?'<'+(10**-d):n.toLocaleString('zh-TW',{maximumFractionDigits:d})):'待確認';
const text=v=>v===null||v===undefined||v===''?'未填／待確認':String(v);
const distinct=items=>[...new Set(items.filter(Boolean).map(publicText))];
const summary=(kind,title,status,ruleVersion)=>({kind,title:title||'本次評估',status,ruleVersion:ruleVersion+'／來源 '+(kind==='市地重劃／區段徵收'?readjustmentManifest:sourceManifest).sourceCommit.slice(0,8),createdAt:new Date().toISOString(),reviewedAt:REVIEWED_AT,metrics:[],conditions:[],charts:[],issues:[],assumptions:[],sources:[],inputs:[]});
export function collectiveDelivery(snapshot){
 const {input:i,result:r}=snapshot,v=r.values;if(!v)return null;
 const s=summary('集合住宅',snapshot.name,'依輸入及規劃假設試算；資格與圖說另核',PLANNING_VERSION);
 s.createdAt=snapshot.calculatedAt||s.createdAt;
 s.metrics=[['房屋可售面積',v.salePing,'坪'],['公設比（估算）',v.commonRatio,'%'],['規劃戶數',v.units,'戶'],['汽車位',v.cars,'位'],['推估地上樓層',v.equivalentFloors,'層'],['地下層數',v.floors,'層']];
 s.conditions=[['地區',snapshot.district],['基地面積',`${displayNumber(Number(i.site))}㎡`],['建蔽／基準容積',`${i.coverage}%／${r.commercialReview?displayNumber(r.commercialReview.effectiveFar)+'%（分段換算）':i.far+'%'}`],['獎勵與容移',bonusResultRows(i,v).map(([label,value])=>label+displayNumber(value)+'%').join('、')],['每戶地上分攤',`${i.unitPing}坪／戶`],['總樓地板（不含陽台）',`${displayNumber(v.totalWithoutBalcony)}㎡`]];
 s.charts=[{title:'容積使用',unit:'㎡',note:'以同一允建容積為範圍；正值小於0.01㎡時另作標示。',rows:[['地上計容',v.aboveCounted],['地下計容',v.basementCounted],['未使用容積',v.unused]]},{title:'樓地板構成',unit:'㎡',note:'此圖含陽台；與不含陽台的總樓地板分開呈現。',rows:[['地上樓板（不含陽台）',v.aboveWithoutBalcony],['陽台',v.balcony],['地下室',v.basement]]}];
 s.assumptions=collectiveDisplayNotes(i,r);s.issues=s.assumptions.filter(x=>/待|未確認|未取得|另核|覆核|假設/.test(x));
 s.assumptions=s.assumptions.filter(x=>!s.issues.includes(x));
 s.sources=[i.roadConditions?.source,i.excavationReference,i.parkingDesign?.reference,r.basementDemandReview?.source,i.basementDemand?.source,i.basementDemand?.stricterSource].filter(Boolean);
 s.inputs=planningFields.filter(([key])=>bonusInputVisible(i,key)).map(([key,label,unit])=>[label,i[key]===''?'未填／待確認':`${text(i[key])}${unit?' '+unit:''}`]);
 s.inputs.push(['道路名稱',text(i.roadConditions?.roadName)],['計畫／開闢道路寬度',`${text(i.roadConditions?.plannedWidth)}／${text(i.roadConditions?.openedWidth)} m`],['同路段基地面寬',`${text(i.roadConditions?.frontage)} m`],['道路確認狀態',i.roadConditions?.status==='confirmed'?'已填查證，資格依檢核':i.roadConditions?.status==='assumed'?"暫用估計值，待文件確認":'待確認'],['路寬查證日期',text(i.roadConditions?.checkedAt)],['停車規則',i.parkingDesign?.mode==='general'?'地區通則初估':'本次個案條件'],['開挖率上限',r.basementDemandReview?`${displayNumber(r.basementDemandReview.capPercent)}%`:text(i.excavationCap)],['建築／容積使用比例',`${i.coverageUse}%／${i.volumeUse}%`]);
 s.inputs.push(['採用面積的計算方式','機電、梯廳、屋突及地下預留採逐層／量體檢核；固定比例設定不直接等於實際採用面積，詳計算說明。'],['梯廳淨深',({assumed:'暫按達2m初估',confirmed:'已核對達2m',failed:'不符免計資格，計容'})[i.lobbyDepth]||'待確認'],['屋頂電梯通達',i.elevator==='yes'?'依通達屋頂條件檢核':'依未通達屋頂條件檢核'],['停車方式',`${r.parking?.values?.smallSite?.access==='lift'?'汽車升降機':'依本次停車配置'}；平面${displayNumber(r.parking?.values?.flatCars)}位／機械${displayNumber(r.parking?.values?.mechanicalCars)}位`]);
 const limits=statutoryBonusLimits(i),bonus=r.regulatory?.bonus;
 if(limits&&bonus){
  const route=i.regulatoryReview.bonusAssessment.route;
  if(route==='renewal')s.inputs.push(['都更獎勵上限',`${displayNumber(bonus.renewalLimit)}%`]);
  if(v.tdrApplied>0)s.inputs.push(['容移上限',`${displayNumber(bonus.application?.capPercent??bonus.tdrLimit)}%`]);
  if(bonus.totalLimit!==null&&bonus.totalLimit!==undefined)s.inputs.push(['獎勵與容移合計上限',`${displayNumber(bonus.totalLimit)}%`]);
  s.inputs.push(['上限採用方式',bonusLimitMode(i)==='document'?'依個案文件；'+i.regulatoryReview.bonusSource:'依地區與適用法規帶入']);
  if(route==='renewal')s.sources.push('都更獎勵上限：'+limits.renewalSource);
  if(v.tdrApplied>0)s.sources.push('容移上限：'+limits.tdrSource);
 }
 const taipei=r.regulatory?.bonus?.assessment?.taipei;
 if(taipei?.active){
  s.conditions.push(['臺北地方獎勵法規依據','112年9月18日附表；查核日期2026-11-02'],['臺北地方都更獎勵',`細項${displayNumber(taipei.raw,4)}%，倍率${taipei.multiplier}，採${displayNumber(taipei.applied,4)}%；地方上限${taipei.localCap}%，中央與地方合計上限${displayNumber(taipei.totalCap,4)}%`]);
  s.inputs.push(...taipei.rows.map(row=>[row.title,`${displayNumber(row.percent,4)}%／${displayNumber(row.quantity,4)}㎡；${row.basis} ${row.status}`]));
  const local=i.regulatoryReview?.bonusAssessment?.taipei;
  s.inputs.push(['臺北地方獎勵資料',`${({estimate:'依規劃條件估算',documented:'文件記載',verified:'已依文件與圖說核對'})[local?.evidence]||'待確認'}；${local?.source||'文件待補'}；${local?.sourceDate||'日期待補'}`]);
  if(local?.separationSource)s.inputs.push(['獎勵範圍劃分',local.separationSource]);
  if(local?.localDeduction)s.inputs.push(['地方獎勵重複面積扣除',`${local.localDeduction}㎡；${local.deductionSource||'依據待補'}`]);
  if(local?.mode==='strategy')s.inputs.push(['策略性更新依據',`更新單元${local.unitArea}㎡；${local.capRoute==='twoBase'?'採2倍基準容積上限':`採合法原容積${local.originalVolume}㎡加0.5倍基準容積；${local.originalSource}`}`]);
  s.sources.push('臺北市都市更新建築容積獎勵辦法：'+taipeiRenewalLaw,'112年9月18日附表：'+taipeiRenewalTable);
  s.issues=distinct([...s.issues,...taipei.errors]);
 }
 if(i.commercialIntensity?.enabled){s.inputs.push(...commercialInputs(i.commercialIntensity),['商業分區基準容積',displayNumber(r.commercialReview?.base)+'㎡']);s.sources.push(i.commercialIntensity.planSource,i.commercialIntensity.useSource,i.commercialIntensity.boundarySource,i.commercialIntensity.documentSource);}
 return s;
}
export function landDelivery(a,review){
 const r=review.result,s=summary('土地用途與變更','土地用途與變更初核','依逐筆土地及用途條件初核，非許可結果',RULE_VERSION);
 s.judgement=landJudgement(a,r);
 const findings=r.parcels.flatMap(p=>p.findings),states={conditional:'條件對照',pending:'待補資料',blocked:'目前不符',review:'專案覆核'};
 s.metrics=[['土地筆數',a.parcels.length,'筆'],['已填登記面積',a.parcels.filter(p=>p.areaSqm!==''&&Number.isFinite(Number(p.areaSqm))).reduce((t,p)=>t+Number(p.areaSqm),0),'㎡'],['面積待補',a.parcels.filter(p=>!p.areaSqm).length,'筆']];
 s.conditions=[['土地管制體系',landRegimes[a.entry]||a.entry],['預定用途',intendedUses[a.intendedUse]||a.intendedUse],['配置形式',buildingForms[a.buildingForm]||a.buildingForm],['目標與限制',text(a.targetNote)]];
 s.charts=[{title:'用途檢核項目',unit:'項',note:'呈現各項檢核狀態的數量，並非通過率或開發成功率。',rows:Object.entries(states).map(([key,label])=>[label,findings.filter(f=>f.status===key).length])}];
 s.sources=lawSources.filter(source=>findings.some(f=>f.sources?.includes(source.id))).map(source=>`${source.title}（${source.locator}；${source.version}）：${source.url}`);
 s.issues=distinct(findings.filter(f=>f.status!=='conditional').map(f=>f.title+'：'+f.detail));s.assumptions=distinct(r.warnings||[]);
 for(const p of a.parcels){const name=[p.city,p.district,p.section,p.subsection,p.landNumber].filter(Boolean).join(' ')||'識別待填土地';s.inputs.push([name,`登記面積${text(p.areaSqm)}㎡；${landRegimes[p.regime]||p.regime}；${p.zone||'分區待確認'}；${p.designation||'編定待確認'}；現況${p.currentUse||'待確認'}；查證日期${p.evidenceDate||'未填'}；資料${({verified:'已填查證依據',pending:'待確認',conflict:'來源衝突'})[p.status]||'待確認'}`]);if(p.source)s.sources.push(name+'：'+p.source);if(p.approvedPlan)s.inputs.push([name+'核定及限制',p.approvedPlan]);if(p.restrictions)s.inputs.push([name+'其他限制',p.restrictions]);}
 for(const [key,label] of [['applicationDate','預定申請日期'],['regimeSource','制度查證依據'],['scopeEvidence','累計規模依據'],['units','規劃戶數'],['scopeAreaSqm','全案開發範圍（㎡）'],['adjacentUnits','累計戶數'],['adjacentAreaSqm','累計面積（㎡）'],['applicantSource','申請人資格依據']])s.inputs.push([label,text(a.legalInputs?.[key])]);
 for(const p of r.parcels)for(const f of p.findings.filter(f=>f.status==='conditional'))s.inputs.push([p.identity+'／'+f.title,f.detail]);
 return s;
}
export function layoutDelivery(input,a,r,presentation){
 if(!presentation.showAreas||r.stale)return null;
 const s=summary('透天配置',input.name,presentation.status,LAYOUT_VERSION);
 s.metrics=[['總樓板',r.gross,'㎡'],['計容樓板',r.counted,'㎡'],['免計樓板',r.exempt,'㎡'],['住宅棟數',r.units,'棟'],['停車位',r.parking,'位'],['全案土地坪效',r.landEfficiency,'倍']];
 s.conditions=[['配置形式',input.form==='row'?'聯排透天':'單棟透天'],['土地面積',`${displayNumber(r.landArea)}㎡`],['建築基地',`${displayNumber(r.baseArea)}㎡`],['登記面積分類','房屋專有、共有、停車與未分配面積分列']];
 s.charts=[{title:'樓板計容分類',unit:'㎡',note:'計容與免計共同構成本次總樓板。',rows:[['計容',r.counted],['免計',r.exempt]]},{title:'登記分項估計',unit:'㎡',note:'房屋專有、共有、停車及未分配面積分列；可售面積另依用途與分配文件確認。',rows:[['房屋專有',r.privateArea],['房屋共有',r.commonArea],['停車分攤',r.parkingArea],['未分配',r.unassigned]]}];
 s.issues=distinct([...r.errors,...r.pending]);s.assumptions=distinct(r.warnings);
 for(const g of input.groups){s.inputs.push([g.name||'土地分組',`基地${g.baseArea}㎡；建蔽${g.coverage}%／容積${g.far}%；上限${g.maxFloors}層／${g.maxHeight}m；${g.basis==='after_change'?'變更後情境':'現況情境'}`],['配置範圍與退縮',`${g.width}×${g.depth}m；前${text(g.front)}／後${text(g.back)}／左${text(g.left)}／右${text(g.right)}m`]);if(g.conditionsSource)s.sources.push(`${g.name||'分組'}：${g.conditionsSource}（${g.conditionsDate||'日期未填'}）`);for(const h of g.houses)for(const f of h.floors)s.inputs.push([`${h.name}／${f.name}`,`樓板${f.area}㎡；層高${f.height}m；${f.source||'依本次輸入'}`]);}
 return s;
}
export function readjustmentDelivery(p,land,r){
 const s=summary('市地重劃／區段徵收',p.name,r.status,READJUSTMENT_VERSION);s.judgement=readjustmentJudgement(p,land,r);
 s.metrics=[['納入面積',r.includedArea,'㎡'],['持分換算權利範圍',r.rightsArea,'㎡'],[r.areaLabel,r.allocationArea,'㎡'],['待確認條件',r.pending,'項'],['已記錄文件依據',r.recorded,'項']];
 s.conditions=[['制度／主線',`${systems[p.system]}／${perspectives[p.track]}`],['計畫名稱',p.planName||'待確認'],['主管機關',p.authority||'待確認'],['評估基準日',p.referenceDate],['分配面積依據',p.allocationMode==='average'?'平均負擔假設':p.allocationMode==='document'?"文件面積或暫估面積":p.allocationMode==='statutory'?'法定公式核算':'尚無面積資料'],['確認狀態',r.canConfirm?'具備本次確認條件，機關核准仍依原件':'條件與文件仍待確認']];
 s.charts=[{title:'本案面積對照',unit:'㎡',note:'各列為不同階段或計算基準的面積，不相加；分回位置與選配另依文件。',rows:[['納入面積',r.includedArea],['持分權利範圍',r.rightsArea],[r.areaLabel,r.allocationArea]]}];
 s.issues=distinct([...r.errors,...r.findings.filter(f=>['pending','blocked','review'].includes(f.state)).map(f=>f.title+'：'+f.detail)]);
 s.assumptions=['計畫公開條件與個人權利分列；本案地號及納入面積依計畫書圖與地號清冊核對。','面積核算不等於個人核定分配或實際選配。'];
 for(const parcel of land.parcels.filter(x=>p.parcelIds.includes(x.id))){const rights=p.parcelRights?.[parcel.id]||{};s.inputs.push([[parcel.city,parcel.section,parcel.landNumber].filter(Boolean).join(' ')||'本案土地',`登記${text(parcel.areaSqm)}㎡；本案納入${text(rights.includedArea)}㎡；持分${text(rights.shareNumerator)}／${text(rights.shareDenominator)}`]);}
 for(const [key,label] of [['manualSource','手動面積依據'],['membershipDate','範圍查證日期'],['areaDate','分配文件日期'],['note','個案備註'],['manualArea','手動納入面積（㎡）'],['shareNumerator','持分分子'],['shareDenominator','持分分母'],['burdenRate','平均負擔假設（%）'],['area',"文件面積或暫估分配面積（㎡）"],['areaStatus',"分配資料性質"],['membershipSource','範圍查證依據'],['scopeSource','範圍及持分依據'],['areaSource','分配面積依據'],['minimumArea','最小分配面積（㎡）'],['minimumSource','最小分配依據'],['location','分回位置'],['zone','分回分區'],['handled','已領款項、已辦移轉與待履行義務'],['ownerConcern','地主權益重點']])if(p[key]!==''&&p[key]!==undefined)s.inputs.push([label,key==='areaStatus'?({assumed:'規劃假設',documented:'文件記載'}[p[key]]||'待確認'):text(p[key])]);
 if(p.allocationMode==='statutory'){
  const v=p.statutory||{};
  for(const [key,label] of Object.entries({generalCoefficient:'一般負擔係數B',expenseCoefficient:'費用負擔係數C',districtBurdenRate:'全區共同負擔土地比率（%）',totalArea:'徵收總面積（㎡）',ratio:'抵價地比例（%）',farmArea:'農地重劃面積（㎡）',extraRatio:'農地增加比例（%）',compensationShare:'申請補償地價占全區（%）',farmTotalCompensationShare:'農地重劃補償占全區（%）',farmCompensationShare:'農地申請補償占農地（%）',selectedPriceRatio:'配地評定單價比',usedRightPercent:'已分配權利比例（%）',date:'公式資料查證日期',source:'公式資料來源與權利範圍',comparisonArea:'文件對照分配面積（㎡）',comparisonSource:'文件對照來源',differenceReason:'面積差異原因'}))if(v[key]!==undefined)s.inputs.push([label,text(v[key])]);
  for(const [i,row] of (v.rows||[]).entries())for(const [key,label] of Object.entries({name:'識別',area:'重劃前宗地面積（㎡）',numerator:'持分分子',denominator:'持分分母',appreciation:'地價上漲率A',frontWidth:'正街分配寬度S（m）',frontScale:'正面負擔尺度（m）',sideLength:'側面臨街長度（m）',sideScale:'側面負擔尺度（m）',cornerPercent:'街角側面負擔（%）',relocationRatio:'位置單價比'}))if(row[key]!==undefined)s.inputs.push([`核算第${i+1}宗／${label}`,text(row[key])]);
  for(const [i,row] of (v.blocks||[]).entries())s.inputs.push([`街廓${i+1}／${row.name||'未命名'}`,`面積${text(row.area)}㎡；評定單價比${text(row.priceRatio)}`]);
  s.sources.push(p.system==='expropriation'?formulaSources.expropriation:formulaSources.readjustment);
 }
 const published=getPublishedPlan(p.catalogId,p.catalogVersion);if(published)s.inputs.push(['採用公告版本',`${published.name}／${published.edition.label}；資料查核${published.edition.reviewedAt}`]);
 for(const [key,e] of Object.entries(p.evidence))if(e.source)s.sources.push(`${documentItems(p.system,p.track).find(x=>x.id===key)?.title||'文件依據'}：${e.source}（${e.date||'日期未填'}）`);
 s.sources.push(...[p.membershipSource,p.scopeSource,p.areaSource].filter(Boolean));return s;
}
