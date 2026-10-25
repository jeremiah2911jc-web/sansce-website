import assert from 'node:assert/strict';
import {insightArticles} from '../shared/insight-articles.js';

// This checks editorial records, not application/system copy or URL query strings.
// Passing it does not replace the required paragraph-by-paragraph editorial review.
const prohibited = [
 ['問句標點', /[？?]/u],
 ['對話式疑問詞', /怎麼|為什麼|嗎[，。！]|呢[，。！]/u],
 ['自動推論句型', /自動/u],
 ['禁用詞彙', /口徑|對帳|真正|從來|往往|其實/u],
 ['模糊前導', /值得注意|值得警醒|更重要的是|這也提醒我們|讓我們先思考|很多時候|有一個更前面的問題|背後還有一個問題|一個經常被忽略的問題/u],
 ['機械對照句', /不是[^。！？\n]{0,100}而是|不在[^。！？\n]{0,100}而在|不能只[^。！？\n]{0,100}還(?:要|需)/u],
 ['假想讀者對話', /地主(?:心裡|可能)會問|地主心裡卻有疑問|我們很容易問|自然會產生疑問|有人問「/u],
 ['空泛AI套語', /一個很深的|整理情緒|需要一直記得|長出來|(?:^|[。！？\n])\s*有時候/u],
 ['粗體標記', /\*\*|<strong\b|<b\b/u]
];
export function inspectArticleCopy(pages){
 const errors=[];
 function inspect(value,path,article){
  if(typeof value==='string'){
   if(/^(?:https?:\/\/|\/|#)/u.test(value))return;
   for(const [name,re]of prohibited){const hit=value.match(re);if(hit)errors.push({article,field:path,rule:name,match:hit[0]});}
  }else if(Array.isArray(value))value.forEach((v,i)=>inspect(v,`${path}.${i}`,article));
  else if(value&&typeof value==='object')for(const [key,v]of Object.entries(value))inspect(v,`${path}.${key}`,article);
 }
 for(const article of pages){inspect(article,'article',article.path);if(article.emphasis?.length)errors.push({article:article.path,field:'article.emphasis',rule:'正文粗體',match:'emphasis'});}
 return errors;
}
const errors=inspectArticleCopy(insightArticles);
for(const error of errors)console.error(`${error.article} ${error.field}: ${error.rule}「${error.match}」`);
assert.equal(errors.length,0,`Article copy has ${errors.length} prohibited expressions. Rewrite the argument, then review the complete paragraph.`);
console.log(`PASS: ${insightArticles.length} articles, titles, metadata, body, captions and visual copy contain no prohibited expressions. Manual tone and factual review remain required.`);
