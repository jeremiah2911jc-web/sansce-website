import test from 'node:test';
import assert from 'node:assert/strict';
import {planningFields} from '../src/land-evaluation/generated/core.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
import {scenarioDifferences} from '../src/land-evaluation/collective-comparison.mjs';
import {issueTarget} from '../src/land-evaluation/workspace-guidance.mjs';
for(const [key,label,,tab]of planningFields)test(`numeric field ${key} has an editable destination`,()=>{const t=issueTarget(label+'未填');assert.equal(t.key,key);assert.equal(t.tab,tab);assert(t.label);});
for(const [text,key,tab]of [['店舖等第一類用途配置比例未填','storePercent','parking'],['機車位規劃需求未填','motoPerUnit','parking'],['額外市場汽車位未填','extraCars','parking'],['地下非停車空間可登記分攤比例未填','basementSalePercent','basement'],['地下預留比例未填','basementReservePercent','basement']])test(text,()=>{const t=issueTarget(text);assert.equal(t.key,key);assert.equal(t.tab,tab);});
for(const text of ['未知條件，請核對文件','地下必要空間預留資料無效','危老原合格基地面積及鄰地面積未填'])test(`section fallback: ${text}`,()=>{const t=issueTarget(text);assert(t.label||t.heading);assert(t.tab);});

test('renamed extra parking field retains its destination',()=>{assert.equal(issueTarget('增設汽車位數未填').key,'extraCars');assert.equal(issueTarget('額外市場汽車位未填').label,'增設汽車位數');});

test('extra parking label matches validation and comparison',()=>{assert.equal(publicText('額外市場汽車位未填'),'增設汽車位數未填');const a={district:'新北市',input:{extraCars:'0'}},b={district:'新北市',input:{extraCars:'3'}};assert.deepEqual(scenarioDifferences(a,b),[['增設汽車位數','0 位','3 位']]);});

// Every calculator error emission has an owning settings destination, including
// errors that require several inputs rather than one numeric field.
import {readFileSync} from 'node:fs';
import {planningIssueCatalog} from '../scripts/planning-issue-catalog.mjs';
import {blockingIssueCatalog} from '../src/land-evaluation/blocking-issue-catalog.mjs';
import {publicText as displayIssue} from '../src/land-evaluation/public-copy.mjs';
test('calculator error inventory stays synchronized',()=>assert.deepEqual(blockingIssueCatalog,['../src/land-evaluation/generated/core.mjs','../src/land-evaluation/taipei-renewal/model.mjs','../src/land-evaluation/bonus-eligibility.mjs'].flatMap(path=>planningIssueCatalog(readFileSync(new URL(path,import.meta.url),'utf8')))));
for(const row of blockingIssueCatalog)test(`error owner ${row.owner}:${row.line} has a destination`,()=>{
 assert(row.target.label||row.target.summary||row.target.region||row.target.heading);
 for(const term of row.terms){const target=issueTarget(displayIssue(term));assert(target.label||target.summary||target.region||target.heading);assert(['base','above','parking','basement'].includes(target.tab));}
});
for(const [text,label]of [['地下層高無效','地下室每層高度'],['柱網與轉彎預留比例無效','柱網及轉彎額外預留 %'],['路寬查證日期不得晚於目前日期','路寬查證日期'],['合法原容積須為非負數','合法原建築容積面積'],['合併鄰地須為非負數','合併鄰接基地面積']])test(`specific correction destination: ${text}`,()=>assert.equal(issueTarget(text).label,label));
import {collectBonusLabels} from '../scripts/planning-issue-catalog.mjs';
import {bonusIssueLabels} from '../src/land-evaluation/blocking-issue-catalog.mjs';
test('bonus choice labels follow the existing calculator definitions',()=>assert.deepEqual(bonusIssueLabels,collectBonusLabels(readFileSync(new URL('../src/land-evaluation/generated/core.mjs',import.meta.url),'utf8'))));
test('invalid imported choice points to its original bonus selector',()=>{const target=issueTarget('法規檢討資料格式無效',{regulatoryReview:{bonusAssessment:{entries:{'u-green':{choice:'invalid'}}}}});assert(target.invalidOption);assert.deepEqual(target.entries,[{label:'綠建築目標條件',choice:'invalid'}]);});
test('hidden imported valuation errors expose an editable correction',()=>assert.equal(issueTarget('已填代金每容積㎡估價須大於0').key,'tdrValuationUnitPrice'));
