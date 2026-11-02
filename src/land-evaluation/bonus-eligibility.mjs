import {bonusIssueLabels} from './blocking-issue-catalog.mjs';
// Legal eligibility is checked before quantities are adopted. No storage or UI dependencies.
export const BONUS_LEGAL_VERSION='bonus-legal.2026-11-03.v2';
export const BONUS_LEGAL_REVIEWED_AT='2026-11-03';
export const bonusLabels={renewalWork:'都市更新實施措施',implementation:'都市更新實施方式',source:'本次獎勵適用依據',article7District:'第7條第1項第3款更新地區',renewalDistrict:'是否已劃定應實施更新地區',greenMinimum:'法定最低綠建築等級',agreementDoors:'更新前門牌戶數',agreementConsent:'報核時全體同意協議合建',overlap:'獎勵重複範圍核對',overlapSource:'獎勵範圍及扣除依據',renewalAreaSource:'更新地區劃定公告與基地範圍',quickExtras:'快速估算是否含危老規模獎勵',originalCap:'危老基本獎勵上限方式',originalSource:'合法原建築容積依據',dangerCategory:'危老適用建築物條件',dangerConsent:'危老全體所有權人同意',tdrResource:'公共設施或保存建物採用方式',tdrSource:'容移資格與上限路徑依據'};
export const validLegalDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const present=x=>typeof x==='string'&&!!x.trim();
export function isBonusConditions(g){
 if(g===undefined)return true;
 if(!g||typeof g!=='object'||Array.isArray(g))return false;
 const fields={renewalWork:['rebuild','rehabilitation','maintenance'],implementation:['rights','agreement','public12','other'],article7District:['yes','no'],renewalDistrict:['yes','no'],greenMinimum:['none','5','4','3','2','1'],agreementConsent:['yes','no'],overlap:['distinct','deducted'],quickExtras:['yes','no'],originalCap:['base','original115'],dangerCategory:['1','2','3'],dangerConsent:['yes','no'],tdrResource:['distinct','award','transfer']};
 return Object.entries(g).every(([k,v])=>k==='entries'?v&&typeof v==='object'&&!Array.isArray(v)&&Object.values(v).every(x=>['','yes','no','unknown'].includes(x)):Object.hasOwn(bonusLabels,k)&&typeof v==='string'&&v.length<=12000&&(!fields[k]||v===''||fields[k].includes(v)));
}
export function dangerLegalCap(a,c){
 const g=a.conditions??{},site=Number(c.site),base=site*Number(c.far)/100;
 const eligible=Number(a.dangerEligibleSite),adjacent=Number(a.dangerAdjacentSite);
 if(!present(a.dangerEligibleSite)||!present(a.dangerAdjacentSite)||!(site>0)||![eligible,adjacent].every(v=>Number.isFinite(v)&&v>=0)||eligible>site||eligible+adjacent>site+1e-8)return 0;
 const total=eligible+Math.min(adjacent,eligible,1000),full=eligible===site&&total===site;
 const original=Number(a.dangerOriginal),core=g.originalCap==='original115'&&full&&original>0&&present(g.originalSource)?Math.max(30,(original*1.15/base-1)*100):30;
 const size=g.quickExtras==='yes'&&total>=200?Math.min(10,2+Math.floor((total-200)/100)*.5):0;
 const d=a.date,time=!validLegalDate(d)||d<'2017-05-12'?0:d<'2020-05-12'?10:d<'2021-05-12'?8:d<'2022-05-12'?6:d<'2023-05-12'?4:d<'2024-05-12'?2:d<'2025-05-12'?1:0;
 return validLegalDate(d)&&d<='2027-05-31'?(core+Math.min(10,size+time))*total/site:0;
}
export function reviewBonusConditions(a,c,{renewal=0,danger=0,tdr=0,scale=0,updateArea=false}={}){
 const errors=[],notes=[],g=a?.conditions??{},entries={...a?.entries};
 const error=key=>errors.push(bonusLabels[key]+'待確認');
 const requireChoice=key=>{if(!present(g[key]))error(key);};
 const selected=id=>!!entries[id]?.choice&&entries[id]?.status!=='excluded'&&g.entries?.[id]!=='no'&&(/^[ul]-/.test(id)?a.route==='renewal'&&a.renewalMode==='detail':id.startsWith('d-')?a.route==='danger'&&a.dangerMode==='detail':a.tdrMode==='detail');
 for(const [id,status]of Object.entries(g.entries??{}))if(status==='no'&&entries[id])entries[id]={...entries[id],status:'excluded'};
 const activeIds=Object.keys(entries).filter(id=>selected(id)&&((a?.route==='renewal'&&a.renewalMode==='detail'&&/^[ul]-/.test(id))||(a?.route==='danger'&&a.dangerMode==='detail'&&id.startsWith('d-'))||(a?.tdrMode==='detail'&&id.startsWith('t-'))));
 const hasRenewal=a?.route==='renewal'&&(renewal>0||a.renewalMode==='detail');
 const hasDanger=a?.route==='danger'&&(danger>0||a.dangerMode==='detail');
 const hasTdr=tdr>0||a?.tdrMode==='detail';
 if(!a)return {errors,notes,assessment:a};
 if(!isBonusConditions(g)){errors.push('獎勵適用條件格式無效，請重新核對。');return {errors,notes,assessment:a};}
 if(a.route==='renewal'&&a.renewalMode==='quick'&&Number.isFinite(renewal)&&renewal<0)errors.push('都更快速目標須為非負數值');
 const permitted=a.awardBasis==='permitted';
 if(!permitted&&(hasRenewal||hasDanger)){
  if(!present(a.source))error('source');
  if(!validLegalDate(a.date))errors.push('預計報核／申請日期待確認');
  const q=hasRenewal?'renewalQualification':'dangerQualification';
  if(a[q]!=='yes')errors.push((hasRenewal?'都更適用資格':'危老法定適用資格')+'須先確認符合；未符合請取消本項獎勵');
 }
 if(hasRenewal&&!permitted){
  if(!Number.isFinite(Number(a.deduction))||Number(a.deduction)<0)errors.push('同一事項重複獎勵扣除比例須為非負數值');
  if(a.renewalMode==='quick'&&Number(a.deduction)>renewal)errors.push('同一事項重複獎勵扣除比例超過都更目標，請核對。');
  requireChoice('renewalWork');requireChoice('implementation');
  if(g.renewalWork&&g.renewalWork!=='rebuild')errors.push('本工具計算重建量體；整建或維護請另依該措施評估，勿採重建獎勵。');
  if(a.taipei?.enabled&&a.taipei.mode==='strategy'&&g.implementation!=='public12')errors.push('策略性更新加倍須依第12條第1項公辦方式實施，請核對實施方式。');
  if(g.implementation==='other')errors.push('其他都市更新實施方式須改依核准文件對照，並核對其法源及獎勵範圍。');
  for(const id of ['u-green','u-smart'])if(selected(id)){
   const rank=Number(entries[id].choice);
   if(rank>=4){requireChoice('article7District');if(Number(c.site)>=500||g.article7District==='no')errors.push((id==='u-green'?'綠建築':'智慧建築')+'銅級或合格級限第7條第1項第3款更新地區且基地未達500㎡，請改選適用等級。');}
  }
  if(selected('u-green')){requireChoice('greenMinimum');if(g.greenMinimum&&g.greenMinimum!=='none'&&Number(entries['u-green'].choice)>=Number(g.greenMinimum))errors.push('綠建築申請等級須高於法定最低等級，請核對等級。');}
  if(selected('u-agreement')){
   if(g.implementation!=='agreement')errors.push('全體協議合建獎勵限協議合建實施方式，請取消該獎勵或核對實施方式。');
   if(!present(g.agreementDoors)||!Number.isInteger(Number(g.agreementDoors))||Number(g.agreementDoors)<20)errors.push('更新前門牌戶數須達20戶，請核對門牌資料。');
   if(g.agreementConsent!=='yes')error('agreementConsent');
  }
  if(g.article7District==='yes'&&g.renewalDistrict==='no')errors.push('第7條第1項第3款更新地區與報核時程的劃定狀態不一致，請核對。');
  if(selected('u-time')){requireChoice('renewalDistrict');const defined=entries['u-time'].choice==='1';if(present(g.renewalDistrict)&&defined!==(g.renewalDistrict==='yes'))errors.push('報核時程所選更新地區與劃定條件不一致，請核對。');}
 }
 if(hasDanger&&!permitted){
  requireChoice('dangerCategory');if(g.dangerConsent!=='yes')error('dangerConsent');
  const e=Number(a.dangerEligibleSite),n=Number(a.dangerAdjacentSite),site=Number(c.site);
  if(!present(a.dangerEligibleSite)||!present(a.dangerAdjacentSite))errors.push('請填寫危老原合格基地面積及鄰地面積；沒有鄰地請填0。');
  else if(![e,n].every(v=>Number.isFinite(v)&&v>=0)||e<=0||e>site||e+n>site+1e-8)errors.push('危老原合格基地及鄰地面積須為有效數值，合計不得超過本案基地。');
  requireChoice('originalCap');
  if(g.originalCap==='original115'&&(!(Number(a.dangerOriginal)>0)||!present(g.originalSource)||e!==site||n!==0))errors.push('合法原建築容積115%上限須填合法原容積及依據，且本案為全合格原基地；含鄰地請另依個案文件對照。');
  if(a.dangerMode==='quick')requireChoice('quickExtras');
  if(selected('d-unsafe')&&g.dangerCategory&&entries['d-unsafe'].choice!==g.dangerCategory)errors.push('危老資格與結構獎勵所選條件不一致，請核對。');
  if(a.date>'2027-05-31')errors.push('危老新申請日期超過2027-05-31；既有核准案件請改依核准文件對照。');
 }
 if(hasTdr&&!(a.tdrApplication?.quantityBasis==='permitted'&&a.tdrApplication?.stage==='permitted')){
  if(a.tdrQualification!=='yes')errors.push('容移接受基地、道路及移入資格須先確認符合');
  if(!present(g.tdrSource))error('tdrSource');
  const road=c.roadConditions;
  for(const [key,label]of [['plannedWidth','計畫道路寬度m'],['openedWidth','實際開闢道路寬度m'],['frontage','同一路段基地面寬m']])if(!present(road?.[key]))errors.push(label+'待確認');
  if(road?.connected!=='yes')errors.push('足寬開闢道路之連通待確認');
  if(road?.status!=='confirmed')errors.push('路寬確認狀態須依文件確認');
  if(c.district&&a.tdrApplication?.city&&(/新北/.test(c.district)?'ntpc':/臺北|台北/.test(c.district)?'taipei':'other')!==a.tdrApplication.city)errors.push('容移法規地區與基地所在地不同，請重設地區條件。');
  if(updateArea&&a.tdrMode==='detail'&&/新北/.test(c.district)&&!present(g.renewalAreaSource))error('renewalAreaSource');
 }
 if(!permitted)for(const id of activeIds){
  if(g.entries?.[id]==='no'){entries[id]={...entries[id],status:'excluded'};notes.push((bonusIssueLabels[id]??'獎勵項目')+'條件未符合，本次不採計。');}
  else if(g.entries?.[id]!=='yes')errors.push('獎勵項目條件待確認：'+(bonusIssueLabels[id]??id));
 }
 // Independent spaces may receive different awards. Shared space needs an explicit deduction.
 const awardIds=activeIds.filter(id=>/^[ul]-/.test(id)&&g.entries?.[id]!=='no');
 const pairedSpace=[['l-setback','t-setback'],['l-plaza','t-plaza'],['l-path','t-walk'],['t-plaza','t-walk'],['u-infra','t-ex-infra'],['u-public','t-social'],['u-public','t-care'],['u-public','t-elder'],['d-infra','t-ex-infra']].some(pair=>pair.every(id=>selected(id)));
 const crossSpace=hasTdr&&awardIds.some(id=>['u-infra','u-heritage','l-setback','l-plaza','l-path'].includes(id));
 if(!permitted&&(hasRenewal&&(a.renewalMode==='quick'||awardIds.length>1)||scale>0&&hasRenewal||crossSpace||pairedSpace)){
  requireChoice('overlap');if(!present(g.overlapSource))error('overlapSource');
  if(g.overlap==='deducted'&&!(Number(a.deduction)>0))errors.push('已選擇扣除重複獎勵，請填同一事項重複獎勵扣除比例。');
 }
 if(crossSpace&&awardIds.some(id=>['u-infra','u-heritage'].includes(id))){requireChoice('tdrResource');if(['award','transfer'].includes(g.tdrResource))errors.push('同一公共設施土地或保存建物已選兩種給予方式，請取消重複的獎勵或容移。');}
 const assessment={...a,entries,distinctSpaces:g.overlap==='distinct'&&present(g.overlapSource)};
 if(hasDanger&&g.originalCap!=='original115')assessment.dangerOriginal='0';
 return {errors:[...new Set(errors)],notes,assessment};
}
