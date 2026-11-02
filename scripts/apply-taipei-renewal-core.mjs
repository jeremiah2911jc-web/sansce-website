import {parse} from '@babel/parser';
export const taipeiCoreFunctions=['isBonusAssessment','assessBonuses','resolveBonusLimits'];
// One local extension is consumed by both original bundles. All other functions remain intact.
export function applyTaipeiRenewalCore(code){
 if(code.includes('/* taipei-renewal-hook */'))return code;
 const ast=parse(code,{sourceType:'module'}),edits=[];
 const fn=name=>{const n=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);if(!n)throw Error('Missing shared function '+name);return n;};
 const add=(n,text)=>edits.push({start:n.body.start+1,end:n.body.start+1,text:'\n'+text+'\n'});
 add(fn('isBonusAssessment'),'  /* taipei-renewal-hook */\n  if (x && typeof x === "object" && x.taipei !== undefined && !isTaipeiRenewal(x.taipei)) return false;');
 add(fn('assessBonuses'),'  if (taipeiRenewalApplies(a,c)) return applyTaipeiRenewal(assessBonuses({...a,taipei:undefined},c,cash,updateArea),a,c);');
 const limits=fn('resolveBonusLimits');
 const node=limits.body.body.find(n=>n.type==='VariableDeclaration'&&n.kind==='let'&&n.declarations.some(d=>d.id.name==='renewalLimit'));
 if(!node)throw Error('Missing limit adoption point');
 edits.push({start:node.start,end:node.start,text:`if (assessment?.taipei?.active) {
    const cap=assessment.taipei.totalCap;
    const specified=p.renewalLimitPercent.trim()?Number(p.renewalLimitPercent):cap;
    if(!Number.isFinite(specified)||specified<0) errors.push("臺北都更獎勵上限請填有效非負數值。");
    p={...p,renewalLimitPercent:String(Math.min(Number.isFinite(specified)&&specified>=0?specified:cap,cap)),bonusSource:p.bonusSource.trim()||a.taipei.source};
  }
  `});
 const output=limits.body.body.find(n=>n.type==='ReturnStatement');
 if(!output)throw Error('Missing bonus result');
 edits.push({start:output.start,end:output.start,text:`if (assessment?.taipei?.active) {
    for(let i=notes.length-1;i>=0;i--) if(notes[i].startsWith("都更及容移均為")) notes.splice(i,1);
    notes.push("臺北都更中央與地方獎勵依本次適用路徑檢核，上限"+assessment.taipei.totalCap+"%；容移另依接受基地資格與取得條件檢核。");
  }
  `});
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return 'import { isTaipeiRenewal,taipeiRenewalApplies,applyTaipeiRenewal } from "../taipei-renewal/model.mjs";\n'+code;
}
