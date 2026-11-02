import {parse} from '@babel/parser';
// Move bonus-limit editing into the website's base tab; leave bundled solvers intact.
export function applyInputFlowPanel(code){
 const ast=parse(code,{sourceType:'module'}),panel=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='RegulatoryReviewPanel');
 if(!panel||panel.params[0].properties.some(p=>p.key?.name==='section'))return code;
 const edits=[{start:panel.params[0].start+1,end:panel.params[0].start+1,text:'section = "all",'}];
 let found=false;
 function visit(n){if(!n||typeof n!=='object'||found)return;
  if(n.type==='CallExpression'&&n.arguments[0]?.value==='details'){
   const children=n.arguments[1]?.properties?.find(p=>p.key?.name==='children')?.value;
   if(children?.elements?.some(e=>e?.arguments?.[1]?.properties?.some(p=>p.key?.name==='children'&&p.value.value==='獎勵、容移上限與評點假設'))){edits.push({start:n.start,end:n.end,text:'section !== "basement" && '+code.slice(n.start,n.end)});found=true;return;}
  }
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
 }
 visit(panel);if(!found)throw Error('Bonus-limit panel not found');
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code;
}
