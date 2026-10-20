import {interactionTargets} from '../shared/traffic-actions.js';
// Fixed action codes only. No field values, labels or free text enter analytics.
export function trackInteraction(action,target){
 if(typeof action!=='string'||!Object.hasOwn(interactionTargets,action)||!interactionTargets[action].includes(target))return;
 try{window.dispatchEvent(new CustomEvent('sanze:interaction',{detail:{action,target}}));}catch{}
}
export function contactTrackingContext(){
 let context=null;
 try{window.dispatchEvent(new CustomEvent('sanze:tracking-context',{detail:{receive:value=>{context=value;}}}));}catch{}
 return context;
}
