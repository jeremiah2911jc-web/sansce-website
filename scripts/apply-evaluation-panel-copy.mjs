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
 code=applyBonusSectionLayout(applyTransferPresentation(applyPlanningAwardPresentation(applyBonusRouteVisibility(code))));
 return applyParkingControlsLayout(applyBasementLayout(applyHousingModeEntryLayout(applyIndustrialResultLayout(applyIndustrialFirstStep(code)))));
}

export function applyBonusSectionLayout(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='BonusAssessmentPanel');
 if(!panel||code.slice(panel.start,panel.end).includes('le-award-settings'))return code;
 const view=panel.body.body.find(node=>node.type==='ReturnStatement').argument;
 const children=view.arguments[1].properties.find(prop=>prop.key.name==='children').value;
 const [title,intro,methods,legacy,targets,status,detailTitle,detailGrid]=children.elements;
 const source=node=>code.slice(node.start,node.end);
 if(children.elements.length!==8||!source(detailGrid).includes('le-disclosure-grid')||!source(targets).includes('planning-field-grid'))throw Error('Bonus assessment layout changed');
 const jsx=title.callee.name,jsxs=view.callee.name;
 const entries=detailGrid.arguments[1].properties.find(prop=>prop.key.name==='children').value.elements;
 const detailGroup=(label,items)=>`${jsxs}("div",{className:"le-award-detail-group",children:[
    ${jsx}("h4",{children:${JSON.stringify(label)}}),
    ${jsxs}("div",{className:"le-disclosure-grid",children:[${items.map(source).join(',\n    ')}]})
   ]})`;
 const settings=`${jsxs}("div",{className:"le-award-settings",children:[
    ${jsxs}("header",{className:"le-award-heading",children:[${source(title)},${source(intro)}]}),
    ${source(methods).replace('className: "planning-field-grid"','className: "planning-field-grid le-award-methods"')},
    ${source(legacy)},
    ${source(targets).replace('className: "planning-field-grid", children:','className: "planning-field-grid le-award-targets", children: [scaleField, ...').replace('}, key)) })','}, key))] })')},
    ${source(status)}
   ]})`;
 const details=`${jsxs}("section",{className:"le-award-details",children:[
    ${source(detailTitle).replace('"h4"','"h3"').replace('申請資格、獎勵與容積移轉細項','申請與評定細項')},
    ${detailGroup('申請條件',entries.slice(0,2))},
    ${detailGroup('分項評定',entries.slice(2))}
   ]})`;
 const params=panel.params[0],tail=params.properties.at(-1);
 return code.slice(0,tail.end)+',\n  scaleField = null'+code.slice(tail.end,children.start)+`[\n   ${settings},\n   ${details}\n  ]`+code.slice(children.end);
}

function applyPlanningAwardPresentation(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='BonusAssessmentPanel');
 if(!panel)return code;
 const children=panel.body.body.find(n=>n.type==='ReturnStatement').argument.arguments[1].properties.find(p=>p.key.name==='children').value.elements;
 const selector=children.findIndex(n=>n?.type==='CallExpression'&&code.slice(n.start,n.end).includes('awardBasis: e.target.value'));
 const edits=[];
 if(selector>=0){
  const next=children[selector+1];
  if(next?.type!=='LogicalExpression'||next.left.name!=='permitted')throw Error('Approved award fields missing');
  edits.push({start:children[selector].start,end:children[selector+2].start,text:'permitted && jsxs2("div",{className:"le-legacy-award",children:[jsx2("p",{children:"此案件檔採用既有核定或核准的獎勵面積。"}),jsx2("button",{type:"button",className:"le-text-button","data-planning-key":"legacyAward",onClick:()=>change({awardBasis:"target"}),children:"改用規劃試算"})]}),\n    '});
  const approval=panel.body.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='approval'));
  edits.push({start:approval.declarations[0].end,end:approval.end-1,text:''});
 }
 function visit(n){
  if(!n||typeof n!=='object')return;
  if(n.type==='CallExpression'&&n.arguments[0]?.value==='details'){
   const heading=n.arguments[1]?.properties?.find(p=>p.key.name==='children')?.value.elements?.[0];
   if(heading?.arguments?.[0]?.value==='summary'&&heading.arguments[1].properties.find(p=>p.key.name==='children')?.value.value==='容積獎勵與移轉的法令依據'){
    edits.push({start:n.start,end:n.end,text:'null'});
    return;
   }
  }
  if(n.type==='CallExpression'&&n.arguments[0]?.value==='small'){
   const note=n.arguments[1]?.properties?.find(p=>p.key.name==='children')?.value;
   if(note?.type==='ConditionalExpression'&&note.alternate?.alternate?.alternate?.value?.startsWith('規劃目標')){
    edits.push({start:n.start,end:n.end,text:'m === "detail" && !(permitted && key !== "tdr") && jsx2("small",{children:"依細項評定"})'});
    return;
   }
  }
  for(const [k,v]of Object.entries(n)){
   if(['loc','extra','comments','tokens'].includes(k))continue;
   if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);
  }
 }
 children.forEach(visit);
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code
  .replace('.filter(([, , ,active]) => active).map(([key, label, m, active])', '.filter(([key, ,mode,active]) => active && mode === "quick" && !(permitted && key !== "tdr")).map(([key, label, m, active])')
  .replace(',\n      /* @__PURE__ */ m === "detail" && !(permitted && key !== "tdr") && jsx2("small",{children:"依細項評定"})','');
}

function applyTransferPresentation(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='TdrApplicationPanel');
 if(!panel)return code;
 const props=node=>node.arguments[1].properties;
 const property=(node,key)=>props(node).find(p=>(p.key.name??p.key.value)===key);
 const children=node=>property(node,'children').value.elements;
 const section=panel.body.body.find(n=>n.type==='ReturnStatement').argument;
 const className=property(section,'className').value;
 if(className.value.includes('le-tdr-application'))return code;
 const [title,intro,setup,permit,review,permitStage,resultDetails]=children(section);
 const basis=children(setup)[2];
 const selector=children(basis)[1],options=children(selector);
 const approved=options.find(n=>property(n,'value').value.value==='permitted');
 const reviewBlocks=children(review);
 const [localRules,road,eligibility]=reviewBlocks;
 const methodNotice=reviewBlocks.at(-1);
 const cashHelp=property(children(reviewBlocks.at(-2).right)[2],'children').value;
 const eligibilityHeading=children(eligibility)[0];
 const edits=[
  {start:className.start,end:className.end,text:'"area-review-panel le-tdr-application"'},
  {start:title.start,end:setup.start,text:''},
  {start:property(setup,'className').value.start,end:property(setup,'className').value.end,text:'"planning-field-grid le-tdr-setup"'},
  {start:basis.start,end:basis.start,text:'t.quantityBasis !== "permitted" && '},
  {start:approved.start,end:options[options.indexOf(approved)+1].start,text:''},
  {start:permit.start,end:permit.end,text:'t.quantityBasis === "permitted" && jsxs("div",{className:"le-legacy-award",children:[jsx("p",{children:"此案件檔採用原容積移轉許可量。"}),jsx("button",{type:"button",className:"le-text-button","data-planning-key":"legacyTransfer",onClick:()=>edit({quantityBasis:"target"}),children:"改用規劃移入量"})]})'},
  {start:localRules.start,end:road.start,text:''},
  {start:reviewBlocks.at(-2).end,end:methodNotice.end,text:''},
  {start:cashHelp.start,end:cashHelp.start,text:'financials ? '},
  {start:cashHelp.end,end:cashHelp.end,text:' : "按申請量試算時，填預計以代金取得的移入容積，單位為平方公尺。"'},
  {start:permitStage.start,end:resultDetails.start,text:''},
  {start:road.start,end:road.end,text:'jsxs("p",{className:"le-tdr-road",children:["計畫道路寬度 ",t.roadWidth ? t.roadWidth+" m" : "未填"," · 同一路段基地面寬 ",t.roadFrontage ? t.roadFrontage+" m" : "未填","。可在基地道路條件修改。"]})'},
  {start:eligibilityHeading.end,end:eligibilityHeading.end,text:',\n        '+code.slice(intro.start,intro.end)+',\n        '+code.slice(localRules.start,localRules.end)},
 ];
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code;
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
  if(panel==='BonusAssessmentPanel'&&node.type==='MemberExpression'&&node.object.name==='r'&&node.property.name==='messages')edits.push({start:node.start,end:node.end,text:'bonusItemMessages(d,r,input)'});
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
   if(['容移法規地區','容積移轉適用地區'].includes(label)&&node.arguments[0]?.name==='PublicSelect'){edits.push({start:node.start,end:node.end,text:'jsx("output", {"aria-label":"容積移轉適用地區",children:district})'});return;}
   if(props.some(p=>p.key?.name==='dangerouslySetInnerHTML')){edits.push({start:node.start,end:node.end,text:'jsx(TdrResult, {ready:site>0&&far>0,review:r,application:t})'});return;}
  }
  if(panel==='TdrApplicationPanel'&&node.type==='ArrayExpression'&&node.elements.some(n=>n?.type==='ArrayExpression'&&n.elements[0]?.value==='playground')&&!code.slice(node.end,node.end+15).startsWith('.filter(')){edits.push({start:node.start,end:node.end,text:code.slice(node.start,node.end)+'.filter(([kind]) => t.city === "ntpc" || !["playground","sport","other_public"].includes(kind))'});return;}
  for(const[k,v]of Object.entries(node)){if(['loc','extra','comments','tokens'].includes(k))continue;if(Array.isArray(v))v.forEach(n=>visit(n,panel));else if(v&&typeof v==='object')visit(v,panel);}
 }
 visit(ast);
 for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 if(!code.includes('import { bonusItemCondition'))code='import { bonusItemCondition, bonusItemMessages } from "/src/land-evaluation/public-copy.mjs";\n'+code;
 else code=code.replace('import { bonusItemCondition }','import { bonusItemCondition, bonusItemMessages }');
 if(!code.includes('import { TdrResult }'))code='import { TdrResult } from "/src/land-evaluation/public-panel-runtime.mjs";\n'+code;
 return code;
}

// Keep the App's industrial inputs and calculation while placing the website's
// land editor in the main form. Apply the same adaptation on future syncs.
export function applyIndustrialFirstStep(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='IndustrialPanel');
 if(!panel||code.slice(panel.start,panel.end).includes('industrial-first-step'))return code;
 const prop=(node,key)=>node.arguments[1].properties.find(p=>p.key.name===key);
 const elements=node=>prop(node,'children').value.elements;
 const view=panel.body.body.find(node=>node.type==='ReturnStatement').argument;
 const [heading,intro,fields,modeNote,land,...rest]=elements(view);
 const [mode,name,edition,date,city,regime]=elements(fields);
 const [, , parcels,add]=elements(land);
 const source=node=>code.slice(node.start,node.end);
 const jsx=heading.callee.name,jsxs=view.callee.name;
 const first=`${jsxs}("section", { className:"industrial-first-step", children:[
  ${jsx}("h3",{children:"工業基地與土地分項"}),
  ${jsxs}("div",{className:"mz-fields industrial-location",children:[${source(city)},${source(regime)}]}),
  ${jsxs}("div",{className:"lw-first-actions",children:[${source(add)},renderSources?.(m.city)]}),
  ${jsx}("p",{children:"依土地登記謄本填地號與登記面積，並核對都市計畫書或非都市土地使用地編定。總面積與不採計面積分填。"}),
  ${source(parcels)},
  m.parcels.length > 0 && ${jsx}("p", { children: "更新範圍、建築基地與容積採計範圍分列。公共設施用地、道路及廢巷依個案變更公告或核定計畫書填寫採計範圍。" })
 ]})`;
 const meta=`${jsxs}("details",{children:[
  ${jsx}("summary",{children:"案件名稱、評估日期與採用版本"}),
  ${jsxs}("div",{className:"mz-fields",children:[${source(mode)},${source(name)},${source(date)},${source(edition).replace(source(edition.arguments[0]),'m.mode === "document" ? "計畫書、建造執照或圖說的版本／文號" : "規劃資料版本"')}]}),
  ${source(modeNote)}
 ]})`;
 const entries=prop(view,'children').value;
 const firstAction=rest.findIndex(node=>node.arguments?.[0]?.name==='DevelopmentPanel');
 if(firstAction<0)throw Error('Industrial configuration panel missing');
 const [route,awards,floors,conditions,evidence,law]=rest.slice(0,firstAction).map(source);
 const group=(title,controls)=>`${jsxs}("section",{className:"le-industrial-group",children:[
  ${jsx}("h3",{children:${JSON.stringify(title)}}),
  ${jsxs}("div",{className:"le-settings-grid",children:[${controls.join(',\n    ')}]})
 ]})`;
 const updated=[`${jsx}("h1",{children:"工業土地與廠房開發"})`,source(intro),first,
  group('開發途徑與樓層配置',[route,awards,conditions,floors]),
  group('案件資料與法規依據',[meta,evidence,law]),
  ...rest.slice(firstAction).map(source)].join(',\n    ');
 const params=panel.params[0];
 return code.slice(0,params.end-1)+', renderSources '+code.slice(params.end-1,entries.start)+'[\n    '+updated+'\n  ]'+code.slice(entries.end);
}

export function applyIndustrialResultLayout(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='IndustrialPanel');
 if(!panel||code.slice(panel.start,panel.end).includes('industrial-input-gaps'))return code;
 const prop=(node,key)=>node.arguments[1].properties.find(p=>p.key.name===key);
 const view=panel.body.body.find(node=>node.type==='ReturnStatement').argument;
 const children=prop(view,'children').value.elements;
 const development=children.find(node=>node.arguments?.[0]?.name==='DevelopmentPanel');
 const result=children.at(-1).right;
 const rows=prop(result,'children').value;
 const [title,name,mode,totals,developmentResult,landRows,limits,issues,notes,report]=rows.elements;
 if(rows.elements.length!==10||!development||prop(totals,'className')?.value.value!=='mz-totals')throw Error('Industrial result layout changed');
 const source=node=>code.slice(node.start,node.end);
 const jsx=title.callee.name,jsxs=view.callee.name;
 const knownTotals=source(totals).replace('Object.entries(r.quantities).map','Object.entries(r.quantities).filter(([,value])=>Number.isFinite(value)).map');
 const missing=`(r.errors.length>0||r.missing.length>0) && ${jsxs}("div",{className:"industrial-input-gaps",children:[
   ${jsx}("h4",{children:"基地、開發途徑與採計依據"}),
   ${source(issues)}
  ]})`;
 const developmentView=source(developmentResult).replace(/\{ children: \[/, '{ className:"industrial-development-status",children: [');
 const updated=[source(title),missing,developmentView,source(name),source(mode),
   'Object.values(r.quantities).some(Number.isFinite) && '+knownTotals,
   source(landRows),source(limits),source(notes),source(report)].join(',\n    ');
 return code.slice(0,development.start)+`${jsxs}("section",{className:"industrial-development-task",children:[
  ${jsx}("p",{children:"逐棟逐層用途配置填樓板面積。下方另填出租、自用、捐贈及共用面積的分配。"}),
  ${source(development)}
 ]})`+code.slice(development.end,rows.start)+'[\n    '+updated+'\n   ]'+code.slice(rows.end);
}

export function applyHousingModeEntryLayout(code){
 const panels=parse(code,{sourceType:'module'}).program.body;
 const prop=(node,key)=>node?.arguments?.[1]?.properties?.find(p=>p.key.name===key)?.value;
 const view=name=>panels.find(node=>node.type==='FunctionDeclaration'&&node.id.name===name)
   ?.body.body.find(node=>node.type==='ReturnStatement')?.argument;
 const source=node=>code.slice(node.start,node.end);
 const edits=[];
 const mixed=prop(view('MixedZonePanel'),'children');
 if(mixed&&prop(mixed.elements[1],'className')?.value!=='mz-section-title'){
  const [heading,fields,boundary,joint,add,zones]=mixed.elements;
  if(prop(add,'className')?.value!=='mz-section-title'||zones.callee?.object?.property?.name!=='zones')throw Error('Mixed zone entry layout changed');
  edits.push({start:heading.end,end:zones.end,text:',\n    '+[add,zones,fields,boundary,joint].map(source).join(',\n    ')});
 }
 const review=prop(view('DocumentCasePanel'),'children');
 const reviewFields=prop(review?.elements[2],'children');
 if(reviewFields){
  const [name,edition,basis]=reviewFields.elements;
  if(source(name.arguments[1])==='m.name'){
   if(source(edition.arguments[1])!=='m.edition'||source(basis.arguments[1])!=='m.source')throw Error('Document review entry layout changed');
   edits.push({start:name.start,end:basis.end,text:[edition,basis,name].map(source).join(',\n      ')});
  }
 }
 for(const {start,end,text} of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,start)+text+code.slice(end);
 return code;
}

export function applyBasementLayout(code){
 const panels=parse(code,{sourceType:'module'}).program.body;
 const panel=panels.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='BasementDemandPanel');
 if(!panel||code.slice(panel.start,panel.end).includes('basement-excavation'))return code;
 const children=node=>node.arguments[1].properties.find(p=>p.key.name==='children').value;
 const source=node=>code.slice(node.start,node.end);
 const root=panel.body.body.find(node=>node.type==='ReturnStatement').argument;
 const list=children(root);
 const [heading,controls,taipei,nangang,demand]=list.elements;
 const advanced=children(demand.right).elements;
 const [rule,compare,type,warehouse,settings,review,errors]=advanced;
 if(list.elements.length!==5||advanced.length!==7||type.arguments?.[0]?.value!=='label')throw Error('Basement demand layout changed');
 const jsx=heading.callee.name,jsxs=root.callee.name;
 const block=(className,title,contents)=>`${jsxs}("section",{className:${JSON.stringify(className)},children:[
    ${jsx}("h3",{children:${JSON.stringify(title)}}),
    ${contents.join(',\n    ')}
  ]})`;
 const modeControls=source(controls)
  .replace('className: "planning-field-grid"','className: "planning-field-grid basement-rule-fields"')
  .replace(/(?<=value: "demand", children: )"[^"]+"/,'"依停車需求試算"')
  .replace(/(?<=value: "fixed", children: )"[^"]+"/,'"指定開挖與層數"')
  .replace(/(?<=value: "ntpc_general", children: )"[^"]+"/,'"新北市一般開挖規定"');
 const ntpc=rule.alternate.consequent;
 const [ntpcCap,ntpcNote,ntpcDetails]=children(ntpc).elements;
 const cap=(call)=>source(call).replace(/PublicNumber\d*, \{[^}]+\}/,
  `"output", { className:"basement-cap-value", "aria-label":"法規開挖率上限", children:showLimit ? f(limit.cap) + "%" : hasBase ? "待選適用條件" : "待填基地面積及建蔽率" }`);
 const taipeiCap=cap(rule.consequent);
 const ntpcRow=`${jsxs}("div",{className:"basement-cap-row",children:[${cap(ntpcCap)},${source(ntpcDetails)}]})`;
 const ruleView=source(rule)
  .replace(source(rule.consequent),taipeiCap)
  .replace(source(ntpc),`${jsxs}(Fragment3,{children:[${ntpcRow},${source(ntpcNote)}]})`);
 const groups=[
  block('basement-excavation','地下配置與開挖',[modeControls,source(taipei),source(nangang),`d.enabled && ${ruleView}`,`d.enabled && ${source(errors)}`]),
  `d.enabled && ${block('basement-alternatives','停車設備與替代方案',[
   source(compare).replace(source(children(compare).elements[1]),'"比較汽車升降機與機械停車"'),
   `${jsxs}("div",{className:"basement-equipment-actions",children:[${source(type)},${source(settings)}]})`,
   source(warehouse)
  ])}`,
  `d.enabled && (${source(review)})`
 ];
 return (code.slice(0,list.start)+'[\n    '+groups.join(',\n    ')+'\n  ]'+code.slice(list.end))
  .replace('載人電梯與共用樓梯與電梯空間','載人電梯與樓梯空間');
}

export function applyParkingControlsLayout(code){
 const panel=parse(code,{sourceType:'module'}).program.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='LegalParkingPanel');
 if(!panel||code.slice(panel.start,panel.end).includes('le-parking-controls'))return code;
 const children=node=>node.arguments[1].properties.find(p=>p.key.name==='children').value.elements;
 const root=panel.body.body.find(node=>node.type==='ReturnStatement').argument;
 const controls=children(root)[0].right;
 const [demand,perUnit,basis]=children(controls);
 if(basis.arguments?.[0]?.value!=='label'||perUnit.type!=='LogicalExpression')throw Error('Parking controls layout changed');
 const source=node=>code.slice(node.start,node.end);
 const group=`${root.callee.name}("div",{className:"planning-field-grid le-parking-controls",children:[
   ${[demand,basis,perUnit].map(source).join(',\n   ')}
  ]})`;
 return code.slice(0,demand.start)+group+code.slice(basis.end);
}
