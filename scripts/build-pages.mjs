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
const pages={privacy:['隱私權與資料使用','三策案件諮詢、網站AI助理的資料使用、服務處理與個人資料權利說明。'],'website-use':['網站使用說明','三策服務、文章引用、前期試算與AI回覆的適用範圍及內容使用說明。'],'land-evaluation':['土地開發評估','全臺土地用途與變更、透天及集合住宅配置與坪效，以及市地重劃／區段徵收的地主權益與收購條件初核。工具限電腦操作；三策開發評估服務提供成本收益、地主分配、融資與現金流試算。'],reports:['案件報告','登入查閱三策受委託案件的專業評估與分析。'],'landowner-comparison':['地主分配試算與比較','各提案分別填寫容積、獎勵與容積移轉的分配方式，或直接比較承諾建坪；核對面積計算範圍，換算分回建坪與每坪土地換回量。'],programs:['都更與危老方案','查詢臺北、新北、桃園、臺中、臺南與高雄的都市更新、危老重建、公辦與自主更新協助、地方專案，比較自主更新補助、老屋改善及安置方案的資格、期限與官方資料。'],checkup:['都市更新案件健檢','檢視送審進度、合作文件與整合障礙，整理待補資料、處理順序及專業分工，提供地主與更新會案件健檢服務。'],consulting:['地主與社區服務｜都更、危老與合建顧問','三策為地主與更新會比較重建提案、分回房地、補款與契約條件，辦理地主整合、更新會輔導、案件健檢及全案管理。'],'services/development-evaluation':['開發評估服務｜成本收益、融資與現金流','三策為開發業者、投資人及自行出資開發的地主，分析可建規模、土地取得、成本收益、合作分配、融資及各期資金需求，提出方案比較與投資評估。'],process:['服務流程','案件資料檢視、初步諮詢、書面委任與執行回報，確認服務項目、交付成果、時程、費用及階段交接。'],insights:["三策觀點｜都更分配、合建契約與房市分析", "三策從開發整合與營建實務出發，分析都更分配、合建契約、工程交屋與房市數據，協助地主釐清分回條件、費用負擔及合作風險。"],about:['關於三策','三策依委託目的提供地主與社區服務及開發評估服務，分別比較重建權益、協調案件工作，或分析開發收益與資金需求。'],contact:['聯絡我們','選擇地主與社區服務或開發評估服務，提供聯絡方式、基地資料與委託需求，洽詢三策。']};
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
const organization={'@type':'Organization','@id':`${origin}/#organization`,name:'三策專案管理顧問有限公司',legalName:'三策專案管理顧問有限公司',alternateName:['三策','三策專案管理顧問','Sanze'],taxID:'62250642',sameAs:['https://findbiz.nat.gov.tw/fts/company/62250642'],url:origin+'/',logo:origin+'/images/brand/logo-20261026.png',description:'地主與社區的都市更新、危老、合建及案件管理顧問服務，以及開發投資的規模、成本收益、融資與現金流評估。',telephone:'+886-2-2250-8202',email:'sanze.consulting@gmail.com'};
const assistantPages=[];
for(const path of ['',...Object.keys(pages)]){
 const url=`${origin}/${path}`;
 const title=knowledgePages.find(p=>p.path==='/'+path)?.seoTitle || (path==='insights'?pages[path][0]:path?`${pages[path][0]}｜三策專案管理顧問有限公司`:'三策｜地主與社區服務・開發評估服務');
 const description=path?pages[path][1]:'三策專案管理顧問有限公司提供地主與社區服務、開發評估服務。地主與社區可比較重建提案、分回房地及契約；開發委託可分析可建規模、成本收益、融資與資金需求。';
 const knowledgePage=knowledgePages.find(p=>p.path==='/'+path);
 const structured={'@context':'https://schema.org','@graph':[{...organization},{'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'zh-Hant-TW',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#organization'}},...(!path?[{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'三策',alternateName:['三策專案管理顧問','三策專案管理顧問有限公司','Sanze'],publisher:{'@id':origin+'/#organization'},inLanguage:'zh-Hant-TW'}]:[])]};
 if(knowledgePage){structured['@graph'].push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:origin+'/'},{'@type':'ListItem',position:2,name:knowledgePage.kind==='article'?'三策觀點':'地主與社區服務',item:origin+(knowledgePage.kind==='article'?'/insights':'/consulting')},{'@type':'ListItem',position:3,name:knowledgePage.label,item:url}]});if(knowledgePage.kind==='article')structured['@graph'].push({'@type':'Article',headline:knowledgePage.title,description,...(knowledgePage.visual?{image:[origin+knowledgePage.visual.hero.large]}:{}),datePublished:knowledgePage.publishedAt,dateModified:knowledgePage.updatedAt,author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},mainEntityOfPage:{'@id':url+'#webpage'},inLanguage:'zh-Hant-TW'});}
 if(path==='services/development-evaluation')structured['@graph'].push({'@type':'Service','@id':url+'#service',name:'三策開發評估服務',serviceType:'開發投資評估',description,provider:{'@id':origin+'/#organization'},url,mainEntityOfPage:{'@id':url+'#webpage'}});
 if(knowledgePage?.kind==='service')structured['@graph'].push({'@type':'Service','@id':url+'#service',name:knowledgePage.label,serviceType:knowledgePage.label,description:knowledgePage.description,mainEntityOfPage:{'@id':url+'#webpage'},provider:{'@id':origin+'/#organization'},url,areaServed:[{'@type':'City',name:'臺北市'},{'@type':'City',name:'新北市'}]});
 const firstPhoto=Object.values(photoMap['/'+path]||{}).find(p=>!['article-card','closing'].includes(p.role))||Object.values(photoMap['/'+path]||{})[0];const articleCover=knowledgePage?.kind==='article'?editorialPage(knowledgePage).visual.hero.large:null;const coverKey=articleCover?.replace('-768.webp','-1536.webp').replace('-small.webp','.webp')+'|';const shareImage=path==='services/development-evaluation'?'/images/development-service-20261028/site-context.webp':!path?'/images/redesign/home-consultation-20261020.jpg':articleCover?(photoMap['/'+path]?.[coverKey]?.src||articleCover):(firstPhoto?.src||'/images/consulting-workscene.webp');if(knowledgePage?.kind==='article')for(const entry of structured['@graph'])if(entry['@type']==='Article')entry.image=[origin+shareImage];
 const shareAlt=path==='services/development-evaluation'?'高視角下的住宅街廓、停車空地、道路與河岸綠地':Object.values(photoMap['/'+path]||{}).find(p=>p.src===shareImage)?.alt||(!path?'顧問在住戶家中說明重建圖面與規劃':knowledgePage?editorialPage(knowledgePage).visual.alt:'基地與重建工作情境');
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
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...Object.keys(pages).filter(p=>p!=='reports')].map(path=>{const page=knowledgePages.find(p=>p.path==='/'+path);const modified=page?.updatedAt||(['','consulting','land-evaluation','landowner-comparison','about','contact','services/development-evaluation'].includes(path)?'2026-10-28':path==='website-use'?'2026-10-27':path==='about'?'2026-10-26':path==='programs'?'2026-10-20':path==='insights'?insightModified:null);return `<url><loc>${origin}/${path}</loc>${modified?`<lastmod>${escape(modified)}</lastmod>`:''}</url>`;}).join('')}</urlset>`);
rmSync(bundleDir,{recursive:true,force:true});

mkdirSync('docs/website-assistant',{recursive:true});writeFileSync('docs/website-assistant/content.json',JSON.stringify(assistantPages));

// Dashboard labels follow published articles so future additions are visible there too.
const trafficScript=readFileSync('public/traffic/dashboard.js','utf8');
const trafficNames=Object.fromEntries([['/','首頁'],...Object.entries(pages).map(([path,[title]])=>['/'+path,title])]);
trafficNames['/insights']='三策觀點';
writeFileSync('dist/traffic/dashboard.js',trafficScript.replace(/const names=\{[^;]+\};/, 'const names='+JSON.stringify(trafficNames)+';'));
