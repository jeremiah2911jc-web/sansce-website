import ServiceWorkStories from './ServiceWorkStories.jsx';
import {ownerService,developerService} from '../shared/service-audiences.js';
import Readable from './Readable.jsx';
import {photoProps,photoSourceProps} from './photo-refresh.js';
import { trackInteraction } from './interaction-tracking.js';
import { photoSource } from './editorial-content.js';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SiteSymbol as MapPinned, CommunitySymbol as Users, CoordinationSymbol as ClipboardCheck, DocumentSymbol as Files, HomeSymbol as Layers } from './SanzeSymbols.jsx';
import './consulting-overview.css';

const stages = [
{ label: '基地可行性評估', note: '基地條件與更新途徑初步評估', title: '基地資料與重建途徑初步評估', text: '核對地籍範圍、土地使用分區、合法建物與臨路資料，辨識產權及基地限制，整理都市更新或危老重建需進一步確認的條件。涉及建築配置、結構評估與估價時，確認相應專業人員及資料需求。', items: [['基地評估', '整理地籍、建物、使用分區及臨路資料，提出適用途徑與待查證條件；建築規劃及鑑定另由相應專業人員辦理。']], links: [['了解都更條件', '/services/urban-renewal'], ['了解危老重建', '/services/dangerous-old-rebuilding']], icon: MapPinned },
{ label: '整合與合作', note: '地主有重建意願，尚待整合共識', title: '地主意見整合與更新會運作', text: '按所有權人與討論議題整理重建意願、分配期待及合作爭議，協助安排會議並記錄決議。更新會成立後，協助理監事準備議程、追蹤決議執行，確認專業委託與資料交換窗口。', items: [['地主整合', '整理所有權人意願、需求與爭議，協助安排會議，記錄討論結論、保留意見及後續協調事項。'], ['更新會輔導', '協助理監事準備議程及會議資料，整理決議與待辦事項，確認專業委託範圍、資料提供及執行窗口。']], links: [['比較合建條件', '/services/joint-construction'], ['查看合作流程', '/process']], icon: Users },
{ label: '進度與分工管理', note: '案件已推動，需要追蹤進度與分工', title: '案件健檢與跨專業工作協調', text: '依契約、計畫書、會議紀錄與審查通知檢視案件進度，列明已完成工作、待補資料及爭議。持續管理時，依約追蹤負責單位、回覆期限、文件版本與待決議事項，協調規劃、建築、估價、財務及法律工作的銜接。', items: [['案件健檢與顧問服務', '檢視計畫、提案與會議資料，整理程序進度、合作風險及待確認事項，提出處理順序與後續委託建議。'], ['全案管理與團隊整合', '依約建立分工、文件版本與進度紀錄，追蹤審查補件、決議執行及跨專業協調事項。']], links: [['了解案件健檢', '/checkup'], ['了解全案管理', '/services/project-management']], icon: ClipboardCheck }];

const services = [
{ icon: MapPinned, label: '都更顧問', title: '基地條件與更新程序評估', text: '適用於重建意願整合、更新會運作及計畫準備階段。核對基地與產權資料、整理地主意見，協助確認實施方式、專業委託及送審準備。', output: '基地條件與待查事項、地主意見與會議紀錄、專業分工及計畫準備清單。', href: '/services/urban-renewal', image: 'site-inspection', alt: '查看基地與周邊住宅環境' },
{ icon: Layers, label: '危老重建評估', title: '危老重建資格與合作條件', text: '適用於擬採危老途徑的基地。整理合法建物、結構評估及產權資料，核對所有權人同意進度，配合建築與財務評估比較出資、分配及搬遷安排。', output: '資格與文件檢核、產權及同意進度、重建條件比較與專業評估需求。', href: '/services/dangerous-old-rebuilding', image: 'older-apartment-stair', alt: '老公寓的樓梯與日常通行環境', points: ['建物資格', '產權狀況', '所有權人意願'] },
{ icon: Files, label: '合建條件比較', title: '分配基準與契約條件比較', text: '適用於收到建商提案、協議書或契約草案的地主。依相同的面積計算基準與費用項目，對照分配、選屋、車位、補款、搬遷及履約條件，記錄各版本差異與未列明事項。', output: '提案條件對照、費用與時程差異、待補約定及需由律師審閱的文件項目。', href: '/services/joint-construction', image: 'contract-review', alt: '逐項檢閱合作契約內容', points: ['面積與車位', '搬遷與時程', '費用與契約'] },
{ icon: ClipboardCheck, label: '全案管理', title: '專業分工、文件與進度管理', text: '適用於需要持續協調地主、更新會與專業團隊的案件。依約建立工作分工與進度紀錄，追蹤會議決議、送審補件、文件版本及跨單位待辦事項。', output: '工作分工表、進度與待辦清單、會議紀錄、文件版本及補件追蹤資料。', href: '/services/project-management', image: 'construction-inspection', alt: '專業人員在工地檢查建築現況' }];

const comparisons = [
['工作範圍', '委託項目與交付成果', '核對提案與委託項目，確認交付資料、負責人及未包含的工作。'],
['費用與估算', '費用明細與追加約定', '查看費用明細與計算條件，確認估算前提、付款安排，以及追加工作的處理方式。'],
['時程與配合', '資料、決策與時程前提', '比較預計進度與前提條件，列出各方需提供的資料，以及等待決定的事項。'],
['合作與分工', '責任分工與回報窗口', '確認各方權責、聯絡與決策窗口，並記錄問題的回覆與處理情形。']];

export default function ConsultingOverview() {
  const [selected, setSelected] = useState(0);
  return <div className="co-page">
  <section className="co-hero wrap">
   <div className="co-hero-copy"><p className="co-kicker">地主與社區服務</p><h1>比較重建條件，<br /><span className="audience-title-phrase">協調社區</span><span className="audience-title-phrase">與案件工作。</span></h1><p>三策為臺北、新北地主與更新會辦理基地評估、地主整合與更新會輔導，依委託內容協調都更規劃、建築、估價、財務及法律等專業工作，追蹤案件進度與執行情形。</p><div className="co-actions"><a className="design-button" href="#consulting-needs">查閱服務範圍</a><a className="co-text-link" href={ownerService.contact}>預約案件諮詢</a></div></div>
   <figure className="co-hero-image"><img fetchPriority="high" {...photoProps({ src: "/images/redesign/consultation.jpg", alt: "顧問與地主討論案件資料的情境" })} /><figcaption><span className="co-pulse" aria-hidden="true" />會議、文件、責任分工與進度，依委託持續追蹤。</figcaption></figure>
  </section>
  <section id="consulting-needs" className="co-section wrap" aria-labelledby="co-needs-title" data-reveal>
   <div className="co-section-heading"><div><p className="co-kicker">服務範圍與適用階段</p><h2 id="co-needs-title">依案件階段配置顧問工作</h2></div><p>依基地評估、整合與執行階段，<br />查閱工作範圍與交付項目。</p></div>
   <div className="co-stage-choices" aria-label="選擇案件情況">{stages.map((stage, i) => <button key={stage.label} type="button" aria-pressed={selected === i} aria-controls={'co-stage-' + i} onClick={() => {if (i !== selected) trackInteraction('stage_select', ['feasibility', 'cooperation', 'progress'][i]);setSelected(i);}}><stage.icon size={34} aria-hidden="true" /><span><strong>{stage.label}</strong><small>{stage.note}</small></span><i aria-hidden="true" /></button>)}</div>
   <div className="co-stage-content" aria-live="polite">{stages.map((stage, i) => <div key={stage.label} id={'co-stage-' + i} hidden={selected !== i} className="co-stage-panel"><div><p className="co-kicker">{stage.label}</p><h3>{stage.title}</h3><p>{stage.text}</p><div className="co-actions">{stage.links.map(([label, href]) => <a className="co-text-link" key={href} href={href}>{label}</a>)}</div></div><ul>{stage.items.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ul></div>)}</div>
  </section>
  <section id="consulting-services" className="co-services-band"><div className="co-section wrap" data-reveal><div className="co-section-heading"><div><p className="co-kicker">深入了解服務</p><h2>三策承接的顧問工作</h2></div><p>從初步評估到案件推動，<br />工作範圍與分工在委託前確認。</p></div><ServiceWorkStories services={services}/></div></section>

  <section className="co-section co-comparison wrap" aria-labelledby="co-compare-title" data-reveal><div><p className="co-kicker">合作條件比較</p><Readable as="h2" id="co-compare-title">提案比較：<br />工作、費用、時程與權責。</Readable><p>比較合建或專業團隊提案時，逐項記錄工作範圍、費用明細、預計時程及各方權責，未列明的內容請提案方補充。</p><a className="co-text-link" href="/services/joint-construction">了解合建條件比較</a></div><div className="co-comparison-items">{comparisons.map(([title, question, text]) => <details key={title}><summary><span><small>{title}</small><strong>{question}</strong></span><Plus size={20} aria-hidden="true" /></summary><p>{text}</p></details>)}</div></section>
  <section className="co-meeting wrap" data-reveal><div className="co-meeting-intro"><p className="co-kicker">案件諮詢與委託</p><h2>案件資料檢視<br />與顧問委託</h2><p>服務對象包括個別地主、更新會及已成立合作團隊的社區。依現有文件與案件階段確認諮詢、健檢或持續管理的委託範圍。</p><a className="design-button" href={ownerService.contact}>預約案件諮詢</a></div><ol>{[['說明現況', '提供基地地址、案件階段與目前問題。'], ['查看資料', '整理提案、契約、會議紀錄或審查通知。'], ['確認安排', '討論工作範圍、參與人員、時間與費用。']].map(([title, text], i) => <li key={title}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
  <section id="development-evaluation-service" className="wrap owner-development-signpost" aria-labelledby="owner-development-title"><div><h2 id="owner-development-title">自行出資開發與投資評估</h2><p>自行出資興建，或需比較土地取得、開發收益與資金需求，可查閱開發評估服務。</p></div><a href={developerService.path}>開發評估服務</a></section>
  <div className="co-scope wrap"><p>三策依委託範圍提供顧問與工作協調；建築設計、估價、法律及施工等專業工作，分別由具相應資格的單位與人員辦理。</p></div>
 </div>;
}
