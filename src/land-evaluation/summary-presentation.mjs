import {publicText} from './public-copy.mjs';
const unique=rows=>[...new Set((rows||[]).filter(Boolean).map(publicText))];
const labels={name:'名稱',assessmentDate:'評估基準日',declaredArea:'全案納入面積（㎡）',designMode:'規劃用途',boundary:'基地範圍',joint:'合併建築',jointEvidence:'合併建築依據',layout:'整體配置條件',municipality:'所在地',localPlan:'個別計畫',conditions:'採用條件',openSpace:'空地配置',volume:'樓地板配置',reviews:'法規適用條件',finding:'採用條件',state:'確認狀態',source:'文件依據',date:'文件日期',evidence:'資料依據',zones:'土地分區',parcel:'地號',parcelArea:'登記面積（㎡）',area:'採計面積（㎡）',zoningClass:'分區類別',regime:'土地管制體系',plan:'計畫名稱',inclusion:'納入範圍',coverage:'建蔽率（%）',far:'容積率（%）',maxHeight:'高度上限（m）',constraints:'限制條件',bonusMode:'獎勵方式',bonuses:'獎勵分項',obligation:'回饋義務',obligationSource:'回饋依據',mode:'採計方式',value:'數量或比例',base:"計算基礎",customBase:"自訂計算基礎（㎡）",allocations:'用途配置',zoneId:'所屬分區',building:'幢別',use:'用途',counted:'計容面積（㎡）',footprint:'建築投影（㎡）',height:'高度（m）',parkingArea:'停車面積（㎡）',units:'戶數',permission:'用途許可',residentialBase:'住宅基準容積（㎡）',taipeiGroup:'臺北用途組別',buildings:'停車幢別',exemption:'免設條件',publicBuilding:'公共建築物',reviewedCars:'文件汽車位數',commercialIntensity:'商業分區強度',commercialClass:'商業分區種類',city:'所在地',planSource:'個別計畫依據',checkedAt:'查證日期',residentialUse:'住宅用途許可',useSource:'用途依據',boundarySource:'範圍依據',bands:'道路適用範圍',kind:'類型',width:'路寬（m）',frontage:'面寬（m）',documentFar:'文件容積率（%）',documentCoverage:'文件建蔽率（%）',documentSource:'文件依據',ntpcHousing:'新北商業區住宅條件',ntpcUse:'新北用途條件',landBasis:'土地採計條件',ntpcCross:'新北跨區合併條件',areaMode:'面積採計方式',grossArea:'總面積（㎡）',excludedArea:'扣除面積（㎡）',netArea:'淨面積（㎡）',purpose:'用途',locator:'條文或頁次',status:'確認狀態'};
Object.assign(labels,{nature:'用途性質',partition:'分區實體區隔',entrances:'獨立出入口',transfers:'容積調配',from:'來源分區',to:'接受分區',publicAdoption:'公設採計方式',procedures:'土地程序',renewal:'更新範圍',role:'土地法定用途',site:'建築基地',openCredit:'法定空地採計',tdr:'容移處理',deduction:'扣除面積（㎡）',receivingZone:'接受分區',affects:'影響的面積項目'});
const enums={unknown:'待確認',pending:'待確認',documented:'文件記載',scenario:'暫用估計值，待文件確認',verified:'已依文件核對',recorded:'已填依據',conflict:'資料有差異',residential:'住宅',nonresidential:'非住宅',mixed:'混合用途',retail:'店舖',office:'辦公',shared:'共用',other:'其他',urban:'都市土地',nonurban:'非都市土地',special:'特定管制',standard:'一般分區',public:'公共設施用地',included:'納入',excluded:'排除',allowed:'依文件允許',forbidden:'不允許',none:'本項不採用',items:'逐項採計',percent:'依比例',area:'依面積',base:'基準容積',custom:"自訂計算基礎",article29:'依第29條整體配置',article165:'依第165條整體配置',separate:'分區分別配置',project:'依個案文件配置',article59:'建技規則第59條',taipei861:'臺北第86-1條',reviewed:'已依文件核對',first:'第一類用途',second:'第二類用途',yes:'是',no:'否',true:'是',false:'否',taipei25:'臺北第25條',document:'依個案文件',road:'臨路範圍',residual:'剩餘範圍',exception:'個案核准例外'};
Object.assign(enums,{same:'相同性質',different:'不同性質',count:'採計',exclude:'不採計',inside:'範圍內',outside:'範圍外',building:'建築用地',publicPedestrian:'公共設施人行步道',publicRoad:'公共設施道路',publicOther:'其他公共設施',privateAccess:'私設通路',setback:'退縮用地',proposed:'規劃申請中',approved:'已有核准文件',effective:'已生效',completed:'已完成',currentPlan:'現行計畫',effectiveChange:'已生效變更計畫',planChange:'都市計畫變更',alleyClosure:'巷道廢止',alleyReroute:'巷道改道',acquisition:'土地取得',commercial:'商業用途',industrial:'工業用途'});
const clean=value=>typeof value==='string'?publicText(value):value;
const noValue=value=>value===''||value==='未填'||value==='未填／待確認'||value==='unknown'||value==='尚未確認';

// Presentation only: retain each supplied quantity and condition; suppress schema metadata and repeated rows.
export function summaryForDisplay(raw){
 const s={...raw,omitEmptySections:true};
 for(const key of ['title','kind','status'])s[key]=clean(s[key]);
 for(const key of ['conditions','metrics'])s[key]=(raw[key]||[]).filter(row=>row[0]!=='後續銜接').map(row=>row.map(clean));
 s.sources=unique(raw.sources);s.issues=unique(raw.issues);s.assumptions=unique(raw.assumptions).filter(value=>!s.issues.includes(value)&&value!=='輸入按本案方案保存；改值後重新計算。');
 const inputRows=[],seen=new Set(),evidence=new Map();
 for(const [originalLabel,originalValue]of raw.inputs||[]){
  const documentIndex=originalLabel.startsWith('文件原始輸入');
  const path=originalLabel.replace(/^(?:文件原始輸入|原始輸入)[／/]?/,'').split(/[／/]/);
  if(path.some(token=>['id','version','enabled','basis','資料版本'].includes(token))||noValue(originalValue))continue;
  const label=publicText(path.map(token=>/^\d+$/.test(token)?`第${Number(token)+(documentIndex?0:1)}項`:labels[token]||token).join('／'));
  const leaf=path.at(-1),sourceFields={source:'source',來源:'source',date:'date',文件日期:'date',state:'status',status:'status',覆核狀態:'status',finding:'finding',採用條件:'finding'};
  if(sourceFields[leaf]&&path.slice(0,-1).some(token=>['evidence','boundary','jointEvidence','reviews','採計依據','法規條件'].includes(token))){const scope=path.slice(0,-1).map(token=>/^\d+$/.test(token)?`第${Number(token)+(documentIndex?0:1)}項`:labels[token]||token).join('／');const entry=evidence.get(scope)||{};entry[sourceFields[leaf]]=clean(enums[originalValue]||originalValue);evidence.set(scope,entry);continue;}
  const value=clean(raw.referenceNames?.[originalValue]||enums[originalValue]||(path.includes('affects')?labels[originalValue]:null)||originalValue),key=label+'\0'+value;
  if(seen.has(key)||s.conditions.some(row=>row[0]===label&&row[1]===value))continue;
  seen.add(key);inputRows.push([label,value]);
 }
 s.inputs=inputRows;
 s.sections=raw.sections?.map(section=>({...section,title:clean(section.title),columns:section.columns.map(clean),rows:section.rows.map(row=>row.map(clean))}));
 const grouped=new Map();
 for(const [scope,value]of evidence){if(!value.source&&!value.finding)continue;const cells=[value.source||'文件待補',value.date||'日期待補',[value.finding,value.status].filter(Boolean).join('；')||'採用條件待補'],key=JSON.stringify(cells);if(grouped.has(key))grouped.get(key).scopes.push(scope);else grouped.set(key,{scopes:[scope],cells});}
 if(grouped.size){s.sections=[...(s.sections||[]),{title:'資料依據與採用條件',columns:['適用項目','文件名稱或頁次','文件日期','採用條件'],rows:[...grouped.values()].map(value=>[value.scopes.join('、'),...value.cells])}];const listed=new Set([...evidence.values()].map(value=>value.source));s.sources=s.sources.filter(value=>!listed.has(value));}
 return s;
}

export function commercialInputs(x){
 const rows=[];
 for(const key of ['city','mode','designMode','commercialClass','checkedAt','residentialUse'])if(!noValue(x[key]))rows.push([labels[key],enums[x[key]]||x[key]]);
 if(x.mode==='document')for(const key of ['documentFar','documentCoverage'])rows.push([labels[key],x[key]||'待確認']);
 for(const [index,band]of (x.bands||[]).entries())rows.push([`道路適用範圍${index+1}`,`${enums[band.kind]||'待確認'}；面積${band.area||'待填'}㎡；路寬${band.width||'待填'}m；面寬${band.frontage||'待填'}m；${band.source||'範圍依據待補'}`]);
 if(x.city==='新北市'&&x.ntpcHousing)rows.push(['新北商業區住宅條件',`${enums[x.ntpcHousing.mode]||'待確認'}；住宅基準容積${x.ntpcHousing.far||'待填'}%；${x.ntpcHousing.source||'依據待補'}`]);
 return rows;
}
