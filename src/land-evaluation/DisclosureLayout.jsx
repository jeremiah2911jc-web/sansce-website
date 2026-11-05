import {useEffect,useId,useRef} from 'react';
import {InDisclosureWindow,openDisclosureWindow,releaseDisclosureWindow,restoreDisclosureFocus} from './EvaluationDisclosure.jsx';

// Native disclosures keep their fields mounted when another section is opened.
// Groups follow the visible parent, so nested conditions do not close their owner.
export function useDisclosureLayout(){
 useEffect(()=>{
  const parents=new WeakMap();let next=0;
  const group=detail=>{
   const owner=detail.parentElement;
   if(!parents.has(owner))parents.set(owner,`evaluation-details-${++next}`);
   return parents.get(owner);
  };
  const decorate=()=>{
   document.querySelectorAll('.dev-tool-shell details:not(.mb-help)').forEach(detail=>{
    detail.name=group(detail);
    const title=detail.querySelector(':scope > summary')?.textContent??'';
    const kind=/細項|TOD/.test(title)?'award':/文件|資格|依據|來源|法規|條件核對/.test(title)?'evidence':'planning';
    if(detail.dataset.disclosureKind!==kind)detail.dataset.disclosureKind=kind;
   });
  };
  const toggle=event=>{
   const detail=event.target;
   if(!(detail instanceof HTMLDetailsElement)||!detail.open||!detail.closest('.dev-tool-shell'))return;
   // Also supports browsers that do not implement the native name grouping.
   for(const peer of detail.parentElement.children){
    if(peer!==detail&&peer instanceof HTMLDetailsElement&&peer.open)peer.open=false;
   }
  };
  const click=event=>{
   const summary=event.target.closest?.('summary');
   const detail=summary?.parentElement;
   if(!(detail instanceof HTMLDetailsElement)||detail.open||!detail.closest('.dev-tool-shell'))return;
   const before=summary.getBoundingClientRect().top;
   for(const peer of detail.parentElement.children){
    if(peer!==detail&&peer instanceof HTMLDetailsElement&&peer.open)peer.open=false;
   }
   // Closing a preceding section must not move the selected entry out of view.
   const delta=summary.getBoundingClientRect().top-before;
   if(delta)window.scrollBy({top:delta,behavior:'instant'});
  };
  decorate();
  const observer=new MutationObserver(decorate);
  observer.observe(document.getElementById('root')??document.body,{childList:true,subtree:true});
  document.addEventListener('toggle',toggle,true);
  document.addEventListener('click',click,true);
  return()=>{observer.disconnect();document.removeEventListener('toggle',toggle,true);document.removeEventListener('click',click,true);};
 },[]);
}

export function ReferenceDisclosure({title,children,className='',actionLabel='查看'}){
 const ref=useRef(null),trigger=useRef(null),id=useId();
 const unlock=()=>releaseDisclosureWindow(ref.current);
 useEffect(()=>{
  const dialog=ref.current;
  return()=>releaseDisclosureWindow(dialog);
 },[]);
 function open(){openDisclosureWindow(ref.current);}
 function close(){ref.current.close();}
 return <div className={'le-reference-entry '+className}>
  <button ref={trigger} type="button" className="le-reference-trigger" aria-haspopup="dialog" aria-controls={id} onClick={open}><span>{title}</span><span className="le-reference-action">{actionLabel}</span></button>
  <dialog ref={ref} id={id} aria-labelledby={id+'-title'} className="le-reference-drawer" onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right)close();}}} onClose={event=>{unlock();restoreDisclosureFocus(event.currentTarget,trigger.current);}}>
   <header className="le-reference-heading"><div><span>參考資料</span><h2 id={id+'-title'}>{title}</h2></div><button type="button" onClick={close} autoFocus>關閉</button></header>
   <div className="le-reference-content"><InDisclosureWindow.Provider value={true}>{children}</InDisclosureWindow.Provider></div>
  </dialog>
 </div>;
}
