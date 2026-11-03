import {FieldGuidance} from './GuidedFields.jsx';
import {isGuidedInput} from './guided-input.mjs';
import {PublicSelect} from './PublicSelect.jsx';
import {bonusLabels} from './bonus-eligibility.mjs';
import {bonusIssueLabels} from './blocking-issue-catalog.mjs';
const answers=[['','待確認'],['yes','符合本項條件'],['no','不符合，本項不採計']];
export function BonusEligibilityPanel({input,edit}){
 const p=input.regulatoryReview,a=p?.bonusAssessment;if(!a)return null;
 const g=a.conditions??{},change=patch=>edit({regulatoryReview:{...p,bonusAssessment:{...a,conditions:{...g,...patch}}}}),changeA=patch=>edit({regulatoryReview:{...p,bonusAssessment:{...a,...patch}}});
 const select=(key,options=answers)=>{const preset=isGuidedInput(input)?({originalCap:'base',quickExtras:'no'})[key]:undefined;return <label key={key}><span className="le-field-caption"><span>{bonusLabels[key]}</span>{preset&&!g[key]&&<em className="le-field-state">預設值</em>}<FieldGuidance label={bonusLabels[key]}/></span><PublicSelect aria-label={bonusLabels[key]} value={g[key]||preset||''} onChange={e=>change({[key]:e.target.value})}>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</PublicSelect></label>;};
 const text=key=><label key={key}><span className="le-field-caption"><span>{bonusLabels[key]}</span><FieldGuidance label={bonusLabels[key]}/></span><input aria-label={bonusLabels[key]} value={g[key]??''} onChange={e=>change({[key]:e.target.value})}/></label>;
 const area=(key,label)=>{
  const fallback=isGuidedInput(input)&&g.originalCap!=='original115'?(key==='dangerEligibleSite'?input.site:key==='dangerAdjacentSite'?'0':''):'';
  const preset=!a[key]&&fallback!=='';
  const help=preset?(key==='dangerEligibleSite'?'暫按全基地符合危老條件估算；請依合法原建築基地範圍修改。':'暫按未合併鄰地估算；有鄰地時請填本次納入面積。'):key==='dangerOriginal'?'填原建照或使用執照記載的合法原容積面積，並附原容積依據。採原容積115%上限時必填。':key==='dangerEligibleSite'?'依合法原建築基地範圍填面積，影響危老獎勵採計比例及規模獎勵。採原容積115%上限時必須有實際資料。':'填本次合併的鄰接基地面積；沒有鄰地請填0，獎勵面積仍受原基地及1,000㎡限制。';
  return <label><span className="le-field-caption"><span>{label}</span>{preset&&<em className="le-field-state">預設值</em>}<FieldGuidance label={label} help={help}/></span><span className="le-number"><input type="number" min="0" step="any" aria-label={label} value={a[key]||fallback} onChange={e=>changeA({[key]:e.target.value})}/><span>㎡</span></span></label>;
 };
 const qualification=(key,label)=><label><span className="le-field-caption"><span>{label}</span><FieldGuidance label={label}/></span><PublicSelect aria-label={label} value={a[key]??'unknown'} onChange={e=>changeA({[key]:e.target.value})}><option value="unknown">待確認</option><option value="yes">已核對符合申請資格</option><option value="no">不符合申請資格</option></PublicSelect></label>;
 const renewal=a.route==='renewal',danger=a.route==='danger',permitted=a.awardBasis==='permitted',tdr=Number(input.tdr)>0||a.tdrMode==='detail';
 const ids=Object.entries(a.entries).filter(([id,e])=>e.choice&&e.status!=='excluded'&&((renewal&&a.renewalMode==='detail'&&/^[ul]-/.test(id))||(danger&&a.dangerMode==='detail'&&id.startsWith('d-'))||(a.tdrMode==='detail'&&id.startsWith('t-')))).map(([id])=>id);
 const pairedSpace=[['l-setback','t-setback'],['l-plaza','t-plaza'],['l-path','t-walk'],['t-plaza','t-walk'],['u-infra','t-ex-infra'],['u-public','t-social'],['u-public','t-care'],['u-public','t-elder'],['d-infra','t-ex-infra']].some(pair=>pair.every(id=>ids.includes(id)));
 const overlaps=pairedSpace||renewal&&a.renewalMode==='quick'||ids.filter(id=>/^[ul]-/.test(id)).length>1||renewal&&Number(input.scale)>0||tdr&&ids.some(id=>['u-infra','u-heritage','l-setback','l-plaza','l-path'].includes(id));
 const content=<section className="le-bonus-eligibility" aria-label="獎勵適用條件"><h3>獎勵適用條件與文件</h3><p>尚未取得資料可保留待確認，先查看目標條件的規劃初估。已有資料時請填具體依據；已知不符合的條件須如實選擇。</p><div className="planning-field-grid">
 {!permitted&&renewal&&<>{qualification('renewalQualification','都更適用資格')}{select('renewalWork',[['','待確認'],['rebuild','重建'],['rehabilitation','整建'],['maintenance','維護']])}{select('implementation',[['','待確認'],['rights','權利變換'],['agreement','全體同意協議合建'],['public12','依第12條第1項公辦方式'],['other','其他依法實施方式']])}</>}
 {!permitted&&danger&&<>{qualification('dangerQualification','危老法定適用資格')}{select('dangerCategory',[['','待確認'],['1','主管機關通知拆除、補強或有危險之虞'],['2','結構安全性能評估未達最低等級'],['3','30年以上且耐震未達標準，改善無效益或無電梯']])}{select('dangerConsent')}{select('originalCap',[['','待確認'],['base','基準容積130%'],['original115','合法原建築容積115%（全合格原基地）']])}{area('dangerEligibleSite','危老原建築基地面積')}{area('dangerAdjacentSite','合併鄰接基地面積')}{g.originalCap==='original115'&&<>{area('dangerOriginal','合法原建築容積面積')}{text('originalSource')}</>}{a.dangerMode==='quick'&&select('quickExtras',[['','待確認'],['yes',isGuidedInput(input)?'依本次面積估算規模獎勵（資格待查）':'已核對面積，計入規模獎勵'],['no','不計規模獎勵']])}</>}
 {!permitted&&(renewal||danger)&&<label><span className="le-field-caption"><span>{bonusLabels.source}</span><FieldGuidance label={bonusLabels.source}/></span><input aria-label={bonusLabels.source} value={a.source} onChange={e=>changeA({source:e.target.value})}/></label>}
 {!permitted&&renewal&&ids.some(id=>['u-green','u-smart'].includes(id)&&Number(a.entries[id].choice)>=4)&&select('article7District',[['','待確認'],['yes','依第7條第1項第3款劃定更新地區'],['no','其他更新地區或未劃定']])}
 {!permitted&&renewal&&ids.includes('u-time')&&select('renewalDistrict')}
 {!permitted&&renewal&&ids.includes('u-green')&&select('greenMinimum',[['','待確認'],['none','無最低等級規定'],['5','合格級'],['4','銅級'],['3','銀級'],['2','黃金級'],['1','鑽石級']])}
 {!permitted&&renewal&&ids.includes('u-agreement')&&<>{text('agreementDoors')}{select('agreementConsent')}</>}
 {tdr&&<>{qualification('tdrQualification','容移接受基地、道路及移入資格')}{text('tdrSource')}{p.renewalArea&&a.tdrMode==='detail'&&text('renewalAreaSource')}</>}
 {!permitted&&overlaps&&<>{select('overlap',[['','待確認'],['distinct','已核對各項給予事項或空間範圍不同'],['deducted','有重複事項，已填列扣除比例']])}{text('overlapSource')}{tdr&&ids.some(id=>['u-infra','u-heritage'].includes(id))&&select('tdrResource',[['','待確認'],['distinct','兩者土地或保存建物範圍不同'],['award','同一標的選擇獎勵'],['transfer','同一標的選擇容移']])}</>}
 </div>{!permitted&&ids.length>0&&<div className="le-bonus-condition-list"><h4>本次選用項目的申請條件</h4><p>各項法定條件列於下方細項說明；不符合的項目不採計。</p><div className="planning-field-grid">{ids.map(id=><label key={id}><span>{bonusIssueLabels[id]??id}申請條件</span><PublicSelect aria-label={(bonusIssueLabels[id]??id)+'申請條件'} value={g.entries?.[id]??''} onChange={e=>change({entries:{...g.entries,[id]:e.target.value}})}>{answers.map(([v,t])=><option key={v} value={v}>{t}</option>)}</PublicSelect></label>)}</div></div>}</section>;
 return isGuidedInput(input)?<details className="le-guided-eligibility"><summary>申請資格與文件（可後續補入）</summary>{content}</details>:content;
}
