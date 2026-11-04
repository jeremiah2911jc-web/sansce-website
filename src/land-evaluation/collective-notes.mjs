import {todPendingNotice} from './ntpc-tod.mjs';
import {publicText} from './public-copy.mjs';
import {formatNumber} from './number-format.mjs';
export const ntpcPointsLaw='https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150118';

// Only report text is selected here. Calculation output, candidates and gates are untouched.
const processNotes=/^(?:坡道平面：至少|坡道機械：至少|升降機平面：至少|升降機機械：至少|選擇順序：|機械車位依需求搜尋：|逐層面積預算初估|逐層表未提供圖說時由App|建築面積與等面積樓層為總量模型|都更及容移均為規劃目標)/;
const transferNotes=/^(?:容移|接受基地|送出地|法規地區|新北一般及窄路|新北：一般基地|新北特殊核准重建若選|新北：一般案件依量體評定|臺北第2-1、4條：|尚未選定取得方式|道路寬度未填|資格未知，依目標假設繼續|依規劃目標估算，容移資格待查證|都更及容移均為規劃目標)/;
export const selectedBonusRoute=input=>input.regulatoryReview?.bonusAssessment?.route??(Number(input.danger)>0?'danger':'renewal');
export function bonusResultRows(input,values){
 const route=selectedBonusRoute(input);
 return [...(route==='renewal'?[['都更',values.renewalApplied]]:route==='danger'?[['危老',values.dangerApplied]]:[]),...(values.todApplied>0?[['TOD增額',values.todApplied]]:[]),['容移',values.tdrApplied],...(route!=='danger'&&values.scaleApplied>0?[['規模',values.scaleApplied]]:[])];
}
export function bonusInputVisible(input,key){const route=selectedBonusRoute(input);return key==='renewal'?route==='renewal':key==='danger'?route==='danger':key==='scale'?route!=='danger':true;}
export function transferUsed(input,result){
 const a=result.planningBonus??input.regulatoryReview?.bonusAssessment;
 if(result.values?.tdrApplied>0)return true;
 if(a?.tdrMode==='detail')return Object.entries(a.entries??{}).some(([id,row])=>id.startsWith('t-')&&row.choice&&row.status!=='excluded');
 return Number(input.tdr)>0;
}
export function bonusAdoptionRows(input,result,format=String){
 const a=result.planningBonus??input.regulatoryReview?.bonusAssessment,v=result.values;
 if(!a||!v)return [];
 const route=selectedBonusRoute(input),rows=[];
 if(route!=='none')rows.push([route==='danger'?'危老採計方式':'都更採計方式',`${a.awardBasis==='permitted'?'依核准文件':a[route==='danger'?'dangerMode':'renewalMode']==='detail'?'細項評定':'快速估算'}；本次採${format(route==='danger'?v.dangerApplied:v.renewalApplied)}%`]);
 if(transferUsed(input,result))rows.push(['容移採計方式',`${a.tdrApplication?.quantityBasis==='permitted'?'依許可文件':a.tdrMode==='detail'?'細項評定':'快速估算'}；本次採${format(v.tdrApplied)}%`]);
 return rows;
}
export function collectiveDisplayNotes(input,result){
 const a=result.planningBonus??input.regulatoryReview?.bonusAssessment,noTransfer=!transferUsed(input,result),route=selectedBonusRoute(input);
 const renewalDetail=route==='renewal'&&a?.renewalMode==='detail'&&a.awardBasis!=='permitted',dangerDetail=route==='danger'&&a?.dangerMode==='detail'&&a.awardBasis!=='permitted';
 const inactive=note=>!dangerDetail&&/^危老(?:第3|含鄰地)/.test(note)||!renewalDetail&&/^(?:都更中央|臺北地方獎勵採)/.test(note)||a?.tdrProfile!=='special50'&&note.startsWith('新北特殊核准重建若選');
 const points=result.regulatory?.bonus?.assessment,n=v=>formatNumber(v,4);
 const pointNotes=!noTransfer&&a?.tdrMode==='detail'&&a.tdrProfile!=='special50'&&/新北/.test(input.parkingDesign?.district??'')&&points?[`容移評點：基準量${n(points.tdrBase)}%、內部條件${n(points.tdrInternal)}%，加計係數${n(points.tdrFactor)}；外部改善原評${n(points.tdrExternalRaw)}%，受加計後內部條件1/3限制採${n(points.tdrExternal)}%；評定${n(points.tdrRaw)}%，本次採${n(result.values?.tdrApplied??0)}%。`]:[];
 return [...new Set([...(result.notes||[]),...pointNotes,...(result.multiBuilding?[...result.multiBuilding.checks,...result.multiBuilding.pending]:[]),...(todPendingNotice(input)?[todPendingNotice(input)]:[])].filter(note=>!processNotes.test(note)&&!inactive(note)&&!(noTransfer&&transferNotes.test(note))).map(note=>{
  if(result.basementDemandReview&&note.startsWith('地下分層面積依實際採用'))note=note.replace('地下層數依輸入固定。','');
  if(note.startsWith('採計方式：')){const label=route==='renewal'?'都更':route==='danger'?'危老':'未採重建獎勵';const mode=route==='renewal'?a?.renewalMode:a?.dangerMode;note='本次採用：'+label+(route==='none'?'':'（'+(a?.awardBasis==='permitted'?'依核准文件':mode==='detail'?'細項評定':'快速估算')+'）')+(noTransfer?'':'；容移'+(a?.tdrApplication?.quantityBasis==='permitted'?'依許可文件':a?.tdrMode==='detail'?'細項評定':'快速估算'))+'。';}
  if(note.startsWith('新北特殊核准重建若選'))note='本次採新北特殊核准重建免量體評定路徑，容積獎勵與容積移轉合計上限50%；適用資格及核准文件仍須核對。';
  if(note.startsWith('地上計容')&&result.values?.basementCounted<0&&result.values.basementCounted>-1e-9)note=note.replace('地下計容-0.00㎡','地下計容0.00㎡');
  const text=publicText(note);
  return route==='danger'&&text==='臺北市容移依接受基地資格、上限及取得方式檢核。都更細項列中央與臺北地方獎勵；地方獎勵須選取適用條件。'?'臺北市容移依接受基地資格、上限及取得方式檢核。':text;
 }))];
}
