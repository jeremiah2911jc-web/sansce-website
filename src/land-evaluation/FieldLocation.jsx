import {useEffect,useState} from 'react';
import './phase4.css';
export function useFieldLocation(root){
 const [pending,setPending]=useState(null),[notice,setNotice]=useState('');
 useEffect(()=>{if(!pending)return;const frame=requestAnimationFrame(()=>{
  const el=root.current;if(!el)return;
  const target=pending.label?[...el.querySelectorAll('input[aria-label],select[aria-label],textarea[aria-label]')].find(e=>e.getAttribute('aria-label')===pending.label&&!e.closest('[hidden]')):[...el.querySelectorAll('h2,h3,h4')].find(e=>e.textContent===pending.heading&&!e.closest('[hidden]'));
  if(!target){setNotice('目前找不到這個欄位，請依原缺件說明核對本頁設定。');return;}
  for(let p=target.parentElement;p&&p!==el;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  el.querySelectorAll('.field-located').forEach(e=>e.classList.remove('field-located'));
  if(!pending.label)target.tabIndex=-1;target.classList.add('field-located');target.scrollIntoView({behavior:'instant',block:'center'});target.focus({preventScroll:true});setNotice('已定位「'+(pending.label||pending.heading)+'」，請依文件核對填寫。');
 });return()=>cancelAnimationFrame(frame);},[pending,root]);
 return {locate:target=>{setNotice('');setPending({...target});},notice};
}
export function FieldLocationNotice({children}){return children?<p className="field-location-notice" role="status">{children}</p>:null;}
