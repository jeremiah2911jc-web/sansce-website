import {parse} from '@babel/parser';
// Presentation only: retain every saved value and calculation handler.
export function applyBonusRouteVisibility(code){
 const ast=parse(code,{sourceType:'module'}),panel=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id?.name==='BonusAssessmentPanel'),edits=[];
 if(!panel)throw Error('Missing bonus UI panel');
 const hasText=(n,pattern)=>n&&typeof n==='object'&&(n.type==='StringLiteral'&&pattern.test(n.value)||Object.entries(n).some(([k,v])=>!['loc','extra','comments'].includes(k)&&(Array.isArray(v)?v.some(x=>hasText(x,pattern)):v&&typeof v==='object'&&hasText(v,pattern))));
 function walk(n,parent){
  if(!n||typeof n!=='object')return;
  if(n.type==='CallExpression'&&/^jsx/.test(n.callee.name||'')&&n.arguments[0]?.value==='details'){
   const children=n.arguments[1]?.properties?.find(p=>p.key?.name==='children')?.value;
   const title=children?.elements?.find(x=>x?.type==='CallExpression'&&x.arguments[0]?.value==='summary');
   const route=hasText(title,/都更細項/) ? 'renewal' : hasText(title,/危老細項/) ? 'danger' : null;
   if(route){const guard=`a.route === "${route}" && !permitted && `;
    if(!(parent?.type==='LogicalExpression'&&parent.right===n&&code.slice(Math.max(panel.start,n.start-guard.length),n.start)===guard))edits.push({start:n.start,end:n.start,text:guard});
   }
  }
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,n));else if(v&&typeof v==='object')walk(v,n);}
 }
 walk(panel,null);
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code;
}
