import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectArticleCopy} from '../scripts/verify-article-copy.mjs';

test('blocks prohibited editorial copy across nested publication surfaces',()=>{
 const record={path:'/insights/example',title:'分回條件合理嗎？',seoTitle:'自動取得分配資格',sections:[['估算基礎','其實土地口徑需要確認。']],visual:{storyPhotos:[{caption:'更重要的是，地主權益。'}]}};
 const errors=inspectArticleCopy([record]);
 for(const field of ['article.title','article.seoTitle','article.sections.0.1','article.visual.storyPhotos.0.caption'])assert(errors.some(x=>x.field===field),field);
});
test('requires rewriting mechanical comparison and imagined reader dialogue',()=>{
 for(const text of ['不是比例問題，而是資料問題。','不能只看面積，還要看價值。','有人問「隔壁分得到，我們為什麼不行」。','未簽署就自動變成沒有資格。','停工後怎麼做。','地主可以分回房子嗎。','其實條件不同。'])assert(inspectArticleCopy([{path:'/insights/example',sections:[['',text]]}]).length>0,text);
});
test('preserves genuine source URL queries and direct factual prose',()=>{
 const record={path:'/insights/example',title:'分配須核對面積與費用',sections:[['分配條件','權利變換應依估價、共同負擔與核定計畫計算。']],sources:[['都市更新條例','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070008']]};
 assert.deepEqual(inspectArticleCopy([record]),[]);
});
