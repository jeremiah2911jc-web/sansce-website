import {bonusLimitIssues} from './planning-input-review.mjs';

// These controls edit existing calculator inputs; no caps or quantities are inferred.
export function BonusLimits({input,edit}){
 const p=input.regulatoryReview,a=p?.bonusAssessment;if(!p)return null;
 const renewal=!a||a.route==='renewal',tdr=!a||Number(input.tdr)>0||a.tdrMode==='detail';
 if(!renewal&&!tdr)return null;
 const errors=bonusLimitIssues({...input,regulatoryReview:{...p,renewalLimitPercent:'',tdrLimitPercent:''}}),change=patch=>edit({regulatoryReview:{...p,...patch}});
 const field=(key,label,required)=> <label className="le-field" key={key}><span>{label.replace(/%([（(].*[）)])?$/,'$1')}{required&&<small>必填</small>}</span><span className="le-number"><input aria-label={label} data-limit-key={key} type="number" min="0" step="any" placeholder="—" value={p[key]} onChange={e=>change({[key]:e.target.value})}/><span>%</span></span></label>;
 return <section className="le-bonus-limits" aria-label="獎勵與容移上限"><h3>獎勵與容移上限</h3><p>請填本次採用的上限，資格與適用條文仍須核對。個案合計上限有文件依據時再填。</p><div className="le-fields">
 {renewal&&field('renewalLimitPercent','本次都更路徑獎勵上限%',errors.some(e=>e==='都更獎勵上限未填'))}
 {tdr&&field('tdrLimitPercent','本次容移上限%',errors.some(e=>e==='容移上限未填'))}
 {field('totalBonusLimitPercent','個案獎勵及容移合計上限%（無資料留白）',false)}
 </div>{!a&&<details><summary>既有方案容移評點</summary><div className="le-fields">{[['tdrBasePoints','容移基準量評點%（未核對可留白）'],['tdrInternalPoints','基地內部條件評點%'],['tdrExternalPoints','外部改善評點%'],['cashTdrPercent','折繳代金占可移入總量比例%']].map(([key,label])=>field(key,label,false))}</div><label className="le-check"><input type="checkbox" checked={p.renewalArea} onChange={e=>change({renewalArea:e.target.checked})}/>依法劃定更新地區加計0.3倍（須核對適用範圍）</label></details>}<details><summary>上限適用依據</summary><label className="le-field"><span>上限、評點及特殊適用依據</span><textarea aria-label="上限、評點及特殊適用依據" value={p.bonusSource} onChange={e=>change({bonusSource:e.target.value})}/></label></details></section>;
}
