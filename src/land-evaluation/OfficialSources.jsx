import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {ReferenceDisclosure} from './DisclosureLayout.jsx';
import {useEffect,useState} from 'react';
import {localCatalog} from './generated/land.mjs';
import {officialQueries,restrictionQueries} from './official-sources.mjs';
import './phase4.css';

function QueryList({queries}){
 return <ul className="official-query-list">{queries.map(q=><li key={q.id}>
  <div className="official-query-source">
   <span>{q.purpose}</span>
   <a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a>
   {q.authority!==q.title&&<small>{q.authority}</small>}
  </div>
  <div className="official-query-description">
   <p>{q.note}</p>
   {q.laws?.map(law=><a className="official-query-law" key={law.url} href={law.url} target="_blank" rel="noopener noreferrer">{law.title}</a>)}
  </div>
 </li>)}</ul>;
}

export function OfficialSources({city=''}){
 const [selected,setSelected]=useState(city);
 useEffect(()=>setSelected(city),[city]);
 const locality=city||selected;
 return <ReferenceDisclosure className="official-query" title="地籍與使用分區查詢">
  <div className="official-query-heading">
   <div>
    <h3>{locality||'全國'}官方查詢入口</h3>
    <p>查詢地籍圖、土地使用分區與適用的都市計畫。登記面積依土地登記謄本。</p>
   </div>
   {!city&&<label className="le-field"><span>查詢所在地</span><select aria-label="查詢所在地" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">尚未選定</option>{localCatalog.map(c=><option key={c.city} value={c.city}>{c.city}</option>)}</select></label>}
  </div>
  <QueryList queries={officialQueries(locality)}/>
  <EvaluationDisclosure className="official-restrictions">
   <summary>禁限建與航空限高查詢</summary>
   <p>查詢基地是否涉及高鐵、捷運及機場管制。依查詢結果檢討規劃高度、地下室與施工條件。</p>
   <QueryList queries={restrictionQueries(locality)}/>
  </EvaluationDisclosure>
  <p className="official-query-foot">引用圖台時填圖層名稱與查詢日期。引用土地使用分區證明書或都市計畫書時填核發日期或公告文號。</p>
 </ReferenceDisclosure>;
}
