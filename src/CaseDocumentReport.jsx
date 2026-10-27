import {useEffect} from 'react';
import './case-document-report.css';
const asset=name=>`/api/reports?asset=${encodeURIComponent(name)}`;
export default function CaseDocumentReport({report,onLogout,busy,message}){
 useEffect(()=>{const target=document.getElementById(location.hash.slice(1));if(target?.closest('.case-document-report'))target.scrollIntoView();else window.scrollTo(0,0);},[report.id]);
 return <article className="case-document-report">
  <div className="cdr-toolbar"><a href="/">三策首頁</a><div><a href={asset('report.pdf')} target="_blank" rel="noopener">開啟 PDF</a><a href={asset('report.pdf')} download="地主權益評估報告.pdf">下載 PDF</a><button onClick={onLogout} disabled={busy}>登出</button></div></div>
  {message&&<p role="status">{message}</p>}
  <header className="cdr-header"><p>三策專案管理顧問有限公司</p><h1>{report.headingLines.map(line=><span key={line}>{line}</span>)}</h1><p>{report.subtitle}</p><p className="cdr-date">民國115年10月27日</p></header>
  <nav className="cdr-contents" aria-label="報告章節">{report.sections.map((s,i)=><a key={s.title} href={`#report-section-${i}`}>{s.title}</a>)}</nav>
  <div className="cdr-body">{report.sections.map((s,i)=><section key={s.title} id={`report-section-${i}`}><h2>{s.title}</h2>{s.blocks.map((b,j)=>{
   if(b.type==='paragraph')return <p key={j}>{b.text}</p>;
   if(b.type==='heading')return <h3 key={j}>{b.text}</h3>;
   if(b.type==='image')return <figure key={j}><a href={asset(b.asset)} target="_blank" rel="noopener" aria-label={`放大${b.caption}`}><img src={asset(b.asset)} alt={b.caption} width={b.width} height={b.height} loading="lazy" /></a><figcaption>{b.caption}</figcaption></figure>;
   if(b.type==='table')return <div key={j} className={`cdr-table ${b.headers.length>2?'cdr-table-wide':'cdr-table-text'}`} role="region" aria-label={s.title+'資料表'} tabIndex={0}><table><thead><tr>{b.headers.map((x,k)=><th key={k} scope="col">{x==='原基地與鄰地全併'?<>原基地與<wbr/><span className="cdr-heading-phrase">鄰地全併</span></>:x}</th>)}</tr></thead><tbody>{b.rows.map((row,k)=><tr key={k}>{row.map((x,l)=>l===0?<th key={l} scope="row">{x}</th>:<td key={l}>{x}</td>)}</tr>)}</tbody></table></div>;
   return null;
  })}</section>)}</div>
  <footer className="cdr-footer"><p>三策專案管理顧問有限公司 · {report.id}</p><a href={asset('report.pdf')} target="_blank" rel="noopener">開啟完整 PDF</a></footer>
 </article>;
}
