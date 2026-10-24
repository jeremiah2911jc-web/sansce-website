// Transcribed source inputs only. Calculations belong to the shared production core.
export const sources={
 fuzhong:'https://resource.iyp.tw/static.iyp.tw/37315/files/1844a186-2a60-4818-8ced-4b29c034c0ce.pdf',
 mingde:'https://youdraw.com.tw/wp-content/uploads/2024/05/新店區明德段321地號權利變換1130521.pdf'
};
const evidence=(source)=>({state:'documented',source,date:'2026-10-24'});
const decision=(area,source,deduction='')=>({status:'count',area,deduction,source});
const excluded=(source)=>({status:'exclude',area:'',source});
const unknown=()=>({status:'unknown',area:'',source:''});
function zone(id,name,area,source,road=false){return {id,name,parcel:name+'（文件分項合計，非單筆謄本）',parcelArea:area,area,zoningClass:road?'public':'standard',regime:'urban',plan:source,inclusion:road?'excluded':'included',evidence:evidence(source),coverage:'',far:'',maxHeight:'',constraints:'僅復核所列文件的土地基準量；非現行核准、用途或可售面積結論。',bonusMode:'unknown',bonuses:[],obligation:'',obligationSource:'',landBasis:{renewal:'inside',role:road?'publicRoad':'building',site:road?excluded(source):decision(area,source),far:road?excluded(source):decision(area,source),coverage:road?excluded(source):decision(area,source),openCredit:road?excluded(source):unknown(),tdr:{status:'unknown',area:'',receivingZone:'',source:''},procedures:[]}};}
function base(name,declaredArea,source){return {version:'mixed-zone.2026-10-24.v2',enabled:true,name,assessmentDate:'2026-10-24',designMode:'unknown',declaredArea,boundary:evidence(source),joint:'unknown',jointEvidence:evidence('此頁僅做文件分項量檢核，不據此認定全案核准'),layout:{municipality:'新北市',localPlan:source,openSpace:'unknown',volume:'unknown',conditions:'文件版本固定；不混用簡報、不同年度計畫或其他案件。',evidence:evidence(source)},reviews:[],zones:[],allocations:[],buildings:[]};}
export function publicCase(id){
 if(id==='fuzhong'){
 const s=sources.fuzhong+' 第11-13、11-15、11-17頁（檔名1844a186；發布日期未載）';
 const m=base('板橋府中段304｜計畫書第11章・土地基準量檢核', '9066',s);m.designMode='mixed';
 const b=zone('building','商業區建築基地合計','9060',s);Object.assign(b,{ntpcUse:'commercial',coverage:'70',far:'460'});b.landBasis.coverage=decision('9060',s+'；依11-15頁建蔽率公式扣現有巷道23.34㎡；11-17頁另有未扣除的表格，保留差異','23.34');
 m.zones=[b,zone('road','道路用地（依11-17頁土地面積表）','6',s,true)];return m;
 }
 const s=sources.mingde+' 第4、6頁（1130521檔案版）';const m=base('新店明德段321｜來源面積不一致檢核', '2606.62',s);
 const b=zone('building','第四種住宅區','2544.04',s);Object.assign(b,{ntpcUse:'residential',coverage:'50',far:'300'});m.zones=[b,zone('road','道路用地','52.58',s,true)];return m;
}
export const descriptions={
 fuzhong:'固定使用同一份第11章計畫書，復算原容積、表列獎勵、容移及逐層用途配置；表列合計與內文公式的差異分別呈現。這份資料不能證明現行核准額度。',
 mingde:'保留原文件總面積及兩個分項面積，不自行補差額或改數字。測試系統是否指出範圍面積不一致；簡報誤列板橋計畫的文字也不能作為新店法規適用依據。'
};
