import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const paused=JSON.parse(read('vercel.paused.json'));const active=JSON.parse(read('vercel.json'));const candidate=JSON.parse(read('vercel.public.json'));const comparable={...active};if(process.env.VERCEL){if(comparable.version!==undefined){assert.equal(comparable.version,2);delete comparable.version;}if(comparable.name!==undefined){assert.equal(comparable.name,'sansce-website');delete comparable.name;}}assert.deepEqual(comparable,candidate);
const resolve=(config,path)=>config.routes.find(r=>!r.continue&&new RegExp(`^(?:${r.src})$`).test(path));
assert.equal(resolve(active,'/api/contact').dest,'/api/contact');
assert.equal(resolve(paused,'/api/contact').dest,'/api/public-site-not-found');
const pages=['/','/checkup','/consulting','/process','/insights','/about','/contact','/programs','/landowner-comparison','/land-evaluation'];
for(const path of pages){if(path!=='/landowner-comparison')assert.equal(resolve(paused,path).dest,'/api/public-site-not-found');assert.notEqual(resolve(active,path).dest,'/api/public-site-not-found');assert(existsSync('dist'+(path==='/'?'/index.html':`${path}/index.html`)));}
for(const path of ['/api/unknown','/api/_license','/missing-page','/downloads'])assert.equal(resolve(active,path).dest,'/api/public-site-not-found');
for(const path of ['/api/sanze-system-login','/api/sanze-system-session','/api/sanze-db-load-cases','/api/sanze-db-sync-case','/api/license/activate','/api/license/verify','/api/desktop-download','/downloads/sanze-app-release.json','/update/macos-test-latest.json'])assert.equal(resolve(active,path).dest,'/api/public-site-not-found');
assert(!existsSync('public/downloads')); assert(!existsSync('api/sanze-system-login.js')); assert(!existsSync('src/App.jsx'));
assert.equal(resolve(active,'/assets/example.js').dest,'/$1/$2');assert.equal(resolve(active,'/images/hero-community-renewal.webp').dest,'/$1/$2');assert.equal(resolve(active,'/sitemap.xml').dest,'/$1');
for(const path of pages.slice(1))assert(read(`dist${path}/index.html`).includes(`href="https://www.sanzepm.com.tw${path}"`));
assert(read('dist/sitemap.xml').includes('/checkup'));
console.log('PASS: 10 public routes prepared; public website preserved and evaluation-system routes removed; unknown routes remain 404.');

for(const file of ['dashboard.js','dashboard.css','exclusion.js','source-labels.js']){assert.equal(resolve(active,'/traffic/'+file).dest,'/traffic/$1');assert(existsSync('dist/traffic/'+file));}
