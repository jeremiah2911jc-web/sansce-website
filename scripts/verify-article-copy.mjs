import assert from 'node:assert/strict';
import {insightArticles} from '../shared/insight-articles.js';

// This checks editorial records, not application/system copy or URL query strings.
// Passing it does not replace the required paragraph-by-paragraph editorial review.
const prohibited = [
 ['問句標點', /[？?]/u],
 ['對話式疑問詞', /怎麼|為什麼|嗎[，。！]|呢[，。！]/u],
 ['自動推論句型', /自動/u],
 ['禁用詞彙', /口徑|對帳|真正|從來|往往|其實/u],
 ['含糊款項用語', /補款/u],
 ['迂迴否定結論', /(?:不能|無法|不足以)(?:據此|因此)?認定|不能僅因[^。！？\n]{0,100}便認為|不能因此推論/u],
 ['模糊前導', /值得注意|值得警醒|值得追問|同樣要回答|更重要的是|這也提醒我們|讓我們先思考|很多時候|有一個更前面的問題|背後還有一個問題|一個經常被忽略的問題/u],
 ['機械對照句', /不是[^。！？\n]{0,100}而是|不在[^。！？\n]{0,100}而在|不能只[^。！？\n]{0,100}還(?:要|需)/u],
 ['假想讀者對話', /地主(?:心裡|可能)會問|地主心裡卻有疑問|我們很容易問|自然會產生疑問|有人問「/u],
 ['空泛AI套語', /一個很深的|整理情緒|需要一直記得|長出來|(?:^|[。！？\n])\s*有時候/u],
 ['模糊計算結論', /算(?:得)?(?:很|更)?清楚/u],
 ['粗體標記', /\*\*|<strong\b|<b\b/u]
];
export function inspectArticleCopy(pages){
 const errors=[];
 function inspect(value,path,article){
  if(typeof value==='string'){
   if(/^(?:https?:\/\/|\/|#)/u.test(value))return;
   const accountCopy=value.replace(/帳戶|帳號|帳冊|帳簿|帳目|記帳|帳面獲利/gu,'');
   if(/[帳账]/u.test(accountCopy))errors.push({article,field:path,rule:'帳字比喻或待確認用語',match:accountCopy.match(/[^。！？\n]{0,16}[帳账][^。！？\n]{0,16}/u)?.[0]});
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

export const articleAttentionTerms=['說清楚','講清楚','看清楚','釐清','攤開','落地','關鍵','核心','本質','配套','推進','銜接','檢驗','評估','安排'];
export function inspectArticleAttention(pages){
 const notices=[];
 function walk(value,field,article){
  if(typeof value==='string'){
   if(/^(?:https?:\/\/|\/|#)/u.test(value))return;
   for(const sentence of value.split(/[。！？\n]/u)){
    const terms=articleAttentionTerms.filter(term=>sentence.includes(term));
    if(terms.length)notices.push({article,field,terms,text:sentence});
   }
  }else if(Array.isArray(value))value.forEach((item,i)=>walk(item,`${field}.${i}`,article));
  else if(value&&typeof value==='object')Object.entries(value).forEach(([key,item])=>walk(item,`${field}.${key}`,article));
 }
 for(const page of pages)walk(page,'article',page.path);
 return notices;
}
if(process.argv.includes('--attention')){
 const notices=inspectArticleAttention(insightArticles);
 for(const notice of notices)console.log(JSON.stringify(notice));
 console.log(`REVIEW: ${notices.length} contextual wording matches; these are review candidates, not automatic failures.`);
}
