import {calculateCommercialIntensity,planningFields,planningAssumptionsTemplate} from './generated/core.mjs';
import {evaluate} from './model.mjs';
import {issueTarget} from './workspace-guidance.mjs';
import {publicText} from './public-copy.mjs';
import {caseLimitIssues} from './statutory-bonus-limits.mjs';

// The shared solver remains the authority for required limits and eligibility.
// This isolated validation pass omits geometry/search models so an absent limit
// cannot be masked by their downstream NaN/parking errors. Its quantities are
// discarded; the actual calculation always receives the original active input.
const limitError=/都更獎勵上限|臺北都更獎勵上限|容移上限|一般都更50%上限|一般容移30%上限|個案獎勵及容移合計上限/;
const blank=value=>!String(value??'').trim();
const ignored=new Set(['equipment','lobby','roofRate','excavationCap','carPerUnit','carPing','motoSqm','localParkingUnit']);
export function requiredPlanningFields(input){
 if(input.assessmentMode==='document'||input.mixedSite?.enabled)return [];
 const a=input.regulatoryReview?.bonusAssessment;
 const unused=key=>key==='reserve'&&input.quantityReserve||key==='scale'&&a?.route==='danger'||['renewal','danger'].includes(key)&&a&&(a.route!==key||a[key+'Mode']==='detail'||a.awardBasis==='permitted'||a[key+'Qualification']==='no');
 return planningFields.filter(([key])=>!ignored.has(key)&&!unused(key)&&!(key==='far'&&input.commercialIntensity?.enabled)&&!(key==='basementFloors'&&input.basementMode==='auto')&&!(input.basementDemand?.enabled&&['excavation','basementFloors'].includes(key)));
}
export function bonusLimitIssues(input){
 if(input.assessmentMode==='document'||input.mixedSite?.enabled||!input.regulatoryReview)return [];
 let far=input.far;
 if(input.commercialIntensity?.enabled){const review=calculateCommercialIntensity(input.commercialIntensity,input.site,input.coverage,true);if(review.errors.length)return [];far=String(review.effectiveFar);}
 if(['site','coverage'].some(key=>!Number.isFinite(Number(input[key]))||Number(input[key])<=0)||!Number.isFinite(Number(far))||Number(far)<=0)return [];
 const template=planningAssumptionsTemplate({input:{district:input.parkingDesign?.district??'新北市'}});
 const probe={...template,...input,far,multiBuilding:undefined,quantityReserve:undefined,areaReview:undefined,spatial:undefined,basementDemand:undefined,commercialIntensity:undefined,basementMode:'auto',reserve:'0',excavation:'50'};
 for(const [key]of planningFields)if(blank(probe[key]))probe[key]=['renewal','danger','tdr','scale'].includes(key)?'0':template[key];
 return [...new Set(evaluate(probe).errors.filter(message=>limitError.test(message)))];
}
export function planningInputIssues(input){
 if(input.assessmentMode==='document'||input.mixedSite?.enabled)return [];
 if(input.multiBuilding?.enabled)return caseLimitIssues(input);
 const errors=requiredPlanningFields(input).filter(([key])=>blank(input[key])).map(([,label])=>{const message=publicText(label)+'未填',target=issueTarget(message,input);return (target.label??publicText(label)).replace(/%$/,'')+'未填';});
 if(input.quantityReserve?.reservationMode==='legal_envelope'&&input.quantityReserve.basementEquipmentMode!=='named'&&!Number.isFinite(input.quantityReserve.basementReservePercent))errors.push('地下預留比例未填');
 return [...new Set([...errors,...caseLimitIssues(input),...bonusLimitIssues(input)])];
}
export function missingPlanningFields(input){
 return planningInputIssues(input).filter(message=>/未填$/.test(message)).map(message=>({...issueTarget(message,input),message}));
}
