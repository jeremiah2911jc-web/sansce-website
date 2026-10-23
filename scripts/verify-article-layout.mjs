import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {insightArticles} from '../shared/insight-articles.js';
import {insightTitlePhrases} from '../shared/insight-title-layout.mjs';
const listing=readFileSync('dist/insights/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
for(const page of insightArticles){
 const phrases=insightTitlePhrases[page.title];
 assert(Array.isArray(phrases)&&phrases.length,`Missing reviewed title phrases: ${page.title}`);
 assert.equal(phrases.join(''),page.title,`Title was changed by line grouping: ${page.title}`);
 assert(phrases.every(x=>x.trim()===x&&!/[\r\n]/.test(x)),`Invalid title phrase: ${page.title}`);
 for(const phrase of phrases)assert(listing.includes('class="insight-title-phrase">'+escape(phrase)+'</span>'),`Title phrase absent from rendered index: ${phrase}`);
 const article=readFileSync('dist'+page.path+'/index.html','utf8');
 assert(article.includes('sanze-feature-section'),`Article body missing: ${page.path}`);
}
console.log(`PASS: ${insightArticles.length} article titles have reviewed phrase boundaries, unchanged full text and rendered index/body coverage. Visual paragraph verification remains required.`);
