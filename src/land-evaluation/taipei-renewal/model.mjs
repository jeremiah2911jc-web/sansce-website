export const TAIPEI_RENEWAL_VERSION='taipei-renewal.2026-11-02.v1';
export const TAIPEI_RENEWAL_REVIEWED_AT='2026-11-02';
export const taipeiRenewalLaw='https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL036875';
export const taipeiRenewalTable='https://laws.gov.taipei/Law/File/0000350269';
export const renewalArticle65='https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070008&flno=65';
const n=(key,label)=>({key,label,type:'number'}),c=(key,label)=>({key,label,type:'condition'});
export const taipeiRenewalItems=[
 {id:'design1',title:'建築規劃設計（一）',pages:'附表第1至2頁',rule:'六項條件符合3項給1%、4項給2%、5項以上給3%。住宅區的開放空間廣場不列入條件數；通道、廣場及半戶外空間分別劃定範圍。',fields:[c('setback','鄰8m以下道路退縮，自法定人行道及高度比範圍外再退縮達2m'),c('boundary','鄰地境界平均距離達3m、最小淨寬達2m'),c('passage','公眾通道寬4m、最小淨寬2.5m，兩端銜接公設或道路，且超出法定通道'),c('plaza','法定空地外另設公眾廣場達200㎡、邊寬8m、長寬比不逾3'),c('semiOutdoor','公眾半戶外空間樑下淨高6m、面積36㎡、邊寬6m、長寬比不逾3；商業區位於街角'),c('facade','建築斜對角平均距離未超45m，或已以立面設計避免連續牆面'),c('spacesDistinct','所列通道、廣場與半戶外空間的範圍分開'),c('passageEligible','通道超出法定應留範圍，且範圍屬可申請的巷道或空間') ]},
 {id:'rain',title:'建築規劃設計（二）：雨水貯留',pages:'附表第2頁',rule:'設置量達法定雨水貯留量2倍以上，給基準容積1%；須附設施、排水分析及圖說。',fields:[n('required','法定雨水貯留量（m³）'),n('provided','本案設置貯留量（m³）'),c('plans','已規劃設施、排水分析與相關圖說')]},
 {id:'walk',title:'建築規劃設計（三）：人行道路與騎樓',pages:'附表第2至4頁',rule:'可採計人行道路面積×1，加可採計騎樓面積×1.8。淨寬須在2至6m，法定應留面積、容移回饋開放空間、汽車出入口、停車彎、通道、自行車位及阻礙通行植栽等先扣除；主要出入口扣2m寬，高層緩衝通道至少3.5m寬並依實際車道扣除，共用範圍扣一次。',fields:[n('roadGross','人行道路留設面積（㎡）'),n('roadDeduct','人行道路應扣除面積（㎡）'),n('arcadeGross','騎樓留設面積（㎡）'),n('arcadeDeduct','騎樓應扣除面積（㎡）'),n('minWidth','各部分最小淨寬（m）'),n('maxWidth','各部分最大淨寬（m）'),c('continuity','沿街面留設並與周邊街廓連續'),c('excess','已扣除法定應留範圍及附表列明不得採計面積'),c('permeable','無遮簷部分採滲透設計'),c('architect','設計由建築師簽證'),c('publicUse','順平、標示並開放公眾使用，維護義務納入規約')]},
 {id:'principles',title:'建築規劃設計（四）：建築設計審議原則',pages:'附表第4頁',rule:'符合都更及爭議處理審議會通案重要審議原則之建築設計類別全部原則，給基準容積3%。',fields:[c('allPrinciples','符合本案適用之建築設計類別全部通案重要審議原則')]},
 {id:'green',title:'建築規劃設計（五）：屋頂及立面綠化',pages:'附表第4至6頁',rule:'依臺北市新建建築物綠化實施規則第5條計算，綠覆率達法定1.6倍給2%、1.8倍給3%、2倍給4%；屋頂及立面綠覆面積須占總綠覆面積至少一半。同一植栽與中央綠建築綠化量分開採計。',fields:[n('requiredRate','本案法定綠覆率（%）'),n('providedRate','本案設計綠覆率（%）'),n('totalGreen','總綠覆面積（㎡）'),n('roofFacade','屋頂與立面垂直綠覆面積（㎡）'),c('location','立面綠化位置符合臨路、公設、指定建築線巷道或6m間距條件'),c('maintenance','已規劃使照前繳納公共基金20%的維護費、管理計畫交付及規約義務')]},
 {id:'environment',title:'改善都市環境：整修騎樓或人行道',pages:'附表第6至7頁',rule:'同一或毗鄰街廓每整修1棟建築物，給基準容積0.25%；須全體權利人同意、建築師圖說，並採報核當年度市議會審定單價、附完工成果圖說，經費不申請政府補助。',fields:[n('buildings','符合條件的整修建築物棟數'),c('block','位於同一街廓或隔都市計畫道路的對側街廓'),c('consent','核定前取得土地及建物全體權利人同意施作與自行維護文件'),c('noSubsidy','整修經費不申請政府或其他機關補助'),c('architect','備妥建築師簽證及圖說，經費按當年度市議會審定單價')]},
 {id:'charging',title:'新技術應用：增設充電車位',pages:'附表第7頁',rule:'法定數量以外增設的充電汽、機車位，合計達法定停車位總數3%以上，給基準容積1%；申請獎勵的車位須為社區共用並計入共用產權及管理規約。',fields:[n('legalCars','法定汽車位數'),n('legalMotos','法定機車位數'),n('extraCars','法定數量以外的共用充電汽車位數'),n('extraMotos','法定數量以外的共用充電機車位數'),c('common','獎勵車位為社區共用且產權計入共用部分'),c('rules','充電管理規範納入住戶管理規約')]},
 {id:'fund',title:'促進都市更新（一）：提供都更基金',pages:'附表第7至8頁',rule:'獎勵容積＝提供經費÷（報核當期基地面積加權平均公告現值×0.7）。核定時簽訂契約，領使照前完成提供經費。',fields:[n('awardedArea','依案件文件採用的獎勵容積（㎡）'),c('obligations','已規劃核定時簽約及使照前提供經費的義務')]},
 {id:'old',title:'促進都市更新（二）：30年以上四、五層合法建物',pages:'附表第8頁',rule:'合法屋齡達30年，四層給所屬基地基準容積2%、五層給4%；並須無電梯，或法定車位數低於戶數70%。各棟按適用基地分別計算。',fields:[]}
];
const blankItem=item=>({enabled:false,...Object.fromEntries(item.fields.map(field=>[field.key,field.type==='condition'?'unknown':''])),...(item.id==='old'?{buildings:[]}:{}),...(item.id==='fund'?{basis:'document',donation:'',meanValue:''}:{})});
export function newTaipeiRenewal(){return {version:TAIPEI_RENEWAL_VERSION,enabled:false,mode:'general',zone:'unknown',evidence:'estimate',source:'',sourceDate:'',strategyDistrict:'unknown',publicMethod:'unknown',unitArea:'',capRoute:'twoBase',originalVolume:'',originalSource:'',housingApproved:'unknown',spaceMode:'unknown',greenMode:'unknown',separationSource:'',localDeduction:'',deductionSource:'',items:Object.fromEntries(taipeiRenewalItems.map(item=>[item.id,blankItem(item)]))};}
export function newTaipeiOldBuilding(){return {id:crypto.randomUUID(),name:'',legal:'unknown',age:'',floors:'',area:'',elevator:'unknown',legalCars:'',units:''};}
const object=x=>x&&typeof x==='object'&&!Array.isArray(x),condition=x=>['unknown','yes','no'].includes(x),text=x=>typeof x==='string'&&x.length<=12000;
export function isTaipeiRenewal(m){
 if(!object(m)||m.version!==TAIPEI_RENEWAL_VERSION||typeof m.enabled!=='boolean'||!['general','strategy','housing'].includes(m.mode)||!['unknown','residential','commercial','other'].includes(m.zone)||!['estimate','documented','verified'].includes(m.evidence)||!object(m.items))return false;
 if(!['source','sourceDate','unitArea','originalVolume','originalSource','separationSource','localDeduction','deductionSource'].every(key=>text(m[key]))||!['strategyDistrict','publicMethod','housingApproved'].every(key=>condition(m[key]))||!['twoBase','originalPlusHalf'].includes(m.capRoute)||!['unknown','distinct','design1','design3'].includes(m.spaceMode)||!['unknown','distinct','central'].includes(m.greenMode))return false;
 return taipeiRenewalItems.every(item=>{const x=m.items[item.id];if(!object(x)||typeof x.enabled!=='boolean'||!item.fields.every(field=>field.type==='condition'?condition(x[field.key]):text(x[field.key])))return false;if(item.id==='fund'&&(!['document','money'].includes(x.basis)||!text(x.donation)||!text(x.meanValue)))return false;if(item.id==='old')return Array.isArray(x.buildings)&&x.buildings.length<=100&&new Set(x.buildings.map(b=>b.id)).size===x.buildings.length&&x.buildings.every(b=>object(b)&&['id','name','age','floors','area','legalCars','units'].every(k=>text(b[k]))&&!!b.id&&condition(b.legal)&&condition(b.elevator));return true;});
}
export function taipeiRenewalApplies(a,c){return !!(a?.taipei?.enabled&&a.route==='renewal'&&a.renewalMode==='detail'&&a.awardBasis!=='permitted'&&(c.district?/臺北|台北/.test(c.district):a.tdrApplication?.city==='taipei'));}
const dateValid=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export function reviewTaipeiRenewal(m,context={}){
 const errors=[],notes=[],rows=[],base=Number(context.site)*Number(context.far)/100,active=!!m?.enabled;
 const result={active,base:Number.isFinite(base)&&base>0?base:null,rows,errors,notes,raw:null,applied:null,localCap:20,multiplier:1,totalCap:50,totalApplied:null,source:m?.source||'',reviewedAt:TAIPEI_RENEWAL_REVIEWED_AT};
 if(!active)return {...result,raw:0,applied:0};
 if(!isTaipeiRenewal(m)){errors.push('臺北地方獎勵資料不完整，請重新填寫。');return result;}
 if(!(base>0&&Number.isFinite(base)))errors.push('臺北地方獎勵須先填寫基地面積與基準容積率。');
 if(!dateValid(context.date))errors.push('請填寫預計報核日期。');else if(context.date<'2023-09-18')errors.push('報核日期早於本次採用附表施行日2023-09-18，請依該案適用版本或既有核准文件對照。');
 if(m.sourceDate&&(!dateValid(m.sourceDate)||m.sourceDate>TAIPEI_RENEWAL_REVIEWED_AT||dateValid(context.date)&&m.sourceDate>context.date))errors.push('地方獎勵文件日期須為有效日期，且在本次查核日及報核日以前。');
 if(m.evidence!=='estimate'&&(!m.source.trim()||!dateValid(m.sourceDate)))errors.push('文件記載或已核對圖說的地方獎勵，請填寫文件名稱及日期。');
 const read=(value,label,{positive=false,integer=false}={})=>{if(typeof value!=='string'||!value.trim()||!Number.isFinite(Number(value))||Number(value)<0||positive&&Number(value)<=0||integer&&!Number.isInteger(Number(value))){errors.push(label+'請填'+(positive?'大於0的':'有效非負')+(integer?'整數。':'數值。'));return null;}return Number(value);};
 const flags=(x,keys,title,fields=[])=>{if(keys.some(key=>x[key]==='no'))return false;let known=true;for(const key of keys)if(x[key]!=='yes'){errors.push(title+'：'+(fields.find(f=>f.key===key)?.label||key)+'待確認。');known=false;}return known;};
 if(m.mode==='strategy'){
  const unit=read(m.unitArea,'策略性更新單元面積',{positive:true});
  if(m.strategyDistrict!=='yes'||m.publicMethod!=='yes'||!m.source.trim()||!dateValid(m.sourceDate)||unit===null||unit<10000)errors.push('策略性更新加倍須有第8條劃定文件、第12條第1項辦理方式，且本次更新單元面積達10000㎡；請核對面積及文件。');
  else {result.multiplier=2;result.localCap=40;result.totalCap=100;if(m.capRoute==='originalPlusHalf'){const original=read(m.originalVolume,'策略性更新合法原建築容積',{positive:true});if(!m.originalSource.trim())errors.push('請填策略性更新原建築容積的合法性、範圍與文件依據。');if(original!==null&&base>0){const cap=(original/base-.5)*100;if(cap<0)errors.push('所選原容積加0.5倍基準路徑低於基準容積，請核對路徑。');else result.totalCap=cap;}}}
 }
 if(m.mode==='housing'){
  if(m.housingApproved!=='yes'||!m.source.trim()||!dateValid(m.sourceDate))errors.push('整建住宅須填本府核定更新單元的文件及日期。');
  rows.push({id:'housing',title:'第3條核定整建住宅',selected:true,quantity:errors.length?null:base*.2,percent:errors.length?null:20,basis:'依核定整宅更新單元採地方獎勵20%；本次不加計第2條附表。',status:m.evidence==='estimate'?'待核對核定文件':'依所附核定文件'});
 }else{
  for(const item of taipeiRenewalItems){const x=m.items[item.id];if(!x.enabled)continue;const start=errors.length;let percent=0,basis=item.rule,quantity=null;
   const amount=(key,options)=>read(x[key],item.title+'／'+(item.fields.find(f=>f.key===key)?.label||key),options);
   const check=keys=>flags(x,keys,item.title,item.fields);
   if(item.id==='design1'){
    const keys=['setback','boundary','passage','plaza','semiOutdoor','facade'];let count=0;
    for(const key of keys){if(x[key]==='unknown')errors.push(item.title+'／'+item.fields.find(f=>f.key===key).label+'待確認。');if(x[key]==='yes')count++;}
    if(m.zone==='unknown')errors.push('請選擇本案使用分區類型。');
    if(m.zone==='residential'&&x.plaza==='yes'){count--;notes.push('住宅區的廣場條件不列入建築規劃設計（一）條件數。');}
    if(x.passage==='yes'&&!flags(x,['passageEligible'],item.title,item.fields))count--;
    if([x.passage,x.plaza,x.semiOutdoor].filter(v=>v==='yes').length>1&&!flags(x,['spacesDistinct'],item.title,item.fields))errors.push('通道、廣場及半戶外空間須分開劃定範圍。');
    if(m.items.walk.enabled&&x.passage==='yes'&&m.spaceMode==='design3')count--;
    percent=count>=5?3:count===4?2:count===3?1:0;basis=`採計${Math.max(0,count)}項條件，基準容積×${percent}%。`;
   }
   if(item.id==='rain'){if(check(['plans'])){const required=amount('required',{positive:true}),provided=amount('provided');if(required!==null&&provided!==null){percent=provided>=required*2?1:0;basis=`設置${provided}m³／法定${required}m³；達2倍給1%。`;}}}
   if(item.id==='walk'){
    if(check(['continuity','excess','permeable','architect','publicUse'])){
     const rg=amount('roadGross'),rd=amount('roadDeduct'),ag=amount('arcadeGross'),ad=amount('arcadeDeduct'),min=amount('minWidth',{positive:true}),max=amount('maxWidth',{positive:true});
     if([rg,rd,ag,ad,min,max].every(v=>v!==null)){if(rd>rg||ad>ag)errors.push('人行道路或騎樓扣除面積超過留設面積。');else if(rg+ag>Number(context.site)+1e-8)errors.push('人行道路與騎樓面積合計超過本案基地，請核對重疊範圍。');else if(min>max)errors.push('人行空間的最小淨寬超過最大淨寬。');else if(min>=2&&max<=6){quantity=rg-rd+(ag-ad)*1.8;percent=base>0?quantity/base*100:0;basis=`人行道路(${rg}−${rd})×1＋騎樓(${ag}−${ad})×1.8＝${quantity}㎡。`;}else basis='淨寬未達2m或超過6m，本項採0。';}
    }
    if(m.items.design1.enabled&&m.items.design1.passage==='yes'&&m.spaceMode==='design1'){quantity=0;percent=0;basis='同一通道採建築規劃設計（一），本項重複範圍不加計。';}
   }
   if(item.id==='principles'){if(check(['allPrinciples'])){if(!m.source.trim())errors.push('建築設計審議原則須填本案適用的審議原則、圖說或審議文件。');percent=3;}}
   if(item.id==='green'){
    if(check(['location','maintenance'])){const required=amount('requiredRate',{positive:true}),provided=amount('providedRate'),total=amount('totalGreen',{positive:true}),roof=amount('roofFacade');if([required,provided,total,roof].every(v=>v!==null)){if(roof>total)errors.push('屋頂及立面綠覆面積超過總綠覆面積。');else if(roof*2>=total){percent=provided>=required*2?4:provided>=required*1.8?3:provided>=required*1.6?2:0;basis=`綠覆率${provided}%／法定${required}%；屋頂及立面${roof}／總綠覆${total}㎡。`;}else basis='屋頂及立面綠覆面積未達總綠覆面積一半，本項採0。';}}
    if(context.centralGreen){if(m.greenMode==='central'){percent=0;basis='本批植栽採中央綠建築綠化量，本項不加計。';}else if(m.greenMode!=='distinct'||!m.separationSource.trim())errors.push('地方綠化與中央綠建築同時申請時，請區分植栽範圍並填圖說依據。');}
   }
   if(item.id==='environment'){if(check(['block','consent','noSubsidy','architect'])){const count=amount('buildings',{integer:true});if(count!==null){percent=count*.25;basis=`${count}棟×0.25%。`;}}}
   if(item.id==='charging'){if(check(['common','rules'])){const cars=amount('legalCars',{integer:true}),motos=amount('legalMotos',{integer:true}),extraCars=amount('extraCars',{integer:true}),extraMotos=amount('extraMotos',{integer:true});if([cars,motos,extraCars,extraMotos].every(v=>v!==null)){const legal=cars+motos,extra=extraCars+extraMotos;if(legal<=0)errors.push('法定停車位總數須大於0。');else{percent=extra*100>=legal*3?1:0;basis=`法定汽機車${legal}位，額外共用充電${extra}位；至少需${Math.ceil(legal*.03)}位。`;}}}}
   if(item.id==='fund'){if(check(['obligations'])){if(!m.source.trim()||!dateValid(m.sourceDate))errors.push('提供都更基金獎勵請填案件文件名稱及日期。');if(x.basis==='money'){const donation=read(x.donation,'提供都更基金金額'),value=read(x.meanValue,'報核日基地加權平均公告現值',{positive:true});if(donation!==null&&value!==null){quantity=donation/(value*.7);basis='提供經費÷（報核當期基地面積加權平均公告現值×0.7）。';}}else{quantity=amount('awardedArea');basis='依案件文件記載或評估之獎勵容積面積採計。';}if(quantity!==null&&base>0)percent=quantity/base*100;}}
   if(item.id==='old'){
    let area=0,weighted=0;const parts=[];
    if(!x.buildings.length)errors.push('請新增30年以上四、五層合法建築物資料。');
    for(const [index,b]of x.buildings.entries()){
     const label=item.title+'／'+(b.name||`第${index+1}棟`);if(b.legal==='no'){parts.push((b.name||`第${index+1}棟`)+'不具合法建物資格，採0。');continue;}if(b.legal!=='yes')errors.push(label+'合法建築物資格待確認。');
     const age=read(b.age,label+'屋齡'),floors=read(b.floors,label+'樓層',{positive:true,integer:true}),land=read(b.area,label+'坐落且不重疊的適用基地面積',{positive:true});if(land!==null)area+=land;
     if(age!==null&&floors!==null&&land!==null){if(age<30||![4,5].includes(floors)){parts.push(`${b.name||`第${index+1}棟`}屋齡或層數未符，採0。`);continue;}let qualified=b.elevator==='no';if(!qualified&&b.legalCars.trim()&&b.units.trim()){const cars=read(b.legalCars,label+'法定車位',{integer:true}),units=read(b.units,label+'戶數',{positive:true,integer:true});qualified=cars!==null&&units!==null&&cars*10<units*7;}else if(!qualified&&b.elevator==='unknown')errors.push(label+'電梯或車位低於戶數70%的條件待確認。');else if(!qualified&&(!b.legalCars.trim()||!b.units.trim()))errors.push(label+'請填法定車位與戶數，或確認無電梯。');const rate=age>=30&&qualified?(floors===4?2:floors===5?4:0):0;weighted+=land*Number(context.far)/100*rate/100;parts.push(`${b.name||`第${index+1}棟`}：${land}㎡基地×${context.far}%×${rate}%。`);}
    }
    if(area>Number(context.site)+1e-8)errors.push('四、五層建物適用基地面積合計超過全案基地，請扣除重疊範圍。');quantity=weighted;percent=base>0?weighted/base*100:0;basis=parts.join(' ');
   }
   if(quantity===null&&base>0)quantity=base*percent/100;
   const missing=errors.length>start;rows.push({id:item.id,title:item.title,selected:true,quantity:missing?null:quantity,percent:missing?null:percent,basis,status:missing?'待補資料':percent===0?'本次條件採0':m.evidence==='estimate'?'依規劃條件估算':m.evidence==='verified'?'已依所附資料核對':'依文件記載'});
  }
  if(m.items.design1.enabled&&m.items.design1.passage==='yes'&&m.items.walk.enabled){if(m.spaceMode==='unknown')errors.push('通道與沿街人行空間同時申請，請選擇不同範圍，或指定同一範圍採用的獎勵項目。');if(m.spaceMode==='distinct'&&!m.separationSource.trim())errors.push('請填通道與沿街人行空間分開劃設的圖說或範圍依據。');}
 }
 const deduction=m.mode!=='housing'&&m.localDeduction.trim()?read(m.localDeduction,'地方獎勵應扣除的重複面積'):0;
 if(deduction>0&&!m.deductionSource.trim())errors.push('地方獎勵扣除面積須填重複項目及扣除依據。');
 if(!errors.length&&rows.every(row=>row.percent!==null)){
  const sum=rows.reduce((total,row)=>total+row.percent,0);if(deduction/base*100>sum+1e-8)errors.push('地方獎勵扣除面積超過各項獎勵合計。');
  else{result.raw=Math.max(0,sum-deduction/base*100);result.applied=Math.min(result.localCap,result.raw*result.multiplier);result.totalApplied=Math.max(0,Math.min(result.totalCap,Number(context.centralPercent||0)+result.applied-Number(context.deductionPercent||0)));}
 }
 if(context.renewalQualification==='no'){result.raw=0;result.applied=0;result.totalApplied=0;errors.length=0;notes.push('本案都更資格已填不適用，地方都更獎勵採0。');}
 notes.push(`臺北地方獎勵採${m.mode==='housing'?'第3條核定整宅':m.mode==='strategy'?'第4條策略性更新':'第2條附表一般'}條件；地方上限${result.localCap}%，倍率${result.multiplier}；中央與地方合計上限${result.totalCap}%。`);
 return result;
}
export function applyTaipeiRenewal(existing,a,c){
 const centralPercent=existing.renewalRaw-existing.localApplied,green=a.entries?.['u-green'];
 const taipei=reviewTaipeiRenewal(a.taipei,{...c,date:a.date,centralPercent,deductionPercent:Number(a.deduction)||0,centralGreen:!!green?.choice&&green.status!=='excluded',renewalQualification:a.renewalQualification});
 return {...existing,taipei,localRaw:taipei.raw??0,localApplied:taipei.applied??0,renewalRaw:centralPercent+(taipei.applied??0),renewal:taipei.totalApplied??0,errors:[...existing.errors,...taipei.errors],notes:[...existing.notes.filter(note=>!note.startsWith('都更中央')&&!note.startsWith('目前非新北')&&!note.startsWith('危老第')), ...taipei.notes]};
}
