import {reviewAboveGround,reviewRoofEnvelope,reviewBasementVolume,resolveBonusLimits,reviewEscapeStairs} from './generated/core.mjs';
export const MULTI_BUILDING_VERSION='multi-building.2026-11-03.v1';
const sum=(rows,key)=>rows.reduce((t,r)=>t+r[key],0);
const n=x=>typeof x==='number'?x:Number(String(x).trim());
const numeric=(x,max=1e7)=>x!==''&&x!==null&&x!==undefined&&Number.isFinite(n(x))&&n(x)>=0&&n(x)<=max;
const unique=a=>[...new Set(a.filter(Boolean))];
export function newBuilding(name='A棟'){
 return {id:crypto.randomUUID(),name,group:name,footprint:'400',height:'49',stairs:'2',lifts:'2',roof:{projection:'40',levels:'3',height:'3',registered:'100',qualified:true,elevator:true},source:'',floors:[newFloorGroup()]};
}
export function newFloorGroup(){return {id:crypto.randomUUID(),from:'1',to:'15',area:'400',equipment:'12',lobby:'24',balcony:'20',common:'31.5',parking:'0',units:'4',sale:'100',qualified:true};}
export function newBasement(){return {id:crypto.randomUUID(),level:'1',area:'600',cars:'15',motos:'0',car:'400',motorcycle:'0',bicycle:'0',community:'0',ramp:'100',equipment:'80',other:'20',houseCommon:'80',source:''};}
export function newMultiBuilding(){return {version:MULTI_BUILDING_VERSION,enabled:true,source:'',buildings:[newBuilding()],sharedFloors:[],basements:[newBasement()],reference:{source:'',salePing:'',gross:'',allowed:''},basis:'configuration'};}
// Data imported from a case file is bounded before expanding repeated floor groups.
export function multiBuildingShapeIssues(m){
 const errors=[],array=(v,max,min=0)=>Array.isArray(v)&&v.length>=min&&v.length<=max;
 if(!m||m.version!==MULTI_BUILDING_VERSION||typeof m.enabled!=='boolean'||!array(m.buildings,20,1)||!array(m.sharedFloors,50)||!array(m.basements,30)||typeof m.source!=='string'||!m.reference)return ['分棟資料格式或版本無效'];
 if(m.basis!==undefined&&!['configuration','schedule'].includes(m.basis))errors.push('分棟面積採用方式無效');
 const names=new Set();
 const ids=new Set(),checkId=r=>{if(!r||typeof r.id!=='string'||!r.id||ids.has(r.id))errors.push('分棟或樓層識別重複');else ids.add(r.id);};
 for(const b of m.buildings){if(!b||typeof b!=='object'){errors.push('棟別資料不完整');continue;}checkId(b);if(names.has(b.name))errors.push('棟別名稱重複');names.add(b.name);if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.group!=='string'||typeof b.source!=='string'||!array(b.floors,100,1)||!b.roof)errors.push('棟別資料不完整');else {for(const f of b.floors)checkId(f);if(['qualified','elevator'].some(k=>typeof b.roof[k]!=='boolean'))errors.push('屋突用途條件格式無效');}}
 for(const f of [...m.sharedFloors,...m.basements])checkId(f);
 for(const f of m.sharedFloors)if(f?.members!==undefined&&(!Array.isArray(f.members)||!f.members.length||new Set(f.members).size!==f.members.length||f.members.some(id=>!m.buildings.some(b=>b?.id===id))))errors.push('共用地上層參與棟別無效');
 if(m.referenceVersions!==undefined&&(!Array.isArray(m.referenceVersions)||m.referenceVersions.length>6||m.referenceVersions.some(r=>!r||typeof r.title!=='string'||typeof r.source!=='string'||['salePing','gross','allowed'].some(k=>r[k]!==''&&!numeric(r[k])))))errors.push('比較文件版本或面積格式無效');
 if(typeof m.reference.source!=='string'||['salePing','gross','allowed'].some(k=>m.reference[k]!==''&&!numeric(m.reference[k])))errors.push('參考面積請填有效非負數值');
 if(m.uncertainties!==undefined&&(!Array.isArray(m.uncertainties)||m.uncertainties.length>30||m.uncertainties.some(x=>typeof x!=='string'||x.length>500)))errors.push('待補資料格式無效');
 if(m.registration!==undefined){if(!m.registration||typeof m.registration.source!=='string'||!Array.isArray(m.registration.rows)||m.registration.rows.length>5000)errors.push('逐戶文件面積格式無效');else {const seen=new Set();for(const row of m.registration.rows){if(!row||typeof row.label!=='string'||!row.label.trim()||seen.has(row.label)||!numeric(row.ping))errors.push('逐戶識別或面積無效');else seen.add(row.label);}}}
 if(errors.length)return unique(errors);
 const qty=(r,keys)=>keys.some(k=>typeof r[k]!=='string'&&typeof r[k]!=='number'||r[k]!==''&&!numeric(r[k]));
 for(const b of m.buildings){if(qty(b,['footprint','height'])||['stairs','lifts'].some(k=>b[k]!==undefined&&!numeric(b[k],20))||qty(b.roof,['projection','levels','height','registered']))errors.push('棟別數值格式無效');for(const g of b.floors)if(qty(g,['from','to','area','equipment','lobby','balcony','common','parking','units','sale'])||typeof g.qualified!=='boolean')errors.push('樓層數值格式無效');}
 for(const g of m.sharedFloors)if(qty(g,['from','to','area','equipment','lobby','balcony','common','parking','units','sale'])||typeof g.qualified!=='boolean')errors.push('共用樓層數值格式無效');
 for(const b of m.basements)if(qty(b,['level','area','cars','motos','car','motorcycle','bicycle','community','ramp','equipment','other','houseCommon'])||typeof b.source!=='string')errors.push('地下用途數值格式無效');
 return unique(errors);
}
export function compareMultiReference(values,reference){
 return [['總樓地板面積','gross',values.totalWithoutBalcony,'㎡'],['房屋可售面積','salePing',values.salePing,'坪'],['允建容積','allowed',values.allowed,'㎡']].map(([label,key,actual,unit])=>{
  const expected=n(reference[key]),known=reference[key]!==''&&Number.isFinite(expected)&&expected>0;
  const difference=known?actual-expected:null,percent=known?Math.abs(difference)/expected*100:null;
  return {label,key,actual,expected:known?expected:null,difference,percent,unit,withinTolerance:known?percent<=.01+1e-10:null};
 });
}
export function calculateMultiBuilding(input){
 const m=input.multiBuilding,errors=multiBuildingShapeIssues(m),checks=[],notes=[],fieldIssues=[];
 const fail=()=>({errors:unique(errors),notes,values:null,multiBuilding:{version:MULTI_BUILDING_VERSION,checks,fieldIssues}});
 if(errors.length)return fail();
 if(input.mixedSite?.enabled||input.commercialIntensity?.enabled){errors.push('分棟量體請使用單一住宅分區；商業及混合分區沿用其獨立檢核流程');return fail();}
 for(const [key,label,max] of [['site','基地面積',1e6],['coverage','建蔽率',100],['far','容積率',3000]])if(!numeric(input[key],max)||n(input[key])<=0)errors.push(label+'請填有效正數');
 if(errors.length)return fail();
 const read=(row,key,label,max=1e7)=>{if(!numeric(row[key],max)){const message=label+'請填有效非負數值';errors.push(message);fieldIssues.push({message,field:(row.id||'')+':'+key});return 0;}return n(row[key]);};
 const integer=(row,key,label,max)=>{const v=read(row,key,label,max);if(!Number.isInteger(v)){const message=label+'請填整數';errors.push(message);fieldIssues.push({message,field:(row.id||'')+':'+key});}return v;};
 const regulatory=input.regulatoryReview;
 if(!regulatory?.bonusAssessment)return {...fail(),errors:['請先選擇重建獎勵路徑']};
 const bonus=resolveBonusLimits(regulatory,{renewal:n(input.renewal||0),danger:n(input.danger||0),tdr:n(input.tdr||0),scale:n(input.scale||0)},{site:n(input.site),far:n(input.far),district:input.parkingDesign?.district,tdrTarget:n(input.tdr||0),roadConditions:input.roadConditions});
 const base=n(input.site)*n(input.far)/100,allowed=base*(1+(bonus.renewal+bonus.danger+bonus.tdr+bonus.scale+(bonus.tod||0))/100);
 if(!Number.isFinite(allowed)||allowed<=0){errors.push(...bonus.errors,'容積條件尚未完整');return fail();}
 checks.push(...bonus.errors);notes.push(...bonus.notes);
 const rows=[],buildingRows=[],coverageByGroup=new Map();
 let expandedFloors=0;
 const expand=(groups,owner,footprint,shared=false)=>{
  const occupied=new Set();let count=0;
  for(const g of groups){const label=owner+'樓層',from=integer(g,'from',label+'起始',200),to=integer(g,'to',label+'結束',200);
   if(from<1||to<from||count+to-from+1>200||expandedFloors+to-from+1>2000){errors.push(owner+'樓層範圍無效或超過200層');continue;}
   const f={area:read(g,'area',label+'樓板'),equipment:read(g,'equipment',label+'機電'),lobby:read(g,'lobby',label+'梯廳'),balcony:read(g,'balcony',label+'陽台'),common:read(g,'common',label+'普通公設'),parking:read(g,'parking',label+'地上停車'),units:integer(g,'units',label+'戶數',2000),sale:read(g,'sale',label+'房屋登記比例',100)};
   if(f.area<=0)errors.push(owner+'樓板面積須大於0');
   if(f.equipment+f.lobby+f.parking+f.common>f.area+.001)errors.push(owner+'用途面積合計超過樓板');
   if(f.area>footprint+.01)checks.push(owner+'樓板超過本次建築投影面積，請核對退縮、外廊及量體');
   for(let floor=from;floor<=to;floor++){
    if(occupied.has(floor))errors.push(owner+'同一樓層重複列入');occupied.add(floor);
    const key=owner+':'+floor;rows.push({...f,key,owner,floor,shared,members:g.members,qualified:g.qualified===true});
   }count+=to-from+1;expandedFloors+=to-from+1;
  }return occupied;
 };
 for(const b of m.buildings){
  const footprint=read(b,'footprint',b.name+'建築投影'),height=read(b,'height',b.name+'高度',1000);
  const occupied=expand(b.floors,b.name,footprint),roof=b.roof;
  const floors=Math.max(1,...occupied),stairs=read({...b,stairs:b.stairs??'2'},'stairs',b.name+'樓梯座數',20),lifts=read({...b,lifts:b.lifts??'2'},'lifts',b.name+'電梯座數',20),stairReview=reviewEscapeStairs({aboveFloors:floors,abovePlate:Math.max(...b.floors.map(f=>n(f.area))),basementFloors:m.basements.length,basementPlates:m.basements.map(f=>n(f.area))}),levels=integer({...roof,id:b.id+':roof'},'levels',b.name+'屋突層數',3),projection=read({...roof,id:b.id+':roof'},'projection',b.name+'屋突投影'),floorHeight=read({...roof,id:b.id+':roof'},'height',b.name+'屋突層高',9),registered=read({...roof,id:b.id+':roof'},'registered',b.name+'屋突登記比例',100);
  const review=reviewRoofEnvelope({version:'roof-envelope.2026-10-19.v1',classification:'auto',qualifiedUses:roof.qualified===true,elevatorRoofOnly:true,source:b.source},{footprint,aboveFloors:floors,buildingHeight:height,roofFloors:levels,floorHeight,elevator:roof.elevator===true,registrationPercent:registered});
  if(!Number.isInteger(stairs)||!Number.isInteger(lifts))errors.push(b.name+'樓梯與電梯座數須為整數');
  if(stairs<stairReview.aboveMinimum)checks.push(b.name+'樓梯數少於本次樓層與面積條件的參考需求');
  checks.push(...review.errors.map(x=>b.name+'：'+x));
  if(projection>review.projectionLimit+.001)checks.push(b.name+'屋突投影超過本棟適用上限');
  if(projection>footprint+.001)checks.push(b.name+'屋突投影超過本棟建築投影');
  if(!levels&&projection>0)checks.push(b.name+'未設屋突樓層，投影未列入樓板');
  const group=b.group.trim()||b.id;coverageByGroup.set(group,(coverageByGroup.get(group)||0)+footprint);
  buildingRows.push({id:b.id,name:b.name,group,floors,footprint,height,stairs,lifts,stairReview,roofProjection:projection,roofArea:projection*levels,roofRegistered:projection*levels*registered/100,roofReview:review,roofCounted:levels&&(review.errors.length||projection>review.projectionLimit+.001)?projection*levels:0,occupied});
 }
 expand(m.sharedFloors,'共用地上層',n(input.site),true);
 // Explicit common podium rows are entered once; tower rows cannot also occupy those floors.
 for(const shared of rows.filter(r=>r.shared))for(const b of buildingRows)if((!shared.members||shared.members.includes(b.id))&&b.occupied.has(shared.floor))errors.push(b.name+'與共用地上層重複，請分開樓層範圍');
 for(const [group,plate] of coverageByGroup){const members=buildingRows.filter(b=>b.group===group),high=members.some(b=>b.floors>=16||b.height>=50),cap=plate*(high?.15:.125);if(sum(members,'roofProjection')>cap+.001){checks.push(group+'屋突投影聯集超過本次幢別上限');for(const b of members)b.roofCounted=b.roofArea;}}
 const platesByLevel=new Map();for(const r of rows)platesByLevel.set(r.floor,(platesByLevel.get(r.floor)||0)+r.area);
 const footprint=Math.max(sum(buildingRows,'footprint'),...platesByLevel.values());
 if(footprint>n(input.site)*n(input.coverage)/100+.01)checks.push('全案建築投影合計超過法定建築面積');
 if(errors.length)return fail();
 // One equipment allowance for the site, allocated over all towers and the common podium.
 if(input.stair==='single'&&(buildingRows.length!==1||buildingRows.some(b=>b.stairReview.aboveMinimum>1)))checks.push('本案棟數或樓梯需求與單棟單梯10%條件不同，請核對全案機電免計條件');
 const equipmentCap=allowed*(input.stair==='single'&&buildingRows.length===1?.10:.15);
 const above=reviewAboveGround({used:1e12,equipmentCap,footprint:n(input.site),review:{floors:rows.map(r=>({label:r.key,floorArea:r.area-r.parking,equipment:r.equipment,equipmentEligible:r.qualified?r.equipment:0,lobby:r.lobby,balcony:r.balcony,lobbyQualified:r.qualified,balconyQualified:r.qualified}))}});
 checks.push(...above.errors);
 const levels=new Set(),basements=[];
 for(const row of m.basements){
  const level=integer(row,'level','地下樓層',30);if(level<1||levels.has(level))errors.push('地下室樓層重複或無效');levels.add(level);
  const b={level,area:read(row,'area','地下樓板'),cars:integer(row,'cars','地下汽車位',10000),motos:integer(row,'motos','地下機車位',20000)};
  for(const k of ['car','motorcycle','bicycle','community','ramp','equipment','other','houseCommon'])b[k]=read(row,k,'地下'+({car:'汽車空間',motorcycle:'機車空間',bicycle:'自行車空間',community:'裝卸空間',ramp:'共用車道',equipment:'設備梯間',other:'其他空間',houseCommon:'房屋共有分攤'})[k]);
  if(Math.abs(b.car+b.motorcycle+b.bicycle+b.community+b.ramp+b.equipment+b.other-b.area)>.02)errors.push('B'+level+'用途分項合計須等於樓板面積');
  const served=b.car+b.motorcycle+b.bicycle+b.community,carRamp=served>0?b.ramp*b.car/served:b.ramp;
  if(b.houseCommon>b.area-b.car-carRamp+.001)errors.push('B'+level+'房屋共有分攤超過扣除汽車與其服務車道後的空間');
  if(b.cars>0&&b.car===0)checks.push('B'+level+'已填汽車位，汽車空間面積待分列');
  if(b.motos>0&&b.motorcycle===0)checks.push('B'+level+'已填機車位，機車空間面積待分列');
  if(b.other===b.area&&b.area>0)checks.push('B'+level+'用途面積尚未分列；本次全層暫計容，房屋共有面積待補');
  basements.push(b);
 }
 if(errors.length)return fail();
 const basement=sum(basements,'area'),b1=basements.find(b=>b.level===1);
 const pools={basement,carArea:sum(basements,'car'),motoArea:sum(basements,'motorcycle'),bikeArea:sum(basements,'bicycle'),communityArea:sum(basements,'community'),rampTotal:sum(basements,'ramp'),lossArea:0,spareArea:sum(basements,'other'),equipmentArea:sum(basements,'equipment'),cars:sum(basements,'cars'),undergroundFlatCars:sum(basements,'cars'),mechanicalArea:0};
 const below=reviewBasementVolume({...regulatory,shelterArea:'0',shelterEquipment:'0'},pools,above.equipmentExempt,equipmentCap,{footprint,plate:b1?.area||0,equipmentPerFloor:b1?.equipment||0,shelterOnly:0});
 if(!below.balanced)checks.push('地下計容及免計面積合計不符樓板，請核對用途分項');
 const aboveFloor=sum(rows,'area'),balcony=sum(rows,'balcony'),roof=sum(buildingRows,'roofArea'),roofSale=sum(buildingRows,'roofRegistered');
 const aboveSale=rows.reduce((t,r)=>t+(r.area-r.parking+r.balcony)*r.sale/100,0),belowSale=sum(basements,'houseCommon');
 const sale=aboveSale+roofSale+belowSale,common=rows.reduce((t,r)=>t+(r.equipment+r.lobby+r.common)*r.sale/100,0)+roofSale+belowSale;
 const roofCounted=sum(buildingRows,'roofCounted'),counted=above.counted+below.counted+roofCounted,unused=allowed-counted;
 if(roofCounted>0)checks.push('未符合本次屋突免計條件的樓板'+roofCounted.toFixed(2)+'㎡暫計入容積，資格及修正配置待核對');
 if(unused<-.02)checks.push('分棟與共用地下室計容合計超過允建容積');
 const values={base,allowed,sale,salePing:sale*.3025,common,commonRatio:sale>0?common/sale*100:0,units:sum(rows,'units'),cars:pools.cars,motos:sum(basements,'motos'),floors:Math.max(0,...levels),equivalentFloors:Math.max(...buildingRows.map(b=>b.floors)),basement,roof,balcony,aboveWithoutBalcony:aboveFloor+roof,totalWithoutBalcony:aboveFloor+roof+basement,aboveCounted:above.counted+roofCounted,roofCounted,basementCounted:below.counted,unused,renewalApplied:bonus.renewal,dangerApplied:bonus.danger,tdrApplied:bonus.tdr,scaleApplied:bonus.scale,todApplied:bonus.tod||0};
 for(const b of buildingRows){const own=rows.filter(r=>r.owner===b.name);Object.assign(b,{floorArea:sum(own,'area'),balcony:sum(own,'balcony'),units:sum(own,'units'),sale:own.reduce((t,r)=>t+(r.area-r.parking+r.balcony)*r.sale/100,0)+b.roofRegistered});delete b.occupied;}
 const registration=m.registration?.rows?.length?{units:m.registration.rows.length,salePing:sum(m.registration.rows.map(r=>({ping:n(r.ping)})),'ping'),source:m.registration.source}:null;
 if(registration&&registration.salePing/.3025>aboveFloor+balcony+roof+basement+.02)checks.push('逐戶文件登記面積超過本次全案樓板及陽台，請核對版本及登記範圍');
 if(registration&&registration.units!==values.units)checks.push('逐戶文件戶數與分棟戶數不同');
 const pending=[...(m.uncertainties||[]),'預設值供初步配置，請依基地現況、預計戶數與停車方式調整','不同版本文件的面積分開比較；差異率僅檢查本次輸入的加總差異','逐層用途、免計資格及登記比例依圖說與分配文件核對','共用地下室只列入全案一次；房屋共有分攤依本次輸入列計','停車位採已填配置數量；各用途法定需求、無障礙、坡道及排位另依圖說核對'];
 if(!m.source.trim()||m.buildings.some(b=>!b.source.trim()))pending.push('部分面積採規劃預設值，來源文件待補');
 return {errors:[],values,notes:unique(notes),regulatory:{bonus},multiBuilding:{version:MULTI_BUILDING_VERSION,basis:m.basis||'configuration',buildings:buildingRows,shared:rows.filter(r=>r.shared),rows,basements,equipmentCap,above,below,checks:unique(checks),fieldIssues,pending,registration,reference:compareMultiReference(values,m.reference),referenceSets:[{title:'主要比較文件',source:m.reference.source,rows:compareMultiReference(values,m.reference)},...(m.referenceVersions||[]).map(r=>({title:r.title||'其他比較文件',source:r.source,rows:compareMultiReference(values,r)}))]}};
}
