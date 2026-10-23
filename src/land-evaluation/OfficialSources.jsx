import {useEffect,useState} from 'react';
import {localCatalog} from './generated/land.mjs';
import {officialQueries,OFFICIAL_LINK_REVIEW} from './official-sources.mjs';
import './phase4.css';
export function OfficialSources({city=''}){
 const [selected,setSelected]=useState(city);useEffect(()=>setSelected(city),[city]);
 return <details className="official-query"><summary>官方資料查詢與填報依據</summary><div className="official-query-heading"><div><h3>查清楚，再填回本次評估</h3><p>地號與土地清冊由你確認輸入。連結另開官方網站，不代送本案資料、不自動帶入或改為已查證。</p></div><label className="le-field"><span>查詢所在地</span><select aria-label="查詢所在地" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">尚未選定</option>{localCatalog.map(c=><option key={c.city} value={c.city}>{c.city}</option>)}</select><small>只切換查詢入口，不更改土地或評估地區。</small></label></div><ol className="official-query-list">{officialQueries(selected).map(q=><li key={q.id}><div><span>{q.purpose}</span><a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a></div><p>{q.note}<small>{q.authority}</small></p></li>)}</ol><p className="official-query-foot">入口核對日：{OFFICIAL_LINK_REVIEW}。查詢後請填入本案取值、文件來源及查證日期；入口核對不代表個案資料已覆核。</p></details>;
}
