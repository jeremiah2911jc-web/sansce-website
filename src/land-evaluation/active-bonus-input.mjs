import {evaluate} from './model.mjs';
import {planningInputIssues} from './planning-input-review.mjs';

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
 return {...input,...patch};
}
export function evaluateActiveBonuses(input){
 const active=activeBonusInput(input);if(!input.regulatoryReview?.bonusAssessment)return evaluate(input);
 const errors=planningInputIssues(active);
 return errors.length?{errors,notes:[],values:null}:evaluate(active);
}

// New website cases start on the same route shown by the bonus selector.
// Imported cases keep their stored fields and validation behavior.
export function createWorkspaceInput(create){
 const input=create();
 return {...input,regulatoryReview:{...input.regulatoryReview,bonusAssessment:{version:'bonus-assessment.2026-10-19.v1',route:'renewal',renewalMode:'quick',tdrMode:'quick',dangerMode:'quick',date:'',entries:{},renewalQualification:'unknown',tdrQualification:'unknown',dangerQualification:'unknown',source:'',deduction:'0',tdrProfile:'general',dangerOriginal:'',dangerEligibleSite:'',dangerAdjacentSite:''}}};
}
