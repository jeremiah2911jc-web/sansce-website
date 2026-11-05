import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {volumeRecount} from './volume-recount.mjs';
import {formatNumber} from './number-format.mjs';
import './volume-recount.css';
const format=n=>formatNumber(n,2,true);
export function VolumeRecount({result,compact=false}){
 const r=volumeRecount(result);if(!r)return null;
 return <section className={'le-volume-recount'+(compact?' is-compact':'')} aria-label="反計容積說明"><h3>反計容積與可用額度</h3><p>{r.counted>.005?<>本次地上反計 <strong>{format(r.aboveCounted)}㎡</strong>，地下計容 <strong>{format(r.belowCounted)}㎡</strong>，合計占用允建容積 <strong>{format(r.counted)}㎡</strong>。</>:<>本次所列空間依採用條件均列免計；用途及圖說仍須核對。</>}</p><p className="le-recount-budget">允建容積 {format(r.allowed)}㎡ − 地上反計 {format(r.aboveCounted)}㎡ − 地下計容 {format(r.belowCounted)}㎡ ＝ 一般樓板容積額度 <strong>{format(r.ordinaryBudget)}㎡</strong></p>{r.unused<-.02&&<p className="le-recount-over">本次地上與地下計容合計超出允建容積 {format(-r.unused)}㎡，請縮減配置後重新計算。</p>}<EvaluationDisclosure><summary>查看反計項目與原因</summary><div className="le-recount-table"><table><thead><tr><th>空間項目</th><th>配置㎡</th><th>免計㎡</th><th>計容㎡</th><th>原因</th></tr></thead><tbody>{r.rows.map(row=><tr key={row.id} data-counted={row.counted>.005?'yes':'no'}><th>{row.label}</th><td>{format(row.adopted)}</td><td>{format(row.exempt)}</td><td>{format(row.counted)}</td><td>{row.reason}</td></tr>)}</tbody></table></div><p>機電等免計額度按全案檢討；梯廳及陽台按各層檢討。調大比例後，超額部分會占用原容積。房屋登記與公設分攤比例另行計算。</p></EvaluationDisclosure></section>;
}
export function VolumeFieldNotice({result,fieldKey}){
 const review=volumeRecount(result);if(!review)return null;
 const key=['roofRate','roofFloors','roofHeight'].includes(fieldKey)?'roof':fieldKey;
 const rows=review.rows.filter(row=>row.field===key&&row.counted>.005);if(!rows.length)return null;
 return <p className="le-field-recount" role="status">依目前設定，{rows.map(row=>row.label+format(row.counted)+'㎡').join('、')}須計入原允建容積。詳見結果的反計容積說明。</p>;
}
