import {REVIEWED_AT} from './generated/land.mjs';
import {documentItems,systems,perspectives} from './generated/readjustment.mjs';
const states={conditional:'條件對照',pending:'待補資料',blocked:'目前不符',review:'專案覆核',recorded:'已記錄依據'};
const unique=rows=>[...new Map(rows.map(r=>[r.title+'／'+r.detail,r])).values()];
const item=(title,detail,status)=>({title,detail,status:states[status]||status||'下一步'});
const num=n=>typeof n==='number'&&Number.isFinite(n)?n.toLocaleString('zh-TW',{maximumFractionDigits:2}):'待確認';
export function landJudgement(a,r){
 const findings=r.parcels.flatMap(p=>p.findings.map(f=>({...f,identity:p.identity}))),routes=r.parcels.flatMap(p=>p.routes.map(route=>({...route,identity:p.identity})));
 const limits=findings.filter(f=>f.status==='blocked').map(f=>item(f.identity+'／'+f.title,f.detail,f.status));
 const gaps=findings.filter(f=>['pending','review'].includes(f.status)).map(f=>item(f.identity+'／'+f.title,f.detail+(f.id==='community'?' 會影響開發途徑與累計規模判斷。':' 會影響本案用途、途徑或許可的採用前提。'),f.status));
 for(const [i,p] of a.parcels.entries())if(p.areaSqm===''||p.areaSqm==null)gaps.push(item('第'+(i+1)+'筆土地／登記面積待補','配置與土地坪效的面積分母無法完整確認，請依謄本或正式資料填入。','pending'));
 const directions=routes.filter(r=>r.status!=='blocked').map(r=>item(r.identity+'／'+r.title,r.reason,r.status));
 const actions=[];
 if(findings.some(f=>f.id==='identity')||!a.parcels.length)actions.push(item('逐筆核對土地身分','取得地籍、使用分區或使用地編定資料，填入來源、日期及適用地號；向所在地官方查詢窗口核對。'));
 for(const route of routes.filter(r=>r.status!=='blocked')){actions.push(item('確認'+route.title+'的適用範圍',`核對窗口：${route.authority}。${route.steps.join('；')}。`));for(const document of route.documents||[])actions.push(item('取得必要文件',document+'；採用時記錄原件、頁次及適用地號。'));}
 if(!actions.length)actions.push(item('補齊資料後重新初核','先選定預定用途及土地管制身分，依本頁缺件取得文件，再核對候選途徑。'));
 return {kind:'土地用途判讀',headline:limits.length?'本次有已知不符條件，先釐清限制再比較途徑':!directions.length?'先補齊土地資料，再辨識可研究途徑':gaps.length?'已有候選方向，仍須補齊資料與適用覆核':'可依本次條件繼續核對候選途徑',basis:`依本次${a.parcels.length}筆土地及預定用途整理；核心查核日${REVIEWED_AT}。候選途徑不代表已核准。`,directions:unique(directions),limits:unique(limits),gaps:unique(gaps),actions:unique(actions),notes:r.warnings||[]};
}
export function readjustmentJudgement(p,land,r){
 const limits=[...r.errors.map(t=>item('輸入與適用限制',t,'blocked')),...r.findings.filter(f=>f.state==='blocked').map(f=>item(f.title,f.detail,f.state))];
 const gaps=r.findings.filter(f=>['pending','review'].includes(f.state)).map(f=>item(f.title,f.detail+' 會影響本案權利、分配或後續採用條件。',f.state));
 const mode=p.allocationMode==='average'?'平均負擔假設概估，不能當成個人核定分配':p.allocationMode==='statutory'?'本次法定數量公式核算，仍須個案分配文件對照':p.allocationMode==='document'?(p.areaStatus==='documented'?'文件記載面積；適用範圍及效力依原件覆核':'明示規劃假設面積，非核定分配'):'尚無可採用的分配面積資料';
 const directions=[item(p.track==='acquisition'?'先辨識取得標的及可承接權利':'先核對個人權利與分配口徑',`${systems[p.system]}／${perspectives[p.track]}。納入${num(r.includedArea)}㎡；持分權利範圍${num(r.rightsArea)}㎡。`),item('本次分配面積的身分',`${mode}；${r.areaLabel}：${num(r.allocationArea)}㎡。`,r.allocationArea==null?'pending':'review')];
 const actions=[],authority=p.authority?.trim()||'本案公告所載辦理單位／地方地政主管機關';
 if(r.includedArea==null||p.membership!=='in')actions.push(item('確認地號是否及部分納入範圍',`向${authority}取得計畫書圖與地號清冊，逐筆對照納入面積、權利人及持分；選到公告計畫不代表本案地號已納入。`));
 if(r.rightsArea==null)actions.push(item('核對登記與持分','以本案登記及權利文件核對逐筆持分、部分納入範圍與限制；地號、面積及權利範圍分開記錄。'));
 for(const doc of documentItems(p.system,p.track))if(r.findings.some(f=>f.id===doc.id&&['pending','review','blocked'].includes(f.state)))actions.push(item('取得／覆核'+doc.title,`${doc.detail} 核對窗口依${authority}的公告及原件所載單位確認。`));
 if(p.track==='acquisition')actions.push(item('確認實際取得與承接範圍','依預定取得時點，對照原土地、分配權利、已領利益及未履行義務；承接效力依本案文件及專業覆核，不由面積情境推定。'));
 if(p.allocationMode==='average')actions.push(item('將平均情境與個人文件對照','另取得個別負擔、應分配及分配結果資料；平均負擔率不是個人核定扣地率。'));
 if(p.allocationMode==='statutory')actions.push(item('核對公式資料與分配文件','核對係數、權利範圍、街廓與幾何取值、資料日期及文件對照差異；核算面積不是實際選配位置。'));
 if(r.canCreateLand)actions.push(item('完成確認後銜接土地草稿','依原有確認門檻完成本次核對後，可另建分回後土地草稿；仍須核對新基地地籍、分區、臨路及建築條件。'));
 else actions.push(item('補齊本次條件再確認','依本頁缺件與限制逐項取得依據，重新核對後再確認；分回位置、交地及建築可行性另核。'));
 return {kind:'整體開發判讀',headline:limits.length?'本次有障礙或輸入限制，尚不能採用完整結論':r.canConfirm?'已具備本次確認條件，核准與實際分配仍依原件':'目前為前期條件評估，尚有資料與權利待核',basis:`${systems[p.system]}／${perspectives[p.track]}；${p.planName||'計畫尚待確認'}。${p.parcelIds.length?'採用'+p.parcelIds.length+'筆共用土地':'依本案手動納入範圍'}；以${p.referenceDate||'待填日期'}為評估基準。`,directions,limits:unique(limits),gaps:unique(gaps),actions:unique(actions),notes:['計畫公開條件、個人權利、權利價值及實際選配分開判讀。','本次結果不代表主管機關核准、個人核定分配或權利已隨交易移轉。']};
}
