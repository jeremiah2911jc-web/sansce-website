import './phase3.css';
function Items({rows,empty,compact,onLocate}){
 const list=compact?rows:rows.slice(0,4),rest=compact?[]:rows.slice(4);
 const render=items=><ul>{items.map((r,i)=><li key={i}><div><strong>{r.title}</strong><span>{r.status}</span></div><p>{r.detail}</p>{!compact&&onLocate&&r.target&&<button type="button" className="judgement-locate" onClick={()=>onLocate(r.target)}>填寫／核對{r.target.label||r.target.heading}</button>}</li>)}</ul>;
 return rows.length?<>{render(list)}{rest.length>0&&<details><summary>其餘{rest.length}項</summary>{render(rest)}</details>}</>:<p className="judgement-empty">{empty}</p>;
}
export function JudgementPanel({model:m,compact=false,stale=false,onRecheck,onLocate}){
 if(stale)return <section className="lw-section judgement-panel"><h2>本次判讀與下一步</h2><p className="comparison-pending">土地條件已變更，請重新初核後再引用判讀。</p>{onRecheck&&<button type="button" className="le-secondary" onClick={onRecheck}>重新核對用途與途徑</button>}</section>;
 if(!m)return null;
 return <section className={'lw-section judgement-panel'+(compact?' judgement-print':'')} aria-label={m.kind}><header><p className="le-eyebrow">依本次條件整理</p><h2>本次判讀與下一步</h2><strong>{m.headline}</strong><p>{m.basis}</p></header><div className="judgement-columns">{[['可繼續研究的方向',m.directions,'目前尚無可列的候選方向，請先補齊本頁資料。'],['已知限制',m.limits,'本次未列出已知不符事項；仍須處理待補及專案覆核條件。'],['尚缺資料與影響',m.gaps,'本次未另列缺件；個案效力及圖說仍依原件核對。'],['建議下一步',m.actions,'依本頁來源及個案文件進一步核對。']].map(([title,rows,empty])=><section key={title}><h3>{title}<small>{rows.length}項</small></h3><Items rows={rows} empty={empty} compact={compact} onLocate={onLocate}/></section>)}</div>{m.notes.length>0&&<details open={compact}><summary>判讀前提與範圍</summary><ul>{m.notes.map((t,i)=><li key={i}>{t}</li>)}</ul></details>}</section>;
}
