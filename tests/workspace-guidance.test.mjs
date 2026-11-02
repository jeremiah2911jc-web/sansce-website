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
