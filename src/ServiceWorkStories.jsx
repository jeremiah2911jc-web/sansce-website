import Readable from './Readable.jsx';
import {photoProps} from './photo-refresh.js';
import {photoSource} from './editorial-content.js';

// Four work products, each with its own reading order. No invented case results.
export default function ServiceWorkStories({services}) {
 const [urban,old,joint,management]=services;
 return <div className="service-work-stories">
  <article className="service-site-brief">
   <figure><img loading="lazy" {...photoProps({src:photoSource(urban.image),alt:urban.alt})}/><figcaption>基地範圍、臨路與既有建物，一併核對。</figcaption></figure>
   <div className="service-site-copy"><p className="co-kicker">{urban.label}</p><Readable as="h3"><a href={urban.href}>{urban.title}</a></Readable><p>{urban.text}</p><dl className="service-evidence"><div><dt>基地資料</dt><dd>地籍、產權、使用分區與臨路</dd></div><div><dt>整合工作</dt><dd>地主意見、會議決議與專業委託</dd></div><div><dt>計畫準備</dt><dd>適用途徑、所需文件及待查事項</dd></div></dl><a className="co-text-link" href={urban.href}>查閱都更顧問服務</a></div>
  </article>
  <article className="service-eligibility">
   <header><p className="co-kicker">{old.label}</p><Readable as="h3"><a href={old.href}>{old.title}</a></Readable><p>{old.text}</p></header>
   <figure><img loading="lazy" {...photoProps({src:photoSource(old.image),alt:old.alt})}/></figure>
   <div className="service-check-document"><h4>初評需核對的資料</h4><ul><li><strong>建物資格</strong><span>使用執照、危險認定或耐震評估</span></li><li><strong>產權與同意</strong><span>所有權人、持分及同意進度</span></li><li><strong>合作安排</strong><span>出資、分配及搬遷條件</span></li></ul><p className="service-output">{old.output}</p><a className="co-text-link" href={old.href}>查閱危老評估服務</a></div>
  </article>
  <article className="service-proposal">
   <div className="service-proposal-opening"><div><p className="co-kicker">{joint.label}</p><Readable as="h3"><a href={joint.href}>{joint.title}</a></Readable><p>{joint.text}</p></div><figure><img loading="lazy" {...photoProps({src:photoSource(joint.image),alt:joint.alt})}/></figure></div>
   <table><caption>各份提案採用相同項目比對</caption><thead><tr><th scope="col">比較項目</th><th scope="col">須由提案列明的條件</th></tr></thead><tbody><tr><th scope="row">分回內容</th><td>面積計算範圍、樓層、戶別與車位</td></tr><tr><th scope="row">費用負擔</th><td>補款、稅費、搬遷及租金安排</td></tr><tr><th scope="row">履約約定</th><td>負責對象、履約保障與交屋期限</td></tr></tbody></table>
   <footer><p>{joint.output}</p><a className="co-text-link" href={joint.href}>查閱合建比較服務</a></footer>
  </article>
  <article className="service-management">
   <div className="service-management-heading"><p className="co-kicker">{management.label}</p><Readable as="h3"><a href={management.href}>{management.title}</a></Readable><p>{management.text}</p></div>
   <figure><img loading="lazy" {...photoProps({src:photoSource(management.image),alt:management.alt})}/></figure>
   <div className="service-management-record"><h4>持續管理的工作紀錄</h4><dl><div><dt>文件</dt><dd>計畫版本、送件內容與審查意見</dd></div><div><dt>會議</dt><dd>決議、保留意見與待決定事項</dd></div><div><dt>執行</dt><dd>負責窗口、回覆期限及處理情形</dd></div></dl><p>{management.output}</p><a className="co-text-link" href={management.href}>查閱全案管理服務</a></div>
  </article>
 </div>;
}

export function ServiceWorkFocus({page}) {
 const type=page.path.split('/').pop();
 if(type==='joint-construction')return <aside className="service-inline-focus"><h3>提案比對項目</h3><dl><div><dt>房地內容</dt><dd>計算基準、可選戶別、樓層與車位</dd></div><div><dt>地主支付</dt><dd>補款、稅費、支付時點及搬遷支出</dd></div><div><dt>合作履行</dt><dd>簽約對象、履約保障及交屋安排</dd></div></dl><a href="/landowner-comparison">以各案條件試算分回面積</a></aside>;
 if(type==='dangerous-old-rebuilding')return <aside className="service-inline-focus"><h3>危老初評資料核對</h3><ul><li>基地位置與都市計畫範圍</li><li>合法建物文件及安全評估</li><li>土地與建物所有權人清冊</li><li>全體同意進度及合作安排</li></ul><p>以上為資料準備項目；實際適用資格仍須依文件及法定條件確認。</p></aside>;
 if(type==='project-management')return <aside className="service-inline-focus"><h3>同一項工作須有完整紀錄</h3><dl><div><dt>依據</dt><dd>委託範圍、會議決議與審查要求</dd></div><div><dt>處理</dt><dd>負責單位、應交資料與回覆期限</dd></div><div><dt>回報</dt><dd>目前進度、未完成原因及待決策事項</dd></div></dl></aside>;
 return <aside className="service-inline-focus"><h3>地方方案與基地條件</h3><p>各城市的政府協助、重建、整建維護與安置方案，資格及受理期限不同。可按基地所在地查閱，再與個案資料核對。</p><a href="/programs">查閱各城市的都更與危老方案</a></aside>;
}
