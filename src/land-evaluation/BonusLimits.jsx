import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {dangerLegalCap} from './bonus-eligibility.mjs';
import {statutoryBonusLimits,bonusLimitMode,dangerLaw} from './statutory-bonus-limits.mjs';

export function BonusLimits({input,edit,review}){
 const p=input.regulatoryReview,a=p?.bonusAssessment;if(!p)return null;
 const limits=statutoryBonusLimits(input),mode=bonusLimitMode(input,limits),document=mode==='document';
 const renewal=!a||a.route==='renewal',danger=a?.route==='danger',tdr=!a||Number(input.tdr)>0||a.tdrMode==='detail';
 if(!renewal&&!danger&&!tdr)return null;
 const change=patch=>edit({regulatoryReview:{...p,...patch}});
 const field=(key,label)=> <label className="le-field" key={key}><span>{label.replace(/%([（(].*[）)])?$/,'$1')}</span><span className="le-number"><input aria-label={label} data-limit-key={key} type="number" min="0" step="any" placeholder="—" value={p[key]} onChange={e=>change({[key]:e.target.value})}/><span>%</span></span></label>;
 const row=(label,value,source,title)=><div key={label}><dt>{label}</dt><dd><output aria-label={label}>{value}</output>{source&&<a href={source} target="_blank" rel="noreferrer">{title}</a>}</dd></div>;
 const bonus=review?.regulatory?.bonus,effectiveAssessment=review?.planningBonus??a;
 return <section className="le-bonus-limits" aria-label="獎勵與容移上限">
 <div className="le-limit-overview"><header><h3>獎勵與容移上限</h3>{limits&&<p>依基地所在縣市及適用規定列示。</p>}</header>
 {limits&&<dl className="le-statutory-limits">
 {renewal&&row('都更獎勵上限',limits.renewal+'%',limits.renewalSource,'都更法規')}
 {danger&&row('危老基本獎勵上限',a.conditions?.originalCap==='original115'?'依合法原容積115%核算':'30%',dangerLaw,'危老條例第6條')}
 {danger&&a.dangerMode==='quick'&&row('本次危老獎勵上限',effectiveAssessment.dangerEligibleSite.trim()&&effectiveAssessment.dangerAdjacentSite.trim()&&effectiveAssessment.date?dangerLegalCap(effectiveAssessment,{site:input.site,far:input.far}).toLocaleString('zh-TW',{maximumFractionDigits:4})+'%':'待確認',dangerLaw,'依日期與面積核算')}
 {tdr&&row('容移上限',Math.min(bonus?.application?.capPercent??Infinity,bonus?.tdrLimit??limits.tdr,document&&p.tdrLimitPercent!==''?Number(p.tdrLimitPercent):Infinity)+'%',limits.tdrSource,'容移法規')}
 {limits.combined!==null&&row('獎勵與容移合計上限',limits.combined+'%',limits.tdrSource,'特殊重建規定')}
 </dl>}</div>
 {limits&&<>{danger&&<p>合法原容積較高、合併鄰地、時程及規模獎勵，依本次日期、面積與獎勵條件分別計算。</p>}
 <div className="le-inline-settings">
 <label className="le-check"><input type="checkbox" checked={document} onChange={e=>change({bonusLimitMode:e.target.checked?'document':'statutory',...(!e.target.checked?{renewalLimitPercent:'',tdrLimitPercent:'',totalBonusLimitPercent:''}:{renewalLimitPercent:p.renewalLimitPercent||String(limits.renewal),tdrLimitPercent:p.tdrLimitPercent||String(limits.tdr)})})}/>採用基地適用的另定上限</label>
 {document&&<><div className="le-fields">{renewal&&field('renewalLimitPercent','都更獎勵上限%')}{tdr&&field('tdrLimitPercent','本次容移上限%')}{field('totalBonusLimitPercent','個案獎勵及容移合計上限%（無資料留白）')}</div><label className="le-field"><span>另定上限依據</span><span className="le-inline-settings-note">填都市計畫書或土地使用分區管制要點的名稱、條文或頁次。</span><textarea aria-label="另定上限依據" value={p.bonusSource} onChange={e=>change({bonusSource:e.target.value})}/></label></>}
 </div></>}
 {!a&&<><div className="le-fields">{field('renewalLimitPercent','都更獎勵上限%')}{field('tdrLimitPercent','本次容移上限%')}{field('totalBonusLimitPercent','個案獎勵及容移合計上限%（無資料留白）')}</div><EvaluationDisclosure><summary>既有方案容移評點</summary><div className="le-fields">{[['tdrBasePoints','容移基準量評點%（未核對可留白）'],['tdrInternalPoints','基地內部條件評點%'],['tdrExternalPoints','外部改善評點%'],['cashTdrPercent','折繳代金占可移入總量比例%']].map(([key,label])=>field(key,label))}</div><label className="le-check"><input type="checkbox" checked={p.renewalArea} onChange={e=>change({renewalArea:e.target.checked})}/>依法劃定更新地區加計0.3倍（須核對適用範圍）</label></EvaluationDisclosure><EvaluationDisclosure><summary>上限適用依據</summary><label className="le-field"><span>上限、評點及特殊適用依據</span><textarea aria-label="上限、評點及特殊適用依據" value={p.bonusSource} onChange={e=>change({bonusSource:e.target.value})}/></label></EvaluationDisclosure></>}
 </section>;
}
