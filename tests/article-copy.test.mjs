import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectArticleCopy,inspectArticleAttention} from '../scripts/verify-article-copy.mjs';

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


test('rejects vague calculation conclusions and account metaphors in secondary copy',()=>{
 for(const text of ['帳算清楚。','承諾都要算清楚。','成本要算得清楚。','責任不能算到地主的帳上。','列出成本帳。','帳面分配與實際價值不同。','算這筆帳。']){
  assert(inspectArticleCopy([{path:'/insights/example',visual:{sideTitle:[text]}}]).some(x=>x.field==='article.visual.sideTitle.0'),text);
 }
});
test('retains specific accounting terms and concrete financial instructions',()=>{
 const text='列明工程款、付款人及付款日期。股票帳面獲利尚未實現。核對收款帳戶、帳號與會計帳冊，依憑證記帳。';
 assert.deepEqual(inspectArticleCopy([{path:'/insights/example',sections:[['費用項目',text]]}]),[]);
});

test('reports attention terms without treating concrete assessment language or source URLs as prohibited',()=>{
 const record={path:'/insights/example',sections:[['基地評估','評估基地的臨路寬度，列明建築線與適用規定。']],sources:[['來源','https://example.com/評估']]};
 assert.deepEqual(inspectArticleCopy([record]),[]);
 const notices=inspectArticleAttention([record]);
 assert.equal(notices.length,2);
 assert(notices.every(x=>x.field.startsWith('article.sections.0.')));
});
