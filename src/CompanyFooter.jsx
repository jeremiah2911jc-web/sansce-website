import {useState} from 'react';
import ScriptureStatement from './ScriptureQuote.jsx';
import './company-footer.css';
import './company-footer-compact.css';
import './brand-wordmark-09.css';

const services=[['都市更新顧問','/services/urban-renewal'],['危老重建評估','/services/dangerous-old-rebuilding'],['合建條件比較','/services/joint-construction'],['案件健檢','/checkup'],['全案管理','/services/project-management'],['三策開發評估服務','/consulting#development-evaluation-service']];
const resources=[['關於三策','/about'],['服務流程','/process'],['社區方案','/programs'],['地主分配試算','/landowner-comparison'],['三策觀點','/insights']];
function FooterLinks({title,items,className}){const [open,setOpen]=useState(false);const id=className+"-links";return <nav className={className} aria-label={"頁尾"+title}><h3>{title}</h3><button type="button" className="company-footer-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{title}<span aria-hidden="true">{open?"－":"＋"}</span></button><ul id={id} className={open?"is-open":""}>{items.map(([label,href])=><li key={href}><a href={href}>{label}</a></li>)}</ul></nav>;}
export default function CompanyFooter(){return <footer id="company-footer" className="company-footer" aria-label="公司資訊與網站導覽">
 <div className="wrap company-footer-main">
  <section className="company-footer-identity" aria-labelledby="footer-company-name">
   <a className="company-footer-brand company-footer-brand--wordmark" href="/" aria-label="三策專案管理顧問有限公司首頁"><h2 id="footer-company-name" aria-label="三策專案管理顧問有限公司"><img className="company-footer-wordmark" src="/images/brand/sanze-wordmark-09-white.svg?v=09-vector-2-ce-tall" width="112" height="53.4" alt="三策" loading="lazy"/><span>專案管理顧問有限公司</span></h2></a>
   <p className="company-footer-english" lang="en">Sanze Project Management<br/> Consulting Co., Ltd.</p>
   <p className="company-footer-motto">以信實立本，以專業成事</p>
   <p className="company-footer-tax">統一編號 <span>62250642</span></p>
  </section>
  <FooterLinks className="company-footer-services" title="顧問服務" items={services}/>
  <FooterLinks className="company-footer-resources" title="認識與資源" items={resources}/>
  <section className="company-footer-contact" aria-labelledby="footer-contact-heading"><h3 id="footer-contact-heading">聯絡三策</h3>
   <dl><div><dt>電話／手機</dt><dd className="company-footer-phones"><a className="company-footer-phone" href="tel:0222508202">0222508202</a><span aria-hidden="true">／</span><a className="company-footer-phone" href="tel:0916711323">0916711323</a></dd></div><div><dt>Email</dt><dd><a href="mailto:sanze.consulting@gmail.com">sanze.consulting@gmail.com</a></dd></div><div><dt>LINE</dt><dd><a href="https://lin.ee/w8xSeSz" target="_blank" rel="noopener noreferrer">@160rlvqj</a></dd></div><div className="company-footer-address"><dt>通訊地址</dt><dd>新北市中和區中山路二段 332 巷 13 號 12 樓</dd></div></dl>
  </section>
 </div>
 <div className="wrap company-footer-end"><div className="company-footer-belief"><ScriptureStatement kind="service"/></div>
 <div className="company-footer-legal"><small>© {new Date().getFullYear()} 三策專案管理顧問有限公司</small><nav aria-label="網站政策"><a href="/privacy">隱私權與資料使用</a><a href="/website-use">網站使用說明</a></nav></div></div>
</footer>;}
