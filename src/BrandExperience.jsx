import ArticleReadingProgress from './ArticleReadingProgress.jsx';
import ArticleHeading from './ArticleHeading.jsx';
import Readable from './Readable.jsx';
import {photoProps,photoSourceProps,photoEntry} from './photo-refresh.js';
import './developer-entry.css';
import HomeServicePaths,{ServiceInquiryLinks} from './AudienceServices.jsx';
import {developerService} from '../shared/service-audiences.js';
import './brand-wordmark-09.css';
import { trackInteraction } from './interaction-tracking.js';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, Phone, MessageCircle, Mail } from 'lucide-react';
import { knowledgePages } from '../shared/knowledge-pages.js';
import { editorialPage, photoSource } from './editorial-content.js';
import { ExampleGraphic } from './LandownerComparison.jsx';
import { landownerExamples } from './landowner-examples.mjs';
import ScriptureStatement from './ScriptureQuote.jsx';
import HeaderScripture from './HeaderScripture.jsx';

const groups = [
{ title: '地主與社區服務', links: [['/consulting', '服務內容與委託'], ['/checkup', '案件健檢'], ['/services/urban-renewal', '都市更新顧問'], ['/services/dangerous-old-rebuilding', '危老重建評估'], ['/services/joint-construction', '合建條件比較'], ['/services/project-management', '全案管理']] },
{ title: '開發評估服務', links: [[developerService.path,'開發評估內容'],['/land-evaluation','土地評估工具'],[developerService.contact,'洽詢三策']] },
{ title: '方案與實務資料', links: [['/landowner-comparison', '地主分配試算'], ['/programs', '都更與危老方案'], ['/insights', '三策觀點']] },
{ title: '公司與委託資訊', links: [['/about', '關於三策'], ['/process', '服務流程'], ['/reports', '案件報告'], ['/contact', '案件諮詢']] }];

function DialogFrame({ label, children, onClose, trigger, className = '' }) {
  const panel = useRef(null);
  useEffect(() => {const previous = document.body.style.overflow;document.body.style.overflow = 'hidden';panel.current?.querySelector('button')?.focus();return () => {document.body.style.overflow = previous;trigger?.current?.focus();};}, []);
  function keys(e) {if (e.key === 'Escape') onClose();if (e.key === 'Tab') {const focusable = [...panel.current.querySelectorAll('a[href],button,input,summary')].filter((e) => e.getClientRects().length);const first = focusable[0],last = focusable.at(-1);if (e.shiftKey && document.activeElement === first) {e.preventDefault();last?.focus();} else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first?.focus();}}}
  return <div className="sx-overlay" onClick={onClose}><section ref={panel} className={'sx-drawer ' + className} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} onKeyDown={keys}><button className="sx-close" type="button" onClick={onClose} aria-label={'關閉' + label}><X size={22} />關閉</button>{children}</section></div>;
}
export function DesignHeader({ path }) {
  const [menu, setMenu] = useState(false),[contact, setContact] = useState(false),[scrolled, setScrolled] = useState(false),[dockPending, setDockPending] = useState(null);const menuTrigger = useRef(null),contactTrigger = useRef(null),mobileContactTrigger = useRef(null);
  useEffect(() => {const reset = () => setDockPending(null);window.addEventListener('pageshow', reset);return () => window.removeEventListener('pageshow', reset);}, []);
  useEffect(() => {const scroll = () => setScrolled(window.scrollY > 80);scroll();window.addEventListener('scroll', scroll, { passive: true });return () => window.removeEventListener('scroll', scroll);}, []);
  useEffect(()=>{const header=document.querySelector('.sx-header');if(!header)return;const update=()=>document.documentElement.style.setProperty('--site-header-height',header.getBoundingClientRect().height+'px');update();const observer=new ResizeObserver(update);observer.observe(header,{box:'border-box'});return()=>{observer.disconnect();document.documentElement.style.removeProperty('--site-header-height');};},[]);
  return <><header className={'sx-header' + (scrolled ? ' is-scrolled' : '')}><a href="/" className="sx-brand sx-brand--wordmark" aria-label="三策專案管理顧問有限公司首頁"><span className="sx-brand-copy"><img className="sx-wordmark sx-wordmark--09" src="/images/brand/sanze-wordmark-09.svg?v=09-vector-2-ce-tall" width="110" height="52.4" alt="三策" /><small>專案管理顧問有限公司</small></span></a><HeaderScripture /><nav className="sx-primary" aria-label="主要頁面">{[['/consulting', '地主與社區服務'], [developerService.path, '開發評估服務'], ['/programs', '社區方案'], ['/landowner-comparison', '地主試算'], ['/insights', '三策觀點']].map(([href, title]) => <a href={href} key={href} aria-current={path === href ? 'page' : undefined}>{title}</a>)}</nav><div className="sx-header-actions"><a className="sx-consult" href="/contact">案件諮詢</a><button ref={menuTrigger} type="button" className="sx-menu-trigger" onClick={() => setMenu(true)} aria-expanded={menu} aria-label="開啟全站導覽"><Menu size={24} /><span>導覽</span></button></div><ArticleReadingProgress enabled={knowledgePages.some(page => page.kind === 'article' && page.path === path)} /></header>
 <button ref={contactTrigger} className="sx-contact-rail" type="button" onClick={() => {trackInteraction('contact_open', 'rail');setContact(true);}} aria-expanded={contact} aria-label="開啟聯絡三策"><MessageCircle size={19} /><span>聯絡三策</span></button>
 <nav className="sx-mobile-dock" aria-label="常用操作">{[['/consulting', '地主與社區'], [developerService.path, '開發評估']].map(([href, label]) => <a key={href} href={href} aria-current={path === href ? 'page' : undefined} data-pending={dockPending === href ? 'true' : undefined} onClick={(e) => {if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) setDockPending(href);}}><span>{label}</span></a>)}<button ref={mobileContactTrigger} type="button" aria-expanded={contact} onClick={() => {trackInteraction('contact_open', 'mobile');setContact(true);}}><span>聯絡三策</span></button></nav>
 {menu && <DialogFrame label="全站導覽" onClose={() => setMenu(false)} trigger={menuTrigger}><div className="sx-drawer-heading"><img className="sx-drawer-wordmark" src="/images/brand/sanze-wordmark-09.svg?v=09-vector-2-ce-tall" width="92" height="43.8" alt="三策" /><h2>服務與資訊</h2></div><div className="sx-nav-groups">{groups.map((group) => <section key={group.title}><h3>{group.title}</h3><nav aria-label={group.title}>{group.links.map(([href, label]) => <a key={href} href={href} onClick={()=>setMenu(false)} aria-current={path === href ? 'page' : undefined}>{label}</a>)}</nav></section>)}</div>{import.meta.env.DEV && <a className="sx-preview-link" href="/preview">全站改版預覽目錄</a>}<div className="sx-drawer-motto">以信實立本，以專業成事</div></DialogFrame>}
 {contact && <DialogFrame label="聯絡三策" onClose={() => setContact(false)} trigger={typeof window !== 'undefined' && window.innerWidth <= 760 ? mobileContactTrigger : contactTrigger} className="sx-contact-drawer"><p className="sx-label">三策專案管理顧問有限公司</p><h2>地主與社區，<br />開發評估諮詢</h2><p>依委託目的選擇服務，提供基地位置與需求，三策將聯繫確認工作內容。</p><ServiceInquiryLinks onNavigate={()=>setContact(false)}/><div className="sx-contact-methods"><a href="tel:0222508202"><Phone size={21} /><span>電話聯絡<strong>02-2250-8202</strong></span></a><a href="https://lin.ee/w8xSeSz" target="_blank" rel="noopener noreferrer"><MessageCircle size={21} /><span>LINE 官方帳號<strong>@160rlvqj</strong></span></a><a href="mailto:sanze.consulting@gmail.com"><Mail size={21} /><span>電子郵件<strong>sanze.consulting@gmail.com</strong></span></a></div><a href="/contact" className="sx-button">填寫案件概況</a><a className="sx-text-link" href="/process">委託與服務流程</a></DialogFrame>}
 </>;
}
export function DesignMotion() {
  useEffect(() => {const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');const nodes = document.querySelectorAll('main section,main .insights-entry,main .rp-card');const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {if (!isIntersecting) return;target.classList.add('sx-seen', 'is-revealed');if (!reduced.matches && !target.closest('.home-topic') && !target.matches('.home-topic-shell') && target.getBoundingClientRect().top > 110 && target.getBoundingClientRect().height < 1400) {target.animate([{ opacity: .82, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });}observer.unobserve(target);}), { threshold: .035 });nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();}, []);
  return null;
}
const heroSlides = [
{ tag: '地主與社區服務・開發評估服務', title: <>以信實立本，<br />以專業成事。</>, text: '地主與社區重建，從分回房地、合作契約到案件管理；開發投資，從可建規模、成本收益到各期資金需求。依委託目的，提供評估與顧問工作。', image: 'home-consultation-20261020', width: 1672, height: 941, srcSet: '/images/redesign/home-consultation-20261020-960.jpg 960w, /images/redesign/home-consultation-20261020.jpg 1672w', alt: '顧問在住戶家中說明重建圖面與規劃', label: '查看服務', href: '#service-paths', name: '基地與社區' },
{ tag: '地主分配與合作條件', title: <>地主分回的面積，<br />依每份提案<span className="hero-family-phrase">分別計算。</span></>, text: '分配比例、容積與車位約定不同，分回的內容也不同。輸入各案條件，試算地主取得的建坪與差額。', image: 'family-floor-plan', alt: '家人檢視格局圖與目前居住空間', label: '試算兩份提案', href: '/landowner-comparison', name: '合作與分配' },
{ tag: '案件健檢與全案管理', title: <>案件健檢，<br />檢視進度與推動困難。</>, text: '從最近的審查通知、會議紀錄與委託內容，核對目前進度、待辦工作和負責窗口。', image: 'community-meeting', alt: '住戶討論基地資料與後續工作', label: '了解案件健檢', href: '/checkup', name: '推動與分工' }];

const services = [
{ label: '基地評估', title: '都更基地評估與地主整合', description: '核對地籍、建物、使用分區與臨路資料，整理都更或危老途徑的適用條件與待查事項。', href: '/services/urban-renewal', image: 'older-apartment-stair', alt: '老公寓的樓梯與日常通行空間' },
{ label: '合建條件', title: '比較合建提案與契約', description: '從面積、車位、費用，到搬遷與交屋，確認比較基準。', href: '/services/joint-construction', image: 'contract-review', alt: '逐項核對合作契約內容' },
{ label: '案件健檢', title: '檢視進度與待處理問題', description: '對照提案、契約、會議與審查資料，整理進度障礙、缺漏文件、責任窗口及處理順序。', href: '/checkup', image: 'document-review', alt: '整理基地圖說與現有案件資料' },
{ label: '全案管理', title: '協調團隊分工與進度', description: '建立分工與文件紀錄，追蹤會議決議、送審補件、回覆期限及待決議事項。', href: '/services/project-management', image: 'construction-inspection', alt: '工地人員檢查建築現況' }];

const stageItems = [
{ label: '正在整合地主', image: 'neighborhood-dry-v2', title: '整理地主意見與合作共識', text: '按所有權人記錄重建意願、分配期待與保留意見，準備會議議題，追蹤尚未議定的合作條件。', bring: '基地位置、地主意願與目前合作提案', stage: '初步整合中' },
{ label: '更新會已成立', image: 'community-meeting', title: '確認更新會的工作與委託', text: '核對已有的決議與委託內容，釐清工作分工、所需文件及負責窗口。', bring: '章程、會議紀錄與已有的委託文件', stage: '更新會已成立' },
{ label: '案件已經送件', image: 'document-review', title: '核對審查意見與補件進度', text: '查看已完成的程序、審查意見與待補資料，安排需要各方配合的工作。', bring: '最近的審查通知、送件資料與補件清單', stage: '已送件審查中' },
{ label: '推動遇到困難', image: 'consultation', title: '釐清爭議與處理順序', text: '從住戶意見、合作安排、資金與團隊配合，整理主要障礙、依據資料與處理順序。', bring: '現有合作文件，以及主要待處理事項', stage: '其他／尚待釐清' }];


const commissionItems=[
 ['地主諮詢','個別地主諮詢','個別地主可就權益、合作提案及已簽文件委託諮詢。三策依文件版本與案件進度，整理分配、費用及程序上的待確認事項。'],
 ['既有團隊','既有合作團隊的案件','已有建商、實施者或專業團隊的案件，依既有契約確認各方責任，再議定三策承接的檢視與協調工作，避免委託範圍重疊。'],
 ['費用安排','服務報價與付款安排','依工作範圍及所需工作量估算，在委託前說明工作項目、交付資料、預計時間與費用。']
];
function HomeCommission(){
 const [selected,setSelected]=useState(0);
 return <section className="home-topic-shell home-commission-shell"><div className="sx-wrap home-topic home-commission" aria-labelledby="home-commission-title">
  <TopicIdentity id="home-commission-title" title="地主與社區委託" current={commissionItems[selected][0]}/>
  <div className="home-topic-content">
   <div className="commission-intro"><h3>依現有文件，<br/>議定工作與費用。</h3><a className="sx-text-link" href="/process">查看服務流程</a></div>
   <div className="commission-desk"><nav aria-label="委託內容">{commissionItems.map(([label],i)=><button type="button" key={label} aria-pressed={selected===i} aria-controls={'commission-panel-'+i} onClick={()=>setSelected(i)}>{label}</button>)}</nav>
    <div className="commission-reading">{commissionItems.map(([,title,body],i)=><section id={'commission-panel-'+i} key={title} hidden={selected!==i} aria-labelledby={'commission-heading-'+i}><h4 id={'commission-heading-'+i}>{title}</h4><p>{body}</p></section>)}</div>
   </div>
   <nav className="commission-services" aria-label="相關顧問服務"><span>服務內容</span><a href="/services/urban-renewal">都更評估與地主整合</a><a href="/services/dangerous-old-rebuilding">危老重建資格與評估</a><a href="/services/joint-construction">合建提案與分配比較</a><a href="/services/project-management">全案管理的委託與費用</a></nav>
  </div>
 </div></section>;
}

function TopicIdentity({id,title,current}) {return <header className="home-topic-identity"><h2 id={id}>{title}</h2>{current&&<span className="home-topic-current" key={current} aria-live="polite">{current}</span>}</header>;}

export default function DesignHome() {
  const [slide, setSlide] = useState(0),[service, setService] = useState(0),[stage, setStage] = useState(0),[topic, setTopic] = useState('全部');
  const serviceNav = useRef(null);
  useEffect(() => {
    const nav = serviceNav.current;
    if (!nav) return;
    let active = true;
    const update = () => {
      if (!active) return;
      const label = nav.querySelector('[aria-pressed="true"] span');
      if (!label) return;
      const box = label.getBoundingClientRect(), parent = nav.getBoundingClientRect();
      nav.style.setProperty('--service-choice-width', box.width + 'px');
      nav.style.setProperty('--service-choice-start', box.left - parent.left + 'px');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    nav.querySelectorAll('button span').forEach(label => observer.observe(label));
    document.fonts.ready.then(update);
    return () => { active = false; observer.disconnect(); };
  }, [service]);
  const articles = knowledgePages.filter((p) => p.kind === 'article').sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.publishedAt.localeCompare(a.publishedAt));const topics = ['全部', '都更分配', '合建契約', '地主權益'];const shown = articles.filter((p) => topic === '全部' || p.label === topic).slice(0, 3);const current = heroSlides[slide],s = services[service],caseStage = stageItems[stage];
  useEffect(() => {if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;const timer = setInterval(() => {if (!document.hidden) setSlide((i) => (i + 1) % heroSlides.length);}, 8500);return () => clearInterval(timer);}, []);
  useEffect(() => {const header=document.querySelector('.sx-header');if(!header)return;const update=()=>document.documentElement.style.setProperty('--home-header-height',header.getBoundingClientRect().height+'px');update();const observer=new ResizeObserver(update);observer.observe(header);return()=>{observer.disconnect();document.documentElement.style.removeProperty('--home-header-height');};}, []);
  useEffect(() => {
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
    const animations=new Set();
    const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting},index)=>{if(!isIntersecting)return;const animation=target.animate([{opacity:.8,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:720,delay:(index%3)*70,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));observer.unobserve(target);});},{threshold:.12});
    document.querySelectorAll('.home-about-photo,.sx-about-copy,.home-services-intro,.sx-service-browser>nav,.sx-service-browser article,.home-stage-intro,.sx-stage-tabs,.sx-stage-detail,.home-topic-tools .sx-tools-grid>div,.home-journal-masthead,.sx-journal-tabs,.sx-journal-stories>article').forEach(node=>observer.observe(node));
    return()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());};
  }, []);
  function selectSlide(i) {setSlide(i);}
  return <div className="sx-home"><section className="sx-hero" aria-label="三策服務主題"><div className="sx-hero-scene">{heroSlides.map((item, i) => <picture className="sx-hero-photo" key={item.name}>{photoEntry(photoSource(item.image))?.mobile && <source media="(max-width: 760px)" srcSet={photoEntry(photoSource(item.image)).mobile} />}<img className={slide === i ? 'is-active' : ''} aria-hidden={slide !== i} fetchPriority={i === 0 ? 'high' : undefined} {...photoProps({ src: photoSource(item.image), alt: slide === i ? item.alt : '', width: item.width || 1536, height: item.height || 1024, srcSet: item.srcSet, sizes: item.srcSet ? "100vw" : undefined })} /></picture>)}</div><div className="sx-hero-story" key={slide}><p className="sx-label">{current.tag}</p><Readable as="h1">{current.title}</Readable><p className="sx-hero-deck">{current.text}</p><a className="sx-button sx-button-gold" href={current.href}>{current.label}</a></div><div className="sx-hero-controls"><div aria-label="選擇首頁主題">{heroSlides.map((item, i) => <button type="button" key={item.name} aria-pressed={slide === i} onClick={() => selectSlide(i)}>{item.name}<span aria-hidden="true" /></button>)}</div></div></section>
 <div id="service-paths"><HomeServicePaths/></div>
 <section className="sx-about sx-wrap home-topic home-topic-about" id="home-about" aria-labelledby="home-about-title"><TopicIdentity id="home-about-title" title="認識三策"/><div className="home-topic-content home-about-composition"><figure className="home-about-photo"><img loading="lazy" {...photoProps({ src: photoSource('urban-blocks'), width: "1536", height: "1024", alt: "既有住宅與都市街廓" })} /><figcaption>基地評估、地主整合與重建工作協調</figcaption></figure><div className="sx-about-copy"><h3>重建與開發，<br />依委託目的提供服務</h3><p>地主與社區服務，著重分回房地、費用負擔、搬遷與契約，協調地主整合、更新會及案件進度。</p><p>開發評估服務，依取得方式與投資目標，分析可建規模、成本收益、融資與現金流。委託人、分析目的與工作範圍，在承接前分別議定。</p><a className="sx-text-link" href="/about">了解我們的工作方式</a><div className="sx-about-motto">以信實立本，以專業成事<ScriptureStatement kind="about" /></div></div></div></section>
 <section className="sx-services home-topic-shell"><div className="sx-wrap home-topic home-topic-services" id="home-services" aria-labelledby="home-services-title"><TopicIdentity id="home-services-title" title="地主與社區服務" current={s.label}/><div className="home-topic-content"><div className="home-services-intro"><h3>從基地評估到全案管理</h3><a className="sx-text-link" href="/consulting">完整服務內容</a></div><div className="sx-service-browser"><nav ref={serviceNav} aria-label="選擇服務" data-choice={service}>{services.map((item, i) => <button type="button" key={item.label} aria-pressed={service === i} aria-controls="sx-service-feature" onClick={() => {if (i !== service) trackInteraction('service_select', ['site', 'contract', 'checkup', 'management'][i]);setService(i);}}><span>{item.label}</span></button>)}</nav><article id="sx-service-feature" key={service}><figure><img loading="lazy" {...photoProps({ src: photoSource(s.image), width: "1536", height: "1024", alt: s.alt })} /></figure><div><h4>{s.title}</h4><p>{s.description}</p><a className="sx-text-link" href={s.href}>查看這項服務</a></div></article></div></div></div></section>
 <section className="sx-stage sx-wrap home-topic home-topic-stage" id="home-stage" aria-labelledby="home-stage-title"><TopicIdentity id="home-stage-title" title="案件階段" current={caseStage.label}/><div className="home-topic-content"><div className="home-stage-intro"><h3>依目前進度，<br className="home-desktop-break"/>安排後續工作</h3><p>依整合、更新會運作與送審進度，查閱各階段的工作與準備資料。</p></div><nav className="sx-stage-tabs" aria-label="選擇案件階段" data-choice={stage}>{stageItems.map((item, i) => <button key={item.label} type="button" aria-pressed={stage === i} aria-controls="sx-stage-detail" onClick={() => {if (i !== stage) trackInteraction('stage_select', ['integration', 'association', 'submitted', 'blocked'][i]);setStage(i);}}>{item.label}</button>)}</nav><div id="sx-stage-detail" className="sx-stage-detail" key={stage}><figure><img data-photo-slot="home-stage" loading="lazy" {...photoProps({ slot: "home-stage", src: photoSource(caseStage.image), width: "1536", height: "1024", alt: caseStage.label + '相關工作環境' })} /></figure><div><h4>{caseStage.title}</h4><p className="home-stage-description">{caseStage.text}</p><div className="sx-prepare"><strong>諮詢準備資料</strong><p>{caseStage.bring}</p></div><a className="sx-text-link" href={'/contact?service=owner&stage=' + encodeURIComponent(caseStage.stage)+'#service-inquiry'}>洽詢這個階段的顧問服務</a></div></div></div></section>
 <section className="sx-tools home-topic-shell"><div className="sx-wrap home-topic home-topic-tools" id="home-tools" aria-labelledby="home-tools-title"><TopicIdentity id="home-tools-title" title="地主分配試算"/><div className="home-topic-content sx-tools-grid"><div><h3><span>比較面積，</span><span>也核對約定。</span></h3><p>輸入自己的土地持分與各案條件，比較分回建坪；沒有完整資料，也可以先用範例了解填寫方式。</p><a className="sx-button sx-button-gold" href="/landowner-comparison">開始地主分配試算</a></div><div className="sx-tools-example"><div><span>假設範例</span><span>含公設建坪，車位另計</span></div><ExampleGraphic item={landownerExamples[0]} /></div></div></div></section>
 <section className="sx-journal sx-wrap home-topic home-topic-journal" id="home-journal" aria-labelledby="home-journal-title"><TopicIdentity id="home-journal-title" title="三策觀點" current={topic==='全部'?'文章選讀':topic}/><div className="home-topic-content"><div className="home-journal-masthead"><h3>分配、契約與地主權益</h3><a className="sx-text-link" href="/insights">全部文章</a></div><nav className="sx-journal-tabs" aria-label="首頁文章主題">{topics.map((t) => <button type="button" key={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>)}</nav><div className="sx-journal-stories" key={topic}>{shown.map((item) => {const p = editorialPage(item);return <article key={p.path}><a href={p.path}><span className="home-story-photo"><img data-photo-slot="article-card" loading="lazy" {...photoProps({ slot: "article-card", src: p.visual.hero.small, width: "768", height: "512", alt: p.visual.alt })} /></span><div><span>{p.label}</span><ArticleHeading as="h4" className="home-article-title">{p.title}</ArticleHeading><p>{p.summary || p.description}</p><span className="sx-read-story">閱讀全文</span></div></a></article>;})}</div></div></section>
 <HomeCommission/>
 <section className="home-topic-contact sx-wrap home-topic" aria-labelledby="home-contact-title"><TopicIdentity id="home-contact-title" title="案件諮詢"/><div className="home-topic-content contact-composition"><figure><img loading="lazy" {...photoProps({ src: photoSource('relocation-home'), width: "1536", height: "1024", alt: "家人準備搬遷與整理生活物品" })} /></figure><div><h3>依委託需求，<br/>提供基地與案件資料</h3><p>地主與社區可提供重建提案及案件進度；開發評估可提供取得條件、開發目標與預計分析項目。</p><ServiceInquiryLinks/></div></div></section>
 </div>;
}
