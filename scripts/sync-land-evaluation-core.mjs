import {publicText} from '../src/land-evaluation/public-copy.mjs';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const app=process.env.SANZE_CASES_SOURCE || '/Users/jeremiah/src/sanze-cases-desktop';
const {build}=createRequire(resolve(app,'package.json'))('esbuild');
const {transformSync}=createRequire(resolve(root,'package.json'))('@babel/core');
const dir=resolve(root,'src/land-evaluation/generated');
await mkdir(dir,{recursive:true});
const core=`export {newIndustrial,isIndustrial,calculateIndustrial,industrialReport,INDUSTRIAL_VERSION} from '${app}/src/lib/industrial/model.ts';
export {newDocumentCase,isDocumentCase,calculateDocumentCase,documentCaseSummary} from '${app}/src/lib/mixed-zone/documentCase.ts';
export {calculateProgramReview} from '${app}/src/lib/mixed-zone/programReview.ts';
export {newCommercialIntensity,isCommercialIntensity,calculateCommercialIntensity} from '${app}/src/lib/mixed-zone/commercialIntensity.ts';
export {newMixedSite,isMixedSite,calculateMixedSite,mixedSummary} from '${app}/src/lib/mixed-zone/model.ts';
export {calculatePlanning,planningAssumptionsTemplate,defaultPlanningInput,normalizePlanningInput,planningFields,PLANNING_VERSION} from '${app}/src/lib/planning/autonomousPlanning.ts';
export {defaultSmallSiteParking} from '${app}/src/lib/planning/smallSiteParking.ts';
export {defaultBasementDemand} from '${app}/src/lib/planning/basementDemand.ts';
export {newParkingDesign} from '${app}/src/lib/planning/legalParking.ts';
export {newSiteRoadConditions} from '${app}/src/lib/site/siteRoadConditions.ts';
export {defaultRegulatoryReview} from '${app}/src/lib/planning/regulatoryReview.ts';
export {renderRoofEnvelope} from '${app}/src/lib/planning/roofEnvelope.ts';
export {landAreaRatios} from '${app}/src/lib/planning/landAreaRatios.ts';`;
const ui=['BonusAssessmentPanel','LegalParkingPanel','AreaReviewPanel','RegulatoryReviewPanel','SiteRoadConditionsPanel'].map(n=>`export {${n}} from '${app}/src/components/efficiency/${n}.tsx';`).join('\n')+`\nexport {AssessmentMode,DocumentCasePanel} from '${app}/src/components/mixed-zone/DocumentCasePanel.tsx';
export {ProgramReviewPanel} from '${app}/src/components/mixed-zone/ProgramReviewPanel.tsx';
export {MixedZonePanel} from '${app}/src/components/mixed-zone/MixedZonePanel.tsx';
export {CommercialIntensityPanel} from '${app}/src/components/mixed-zone/CommercialIntensityPanel.tsx';`;
const industrialUi=`\nexport {IndustrialPanel} from '${app}/src/components/industrial/IndustrialPanel.tsx';`;
const land=`export {newLandAssessment,newLandFact,landRegimes,intendedUses,buildingForms,factStatuses,evidenceKinds,landFactIssues,landAssessmentIssues,landAssessmentSummary} from '${app}/src/cases/landAssessment.ts';
export {evaluateLand} from '${app}/src/cases/land-rules/engine.ts';
export {newLegalInputs,applicantFields,answers,validDate} from '${app}/src/cases/land-rules/types.ts';
export {RULE_VERSION,REVIEWED_AT,lawSources,localCatalog,sourceById} from '${app}/src/cases/land-rules/catalog.ts';
export {newRoutePlan,summarizePlan,automaticDocumentExemption,emptyEvidence,routeBasisKey,documentValues,progressValues,reviewValues} from '${app}/src/cases/land-routes/model.ts';
export {dossierById,ROUTE_VERSION} from '${app}/src/cases/land-routes/catalog.ts';
export {localProfile,localRulesFor,LOCAL_VERSION} from '${app}/src/cases/land-local/catalog.ts';
export {newLayout,newGroup,newHouse,newFloor,calculateLayout,layoutBasis,referenceConditions,LAYOUT_VERSION,layoutSources,snapshotLayout} from '${app}/src/cases/land-layout/model.ts';`;
const sources=new Map();
for(const [name,contents]of [['core',core],['panels',ui+industrialUi],['land',land]]){
 const output=resolve(dir,name+'.mjs');
 const publicUi={name:'public-only-ui-copy',setup(build){build.onLoad({filter:/\/components\/efficiency\/.*Panel\.tsx$/},async({path})=>{
  let text=await readFile(path,'utf8');
  text=text.replaceAll('計畫路寬、實際開闢寬度與基地面寬分別保存','計畫路寬、實際開闢寬度與基地面寬分別填寫').replaceAll('阻擋採用','阻擋計算').replaceAll('以下只保存目標不影響計算','以下僅供本次操作，不影響快速值').replaceAll('此路徑未採用，資料保留','此路徑未採用，本次不加總').replaceAll('模式為','取值方式為');
  if(path.endsWith('/LegalParkingPanel.tsx'))text=text.replace(/ <div className="legal-parking-counts"[\s\S]*?<\/div>\)\}<\/div>/, ` {v&&<><section className="le-parking-overview" aria-label="停車配置初估"><div className="le-parking-total"><span>規劃汽車位</span><strong>{v.cars}<small>位</small></strong></div><div className="le-parking-capacity"><p>{general?'通則法定需求':'法定需求'} <b>{z?.legal}</b> 位，{v.smallSite?'開挖範圍潛在容量':'地下室估算容量'} <b>{v.capacity}</b> 位。</p><div className="le-parking-capacity-track" role="img" aria-label={\`規劃\${v.cars}位，容量\${v.capacity}位\`}><span style={{width:Math.min(100,v.capacity>0?v.cars/v.capacity*100:0)+'%'}}/></div><p>{v.smallSite?\`尚可規劃\${v.remainingExtra}位，增設須重新計算樓板與容積。\`:v.cars>v.capacity?'目前規劃超出估算容量，請調整配置。':\`本次配置後，估算尚餘\${v.remainingExtra}位。\`}</p></div></section><details className="le-parking-extras"><summary>增設車位明細</summary><dl><div><dt>指定增設</dt><dd>{input.extraCars||'0'} 位</dd></div><div><dt>本次採用增設</dt><dd>{v.adoptedExtra} 位</dd></div></dl></details></>}`).replace('先確認法定停車依據及規劃條件，再計算容量與地下層數。','填入基地條件後，這裡會顯示車位需求與地下室容量。');
  if(path.endsWith('/BonusAssessmentPanel.tsx'))text=text.replace(/ <p><button className="secondary-btn"[\s\S]*?快速採都更50%＋容移30%<\/button><\/p>/,'').replace(/(<TdrApplicationPanel[^>]+\/>)/,'<details className="le-advanced"><summary>容移取得條件與資格檢核</summary>$1</details>').replace('所選重建路徑與容移由同一計算核心重算坪效；一般都更上限50%不代表已取得50%。','一般都更上限50%不代表已取得50%。');
  if(path.endsWith('/SiteRoadConditionsPanel.tsx'))text=text.replace('<label>足寬開闢道路之連通','</div><div className="site-road-fields le-road-verification"><label>足寬開闢道路之連通');
  if(path.endsWith('/SiteRoadConditionsPanel.tsx'))text=text.replace('value={r.checkedAt} onChange={e=>edit({checkedAt:e.target.value})}', 'value={r.checkedAt} onInput={e=>edit({checkedAt:e.currentTarget.value})} onChange={e=>edit({checkedAt:e.target.value})}');
  if(path.endsWith('/TdrApplicationPanel.tsx'))text=text.replace(/<label>申請進度[\s\S]*?<\/label>/,'{t.quantityBasis==="permitted"&&<label>既有許可文件確認<select aria-label="既有許可文件確認" value={t.stage} onChange={e=>edit({stage:e.target.value as TdrApplication["stage"]})}><option value="planning">尚未取得許可文件</option><option value="permitted">已有許可文件，供本次對照</option></select></label>}').replace('{r&&<div className="burden-table basement-audit-table" dangerouslySetInnerHTML={{__html:renderTdrApplication(t,r,financials)}}/>}', '{r&&<details><summary>容移換算與資格檢核明細</summary><div className="burden-table basement-audit-table" dangerouslySetInnerHTML={{__html:renderTdrApplication(t,r,financials).replaceAll("unselected","未選定").replaceAll("assumed","規劃假設").replaceAll("成本不自動倒填至其他模組，避免重複列帳。","")}}/></details>}');
  text=text.replaceAll('再次採用更新同一現行方案。','').replaceAll('已確認且不符申請門檻時阻擋計算','已確認不符申請門檻時，會提示調整條件');
  // Public-facing copy only; preserve input values, eligibility checks and calculation rules.
  text=text.replaceAll('都市更新（不疊加危老）','都市更新').replaceAll('危老重建（不疊加都更及土管獎勵）','危老重建')
   .replaceAll('一般都更上限50%不代表已取得50%。','都更額度依資格與核定文件確認。')
   .replaceAll('選擇上限路徑是資格假設，並非核定。','本次上限路徑採規劃假設，資格待核對。')
   .replaceAll('規劃目標，非核定','規劃目標（資格待查證）')
   .replaceAll('目前為規劃初估，未核定。','依本次條件進行規劃初估。')
   .replaceAll('僅供既有許可案件對照，不代表符合現行新申請資格。','既有許可案件依文件對照；新申請案件依現行資格檢核。')

   .replaceAll('未選方式不代表已取得，來源與核准分開。','取得方式尚未選定。');
  if(path.endsWith('/TdrApplicationPanel.tsx'))text=text.replace('renderTdrApplication(t,r,financials).replaceAll(', 'renderTdrApplication(t,r,financials).replaceAll("未選方式不代表已取得，來源與核准分開。","取得方式尚未選定。").replaceAll(');
  if(path.endsWith('/BasementDemandPanel.tsx'))text=text.replace('{e}</p>', '{e.replace("依需求檢討須先填個案開挖率上限及法規／基地資料來源；不自動套60%或80%","請填寫個案開挖率上限及適用法規。")}</p>');
  text=text.replaceAll('；未取得排位圖，不宣稱已確認可排。已知無法配置時，不因另有客用電梯而通過。','；實際排位及通路待圖說核對。');
  text=publicText(text);
  text="import {publicText} from '/src/land-evaluation/public-copy.mjs';\n"+text;
  text=text.replaceAll('{n}</li>','{publicText(n)}</li>').replaceAll('{m}</p>','{publicText(m)}</p>');
  text=text.replace('renderTdrApplication(t,r,financials).replaceAll(', 'publicText(renderTdrApplication(t,r,financials)).replaceAll(');
  // Normalize only label markup; the App's calculation and input handlers remain intact.
  text=text.replace(/(<label(?:\s[^>]*)?>)([^<]+?)(?=<(?:input|select|textarea|span className="planning-number-unit"))/g,(_,open,label)=>label.trim()?open+'<FieldLabel>'+label+'</FieldLabel>':open+label);
  if(text.includes('<select'))text="import {PublicSelect} from '/src/land-evaluation/PublicSelect.jsx';\n"+text.replaceAll('<select','<PublicSelect').replaceAll('</select>','</PublicSelect>');
  text="import {FieldLabel,PublicNumber} from '/src/land-evaluation/PublicFields.jsx';\n"+text;
  text=transformSync(text,{configFile:false,babelrc:false,parserOpts:{sourceType:'module',plugins:['typescript','jsx']},plugins:[{visitor:{JSXOpeningElement(path){
   const n=path.node;if(n.name.type!=='JSXIdentifier'||n.name.name!=='input')return;
   const numeric=n.attributes.some(a=>a.type==='JSXAttribute'&&a.name.name==='type'&&a.value?.value==='number');if(!numeric)return;
   const parent=path.parentPath.parentPath?.node;
   const wrapped=parent?.type==='JSXElement'&&parent.openingElement.attributes.some(a=>a.type==='JSXAttribute'&&a.name.name==='className'&&a.value?.value==='planning-number-unit');
   if(!wrapped)n.name.name='PublicNumber';
  }}}]}).code;
  return {contents:text,loader:'tsx'};
 });}};
 const result=await build({stdin:{contents,resolveDir:app,loader:'tsx'},outfile:output,bundle:true,format:'esm',platform:'browser',target:'es2020',jsx:'automatic',external:['react','react/jsx-runtime','/src/land-evaluation/PublicSelect.jsx','/src/land-evaluation/PublicFields.jsx','/src/land-evaluation/public-copy.mjs'],plugins:name==='panels'?[publicUi]:[],metafile:true,treeShaking:true,minify:false,legalComments:'none'});
 const bundled=await readFile(output,'utf8');
 if(/localStorage|sessionStorage|indexedDB|@tauri|fetch\(/.test(bundled))throw Error(name+' contains persistence, desktop or network calls');
 for(const file of Object.keys(result.metafile.inputs)){
  if(file==='<stdin>')continue;
  const path=resolve(file),bytes=await readFile(path);
  sources.set(path,{path:relative(app,path),sha256:createHash('sha256').update(bytes).digest('hex')});
 }
}
const mixedCss=await readFile(resolve(app,'src/components/mixed-zone/mixed-zone.css'));
await writeFile(resolve(dir,'mixed-zone.css'),mixedCss);
sources.set('mixed-zone.css',{path:'src/components/mixed-zone/mixed-zone.css',sha256:createHash('sha256').update(mixedCss).digest('hex')});
const {execFileSync}=await import('node:child_process');
const manifest={sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),scope:'land identity, laws, routes, layout and efficiency only; no financial UI or case persistence',source:'三策案件版',sourceRoot:app,generatedAt:new Date().toISOString(),method:'esbuild directly bundles original App exports; website has no separate calculation fork; App source is authoritative',sources:[...sources.values()].sort((a,b)=>a.path.localeCompare(b.path))};
await writeFile(resolve(dir,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Shared App core and pure panels synchronized; no storage, desktop or network code. '+sources.size+' source files.');
