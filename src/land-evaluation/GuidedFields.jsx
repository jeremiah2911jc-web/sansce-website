import {createContext,useContext,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {planningFields} from './generated/core.mjs';
import {isGuidedInput,defaultState,planningHelp,planningDefaultEntries} from './guided-input.mjs';
import {evidenceHelp} from './evidence-input.mjs';
import {PlanningDefaultValues} from './PlanningDefaultValues.jsx';
import {ReferenceDisclosure} from './DisclosureLayout.jsx';

const Context=createContext(null);
export function GuidedInputProvider({input,edit,children}){return <Context.Provider value={{input,edit}}>{children}</Context.Provider>;}
const byLabel={
 '本次獎勵適用依據':'都更可填更新單元劃定公告或都市更新事業計畫。危老可填使用執照、結構安全性能評估報告或主管機關限期拆除、補強通知。填寫所採名稱、日期或文號及適用範圍。',
 '容積移轉資格及適用上限依據':'填接受基地的土地使用分區證明書、建築線指定圖或道路開闢查詢結果。有容積移轉許可函時，填文號、日期及適用地號。',
 '獎勵範圍及扣除依據':'填圖說編號、各獎勵對應的事項或空間範圍，以及重複部分的扣除方式；涉及同一空間的細項須先核對。',
 '合法原建築容積依據':'填原建照、使用執照或竣工圖容積表的文號、日期及原容積面積；採原容積115%上限時必填。',
 '更新地區劃定公告與基地範圍':'填劃定更新地區的公告文號、日期與本案地號範圍；新北1.3倍評點須有這項依據。',
 '計畫道路寬度':'填都市計畫圖或建築線指定圖標示的計畫路寬。未填時，結果列出尚缺計畫道路寬度。',
 '實際開闢道路寬度':'填道路已開闢、可通行部分的寬度；依現況測量或主管機關資料確認。留白先列待查。',
 '同一路段基地面寬':'填本基地沿同一路段的臨路長度；依地籍圖、建築線或測量圖確認，留白先列待查。',
 '本次檢討道路名稱':'填基地臨接的道路名稱。計畫路寬、開闢路寬與面寬請使用同一路段。',
 '足寬開闢道路之連通':'依道路現況及圖資選擇；尚未查證保留待確認，初估結果會列出容移資格待查。',
 '路寬確認狀態':'尚未取得資料時選待確認；選已確認須附計畫路寬、來源與日期。',
 '路寬查證日期':'填查閱都市計畫圖、建築線指定圖或道路開闢查詢結果的日期。',
 '預計報核／申請日期':'新案預設今天，請改為預計送件日期；此日期會影響時程獎勵及申請期限。',
 '地下開挖適用分區':'依使用分區證明或都市計畫選擇；尚未選定時先採規劃開挖參考值，結果列明待查。',
 '都市計畫開挖規定':'查閱基地主要、細部計畫的地下開挖條文；尚未查證保留待確認，可先看規劃初估。',
 '地下配置檢討方式':'預設依停車需求比較配置與地下層數；有既定設計時可改為固定層數。',
 '地下設備梯間計入房屋公設':planningHelp.basementSalePercent,
 '都更適用資格':'依更新單元、實施措施及案件資料核對。未查證選待確認，先按目標獎勵估算；選不符合時不採該獎勵。',
 '危老法定適用資格':'依屋齡、合法建築及結構安全評估等資料核對；未取得資料先列待查，不符合時不採危老獎勵。',
 '容移接受基地、道路及移入資格':'依接受基地條件、道路及主管機關資料核對；未查證先按目標容移量估算，不符合時不採計。',
 '都市更新實施措施':'本頁試算重建量體；整建、維護使用其他評估方式。尚未選定時，先看重建目標的規劃初估。',
 '都市更新實施方式':'依本案計畫選權利變換、協議合建或公辦方式；尚未選定先列待查，方式限定的獎勵仍須個別核對。',
 '危老適用建築物條件':'依主管機關限期拆除或補強通知，或結構安全性能評估報告所載情形選擇。',
 '危老全體所有權人同意':'依重建計畫範圍內土地及合法建築物全體所有權人的重建計畫同意書選擇。',
 '危老基本獎勵上限方式':'預設按基準容積130%核算。採合法原建築容積115%時，填原建築容積面積及建造執照、使用執照或竣工圖所載依據。',
 '快速估算是否含危老規模獎勵':'預設不另計規模獎勵；已核對原基地及鄰地面積後，可改為計入規模獎勵。',
 '獎勵重複範圍核對':'依圖說標示各獎勵的事項及空間範圍；同一事項須填扣除比例。涉及重複空間的細項會要求先核對。',
 '更新前門牌戶數':'依更新前合法建物的門牌資料填戶數；協議合建獎勵須達20戶並符合全體同意條件。',
 '法定最低綠建築等級':'依適用法規及個案計畫選擇；申請獎勵的等級須高於法定最低等級。',
 '較嚴格開挖率':'填個案都市計畫規定的較小開挖比例；沒有另訂規定可留白，沿用地區規則。',
 '個案地面配置面積上限':'有平面配置時填可用範圍；留白暫採規劃建築面積，退縮、綠化與法定空地仍須核對。',
};
export function fieldHelp(label,key){
 const clean=label.replace(/[㎡%]|m$/g,'').trim();
 if(planningHelp[key])return planningHelp[key];
 if(byLabel[clean])return byLabel[clean];
 if(/來源|依據|適用法令|圖資量測/.test(clean))return evidenceHelp+' 尚未取得資料可留白列待查；選擇已確認或個案規定時須填具體依據。';
 if(/申請條件$/.test(clean))return '依該項獎勵列出的法定條件選擇。選擇不符合時，本項獎勵不計入。';
 return '';
}
function guidanceKey(label,fieldKey){
 const aliases={basementReservePercent:'quantity.basementReservePercent'};
 return aliases[fieldKey]??fieldKey??({'一般方案地下層高（設備另檢查） m':'parking.floorHeight','一般方案地下層高（設備另檢查）':'parking.floorHeight','柱網及轉彎額外預留 %':'parking.loss','柱網及轉彎額外預留':'parking.loss','都更快速目標':'renewal','容移快速目標':'tdr','危老快速目標':'danger','預計報核／申請日期':'bonus.date'})[label.replace(/%$/,'')]??planningFields.find(([,name])=>name===label)?.[0];
}
export function FieldState({label,fieldKey}){
 const context=useContext(Context);if(!context)return null;
 const key=guidanceKey(label,fieldKey),state=key?defaultState(context.input,key):'';
 return state?<em className="le-field-state">{state}</em>:null;
}
export function FieldGuidance({label,fieldKey,help:customHelp}){
 const context=useContext(Context),[open,setOpen]=useState(false),[position,setPosition]=useState(null);
 const trigger=useRef(null),panel=useRef(null),id=useId();
 const help=customHelp??fieldHelp(label,guidanceKey(label,fieldKey));
 const close=(restore=false)=>{setOpen(false);if(restore)trigger.current?.focus();};
 useLayoutEffect(()=>{
  const fieldLabel=trigger.current?.closest('label'),control=fieldLabel?.querySelector('input:not([type=hidden]),select,textarea');
  if(!control)return;
  if(!control.id)control.id=id+'-field';
  fieldLabel.htmlFor=control.id;
  if(!control.getAttribute('aria-label'))control.setAttribute('aria-label',label);
 },[id,label]);
 useLayoutEffect(()=>{
  if(!open||!trigger.current||!panel.current)return;
  const place=()=>{
   const anchor=trigger.current,popover=panel.current;
   const dialog=anchor.closest('dialog');
   const content=anchor.closest('.le-disclosure-window-content')??dialog;
   const bounds=content?.getBoundingClientRect()??{left:0,top:0,right:window.innerWidth,bottom:window.innerHeight};
   const r=anchor.getBoundingClientRect();
   if(r.bottom<=bounds.top||r.top>=bounds.bottom){close();return;}
   const padding=12,gap=10;
   popover.style.maxWidth=Math.max(0,bounds.right-bounds.left-2*padding)+'px';
   popover.style.maxHeight=Math.max(0,bounds.bottom-bounds.top-2*padding)+'px';
   const {offsetHeight:height,offsetWidth:width}=popover;
   const below=r.bottom+gap,above=r.top-height-gap;
   const fitsBelow=below+height<=bounds.bottom-padding;
   const fitsAbove=above>=bounds.top+padding;
   let left=Math.max(bounds.left+padding,Math.min(r.left,bounds.right-width-padding));
   let preferredTop=fitsBelow?below:above;
   if(!fitsBelow&&!fitsAbove){
    preferredTop=r.top;
    if(r.right+gap+width<=bounds.right-padding)left=r.right+gap;
    else if(r.left-gap-width>=bounds.left+padding)left=r.left-gap-width;
   }
   const top=Math.max(bounds.top+padding,Math.min(preferredTop,bounds.bottom-height-padding));
   const frame=dialog?.getBoundingClientRect();
   setPosition({
    left:left-(frame?frame.left+dialog.clientLeft:0),
    top:top-(frame?frame.top+dialog.clientTop:0),
    position:dialog?'absolute':'fixed',
   });
  };
  place();window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
  return()=>{window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);};
 },[open,help]);
 useEffect(()=>{
  if(!open)return;
  const dismiss=e=>{if(!trigger.current?.contains(e.target)&&!panel.current?.contains(e.target))close();};
  const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();close(true);}};
  const another=e=>{if(e.detail!==id)close();};
  document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',keyboard);document.addEventListener('sanze-field-help-open',another);
  return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',keyboard);document.removeEventListener('sanze-field-help-open',another);};
 },[open]);
 if(!context||!help)return null;
 return <><button ref={trigger} type="button" className="le-help-trigger" aria-label={label+'填寫說明'} aria-expanded={open} aria-controls={open?id:undefined} onClick={e=>{e.preventDefault();e.stopPropagation();if(!open)document.dispatchEvent(new CustomEvent('sanze-field-help-open',{detail:id}));setPosition(null);setOpen(v=>!v);}}>?</button>{open&&createPortal(<aside ref={panel} id={id} role="note" aria-label={label+'填寫說明'} className="le-help-popover" style={{...position,visibility:position?'visible':'hidden'}}><div className="le-help-heading"><strong>{label}</strong><button type="button" aria-label="關閉填寫說明" onClick={()=>close(true)}>關閉</button></div><p>{help}</p></aside>,trigger.current?.closest('dialog')??document.body)}</>;
}
export function PlanningDefaultsIntro({input,onApply,onEdit,showAwardFields}){
 if(!isGuidedInput(input))return <section className="le-planning-start" aria-label="規劃預設值"><p>空白的規劃欄位可採用參考值。</p><button type="button" className="le-text-button" onClick={onApply}>採用規劃參考值</button></section>;
 const rows=planningDefaultEntries(input).filter(([, ,key])=>showAwardFields||!['renewal','danger','tdr'].includes(key));
 if(showAwardFields&&defaultState(input,'bonus.date')==='預設值')rows.unshift(['預計報核／申請日期',input.regulatoryReview.bonusAssessment.date,'bonus.date']);
 return <section className="le-planning-start" aria-label="規劃預設值">
  <p>規劃預設值供初估，可依基地現況及預計配置調整。</p>
  <ReferenceDisclosure title="修正預設值" actionLabel="開啟"><PlanningDefaultValues rows={rows} onEdit={onEdit}/></ReferenceDisclosure>
 </section>;
}
