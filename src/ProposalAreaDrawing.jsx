import {useId} from 'react';
import {calculateProposal} from './landowner-calculation.mjs';
const fmt=n=>n.toLocaleString('zh-TW',{maximumFractionDigits:2});
const span=(a,b)=>Math.abs(a-b)<1e-8?fmt(a):`${fmt(a)}～${fmt(b)}`;
function Basis({offer,land}){
 if(offer.mode==='area')return <p>契約提案約定分回 <strong>{offer.value} 建坪</strong></p>;
 if(offer.mode==='exchange')return <p>土地 {land} 坪 × 每坪換回 <strong>{offer.value} 建坪</strong></p>;
 const d=offer.development;
 return <><p>基本容積 {d.base}% · 獎勵 {d.bonus}% · 移轉 {d.transfer}%</p><p>{offer.distribution==='separate'?`地主分配：基本 ${offer.value}%／獎勵 ${offer.bonusShare}%／移轉 ${offer.transferShare}%`:`地主分配 ${offer.value}%`}</p><p>容積換算建坪係數 {d.coefficientMode==='known'?d.coefficient:'1.6～1.7（估算假設）'}</p></>;
}
export default function ProposalAreaDrawing({item,compact=false}){
 const id=useId().replaceAll(':','');
 const values=[calculateProposal(item.land,item.a),calculateProposal(item.land,item.b)];
 const scale=154/Math.sqrt(Math.ceil(Math.max(...values.map(r=>r.areaHigh))/10)*10);
 if(compact)return <div className="proposal-condition-sheet"><p>持分土地 {item.land} 坪 · 同案分別計算</p><div className="proposal-basis">{[item.a,item.b].map((offer,i)=><div key={i}><h4>提案 {i===0?'A':'B'}</h4><Basis offer={offer} land={item.land}/></div>)}</div></div>;
 return <figure className={'proposal-area-drawing'+(compact?' is-compact':'')}>
  <figcaption><div><span>同一位地主・兩份提案</span><strong>持分土地 {item.land}<small> 坪</small></strong></div><span>含公設建坪<br/>車位另計</span></figcaption>
  <svg viewBox="0 0 600 310" role="img" aria-label={`同一土地持分${item.land}坪；提案A分回${span(values[0].areaLow,values[0].areaHigh)}坪，提案B分回${span(values[1].areaLow,values[1].areaHigh)}坪。圖形面積依相同比例繪製，虛線為估算上限，並非房屋格局。`}>
   <title>地主分回面積與提案依據</title>
   <defs><pattern id={id+'grid'} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth=".45" opacity=".15"/></pattern><pattern id={id+'hatch'} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V7" stroke="currentColor" strokeWidth=".65" opacity=".3"/></pattern></defs>
   <line x1="300" x2="300" y1="22" y2="290" stroke="currentColor" opacity=".2"/>
   {values.map((r,i)=>{const left=26+i*300,low=Math.sqrt(r.areaLow)*scale,high=Math.sqrt(r.areaHigh)*scale,cx=150+i*300,bottom=263,estimated=r.areaHigh>r.areaLow;return <g key={i}>
    <text x={left} y="29" fill="currentColor" fontSize="25">提案 {i===0?'A':'B'}</text><text x={left} y="66" fill="currentColor" fontSize="32" fontWeight="600">{span(r.areaLow,r.areaHigh)}<tspan fontSize="20"> 坪</tspan></text>
    <rect x={left} y="92" width="248" height="184" fill={'url(#'+id+'grid)'} opacity=".8"/>
    <rect x={cx-high/2} y={bottom-high} width={high} height={high} fill={'url(#'+id+'hatch)'} stroke="currentColor" strokeWidth="1.15" strokeDasharray={estimated?'5 4':undefined}/>
    <rect className={'proposal-plate proposal-plate-'+i} x={cx-low/2} y={bottom-low} width={low} height={low} fill="currentColor" fillOpacity={i===0?'.16':'.27'} stroke="currentColor" strokeWidth="1.25"/>
    <path d={`M${cx-high/2} ${bottom+12}H${cx+high/2}M${cx-high/2} ${bottom+8}v8M${cx+high/2} ${bottom+8}v8`} stroke="currentColor" strokeWidth=".9" opacity=".65"/>
    <text x={cx} y="302" textAnchor="middle" fill="currentColor" fontSize="19">{estimated?'實線：估算下限／虛線：上限':'提案約定面積'}</text>
   </g>})}
  </svg>
  <div className="proposal-basis">{[item.a,item.b].map((offer,i)=><div key={i}><h4>提案 {i===0?'A':'B'} 的計算條件</h4><Basis offer={offer} land={item.land}/></div>)}</div>
  <p className="proposal-drawing-note">圖形面積採相同比例，供比較建坪，並非房屋格局圖。{values.some(r=>r.areaHigh>r.areaLow)?'估算區間不代表核准量或交屋承諾。':'實際分回依契約及選配資料核對。'}</p>
 </figure>;
}
