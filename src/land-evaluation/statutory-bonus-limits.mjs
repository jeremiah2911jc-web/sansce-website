import {reviewTaipeiRenewal,taipeiRenewalApplies,renewalArticle65,taipeiRenewalLaw} from './taipei-renewal/model.mjs';
import {meaningfulEvidence} from './evidence-input.mjs';

export const transferLaw='https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070028&flno=8';
export const ntpcTransferLaw='https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150015';
export const dangerLaw='https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070249&flno=6';
const present=v=>String(v??'').trim()!=='';
const same=(v,n)=>!present(v)||Number(v)===n;

// The website supplies statutory defaults; the shared solver still determines
// eligibility, road restrictions, points, area weighting and actual quantities.
export function statutoryBonusLimits(input){
 const p=input.regulatoryReview,a=p?.bonusAssessment;
 if(!a)return null;
 const district=input.parkingDesign?.district||'',city=/臺北|台北/.test(district)?'taipei':/新北/.test(district)?'ntpc':a.tdrApplication?.city;
 let renewal=50,tdr=city==='taipei'?(a.tdrApplication?.taipeiCap==='qualified40'?40:30):({general:30,forty:40,hillside:20,narrow:15,special50:30}[a.tdrProfile]??30);
 const taipei=taipeiRenewalApplies(a,{district})?reviewTaipeiRenewal(a.taipei,{site:input.site,far:input.far,date:a.date}):null;
 if(taipei)renewal=taipei.totalCap;
 const combined=city==='ntpc'&&a.tdrProfile==='special50'?50:null;
 return {city,renewal,tdr,combined,renewalSource:taipei?taipeiRenewalLaw:renewalArticle65,tdrSource:city==='ntpc'?ntpcTransferLaw:transferLaw};
}
export function bonusLimitMode(input,limits=statutoryBonusLimits(input)){
 const p=input.regulatoryReview;
 if(!limits||!p)return 'legacy';
 if(['statutory','document'].includes(p.bonusLimitMode))return p.bonusLimitMode;
 // Retain previously entered case-specific restrictions on import. Common
 // statutory values from earlier website cases continue to follow the region.
 const a=p.bonusAssessment,renewal=a.route==='renewal',tdr=Number(input.tdr)>0||a.tdrMode==='detail';
 return (renewal&&!same(p.renewalLimitPercent,limits.renewal)&&Number(p.renewalLimitPercent)!==50)||(tdr&&!same(p.tdrLimitPercent,limits.tdr)&&Number(p.tdrLimitPercent)!==30)||!same(p.totalBonusLimitPercent,limits.combined)?'document':'statutory';
}
export function applyStatutoryBonusLimits(input){
 if(input.assessmentMode==='document'||input.mixedSite?.enabled)return input;
 const limits=statutoryBonusLimits(input),p=input.regulatoryReview;
 if(!limits||bonusLimitMode(input,limits)==='document')return input;
 // Static law references are calculator provenance, never case verification.
 // Do not mutate the stored case's source or qualification status.
 return {...input,regulatoryReview:{...p,bonusLimitMode:'statutory',renewalLimitPercent:String(limits.renewal),tdrLimitPercent:String(limits.tdr),totalBonusLimitPercent:limits.combined===null?'':String(limits.combined),bonusSource:[...new Set([p.bonusSource,limits.renewalSource,limits.tdrSource].filter(Boolean))].join('\n')}};
}
// The generated panel receives resolved limits for its live summary. Its edit
// callback must retain the user's evidence, rather than saving those references.
export function bonusPanelPatch(input,patch){
 if(!patch.regulatoryReview||bonusLimitMode(input)!=='statutory')return patch;
 const p=input.regulatoryReview;
 return {...patch,regulatoryReview:{...patch.regulatoryReview,bonusLimitMode:'statutory',...Object.fromEntries(['renewalLimitPercent','tdrLimitPercent','totalBonusLimitPercent','bonusSource'].map(key=>[key,p[key]]))}};
}
export function caseLimitIssues(input){
 const limits=statutoryBonusLimits(input),p=input.regulatoryReview;
 if(!limits||bonusLimitMode(input,limits)!=='document')return [];
 return meaningfulEvidence(p.bonusSource)?[]:[present(p.bonusSource)?'另定上限依據須填計畫名稱、條文或頁次':'另定上限依據未填'];
}
