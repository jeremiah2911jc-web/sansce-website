import CompanyFooter from './CompanyFooter.jsx';
import SitePolicies from './SitePolicies.jsx';
import ServicePageBody,{ServicePageNavigation} from './ServicePageBody.jsx';
import {ServiceWorkFocus} from './ServiceWorkStories.jsx';
import {setPhotoPage} from './photo-refresh.js';
import {photoProps,photoSourceProps} from './photo-refresh.js';
import { contactTrackingContext } from './interaction-tracking.js';
import SiteContextDrawing from './SiteContextDrawing.jsx';
import ReportDesignPreview from './ReportDesignPreview.jsx';
import PreviewIndex from './PreviewIndex.jsx';
import LandEvaluation from './land-evaluation/LandEvaluation.jsx';
import { editorialPage, serviceImage, photoSource } from './editorial-content.js';
import { InsightHero, InsightBody, ArticleReadingIndex } from './InsightMagazine.jsx';
import Reports from './Reports.jsx';
import AboutSanze from './AboutSanze.jsx';
import ConsultingOverview from './ConsultingOverview.jsx';
import './scripture.css';
import ScriptureStatement from './ScriptureQuote.jsx';
import Readable from './Readable.jsx';
import DesignHome, { DesignHeader, DesignMotion } from './BrandExperience.jsx';
import LandownerComparison from './LandownerComparison.jsx';
import InsightsLibrary, { InsightArticleIntro, InsightCopyright } from './Insights.jsx';
import WebsiteAssistant from './WebsiteAssistant.jsx';
import { useEffect, useRef, useState } from 'react';
import { stages, promoters } from '../shared/contact-fields.js';
import { Menu, X, Check, Building2 } from 'lucide-react';
import './consulting.css';
import './site-theme.css';
import './brand-experience.css';
import RenewalPrograms from './RenewalPrograms';
import { knowledgePages, knowledgeByPath } from '../shared/knowledge-pages.js';
import './readable.css';
import './assistant-theme.css';
import './contact-information.css';
import './arrow-free.css';
import './menu-motion.css';
import './renewal-programs.css';
import './insight-magazine.css';
import './editorial-system.css';
import './sanze-experience.css';
import './assistant-surface.css';
import './palette-navy-copper.css';
import './palette-refinements.css';
import './layout-quality.css';
import './rights-shortfall.css';
import './approved-not-started.css';
import './design-refinement.css';
import './reaudit-refinement.css';

const lineUrl = 'https://lin.ee/w8xSeSz';
function LineContact() {return <div className="line-contact"><div><Readable as="h3">LINE 官方帳號</Readable><Readable as="p">加入三策 LINE，直接與我們聯絡。</Readable><a className="line-add" href={lineUrl} target="_blank" rel="noopener noreferrer">加入 LINE </a><small>ID：@160rlvqj</small></div></div>;}
export const pages = [['/', '首頁'], ['/checkup', '案件健檢'], ['/consulting', '都市更新顧問'], ['/process', '服務流程'], ['/programs', '都更與危老方案'], ['/insights', '三策觀點'], ['/landowner-comparison', '地主試算'], ['/about', '關於三策'], ['/contact', '聯絡我們']];
const services = [
['案件健檢與顧問服務', '已開始推動，想知道接下來怎麼做', '了解案子目前的進度，查看現有資料，釐清可能影響進度的問題，討論接下來要做什麼、由誰負責。', '整理目前進度、列出問題、建議處理方式'],
['都更與危老重建基地評估', '想知道自己的基地適合怎麼重建', '查看土地、建物現況與使用限制，協助比較都市更新與危老重建的辦理方向，整理需要由專業人員進一步確認的條件。', '整理基地條件、初步評估、列出需補充的資料'],
['地主整合', '地主有意願，但想法還不一致', '了解地主的想法與疑問，協助安排討論，記錄大家同意的內容，整理還沒談妥的事項與後續討論安排。', '了解地主意願、整理爭議、協助溝通與開會'],
['更新會輔導', '更新會成立後，需要有人協助推動', '協助理監事安排工作、準備會議資料，確認委託對象與各自負責的事項。', '安排工作、準備會議、確認委託內容與分工'],
['全案管理與專業團隊整合', '需要有人協調分工、追蹤案件進度', '依委託範圍與案件需求，協助確認都更規劃、建築、估價、財務及法律等工作的分工，追蹤進度、所缺資料和需要決定的事情。', '協調分工、整理所需文件、追蹤進度與問題']];

const situations = [
['更新會已成立', '理監事想知道接下來要做什麼、哪些工作需要委託，以及由誰負責。'],
['已完成初步整合', '地主已有初步共識，準備辦理後續程序，需要確認文件與工作安排。'],
['案件已經送件', '想了解目前進度、待補資料，以及補件與回覆的負責人。'],
['案子遲遲推不動', '地主意見談不攏、資金安排有困難，或團隊配合不順，需要協助處理。'],
['正在比較合作條件', '收到建商、實施者或專業團隊的提案，想了解條件差在哪裡、有哪些地方要注意。'],
['需要顧問協助', '希望有人協助檢視資料、整理地主與更新會的疑問，討論後續做法。']];

const steps = [
['提供案件概況', '提供基地地址、案件階段、推動單位及主要委託需求，並附現有提案、契約、會議紀錄或審查通知。三策據此確認諮詢範圍及待補資料。'],
['安排初步諮詢', '依案件資料安排會談，確認地主、更新會或既有團隊的參與人員。會談檢視程序、合作條件與分工，整理需進一步查證或另委託專業人員的項目。'],
['確認委任與費用', '以書面議定服務項目、執行期間、交付資料、回報方式、聯絡及決策窗口，並確認費用、付款與追加工作的處理方式。雙方完成委任後依約執行。'],
['執行、回報與交接', '依約檢視資料、協調分工並追蹤待辦工作，記錄已完成、尚待處理及需由委託人決定的事項。階段完成或委託結束時，依約交付成果與交接文件。']];

function LinkButton({ href = '/contact', children = '預約案件初步諮詢', light = false }) {return <a className={`cta ${light ? 'light' : ''}`} href={href}>{children}</a>;}
function Intro({ label, title, children }) {
 const [image,alt]=serviceImage(label);
 const type=label.includes('流程')?'process':label.includes('聯絡')?'contact':label.includes('健檢')?'checkup':label.includes('合建')?'joint':label.includes('危老')?'eligibility':label.includes('全案')?'management':'urban';
 return <section className={'service-page-opening opening-'+type}><div className="opening-copy"><p className="sx-label">{label}</p><Readable as="h1">{title}</Readable><p>{children}</p>{type==='process'&&<a href="#commission-steps" className="co-text-link">查閱諮詢與委任程序</a>}{type==='checkup'&&<a href="#checkup-scope" className="co-text-link">查閱健檢工作與準備資料</a>}</div><figure><img fetchPriority="high" {...photoProps({src:photoSource(image),alt,width:"1536",height:"1024"})}/></figure></section>;
}
function CTA() {return <section className="closing-brief wrap"><div><p className="eyebrow">案件諮詢</p><h2>預約顧問諮詢</h2><p>提供基地位置、案件階段及現有文件，安排會談。</p></div><LinkButton /></section>;}
function ServiceList() {return <div className="service-list">{services.map(([title, stage, body, output], i) => <article key={title}><div><Readable as="p" className="eyebrow">{stage}</Readable><Readable as="h3">{title}</Readable><Readable as="p">{body}</Readable><Readable as="p" className="deliverable">協助內容｜{output}</Readable></div></article>)}</div>;}
function Steps() {return <ol id="commission-steps" className="steps sx-process-steps">{steps.map(([title, body], i) => <li key={title}><details open={i === 0}><summary><span>{title}</span><span className="process-toggle" aria-hidden="true"></span></summary><Readable as="p">{body}</Readable></details></li>)}</ol>;}
function WorkSheet({ title, subtitle, children }) {return <div className="work-sheet"><header><Readable as="h3">{title}</Readable><Readable as="p">{subtitle}</Readable></header>{children}</div>;}
function SiteMap() {return <WorkSheet title="基地條件判讀" subtitle="核對基地範圍、既有建物與臨路條件。"><SiteContextDrawing /><Readable as="p" className="sheet-foot">判讀項目示例，非實際案件圖資；個案依地籍、都市計畫及現場資料核對。</Readable></WorkSheet>;}
function IssueBoard() {
  const labels = ['檢視項目', '顧問工作', '後續工作'];
  const records = ['以計畫書、會議紀錄及最近審查通知建立進度摘要，對照已完成程序、補件要求與待決議事項，標明資料版本及查核日期。', '分別整理地主意見、未議定合作條件、資金與搬遷安排，以及專業委託的責任交界；區分已確認事實與尚待查證事項。', '依影響程度與前後作業關係，列出處理順序、所需文件、負責窗口與回覆安排，供委託人確認後續工作及追加專業委託。'];
  const rows = [
  ['程序與送審進度', '查看送件資料與審查通知', '確認已完成的工作，以及還要補哪些資料'],
  ['整合與執行障礙', '了解地主疑問、合作條件與團隊分工', '釐清可能影響進度的問題，討論可行的處理方式'],
  ['待辦事項與責任分工', '對照契約及會議決議，查核承辦窗口與未完成原因', '議定處理順序、回覆期限及須由委託人決定的事項']];

  return <WorkSheet title="案件健檢的檢視項目" subtitle="依送審文件、會議紀錄及合作約定，檢視執行情形、待補資料與處理順序。"><div className="issue-board"><table className="issue-table"><caption className="sr-only">案件健檢的檢視項目與後續工作</caption><thead><tr>{labels.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((text, i) => <td key={text} data-label={labels[i + 1]}>{text}{i===1&&<details className="issue-record"><summary>查閱工作紀錄內容</summary><p>{records[rows.indexOf(row)]}</p></details>}</td>)}</tr>)}</tbody></table></div></WorkSheet>;
}
function CheckupVisual() {return <IssueBoard />;}
function Roadmap() {return <WorkSheet title="案件進度與工作銜接" subtitle="依案件採用的更新途徑、申請程序與既有委託，盤點各階段的工作、決策及文件。"><ol className="case-roadmap">{[['01', '基地與整合', '核對地籍、使用分區、建物及產權資料，整理所有權人意願、合作條件與尚待協調事項。'], ['02', '計畫準備', '確認實施方式及專業委託，協調規劃、估價與財務資料，追蹤計畫書、會議及同意文件的準備進度。'], ['03', '送件與審查', '建立送件版本與審查意見紀錄，列明補件項目、負責單位、回覆期限及待決議事項。'], ['04', '後續推動', '依核定計畫與契約追蹤搬遷、拆除、施工及交屋安排；各階段是否納入管理，於委託時列明。']].map(([n, t, b]) => <li key={n}><strong>{t}</strong><Readable as="p">{b}</Readable></li>)}</ol><Readable as="p" className="sheet-foot">階段概覽；實際程序依更新方式及案件情形確認。</Readable></WorkSheet>;}
function Comparison() {return <WorkSheet title="合作條件比較" subtitle="逐項對照工作範圍、估算條件與各方權責。"><div className="comparison-table"><table><caption className="sr-only">合作提案的比較項目</caption><thead><tr><th scope="col">比較項目</th><th scope="col">查看內容</th><th scope="col">待核對事項</th></tr></thead><tbody>{[['工作範圍', '提案與委託項目', '委託項目、交付成果與負責單位'], ['費用與估算', '費用明細與計算條件', '已含費用、另計項目與付款條件'], ['時程與配合', '預計進度與前提條件', '資料提供、決策節點與時程前提'], ['合作與分工', '各方權責與聯絡窗口', '聯絡窗口、處理權責與回報方式']].map((row) => <tr key={row[0]}><th scope="row">{row[0]}</th><Readable as="td" data-label="查看內容">{row[1]}</Readable><Readable as="td" data-label="待核對事項">{row[2]}</Readable></tr>)}</tbody></table></div></WorkSheet>;}
function CheckupServices() {return <div className="detail-grid checkup-services">{[['初步案件諮詢', '提供案件概況', '核對基地位置、案件階段、既有委託與主要爭議，確認需檢視的文件及專業分工。會談後依約整理待補資料與後續服務範圍。'], ['地主都市更新權益健檢', '適合單一地主', '依公開計畫與地主提供的提案、同意書及契約，檢視分配基準、費用負擔、搬遷與程序進度，整理影響個別權益的條件及需向提案方核對的事項。'], ['都市更新案件健檢', '適合核心地主共同委託', '依基地、整合、委託及送審資料檢視整體案件，對照已完成工作與既有約定，列出進度障礙、缺漏文件、負責窗口及處理順序。書面成果與會議參與範圍於委託時議定。']].map(([title, who, body]) => <article className="card" key={title}><figure><img loading="lazy" {...photoProps({ src: photoSource({ '初步案件諮詢': 'consultation', '地主都市更新權益健檢': 'contract-review', '都市更新案件健檢': 'older-apartment-stair' }[title]), alt: title + '工作' })} /></figure><Readable as="p" className="eyebrow">{who}</Readable><Readable as="h3">{title}</Readable><Readable as="p">{body.split(/(討論|文件|條件|安排)/).map((text, i) => <span key={i} className={/^(討論|文件|條件|安排)$/.test(text) ? 'keep-phrase' : undefined}>{text}</span>)}</Readable></article>)}</div>;}
function Checkup() {return <><Intro label="都市更新案件健檢" title="都市更新案件健檢：檢視進度、文件與推動困難">針對已開始整合、成立更新會、辦理相關程序，或推動遇到問題的社區，三策檢視現有資料與案件進度，協助整理待確認的問題，提出後續工作建議。</Intro><section id="checkup-scope" className="wrap section no-top"><div className="section-heading"><Readable as="h2">案件諮詢與健檢服務</Readable></div><CheckupServices /><div className="checkup-page-visual"><figure className="work-photo"><img loading="lazy" {...photoProps({ src: "/images/editorial/community-meeting.webp", alt: "住戶討論基地條件與工作安排" })} /></figure><SiteMap /></div><IssueBoard /></section><section className="tinted"><div className="wrap section split"><div><Readable as="p" className="eyebrow">會談準備資料</Readable><Readable as="h2">案件諮詢<br />文件與進度資料</Readable><Readable as="p">請準備基地概況、案件進度及現有團隊的分工資料，方便我們了解目前情況。尚未備齊的部分，可在諮詢時確認。</Readable></div><ul className="plain-list"><li>基地位置、土地與建物概況</li><li>目前階段、最近進度與送件情形</li><li>更新會或地主代表已完成的工作及決議</li><li>既有專業委託、契約範圍與負責窗口</li><li>主要待處理事項及顧問委託需求</li></ul></div></section><section className="wrap section"><Readable as="h2">健檢成果與後續委託</Readable><Readable as="p" className="reading">依委託範圍可整理案件進度摘要、文件檢視紀錄、主要爭議與待確認事項，以及後續工作建議。每項建議應列明依據資料、尚缺條件與負責窗口；書面報告、說明會議及持續追蹤的項目、更新頻率與費用，於委託前議定。</Readable><div className="faq"><details><Readable as="summary">既有專業團隊的協作分工</Readable><Readable as="p">依現有團隊的委託契約與工作進度，確認三策承接的文件檢視、工作協調與追蹤事項，並議定資料交換及回報窗口。</Readable></details><details><summary>送件前的諮詢與評估</summary><Readable as="p">尚未送件的案件，可依基地資料與地主整合進度安排諮詢，檢視適用程序、合作條件、應備文件及專業委託需求。</Readable></details></div></section><CTA /></>;}
function Consulting() {return <ConsultingOverview />;}
function Process() {return <><Intro label="服務流程" title="顧問諮詢與委任流程">三策依基地條件、案件進度及現有合作關係評估委託需求，議定服務項目、交付成果、執行期間與費用。受託後依約記錄工作、回報進度並辦理階段交接。</Intro><section className="wrap section no-top"><Roadmap /><Readable as="h2" className="workflow-heading">諮詢與委任程序</Readable><Steps /><div className="note"><Readable as="h2">委託內容與費用</Readable><Readable as="p">委任內容應列明服務範圍、資料來源、交付項目與更新頻率，並確認會議參與、聯絡窗口、付款、變更及終止交接安排。建築、估價、法律與施工等專業工作，依各自資格及契約辦理；相關委託對象與費用另行確認。</Readable></div></section><CTA /></>;}
function KnowledgeLinks({ kind }) {return <div className="knowledge-links">{knowledgePages.filter((p) => p.kind === kind).map((p) => <article key={p.path}><Readable as="p" className="eyebrow">{p.label}</Readable><Readable as="h2"><a href={p.path}>{p.title}</a></Readable><Readable as="p">{p.description}</Readable><a className="text-link" href={p.path}>閱讀{kind === 'article' ? '全文' : '服務內容'} </a></article>)}</div>;}
function Insights() {return <><InsightsLibrary /><CTA /></>;}
function KnowledgePage({ page: original }) {const page = original.kind === 'article' ? editorialPage(original) : original;return <><div className="wrap knowledge-breadcrumb"><a href="/">首頁</a><span>／</span><a href={page.kind === 'article' ? '/insights' : '/consulting'}>{page.kind === 'article' ? '三策觀點' : '都市更新顧問'}</a><span>／</span><span>{page.label}</span></div>{page.kind === 'article' ? page.visual ? <InsightHero page={page} /> : <InsightArticleIntro page={page} /> : <Intro label={page.label} title={page.title}>{page.lead}</Intro>}{page.kind==='article'&&<ArticleReadingIndex page={page}/>}<div className={'wrap knowledge-layout' + (page.kind === 'article' ? ' insight-reading-layout' + (page.visual ? ' insight-magazine-layout' : '') : ' service-reading-layout service-'+page.path.split('/').pop())}><article className="knowledge-body">{page.kind!=='article' ? <ServicePageBody page={page}/> : page.visual ? <InsightBody page={page} /> : page.sections.map(([title, body], i) => <section id={'section-' + (i + 1)} key={title}><Readable as="h2">{title}</Readable>{body.split("\n\n").map((paragraph, j) => page.kind === 'article' ? <p key={j}>{paragraph}</p> : <Readable as="p" key={j}>{paragraph}</Readable>)}{page.kind !== 'article' && i === 0 && <ServiceWorkFocus page={page}/>} {page.kind !== 'article' && i === 1 && <figure className="service-inline-photo"><img loading="lazy" {...photoProps({ src: photoSource(page.path.includes('project-management') ? 'project-management' : page.path.includes('joint-construction') ? 'document-review' : page.path.includes('dangerous') ? 'urban-blocks' : 'community-meeting'), alt: page.path.includes('project-management') ? '工地人員核對圖面與施工進度' : page.path.includes('joint-construction') ? '整理圖面與合作資料' : page.path.includes('dangerous') ? '新舊住宅與街廓環境' : '住戶共同討論基地與重建計畫' })} /></figure>}</section>)}{page.sources && <section className="knowledge-sources"><Readable as="h2">參考資料</Readable>{page.sources.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{label} </a>)}</section>}{page.kind === 'article' && <InsightCopyright />}{page.resources && <section className="knowledge-related"><Readable as="h2">方案查詢、分配試算與委任程序</Readable>{page.resources.map(([label, path]) => <a key={path} href={path}><Readable as="span">{label}</Readable></a>)}</section>}<section className="knowledge-related"><Readable as="h2">延伸閱讀與顧問服務</Readable>{[...new Set([...page.related, ...(page.kind === 'article' ? ['/services/urban-renewal'] : [])])].map((path) => <a key={path} href={path}><Readable as="span">{knowledgeByPath[path].title}</Readable> </a>)}</section><a className="text-link" href="/contact">預約案件諮詢</a></article>{page.kind !== 'article' && <ServicePageNavigation page={page}/>}</div>{page.kind !== 'article' && <CTA />}</>;}
function About() {return <><AboutSanze /><CTA /></>;}
const fields = [['name', '聯絡人姓名', 'text', true], ['phone', '聯絡電話', 'tel', true], ['email', '電子郵件', 'email', false], ['district', '行政區', 'text', true], ['location', '基地地址', 'text', true]];
function Contact() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState('');
  const challenge = useRef(null);
  const widget = useRef(null);
  const token = useRef('');
  const [verificationError, setVerificationError] = useState('');
  const [verified, setVerified] = useState(false);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  useEffect(() => {
    let disposed = false, activeSize = null, watchdog, generation = 0;
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const errorMessage = '驗證暫時無法完成，請重試，或來電與我們聯絡。';
    const clearWatchdog = () => clearTimeout(watchdog);
    function failed() {
      clearWatchdog();
      if (!disposed) {token.current = '';setVerified(false);setVerificationError(errorMessage);}
      return true;
    }
    function render() {
      if (disposed || !challenge.current || !window.turnstile) return;
      // Flexible Turnstile has a 300px minimum. Use the provider's compact
      // variant when the actual form column is narrower; never crop a challenge.
      const size = challenge.current.getBoundingClientRect().width < 300 ? 'compact' : 'flexible';
      if (widget.current !== null && activeSize === size) return;
      if (!sitekey) {failed();return;}
      try {
        const current = ++generation;
        const isCurrent = () => !disposed && current === generation;
        if (widget.current !== null) {window.turnstile.remove(widget.current);widget.current = null;}
        token.current = '';setVerified(false);setVerificationError('');activeSize = size;
        clearWatchdog();watchdog = setTimeout(failed, 120000);
        widget.current = window.turnstile.render(challenge.current, { sitekey, action: 'contact', theme: 'light', size, appearance: 'interaction-only',
          callback: (value) => {if (isCurrent()) {clearWatchdog();token.current = value;setVerified(true);setVerificationError('');}},
          'expired-callback': () => {if (isCurrent()) {token.current = '';setVerified(false);clearWatchdog();watchdog = setTimeout(failed, 120000);}},
          'error-callback': () => isCurrent() ? failed() : true,
          'timeout-callback': () => isCurrent() ? failed() : true });
      } catch {failed();}
    }
    let script = document.querySelector('script[data-contact-verification]');
    if (window.turnstile) render();else {
      if (!script) {script = document.createElement('script');script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async = true;script.defer = true;script.dataset.contactVerification = 'true';document.head.appendChild(script);}
      script.addEventListener('load', render);script.addEventListener('error', failed);
      watchdog = setTimeout(failed, 20000);
    }
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(render) : null;
    if (challenge.current) observer?.observe(challenge.current);
    return () => {disposed = true;clearWatchdog();observer?.disconnect();script?.removeEventListener('load', render);script?.removeEventListener('error', failed);if (widget.current !== null && window.turnstile) {try {window.turnstile.remove(widget.current);} catch {} finally {widget.current = null;}}};
  }, [verificationAttempt]);
  function retryVerification() {
    token.current = '';setVerified(false);setVerificationError('');setStatus('');
    // Recreate through the same lifecycle, including the timeout and current size.
    if (!window.turnstile) document.querySelector('script[data-contact-verification]')?.remove();
    setVerificationAttempt((n) => n + 1);
  }
  const requestId = useRef('');
  const inFlight = useRef(false);
  const initial = new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('stage');
  async function submit(e) {
    e.preventDefault();
    if (inFlight.current || sent) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (!String(data.problem || '').trim()) {setStatus('請填寫目前遇到的問題。');form.elements.problem.focus();return;}
    if (!token.current) {setStatus('正在完成表單驗證，請稍候，驗證完成後即可送出。');if (widget.current !== null && window.turnstile) window.turnstile.reset(widget.current);return;}
    if (!requestId.current) requestId.current = crypto.randomUUID();
    inFlight.current = true;setSending(true);setStatus('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, consent: data.consent === 'on', requestId: requestId.current, turnstileToken: token.current, tracking: contactTrackingContext() }), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true || !result.reference) throw new Error(result.message || '目前無法送出，請稍後重試，或來電 0916-711-323 與我們聯絡。');
      setReference(result.reference);setSent(true);setStatus('諮詢已送出，我們將依您留下的聯絡方式與您聯繫。');
    } catch (error) {setStatus(error.name === 'TimeoutError' || error.name === 'AbortError' ? '連線逾時，尚未確認送出結果。請稍後重試，或來電與我們確認。' : error instanceof SyntaxError || error instanceof TypeError ? '目前無法連線，請稍後重試。您填寫的內容仍保留在表單中。' : error.message);} finally
    {token.current = '';setVerified(false);if (widget.current !== null && window.turnstile) window.turnstile.reset(widget.current);inFlight.current = false;setSending(false);}
  }
  return <><Intro label="聯絡我們" title="聯絡三策，洽詢都市更新顧問服務。">歡迎填寫案件概況，或來電、來信與我們聯絡，確認諮詢內容與時間。</Intro>
 <section className="wrap section no-top contact-layout"><aside className="contact-panel"><Readable as="h2">三策專案管理顧問</Readable><a href="tel:0222508202">聯絡電話：<span className="contact-phone-number">0222508202</span></a><a href="tel:0916711323">行動電話：<span className="contact-phone-number">0916711323</span></a><a href="mailto:sanze.consulting@gmail.com">電子郵件：sanze.consulting@gmail.com</a><Readable as="p" className="contact-address">通訊地址：新北市中和區中山路二段 332 巷 13 號 12 樓</Readable><hr /><LineContact /><hr /><Readable as="h3">諮詢資料使用說明</Readable><Readable as="p">送出前請閱讀表單下方的資料使用說明。若需查詢、更正或刪除資料，請來電或來信與我們聯絡。</Readable></aside>
 <form className="intake" onSubmit={submit} aria-busy={sending}>
 <div className="intake-heading"><span>案件諮詢</span><Readable as="h2">案件概況與委託需求</Readable><Readable as="p" className="form-note">＊為必填，電子郵件與地主意願概況可選填。</Readable></div>
 <fieldset disabled={sending || sent} className="intake-fields"><legend className="sr-only">案件諮詢資料</legend>
 <div className="form-grid">{fields.map(([name, label, type, required]) => <label key={name} className={name === 'location' ? 'full' : ''}>{label}{required ? '＊' : '（選填）'}<input name={name} type={type} required={required} maxLength={name === 'location' ? 150 : name === 'phone' ? 30 : 100} autoComplete={{ name: 'name', phone: 'tel', email: 'email' }[name]} pattern={type === 'tel' ? '[+0-9\\(\\)\\s\\-]{6,30}' : required ? '.*\\S.*' : undefined} /></label>)}
 <label>案件階段＊<select name="stage" required defaultValue={stages.includes(initial) ? initial : ''}><option value="" disabled>請選擇目前階段</option>{stages.map((t) => <option key={t}>{t}</option>)}</select></label>
 <label>案件推動單位＊<select name="association" required defaultValue=""><option value="" disabled>請選擇</option>{promoters.map((t) => <option key={t}>{t}</option>)}</select></label>
 <label className="full">地主意願概況（選填）<textarea name="willingness" maxLength={500} rows={3} placeholder="例如：已有部分地主支持，仍有住戶對合作條件有疑問。" /></label>
 <label className="full">目前遇到的問題＊<textarea name="problem" required maxLength={1500} rows={5} placeholder="請說明目前遇到的問題，或希望三策協助的事項。" /></label></div>
 <div className="contact-trap" aria-hidden="true" inert=""><label>Website<input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" /></label></div>
 <details className="privacy-notice" id="privacy-notice"><summary>諮詢資料使用說明</summary><div><p><a href="/privacy">閱讀隱私權與資料使用</a></p>
 <Readable as="p">蒐集單位：三策專案管理顧問有限公司。資料用於案件諮詢、聯絡、評估委託需求及防止表單濫用。</Readable>
 <Readable as="p">資料包括姓名、電話、電子郵件、基地地址、案件概況及您主動提供的內容；表單驗證服務也可能處理 IP 位址等技術資料。請勿在自由填寫欄位提供身分證字號、病歷，或與諮詢無關的他人個資。</Readable>
 <Readable as="p">資料以電子方式處理，並透過電話或電子郵件聯絡；使用對象為三策及提供網站、寄信與驗證服務的受託業者（Vercel、Resend、Cloudflare）。處理地區包括臺灣及上述業者提供服務的地區，可能涉及境外處理。保存至諮詢與聯絡目的所需期間；目的消失或期限屆滿後，依法律要求刪除或停止使用，依法須保存者依規定辦理。</Readable>
 <Readable as="p">您可來電 02-2250-8202 或來信 sanze.consulting@gmail.com，申請查詢、查看或索取您的資料副本，補充、更正資料，或要求停止蒐集、處理、使用及刪除個資。三策依個人資料保護法辦理；這些權利不因勾選同意而受限制。</Readable>
 <Readable as="p">必填資料未提供時，無法送出此表單，仍可來電洽詢。選填欄位可以留白，仍可送出諮詢。</Readable>
 </div></details>
 <label className="consent"><input name="consent" type="checkbox" required aria-describedby="privacy-notice" />我已閱讀諮詢資料使用說明，同意三策使用以上資料進行案件諮詢與聯絡。</label>
 {!sent && !verificationError && <p className="contact-verification-status" role="status" aria-live="polite">{verified ? '安全驗證已完成，可以送出諮詢。' : '正在進行安全驗證，完成後即可送出。'}</p>}
 <div ref={challenge} className="contact-verification" />
 {verificationError && <Readable as="p" className="status">{verificationError} <button type="button" className="verification-retry" onClick={retryVerification}>重新驗證</button></Readable>}
 <button className="cta" type="submit">{sending ? '正在送出…' : sent ? '已送出諮詢' : '送出諮詢'}</button>
 </fieldset>
 <div role="status" aria-live="polite" className={sent ? 'submission-success' : 'status'}>{status}{sent && <Readable as="p">諮詢編號：{reference}</Readable>}</div>
 </form></section></>;
}
export default function ConsultingSite({ pathname } = {}) {const [open, setOpen] = useState(false);const path = (pathname ?? (typeof location === 'undefined' ? '/' : location.pathname)).replace(/\/$/, '') || '/';setPhotoPage(path); const views = { '/privacy': () => <SitePolicies type="privacy"/>, '/website-use': () => <SitePolicies type="website-use"/>, '/land-evaluation': LandEvaluation, '/reports': Reports, '/landowner-comparison': LandownerComparison, '/': DesignHome, '/checkup': Checkup, '/consulting': Consulting, '/process': Process, '/insights': Insights, '/about': About, '/contact': Contact, '/programs': RenewalPrograms };if (import.meta.env.DEV) {views['/preview'] = PreviewIndex;views['/preview/report'] = ReportDesignPreview;}const View = views[path];const knowledgePage = knowledgeByPath[path];return <><a className="skip" href="#main">跳至主要內容</a><DesignHeader path={path} /><DesignMotion /><main id="main" className={path === '/' ? 'home-page' : 'interior-page'}>{knowledgePage ? <KnowledgePage page={knowledgePage} /> : View ? <View /> : <Intro label="404" title="找不到這個頁面">請從上方選單前往需要的頁面，或<a href="/">回到首頁</a>。</Intro>}</main>{path !== '/reports' && <CompanyFooter/>}{path !== '/reports' && <WebsiteAssistant />}</>;}
