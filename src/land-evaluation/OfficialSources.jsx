import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {useEffect,useState} from 'react';
import {localCatalog} from './generated/land.mjs';
import {officialQueries,restrictionQueries} from './official-sources.mjs';
import './phase4.css';
import {ReferenceDisclosure} from './DisclosureLayout.jsx';
export function OfficialSources({city=''}){
 const [selected,setSelected]=useState(city);useEffect(()=>setSelected(city),[city]);
 return <ReferenceDisclosure className="official-query" title="地籍與使用分區查詢"><div className="official-query-heading"><div><h3>{city||selected||'所在地'}官方資料</h3><p>依地號查詢地籍圖、使用分區圖及適用都市計畫。登記面積以土地登記謄本所載為準。</p></div>{!city&&<label className="le-field"><span>查詢所在地</span><select aria-label="查詢所在地" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">尚未選定</option>{localCatalog.map(c=><option key={c.city} value={c.city}>{c.city}</option>)}</select></label>}</div><ol className="official-query-list">{officialQueries(city||selected).map(q=><li key={q.id}><div><span>{q.purpose}</span><a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a></div><p>{q.note}<small>{q.authority}</small></p></li>)}</ol><EvaluationDisclosure className="official-restrictions"><summary>禁限建與航空限高查詢</summary><p>查詢基地是否涉及高鐵、捷運及機場管制；規劃高度、地下室與施工條件依查詢結果另行檢討。</p><ul className="official-query-list">{restrictionQueries(city||selected).map(q=><li key={q.id}><div><span>{q.purpose}</span><a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a></div><div><p>{q.note}<small>{q.authority}</small></p>{q.laws?.map(law=><a className="official-query-law" key={law.url} href={law.url} target="_blank" rel="noopener noreferrer">{law.title}</a>)}</div></li>)}</ul></EvaluationDisclosure><p className="official-query-foot">引用圖台時填圖層名稱與查詢日期。引用土地使用分區證明書或都市計畫書時填核發日期或公告文號。</p></ReferenceDisclosure>;
}
