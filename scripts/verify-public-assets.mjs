import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {knowledgePages} from '../shared/knowledge-pages.js';
const config=JSON.parse(readFileSync('vercel.json','utf8'));
const pages=['/','/checkup','/consulting','/process','/insights','/about','/contact','/programs','/landowner-comparison','/land-evaluation',...knowledgePages.map(p=>p.path)];
const assets=new Set();
function asset(value,page){
 const url=new URL(value.replaceAll('&amp;','&'),'https://www.sanzepm.com.tw'+page);
 if(url.origin!=='https://www.sanzepm.com.tw'||url.protocol!=='https:')return;
 const path=decodeURI(url.pathname);assets.add(path);
 assert(existsSync('dist'+path),`Missing built asset ${path} on ${page}`);
 const route=config.routes.find(r=>!r.continue&&new RegExp(`^(?:${r.src})$`).test(path));
 assert(route&&route.dest!=='/api/public-site-not-found',`Asset blocked by public routes: ${path} on ${page}`);
 const destination=path.replace(new RegExp(`^(?:${route.src})$`),route.dest);
 assert.equal(destination,path,`Unexpected asset route: ${path} -> ${destination}`);
}
for(const page of pages){
 const html=readFileSync('dist'+(page==='/'?'/index.html':page+'/index.html'),'utf8');
 for(const tag of html.matchAll(/<(?:img|script|source|link|meta)\b[^>]*>/g)){
  const s=tag[0],attrs=Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  if(attrs.src)asset(attrs.src,page);
  if(attrs.srcSet||attrs.srcset)for(const part of (attrs.srcSet||attrs.srcset).split(','))asset(part.trim().split(/\s+/)[0],page);
  if(attrs.href&&['stylesheet','modulepreload','icon','apple-touch-icon','manifest'].includes(attrs.rel))asset(attrs.href,page);
  if(attrs.content&&['og:image','twitter:image'].includes(attrs.property||attrs.name))asset(attrs.content,page);
 }
}
// CSS may reference files absent from prerendered HTML.
for(const file of readdirSync('dist/assets').filter(f=>f.endsWith('.css'))){
 for(const match of readFileSync('dist/assets/'+file,'utf8').matchAll(/url\(["']?(\/[^)'"\s]+)["']?\)/g))asset(match[1],'/');
}
console.log(`PASS: ${pages.length} pages and ${assets.size} local assets exist and pass the production route allowlist.`);
