import {CaseFileControls} from './CaseFileControls.jsx';
import {validateCaseData} from './case-file.mjs';
import {Component,createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {DRAFT_KEY,parseDraft,persistDraft,comparable,contentKey} from './local-draft.mjs';
import manifest from './generated/source-manifest.json';
import readjustmentManifest from './generated/readjustment-manifest.json';
const RULES=JSON.stringify([manifest.sources.map(x=>x.sha256),readjustmentManifest.sources.map(x=>x.sha256)]);
const DraftContext=createContext(null);
class DraftBoundary extends Component{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.pause();}
 render(){return this.state.failed?<section className="draft-notice" role="alert"><h2>暫存資料無法完整恢復</h2><p>原暫存保留，尚未覆寫。可以建立新的空白評估。</p><button type="button" onClick={this.props.restart}>不載入，建立新評估</button></section>:this.props.children;}
}
export function LocalDraftProvider({children}){
 const [initial]=useState(()=>{try{const text=localStorage.getItem(DRAFT_KEY);return text?{saved:parseDraft(text),raw:text}:{saved:null,raw:null};}catch{return {saved:null,raw:null,error:'無法讀取本機暫存；資料可能損壞或瀏覽器未開放儲存。'};}});
 const [needsRecovery,setNeedsRecovery]=useState(Boolean(initial.error)),[status,setStatus]=useState(initial.error?'error':initial.saved?'restored':'idle'),[error,setError]=useState(initial.error||''),[savedAt,setSavedAt]=useState(initial.saved?.savedAt||''),[generation,setGeneration]=useState(0),[restored,setRestored]=useState(Boolean(initial.saved)),[versionChanged,setVersionChanged]=useState(Boolean(initial.saved&&initial.saved.rules!==RULES));
 const data=useRef(initial.saved?.data||{}),changed=useRef(new Set()),touched=useRef(new Set()),timer=useRef(null),paused=useRef(Boolean(initial.error)),lastRaw=useRef(initial.raw),dirty=useRef(false),conflict=useRef(false);
 const flush=useCallback(()=>{
  clearTimeout(timer.current);if(paused.current||!dirty.current)return;
  try{const saved=persistDraft(localStorage,lastRaw.current,data.current,[...changed.current].some(contentKey),RULES,crypto.randomUUID());lastRaw.current=saved.raw;dirty.current=false;setSavedAt(saved.savedAt);setStatus(saved.raw?'saved':'idle');setError('');
  }catch(e){if(e.code==='DRAFT_CONFLICT'){paused.current=true;conflict.current=true;setStatus('conflict');setError('另一個分頁已更新暫存。本頁輸入保留，請選擇要繼續哪一份。');return;}setStatus('error');setError(e?.message?.includes('容量')?e.message:'本機暫存失敗，畫面輸入仍保留；請檢查瀏覽器的儲存空間與權限。');}
 },[]);
 const register=useCallback((key,value,baseline)=>{data.current[key]=value;if(comparable(key,value)!==baseline)changed.current.add(key);else changed.current.delete(key);if(!touched.current.has(key)||paused.current||(!lastRaw.current&&!contentKey(key)&&!dirty.current))return;dirty.current=true;setStatus('saving');clearTimeout(timer.current);timer.current=setTimeout(flush,450);},[flush]);
 const touch=useCallback(key=>touched.current.add(key),[]);
 const clearScope=useCallback(prefix=>{for(const key of Object.keys(data.current))if(key.startsWith(prefix)){delete data.current[key];changed.current.delete(key);touched.current.delete(key);}},[]);

 function importCase(file){
  const next=validateCaseData(file.data);
  let saved;try{saved=persistDraft(localStorage,lastRaw.current,next,true,RULES,crypto.randomUUID());}catch(e){throw Error(e.code==='DRAFT_CONFLICT'?'另一分頁的暫存已變更，請先處理頁頂分頁版本；本次尚未載入。':'本機儲存未完成，本次尚未載入，畫面與原暫存保留。');}
  clearTimeout(timer.current);data.current=next;changed.current.clear();touched.current.clear();dirty.current=false;paused.current=false;conflict.current=false;lastRaw.current=saved.raw;
  setNeedsRecovery(false);setSavedAt(saved.savedAt);setError('');setStatus('imported');setRestored(true);setVersionChanged(file.rules!==RULES);setGeneration(x=>x+1);document.body.classList.remove('le-focus-result');
 }
 function fresh(){clearTimeout(timer.current);try{localStorage.removeItem(DRAFT_KEY);}catch{setError('無法刪除本機暫存；尚未建立新評估。');return;}data.current={};changed.current.clear();touched.current.clear();dirty.current=false;paused.current=false;lastRaw.current=null;setNeedsRecovery(false);setSavedAt('');setError('');setStatus('idle');setRestored(false);setGeneration(x=>x+1);}
 function removeSaved(){clearTimeout(timer.current);try{localStorage.removeItem(DRAFT_KEY);lastRaw.current=null;dirty.current=false;setSavedAt('');setStatus('idle');setError('');}catch{setStatus('error');setError('無法刪除本機暫存，原資料仍保留。');}}
 function keepThis(){try{lastRaw.current=localStorage.getItem(DRAFT_KEY);paused.current=false;conflict.current=false;dirty.current=true;flush();}catch{setError('無法存取本機暫存。');}}
 useEffect(()=>{const hide=()=>{if(document.visibilityState==='hidden')flush();};const storage=e=>{if(e.key!==DRAFT_KEY||e.newValue===lastRaw.current)return;paused.current=true;conflict.current=true;setStatus('conflict');setError('另一個分頁已更新暫存。本頁輸入保留，請選擇要繼續哪一份。');};window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',hide);window.addEventListener('storage',storage);return()=>{flush();window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hide);window.removeEventListener('storage',storage);};},[flush]);
 const context={rules:RULES,importCase,data,register,touch,clearScope,needsRecovery,status,error,savedAt,restored,versionChanged,fresh,removeSaved,flush,keepThis,reload:()=>location.reload()};
 return <DraftContext.Provider value={context}><DraftBoundary key={generation} pause={()=>{paused.current=true;}} restart={fresh}>{children}</DraftBoundary></DraftContext.Provider>;
}
export const useDraft=()=>useContext(DraftContext);
export function useDraftState(key,initial){
 const context=useDraft(),initialRef=useRef(null);
 if(!initialRef.current){const fallback=typeof initial==='function'?initial():initial;initialRef.current={fallback,baseline:comparable(key,fallback)};}
 const [value,setValue]=useState(()=>Object.hasOwn(context.data.current,key)?context.data.current[key]:initialRef.current.fallback);
 useEffect(()=>context.register(key,value,initialRef.current.baseline),[key,value,context.register]);
 const update=useCallback(next=>{context.touch(key);setValue(next);},[context.touch,key]);
 return [value,update];
}
export function DraftControls(){
 const d=useDraft(),[remove,setRemove]=useState(false);
 if(d.needsRecovery)return <section className="draft-controls" role="alert"><div><strong>本機暫存暫時無法讀取</strong><p>{d.error}原暫存尚未覆寫，你仍可查看評估工具。</p></div><div><button type="button" onClick={d.reload}>重新讀取暫存</button><button type="button" onClick={d.fresh}>建立新評估</button></div><CaseFileControls/></section>;
 const statusText=d.status==='imported'?'案件已載入，請重新計算':d.status==='restored'?'已恢復輸入，請重新檢核':d.status==='conflict'?'暫存有其他分頁版本':d.status==='error'?'本機暫存未完成':'';
 const detail=d.error||(d.versionChanged?'規則已變更，請重新計算與核對。':'');
 return <section className="draft-controls draft-toolbar" aria-label="案件操作">{(statusText||detail)&&<div role="status">{statusText&&<strong>{statusText}</strong>}{detail&&<span>{detail}</span>}</div>}{d.status==='conflict'?<div><button type="button" onClick={d.reload}>載入另一分頁的暫存</button><button type="button" onClick={d.keepThis}>改存本頁輸入</button></div>:<div>{d.status==='error'&&<button type="button" onClick={d.keepThis}>重試暫存</button>}{d.savedAt&&<button type="button" onClick={()=>setRemove(true)}>刪除本機暫存</button>}</div>}<CaseFileControls/>{remove&&<div className="draft-remove" role="alertdialog" aria-label="刪除本機暫存"><p>刪除此瀏覽器的暫存，畫面輸入仍保留；再次修改後會重新暫存。</p><button type="button" onClick={()=>{d.removeSaved();setRemove(false);}}>確認刪除暫存</button><button type="button" onClick={()=>setRemove(false)}>取消</button></div>}</section>;
}
