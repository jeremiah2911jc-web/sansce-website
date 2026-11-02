import {systems,perspectives} from './generated/readjustment.mjs';

// Only names produced by the interface follow the selected perspective.
// A user's own title and saved result snapshots retain their original text.
export function readjustmentNameForTrack(plan,track=plan?.track){
 if(!plan||!perspectives[track])return plan?.name;
 const bases=[systems[plan.system],plan.planName].filter(Boolean);
 const base=bases.find(base=>Object.values(perspectives).some(label=>plan.name===`${base}／${label}`));
 return base?`${base}／${perspectives[track]}`:plan.name;
}
