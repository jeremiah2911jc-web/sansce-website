import {parse} from '@babel/parser';
export const DANGER_AREA_FIX_VERSION='danger-area-validation.2026-11-02.v1';
// Scope: the existing assessBonuses function only. Unknown active danger areas
// block calculation; inactive paths retain their existing outputs and notes.
export function applyDangerAreaFix(code,{typescript=false}={}){
 if(code.includes('/* danger-area-validation-hook */'))return code;
 const ast=parse(code,{sourceType:'module',plugins:typescript?['typescript']:[]});
 const declarations=ast.program.body.map(n=>n.type==='ExportNamedDeclaration'?n.declaration:n);
 const fn=declarations.find(n=>n?.type==='FunctionDeclaration'&&n.id.name==='assessBonuses');
 if(!fn)throw Error('Danger-area fix: assessBonuses missing');
 const edits=[];let eligibility=0,validation=0;
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='VariableDeclarator'&&n.id.name==='eligible'&&n.init?.type==='ConditionalExpression'&&n.init.alternate?.name==='NaN'){
   edits.push({start:n.init.alternate.start,end:n.init.alternate.end,text:'dangerActive ? 0 : NaN'});eligibility++;
  }
  if(n.type==='IfStatement'&&code.slice(n.test.start,n.test.end).includes('dangerSize')&&code.slice(n.test.start,n.test.end).includes('dangerEligibleSite')){
   edits.push({start:n.test.start,end:n.test.end,text:'dangerActive && (!a.dangerEligibleSite.trim() || !a.dangerAdjacentSite.trim())'});
   const call=n.consequent.expression;if(call?.type!=='CallExpression'||call.arguments[0]?.type!=='StringLiteral')throw Error('Danger-area fix: validation message missing');
   edits.push({start:call.arguments[0].start,end:call.arguments[0].end,text:JSON.stringify('請填寫危老原合格基地面積及鄰地面積；沒有鄰地請填0。')});validation++;
  }
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 }walk(fn);
 if(eligibility!==1||validation!==1)throw Error('Danger-area fix: unexpected shared function shape');
 edits.push({start:fn.body.start+1,end:fn.body.start+1,text:'\n  /* danger-area-validation-hook */\n'});
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code;
}
