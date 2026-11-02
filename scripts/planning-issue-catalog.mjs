import {parse} from '@babel/parser';
// Read error emissions only; notes and warnings are outside this inventory.
export function collectPlanningIssues(source){
 const rows=[];
 const strings=n=>{if(!n||typeof n!=='object')return [];if(n.type==='StringLiteral')return [n.value];if(n.type==='TemplateElement')return [n.value.cooked];return Object.entries(n).flatMap(([k,v])=>k==='loc'?[]:Array.isArray(v)?v.flatMap(strings):v&&typeof v==='object'?strings(v):[]);};
 function walk(n,owner=''){
  if(!n||typeof n!=='object')return;
  if(n.type==='FunctionDeclaration')owner=n.id.name;
  let value;
  if(n.type==='CallExpression'&&n.callee?.property?.name==='push'&&/errors|issues/i.test(source.slice(n.callee.object.start,n.callee.object.end)))value=n.arguments;
  if(n.type==='ObjectProperty'&&(n.key.name||n.key.value)==='errors')value=n.value;
  if(value)rows.push({owner,line:n.loc.start.line,terms:[...new Set(strings(value).filter(t=>t.length>=6&&/\p{Script=Han}/u.test(t)))]});
  for(const[k,v]of Object.entries(n))if(k!=='loc')if(Array.isArray(v))v.forEach(x=>walk(x,owner));else if(v&&typeof v==='object')walk(v,owner);
 }walk(parse(source,{sourceType:'module'}));return rows;
}
export const planningIssueDestinations={
 reviewTaipeiRenewal:{tab:'base',region:'臺北市地方都更獎勵'},
 reviewSiteRoad:{tab:'base',summary:'基地道路條件'},
 reviewPermittedAward:{tab:'base',label:'獎勵核准文號及來源'},
 reviewTdrApplication:{tab:'base',summary:'容移取得條件與資格檢核'},
 assessBonuses:{tab:'base',heading:'獎勵與容移：快速估算／細項評定'},
 resolveBonusLimits:{tab:'basement',summary:'獎勵、容移上限與評點假設'},
 reviewRoofEnvelope:{tab:'above',summary:'屋突用途與登記假設'},
 reviewAboveGround:{tab:'above',region:'第162條逐層與登記檢討'},
 calculateQuantityPlanning:{tab:'basement',label:'地下配置檢討方式'},
 calculateDemandBasement:{tab:'basement',region:'地下需求檢討'},
 resolveExcavationLimit:{tab:'basement',region:'地下需求檢討'},
 allocateSmallSite:{tab:'basement',summary:'設備、動線與搜尋範圍',region:'小基地替代配置'},
 calculateLegalParking:{tab:'parking',summary:'停車規則來源'},
 calculatePlanningPass:{tab:'above',region:'第162條逐層與登記檢討'},
 calculatePlanning:{tab:'basement',label:'地下配置檢討方式'},
 calculateAggregatePlanning:{tab:'basement',region:'法規條件與規劃假設'},
 calculateCommercialIntensity:{tab:'base',scope:'editor',region:'商業分區強度與住宅用途檢核'},
 reviewNtpcHousing:{tab:'base',scope:'editor',region:'商業分區強度與住宅用途檢核'},
 reviewNtpcCross:{tab:'base',scope:'editor',region:'商業分區強度與住宅用途檢核'},
};
export function planningIssueCatalog(source){return collectPlanningIssues(source).filter(x=>planningIssueDestinations[x.owner]&&x.terms.length).map(x=>({...x,target:planningIssueDestinations[x.owner]}));}
export function collectBonusLabels(source){
 const ast=parse(source,{sourceType:'module'}),declaration=ast.program.body.filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations).find(n=>n.id.name==='bonusItems');
 return Object.fromEntries(declaration.init.elements.filter(n=>n.type==='ObjectExpression').map(n=>{const props=Object.fromEntries(n.properties.filter(x=>x.type==='ObjectProperty').map(x=>[x.key.name||x.key.value,x.value]));return [props.id.value,props.label.value];}));
}
