import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {useFieldLocation,FieldLocationNotice} from './FieldLocation.jsx';
import {publicText} from './public-copy.mjs';
import {OfficialSources} from './OfficialSources.jsx';
import {JudgementPanel} from './JudgementPanel.jsx';
import {readjustmentJudgement} from './judgement.mjs';
import {useResultMotion} from './ResultMotion.jsx';
import {useDraftState} from './LocalDraft.jsx';
import {EvaluationDelivery} from './EvaluationDelivery.jsx';
import {readjustmentDelivery} from './delivery-model.mjs';
import {useEffect,useState,useRef} from 'react';
import {PublicSelect} from './PublicSelect.jsx';
import {localCatalog} from './generated/land.mjs';
import {systems,perspectives,stages,targets,evidenceStates,sources,publishedPlans,getPublishedPlan,documentItems,newReadjustmentPlan,evaluateReadjustment,readjustmentSignature,READJUSTMENT_VERSION,REVIEWED_AT,publicationStates} from './generated/readjustment.mjs';
import './readjustment.css';
import {SupplementaryFields} from './SupplementaryFields.jsx';
import {readjustmentNameForTrack} from './readjustment-names.mjs';
import {StatutoryFields,ConsentFields} from './StatutoryFields.jsx';
const format=n=>n===null||n===undefined?'待確認':n.toLocaleString('zh-TW',{maximumFractionDigits:3});
const editionLabel=e=>/文件索引/.test(e.label)?'官方文件（適用公告待核對）':e.label;
const stateLabels={pending:'待確認',recorded:'已記錄依據',review:'專案覆核',blocked:'條件不成立'};
function Field({label,value,change,type='text',wide=false}){const props={'aria-label':label,value,onChange:e=>change(e.target.value),...(type==='date'?{onInput:e=>change(e.currentTarget.value)}:{}),autoComplete:'off'};return <label className={'le-field'+(wide?' lw-wide':'')}><span>{label}</span>{wide?<textarea {...props}/>:<input {...props} type={type} {...(type==='number'?{min:0,step:'any'}:{})}/>}</label>;}
function Choice({label,value,options,change,placeholder}){return <label className="le-field"><span>{label}</span><PublicSelect aria-label={label} value={value} onChange={e=>change(e.target.value)}>{placeholder&&<option value="">{placeholder}</option>}{Object.entries(options).map(([key,text])=><option key={key} value={key}>{publicText(text)}</option>)}</PublicSelect></label>;}
function Evidence({title,detail,value={},change}){return <EvaluationDisclosure className="ra-evidence"><summary>{title} · {evidenceStates[value.state]??'待確認'}</summary><p>{detail}</p><div className="lw-fields"><Choice label={title+'核對狀態'} value={value.state??'pending'} options={evidenceStates} change={state=>change({...value,state})}/><Field label={title+'查證日期'} value={value.date??''} type="date" change={date=>change({...value,date})}/><Field label={title+'依據、頁次與適用範圍'} value={value.source??''} change={source=>change({...value,source})} wide/></div></EvaluationDisclosure>;}
export function ReadjustmentWorkbench({land,onLand,onLandDraft,initialTrack='owner',itemsValue,activeValue,onItemsChange,onActiveChange}){
 const workRoot=useRef(null),fieldLocation=useFieldLocation(workRoot);
 const [search,setSearch]=useDraftState('readjustment.search',''),[scope,setScope]=useDraftState('readjustment.scope','active');
 const [city,setCity]=useDraftState('readjustment.city','新北市'),[system,setSystem]=useDraftState('readjustment.system','public'),[catalogId,setCatalogId]=useDraftState('readjustment.catalogId',''),[editionId,setEditionId]=useDraftState('readjustment.editionId',''),[ownItems,setOwnItems]=useDraftState('readjustment.items',[]),[ownActive,setOwnActive]=useDraftState('readjustment.active',''),[message,setMessage]=useState(''),[remove,setRemove]=useState(false);
 const [manualName,setManualName]=useState(''),[creationTrack,setCreationTrack]=useState(null);
 const track=creationTrack??(initialTrack==='acquisition'?'acquisition':'owner');
 const items=itemsValue??ownItems,active=activeValue??ownActive,setItems=onItemsChange??setOwnItems,setActive=onActiveChange??setOwnActive;
 const entry=publishedPlans.find(x=>x.id===catalogId),edition=entry?.versions.find(x=>x.id===editionId),item=items.find(x=>x.input.id===active),p=item?.input;
 const result=p?evaluateReadjustment(p,land):null,signature=p?readjustmentSignature(p,land):'',published=p?getPublishedPlan(p.catalogId,p.catalogVersion):null;const resultMotion=useResultMotion(signature);
 const update=patch=>{setItems(xs=>xs.map(x=>x.input.id===active?{...x,input:{...x.input,...patch}}:x));setMessage('');};
 const edit=(key,value)=>update(key==='track'?{track:value,name:readjustmentNameForTrack(p,value)}:{[key]:value});
 useEffect(()=>{
  if(!p||readjustmentNameForTrack(p)===p.name)return;
  setItems(xs=>xs.map(x=>x.input.id===active?{...x,input:{...x.input,name:readjustmentNameForTrack(x.input)}}:x));
 },[active,p?.name,p?.track,p?.system,p?.planName,setItems]);
 const filtered=publishedPlans.filter(x=>x.city===city&&x.system===system&&(scope==='all'||x.assessmentReview?.scope===scope)&&[publicText(x.name),x.name,x.district,...(x.aliases??[])].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 function create(manual=false){
  if(items.length>=30){setMessage('已達30個評估方案，既有資料保留。');return;}
  if(manual&&!manualName.trim())return;
  if(!manual&&(!entry||!edition))return;
  const input=newReadjustmentPlan(crypto.randomUUID(),system);
  input.referenceDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  input.track=track;
  input.planName=manual?manualName.trim():entry.name;
  input.name=readjustmentNameForTrack(input);
  if(!manual)Object.assign(input,{catalogId:entry.id,catalogVersion:edition.id,authority:entry.authority});
  setItems(xs=>[...xs,{input,history:[]}]);
  setActive(input.id);
  if(manual)setManualName('');
  setMessage('');
  fieldLocation.locate({heading:'地號與納入範圍'});
 }
 function confirm(){if(!result?.canRecord)return;if(item.history.some(s=>s.signature===signature)){setMessage('本次條件已有核對結果。');return;}if(item.history.length>=20){setMessage('本方案已達20個本次核對版本。');return;}const snap={id:crypto.randomUUID(),confirmed:result.canConfirm,signature,input:structuredClone(p),result:structuredClone(result),context:structuredClone(land),published:structuredClone(published),createdAt:new Date().toISOString()};setItems(xs=>xs.map(x=>x.input.id===active?{...x,history:[...x.history,snap]}:x));setMessage(result.canConfirm?'已記錄本案採用的計畫公告、地號及分配面積。':'已保留待核結果；缺件及障礙仍列於本次結果。');}
 function draftLand(){const latest=item.history.at(-1);if(!latest?.confirmed||latest.signature!==signature||!result.canCreateLand){setMessage('確認前須核對納入地號與個別分配面積。');return;}onLandDraft({area:result.allocationArea,location:p.location,zone:p.zone,planName:p.planName,source:p.areaSource,date:p.areaDate,originalIds:p.parcelIds,scenarioId:p.id,version:READJUSTMENT_VERSION});}
 useEffect(()=>{const restore=e=>{if(e.persisted)setItems(items=>items.map(item=>({...item,history:[]})));};window.addEventListener('pageshow',restore);return()=>window.removeEventListener('pageshow',restore);},[]);
 return <div className="ra-workspace" ref={workRoot}>
  <section className="lw-section lw-first-step">
   <h2>查找公告計畫</h2>
   <p>依重劃或區段徵收計畫書、範圍圖及地號清冊核對土地納入範圍。</p>
   <div className="lw-fields ra-plan-search">
    <Field label="搜尋計畫名稱或行政區" value={search} change={v=>{setSearch(v);setCatalogId('');setEditionId('');}}/>
    <Choice label="公告計畫縣市" value={city} options={Object.fromEntries(localCatalog.map(x=>[x.city,x.city]))} change={v=>{setCity(v);setCatalogId('');setEditionId('');}}/>
    <Choice label="整體開發制度" value={system} options={systems} change={v=>{setSystem(v);setCatalogId('');setEditionId('');}}/>
    <Choice label="案件狀態範圍" value={scope} options={{active:'近期辦理中',tracking:'規劃與待查進度',all:'全部歷史資料'}} change={v=>{setScope(v);setCatalogId('');setEditionId('');}}/>
   </div>
   {filtered.length?<div className="lw-fields ra-plan-selection">
    <Choice label="已發布計畫" value={catalogId} placeholder="選擇計畫" options={Object.fromEntries(filtered.map(x=>[x.id,x.name+' · '+(x.assessmentReview?.stage??publicationStates[x.publicationState])]))} change={v=>{setCatalogId(v);setEditionId('');}}/>
    {entry&&<Choice label="公告版本" value={editionId} placeholder="選擇公告版本" options={Object.fromEntries(entry.versions.map(x=>[x.id,editionLabel(x)]))} change={setEditionId}/>}
   </div>:<p className="ra-search-empty" role="status">目前目錄沒有符合篩選條件的計畫。可切換案件狀態範圍，或手動輸入公告計畫。</p>}
   <div className="ra-plan-action">
    <Choice label="評估視角" value={track} options={perspectives} change={setCreationTrack}/>
    {entry&&<button type="button" className="le-primary" disabled={!edition} onClick={()=>create()}>建立本計畫評估</button>}
   </div>
   {entry&&edition&&<EvaluationDisclosure className="ra-selected-source"><summary>查閱所選公告版本</summary><PlanSources plan={{...entry,edition}}/></EvaluationDisclosure>}
   <EvaluationDisclosure className="ra-manual-plan">
    <summary>手動輸入公告計畫</summary>
    <p>依重劃或區段徵收計畫書填計畫名稱。建立方案後，再記錄公告文號或日期、範圍圖及地號清冊。</p>
    <Field label="公告計畫名稱" value={manualName} change={setManualName}/>
    <button type="button" className="le-primary" disabled={!manualName.trim()} onClick={e=>{if(items.length<30)e.currentTarget.closest('dialog')?.close();create(true);}}>建立手動評估方案</button>
   </EvaluationDisclosure>
  </section>
  {items.length>0&&<section className="lw-section"><h2>本次評估範圍</h2>
   {p&&<div className="ra-case-summary">
    <div><p>{systems[p.system]} · {perspectives[p.track]}</p><h3>{p.planName||'計畫名稱待填'}</h3><p>{published?.edition?editionLabel(published.edition):'手動輸入計畫條件'}</p></div>
    <EvaluationDisclosure><summary>方案管理</summary><div className="lw-fields">
     {items.length>1&&<Choice label="目前評估方案" value={active} options={Object.fromEntries(items.map(x=>[x.input.id,x.input.name]))} change={v=>{setActive(v);setRemove(false);setMessage('');}}/>}
     <Field label="評估方案名稱" value={p.name} change={v=>edit('name',v)}/>
     <Choice label="評估目的" value={p.track} options={perspectives} change={v=>edit('track',v)}/>
     <Field label="整體開發計畫名稱" value={p.planName} change={v=>edit('planName',v)}/>
    </div><button className="le-text-button" type="button" onClick={e=>{e.currentTarget.closest('dialog')?.close();setRemove(true);}}>移除目前評估方案</button></EvaluationDisclosure>
   </div>}
   {remove&&<div className="lw-message" role="alertdialog" aria-label="移除評估方案"><p>移除本方案及本次核對版本；共用土地與其他方案保留。</p><button className="le-secondary" onClick={()=>{const next=items.filter(x=>x.input.id!==active);setItems(next);setActive(next[0]?.input.id??'');setRemove(false);}}>確認移除評估方案</button><button className="le-text-button" onClick={()=>setRemove(false)}>取消移除</button></div>}
   {p&&<>
    <h3>地號與納入範圍</h3><p>依範圍圖與地號清冊核對納入面積，依土地登記謄本填持分。</p><div className="lw-first-actions"><button className="le-text-button" onClick={onLand}>查看土地用途與變更</button><OfficialSources city={published?.city??''}/></div>
    {land.parcels.length>0?<div className="lw-table"><table><thead><tr><th>納入</th><th>共用土地</th><th>登記面積（㎡）</th><th>查證狀態</th></tr></thead><tbody>{land.parcels.map((x,i)=><tr key={x.id}><td><input aria-label={'納入第'+(i+1)+'筆土地'} type="checkbox" checked={p.parcelIds.includes(x.id)} onChange={e=>edit('parcelIds',e.target.checked?[...p.parcelIds,x.id]:p.parcelIds.filter(id=>id!==x.id))}/></td><th>{[x.city,x.district,x.section,x.landNumber].filter(Boolean).join(' ')||'第'+(i+1)+'筆土地'}</th><td>{x.areaSqm||'待補'}</td><td>{x.status==='verified'?'資料已查證':'待核對／假設'}</td></tr>)}</tbody></table></div>:<p>本次尚無共用土地；可先填本案納入面積及依據，地號與範圍仍須查證。</p>}
    {land.parcels.filter(x=>p.parcelIds.includes(x.id)).map((parcel,index)=><ParcelRights key={parcel.id} parcel={parcel} index={index} value={p.parcelRights?.[parcel.id]??{}} result={result.parcelResults.find(x=>x.id===parcel.id)} change={value=>edit('parcelRights',{...p.parcelRights,[parcel.id]:value})}/>)}
    <div className="lw-fields">{!p.parcelIds.length&&<><Field label="本案納入面積（㎡）" value={p.manualArea} type="number" change={v=>edit('manualArea',v)}/><Field label="手動納入面積依據" value={p.manualSource} change={v=>edit('manualSource',v)}/><Field label="評估持分分子" value={p.shareNumerator} type="number" change={v=>edit('shareNumerator',v)}/><Field label="評估持分分母" value={p.shareDenominator} type="number" change={v=>edit('shareDenominator',v)}/></>}<Field label="納入範圍與持分依據" value={p.scopeSource} change={v=>edit('scopeSource',v)} wide/><Choice label="本案地號納入計畫範圍" value={p.membership} options={{unknown:'待查證',in:'依文件確認納入',out:'依文件確認不在範圍'}} change={v=>edit('membership',v)}/><Field label="納入範圍查證日期" value={p.membershipDate} type="date" change={v=>edit('membershipDate',v)}/><Field label="範圍圖、清冊與地號查證依據" value={p.membershipSource} change={v=>edit('membershipSource',v)} wide/></div>
    <EvaluationDisclosure className="ra-case-meta"><summary>辦理單位、階段及評估日期</summary><div className="lw-fields ra-plan-meta"><Field label="辦理單位／主管機關" value={p.authority} change={v=>edit('authority',v)}/><Choice label="本案辦理階段" value={p.stage} options={stages} change={v=>edit('stage',v)}/><Field label="評估基準日" value={p.referenceDate} type="date" change={v=>edit('referenceDate',v)}/></div></EvaluationDisclosure>
    {published&&<section className="ra-plan-conditions"><h3>公告書圖與適用條件</h3><EvaluationDisclosure><summary>本方案的計畫書圖與公告</summary><PlanSources plan={published}/></EvaluationDisclosure><p>逐項記錄本案適用、例外或不適用依據。</p>{published.edition.conditions.map(rule=><Evidence key={rule.id} title={rule.title} detail={rule.detail+'（'+rule.locator+'）'} value={p.planChecks[rule.id]} change={v=>edit('planChecks',{...p.planChecks,[rule.id]:v})}/>)}</section>}
   </>}
  </section>}
  {p&&<>
   <section className="lw-section"><h2>{p.track==='owner'?'地主權益與程序事項':'取得標的與權利承接'}</h2>
    {p.track==='owner'?<Field label="地主權益重點" value={p.ownerConcern} change={v=>edit('ownerConcern',v)} wide/>:<><p>依取得時點辨識實際標的；已領利益、資格與未履行義務不推定全部隨交易移轉。</p><div className="lw-fields"><Choice label="預定取得標的" value={p.target} options={targets} change={v=>edit('target',v)}/><Field label="預定取得日期" value={p.tradeDate} type="date" change={v=>edit('tradeDate',v)}/><Choice label="取得時點原土地權利" value={p.rightState} options={{unknown:'待確認',exists:'依文件仍存續',terminated:'依文件已終止'}} change={v=>edit('rightState',v)}/><Choice label="本次權利承接查核" value={p.transfer} options={{unknown:'待專案覆核',reviewed:'本案承接文件已覆核',blocked:'依本次條件不可承接'}} change={v=>edit('transfer',v)}/><Field label="已領款項、已辦移轉與待履行義務" value={p.handled} change={v=>edit('handled',v)} wide/></div></>}
    {p.system==='expropriation'&&<div className="lw-fields"><Choice label="本案補償選擇紀錄" value={p.compensationChoice} options={{unknown:'待確認',cash:'現金補償',land:'申請抵價地',mixed:'部分搭配'}} change={v=>edit('compensationChoice',v)}/><Choice label="抵價地申請狀態" value={p.applicationState} options={{unknown:'待確認',intended:'意向，程序可行性待核',applied:'已有申請紀錄',approved:'已有核定文件',closed:'原期間已屆滿／後續程序另核'}} change={v=>edit('applicationState',v)}/></div>}
    <EvaluationDisclosure><summary>程序、通知與本案待辦事項</summary><div className="lw-fields"><Field label="本案程序事項" value={p.events} change={v=>edit('events',v)} wide/><Field label="程序公告或通知依據" value={p.eventSource} change={v=>edit('eventSource',v)}/><Field label="程序事件日期" value={p.eventDate} type="date" change={v=>edit('eventDate',v)}/></div><p>保留實際公告、送達及申請紀錄；程序期間依下方條件試算，適用規定另核。</p></EvaluationDisclosure>
   </section>
   {p.system==='private'&&<section className="lw-section"><ConsentFields value={p.consentCalculation} result={result.consentResult} change={v=>edit('consentCalculation',v)} Field={Field} Choice={Choice}/></section>}
   <section className="lw-section"><h2>計畫公告、權屬及分配依據</h2><p>依各方案列出的計畫書、公告或分配清冊填名稱、日期及核對狀態。</p>{documentItems(p.system,p.track).map(x=><Evidence key={x.id} title={x.title} detail={publicText(x.detail)} value={p.evidence[x.id]} change={v=>edit('evidence',{...p.evidence,[x.id]:v})}/>)}</section>
   <section className="lw-section"><h2>分配面積與後續利用</h2><p>{p.system==='expropriation'?'抵價地比例為全區基準；個人面積依權利價值及配地單價換算。可核算本方案權利比例與面積，或對照抵價地分配結果清冊或分配通知書。':"全區平均負擔率供概估。個人應分配面積依土地分配清冊或分配通知書核對。"}</p>
    <div className="lw-fields"><Choice label="分配面積資料方式" value={p.allocationMode} options={{none:'尚無面積資料',...(p.system!=='expropriation'?{average:'平均負擔假設概估'}:{}),statutory:'法定公式核算',document:"文件面積或暫估面積"}} change={v=>edit('allocationMode',v)}/>
     {p.allocationMode==='average'&&<><Field label="假設平均負擔率（%）" value={p.burdenRate} type="number" change={v=>edit('burdenRate',v)}/><Field label="平均負擔假設依據" value={p.areaSource} change={v=>edit('areaSource',v)} wide/></>}
     {p.allocationMode==='document'&&<><Field label="本方案權利範圍分配面積（㎡）" value={p.area} type="number" change={v=>edit('area',v)}/><Choice label="分配面積性質" value={p.areaStatus} options={{assumed:"規劃假設",documented:'官方文件記載值'}} change={v=>edit('areaStatus',v)}/><Field label="分配清冊或通知書日期" value={p.areaDate} type="date" change={v=>edit('areaDate',v)}/><Field label="分配面積來源、頁次與權利範圍" value={p.areaSource} change={v=>edit('areaSource',v)} wide/></>}
     <Field label="本區最小分配面積（㎡，選填）" value={p.minimumArea} type="number" change={v=>edit('minimumArea',v)}/><Field label="最小分配適用街廓及依據" value={p.minimumSource} change={v=>edit('minimumSource',v)} wide/><Field label="分回位置或街廓" value={p.location} change={v=>edit('location',v)}/><Field label="分回土地使用分區" value={p.zone} change={v=>edit('zone',v)}/><Choice label="後續建築條件" value={p.buildability} options={{unknown:'待核對',conditional:'有文件，仍須逐項檢核',no:'目前目標的建築條件不成立'}} change={v=>edit('buildability',v)}/>
    </div>
    {p.allocationMode==='statutory'&&<StatutoryFields plan={p} result={result.statutoryResult} change={v=>edit('statutory',v)} Field={Field} Choice={Choice}/>}
   </section>
   <section {...resultMotion} className="lw-section ra-results result-motion"><div className="lw-section-top"><div><h2>本次條件核對</h2><p role="status">{result.status} · 文件依據 {result.recorded}／{result.documentCount}項 · 待確認 {result.pending}項 · 障礙 {result.blocked}項</p></div><button className={result.canConfirm?"le-primary":"le-secondary"} onClick={confirm} disabled={!result.canRecord}>{result.canConfirm?'確認本次核對結果':'保留待核結果'}</button></div>
    {result.errors.length>0&&<ul className="ra-errors" role="alert">{result.errors.map(x=><li key={x}>{publicText(x)}</li>)}</ul>}
    {!result.canConfirm&&<div className="lw-check-next"><strong>優先核對</strong>
     <button type="button" className="le-text-button" onClick={()=>fieldLocation.locate({heading:'地號與納入範圍'})}>地號與納入範圍</button>
     <button type="button" className="le-text-button" onClick={()=>fieldLocation.locate({label:'公告沿革與適用版本依據、頁次與適用範圍'})}>公告沿革與適用版本</button>
     <button type="button" className="le-text-button" onClick={()=>fieldLocation.locate({heading:p.track==='owner'?'地主權益與程序事項':'取得標的與權利承接'})}>個案權利資料</button>
    </div>}
    {[result.registeredArea,result.includedArea,result.rightsArea,result.allocationArea].some(Number.isFinite)&&
<div className={"ra-measures"+(p.parcelIds.length?" ra-four-measures":"")}>{p.parcelIds.length>0&&<div><span>納入地號登記面積合計</span><strong>{format(result.registeredArea)}<small>㎡</small></strong></div>}<div><span>本方案納入面積</span><strong>{format(result.includedArea)}<small>㎡</small></strong></div><div><span>持分換算權利範圍</span><strong>{format(result.rightsArea)}<small>㎡</small></strong></div><div><span>{publicText(result.areaLabel)}</span><strong>{format(result.allocationArea)}<small>㎡</small></strong></div></div>}
    <div className="lw-table"><table><thead><tr><th>核對項目</th><th>狀態</th><th>本案條件與缺件</th></tr></thead><tbody>{result.findings.map(x=><tr key={x.id}><th>{x.title}</th><td><span className={'ra-status ra-'+x.state}>{stateLabels[x.state]}</span></td><td>{publicText(x.detail)}</td></tr>)}</tbody></table></div>
    <FieldLocationNotice>{fieldLocation.notice}</FieldLocationNotice><JudgementPanel model={readjustmentJudgement(p,land,result)} onLocate={target=>target.module==='land'?onLand(target):fieldLocation.locate(target)}/>
    <EvaluationDelivery getSummary={()=>readjustmentDelivery(p,land,result)} charts={readjustmentDelivery(p,land,result).charts}/>
    {item.history.length>0&&<EvaluationDisclosure><summary>先前確認結果（{item.history.length}）</summary>{item.history.map(s=><section className="lw-frozen" key={s.id}><h3>{s.input.name} · {perspectives[s.input.track]}</h3><p>{s.confirmed?'本次文件核對已確認':'待核結果'} · {s.signature===signature?'來源與本次輸入一致':'來源或輸入已變更，保留當時結果'} · {new Date(s.createdAt).toLocaleString('zh-TW')}</p><p>{s.result.status} · {publicText(s.result.areaLabel)} {format(s.result.allocationArea)}㎡ · 待確認 {s.result.pending}項</p><EvaluationDisclosure><summary>採用文件與未完成事項</summary><p>{s.input.planName||'計畫名稱待填'} · {s.published?.edition.label||'依本案文件'}</p>{s.input.areaSource&&<p>面積依據：{s.input.areaSource}</p>}<ul>{s.result.findings.filter(x=>x.state!=='recorded').map(x=><li key={x.id}>{x.title}：{publicText(x.detail)}</li>)}</ul></EvaluationDisclosure></section>)}</EvaluationDisclosure>}
    <button className="le-secondary" disabled={!result.canCreateLand||!item.history.at(-1)?.confirmed||item.history.at(-1)?.signature!==signature} onClick={draftLand}>建立分回後土地草稿</button><p className="ra-footnote">核對地號清冊及分配清冊後，可另建分回土地草稿。分回地號、使用分區及建築管制依地籍資料與適用都市計畫核對。</p>
   </section>
  </>}
  {p&&<SupplementaryFields p={p} result={result} change={update} Field={Field} Choice={Choice}/>}
  {items.length>0&&<section className="lw-section"><h2>本次方案比較</h2><div className="lw-table"><table><thead><tr><th>方案</th><th>制度／主線</th><th>前次確認面積（㎡）</th><th>確認狀態</th></tr></thead><tbody>{items.map(x=>{const s=x.history.at(-1);return <tr key={x.input.id}><th>{x.input.name}</th><td>{systems[x.input.system]}／{perspectives[x.input.track]}</td><td>{format(s?.result.allocationArea)}</td><td>{!s?'尚無留存紀錄':s.signature!==readjustmentSignature(x.input,land)?'來源或輸入已變更':s.confirmed?'文件核對已確認':'待核結果'}</td></tr>;})}</tbody></table></div><p>不同制度、主線與替代方案各自比較，不合計為同一筆權利。</p></section>}
  {message&&<p className="lw-message" role="status">{message}</p>}

  <EvaluationDisclosure className="lw-section"><summary>市地重劃與區段徵收法規依據</summary><p>法規資料查核日：{REVIEWED_AT}</p>{sources.map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}</EvaluationDisclosure>
 </div>;
}
function ParcelRights({parcel,index,value:v,result,change}){
 const prefix='第'+(index+1)+'筆',set=(key,value)=>change({...v,[key]:value});
 return <section className="ra-parcel-rights"><div className="lw-section-top"><h4>{prefix} · {[parcel.section,parcel.landNumber].filter(Boolean).join(' ')||'土地範圍與持分'}</h4><p>登記 {parcel.areaSqm||'待補'}㎡ · 持分換算 {format(result?.rightsArea)}㎡</p></div><div className="lw-fields">
  <Field label={prefix+'納入面積（㎡）'} value={v.includedArea??''} type="number" change={value=>set('includedArea',value)}/><div className="ra-whole-parcel"><button type="button" className="le-secondary" disabled={!(Number(parcel.areaSqm)>0)} onClick={()=>set('includedArea',parcel.areaSqm)}>採本筆全筆登記面積</button><span>部分納入時，依計畫範圍圖及地號清冊填納入面積。</span></div>
  <Field label={prefix+'持分分子'} value={v.shareNumerator??''} type="number" change={value=>set('shareNumerator',value)}/><Field label={prefix+'持分分母'} value={v.shareDenominator??''} type="number" change={value=>set('shareDenominator',value)}/>
  <Field label={prefix+'範圍及持分查證日期'} value={v.date??''} type="date" change={value=>set('date',value)}/><Field label={prefix+'納入範圍與持分依據'} value={v.source??''} change={value=>set('source',value)}/>
 </div></section>;
}
const documentCategories={book:'計畫書',map:'計畫圖／範圍圖',urban:'都市計畫文件',notice:'公告／核定',amendment:'修正／更正（關係待核）',allocation:'分配與選配',other:'其他程序文件',source:'官方來源'};
function PlanSources({plan}){
 const e=plan.edition,isIndex=/文件索引/.test(e.label),[category,setCategory]=useState('all'),[limit,setLimit]=useState(12);
 const docs=e.documents.filter(d=>category==='all'||d.category===category);
 return <div className="ra-plan-source"><h3>{publicText(plan.name)}</h3><p>{plan.district} · {publicationStates[plan.publicationState]} · {editionLabel(e)}</p><p>{e.documentAudit?'各原件公告日期依下列紀錄':e.publishedAt?'公告日期 '+e.publishedAt:'公告日期待核對'} · 資料查核 {e.reviewedAt}</p>{isIndex?<p>計畫書、範圍圖與修正公告的適用關係待核對。</p>:<p>{e.noticeNo}。{e.coverage}</p>}
 {plan.assessmentReview&&<section className="ra-review"><h4>辦理進度與文件查證</h4><p>{plan.assessmentReview.stage} · 查核日期 {plan.assessmentReview.reviewedAt??'待確認'}</p><p>{plan.assessmentReview.progress}</p><dl><dt>計畫書</dt><dd>{plan.assessmentReview.book??'依歷史資料查詢；本次未重作最新版覆核。'}</dd><dt>計畫圖</dt><dd>{plan.assessmentReview.map??'個別圖面及範圍另核。'}</dd><dt>修正及後續公告</dt><dd>{plan.assessmentReview.revision??'後續沿革另核。'}</dd></dl>{!plan.assessmentReview.latestVerified&&<p>最新完整書圖及修正沿革尚待確認；本案查證完成前保留待核狀態。</p>}</section>}
 {e.documentAudit&&<section className="ra-review"><h4>本版書圖核對紀錄</h4><p>查核日期 {e.documentAudit.reviewedAt}。核對範圍列至原件頁次；完整修正沿革仍待確認。</p><ul>{e.documentAudit.facts.map((f,i)=><li key={i}>{f}</li>)}</ul><EvaluationDisclosure><summary>尚缺的計畫書圖與公告（{e.documentAudit.gaps.length}）</summary><ul>{e.documentAudit.gaps.map((f,i)=><li key={i}>{f}</li>)}</ul></EvaluationDisclosure></section>}
 {plan.evidenceRows?.length>0&&<EvaluationDisclosure><summary>官方名單與歷史日期依據（{plan.evidenceRows.length}）</summary>{plan.evidenceRows.map((r,i)=><p key={i}><a href={r.url} target="_blank" rel="noreferrer">{r.dataset} · 第{r.row??'—'}筆</a>：{publicText(r.sourceName??plan.name)}。{r.dateLabel} {r.date} {r.note}</p>)}</EvaluationDisclosure>}

 <EvaluationDisclosure><summary>計畫書、圖與後續公告（{e.documents.length}）</summary><Choice label="文件類別" value={category} options={{all:'全部文件',...documentCategories}} change={v=>{setCategory(v);setLimit(12);}}/><div className="lw-table"><table><thead><tr><th>文件／原始來源</th><th>類別</th><th>核對進度</th></tr></thead><tbody>{docs.slice(0,limit).map((d,i)=><tr key={d.id??d.url+i}><th><a href={d.url} target="_blank" rel="noreferrer">{d.title}</a>{d.sourcePage&&<small> · <a href={d.sourcePage} target="_blank" rel="noreferrer">來源頁</a></small>}</th><td>{documentCategories[d.category]??'原始文件'}</td><td>{d.category==='source'?(d.reviewState==='page-checked'?'已核對官方網頁紀錄；原件另核':'官方來源已定位，個別原件另核'):d.httpStatus&&d.httpStatus!=='200'?'官方附件失效／回應 '+d.httpStatus:d.retrieved?'已取得原件；'+(d.readability??'內容適用待核'):'來源已定位，原件及適用待核'}{d.locator&&<p>核對位置：{d.locator}</p>}{d.reviewNote&&<p>{d.reviewNote}</p>}{d.pages&&<small> · {d.pages}頁</small>}</td></tr>)}</tbody></table></div>{docs.length>limit&&<button className="le-text-button" onClick={()=>setLimit(x=>x+20)}>再顯示20筆（尚有{docs.length-limit}筆）</button>}</EvaluationDisclosure>
 {e.events.map(x=><p key={x.label}><strong>{x.label}：</strong>{x.start} 至 {x.end}。{x.detail}</p>)}
 </div>;
}
