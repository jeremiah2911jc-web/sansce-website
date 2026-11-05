import {sourceReferences} from './source-links.mjs';
import {summaryForDisplay} from './summary-presentation.mjs';
import {JudgementPanel} from './JudgementPanel.jsx';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useResultMotion} from './ResultMotion.jsx';
import {displayNumber,displayRuleVersion} from './delivery-model.mjs';
import './evaluation-delivery.css';
export function SourceReference({value,links=[]}){return sourceReferences(value,links).map((part,i)=>part.url?<a key={i} href={part.url} target="_blank" rel="noreferrer">{part.label}</a>:part.label);}
const palette=['#263d4b','#96745c','#61807c','#b8a46e'];
export function ResultCharts({charts=[],animate=true}){
 const [cycle,setCycle]=useState(0),signature=JSON.stringify(charts),motion=useResultMotion(signature+':'+cycle,animate);
 return <div className="evaluation-chart-stage" {...motion}>
  {animate&&<div className="evaluation-chart-tools"><span>指向或選取項目，聚焦對照數值</span><button type="button" onClick={()=>setCycle(n=>n+1)}>重播圖表動態</button></div>}
  <div className="evaluation-charts">{charts.map((chart,i)=><ChartFigure key={i+':'+signature} chart={chart} index={i} interactive={animate}/>)}</div>
 </div>;
}
function ChartFigure({chart,index,interactive}){
 const [hovered,setHovered]=useState(null),[selected,setSelected]=useState(null),active=hovered??selected;
 const valid=chart.rows.filter(([,n])=>typeof n==='number'&&Number.isFinite(n)&&n>=0),max=Math.max(0,...valid.map(([,n])=>n));
 return <figure className="evaluation-chart" style={{'--chart-order':index}}><figcaption><strong>{chart.title}</strong><span>{chart.unit}</span></figcaption>{chart.rows.map(([label,n],j)=>{
  const known=typeof n==='number'&&Number.isFinite(n)&&n>=0,Row=interactive?'button':'div';
  const props=interactive?{type:'button','aria-pressed':selected===j,onClick:()=>setSelected(selected===j?null:j),onMouseEnter:()=>setHovered(j),onMouseLeave:()=>setHovered(null),onFocus:()=>setHovered(j),onBlur:()=>setHovered(null)}:{};
  return <Row {...props} className={'evaluation-chart-row'+(active===j?' is-active':'')+(active!==null&&active!==j?' is-muted':'')} style={{'--row-order':j}} key={j}><div><span>{label}</span><strong>{displayNumber(n)}<small>{known?chart.unit:''}</small></strong></div><div className="evaluation-chart-track" aria-hidden="true">{known&&<span style={{width:(max?n/max*100:0)+'%',backgroundColor:palette[j%palette.length]}}/>}</div></Row>;
 })}<p>{chart.note}</p></figure>;
}

export function EvaluationDelivery({getSummary,charts=[],disabled=false,reason=''}){
 const [summary,setSummary]=useState(null);
 return <section className="evaluation-delivery" aria-label="評估摘要與圖表">{charts.length>0&&!disabled&&<ResultCharts charts={charts}/>}<div className="evaluation-delivery-actions"><div><strong>本次評估摘要</strong><p>{reason||'列印結果、採用的數值及尚缺項目。'}</p></div><button type="button" className="le-secondary" disabled={disabled} onClick={()=>setSummary(getSummary())}>預覽評估摘要</button></div>{summary&&<SummaryPreview summary={summary} onClose={()=>setSummary(null)}/>}</section>;
}
export function SummaryPreview({summary:rawSummary,onClose,onDownload}){
 const s=summaryForDisplay(rawSummary);
 const ref=useRef(null),previous=useRef(document.activeElement),printing=useRef(false);
 useEffect(()=>{
  for(const active of document.querySelectorAll('dialog[open]'))active.close();
  const dialog=ref.current,overflow=document.body.style.overflow,root=document.getElementById('root'),wasInert=root?.inert,pageX=window.scrollX,pageY=window.scrollY;
  // Keep preview focus modal without a browser top layer, so Safari prints normal document flow.
  if(root)root.inert=true;
  // Print from the document origin, then restore the evaluator's reading position on close.
  window.scrollTo(0,0);
  document.body.style.overflow='hidden';dialog?.focus({preventScroll:true});
  return()=>{if(root)root.inert=wasInert;document.body.style.overflow=overflow;window.scrollTo(pageX,pageY);previous.current?.focus({preventScroll:true});};
 },[]);
 function printSummary(){
  if(printing.current)return;printing.current=true;
  // WebKit can count pages before its print-media layout settles. Lay out the
  // same print rules first so the initial preview and saved PDF include the end.
  const printRules=[];
  for(const sheet of document.styleSheets){
   try{for(const rule of sheet.cssRules){if(rule.type===CSSRule.MEDIA_RULE&&rule.conditionText==='print'){printRules.push(rule);rule.media.mediaText='all';}}}catch{/* Cross-origin styles do not contain our summary layout. */}
  }
  ref.current?.getBoundingClientRect();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{try{if(ref.current)window.print();}finally{for(const rule of printRules)rule.media.mediaText='print';printing.current=false;}}));
 }
 function keys(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='p'){e.preventDefault();printSummary();return;}if(e.key==='Escape'){e.preventDefault();onClose();}if(e.key==='Tab'){const controls=[...ref.current.querySelectorAll('button,a[href]')].filter(x=>!x.disabled),first=controls[0],last=controls.at(-1);if(!controls.length){e.preventDefault();return;}if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}}}
 return createPortal(<><div className="evaluation-print-watermark" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="evaluation-summary-brand-pattern" patternUnits="userSpaceOnUse" width="688" height="1020"><image href="/images/evaluation-watermark-09.svg?v=20261026-flow" width="688" height="1020"/></pattern></defs><rect width="100%" height="100%" fill="url(#evaluation-summary-brand-pattern)"/></svg></div><div className="evaluation-summary-dialog" role="dialog" aria-modal="true" aria-label="評估摘要預覽" tabIndex={-1} ref={ref} onKeyDown={keys}><div className="evaluation-summary-toolbar"><div><strong>評估摘要預覽</strong><span>首張為重點摘要，採用條件與待查事項列於附頁。</span></div>{onDownload&&<button type="button" onClick={onDownload}>下載 HTML 報告</button>}<button type="button" onClick={printSummary}>列印／另存 PDF</button><button type="button" onClick={onClose}>返回評估</button></div><article className={'evaluation-summary-document'+(s.kind==='工業土地與廠房開發'?' is-industrial':'')}><section className="summary-front"><header><div><p>三策專案管理顧問有限公司</p><h1>{s.title}</h1><p>{s.kind} · {s.status}</p></div></header><dl className="summary-meta"><div><dt>計算／整理日期</dt><dd>{new Date(s.createdAt).toLocaleString('zh-TW')}</dd></div><div><dt>規則版本</dt><dd>{displayRuleVersion(s.ruleVersion)}</dd></div></dl><dl className="summary-metrics">{s.metrics.map(([label,n,unit],i)=><div key={i}><dt>{label}</dt><dd>{displayNumber(n)}<small>{typeof n==='number'&&Number.isFinite(n)?unit:''}</small></dd></div>)}</dl><h2>主要採用條件</h2><table><tbody>{s.conditions.map(([label,value],i)=><tr key={i}><th>{label}</th><td><SourceReference value={value}/></td></tr>)}</tbody></table><ResultCharts charts={s.charts} animate={false}/><div className="summary-front-note"><strong>假設與待查事項</strong><p>{s.issues.length?`本次列有${s.issues.length}項待查或限制，詳見附頁。`:'依本次輸入計算，個案適用條件仍須核對。'}資料與法規覆核日：{s.reviewedAt}。本摘要依本次輸入條件試算。核定或核准面積依計畫書或建造執照所載，登記面積依建物測量成果圖及建物登記謄本所載。</p></div><footer>三策 · 前期評估摘要 · 成本、融資與現金流試算 · 三策開發評估服務</footer></section><section className="summary-appendix">{s.judgement&&<JudgementPanel model={s.judgement} compact/>}{s.sections?.filter(section=>section.rows.length).map((section,i)=><section key={i}><h2>{section.title}</h2><table className={'summary-data-table '+(section.title==='反計容積與空間占用'?'summary-volume-recount':'')}><thead><tr>{section.columns.map((label,j)=><th key={j}>{label}</th>)}</tr></thead><tbody>{section.rows.map((row,j)=><tr key={j}>{row.map((cell,k)=><td key={k}><SourceReference value={cell}/></td>)}</tr>)}</tbody></table></section>)}{s.inputs.length>0&&<><h2>採用輸入與依據</h2><table><thead><tr><th>項目</th><th>本次取值或條件</th></tr></thead><tbody>{s.inputs.map(([label,value],i)=><tr key={i}><th>{label}</th><td><SourceReference value={value}/></td></tr>)}</tbody></table></>}{[['待查事項與限制',s.issues],['評估假設與說明',s.assumptions],[s.sourceHeading||'資料依據',s.sources]].filter(([,rows])=>!s.omitEmptySections||rows.length).map(([title,rows])=><section key={title}><h2>{title}</h2>{rows.length?<ol>{rows.map((row,i)=><li key={i}><SourceReference value={row} links={s.sourceLinks}/></li>)}</ol>:<p></p>}</section>)}</section></article></div></>,document.body);
}
