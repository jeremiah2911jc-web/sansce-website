import {useEffect,useState} from 'react';
// Navigation describes visible work, never implies completion of a legal check.
export function WorkbenchOutline({root,section}){
 const [items,setItems]=useState([]);
 useEffect(()=>{const el=root.current;if(!el)return;let frame;
  function refresh(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const list=[...el.querySelectorAll('.lw-section > h2,.lw-section > .lw-section-top h2')].filter(h=>!h.closest('[hidden]'));const next=list.map((h,i)=>{h.id='dev-work-'+section+'-'+i;h.tabIndex=-1;return{id:h.id,label:h.textContent};});setItems(old=>JSON.stringify(old)===JSON.stringify(next)?old:next);});}
  refresh();const observer=new MutationObserver(refresh);observer.observe(el,{childList:true,subtree:true});return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[root,section]);
 return items.length>1?<nav className="dev-work-outline" aria-label="本工具工作項目"><span>本次工作</span><div>{items.map(x=><button type="button" key={x.id} onClick={()=>{const h=document.getElementById(x.id);h?.scrollIntoView({behavior:'instant',block:'start'});h?.focus({preventScroll:true});}}>{x.label}</button>)}</div></nav>:null;
}
