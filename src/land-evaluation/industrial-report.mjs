import {displayNumber,displayRuleVersion} from './delivery-model.mjs';
import {publicText} from './public-copy.mjs';

const value=v=>v===null||v===undefined||v===''?'未填／待確認':String(v);
const quantity=v=>displayNumber(v);
const modes={planning:'規劃試算',document:'依文件覆核'},cities={unknown:'尚未選定',taipei:'臺北市',ntpc:'新北市'},regimes={unknown:'尚未確認',urban:'都市計畫工業區',nonurban:'非都市土地分區與編定',park:'園區／特別計畫'};
const purposes={unknown:'尚未選定',factory:'生產／工廠',warehouse:'倉儲',research:'研發',office:'辦公',exhibition:'展售',ancillary:'附屬設施',dorm:'員工宿舍',housing:'一般住宅',shared:'共用空間'};
const awardKinds={unknown:'未分類',renewal:'都市更新',f1:'立體化：新增投資',f2:'立體化：能源管理',f3:'立體化：營運總部',feedback:'立體化：回饋／捐贈空間',other:'其他獎勵',tdr:'容積移轉'};
const checks={plan:'土地身分與計畫範圍',use:'行業、用途與總量管制',original:'原合法容積與採用路徑',renewal:'更新資格與獎勵',vertical:'立體化條件與回饋',tdr:'容移與接受基地',layout:'建蔽、退縮及配置',combined:'併用規定與合併上限'};
const conditionLabels={road:'連接道路寬度（m）',front:'同路段面寬（m）',opened:'足寬開闢及連通道路寬度（m）',slope:'山坡地身分',nonOpen:'非五項開放性公設來源額度（㎡）',iso:'ISO50001',solar:'太陽能水平投影比例（%）',dc:'DC充電專用車位比例（%）',ems:'能源管理系統',storage:'儲能容量（kWh）',hq:'營運總部認定及登記地址',taipeiLocation:'臺北容移位置條件',distance:'至捷運或公園距離（m）',parkArea:'公園面積（公頃）',secondRoad:'第二條已開闢道路寬度（m）'};
const allocationLabels={exempt:'免計容實體樓板',rent:'出租專用',self:'自用專用',donated:'捐贈',common:'共用',vacant:'未配置',registered:'文件登記'};
const constraintKinds={coverage:'建蔽／建築面積',excavation:'開挖',height:'高度',yard:'退縮與院落',parking:'停車',loading:'裝卸及車道',fire:"消防及共用設施空間",quota:'工業使用總量',permission:'用途與行業許可'};
const legalSources=[
 ['新北市工業區立體化方案及Q&A','https://www.economic.ntpc.gov.tw/Custom/新北市工業區立體化方案'],
 ['新北市都市計畫法施行細則','https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150108'],
 ['新北都市更新審議原則','https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150019'],
 ['臺北土地使用分區管制自治條例：工業區','https://laws.gov.taipei/Law/LawSearch/LawChapterArticle/FL003962?chapterno=4'],
 ['臺北容積移轉自治條例','https://laws.gov.taipei/law/LawSearch/LawArticleContent/FL074357'],
 ['都市更新條例','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070008'],
 ['都市更新建築容積獎勵辦法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070027'],
 ['都市計畫容積移轉實施辦法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070028'],
 ['新北容積移轉許可審查要點','https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150015']
];
const section=(title,columns,rows)=>({title,columns,rows});

// Presentation only: every result number and pass/fail value comes from the supplied core result.
export function industrialDelivery(m,r,createdAt=new Date().toISOString()){
 const q=r.quantities,proofs=[];
 const proof=(label,e)=>{
  if(!e?.source?.trim())return;
  const condition=[({assumed:'規劃假設',reviewed:'已核對文件',fail:'已確認不符',unknown:'文件待確認'})[e.state]||'文件待確認',e.finding?.trim()||'採用條件待補'].join('：');
  const row=[e.source.trim(),value(e.date),condition];
  if(!proofs.some(existing=>existing.every((v,i)=>v===row[i])))proofs.push(row);
 };
 for(const [key,label]of Object.entries(checks))proof(label,m.reviews[key]);
 const sections=[section('土地分項與容積採計',['土地組／分區','原始面積（㎡）','不採計（㎡）','扣除後基地（㎡）','基準容積（㎡）','採用容積（㎡）'],m.parcels.map(p=>{
  const result=r.parcelResults.find(x=>x.id===p.id);proof(p.name||'土地分項',p.evidence);
  return [[p.name||'未命名土地',p.zone||'分區待填'].join('／'),value(p.area),value(p.excluded),quantity(result?.site),quantity(result?.base),quantity(result?.adopted)];
 }))];
 sections.push(section('土地原容積與容移設定',['土地組','基準容積率（%）','原容積採用方式','原合法容積（㎡）','容移上限（%）'],m.parcels.map(p=>[p.name||'未命名土地',value(p.far),({unknown:'尚未選定',none:'不採原容積',replace:'以合法原容積替代'})[p.originalMode],p.originalMode==='none'&&!p.original?'本案不採用':value(p.original),m.transferMode==='none'&&!p.tdrRate?'本案不申請':value(p.tdrRate)])));
 sections.push(section('開發途徑與額度設定',['項目','本次輸入'],[['都更上限路徑',({unknown:'尚未選定',base:'基準容積1.5倍',original30:'原容積加基準0.3倍',original120:'原容積1.2倍',hazard130:'經認定危險原容積1.3倍',strategic:'策略性更新專案'})[m.originalRoute]],['獎勵採計方式',({unknown:'尚未選定',none:'不申請獎勵',items:'逐項填寫'})[m.awardMode]],['容移採計方式',({unknown:'尚未選定',none:'不申請容移',items:'逐項填寫'})[m.transferMode]],['立體化申請日',value(m.applicationDate)],['新增投資（億元，不含土地）',value(m.investment)],['合併審查全案上限（㎡）',value(m.combinedCap)],['容移核定／適用上限（㎡）',value(m.tdrCap)],['容移代金取得額度（㎡）',value(m.tdrCash)],['同版本文件總計（㎡）',value(m.declared)]].filter(([label])=>{
  if(label==='都更上限路徑')return m.route==='renewal';
  if(['立體化申請日','新增投資（億元，不含土地）'].includes(label))return m.vertical==='ntpc'||Boolean(m.applicationDate||m.investment);
  if(label==='合併審查全案上限（㎡）')return Boolean(m.combinedCap)||[...r.errors,...r.missing].some(t=>t.includes('合併審查'));
  if(label==='容移核定／適用上限（㎡）')return m.transferMode==='items'||Boolean(m.tdrCap);
  if(label==='容移代金取得額度（㎡）')return m.city==='taipei'&&m.transferMode==='items'||Boolean(m.tdrCash);
  if(label==='同版本文件總計（㎡）')return m.mode==='document'||Boolean(m.declared);
  return true;
 })));
 sections.push(section('額度輸入及適用土地組',['項目','類型','適用土地組','申請／文件額度（㎡）','不採計扣除（㎡）'],m.awards.map(a=>{proof(a.name||'額度分項',a.evidence);return [a.name||'未命名額度',awardKinds[a.kind]??'未分類',m.parcels.find(p=>p.id===a.parcelId)?.name||'尚未選定',value(a.amount),value(a.deduct)];})));
 sections.push(section('本次計算採用額度',['項目','類型','原額度（㎡）','扣除（㎡）','採用（㎡）'],r.items.map(a=>[a.name||'未命名額度',awardKinds[a.kind]??'未分類',quantity(a.gross),quantity(a.deduct),quantity(a.net)])));
 sections.push(section('逐棟逐層用途',['幢別／樓層','層數','每層計容（㎡）','用途','本列立體化增量（㎡）','增量適用條款'],m.floors.map(f=>{proof([f.building,f.level].filter(Boolean).join('／')||'樓層用途',f.evidence);return [[f.building||'幢別待填',f.level||'樓層待填'].join('／'),value(f.count),value(f.area),purposes[f.purpose]??'尚未選定',value(f.increment),({'18-2-1':'第18條第2項第1款','18-2-2':'第18條第2項第2款'})[f.incrementBasis]||'尚未選定'];})));
 sections.push(section('上限檢查',['檢核項目','本次採用（㎡）','適用上限（㎡）','數量檢查'],r.limits.map(l=>[publicText(l.label),quantity(l.used),quantity(l.cap),l.pass?'數量未超過':'超限'])));
 if(m.development){
  const d=m.development;proof('工業專屬配置／個別計畫',d.planEvidence);
  sections.push(section('工業專屬配置條件',['項目','本次輸入'],[['經營方式',({unknown:'尚未選定',rental:'出租',self:'自用',mixed:'出租與自用'})[d.operation]],['申請人自用認定',({unknown:'尚未選定',self:'申請人自用',nonself:'非申請人自用'})[d.applicantUse]],['個別計畫',value(d.planName)],['適用範圍',value(d.planScope)],['分項數量檢查',r.development?.ready?'檢查通過':'尚未完成']]));
  sections.push(section('實體面積與登記分項',['對應樓層組',...Object.values(allocationLabels).map(x=>x+'（㎡）')],d.allocations.map(a=>{const f=m.floors.find(f=>f.id===a.floorId);const label=f?[f.building,f.level].filter(Boolean).join('／'):'對應樓層待確認';proof(label+'／面積分配',a.evidence);return [label,...Object.keys(allocationLabels).map(key=>value(a[key]))];})));
  if(r.development?.totals)sections.push(section('專屬配置合計',['項目','面積（㎡）'],Object.entries({physical:'實體樓板',rent:'出租專用',self:'自用專用',donated:'捐贈',common:'共用',vacant:'未配置',registered:'文件登記'}).map(([key,label])=>[label,quantity(r.development.totals[key])])));
  sections.push(section('基地與用途限制',['項目','適用範圍','設計值','文件限制','核對方式','資料依據'],d.constraints.map(c=>{const label=c.name||constraintKinds[c.kind]||'限制分項';proof(label+'／施行'+value(c.effective)+'至'+(c.expires||'未列截止日'),c.evidence);return [label,value(c.scope),value(c.actual)+' '+value(c.unit),value(c.limit)+' '+value(c.unit),({max:'不超過限制值',min:'不低於限制值',equal:'與限制值相同'})[c.operator]||'待確認',({general:'一般規定',plan:'個別計畫',exception:'個案例外'})[c.basis]||'待確認'];})));
 }
 sections.push(section('能源、道路與容移條件',['條件','本次輸入'],Object.entries(conditionLabels).filter(([key])=>m.conditions[key]!=='').map(([key,label])=>[label,value(m.conditions[key])])));
 sections.push(section('資料依據',['文件或資料','日期','採用條件'],proofs));
 const issues=[...new Set([...r.errors,...r.missing,...(r.development?.issues||[])].map(publicText))];
 const sourceIndexes=new Set([...(m.city==='ntpc'&&m.regime==='urban'?[1]:[]),...(m.city==='taipei'&&m.regime==='urban'?[3]:[]),...(m.vertical==='ntpc'?[0]:[]),...(m.route==='renewal'?[5,6,...(m.city==='ntpc'?[2]:[])]:[]),...(m.transferMode==='items'?[7,...(m.city==='ntpc'?[8]:m.city==='taipei'?[4]:[])]:[])]);
 const references=legalSources.filter((_,i)=>sourceIndexes.has(i));
 const genericNote='依已填土地、額度與樓層資料核算；規劃假設、文件覆核及主管機關核准狀態分別記錄。';
 return {kind:'工業土地與廠房開發',title:m.name||'本次工業土地評估',status:publicText(r.status),createdAt,reviewedAt:'2026-10-24',ruleVersion:r.version,metrics:[['扣除後基地面積',q.site,'㎡'],['基準容積',q.base,'㎡'],['原容積替代增加量',q.originalIncrease,'㎡'],['扣除重複後獎勵',q.awards,'㎡'],['容積移轉',q.tdr,'㎡'],['輸入分項合計',q.total,'㎡'],['逐層配置計容面積',q.design,'㎡']],conditions:[['評估模式',modes[m.mode]],['案件資料版本／文號',value(m.edition)],['評估日',value(m.date)],['城市／土地制度',cities[m.city]+'／'+regimes[m.regime]],['重建途徑',({unknown:'尚未選定',ordinary:'一般新改建',renewal:'都市更新'})[m.route]],['立體化方案',({unknown:'尚未選定',none:'本案不申請',ntpc:'新北市立體化（115年4月方案）',specific:'其他方案／園區專案'})[m.vertical]],['數量採用範圍','各分項依本次輸入核算；規劃假設、文件覆核與主管機關核准狀態分別記錄。']],charts:[],inputs:[],sections,issues,omitEmptySections:true,sourceHeading:'法規依據',sourceLinks:references.map(([title,url])=>({title,url})),assumptions:r.notes.map(publicText).filter(note=>note!==genericNote),sources:references.map(([title,url])=>title+'：'+url)};
}

const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>new Date(s).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'});
export function renderIndustrialReport(s,watermarkSvg){
 const watermark='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(watermarkSvg);
 const table=(columns,rows)=>'<table><thead><tr>'+columns.map(c=>'<th>'+escape(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+escape(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 const list=(title,rows)=>'<section><h2>'+escape(title)+'</h2><ul>'+rows.map(row=>'<li>'+escape(row)+'</li>').join('')+'</ul></section>';
 const sourceList=s.sourceLinks.length?'<section><h2>法規依據</h2><ul>'+s.sourceLinks.map(({title,url})=>'<li><a href="'+escape(url)+'">'+escape(title)+'</a></li>').join('')+'</ul></section>':'';
 return `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(s.title)}｜三策工業評估</title><style>
 body{margin:0;background:#e8e8e3;color:#263d4b;font:14px/1.7 -apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif}.toolbar{position:sticky;top:0;background:#263d4b;color:#fff;padding:16px 28px;z-index:3;display:flex;justify-content:space-between;align-items:center;gap:20px}.toolbar button{min-height:44px;padding:8px 16px;background:white;border:1px solid #96745c;color:#263d4b;font:inherit;cursor:pointer}main{max-width:920px;margin:28px auto;padding:44px 48px;background:#fff;box-sizing:border-box;position:relative}main:before{content:"";position:absolute;inset:0;background-image:url("${watermark}");background-size:688px 1020px;background-repeat:repeat;pointer-events:none;z-index:1}main>*{position:relative;z-index:2}header{border-bottom:2px solid #263d4b;padding-bottom:16px}header p{margin:0}h1{font-size:28px;line-height:1.5;margin:10px 0}h2{font-size:18px;margin:26px 0 10px;break-after:avoid}p,td,th,li{overflow-wrap:anywhere;word-break:normal}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #d3d7d7;padding:8px}th{font-weight:500;background:#f5f4ee}tr{break-inside:avoid}thead{display:table-header-group}dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 24px}dl>div{min-width:0}dt{font-size:12px;color:#5d686c}dd{font-size:24px;margin:0;font-weight:600}dd small{font-size:12px;margin-left:5px;font-weight:400}.meta{font-size:12px;color:#657178}footer{border-top:1px solid #d3d7d7;padding-top:12px;margin-top:24px;font-size:11px;color:#657178}li{margin:6px 0}.wide{overflow-x:auto}@media(max-width:800px){main{margin:16px;padding:24px}dl{grid-template-columns:repeat(2,minmax(0,1fr))}.wide table{min-width:650px}}@media print{@page{size:A4;margin:13mm 14mm}body{background:white}.toolbar{display:none}main{margin:0;padding:0;max-width:none}.report-front{break-after:page}main:before{position:fixed;background-size:182mm 270mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}h1{font-size:20pt}h2{font-size:12pt}table{font-size:8pt}th,td{padding:5px}dl{gap:8px 14px}dd{font-size:17pt}.wide{overflow:visible}.wide table{min-width:0}.meta,footer{font-size:8pt}}
 </style><div class="toolbar"><strong>三策工業評估報告</strong><button type="button" onclick="window.print()">列印／另存 PDF</button></div><main><section class="report-front"><header><p>三策專案管理顧問有限公司</p><h1>${escape(s.title)}</h1><p>${escape(s.kind)} · ${escape(s.status)}</p></header><p class="meta">計算／整理日期：${escape(date(s.createdAt))}　規則版本：${escape(displayRuleVersion(s.ruleVersion))}</p><dl>${s.metrics.map(([label,n,unit])=>'<div><dt>'+escape(label)+'</dt><dd>'+escape(quantity(n))+'<small>'+(typeof n==='number'&&Number.isFinite(n)?escape(unit):'')+'</small></dd></div>').join('')}</dl><h2>主要採用條件</h2>${table(['項目','本次取值或條件'],s.conditions)}<p>資料與法規覆核日：${escape(s.reviewedAt)}。${escape('本次依輸入條件試算；核准、登記與實際配置須分別核對主管機關文件、測量成果及設計圖說。')}</p></section>${s.sections.filter(x=>x.rows.length).map(x=>'<section><h2>'+escape(x.title)+'</h2><div class="wide">'+table(x.columns,x.rows)+'</div></section>').join('')}${s.issues.length?list('待查事項與限制',s.issues):''}${s.assumptions.length?list('評估假設與說明',s.assumptions):''}${sourceList}<footer>三策 · 前期評估報告 · 成本、融資與現金流試算可洽詢三策開發評估服務</footer></main></html>`;
}
