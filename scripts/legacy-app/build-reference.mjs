import {build as esbuild} from 'esbuild';
import {readFileSync} from 'node:fs';
import {applyDangerAreaFix} from '../apply-danger-area-fix.mjs';
// The frozen App source remains read-only. Apply the same authorized correction
// to the isolated reference bundle used by these migrated App tests.
export function build(options){return esbuild({...options,plugins:[...(options.plugins??[]),{name:'authorized-danger-area-reference',setup(b){b.onLoad({filter:/\/planning\/bonusAssessment\.ts$/},({path})=>({contents:applyDangerAreaFix(readFileSync(path,'utf8'),{typescript:true}),loader:'ts'}));}}]});}
// Every historical assumption is explicit in test data, not restored as a product default.
export function legacyPlanningInput(planning,record,{demand=false,roof=false}={}){
 const input=planning.planningAssumptionsTemplate(record);
 Object.assign(input.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30'});
 if(!demand)delete input.basementDemand;
 if(!roof)delete input.quantityReserve.roofEnvelope;
 return input;
}
