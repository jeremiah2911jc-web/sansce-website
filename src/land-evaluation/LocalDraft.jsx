import {CaseFileControls,downloadCase} from './CaseFileControls.jsx';
import {validateCaseData} from './case-file.mjs';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {DRAFT_KEY,comparable,contentKey} from './local-draft.mjs';
import manifest from './generated/source-manifest.json';
import readjustmentManifest from './generated/readjustment-manifest.json';
const RULES=JSON.stringify([manifest.sources.map(x=>x.sha256),readjustmentManifest.sources.map(x=>x.sha256)]);
const DraftContext=createContext(null);
function LeaveDialog({onStay,onLeave,onSave}){
 const ref=useRef(null),[error,setError]=useState('');
 useEffect(()=>{ref.current.showModal();return()=>ref.current?.close();},[]);
 return <dialog ref={ref} className="case-import-dialog" aria-label="離開前儲存評估" onCancel={e=>{e.preventDefault();onStay();}}><h2>要先儲存本次評估嗎？</h2><p>離開後，本次輸入將清除。</p>{error&&<p role="alert">{error}</p>}<footer><button onClick={()=>{try{onSave();}catch(e){setError(e.message);}}}>下載案件檔</button><button onClick={onStay}>繼續編輯</button><button onClick={onLeave}>離開評估</button></footer></dialog>;
}
export function LocalDraftProvider({children}){
 const data=useRef({}),dirty=useRef(false),[generation,setGeneration]=useState(0),[leave,setLeave]=useState('');
 const fresh=useCallback(()=>{data.current={};dirty.current=false;setLeave('');setGeneration(x=>x+1);},[]);
 const markSaved=useCallback(()=>{dirty.current=false;},[]);
 const register=useCallback((key,value)=>{data.current[key]=value;},[]);
 const touch=useCallback(key=>{if(contentKey(key))dirty.current=true;},[]);
 const clearScope=useCallback(prefix=>{for(const key of Object.keys(data.current))if(key.startsWith(prefix))delete data.current[key];dirty.current=true;},[]);
 function importCase(file){data.current=validateCaseData(file.data);dirty.current=false;setGeneration(x=>x+1);document.body.classList.remove('le-focus-result');}
 useEffect(()=>{
  // Retire only the evaluator's automatic storage; downloaded files are independent.
  try{for(const key of Object.keys(localStorage))if(key===DRAFT_KEY||key.startsWith(DRAFT_KEY+':archive:'))localStorage.removeItem(key);}catch{/* Session input does not depend on browser storage. */}
  const unload=e=>{if(dirty.current){e.preventDefault();e.returnValue='';}};
  const click=e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&url.hash)return;if(!/^https?:$/.test(url.protocol))return;if(dirty.current){e.preventDefault();setLeave(url.href);}};
  const hide=()=>{data.current={};dirty.current=false;};
  const show=e=>{if(e.persisted)fresh();};
  window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',show);
  return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',show);};
 },[fresh]);
 const context={rules:RULES,data,register,touch,clearScope,importCase,markSaved,fresh};
 return <DraftContext.Provider value={context}><section key={generation}>{children}</section>{leave&&<LeaveDialog onStay={()=>setLeave('')} onSave={()=>{downloadCase(data.current,RULES);markSaved();}} onLeave={()=>{dirty.current=false;location.assign(leave);}}/>}</DraftContext.Provider>;
}
export const useDraft=()=>useContext(DraftContext);
export function useDraftState(key,initial){
 const context=useDraft(),initialRef=useRef(null);
 if(!initialRef.current){const fallback=typeof initial==='function'?initial():initial;initialRef.current={fallback,baseline:comparable(key,fallback)};}
 const [value,setValue]=useState(()=>Object.hasOwn(context.data.current,key)?context.data.current[key]:initialRef.current.fallback);
 useEffect(()=>context.register(key,value),[key,value,context.register]);
 const update=useCallback(next=>{context.touch(key);setValue(next);},[context.touch,key]);
 return [value,update];
}
export function DraftControls(){return <section className="draft-controls draft-toolbar" aria-label="案件操作"><CaseFileControls/></section>;}
