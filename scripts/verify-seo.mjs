import {knowledgePages} from '../shared/knowledge-pages.js';
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
for(const path of ['', 'checkup','consulting','services/development-evaluation','process','insights','about','contact','programs','landowner-comparison','land-evaluation',...knowledgePages.map(p=>p.path.slice(1))]){
 const html=readFileSync(`dist/${path?path+'/':''}index.html`,'utf8');
 assert.match(html,/<main id="main"/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.match(html,/三策專案管理顧問有限公司/);assert.match(html,/<link rel="stylesheet" href="\/assets\/ConsultingSite-/);
 const json=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);const graph=json['@graph'];assert.equal(graph.find(x=>x['@type']==='Organization').legalName,'三策專案管理顧問有限公司');const org=graph.find(x=>x['@type']==='Organization');assert.equal(org.name,'三策專案管理顧問有限公司');assert.equal(org.taxID,'62250642');assert.deepEqual(org.sameAs,['https://findbiz.nat.gov.tw/fts/company/62250642']);assert.doesNotMatch(html,/3cstrat\.com/);assert.equal(graph.find(x=>x['@type']==='WebPage').url,`https://www.sanzepm.com.tw/${path}`);assert.equal(html.match(/rel="canonical"/g).length,1);
 if(!path){assert.equal(graph.find(x=>x['@type']==='WebSite').name,'三策');assert.match(html,/<title>三策｜/);}if(path==='contact'){assert.match(html,/name="location"/);assert.match(html,/基地地址/);assert.match(html,/建商／實施者/);}
 assert.doesNotMatch(html,/service_role|sk-proj-|re_[A-Za-z0-9]{20}/);
}
for(const page of knowledgePages){const html=readFileSync(`dist${page.path}/index.html`,'utf8');assert(html.replace(/<\/?span\b[^>]*>/g,'').includes(page.title));const copy=html.replace(/<\/?span\b[^>]*>/g,'').replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/g,(_,reference)=>reference.replace(/<[^>]+>/g,''));assert(page.sections.at(-1)[1].split('\n\n').every(p=>copy.includes(p)),`Final section text missing: ${page.path}`);assert(readFileSync('dist/sitemap.xml','utf8').includes(page.path));const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert(graph.some(x=>x['@type']==='BreadcrumbList'));if(page.kind==='article')assert(graph.some(x=>x['@type']==='Article'));for(const path of page.related)assert(knowledgePages.some(p=>p.path===path));}
const sitemap=readFileSync('dist/sitemap.xml','utf8');
for(const page of knowledgePages.filter(p=>p.kind==='article')){
 const html=readFileSync(`dist${page.path}/index.html`,'utf8');
 assert(html.includes(`<title>${page.seoTitle||page.title}`));
 assert(sitemap.includes(`<loc>https://www.sanzepm.com.tw${page.path}</loc><lastmod>${page.updatedAt}</lastmod>`));
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(graph.find(x=>x['@type']==='Article').dateModified,page.updatedAt);
}
console.log(`PASS: ${11+knowledgePages.length} public pages, SEO metadata, structured data and accurate article sitemap modification dates.`);
