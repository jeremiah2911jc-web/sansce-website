import {collectiveDisplayNotes} from '../src/land-evaluation/collective-notes.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {build} from 'esbuild';
import {parse} from '@babel/parser';
import {createInput,exampleInput,evaluate} from '../src/land-evaluation/model.mjs';
import {regionalInputPatch,regionalInputIssues} from '../src/land-evaluation/regional-input.mjs';
import {summaryForDisplay,commercialInputs} from '../src/land-evaluation/summary-presentation.mjs';
import {newDocumentCase,documentCaseSummary,newMixedSite,mixedSummary,calculateMixedSite,newCommercialIntensity,newIndustrial} from '../src/land-evaluation/generated/core.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
const root=new URL('../',import.meta.url).pathname;
const messages={notes:['坡道平面：至少地下2層','選擇順序：測試','尚未選定取得方式，僅試算目標容積','屋突投影與高度依所選條件檢核，層數及層高是規劃假設；25㎡小基地例外未自動套用。','基地道路資料尚屬待確認，未認定符合申請資格。']},beforeMessages=structuredClone(messages);
assert.equal(collectiveDisplayNotes({tdr:'0'},messages).length,2);assert.equal(collectiveDisplayNotes({tdr:'25'},messages).length,3);assert.deepEqual(messages,beforeMessages);assert.equal(publicText('上限62.77777777777778%'),'上限62.7778%');
const original=exampleInput(),saved=structuredClone(original);
const ntpcApplication={city:'ntpc',method:'mixed',cashPercent:'60',source:'合成新北條件'},taipeiApplication={city:'taipei',method:'cash',source:'合成臺北條件'};
original.regulatoryReview.bonusAssessment={route:'renewal',renewalMode:'detail',entries:{'u-public':{choice:'1'}},tdrApplication:ntpcApplication,tdrApplications:{taipei:taipeiApplication},awardBasis:'permitted',permittedAward:{source:'合成許可'}};
const frozen=structuredClone(original),taipei={...original,...regionalInputPatch(original,'臺北市')};
assert.deepEqual(original,frozen);assert.deepEqual(regionalInputIssues(taipei,'臺北市'),[]);assert.equal(taipei.regulatoryReview.bonusAssessment.tdrApplication,taipeiApplication);assert.equal(taipei.regulatoryReview.bonusAssessment.entries['u-public'].choice,'');assert.equal(taipei.regulatoryReview.bonusAssessment.permittedAward,undefined);
assert.equal(regionalInputIssues(original,'臺北市').length,3);
const ntpc={...taipei,...regionalInputPatch(taipei,'新北市')};assert.equal(ntpc.regulatoryReview.bonusAssessment.tdrApplication,ntpcApplication);assert.deepEqual(regionalInputIssues(ntpc,'新北市'),[]);
const commercial={...createInput(),commercialIntensity:newCommercialIntensity()},commercialTaipei={...commercial,...regionalInputPatch(commercial,'臺北市')};assert.equal(commercialTaipei.commercialIntensity.city,'臺北市');assert.equal(commercialTaipei.commercialIntensity.mode,'unknown');assert.deepEqual(regionalInputIssues(commercialTaipei,'臺北市'),[]);assert(regionalInputIssues(commercial,'臺北市').length);
assert.deepEqual(evaluate(saved),evaluate(structuredClone(saved)));
for(const raw of [documentCaseSummary(newDocumentCase()),mixedSummary(newMixedSite(),calculateMixedSite(newMixedSite()))]){
 const frozen=structuredClone(raw),summary=summaryForDisplay(raw);assert.deepEqual(raw,frozen);assert.deepEqual(summary.metrics,raw.metrics);assert(!JSON.stringify(summary.inputs).includes('資料版本'));assert(!summary.inputs.some(([label])=>/原始輸入|／[a-zA-Z]+/.test(label)));assert(!JSON.stringify(summary).includes('明示'));
}
assert(!JSON.stringify(commercialInputs({...newCommercialIntensity(),city:'臺北市',mode:'document',documentFar:'300',documentCoverage:'50'})).includes('commercial-intensity'));
const rows=[];for(const file of ['core.mjs','land.mjs','readjustment.mjs','panels.mjs']){const path='src/land-evaluation/generated/'+file,ast=parse(readFileSync(root+path,'utf8'),{sourceType:'module'});function walk(node){if(!node||typeof node!=='object')return;const value=node.type==='StringLiteral'?node.value:node.type==='TemplateElement'?node.value.cooked:'';if(value?.includes('明示')){const after=publicText(value);rows.push({file:path,line:node.loc.start.line,before:value,after});assert(!after.includes('明示'),path+':'+node.loc.start.line);}for(const[k,v]of Object.entries(node)){if(['loc','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(ast);}
writeFileSync(root+'docs/evaluation-preview-20261102/assumption-wording-review.json',JSON.stringify(rows,null,2));
const testEntry=`import {renderToStaticMarkup} from 'react-dom/server';import {createElement} from 'react';import {BonusAssessmentPanel,IndustrialPanel,DocumentCasePanel,MixedZonePanel,LegalParkingPanel,CommercialIntensityPanel} from './src/land-evaluation/generated/panels.mjs';export const render=(name,props)=>renderToStaticMarkup(createElement(({BonusAssessmentPanel,IndustrialPanel,DocumentCasePanel,MixedZonePanel,LegalParkingPanel,CommercialIntensityPanel})[name],props));`;
const output=root+'qa/evaluation-preview-20261102/render-review.mjs';await build({stdin:{contents:testEntry,resolveDir:root,sourcefile:'render-review.mjs'},bundle:true,jsx:'automatic',platform:'node',format:'esm',outfile:output,packages:'external',plugins:[{name:'local-source',setup(build){build.onResolve({filter:/^\/src\//},args=>({path:root+args.path.slice(1)}));}}]});
const {render}=await import(output+'?t='+Date.now());
const simpleTaipei={...createInput(),...regionalInputPatch(createInput(),'臺北市')};
const html=render('BonusAssessmentPanel',{input:simpleTaipei,edit:()=>{},financials:false});assert(!html.includes('明示'));assert(!html.includes('新北退縮'));assert(!html.includes('新北地方獎勵'));assert(!html.includes('value="ntpc"'));assert(html.includes('臺北市'));assert(html.includes('待確認'));
const htmlNtpc=render('BonusAssessmentPanel',{input:createInput(),edit:()=>{},financials:false});assert(htmlNtpc.includes('新北退縮'));assert(!htmlNtpc.includes('明示'));
for(const [name,props]of [['IndustrialPanel',{value:newIndustrial(),onChange:()=>{}}],['DocumentCasePanel',{value:newDocumentCase(),onChange:()=>{}}],['MixedZonePanel',{value:newMixedSite(),onChange:()=>{}}],['CommercialIntensityPanel',{value:{...newCommercialIntensity(),city:'臺北市'},district:'臺北市',site:'2400',coverage:'50',onChange:()=>{}}],['LegalParkingPanel',{input:saved,edit:()=>{},result:evaluate(saved),section:'parking'}]]){const rendered=render(name,props);assert(!rendered.includes('明示'),name+' still contains internal assumption wording');writeFileSync(root+'qa/evaluation-preview-20261102/'+name+'.html',rendered);}
writeFileSync(root+'qa/evaluation-preview-20261102/taipei-panel.html',html);writeFileSync(root+'qa/evaluation-preview-20261102/ntpc-panel.html',htmlNtpc);
console.log(`PASS region input switching, legacy conflicts, permitted-document reset, cached per-city inputs, commercial alignment, report metadata removal and ${rows.length} frozen-source wording replacements; Taipei/New Taipei rendered panels checked.`);
// Exercise both municipalities, all routes and both entry modes with inactive data retained.
const routeAssessment=()=>({version:'bonus-assessment.2026-10-19.v1',route:'renewal',renewalMode:'detail',tdrMode:'quick',dangerMode:'detail',date:'2026-11-02',entries:{'u-green':{choice:'2',status:'assumed'},'d-green':{choice:'1',status:'assumed'}},renewalQualification:'unknown',tdrQualification:'unknown',dangerQualification:'unknown',source:'',deduction:'0',tdrProfile:'general',dangerOriginal:'',dangerEligibleSite:'',dangerAdjacentSite:''});
const routeChecks=[];
for(const city of ['臺北市','新北市'])for(const route of ['renewal','danger','none'])for(const mode of ['quick','detail'])for(const awardBasis of ['target','permitted']){
 const input={...createInput(),...regionalInputPatch(createInput(),city)};
 input.regulatoryReview.bonusAssessment={...routeAssessment(),route,renewalMode:mode,dangerMode:mode,awardBasis,...(awardBasis==='permitted'?{permittedAward:{route:route==='danger'?'danger':'renewal',baseSqm:'2000',awardSqm:'200',approvedAt:'2026-10-30',source:'合成既有核准文件'}}:{})};
 const frozen=structuredClone(input),html=render('BonusAssessmentPanel',{input,edit:()=>{},financials:false});
 assert.equal(/<summary[^>]*>都更細項/.test(html),route==='renewal'&&awardBasis!=='permitted',[city,route,mode,awardBasis,'renewal panel']);
 assert.equal(/<summary[^>]*>危老細項/.test(html),route==='danger'&&awardBasis!=='permitted',[city,route,mode,awardBasis,'danger panel']);
 assert(html.includes('容移取得條件與資格檢核'));
 assert.equal(html.includes('臺北市地方都更獎勵'),city==='臺北市'&&route==='renewal'&&awardBasis!=='permitted');
 assert.equal(html.includes('新北退縮與設計方案'),city==='新北市'&&route==='renewal'&&awardBasis!=='permitted');
 assert.deepEqual(input,frozen,'Rendering cannot clear inactive input values');
 routeChecks.push({city,route,mode,awardBasis,renewalVisible:route==='renewal'&&awardBasis!=='permitted',dangerVisible:route==='danger'&&awardBasis!=='permitted'});
}
const noteFixture={notes:['危老第3–6條合計0%，原合格基地NaN㎡','都更中央8%＋地方2%','基地道路資料待補','臺北地方獎勵採第2條附表一般條件']},frozenNoteFixture=structuredClone(noteFixture);
for(const route of ['renewal','danger','none']){
 const input={tdr:'25',regulatoryReview:{bonusAssessment:{route}}},notes=collectiveDisplayNotes(input,noteFixture);
 assert.equal(notes.some(x=>x.startsWith('危老第3')),route==='danger');assert.equal(notes.some(x=>x.startsWith('都更中央')),route==='renewal');assert(notes.includes('基地道路資料待補'));assert.deepEqual(noteFixture,frozenNoteFixture);
}
// The shared Taipei source note retains its transfer condition on the danger route.
const taipeiSourceNote='目前非新北：新北地方都更獎勵、容移評點與代金倍數不套用。臺北容移另按資格、上限及取得方式評估，未建臺北地方都更獎勵細項。';
const taipeiDisplayNote=publicText(taipeiSourceNote);
for(const route of ['renewal','danger','none'])for(const mode of ['quick','detail'])for(const tdr of ['0','25']){
 const input={tdr,regulatoryReview:{bonusAssessment:{route,renewalMode:mode,dangerMode:mode}}};
 const result={notes:[taipeiSourceNote,'危老不得疊加都更及其他法令容積獎勵。','基地道路資料待補']};
 const frozen=structuredClone({input,result});
 assert.deepEqual(collectiveDisplayNotes(input,result),[route==='danger'?'臺北市容移依接受基地資格、上限及取得方式檢核。':taipeiDisplayNote,...result.notes.slice(1)]);
 assert.deepEqual({input,result},frozen,'Report selection must preserve inputs and calculation output');
}
writeFileSync(root+'qa/evaluation-preview-20261102/route-visibility.json',JSON.stringify({routeChecks,reportRouteChecks:3,taipeiNoteChecks:12,inputsPreserved:true,transferIndependent:true},null,2));
console.log('PASS 12 Taipei source-note route/mode/transfer combinations; necessary restrictions and calculation output preserved.');
console.log(`PASS ${routeChecks.length} Taipei/New Taipei route, mode and document-basis combinations; 3 report-route checks; retained inputs and independent transfer controls.`);

// The short source reminder follows the active rebuilding route; rendering preserves every value.
for(const city of ['臺北市','新北市'])for(const route of ['renewal','danger','none'])for(const mode of ['quick','detail']){
 const input=exampleInput();Object.assign(input,{site:'2400',far:'280',renewal:'10',danger:'10',tdr:'0',scale:'0'});input.parkingDesign.district=city;Object.assign(input.regulatoryReview,{renewalLimitPercent:'50',tdrLimitPercent:'30'});
 input.regulatoryReview.bonusAssessment={...routeAssessment(),route,renewalMode:mode,dangerMode:mode,dangerEligibleSite:'2400',dangerAdjacentSite:'0'};
 const frozen=structuredClone(input),values=evaluate(input),html=render('BonusAssessmentPanel',{input,edit:()=>{},financials:false});
 assert(html.includes(input.planningDefaults?'本次先依目標條件初估':'獎勵適用條件與文件'),JSON.stringify({city,route,mode,errors:values.errors,summary:html.match(/<p role="status">[^<]+/g)}));
 assert.equal(html.includes('aria-label="都更適用資格"'),route==='renewal',[city,route,mode,'renewal qualification']);
 assert.equal(html.includes('aria-label="危老法定適用資格"'),route==='danger',[city,route,mode,'danger qualification']);
 assert.deepEqual(input,frozen);assert.deepEqual(evaluate(input),values);
}
console.log('PASS 12 active-route source reminders across two cities and quick/detail modes; no input or calculation changes.');
