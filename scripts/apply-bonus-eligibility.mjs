import {parse} from '@babel/parser';
export const BONUS_ELIGIBILITY_PATCH_VERSION='bonus-legal.2026-11-03.v2';
export function applyBonusEligibility(code){
 if(code.includes('/* bonus-eligibility-hook */'))return code;
 const ast=parse(code,{sourceType:'module'}),edits=[];
 const fn=name=>{const n=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);if(!n)throw Error('Bonus eligibility: missing '+name);return n;};
 const assess=fn('assessBonuses');
 edits.push({start:assess.id.start,end:assess.id.end,text:'assessBonusesBase'});
 const limits=fn('resolveBonusLimits');
 edits.push({start:limits.body.start+1,end:limits.body.start+1,text:`
  /* bonus-eligibility-hook */
  const legal = p.bonusAssessment && context ? reviewBonusConditions(p.bonusAssessment,context,{...rates,updateArea:p.renewalArea}) : {errors:[]};
`});
 function wording(n){if(!n||typeof n!=='object')return;if(n.type==='StringLiteral'&&n.value.startsWith('勾選條件為規劃目標'))edits.push({start:n.start,end:n.end,text:JSON.stringify('本次獎勵依已填實施方式、申請條件及範圍計算；標章、保證金與完工義務依本案文件及後續審查辦理。')});for(const [k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(wording);else if(v&&typeof v==='object')wording(v);}}wording(limits);
 const body=code.slice(limits.start,limits.end);
 const old='Math.min(40, rates.danger)';if(!body.includes(old))throw Error('Missing quick danger cap');
 const offset=limits.start+body.indexOf(old);edits.push({start:offset,end:offset+old.length,text:'Math.min(dangerLegalCap(a, context), rates.danger)'});
 const target=limits.body.body.find(n=>n.type==='IfStatement'&&code.slice(n.start,n.end).includes('tdrLimit = a.tdrMode'));
 if(!target)throw Error('Missing TDR limit intersection');
 edits.push({start:target.start,end:target.end,text:'if (a && assessment) tdrLimit = Math.min(tdrLimit, assessment.tdrCap);\n  if(a?.awardBasis!=="permitted") renewalLimit=Math.min(renewalLimit,assessment?.taipei?.totalCap??50);'});
 const ret=limits.body.body.find(n=>n.type==='ReturnStatement');
 edits.push({start:ret.start,end:ret.start,text:'errors.push(...legal.errors);\n  errors.splice(0,errors.length,...new Set(errors));\n  '});
 const validator=fn('isBonusAssessment');
 edits.push({start:validator.body.start+1,end:validator.body.start+1,text:'\n  if(x?.conditions!==undefined&&!isBonusConditions(x.conditions))return false;\n'});
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 code=code.replace('assessment.renewal : rates.renewal : 0', 'assessment.renewal : Math.max(0,rates.renewal-Number(a.deduction||0)) : 0');
 code=code.replace('if (renewal < rates.renewal)', 'if(a?.route==="renewal"&&a.awardBasis!=="permitted"&&renewal+scale>renewalLimit){if(scale>renewalLimit)errors.push("其他獎勵已超過本次都更合計上限，請核對適用路徑。");renewal=Math.max(0,renewalLimit-scale);notes.push("其他獎勵先計入都更合計上限；本次都更採"+renewal+"%、其他獎勵"+scale+"%。");}\n  if (renewal < rates.renewal)');
 code=code.replace('rates.tdr > application.capPercent + 1e-8', 'tdr2 > application.capPercent + 1e-8');
 code=code.replace('const f = totalLimit / (renewal + scale + danger2);\n      renewal *= f;\n      scale *= f;\n      danger2 *= f;', 'errors.push("所選獎勵超過個案合計上限，請調整採用項目或比例；未依比例任意分攤獎勵。");');
 code+='\nfunction assessBonuses(a,c,cash,updateArea){\n const legal=reviewBonusConditions(a,c,{updateArea,renewal:a.route==="renewal"&&a.renewalMode==="detail"?1:0,danger:a.route==="danger"&&a.dangerMode==="detail"?1:0,tdr:a.tdrMode==="detail"?1:0});\n const result=assessBonusesBase(legal.assessment,c,cash,updateArea);\n return {...result,errors:[...new Set([...result.errors,...legal.errors])],notes:[...result.notes,...legal.notes]};\n}\n';
 return 'import {reviewBonusConditions,dangerLegalCap,isBonusConditions} from "../bonus-eligibility.mjs";\n'+code;
}

export function applyBonusEligibilityPanel(code){
 if(code.includes('/* bonus-eligibility-panel-hook */'))return code.replace('/* bonus-eligibility-panel-hook */ jsx2("div",','/* bonus-eligibility-panel-hook */ jsxs2("div",');
 const ast=parse(code,{sourceType:'module'}),edits=[];
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='ConditionalExpression'&&n.test?.name==='summaryIncomplete'){
   edits.push({start:n.start,end:n.end,text:`/* bonus-eligibility-panel-hook */ jsxs2("div", {children:[jsx2(BonusEligibilityPanel,{input,edit}), summaryIncomplete ? jsx2("p", {role:"status",children:"請完成基地資料、獎勵適用條件與本次採用比例。"}) : jsx2("p", {children:[a.route==="renewal"?"都更 "+f8(effective.renewal)+"%":a.route==="danger"?"危老 "+f8(effective.danger)+"%":"未採重建獎勵",effective.tdr>0?"容移 "+f8(effective.tdr)+"%":""].filter(Boolean).join("；")})]})`});
  }
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 }walk(ast.program);
 const panel=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='BonusAssessmentPanel');
 function remove(n){if(!n||typeof n!=='object')return;
 if(n.type==='CallExpression'&&n.arguments?.[0]?.value==='label'){let duplicate=false;function scan(v){if(!v||typeof v!=='object')return;if(v.type==='MemberExpression'&&v.object?.name==='a'&&['dangerEligibleSite','dangerAdjacentSite','dangerOriginal','source'].includes(v.property?.name))duplicate=true;for(const [k,x]of Object.entries(v))if(!['loc','extra'].includes(k)){if(Array.isArray(x))x.forEach(scan);else if(x&&typeof x==='object')scan(x);}}scan(n);if(duplicate){edits.push({start:n.start,end:n.end,text:'null'});return;}}
 if(n.type==='CallExpression'&&n.callee?.name==='qualification'){edits.push({start:n.start,end:n.end,text:'null'});return;}
 if(n.type==='CallExpression'&&n.arguments?.[1]?.type==='ObjectExpression'){const p=n.arguments[1].properties.find(p=>p.key?.name==='value');if(p?.value?.type==='MemberExpression'&&p.value.object?.name==='a'&&['dangerEligibleSite','dangerAdjacentSite','dangerOriginal'].includes(p.value.property?.name)){const parentLabel=code.slice(n.start,n.end);/* original numeric controls are hidden with their label below */}}
 for(const [k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(remove);else if(v&&typeof v==='object')remove(v);}}remove(panel);
 if(edits.filter(e=>e.text.includes('bonus-eligibility-panel-hook')).length!==1)throw Error('Missing bonus panel summary');
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 code=code.replace('type: "date", value: a.date, onChange:', 'type: "date", "aria-label":"預計報核／申請日期",value:a.date,onInput:(e)=>change({date:e.currentTarget.value}),onChange:');
 return 'import {BonusEligibilityPanel} from "../BonusEligibilityPanel.jsx";\n'+code;
}
