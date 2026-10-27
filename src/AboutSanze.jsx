import Readable from './Readable.jsx';
import {photoProps} from './photo-refresh.js';
import './about-sanze.css';
const principles = [
  {
    title: '案件評估以資料為依據',
    text: '核對土地、建物與案件進度，區分已確認條件、估算前提及待補資料。比較合作提案時，先確認面積、分配與費用的採計基準，再說明各案差異。',
    label: '核對資料',
    record: '基地資料、合作提案、已簽文件與待確認事項。'
  },
  {
    title: '委託內容與費用書面議定',
    text: '委託前確認工作項目、交付資料、辦理期間與費用，列明資料提供、變更及交接安排。涉及建築、估價或法律工作時，另確認專業人員與責任分工。',
    label: '委託約定',
    record: '服務範圍、交付項目、專業分工與付款安排。'
  },
  {
    title: '工作進度與決議持續記錄',
    text: '依約記錄會議決定、待辦工作與負責窗口，協調專業團隊交換資料。尚待補件或決策的事項，列明處理情形與預定時程，供地主、更新會及合作團隊追蹤。',
    label: '執行紀錄',
    record: '會議決議、文件版本、待辦清單與處理進度。'
  }
];

export default function AboutSanze() {return <div className="as-page">
 <section className="as-hero wrap"><div className="as-hero-copy"><p className="as-kicker">關於三策</p><h1>以信實立本，<br /><span>以專業成事。</span></h1><p>三策專案管理顧問有限公司提供地主與社區服務、開發評估服務。前者比較重建提案、分回房地與契約，協調社區及案件工作；後者分析土地取得、開發規模、成本收益與資金需求。委託目的與工作範圍分別議定。</p><div className="co-actions"><a className="as-link" href="/consulting">地主與社區服務</a><a className="as-link" href="/services/development-evaluation">開發評估服務</a></div></div><figure><img fetchPriority="high" {...photoProps({ src: "/images/editorial/community-meeting.webp", alt: "住戶共同討論基地資料與工作安排" })} /><figcaption>住戶意見、會議決定與待辦工作，均須留下紀錄。</figcaption></figure></section>
 <section className="as-intro wrap" data-reveal><p className="as-kicker">三策專案管理顧問有限公司</p><div><Readable as="h2">依重建與開發目的，<br />議定受託工作</Readable><p>地主與社區重建，須比較分回房地、費用與履約條件；開發投資，須試算產品配置、成本收益及各期資金需求。三策依各次委託的資料與目標提出分析，列明採用條件、待查事項與專業分工。</p></div></section>
 <section id="working-principles" className="as-practice" aria-labelledby="as-practice-title">
   <div className="wrap as-practice-layout">
     <div className="as-practice-intro">
       <p className="as-kicker">受託工作原則</p>
       <h2 id="as-practice-title">三策如何辦理受託工作</h2>
       <p>評估須交代資料來源，委託須列明工作與費用；會議決議、文件及處理進度，留存紀錄供委託人查閱。</p>
     </div>
     <figure className="as-practice-photo">
       <img loading="lazy" {...photoProps({src: '/images/redesign/project-management.jpg', alt: '專業人員在工地核對圖面與施工進度', sizes: '(max-width: 760px) 100vw, 45vw'})} />
       <figcaption>圖面、現場與文件，依案件進度相互核對。</figcaption>
     </figure>
     <div className="as-practice-content">
       {principles.map(({title, text, label, record}) => <article className="as-practice-item" key={title}>
         <h3>{title}</h3>
         <p>{text}</p>
         <dl><div><dt>{label}</dt><dd>{record}</dd></div></dl>
       </article>)}
       <a className="as-link" href="/process">查閱服務流程與委託安排</a>
     </div>
   </div>
 </section>
</div>;}
