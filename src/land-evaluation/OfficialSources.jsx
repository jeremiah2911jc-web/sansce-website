import {useEffect,useState} from 'react';
import {localCatalog} from './generated/land.mjs';
import {officialQueries} from './official-sources.mjs';
import './phase4.css';
export function OfficialSources({city=''}){
 const [selected,setSelected]=useState(city);useEffect(()=>setSelected(city),[city]);
 return <details className="official-query"><summary>地籍與使用分區查詢</summary><div className="official-query-heading"><div><h3>{city||selected||'所在地'}官方資料</h3><p>依地號查詢登記面積、使用分區與計畫文件，並核對資料適用範圍。</p></div>{!city&&<label className="le-field"><span>查詢所在地</span><select aria-label="查詢所在地" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">尚未選定</option>{localCatalog.map(c=><option key={c.city} value={c.city}>{c.city}</option>)}</select></label>}</div><ol className="official-query-list">{officialQueries(city||selected).map(q=><li key={q.id}><div><span>{q.purpose}</span><a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a></div><p>{q.note}<small>{q.authority}</small></p></li>)}</ol><p className="official-query-foot">查詢結果請連同文件名稱與日期填入評估；圖台資料與正式文件分別核對。</p></details>;
}
