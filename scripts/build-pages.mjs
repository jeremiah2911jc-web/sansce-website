import {editorialPage} from '../src/editorial-content.js';
import {extractServerStyles,serverStyleSheet} from './ssr-styles.mjs';
import {createHash} from 'node:crypto';
import photoMap from '../src/photo-refresh-map.json' with {type:'json'};
import {readFileSync,writeFileSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {knowledgePages} from '../shared/knowledge-pages.js';
import {basePagePaths} from '../shared/site-routes.js';
const serverStyles=new Map(),renderedFiles=[];
const pages={privacy:['隱私權與資料使用','三策案件諮詢、網站AI助理的資料使用、服務處理與個人資料權利說明。'],'website-use':['網站使用說明','三策顧問服務、文章引用、前期試算與AI回覆的適用範圍及內容使用說明。'],'land-evaluation':['土地開發評估','全臺土地用途與變更、透天及集合住宅配置與坪效，以及市地重劃／區段徵收的地主權益與收購條件初核。限電腦本次操作；成本與財務評估於三策 App 操作。'],reports:['案件報告','登入查閱三策受委託案件的專業評估與分析。'],'landowner-comparison':['地主分配試算與比較','各提案分別填寫容積、獎勵與容積移轉的分配方式，或直接比較承諾建坪；核對面積口徑，換算分回建坪與每坪土地換回量。'],programs:['都更與危老方案','查詢臺北、新北、桃園、臺中、臺南與高雄的都市更新、危老重建、公辦與自主更新協助、地方專案，比較自主更新補助、老屋改善及安置方案的資格、期限與官方資料。'],checkup:['都市更新案件健檢','檢視送審進度、合作文件與整合障礙，整理待補資料、處理順序及專業分工，提供地主與更新會案件健檢服務。'],consulting:['都更、危老重建與合建顧問｜全案管理','三策協助都市更新、危老重建與合建案件的基地評估、地主整合、合作條件比較與全案管理，協調專業分工並追蹤進度。'],process:['服務流程','案件資料檢視、初步諮詢、書面委任與執行回報，確認服務項目、交付成果、時程、費用及階段交接。'],insights:["三策觀點｜都更分配、合建契約與房市分析", "三策從開發整合與營建實務出發，分析都更分配、合建契約、工程交屋與房市數據，協助地主釐清分回條件、費用負擔及合作風險。"],about:['關於三策','以信實立本，以專業成事。依基地與案件資料，協助地主與更新會比較合作條件、整理問題與後續工作。'],contact:['聯絡我們','提供行政區、基地地址、案件階段與目前問題，預約三策案件初步諮詢。']};
for(const page of knowledgePages) pages[page.path.slice(1)]=[page.title,page.description];
for(const path of basePagePaths)if(path!=='/'&&!pages[path.slice(1)])throw Error('Missing page metadata: '+path);
const origin='https://www.sanzepm.com.tw';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const json=s=>JSON.stringify(s).replaceAll('<','\\u003c');
const bundleDir=resolve('node_modules/.cache/sanze-seo-render');
await build({configFile:false,plugins:[react()],logLevel:'error',build:{ssr:'scripts/render-site.jsx',outDir:bundleDir,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'render.mjs'}}}});
const {render}=await import(pathToFileURL(resolve(bundleDir,'render.mjs')).href);
const template=readFileSync('dist/index.html','utf8');
const stylesheet=readdirSync('dist/assets').find(f=>/^ConsultingSite-.*\.css$/.test(f));
if(!stylesheet)throw Error('Public stylesheet missing');
const organization={'@type':'Organization','@id':`${origin}/#organization`,name:'三策專案管理顧問有限公司',legalName:'三策專案管理顧問有限公司',alternateName:['三策','三策專案管理顧問','Sanze'],taxID:'62250642',sameAs:['https://findbiz.nat.gov.tw/fts/company/62250642'],url:origin+'/',logo:origin+'/images/brand/logo-20261023.png',description:'都市更新與都更案件健檢、危老重建及合建諮詢、地主整合與全案管理顧問服務。',telephone:'+886-2-2250-8202',email:'sanze.consulting@gmail.com'};
const assistantPages=[];
for(const path of ['',...Object.keys(pages)]){
 const url=`${origin}/${path}`;
 const title=knowledgePages.find(p=>p.path==='/'+path)?.seoTitle || (path==='insights'?pages[path][0]:path?`${pages[path][0]}｜三策專案管理顧問有限公司`:'三策｜都更、危老重建、合建與全案管理顧問');
 const description=path?pages[path][1]:'三策專案管理顧問有限公司提供都更與都市更新案件健檢、危老重建及合建諮詢、地主整合與全案管理顧問服務，協助雙北地主及更新會評估基地、比較合作條件、協調團隊並追蹤進度。';
 const knowledgePage=knowledgePages.find(p=>p.path==='/'+path);
 const structured={'@context':'https://schema.org','@graph':[{...organization},{'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'zh-Hant-TW',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#organization'}},...(!path?[{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'三策',alternateName:['三策專案管理顧問','三策專案管理顧問有限公司','Sanze'],publisher:{'@id':origin+'/#organization'},inLanguage:'zh-Hant-TW'}]:[])]};
 if(knowledgePage){structured['@graph'].push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:origin+'/'},{'@type':'ListItem',position:2,name:knowledgePage.kind==='article'?'三策觀點':'都市更新顧問',item:origin+(knowledgePage.kind==='article'?'/insights':'/consulting')},{'@type':'ListItem',position:3,name:knowledgePage.label,item:url}]});if(knowledgePage.kind==='article')structured['@graph'].push({'@type':'Article',headline:knowledgePage.title,description,...(knowledgePage.visual?{image:[origin+knowledgePage.visual.hero.large]}:{}),datePublished:knowledgePage.publishedAt,dateModified:knowledgePage.updatedAt,author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},mainEntityOfPage:{'@id':url+'#webpage'},inLanguage:'zh-Hant-TW'});}
 if(knowledgePage?.kind==='service')structured['@graph'].push({'@type':'Service','@id':url+'#service',name:knowledgePage.label,serviceType:knowledgePage.label,description:knowledgePage.description,mainEntityOfPage:{'@id':url+'#webpage'},provider:{'@id':origin+'/#organization'},url,areaServed:[{'@type':'City',name:'臺北市'},{'@type':'City',name:'新北市'}]});
 const firstPhoto=Object.values(photoMap['/'+path]||{}).find(p=>!['article-card','closing'].includes(p.role))||Object.values(photoMap['/'+path]||{})[0];const articleCover=knowledgePage?.kind==='article'?editorialPage(knowledgePage).visual.hero.large:null;const coverKey=articleCover?.replace('-768.webp','-1536.webp').replace('-small.webp','.webp')+'|';const shareImage=!path?'/images/redesign/home-consultation-20261020.jpg':articleCover?(photoMap['/'+path]?.[coverKey]?.src||articleCover):(firstPhoto?.src||'/images/consulting-workscene.webp');if(knowledgePage?.kind==='article')for(const entry of structured['@graph'])if(entry['@type']==='Article')entry.image=[origin+shareImage];
 const shareAlt=Object.values(photoMap['/'+path]||{}).find(p=>p.src===shareImage)?.alt||(!path?'顧問在住戶家中說明重建圖面與規劃':knowledgePage?editorialPage(knowledgePage).visual.alt:'基地與重建工作情境');
 const metadata=(path==='reports'?'<meta name="robots" content="noindex, nofollow, noarchive"/>':'')+`<meta property="og:site_name" content="三策"/><meta property="og:locale" content="zh_TW"/><meta property="og:type" content="${knowledgePage?.kind==='article'?'article':'website'}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="${origin}${shareImage}"/><meta property="og:image:alt" content="${escape(shareAlt)}"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${json(structured)}</script><link rel="stylesheet" href="/assets/${stylesheet}"/>`;
 let html=template.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace(/name="description"\s+content="[^"]*"/,`name="description" content="${escape(description)}"`).replace(/<link rel="canonical"[^>]+>/,`<link rel="canonical" href="${url}"/>`).replace('</head>',metadata+'</head>').replace('<div id="root"></div>',`<div id="root">${render('/'+path)}</div>`);
 const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 if(path!=='reports')assistantPages.push({path:'/'+path,url,text:main.replace(/<\/?span\b[^>]*>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'\"').replace(/\s+/g,' ').trim(),links:[...new Set(Array.from(main.matchAll(/href="([^"]+)"/g),m=>m[1]).filter(h=>!h.startsWith('#')&&!h.startsWith('tel:')&&!h.startsWith('mailto:')).map(h=>new URL(h,origin).href.replaceAll('&amp;','&')))]});
 html=extractServerStyles(html,serverStyles).html.replace('</head>','<link rel="stylesheet" href="/assets/__SANZE_SERVER_STYLES__"/></head>');
 const dir=path?`dist/${path}`:'dist';mkdirSync(dir,{recursive:true});writeFileSync(`${dir}/index.html`,html);renderedFiles.push(`${dir}/index.html`);
}
const serverCSS=serverStyleSheet(serverStyles);
const serverStyleAsset='server-rendered-'+createHash('sha256').update(serverCSS).digest('hex').slice(0,12)+'.css';
writeFileSync('dist/assets/'+serverStyleAsset,serverCSS);
for(const file of renderedFiles)writeFileSync(file,readFileSync(file,'utf8').replace('__SANZE_SERVER_STYLES__',serverStyleAsset));
// Only emit known content modification dates; never replace them with build time.
const insightModified=knowledgePages.filter(p=>p.kind==='article').map(p=>p.updatedAt||p.publishedAt).filter(Boolean).sort().at(-1);
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...Object.keys(pages).filter(p=>p!=='reports')].map(path=>{const page=knowledgePages.find(p=>p.path==='/'+path);const modified=page?.updatedAt||(path==='programs'?'2026-10-20':['consulting','about'].includes(path)?'2026-10-15':path==='insights'?insightModified:null);return `<url><loc>${origin}/${path}</loc>${modified?`<lastmod>${escape(modified)}</lastmod>`:''}</url>`;}).join('')}</urlset>`);
rmSync(bundleDir,{recursive:true,force:true});

mkdirSync('docs/website-assistant',{recursive:true});writeFileSync('docs/website-assistant/content.json',JSON.stringify(assistantPages));

// Dashboard labels follow published articles so future additions are visible there too.
const trafficScript=readFileSync('public/traffic/dashboard.js','utf8');
const trafficNames=Object.fromEntries([['/','首頁'],...Object.entries(pages).map(([path,[title]])=>['/'+path,title])]);
trafficNames['/insights']='三策觀點';
writeFileSync('dist/traffic/dashboard.js',trafficScript.replace(/const names=\{[^;]+\};/, 'const names='+JSON.stringify(trafficNames)+';'));
