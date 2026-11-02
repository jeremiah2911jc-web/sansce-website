import {applyInputFlowPanel} from './apply-input-flow-panel.mjs';
import {applyBonusRouteVisibility} from './apply-bonus-route-visibility.mjs';
import {parse} from '@babel/parser';
import {publicText} from '../src/land-evaluation/public-copy.mjs';

// Only UI functions are adapted. Bundled quantity, validation and rule functions stay byte-identical.
export function applyEvaluationPanelCopy(code){
 code=applyInputFlowPanel(applyPanelLayout(code));
 const ast=parse(code,{sourceType:'module'}),edits=[];
 function visit(node,panel=''){
  if(!node||typeof node!=='object')return;
  if(node.type==='FunctionDeclaration')panel=node.id?.name?.endsWith('Panel')?node.id.name:'';
  if(panel&&node.type==='StringLiteral'){
   let value=publicText(node.value);
   if(panel==='IndustrialPanel')value=value.replace('匯出工業評估報告','預覽工業評估報告');
   if(value!==node.value)edits.push({start:node.start,end:node.end,text:JSON.stringify(value)});
  }
  if(panel==='IndustrialPanel'&&node.type==='ObjectProperty'&&node.key.name==='children'&&node.value.type==='Identifier'&&node.value.name==='x')edits.push({start:node.value.start,end:node.value.end,text:'publicText(x)'});
  if(panel==='IndustrialPanel'&&node.type==='CallExpression'&&node.callee.name==='onReport'&&node.arguments.length===1)edits.push({start:node.start,end:node.end,text:'onReport(m, r)'});
  for(const [key,value]of Object.entries(node)){
   if(['loc','extra','comments','tokens'].includes(key))continue;
   if(Array.isArray(value))value.forEach(n=>visit(n,panel));else if(value&&typeof value==='object')visit(value,panel);
  }
 }
 visit(ast);for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 return applyBonusRouteVisibility(code);
}

// Structural changes are confined to named UI panels and JSX runtime imports.
function applyPanelLayout(code){
 const ast=parse(code,{sourceType:'module'}),edits=[];
 function visit(node,panel=''){
  if(!node||typeof node!=='object')return;
  if(node.type==='FunctionDeclaration')panel=node.id?.name?.endsWith('Panel')?node.id.name:'';
  if(node.type==='ImportDeclaration'&&node.source.value==='react/jsx-runtime')edits.push({start:node.source.start,end:node.source.end,text:JSON.stringify('/src/land-evaluation/public-panel-runtime.mjs')});
  if(panel==='CommercialIntensityPanel'&&node.type==='FunctionDeclaration'&&!node.params[0].properties.some(p=>p.key?.name==='district'))edits.push({start:node.params[0].start+1,end:node.params[0].start+1,text:'district,'});
  if(panel==='CommercialIntensityPanel'&&node.type==='CallExpression'&&/^jsx/.test(node.callee.name||'')){
   const properties=node.arguments[1]?.properties||[],label=properties.find(p=>p.key?.value==='aria-label')?.value?.value;
   if(label==='商業區所在地'&&!properties.some(p=>p.key?.name==='disabled'))edits.push({start:node.arguments[1].start+1,end:node.arguments[1].start+1,text:' disabled: !!district, '});
   if(node.arguments[0]?.value==='option'&&properties.find(p=>p.key?.name==='value')?.value?.value==='taipei25'&&!code.slice(Math.max(0,node.start-35),node.start).endsWith('x.city === "臺北市" && ')){edits.push({start:node.start,end:node.end,text:'x.city === "臺北市" && '+code.slice(node.start,node.end)});return;}
  }
  if(panel==='LegalParkingPanel'&&node.type==='CallExpression'&&node.callee.name==='text'&&node.arguments[1]?.value==='district'){edits.push({start:node.start,end:node.end,text:'jsxs4("p", {children:["評估地區：",p.district]})'});return;}
  if(panel==='BonusAssessmentPanel'&&node.type==='CallExpression'&&node.callee.name==='mode'&&['renewalMode','dangerMode'].includes(node.arguments[0]?.value)){
   const route=node.arguments[0].value==='renewalMode'?'renewal':'danger',prefix='a.route === "'+route+'" && ';
   if(!code.slice(Math.max(0,node.start-prefix.length),node.start).endsWith(prefix)){edits.push({start:node.start,end:node.end,text:prefix+code.slice(node.start,node.end)});return;}
  }
  if(panel==='BonusAssessmentPanel'&&node.type==='ArrayExpression'&&node.elements[0]?.type==='ArrayExpression'&&node.elements[0].elements[0]?.value==='renewal'&&node.elements[0].elements[2]?.type==='MemberExpression'&&!code.slice(node.end,node.end+15).startsWith('.filter(')){edits.push({start:node.start,end:node.end,text:code.slice(node.start,node.end)+'.filter(([, , ,active]) => active)'});return;}
  if(panel==='BonusAssessmentPanel'&&node.type==='ObjectProperty'&&node.key.name==='children'&&node.value.type==='ArrayExpression'&&node.value.elements[0]?.value==='細項合計 '){edits.push({start:node.value.start,end:node.value.end,text:'a.renewalMode === "quick" ? "本次依上方獎勵目標試算；改用細項評定後，依下列條件計算。" : '+code.slice(node.value.start,node.value.end)});return;}
  if(panel==='TdrApplicationPanel'&&node.type==='FunctionDeclaration'&&!node.params[0].properties.some(p=>p.key?.name==='site'))edits.push({start:node.params[0].start+1,end:node.params[0].start+1,text:'site, far,'});
  if(panel==='BonusAssessmentPanel'&&node.type==='CallExpression'&&node.arguments[0]?.name==='TdrApplicationPanel'&&!node.arguments[1].properties.some(p=>p.key?.name==='site'))edits.push({start:node.arguments[1].start+1,end:node.arguments[1].start+1,text:'site:c.site,far:c.far,'});
  if(panel==='TdrApplicationPanel'&&node.type==='CallExpression'&&node.arguments[0]?.name==='TdrResult'&&!node.arguments[1].properties.some(p=>p.key?.name==='ready'))edits.push({start:node.arguments[1].start+1,end:node.arguments[1].start+1,text:'ready:site>0&&far>0,'});
  if(panel==='BonusAssessmentPanel'&&node.type==='MemberExpression'&&node.object.name==='d'&&node.property.name==='condition')edits.push({start:node.start,end:node.end,text:'bonusItemCondition(d,tdrCity)'});
  if(panel==='BonusAssessmentPanel'&&node.type==='StringLiteral'&&node.value==='都更細項：中央獎勵＋新北地方獎勵')edits.push({start:node.start,end:node.end,text:'tdrCity === "ntpc" ? "都更細項：中央獎勵與新北地方獎勵" : "都更細項：中央獎勵"'});
  if(panel==='BonusAssessmentPanel'&&node.type==='CallExpression'&&/^jsx/.test(node.callee.name||'')&&node.arguments[0]?.value==='p'){
   const children=node.arguments[1]?.properties?.find(p=>p.key?.name==='children')?.value;
   if(!code.slice(Math.max(0,node.start-30),node.start).endsWith('tdrCity === "ntpc" && ')&&children?.type==='ArrayExpression'&&children.elements.some(n=>n?.type==='StringLiteral'&&n.value==='地方小計')){edits.push({start:node.start,end:node.end,text:'tdrCity === "ntpc" && '+code.slice(node.start,node.end)});return;}
  }
  if(panel==='BonusAssessmentPanel'&&node.type==='CallExpression'&&node.callee.type==='MemberExpression'&&node.callee.object.name==='bonusItems'&&node.callee.property.name==='filter'&&!code.slice(node.start,node.end).includes('u-public')){
   const fn=node.arguments[0],body=code.slice(fn.body.start,fn.body.end);edits.push({start:fn.body.start,end:fn.body.end,text:'('+body+') && (tdrCity === "ntpc" || d.id !== "u-public")'});return;
  }
  if(panel==='TdrApplicationPanel'&&node.type==='CallExpression'&&/^jsx/.test(node.callee.name||'')){
   const props=node.arguments[1]?.properties||[],label=props.find(p=>p.key?.value==='aria-label')?.value?.value;
   if(label==='容移法規地區'&&node.arguments[0]?.name==='PublicSelect'){edits.push({start:node.start,end:node.end,text:'jsx("output", {"aria-label":"容移法規地區",children:district})'});return;}
   if(props.some(p=>p.key?.name==='dangerouslySetInnerHTML')){edits.push({start:node.start,end:node.end,text:'jsx(TdrResult, {ready:site>0&&far>0,review:r,application:t})'});return;}
  }
  if(panel==='TdrApplicationPanel'&&node.type==='ArrayExpression'&&node.elements.some(n=>n?.type==='ArrayExpression'&&n.elements[0]?.value==='playground')&&!code.slice(node.end,node.end+15).startsWith('.filter(')){edits.push({start:node.start,end:node.end,text:code.slice(node.start,node.end)+'.filter(([kind]) => t.city === "ntpc" || !["playground","sport","other_public"].includes(kind))'});return;}
  for(const[k,v]of Object.entries(node)){if(['loc','extra','comments','tokens'].includes(k))continue;if(Array.isArray(v))v.forEach(n=>visit(n,panel));else if(v&&typeof v==='object')visit(v,panel);}
 }
 visit(ast);
 for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 if(!code.includes('import { bonusItemCondition }'))code='import { bonusItemCondition } from "/src/land-evaluation/public-copy.mjs";\n'+code;
 if(!code.includes('import { TdrResult }'))code='import { TdrResult } from "/src/land-evaluation/public-panel-runtime.mjs";\n'+code;
 return code;
}
