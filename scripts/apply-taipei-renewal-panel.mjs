import {parse} from '@babel/parser';
export function applyTaipeiRenewalPanel(code){
 if(code.includes('import { TaipeiRenewalPanel }'))return code;
 const ast=parse(code,{sourceType:'module'}),fn=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='BonusAssessmentPanel'),edits=[];
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='CallExpression'&&n.callee.name==='items'&&n.arguments[0]?.type==='ConditionalExpression'&&n.arguments[0].consequent?.elements?.some(x=>x.value==='local'))edits.push({start:n.end,end:n.end,text:', tdrCity === "taipei" && a.route === "renewal" && !permitted && jsx2(TaipeiRenewalPanel,{assessment:a,context:c,change})'});
  // This paragraph describes the central-only legacy table. Taipei's qualified strategy is now handled below it.
  if(n.type==='StringLiteral'&&n.value.startsWith('需確認事業計畫範圍、合法原建物與容積、更新方式'))edits.push({start:n.start,end:n.end,text:'tdrCity === "taipei" ? "請確認事業計畫範圍、合法原建物與容積、更新方式及各項條件。中央、地方與其他獎勵的重複部分須扣除。臺北策略性更新另於地方獎勵區檢核；特殊原容積、高氯或耐震危險案件另依文件評估。" : '+code.slice(n.start,n.end)});
  if(n.type==='StringLiteral'&&n.value.includes('扣重複後及一般上限採'))edits.push({start:n.start,end:n.end,text:'tdrCity === "taipei" ? '+JSON.stringify(n.value.replace('一般上限','本次路徑上限'))+' : '+code.slice(n.start,n.end)});
  if(n.type==='ConditionalExpression'&&n.test?.left?.name==='tdrCity'&&n.consequent?.value==='都更細項：中央獎勵與新北地方獎勵')edits.push({start:n.alternate.start,end:n.alternate.end,text:'tdrCity === "taipei" ? "都更細項：中央與臺北地方獎勵" : '+code.slice(n.alternate.start,n.alternate.end)});
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
 walk(fn);if(!edits.some(e=>e.text.includes('jsx2(TaipeiRenewalPanel')))throw Error('Taipei panel insertion missing');
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return 'import { TaipeiRenewalPanel } from "/src/land-evaluation/taipei-renewal/TaipeiRenewalPanel.jsx";\n'+code;
}
