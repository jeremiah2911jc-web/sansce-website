import {photoProps,photoSourceProps} from './photo-refresh.js';
import './about-sanze.css';
const principles = [
['據實說明案件條件', '依基地資料與合作文件評估。', '檢視土地、建物與案件資料，整理已知條件及待確認事項。收到不同合作提案時，先核對比較基準，再討論差異。'],
['議定委託範圍與費用', '工作項目、責任與交付資料均列入約定。', '委託前以書面確認服務項目、責任分工、交付資料、執行期間與費用，並列明資料提供、變更與交接安排。'],
['持續追蹤受託工作', '記錄處理情形，追蹤尚未完成的事項。', '記錄會議決定、待辦工作與負責人，協調專業團隊的資料交換，持續追蹤需要處理與決定的事情。']];

export default function AboutSanze() {return <div className="as-page">
 <section className="as-hero wrap"><div className="as-hero-copy"><p className="as-kicker">關於三策</p><h1>以信實立本，<br /><span>以專業成事。</span></h1><p>三策為地主與更新會提供都市更新顧問服務，辦理基地評估、地主整合、更新會輔導與案件管理。受託工作依約執行，案件條件與尚未確認的事項據實說明。</p><a className="as-link" href="/consulting">了解三策的協助</a></div><figure><img fetchPriority="high" {...photoProps({ src: "/images/editorial/community-meeting.webp", alt: "住戶共同討論基地資料與工作安排" })} /><figcaption>住戶意見、會議決定與待辦工作，均須留下紀錄。</figcaption></figure></section>
 <section className="as-intro wrap" data-reveal><p className="as-kicker">三策專案管理顧問有限公司</p><div><h2>地主與更新會的<br />顧問委託與工作責任</h2><p>推動都更，需要了解基地條件、聽取住戶意見、談妥合作條件，也需要不同專業人員互相配合。三策依您提供的資料比較合作提案，記錄待補文件、各方責任與需要決定的事項。</p></div></section>
 <section id="working-principles" className="as-principles-band"><div className="wrap as-section" data-reveal><div className="as-section-heading"><div><p className="as-kicker">受託工作原則</p><h2>信實與專業，落實在受託工作裡。</h2></div><p>依案件條件、委託約定與工作紀錄執行。</p></div><div className="as-principles">{principles.map(([title, note, text], i) => <details key={title} className="as-principle"><summary><span className="as-principle-subject">{["條件", "分工", "追蹤"][i]}</span><div className="as-principle-copy"><h3>{title}</h3><p>{note}</p></div><span className="as-expand"><span className="as-expand-closed">了解工作方式</span><span className="as-expand-open">收合說明</span><i aria-hidden="true" /></span></summary><p className="as-principle-detail">{text}</p></details>)}</div></div></section>
 <section className="wrap as-section as-working" data-reveal><figure><img loading="lazy" {...photoProps({ src: "/images/redesign/project-management.jpg", alt: "專業人員在工地核對圖面與施工進度" })} /><figcaption>核對圖面、施工現況與工作進度。</figcaption></figure><div><p className="as-kicker">顧問工作與執行紀錄</p><h2>案件進度、文件與分工，<br />都有追蹤紀錄。</h2><p>我們與您檢視案件進度、找出困難，討論可行的處理方式。個別地主、更新會理監事，或已經開始推動的社區，可依現有資料與具體需求安排諮詢。</p><ol>{[['了解目前情況', '先說明基地位置、案件階段與需要處理的問題。'], ['確認合作內容', '討論工作範圍、預計交付資料、時間與費用。'], ['依約追蹤工作', '協調分工，記錄處理情形與後續安排。']].map(([title, text]) => <li key={title}><span aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><a className="as-link" href="/process">查看完整服務流程</a></div></section>

</div>;}
