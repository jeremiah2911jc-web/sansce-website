import {withPlanningDefaults,preparePlanningEstimate,planningDefaultRows,isGuidedInput} from './guided-input.mjs';
import {meaningfulEvidence} from './evidence-input.mjs';
import {reviewBonusConditions} from './bonus-eligibility.mjs';
import {evaluate} from './model.mjs';
import {planningInputIssues} from './planning-input-review.mjs';
import {applyStatutoryBonusLimits} from './statutory-bonus-limits.mjs';

// Keep the editable scenario intact. Only unused award inputs are neutralized
// in the temporary input passed to the shared calculator.
export function activeBonusInput(input){
 const a=input.regulatoryReview?.bonusAssessment;
 if(!a||!['renewal','danger','none'].includes(a.route))return input;
 const patch={};
 for(const [key,mode,qualification]of [['renewal','renewalMode','renewalQualification'],['danger','dangerMode','dangerQualification']]){
  if(a.route!==key||a[mode]==='detail'||a.awardBasis==='permitted'||a[qualification]==='no')patch[key]='0';
 }
 if(a.route==='danger')patch.scale='0';
 // The quantity model replaces the legacy reserve field before calculating.
 if(input.quantityReserve)patch.reserve='0';
 // Demand search always uses the named rooms, not the fixed-floor percentage.
 if(input.basementDemand?.enabled&&input.quantityReserve)patch.quantityReserve={...input.quantityReserve,basementEquipmentMode:'named'};
 return applyStatutoryBonusLimits({...input,...patch,regulatoryReview:{...input.regulatoryReview,bonusAssessment:{...a,planningEstimate:false}}});
}
export function evaluateActiveBonuses(input){
 const active=preparePlanningEstimate(activeBonusInput(input));if(!input.regulatoryReview?.bonusAssessment)return ['renewal','danger','tdr','scale'].some(k=>Number(input[k])>0)?{errors:['請先選擇重建獎勵路徑並核對本次獎勵適用條件。'],notes:[],values:null}:evaluate(input);
 const a=active.regulatoryReview.bonusAssessment;
 const legal=input.assessmentMode==='document'||input.mixedSite?.enabled?{errors:[]}:reviewBonusConditions(a,{site:Number(active.site),far:Number(active.far),district:active.parkingDesign?.district,roadConditions:active.roadConditions},{renewal:Number(active.renewal),danger:Number(active.danger),tdr:Number(active.tdr),scale:Number(active.scale),updateArea:active.regulatoryReview.renewalArea});
 const errors=[...new Set([...planningInputIssues(active),...legal.errors,...evidenceInputIssues(active)])];
 if(errors.length)return {errors,notes:[],values:null};
 const result=evaluate(active);
 if(!isGuidedInput(input))return result;
 return {...result,notes:[...new Set([...(active.planningAssumptionNotes??[]),...(legal.notes??[]),...result.notes])],planningEstimate:active.regulatoryReview.bonusAssessment.planningEstimate===true,planningDefaults:planningDefaultRows(input),planningBonus:active.regulatoryReview.bonusAssessment};
}

export function evidenceInputIssues(input){
 const errors=[],road=input.roadConditions,d=input.basementDemand,p=input.parkingDesign,r=input.regulatoryReview;
 const check=(value,label,required=false)=>{if((required||String(value??'').trim())&&!meaningfulEvidence(value))errors.push(label+'請填具體文件名稱、日期或文號及適用範圍');};
 check(road?.source,'路寬查證來源',road?.status==='confirmed');
 check(input.excavationReference,'個案開挖規定來源',d?.enabled&&d.rule==='documented');
 check(d?.stricterSource,'較嚴格開挖規定來源',Boolean(d?.stricterCap?.trim()));
 check(d?.source,'地下開挖規則依據',d?.rule==='nangang_rebuild');
 check(p?.reference,'停車規則來源',p?.confirmed===true);
 if(r?.bicycleExemption==='documented')check(r.bicycleSource,'自行車免計適用法令／核定資料',true);
 return errors;
}

// New website cases start on the same route shown by the bonus selector.
// Imported cases keep their stored fields and validation behavior.
export function createWorkspaceInput(create){
 const input=create();
 return withPlanningDefaults({...input,regulatoryReview:{...input.regulatoryReview,bonusAssessment:{version:'bonus-assessment.2026-10-19.v1',route:'renewal',renewalMode:'quick',tdrMode:'quick',dangerMode:'quick',date:'',entries:{},renewalQualification:'unknown',tdrQualification:'unknown',dangerQualification:'unknown',source:'',deduction:'0',tdrProfile:'general',dangerOriginal:'',dangerEligibleSite:'',dangerAdjacentSite:''}}},undefined,{newCase:true});
}
