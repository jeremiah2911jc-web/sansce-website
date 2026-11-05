import {parse} from '@babel/parser';

// Presentation only: keep the shared panel's fields, handlers and calculations.
export function applyDisclosureLayout(code){
 if(code.includes('className:"le-disclosure-grid"'))return code.replace('jsx2("h4",{children:"細項設定與資料查證"}),jsx2("p",{children:"選一項開啟視窗，查看或修改後返回表單。"})','jsx2("h4",{children:"申請資格、獎勵與容積移轉細項"})');
 const ast=parse(code,{sourceType:'module'}),panel=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='BonusAssessmentPanel');
 if(!panel)throw Error('Bonus panel missing for disclosure layout');
 const children=panel.body.body.find(n=>n.type==='ReturnStatement').argument.arguments[1].properties.find(p=>p.key.name==='children').value;
 const hook=children.elements.find(n=>n?.type==='CallExpression'&&n.arguments[0]?.value==='div'&&n.arguments[1]?.properties.some(p=>p.key.name==='children'&&p.value.type==='ArrayExpression'&&p.value.elements[0]?.arguments?.[0]?.name==='BonusEligibilityPanel'));
 if(!hook)throw Error('Bonus eligibility wrapper missing for disclosure layout');
 const content=hook.arguments[1].properties.find(p=>p.key.name==='children').value.elements;
 const param=panel.params[0].properties.find(p=>p.key.name==='financials');
 const edits=[
  {start:param.end,end:param.end,text:',\n  afterDisclosures = null'},
  {start:hook.start,end:hook.end,text:content.slice(1).map(n=>code.slice(n.start,n.end)).join(',')+',\n    jsxs2("header", {className:"le-disclosure-heading",children:[jsx2("h4",{children:"申請資格、獎勵與容積移轉細項"})]}),\n    jsxs2("div", {className:"le-disclosure-grid",children:['+code.slice(content[0].start,content[0].end)},
  {start:children.end-1,end:children.end-1,text:',\n    afterDisclosures\n    ] })\n  '}
 ];
 for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 return code;
}
