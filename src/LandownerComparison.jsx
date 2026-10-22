import {trackInteraction} from './interaction-tracking.js';
import {useState,useRef,useEffect} from 'react';
import {Plus,X} from 'lucide-react';
import {positive,calculateProposal,compareProposals} from './landowner-calculation.mjs';
import './landowner-comparison.css';
import {emptyOffer,landownerExamples} from './landowner-examples.mjs';

const fmt=n=>n.toLocaleString('zh-TW',{maximumFractionDigits:2});
const range=(lo,hi)=>Math.abs(lo-hi)<1e-8?fmt(lo):`${fmt(lo)}～${fmt(hi)}`;
export {default as ExampleGraphic} from './ProposalAreaDrawing.jsx';
import ExampleGraphic from './ProposalAreaDrawing.jsx';
function NumberField({id,label,value,onChange,unit='%',hint,placeholder}) {
 return <label className="lc-field" htmlFor={id}><span>{label}</span><div className="lc-input"><input id={id} type="number" inputMode="decimal" min="0" step="any" value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} aria-describedby={hint?id+'-hint':undefined}/><span>{unit}</span></div>{hint&&<small id={id+'-hint'}>{hint}</small>}</label>;
}
function SelectField({id,label,value,onChange,children}) {
 return <label className="lc-select" htmlFor={id}><span>{label}</span><select id={id} value={value} onChange={e=>onChange(e.target.value)}>{children}</select></label>;
}
function DevelopmentFields({id,offer,onChange}) {
 const d=offer.development,split=offer.mode==='ratio'&&offer.distribution==='separate';
 const edit=(key,value)=>onChange({...offer,development:{...d,[key]:value,...(key==='method'?{bonus:''}:{})}});
 return <fieldset className="lc-development"><legend>提案開發面積與估算依據</legend>
  <SelectField id={id+'-source'} label="開發面積資料來源" value={d.source} onChange={v=>edit('source',v)}><option value="far">有容積資料，用來估算建坪</option><option value="area">已有建築師提供的全案面積表</option></SelectField>
  {d.source==='area'?<>
   <p className="lc-inline-note">面積表與土地面積須對應同一個基地。依個人土地持分換算面積條件；不代替個別權利價值估價。</p>
   <NumberField id={id+'-site-land'} label="面積表對應的全基地土地面積" unit="坪" value={d.siteLand} onChange={v=>edit('siteLand',v)}/>
   {split?<><p className="lc-inline-note">分開分配需要三部分各自的建坪，不能只填全案總數。沒有的項目經確認後填0。</p>{[['baseArea','基本容積對應的全案建坪'],['bonusArea','獎勵對應的全案建坪'],['transferArea','移轉對應的全案建坪']].map(([key,label])=><NumberField key={key} id={id+'-'+key} label={label} unit="坪" value={d[key]} onChange={v=>edit(key,v)}/>)}</>:<NumberField id={id+'-sale-area'} label="全案含公設、車位另計的建坪" unit="坪" value={d.saleArea} onChange={v=>edit('saleArea',v)}/>}
  </>:<>
   <div className="lc-choice" role="group" aria-label={id==='a'?'提案A的容積資料填寫方式':'提案B的容積資料填寫方式'}><button type="button" aria-pressed={d.basis==='parts'} onClick={()=>edit('basis','parts')}>分項填容積</button><button type="button" aria-pressed={d.basis==='total'} disabled={split} onClick={()=>edit('basis','total')}>已有總容積率</button></div>
   {split&&<p className="lc-inline-note">獎勵與移轉分開分配，需要分項容積資料。</p>}
   {d.basis==='total'?<NumberField id={id+'-total'} label="已包含獎勵與移轉的總容積率" value={d.total} onChange={v=>edit('total',v)} placeholder="例如405" hint="直接採用這個總數，不會再加一次獎勵或移轉。"/>:<>
    <SelectField id={id+'-method'} label="這個提案的重建方式" value={d.method} onChange={v=>edit('method',v)}><option value="urban">都市更新</option><option value="old">危老重建</option></SelectField>
    <NumberField id={id+'-base'} label="基本容積率" value={d.base} onChange={v=>edit('base',v)} placeholder="例如225"/>
    <NumberField id={id+'-bonus'} label={d.method==='old'?'危老申請的獎勵值':'都更申請的獎勵值'} value={d.bonus} onChange={v=>edit('bonus',v)} placeholder="例如50；確認沒有才填0" hint="填占基本容積的比例。例如基本225%、獎勵50%，增加的是112.5個容積率百分點。"/>
    <NumberField id={id+'-transfer'} label="容積移轉比例" value={d.transfer} onChange={v=>edit('transfer',v)} placeholder="例如30；確認沒有才填0" hint="同樣以基本容積為母數。預估申請量不等於核准量。"/>
   </>}
   <SelectField id={id+'-coefficient-mode'} label="容積換算建坪的係數來源" value={d.coefficientMode} onChange={v=>edit('coefficientMode',v)}><option value="estimate">還沒有，暫用1.6～1.7估算</option><option value="known">有，填入這個提案的銷售係數</option></SelectField>
   {d.coefficientMode==='known'&&<NumberField id={id+'-coefficient'} label="提案採用的銷售係數" unit="倍" value={d.coefficient} onChange={v=>edit('coefficient',v)} placeholder="例如1.65" hint="須對應含公設、車位另計的建坪，不能直接填公設比。"/>}
   <p className="lc-inline-note">1.6～1.7是估算假設，實際可能超出這個範圍。有面積表時，可改用上方「全案面積表」。</p>
  </>}
 </fieldset>;
}
function OfferFields({id,title,offer,onChange,onRemove}) {
 const ratio=offer.mode==='ratio',split=offer.distribution==='separate';
 const edit=(key,value)=>onChange({...offer,[key]:value});
 const setDistribution=v=>onChange({...offer,distribution:v,development:{...offer.development,...(v==='separate'?{basis:'parts'}:{})}});
 const component=key=>offer.development.source==='area'?Number(offer.development[key==='bonus'?'bonusArea':'transferArea']):Number(offer.development[key]);
 return <section className="lc-offer" aria-labelledby={id+'-title'}><div className="lc-section-label"><h2 id={id+'-title'}>{title}</h2>{onRemove&&<button type="button" onClick={onRemove} aria-label="移除提案B"><X size={18}/></button>}</div>
  <p>各自填寫，不會套用另一個提案的容積或分配條件。</p>
  <div className="lc-choice" role="group" aria-label={title+'的分配方式'}>{[['area','承諾分回幾坪'],['exchange','一坪土地換幾坪'],['ratio','按比例分回']].map(([mode,label])=><button key={mode} type="button" aria-pressed={offer.mode===mode} onClick={()=>onChange({...offer,mode,value:'',ratioKind:'',distribution:''})}>{label}</button>)}</div>
  <SelectField id={id+'-area-basis'} label="提案的坪數說法" value={offer.areaBasis} onChange={v=>edit('areaBasis',v)}><option value="">請確認坪數說法</option><option value="registered">含公設的建坪，車位另外計算</option><option value="interior">室內實坪</option><option value="unknown">還不確定／包含車位面積</option></SelectField>
  {offer.areaBasis&&offer.areaBasis!=='registered'&&<p className="lc-alert">室內實坪或含車位坪數，不能直接與這裡的建坪比較。請向提案方確認含公設、車位另計的數字。</p>}
  {ratio?<>
   <SelectField id={id+'-ratio-kind'} label="分配比例採計基準" value={offer.ratioKind} onChange={v=>edit('ratioKind',v)}><option value="">請確認比例的意思</option><option value="area">建物面積比例</option><option value="value">權利價值／房地價值比例</option><option value="unknown">還不確定</option></SelectField>
   {offer.ratioKind==='value'?<p className="lc-alert">價值比例需要估價、共同負擔及各戶選配資料。這份面積試算無法直接換算，請帶提案洽詢三策。</p>:offer.ratioKind==='area'&&<>
    <SelectField id={id+'-distribution'} label="各容積項目的分配約定" value={offer.distribution} onChange={setDistribution}><option value="">請核對提案或契約</option><option value="all">已確認：三部分都按同一比例分</option><option value="separate">已確認：三部分分開約定比例</option><option value="unknown">還沒確認，不能確定怎麼分</option></SelectField>
    {offer.distribution==='unknown'&&<p className="lc-alert">請確認六成等比例涵蓋哪些面積。未確認前，不推算這個提案的分回坪數。</p>}
    {['all','separate'].includes(offer.distribution)&&<>
     <DevelopmentFields id={id} offer={offer} onChange={onChange}/>
     <fieldset className="lc-distribution"><legend>{split?'各項地主分配比例':'地主分配比例'}</legend>
      <NumberField id={id+'-value'} label={split?'基本容積：地主分回比例':'全部建坪：地主分回比例'} value={offer.value} onChange={v=>edit('value',v)} placeholder="六成填60"/>
      {split&&<>{component('bonus')>0&&<NumberField id={id+'-bonus-share'} label="獎勵部分：地主分回比例" value={offer.bonusShare} onChange={v=>edit('bonusShare',v)} hint="全歸建商填0；按六成分填60。"/>}{component('transfer')>0&&<NumberField id={id+'-transfer-share'} label="移轉部分：地主分回比例" value={offer.transferShare} onChange={v=>edit('transferShare',v)} hint="全歸建商填0；按六成分填60。"/>}<p className="lc-inline-note">未填的分配比例不會當成0。若是固定坪數或其他特殊分法，可改填提案承諾的總建坪，或請三策協助確認。</p></>}
     </fieldset>
    </>}
   </>}
  </>:<>
   <NumberField id={id+'-value'} label={offer.mode==='area'?'對方承諾分回的總建坪':'每坪土地換回的建坪'} unit={offer.mode==='area'?'坪':'建坪／土地坪'} value={offer.value} onChange={v=>edit('value',v)} placeholder={offer.mode==='area'?'例如50':'例如2.5'}/>
   <label className="lc-check"><input id={id+'-derive'} type="checkbox" checked={offer.derive} onChange={e=>edit('derive',e.target.checked)}/><span>也想換算占開發面積的比例（需要這個提案的容積或面積表）</span></label>
   {offer.derive&&<DevelopmentFields id={id} offer={offer} onChange={onChange}/>}
   <p className="lc-inline-note">已知分回坪數可直接比較，不必補填不確定的容積。未反推時，面積比例會顯示未換算。</p>
  </>}
 </section>;
}
function Outcome({title,result,second}) {
 if(result.error)return <section className="lc-outcome"><h3>{title}｜待補資料</h3><p className="lc-alert">{result.error}</p><p className="lc-inline-note">條件未齊，不顯示推估面積，也不判斷哪個較多。</p><a className="lc-back-to-offer" href={second?"#b-title":"#a-title"}>返回這個提案補資料</a></section>;
 const base=result.base;
 return <section className={'lc-outcome'+(second?' lc-second':'')}><h3>{title}</h3><span className="lc-result-source">{result.certainty}</span><div className="lc-main-result"><span>{result.mode==='ratio'?'按這些條件換算的分回建坪':'提案承諾分回建坪'}</span><strong>{range(result.areaLow,result.areaHigh)}<small>坪</small></strong></div>
  <dl><div><dt>每坪土地換回</dt><dd>{range(result.exchangeLow,result.exchangeHigh)} 建坪</dd></div><div><dt>占這個提案開發面積</dt><dd>{result.ratioLow===null?'未換算':range(result.ratioLow*100,result.ratioHigh*100)+'%'}</dd></div></dl>
  {base&&<details className="lc-help lc-result-help"><summary>查看這個提案的計算依據</summary>{base.source==='far'?<><p>總容積率：{fmt(base.far*100)}%。銷售係數：{range(base.coefficientLow,base.coefficientHigh)}。</p><p>按個人持有的{fmt(result.land)}坪土地換算，分配前對應的開發面積為{range(base.areaLow,base.areaHigh)}建坪。</p>{base.components&&<p>容積率組成：基本{fmt(base.components.base*100)}%＋獎勵增加{fmt(base.components.bonus*100)}%＋移轉增加{fmt(base.components.transfer*100)}%。</p>}<p>{result.shares?'各部分容積面積分別乘地主比例，再以同一銷售係數換算建坪。':'依這個提案的開發面積及分配條件換算。'}</p></>:<p>全基地{fmt(base.siteLand)}坪，全案{fmt(base.totalSaleArea)}建坪；以個人持有的{fmt(result.land)}坪土地占比換算。</p>}{result.shares&&<p>地主分配比例：基本{fmt(result.shares.base*100)}%、獎勵{fmt(result.shares.bonus*100)}%、移轉{fmt(result.shares.transfer*100)}%。</p>}<p>面積比例以這個提案全部開發面積為分母，不是權利價值比例。實際分回仍須核對契約、估價與選配。</p></details>}
  {result.over&&<p className="lc-alert">反推比例超過100%，請核對建坪說法、容積與面積表；數字保留供核對，不代表條件已確認可行。</p>}
 </section>;
}
function Difference({comparison}) {
 if(!comparison)return null;
 return <div className="lc-difference"><h3>兩個提案的面積比較</h3>{comparison.kind==='equal'?<p>分回建坪相同</p>:comparison.kind==='overlap'?<><p>兩案範圍重疊，無法確定哪個較多</p><span>{comparison.low===0?`兩案可能相同，提案B也可能多${fmt(comparison.high)}坪。`:comparison.high===0?`兩案可能相同，提案A也可能多${fmt(-comparison.low)}坪。`:`依各案估算範圍，B可能少${fmt(-comparison.low)}坪，也可能多${fmt(comparison.high)}坪。`}取得更明確的規劃資料後才能縮小範圍。</span></>:<><p>{comparison.kind==='b-more'?'提案B':'提案A'}多 {range(comparison.low,comparison.high)} <small>坪</small></p><span>{comparison.low===comparison.high?'這是按兩案填寫的面積條件計算的差額。':'各案的規劃可能不同，差額包含兩案各自的估算範圍。'}</span></>}<span>只比較含公設、車位另計的面積；樓層價值、補款及交屋條件仍須一起核對。</span></div>;
}
export default function LandownerComparison(){
 const [land,setLand]=useState(''),[a,setA]=useState(emptyOffer),[b,setB]=useState(null),[result,setResult]=useState(null),[error,setError]=useState(''),[exampleName,setExampleName]=useState('');const resultsRef=useRef(null);
 useEffect(()=>{if(result)resultsRef.current?.scrollIntoView({behavior:'instant',block:'start'});},[result]);
 const changeA=v=>{setA(v);setResult(null);setError('');setExampleName('');},changeB=v=>{setB(v);setResult(null);setError('');setExampleName('');};
 const calculate=offer=>{try{return calculateProposal(land,offer);}catch(e){return {error:e.message};}};
 function submit(e){e.preventDefault();try{positive(land,'個人持分土地面積');const ra=calculate(a),rb=b?calculate(b):null;setResult({a:ra,b:rb,comparison:compareProposals(ra,rb)});if(!ra.error&&(!rb||!rb.error))trackInteraction('calculator_complete',b?'comparison':'single');setError('');}catch(e){setError(e.message);setResult(null);}}
 function example(id){const item=landownerExamples.find(e=>e.id===id);trackInteraction('calculator_example',id);setLand(item.land);setA(structuredClone(item.a));setB(structuredClone(item.b));setResult(null);setError('');setExampleName(item.title);requestAnimationFrame(()=>document.getElementById('lc-form-start')?.scrollIntoView({behavior:'instant',block:'start'}));}
 function reset(){setLand('');setA(emptyOffer());setB(null);setResult(null);setError('');setExampleName('');}
 return <div className="lc-page">
  <section className="wrap lc-hero"><div><p className="lc-eyebrow">地主分配試算與比較</p><h1>地主分配試算<br/>各案條件與分回面積比較</h1><p className="lc-lead">分回六成、一坪換幾坪，先確認各案所說的建坪包含哪些面積。<br/>每個提案的容積、獎勵與移轉分法，都可以分開填。</p></div></section>
  <section className="wrap lc-fill-help" aria-label="填寫協助"><p>坪數說法與分配約定的填寫說明，可由三策 AI 助理提供；需核對完整提案時，可洽詢顧問服務。</p><div><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('sanze:assistant-help',{detail:{question:'請帶我填寫地主試算頁，確認各提案的坪數說法及獎勵、移轉分配。'}}))}>詢問三策 AI 助理</button><a href="https://lin.ee/w8xSeSz" target="_blank" rel="noopener noreferrer">請三策專員協助</a></div></section>
  <div className="wrap lc-workspace"><form className="lc-form" onSubmit={submit} noValidate>
   <section id="lc-form-start" className="lc-base"><div className="lc-section-label"><h2>持分土地資料</h2><button type="button" className="lc-example" onClick={()=>{const examples=document.getElementById('lc-examples');examples.open=true;examples.scrollIntoView({behavior:'instant',block:'start'});}}>看填寫範例</button></div><p className="lc-subtitle">{b ? '兩案比較同一位地主的土地。容積與分配約定在各提案下方填寫。' : '填寫自己的持分土地面積，並於下方輸入提案的容積與分配約定。'}</p>{exampleName&&<p className="lc-example-loaded" role="status">已帶入範例「{exampleName}」。以下是範例數字，可修改成自己的條件。</p>}<NumberField id="land-ping" label="個人持分土地面積" unit="坪" value={land} onChange={v=>{setLand(v);setResult(null);setError('');setExampleName('');}} placeholder="例如20"/>
    <details className="lc-help"><summary>平方公尺與持分土地坪數換算</summary><p>土地面積（平方公尺）×權利範圍×0.3025＝持分土地坪數。400㎡、持分1/20，就是6.05坪。多筆土地分別換算後相加；已是個人持有面積時，不再乘一次持分。</p></details>
   </section>
   <div className={`lc-offers-grid${b ? " has-comparison" : ""}`}><OfferFields id="a" title="提案A" offer={a} onChange={changeA}/>
   {b?<OfferFields id="b" title="提案B" offer={b} onChange={changeB} onRemove={()=>changeB(null)}/>:<button className="lc-add" type="button" onClick={()=>changeB(emptyOffer())}><Plus size={18}/>加入提案B</button>}</div>
   <div className="lc-actions"><button className="lc-submit" type="submit">查看比較結果</button><button className="lc-reset" type="button" onClick={reset}>清空</button></div>{error&&<p role="alert" className="lc-alert">{error}</p>}
  </form>
  <aside ref={resultsRef} className={`lc-results${result ? "" : " is-empty"}`} aria-label="試算結果"><div className="lc-results-heading"><p className="lc-eyebrow">各案依相同的建坪計算方式比較</p><h2>各案分回建坪與面積差額</h2><p>承諾坪數會直接換算；按比例分配則使用各案的開發條件。估算結果會標明依據。</p></div>
   {result?<div role="status" aria-live="polite"><div className={`lc-outcomes-grid${result.b ? " has-comparison" : ""}`}><Outcome title="提案A" result={result.a}/>{result.b&&<Outcome title="提案B" result={result.b} second/>}</div><Difference comparison={result.comparison}/></div>:<div className="lc-empty"><h3>{b ? '填妥後，查看分回坪數與兩案差額。' : '填妥提案條件後，查看分回坪數。'}</h3><p>可先試算一個提案；需要比較時，再加入提案B。</p></div>}
   <p className="lc-scope">本頁比較面積條件。土地持分換算不代替權利變換估價；申請容積、預估係數與承諾坪數，仍須核對適用規定、核准結果與契約。</p>
  </aside></div>
  <details id="lc-examples" className="wrap lc-examples lc-example-library"><summary><span>常見提案與填寫範例</span><span className="lc-library-toggle" aria-hidden="true" /></summary><div className="lc-example-library-content"><p className="lc-eyebrow">填寫情境與操作說明</p><h2 id="lc-examples-title">常見提案與填寫範例</h2><p className="lc-subtitle">以下都是假設範例。帶入會替換目前的數字，你可以修改成自己的條件，再按「查看比較結果」。</p><div className="lc-example-grid">{landownerExamples.map((item,i)=><article key={item.id} className={`lc-example-card lc-example-${item.id}`}>
 <div className="lc-example-cover"><div className="lc-example-category"><span>{['面積已知','開發條件不同','分配約定不同'][i]}</span><small>假設範例</small></div>{i===0&&<ExampleGraphic item={item}/>}</div>
 <div className="lc-example-reading"><h3>{item.title}</h3><p>{item.intro}</p>{i!==0&&<ExampleGraphic item={item} compact/>}{i!==0&&<dl className="lc-example-comparison">{item.result.split('｜').map(part=><div key={part}><dt>{part.split('：')[0]}</dt><dd>{part.split('：')[1]}</dd></div>)}</dl>}
 <details className="lc-help"><summary>範例填寫步驟</summary><ol>{item.steps.map(step=><li key={step}>{step}</li>)}</ol></details>
 <button type="button" onClick={()=>example(item.id)}>用這個例子開始</button></div>
 </article>)}</div></div></details>
  <section className="wrap lc-consult"><div><p className="lc-eyebrow">面積之外，也看實際利益</p><h2>樓層、補款與交屋條件</h2><p>獎勵或移轉的分配尚未確定、涉及權利價值、原容積保障、不同分區或特殊分法，請帶完整提案與三策討論。</p></div><a href="/contact">請三策協助核對條件</a></section>
  <section className="wrap lc-notes"><details><summary>計算方式與比較基準</summary><p>各案有自己的容積、銷售係數或面積表，不能把兩個提案都套進其中一家的數字。容積分項模式使用基本容積率×（1＋獎勵比例＋移轉比例）；兩個增加比例都以基本容積為母數，原容積等特殊情形需另外核對。</p><p>三部分採相同比例時，以全部開發面積計算；分開分配時，基本、獎勵及移轉各自乘地主約定比例，再加總。沒有的項目須確認為0，尚未確認的比例不代填。按容積拆算時，各部分使用同一個提案的銷售係數。</p><p>面積表必須是同一基地、含公設且排除另外計價車位的資料。只提供總面積，無法拆成不同分配比例；須取得分項面積。全案面積依土地持分比例換算，是這份面積比較的前提，不代表權利變換的分配權值。</p><p>兩個提案都有估算範圍時，差額採各自範圍交叉計算，範圍重疊就不判定哪案一定較多。坪數相同，也不代表房地價值或整體條件相同。</p></details></section>
 </div>;
}
