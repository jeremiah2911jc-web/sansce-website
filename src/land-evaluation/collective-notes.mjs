import {publicText} from './public-copy.mjs';

// Only report text is selected here. Calculation output, candidates and gates are untouched.
const processNotes=/^(?:坡道平面：至少|坡道機械：至少|升降機平面：至少|升降機機械：至少|選擇順序：|機械車位依需求搜尋：|逐層面積預算初估|逐層表未提供圖說時由App|建築面積與等面積樓層為總量模型)/;
const transferNotes=/^(?:容移|接受基地|送出地|法規地區|新北一般及窄路|新北：一般基地|新北特殊核准重建若選|新北：一般案件依量體評定|臺北第2-1、4條：|尚未選定取得方式|道路寬度未填|資格未知，依目標假設繼續|依規劃目標估算，容移資格待查證|都更及容移均為規劃目標)/;
export const selectedBonusRoute=input=>input.regulatoryReview?.bonusAssessment?.route??(Number(input.danger)>0?'danger':'renewal');
export function bonusResultRows(input,values){
 const route=selectedBonusRoute(input);
 return [...(route==='renewal'?[['都更',values.renewalApplied]]:route==='danger'?[['危老',values.dangerApplied]]:[]),['容移',values.tdrApplied],...(route!=='danger'&&values.scaleApplied>0?[['規模',values.scaleApplied]]:[])];
}
export function bonusInputVisible(input,key){const route=selectedBonusRoute(input);return key==='renewal'?route==='renewal':key==='danger'?route==='danger':key==='scale'?route!=='danger':true;}
export function collectiveDisplayNotes(input,result){
 const noTransfer=Number(input.tdr)===0,route=selectedBonusRoute(input);
 const inactive=note=>route!=='danger'&&/^危老(?:第3|含鄰地)/.test(note)||route!=='renewal'&&/^(?:都更中央|臺北地方獎勵採)/.test(note);
 return [...new Set((result.notes||[]).filter(note=>!processNotes.test(note)&&!inactive(note)&&!(noTransfer&&transferNotes.test(note))).map(note=>{
  if(result.basementDemandReview&&note.startsWith('地下分層面積依實際採用'))note=note.replace('地下層數依輸入固定。','');
  if(note.startsWith('採計方式：')){const a=input.regulatoryReview?.bonusAssessment;const label=route==='renewal'?'都更':route==='danger'?'危老':'未採重建獎勵';const mode=route==='renewal'?a?.renewalMode:a?.dangerMode;note='本次採用：'+label+(route==='none'?'':'（'+(mode==='detail'?'細項評定':'快速估算')+'）')+(noTransfer?'':'；容移'+(a?.tdrMode==='detail'?'細項評定':'快速估算'))+'。';}
  const text=publicText(note);
  return route==='danger'&&text==='臺北市容移依接受基地資格、上限及取得方式檢核。都更細項列中央與臺北地方獎勵；地方獎勵須選取適用條件。'?'臺北市容移依接受基地資格、上限及取得方式檢核。':text;
 }))];
}
