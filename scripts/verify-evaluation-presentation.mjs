import {applyReadjustmentDates} from './apply-readjustment-dates.mjs';
import {applyNtpcTod} from './apply-ntpc-tod.mjs';
import {applyGuidedPlanning} from './apply-guided-planning.mjs';
import {applyBonusEligibility} from './apply-bonus-eligibility.mjs';
import {applyDangerAreaFix} from './apply-danger-area-fix.mjs';
import {applyTaipeiRenewalCore,taipeiCoreFunctions} from './apply-taipei-renewal-core.mjs';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parse} from '@babel/parser';
import {newIndustrial,calculateIndustrial} from '../src/land-evaluation/generated/core.mjs';
import {industrialDelivery,renderIndustrialReport} from '../src/land-evaluation/industrial-report.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
import {applyEvaluationPanelCopy} from './apply-evaluation-panel-copy.mjs';
import {serializeCase} from '../src/land-evaluation/case-file.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const baseline=p=>execFileSync('git',['show','origin/main:'+p],{cwd:root,encoding:'utf8',maxBuffer:20e6});
const protectedFiles=['src/land-evaluation/generated/core.mjs','src/land-evaluation/generated/land.mjs','src/land-evaluation/generated/readjustment.mjs','src/land-evaluation/generated/source-manifest.json','src/land-evaluation/generated/readjustment-manifest.json','src/land-evaluation/model.mjs'];
for(const p of protectedFiles){
 if(p.endsWith('/generated/core.mjs'))assert.equal(read(p),applyNtpcTod(applyGuidedPlanning(applyBonusEligibility(applyDangerAreaFix(applyTaipeiRenewalCore(baseline(p)))))),'Only documented calculation adapters may change core.mjs');
 else if(p.endsWith('/source-manifest.json')){const current=JSON.parse(read(p)),original=JSON.parse(baseline(p));const {extensions,...base}=current;const {extensions:originalExtensions,...originalBase}=original;assert.deepEqual(base,originalBase);assert.deepEqual(extensions.map(x=>x.id),['taipei-renewal','danger-area-validation','bonus-eligibility','guided-planning','ntpc-tod','multi-building','volume-recount']);if(originalExtensions)assert.deepEqual(extensions.filter(x=>!['bonus-eligibility','guided-planning','ntpc-tod'].includes(x.id)),originalExtensions.filter(x=>!['bonus-eligibility','guided-planning','ntpc-tod'].includes(x.id)),'Unchanged calculation extension hashes changed');}
 else if(p.endsWith('/generated/readjustment.mjs'))assert.equal(read(p),applyReadjustmentDates(baseline(p)),'Only case-document date validation may change readjustment.mjs');
 else if(p.endsWith('/readjustment-manifest.json')){const current=JSON.parse(read(p)),original=JSON.parse(baseline(p));const {extensions,...base}=current;const {extensions:oldExtensions,...oldBase}=original;assert.deepEqual(base,oldBase);assert.deepEqual(extensions?.map(x=>x.id),['readjustment-dates']);}
 else assert.equal(read(p),baseline(p),'Protected calculation source changed: '+p);
}
const panels='src/land-evaluation/generated/panels.mjs',before=baseline(panels),after=read(panels);
const functions=code=>parse(code,{sourceType:'module'}).program.body.filter(n=>n.type==='FunctionDeclaration'&&!n.id.name.endsWith('Panel')&&!taipeiCoreFunctions.includes(n.id.name)).map(n=>[n.id.name,code.slice(n.start,n.end)]);
assert.deepEqual(functions(after),functions(applyNtpcTod(applyGuidedPlanning(applyBonusEligibility(before)))),'Non-UI functions in shared panels must remain byte-identical');
assert.equal(applyEvaluationPanelCopy(after),after,'UI copy adapter must be idempotent');
const fixture=newIndustrial(),ev={source:'合成測試文件',date:'2026-10-24',finding:'合成條件，供數量驗收',state:'assumed'};
Object.assign(fixture,{name:'工業報告合成驗收',edition:'合成V1',date:'2026-10-24',city:'ntpc',regime:'urban',route:'ordinary',vertical:'none',awardMode:'none',transferMode:'none'});
for(const key of Object.keys(fixture.reviews))fixture.reviews[key]={...ev};
fixture.parcels=[{id:'p1',name:'合成土地組',zone:'工業區',area:'1000',excluded:'100',far:'210',tdrRate:'',original:'',originalMode:'none',evidence:{...ev}}];
fixture.floors=[{id:'f1',building:'合成A幢',level:'1至3F',count:'3',area:'600',purpose:'factory',increment:'0',incrementBasis:'unknown',evidence:{...ev}}];
fixture.development={version:'industrial.layout.v1',operation:'mixed',applicantUse:'nonself',planName:'合成測試計畫',planScope:'合成測試土地組及A幢',planEvidence:{...ev},allocations:[{id:'alloc',floorId:'f1',exempt:'0',rent:'900',self:'600',donated:'0',common:'300',vacant:'0',registered:'1800',evidence:{...ev}}],constraints:['coverage','excavation','height','yard','parking','loading','fire','quota','permission'].map(kind=>({id:kind,kind,name:'合成'+({coverage:'建蔽',excavation:'開挖',height:'高度',yard:'退縮',parking:'停車',loading:'裝卸',fire:'消防',quota:'使用總量',permission:'用途許可'})[kind]+'條件',scope:'合成A幢',unit:'㎡',actual:'0',limit:'0',operator:'equal',basis:'plan',effective:'2026-10-24',expires:'',evidence:{...ev,finding:'合成案例明列不適用，數量填0'}}))};
const result=calculateIndustrial(fixture),frozen=structuredClone({fixture,result}),summary=industrialDelivery(fixture,result,'2026-11-02T05:00:00Z');
assert.deepEqual(result.errors,[]);assert.deepEqual(result.missing,[]);assert.equal(result.quantities.site,900);assert.equal(result.quantities.base,1890);assert.equal(result.quantities.design,1800);
assert.equal(result.development.ready,true);assert.equal(summary.sections.find(x=>x.title==='實體面積與登記分項').rows[0].length,8);
assert.equal(summary.sections.find(x=>x.title==='資料依據').rows.length,2);assert.equal(summary.sourceLinks.length,1);assert.equal(summary.sourceHeading,'法規依據');assert.equal(summary.sections.find(x=>x.title==='開發方式與額度設定').rows.length,2);
assert.deepEqual(summary.metrics.map(r=>r[1]),Object.values(result.quantities));assert.deepEqual({fixture,result},frozen);
const svg=read('public/images/evaluation-watermark-09.svg'),html=renderIndustrialReport(summary,svg);
assert(html.includes('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)));assert(!/<pre\b|&quot;(?:conditions|quantities|parcelResults)&quot;/.test(html));
assert(html.includes('900'));assert(html.includes('1,890'));assert(html.includes('1,800'));assert(html.includes('2026-10-24 · V2'));assert(!html.includes('industrial.rules.'));
const malicious=structuredClone(fixture);malicious.name='<img src=x onerror="alert(1)">';malicious.reviews.plan.source='</td><script>alert(2)</script>';
const safe=renderIndustrialReport(industrialDelivery(malicious,calculateIndustrial(malicious)),svg);assert(!safe.includes('<script>'));assert(!safe.includes('<img src=x'));assert(safe.includes('&lt;img'));
const empty=newIndustrial(),emptySummary=industrialDelivery(empty,calculateIndustrial(empty));assert(emptySummary.metrics.every(r=>r[1]===null));assert(emptySummary.issues.length);assert(renderIndustrialReport(emptySummary,svg).includes('待確認'));
const proposals=JSON.parse(read('docs/evaluation-preview-20261102/approved-copy.json'));
for(const [i,p]of proposals.entries())if(![10,11,12,15].includes(i))assert.equal(publicText(p.before),publicText(p.after),'Approved public copy '+(i+1));
const directForbidden=/真正|從來|口徑|對帳|補款|往往|其實|很多時候|值得追問|同樣要回答|值得注意的是|更重要的是|這也提醒我們|讓我們先思考|值得警醒|有一個更前面的問題|背後還有一個問題|一個很深的|整理情緒|需要一直記得|算清楚|算得清楚/;
const violations=[];let literals=0;
function inspect(file){const code=read(file),ast=parse(code,{sourceType:'module',plugins:['jsx']});
 function visit(n,parent,panel=''){
  if(!n||typeof n!=='object')return;
  if(n.type==='FunctionDeclaration')panel=n.id?.name?.endsWith('Panel')?n.id.name:'';
  const text=n.type==='StringLiteral'||n.type==='JSXText'?n.value:n.type==='TemplateElement'?n.value.cooked:null;
  const oldCopyKey=/\/(?:approved-copy-edits|public-copy)\.mjs$/.test(file)&&parent?.type==='ArrayExpression'&&parent.elements[0]===n;
  if(text&&/\p{Script=Han}/u.test(text)&&!oldCopyKey){literals++;const visible=publicText(text);if(directForbidden.test(visible))violations.push({file,line:n.loc.start.line,text:visible});
   if(file.endsWith('/generated/panels.mjs')&&panel)for(const [i,p]of proposals.entries())if(![10,11,12,15,24].includes(i)&&visible.includes(p.before))violations.push({file,line:n.loc.start.line,proposal:i+1,text:visible});
  }
  for(const[k,v]of Object.entries(n)){if(['loc','extra','comments','tokens'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>visit(x,n,panel));else if(v&&typeof v==='object')visit(v,n,panel);}
 }visit(ast,null);
}
function walk(dir){for(const e of readdirSync(new URL(dir,root),{withFileTypes:true})){if(e.isDirectory())walk(dir+'/'+e.name);else if(/\.(?:jsx|mjs)$/.test(e.name))inspect(dir+'/'+e.name);}}
walk('src/land-evaluation');assert.deepEqual(violations,[]);
mkdirSync(new URL('qa/evaluation-preview-20261102',root),{recursive:true});
writeFileSync(new URL('qa/evaluation-preview-20261102/industrial-report.html',root),html);
writeFileSync(new URL('qa/evaluation-preview-20261102/industrial-fixture.json',root),JSON.stringify({fixture,result,summary},null,2));
const manifest=JSON.parse(read('src/land-evaluation/generated/source-manifest.json')),ra=JSON.parse(read('src/land-evaluation/generated/readjustment-manifest.json'));
writeFileSync(new URL('qa/evaluation-preview-20261102/合成工業驗收.sanze.json',root),serializeCase({'nav.section':'industrial','nav.view':'tool','nav.opened':true,'industrial.input':fixture},JSON.stringify([manifest.sources.map(x=>x.sha256),ra.sources.map(x=>x.sha256)])));
writeFileSync(new URL('qa/evaluation-preview-20261102/presentation-verification.json',root),JSON.stringify({protectedFiles,nonUiPanelFunctions:functions(before).length,nonAuthorizedSourcesIdentical:true,authorizedTaipeiHooks:taipeiCoreFunctions,reportMetricsMatch:true,rawJsonRemoved:true,watermarkEmbedded:true,untrustedInputEscaped:true,unknownsPreserved:true,copyLiterals:literals,copyViolations:violations},null,2));
console.log(`PASS presentation: ${protectedFiles.length} scope-protected files and ${functions(before).length} non-UI panel functions byte-identical; report values, escaping, watermark, unknowns and ${literals} copy literals checked.`);
