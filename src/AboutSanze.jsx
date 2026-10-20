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
 <section className="as-hero wrap"><div className="as-hero-copy"><p className="as-kicker">關於三策</p><h1>以信實立本，<br /><span>以專業成事。</span></h1><p>三策為地主與更新會提供都市更新顧問服務，辦理基地評估、地主整合、更新會輔導與案件管理。受託工作依約執行，案件條件與尚未確認的事項據實說明。</p><a className="as-link" href="/consulting">了解三策的協助</a></div><figure><img fetchPriority="high" {...photoProps({ src: "/images/editorial/community-meeting.webp", alt: "住戶共同討論基地資料與工作安排" })} /><figcaption>住戶意見、會議決定與待辦工作，均須留下紀錄。</figcaption></figure></section>
 <section className="as-intro wrap" data-reveal><p className="as-kicker">三策專案管理顧問有限公司</p><div><h2>地主與更新會的<br />顧問委託與工作責任</h2><p>推動都更，需要了解基地條件、聽取住戶意見、談妥合作條件，也需要不同專業人員互相配合。三策依您提供的資料比較合作提案，記錄待補文件、各方責任與需要決定的事項。</p></div></section>
 <section id="working-principles" className="as-practice" aria-labelledby="as-practice-title">
   <div className="wrap as-practice-layout">
     <div className="as-practice-intro">
       <p className="as-kicker">受託工作原則</p>
       <h2 id="as-practice-title">案件評估與<br />受託工作紀錄</h2>
       <p>從基地資料、委託約定到執行進度，工作依據與處理情形均須留下紀錄。</p>
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
