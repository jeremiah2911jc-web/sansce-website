// Only fixed public destinations are collected; never store link text, queries or form values.
export const servicePaths = ['/consulting','/services/urban-renewal','/services/dangerous-old-rebuilding','/services/joint-construction','/services/project-management'];
export const interactionTargets = {
 service_select:['site','contract','checkup','management'],
 stage_select:['integration','association','submitted','blocked','feasibility','cooperation','progress'],
 calculator_example:['fixed','development','separate'],
 calculator_complete:['single','comparison'],
 assistant_open:['launcher','calculator'],
 assistant_question:['send'],
 contact_open:['rail','mobile'],
};
export function validTrafficAction(action,target){
 if(typeof action!=='string'||typeof target!=='string')return false;
 if(Object.hasOwn(interactionTargets,action)&&interactionTargets[action].includes(target))return true;
 return action==='scroll' ? ['25','50','75','100'].includes(target)
  : action==='service_click' ? servicePaths.includes(target)
  : action==='checkup_click' ? target==='/checkup'
  : action==='contact_click' ? ['/contact','line','phone','email'].includes(target) : false;
}
export function trafficLinkAction(href,base){
 try{
  const u=new URL(href,base);
  if(['www.sanzepm.com.tw','sanzepm.com.tw'].includes(u.hostname)&&u.protocol==='https:'){
   const path=u.pathname.replace(/\/$/,'')||'/';
   if(servicePaths.includes(path))return {action:'service_click',target:path};
   if(path==='/checkup')return {action:'checkup_click',target:path};
   if(path==='/contact')return {action:'contact_click',target:path};
  }
  if(u.protocol==='tel:')return {action:'contact_click',target:'phone'};
  if(u.protocol==='mailto:')return {action:'contact_click',target:'email'};
  if(u.protocol==='https:'&&['lin.ee','line.me'].includes(u.hostname))return {action:'contact_click',target:'line'};
 }catch{}
 return null;
}
