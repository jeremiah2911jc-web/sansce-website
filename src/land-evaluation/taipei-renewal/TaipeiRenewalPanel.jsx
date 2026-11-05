import {EvaluationDisclosure} from '../EvaluationDisclosure.jsx';
import {PublicSelect} from '../PublicSelect.jsx';
import {FieldLabel,PublicNumber} from '../PublicFields.jsx';
import {taipeiRenewalItems,newTaipeiRenewal,newTaipeiOldBuilding,reviewTaipeiRenewal,taipeiRenewalLaw,taipeiRenewalTable,renewalArticle65} from './model.mjs';
import './taipei-renewal.css';
const fmt=n=>Number.isFinite(n)?n.toLocaleString('zh-TW',{maximumFractionDigits:4}):'待補資料';
export function TaipeiRenewalPanel({assessment:a,context,change}){
 const m=a.taipei??newTaipeiRenewal(),set=patch=>change({taipei:{...m,...patch}}),edit=(id,patch)=>set({items:{...m.items,[id]:{...m.items[id],...patch}}});
 const review=reviewTaipeiRenewal(m,{...context,date:a.date,renewalQualification:a.renewalQualification,centralGreen:!!a.entries?.['u-green']?.choice&&a.entries?.['u-green']?.status!=='excluded'});
 const select=(label,key,options,value=m[key],onChange=v=>set({[key]:v}))=><label><FieldLabel>{label}</FieldLabel><PublicSelect aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</PublicSelect></label>;
 const condition=(label,key,value=m[key],onChange=v=>set({[key]:v}))=>select(label,key,[['unknown','待確認'],['yes','符合／已規劃'],['no','不符合']],value,onChange);
 const number=(label,key,value=m[key],onChange=v=>set({[key]:v}))=><label><FieldLabel>{label}</FieldLabel><PublicNumber type="number" min="0" step="any" aria-label={label} value={value} onChange={e=>onChange(e.target.value)}/></label>;
 const input=(label,key,type='text')=><label><FieldLabel>{label}</FieldLabel>{key==='source'?<textarea rows={3} aria-label={label} value={m[key]} onChange={e=>set({[key]:e.target.value})}/>:<input aria-label={label} type={type} value={m[key]} onChange={e=>set({[key]:e.target.value})}/>}</label>;
 const buildingField=(id,b,key,label,kind='number')=>kind==='condition'?(key==='elevator'?select(label,key,[['unknown','電梯資料待確認'],['yes','有電梯'],['no','無電梯']],b[key],v=>edit(id,{buildings:m.items[id].buildings.map(x=>x.id===b.id?{...x,[key]:v}:x)})):condition(label,key,b[key],v=>edit(id,{buildings:m.items[id].buildings.map(x=>x.id===b.id?{...x,[key]:v}:x)}))):kind==='text'?<label><FieldLabel>{label}</FieldLabel><input aria-label={label} value={b[key]} onChange={e=>edit(id,{buildings:m.items[id].buildings.map(x=>x.id===b.id?{...x,[key]:e.target.value}:x)})}/></label>:number(label,key,b[key],v=>edit(id,{buildings:m.items[id].buildings.map(x=>x.id===b.id?{...x,[key]:v}:x)}));
 return <section className="taipei-renewal" aria-label="臺北市地方都更獎勵">
  <h3>臺北市地方都更獎勵</h3>
  <p>依112年9月18日修正附表計算。報核日期沿用上方設定；舊案請核對原適用版本。查核日期：2026-11-02。</p>
  <p><a href={taipeiRenewalLaw} target="_blank" rel="noreferrer">地方辦法</a> · <a href={taipeiRenewalTable} target="_blank" rel="noreferrer">九項獎勵附表</a> · <a href={renewalArticle65} target="_blank" rel="noreferrer">條例第65條上限</a></p>
  <label className="taipei-enable"><input type="checkbox" checked={m.enabled} onChange={e=>set({enabled:e.target.checked})}/>加入臺北市地方獎勵細項</label>
  {m.enabled&&<>
   {a.renewalMode!=='detail'&&<p className="notice">上方都更取值方式仍為快速估算；改用「細項評定」後，才採用本區計算。</p>}
   <div className="taipei-fields">
    {select('地方獎勵適用方式','mode',[['general','一般案件：地方上限20%'],['strategy','策略性更新：符合條件加倍，地方上限40%'],['housing','第3條核定整建住宅：地方20%']])}
    {select('使用分區類型','zone',[['unknown','請選擇'],['residential','住宅區'],['commercial','商業區'],['other','其他分區']])}
    {select('本次資料狀態','evidence',[['estimate','依規劃條件估算，資格待核對'],['documented','已有文件記載'],['verified','已依文件與圖說核對']])}
    {input('地方獎勵文件名稱與圖說頁次','source')}{input('地方獎勵文件日期','sourceDate','date')}
   </div>
   <p>各項共用上述文件資料；不同文件可分行填寫名稱、日期與頁次。各項條件選「待確認」時，會列出待補資料。</p>
   {m.mode==='strategy'&&<div className="taipei-fields">
    {condition('已有第8條策略性更新地區劃定文件','strategyDistrict')}
    {condition('依第12條第1項方式辦理','publicMethod')}{number('更新單元面積（㎡）','unitArea')}
    {select('策略性更新總容積上限','capRoute',[['twoBase','基準容積2倍（獎勵上限100%）'],['originalPlusHalf','合法原容積加0.5倍基準容積']])}
    {m.capRoute==='originalPlusHalf'&&<>{number('合法原建築容積（㎡）','originalVolume')}{input('原容積合法性、範圍及文件依據','originalSource')}</>}
   </div>}
   {m.mode==='housing'?<>{condition('已有市府核定整建住宅更新單元文件','housingApproved')}<p>採第3條地方獎勵20%，本次不加計第2條附表九項獎勵。</p></>:
    <div className="bonus-item-list">{taipeiRenewalItems.map(item=>{const x=m.items[item.id],r=review.rows.find(row=>row.id===item.id);return <EvaluationDisclosure key={item.id} open={x.enabled}>
     <summary>{item.title} · {x.enabled?(r?.percent==null?'待補資料':fmt(r.percent)+'%'):'未選取'}</summary>
     <p>{item.rule}</p><label className="taipei-enable"><input type="checkbox" checked={x.enabled} onChange={e=>edit(item.id,{enabled:e.target.checked})}/>採用本項獎勵</label>
     {x.enabled&&<><div className="taipei-fields">{item.fields.map(field=><div key={field.key}>{field.type==='condition'?condition(field.label,field.key,x[field.key],v=>edit(item.id,{[field.key]:v})):number(field.label,field.key,x[field.key],v=>edit(item.id,{[field.key]:v}))}</div>)}</div>
      {item.id==='fund'&&<p>請依案件文件填入獎勵面積；經費、公告現值與提供條件可洽三策委託評估。</p>}
      {item.id==='old'&&<><p>每棟填寫不重疊的適用基地面積。無電梯可直接檢核；有電梯或電梯資料待查時，請填法定車位及戶數。</p>{x.buildings.map((b,i)=><fieldset key={b.id}><legend>第{i+1}棟</legend><div className="taipei-fields">
       {buildingField(item.id,b,'name','建物名稱','text')}{buildingField(item.id,b,'legal','合法建物資格','condition')}{buildingField(item.id,b,'age','合法建物屋齡（年）')}{buildingField(item.id,b,'floors','合法建物層數（層）')}{buildingField(item.id,b,'area','本棟適用且不重疊基地面積（㎡）')}{buildingField(item.id,b,'elevator','設有電梯','condition')}
       {b.elevator!=='no'&&<>{buildingField(item.id,b,'legalCars','本棟法定汽車位數')}{buildingField(item.id,b,'units','本棟戶數')}</>}
      </div><button type="button" className="secondary-btn" onClick={()=>edit(item.id,{buildings:x.buildings.filter(v=>v.id!==b.id)})}>移除此棟</button></fieldset>)}<button type="button" className="secondary-btn" onClick={()=>edit(item.id,{buildings:[...x.buildings,newTaipeiOldBuilding()]})}>新增建物</button></>}
      {r&&<p className="taipei-result">{r.basis} 獎勵{fmt(r.quantity)}㎡；{r.status}。</p>}
     </>}
    </EvaluationDisclosure>;})}</div>}
   {m.mode!=='housing'&&<>
    {m.items.design1.enabled&&m.items.design1.passage==='yes'&&m.items.walk.enabled&&<div className="taipei-fields">{select('通道與沿街人行空間的採用範圍','spaceMode',[['unknown','請確認範圍'],['distinct','分屬不同範圍，附圖說'],['design1','同一範圍採設計（一），設計（三）採0'],['design3','同一範圍採設計（三），通道不列設計（一）']])}</div>}
    {m.items.green.enabled&&!!a.entries?.['u-green']?.choice&&a.entries?.['u-green']?.status!=='excluded'&&<div className="taipei-fields">{select('地方綠化與中央綠建築的植栽範圍','greenMode',[['unknown','請確認植栽範圍'],['distinct','植栽範圍分開，附圖說'],['central','同批植栽採中央，地方本項採0']])}</div>}
    {(m.spaceMode==='distinct'||m.greenMode==='distinct')&&input('範圍分開劃設的圖說依據','separationSource')}
    <EvaluationDisclosure><summary>地方獎勵重複面積扣除</summary><p>填入尚未於各項計算扣除的重複獎勵面積。中央、地方或其他獎勵之間的重複，另在上方「同一事項重複獎勵扣除」填寫百分比。</p><div className="taipei-fields">{number('地方獎勵應扣除面積（㎡）','localDeduction')}{input('重複項目與扣除依據','deductionSource')}</div></EvaluationDisclosure>
   </>}
   {review.errors.length>0?<ul className="taipei-gaps" aria-label="臺北地方獎勵待補資料">{[...new Set(review.errors)].map(e=><li key={e}>{e}</li>)}</ul>:<p className="taipei-result" role="status">地方細項合計{fmt(review.raw)}%，{review.multiplier===2?'加倍後':''}採用{fmt(review.applied)}%（{fmt(review.base*review.applied/100)}㎡）；地方上限{review.localCap}%。</p>}
   <p>中央與地方都更獎勵合計，依本次路徑採{fmt(review.totalCap)}%上限。各項估算與最終核定額度，依案件文件分別確認。</p>
  </>}
 </section>;
}
