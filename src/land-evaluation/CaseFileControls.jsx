import {useEffect,useRef,useState} from 'react';
import {useDraft} from './LocalDraft.jsx';
import {serializeCase,parseCase,caseFilename,MAX_CASE_BYTES} from './case-file.mjs';
import './phase4.css';
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function downloadCase(data,rules){download(serializeCase(data,rules),caseFilename());}
function ImportPreview({file,onClose,onApply,onBackup,rules}){
 const ref=useRef(null),previous=useRef(document.activeElement),[error,setError]=useState('');
 useEffect(()=>{ref.current.showModal();return()=>{ref.current?.close();previous.current?.focus({preventScroll:true});};},[]);
 const c=file.counts;
 return <dialog className="case-import-dialog" ref={ref} aria-label="匯入案件預覽" onCancel={e=>{e.preventDefault();onClose();}}><header><p className="le-eyebrow">案件檔 · 本機輸入</p><h2>確認要載入的案件</h2><p className="case-file-name">{file.filename}</p><p>檔案建立：{new Date(file.createdAt).toLocaleString('zh-TW')}</p></header><dl>{[['工業評估',file.data['industrial.input']?'1案':'0案'],['土地清冊',c.parcels+'筆'],['用途途徑',c.routes+'案'],['透天配置',c.layout+'案'],['集合住宅',c.collective+'案'],['重劃／地主權益',c.owner+'案'],['重劃／開發收購',c.acquisition+'案']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p>載入後將替換目前的評估資料與方案。</p><button type="button" className="case-backup" onClick={()=>{try{onBackup();setError('');}catch(e){setError(e.message);}}}>先下載目前案件備份</button>{error&&<p role="alert">{error}</p>}<footer><button type="button" onClick={()=>{try{onApply(file);onClose();}catch(e){setError(e.message);}}}>確認替換並載入</button><button type="button" onClick={onClose}>取消匯入</button></footer></dialog>;
}
export function CaseFileControls(){
 const d=useDraft(),input=useRef(null),request=useRef(0),[file,setFile]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 function backup(){downloadCase(d.data.current,d.rules);d.markSaved();setMessage('案件檔已下載。');}
 async function read(e){const selected=e.target.files?.[0];e.target.value='';if(!selected)return;const id=++request.current;setBusy(true);setMessage('');try{if(selected.size>MAX_CASE_BYTES)throw Error('案件檔超過大小上限。');const parsed=parseCase(await selected.text());if(request.current===id)setFile({...parsed,filename:selected.name});}catch(e){if(request.current===id)setMessage(e.message+' 目前輸入保留。');}finally{if(request.current===id)setBusy(false);}}
 return <div className="case-file-controls"><div className="case-file-buttons"><button type="button" onClick={()=>{try{backup();}catch(e){setMessage(e.message);}}}>下載案件檔</button><button type="button" disabled={busy} onClick={()=>input.current?.click()}>{busy?'正在檢查案件檔':'匯入案件檔'}</button><input ref={input} type="file" accept=".json,.sanze.json,application/json" aria-label="選擇三策案件檔" hidden onChange={read}/></div>{message&&<p role="status">{message}</p>}{file&&<ImportPreview file={file} rules={d.rules} onBackup={backup} onClose={()=>setFile(null)} onApply={d.importCase}/>}</div>;
}
