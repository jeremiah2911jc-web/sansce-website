import {Children,cloneElement,createContext,isValidElement,useContext,useEffect,useId,useRef,useState} from 'react';

export const InDisclosureWindow=createContext(false);
const activeWindows=new Set();let previousOverflow='';
export function openDisclosureWindow(dialog){
 if(dialog.open)return;
 for(const other of document.querySelectorAll('dialog[open]'))if(other!==dialog)other.close();
 if(!activeWindows.size)previousOverflow=document.body.style.overflow;
 dialog.showModal();
 activeWindows.add(dialog);document.body.style.overflow='hidden';
}
export function releaseDisclosureWindow(dialog){
 if(activeWindows.delete(dialog)&&!activeWindows.size)document.body.style.overflow=previousOverflow;
}

export function prepareDisclosureTarget(target){
 const destination=target.closest('dialog');
 for(const dialog of document.querySelectorAll('dialog[open]')){
  if(dialog!==destination)dialog.close();
 }
 if(destination&&!destination.open)target.setAttribute('data-disclosure-focus','');
}
export function restoreDisclosureFocus(dialog,trigger){
 const active=document.activeElement;
 if(!document.querySelector('dialog[open]')&&(active===document.body||dialog.contains(active))){
  trigger?.focus({preventScroll:true});
 }
}

// Keep every field in its original DOM scope for validation and field-location links.
// A dialog uses the browser's top layer, focus trap and Escape handling.
export function EvaluationDisclosure({children,open,onToggle,className='',...props}){
 const nested=useContext(InDisclosureWindow),id=useId(),detailRef=useRef(null),dialogRef=useRef(null),trigger=useRef(null);
 const [expanded,setExpanded]=useState(false);
 const parts=Children.toArray(children),summary=parts.find(child=>isValidElement(child)&&child.type==='summary');
 const content=parts.filter(child=>child!==summary),overview=className.includes('studio-entry-notes');
 const unlock=()=>releaseDisclosureWindow(dialogRef.current);
 useEffect(()=>{
  if(nested)return;
  const dialog=dialogRef.current;if(!dialog)return;
  if(expanded&&!dialog.open){openDisclosureWindow(dialog);const destination=dialog.querySelector('[data-disclosure-focus]');if(destination){destination.removeAttribute('data-disclosure-focus');destination.scrollIntoView({block:'center',behavior:'instant'});destination.focus({preventScroll:true});}}
  else if(!expanded&&dialog.open)dialog.close();
 },[expanded,nested]);
 useEffect(()=>{
  const dialog=dialogRef.current;
  return()=>releaseDisclosureWindow(dialog);
 },[nested]);
 if(nested||!summary)return <details {...props} open={open} className={className} onToggle={onToggle}>{children}</details>;
 function close(){dialogRef.current.close();}
 return <details {...props} ref={detailRef} open={expanded} className={'le-disclosure-modal '+className} onToggle={event=>{if(event.target!==event.currentTarget)return;setExpanded(event.currentTarget.open);onToggle?.(event);}}>
  {cloneElement(summary,{ref:trigger,'aria-haspopup':'dialog','aria-controls':id})}
  <dialog id={id} ref={dialogRef} aria-labelledby={id+'-title'} className="le-disclosure-window" onClose={event=>{unlock();setExpanded(false);restoreDisclosureFocus(event.currentTarget,trigger.current);}} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}}}>
   <header className="le-disclosure-window-heading"><div><span>{overview?'使用說明':'評估設定'}</span><h2 id={id+'-title'}>{summary.props.children}</h2></div><button type="button" onClick={close} autoFocus>關閉</button></header>
   <div className="le-disclosure-window-content"><InDisclosureWindow.Provider value={true}>{content}</InDisclosureWindow.Provider></div>
   <footer className="le-disclosure-window-footer"><button type="button" onClick={close}>{overview?'返回評估項目':'返回表單'}</button></footer>
  </dialog>
 </details>;
}
