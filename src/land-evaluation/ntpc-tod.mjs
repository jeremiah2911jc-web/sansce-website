import {meaningfulEvidence} from './evidence-input.mjs';
export const TOD_VERSION='ntpc-tod.2026-05-20.v1';
export const TOD_SOURCE='https://www.planning.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=bea525c8affb608cbac49617508626b7&id=24';
export const TOD_MAP='https://urban.planning.ntpc.gov.tw/NtpcURInfo/';
export const todScopes=[['unknown','尚未查詢適用範圍'],['outside','不在TOD適用範圍'],['priority20','原有TOD適用範圍（容移前先申請20%）'],['priority10','擴大TOD適用範圍（容移前先申請10%）'],['exception','符合免優先申請增額容積的例外']];
export const todExceptions=[['','請選擇例外條件'],['strategyOld','104年7月1日前指定的策略性再開發地區'],['strategy','依法劃定的策略性更新地區'],['legacy1','第一階段原21站，109年2月29日前核准容移或都更事業計畫報核'],['legacy2','第二階段原35站，109年7月31日前核准容移或都更事業計畫報核'],['legacy3','第三階段新增9站，115年11月20日止核准容移或都更事業計畫報核']];
export const newTod=()=>({version:TOD_VERSION,scope:'unknown',percent:'',exception:'',eventDate:'',source:'',completeBlock:'unknown'});
export function isTod(t){return !!t&&t.version===TOD_VERSION&&todScopes.some(([key])=>key===t.scope)&&['percent','exception','eventDate','source'].every(k=>typeof t[k]==='string'&&t[k].length<=12000)&&['unknown','yes','no'].includes(t.completeBlock)&&todExceptions.some(([key])=>key===t.exception);}
export function todPendingNotice(input){const t=input.regulatoryReview?.ntpcTod;return /新北/.test(input.parkingDesign?.district??'')&&(Number(input.tdr)>0||input.regulatoryReview?.bonusAssessment?.tdrMode==='detail')&&(!t||t.scope==='unknown')?'請確認基地是否位於新北TOD適用範圍；若適用，須另核增額容積的優先申請額度及例外條件。本次尚未計入TOD增額容積。':'';}
// TOD is a separate purchased increment. It never consumes the urban-renewal
// award cap and never changes the base used for awards or transfer percentages.
export function resolveTod(t,context,rates,assessment){
 if(!t)return null;
 const notes=[],errors=[],out={percent:0,tdr:rates.tdr,minimum:0,maximum:0,notes,errors,scope:t.scope};
 if(!isTod(t)){errors.push('TOD適用條件格式無效，請重新選擇。');return out;}
 if(!/新北/.test(context?.district??'')){if(['priority20','priority10','exception'].includes(t.scope))errors.push('新北TOD設定與基地地區不同，請重新選擇地區條件。');return out;}
 if(t.scope==='outside')return out;
 if(t.source.trim()&&!meaningfulEvidence(t.source))errors.push('TOD查詢依據請填圖層名稱、基地地號與查詢日期，或公告文號及適用範圍。');
 if(t.scope==='unknown'){notes.push('TOD適用範圍尚未查詢；本次按目標容移量初估，未計入TOD增額容積。請查詢原有或擴大適用範圍及順序例外。');return out;}
 if(t.scope==='exception'){
  if(!t.exception)errors.push('TOD順序例外請選擇適用條件。');
  if(!meaningfulEvidence(t.source))errors.push('TOD順序例外依據請填公告或核准文件名稱、日期及適用範圍。');
  const deadline={legacy1:'2020-02-28',legacy2:'2020-07-30',legacy3:'2026-11-20'}[t.exception];
  if(deadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(t.eventDate)||!Number.isFinite(Date.parse(t.eventDate))||new Date(t.eventDate).toISOString().slice(0,10)!==t.eventDate||t.eventDate>deadline))errors.push('TOD順序例外的核准或報核日期超過適用期限或尚未填寫，請核對原文件。');
  notes.push('本次依所選TOD順序例外試算，不另計TOD增額；例外只免除優先申請順序，容移資格及總量仍須檢核。');
 }else{
  out.minimum=t.scope==='priority20'?20:10;out.maximum=t.scope==='priority20'?50:20;
  const percent=Number(t.percent);
  if(!t.percent.trim()||!Number.isFinite(percent)||percent<0||percent>out.maximum)errors.push('TOD增額容積比例請填0至'+out.maximum+'%的有效數值。');
  else{out.percent=percent;if(rates.tdr>0&&percent<out.minimum)errors.push('本案須先申請至少'+out.minimum+'%的TOD增額容積，才可計入容積移轉；請調整TOD增額容積比例。');}
  if(Number(context?.site)<2000){if(t.completeBlock==='no')errors.push('TOD基地未達2000㎡且非完整街廓，請核對基地範圍及適用條件。');else if(t.completeBlock!=='yes')notes.push('TOD基地未達2000㎡，完整街廓條件尚待確認；本次依所選增額比例作規劃初估。');}
  if(!t.source.trim())notes.push('TOD適用範圍依本次選項試算，圖層查詢結果、適用地號與查詢日期待補。');
  notes.push('TOD增額採'+out.percent+'%；本範圍先申請至少'+out.minimum+'%後才申請容移，增額上限'+out.maximum+'%。公益設施、道路、標章及建築能效等申請條件另依本案文件核對。');
 }
 const award=rates.renewal+rates.scale+rates.danger,cap=Math.min(100,rates.totalLimit??100);
 if(award+out.percent>cap+1e-8)errors.push('TOD增額與本次獎勵已超過合計上限'+cap+'%，請調整增額或獎勵比例。');
 const remaining=Math.max(0,cap-award-out.percent);out.tdr=Math.min(rates.tdr,remaining);
 if(out.tdr<rates.tdr-1e-8){if(assessment?.tdrApplication?.stage==='permitted'&&assessment.tdrApplication.quantityBasis==='permitted')errors.push('核准容移量與TOD合計上限衝突，請核對核准文件；本次不縮減核准量。');else notes.push('TOD增額、獎勵與容移增加量合計上限'+cap+'%；TOD與獎勵列入後，容移目標'+rates.tdr+'%本次採'+out.tdr+'%。');}
 return out;
}
