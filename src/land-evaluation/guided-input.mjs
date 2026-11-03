import {planningAssumptionsTemplate,planningFields} from './generated/core.mjs';
import {planningFieldApplied} from './applied-planning-fields.mjs';

export const GUIDED_INPUT_VERSION='planning-defaults.2026-11-03.v1';
export const planningHelp={
 site:'依土地謄本或本次納入的地號面積合計填寫；留白無法估算開發面積。',
 coverage:'填使用分區及都市計畫規定的建蔽率，例如50%；留白無法估算建築面積。',
 far:'填基地適用的基準容積率，例如300%；留白無法計算容積。',
 renewal:'填預計爭取的都更獎勵比例，例如50%；資格與細項待查時，結果依目標比例初估。',
 danger:'填預計爭取的危老獎勵比例；細項評定會依所選項目及法定上限計算。',
 tdr:'填預計移入的容積比例，例如25%；接受基地、道路及取得方式仍須查證。',
 scale:'填本案另採用的土管或規模獎勵比例；沒有規劃請填0，同一事項的獎勵須扣除重複部分。',
 coverageUse:'規劃建築面積占法定可建面積的比例。預設80%供量體初估，可依退縮與配置調整。',
 volumeUse:'本次打算使用的容積比例，預設100%；調低會減少規劃樓板。',
 balcony:'預設各層樓板的5%作陽台；計算仍依逐層免計限制檢討。',
 roofFloors:'預設屋突3層，供樓梯、電梯及設備配置；不設可填0。投影、高度與用途依所選條件檢核。',
 roofHeight:'預設每層3m；依屋突設備及圖說調整，層高會影響合法高度檢核。',
 unitPing:'含地上公設與陽台，不含屋突及地下室；修改後重新推估戶數與停車需求。',
 storePercent:'純住宅填0%；規劃店舖時，填其占地上樓板的比例，並選擇適用的停車規定。',
 motoPerUnit:'每戶暫按1位估算，可依產品規劃調整；法定需求另依地區規定檢討。',
 extraCars:'基本需求之外增設的汽車位數；不增設填0，增加後重新估算地下室。',
 basementSalePercent:'預設符合登記條件的地下設備、梯間全數分攤至房屋公設。依測量及分配文件調整；0%表示本次不列入。',
 excavation:'依地下室配置填開挖比例；採需求檢討時由系統計算，仍受法規上限限制。',
 excavationCap:'個案都市計畫另有開挖上限時填寫並附來源；留白沿用所選地區規則。',
 basementFloors:'固定層數模式預設4層；需求檢討模式依車位及空間需求計算。',
 reserve:'固定層數模式預設0%；採分項設備房配置時，此比例不另加。',
 'quantity.basementReservePercent':'固定地下層數時，預設樓板25%供設備、梯間等空間；可依設計修改。需求檢討模式另按分項空間計算。',
 'parking.floorHeight':'預設地下每層3.2m供平面停車配置；機械設備會另核所需高度，可依設計修改。',
 'parking.loss':'預設停車排列面積另留10%供柱網及轉彎；實際排位圖完成後可修改。',
};
const nestedFields=[['quantity.basementReservePercent','quantityReserve','basementReservePercent',25,'地下設備梯間預留比例','%'],['parking.floorHeight','parkingDesign','floorHeight','3.2','一般方案地下層高','m'],['parking.loss','parkingDesign','loss','10','柱網及轉彎額外預留','%']];
const fieldValue=(input,key)=>key==='bonus.date'?input.regulatoryReview?.bonusAssessment?.date:nestedFields.some(([id])=>id===key)?(()=>{const [,group,field]=nestedFields.find(([id])=>id===key);return input[group]?.[field];})():input[key];
const blank=v=>String(v??'').trim()==='';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const defaultKeys=new Set([...planningFields.map(([key])=>key),...nestedFields.map(([key])=>key),'bonus.date']);
export const isGuidedInput=i=>i?.planningDefaults?.version===GUIDED_INPUT_VERSION&&i.planningDefaults.applied&&typeof i.planningDefaults.applied==='object'&&!Array.isArray(i.planningDefaults.applied)&&Object.entries(i.planningDefaults.applied).every(([key,value])=>defaultKeys.has(key)&&typeof value==='string'&&value.length<100);

// Defaults are planning inputs only. Parcel facts and evidence stay blank.
// Opting in on an older case fills blanks and keeps all previously entered values.
export function withPlanningDefaults(input,date=today(),{newCase=false}={}){
 const template=planningAssumptionsTemplate({input:{district:input.parkingDesign?.district??'新北市'}}),next={...input};
 const applied={...input.planningDefaults?.applied};
 for(const [key]of planningFields)if(!['site','coverage','far','excavationCap'].includes(key)&&blank(next[key])){next[key]=['renewal','danger','tdr','scale'].includes(key)?'0':key==='unitPing'?'25':template[key];applied[key]=next[key];}
 for(const [key,group,field,value]of nestedFields)if(next[group]&&(blank(next[group][field])||newCase&&next[group][field]===value)){next[group]={...next[group],[field]:value};applied[key]=String(value);}
 const a=input.regulatoryReview?.bonusAssessment;
 if(a){const bonus={...a};if(blank(bonus.date)){bonus.date=date;applied['bonus.date']=date;}
 next.regulatoryReview={...input.regulatoryReview,bonusAssessment:bonus};}
 next.planningDefaults={version:GUIDED_INPUT_VERSION,applied};
 return next;
}
export function editGuidedInput(current,patch){
 const next={...current,...patch};if(!isGuidedInput(current))return next;
 const applied={...current.planningDefaults.applied};
 for(const key of Object.keys(patch))if(Object.hasOwn(applied,key)&&patch[key]!==current[key])delete applied[key];
 for(const [key,group,field]of nestedFields)if(patch[group]&&patch[group][field]!==current[group]?.[field])delete applied[key];
 if(patch.regulatoryReview?.bonusAssessment?.date!==undefined&&patch.regulatoryReview.bonusAssessment.date!==current.regulatoryReview?.bonusAssessment?.date)delete applied['bonus.date'];
 return {...next,planningDefaults:{version:GUIDED_INPUT_VERSION,applied}};
}
export function defaultState(input,key){
 if(!isGuidedInput(input))return '';
 const value=fieldValue(input,key);
 if(blank(value))return '';
 return Object.hasOwn(input.planningDefaults.applied,key)&&input.planningDefaults.applied[key]===String(value)?'預設值':'自行填寫';
}
export function planningDefaultRows(input){
 if(!isGuidedInput(input))return [];
 const route=input.regulatoryReview?.bonusAssessment?.route;
 const flat=planningFields.filter(([key])=>defaultState(input,key)==='預設值'&&planningFieldApplied(input,key)&&planningHelp[key]&&!(key==='renewal'&&route!=='renewal')&&!(key==='danger'&&route!=='danger')&&!(key==='scale'&&route==='danger')&&!['excavation','basementFloors','reserve'].includes(key)).map(([key,label,unit])=>[label,`${input[key]}${unit?' '+(key==='balcony'?'%各層樓板':unit):''}（規劃預設值）`]);
 return [...flat,...nestedFields.filter(([key])=>defaultState(input,key)==='預設值'&&planningFieldApplied(input,key)).map(([key,,,,label,unit])=>[label,`${fieldValue(input,key)} ${unit}（規劃預設值）`])];
}

// This calculation-only marker permits pending evidence in a labelled planning
// scenario. Stored qualifications, source text and entered quantities are intact.
export function preparePlanningEstimate(input){
 if(!isGuidedInput(input)||input.assessmentMode==='document'||input.mixedSite?.enabled)return input;
 const a=input.regulatoryReview?.bonusAssessment;if(!a||a.awardBasis==='permitted')return input;
 const bonus={...a,planningEstimate:true},assumptions=[];
 if(a.route==='danger'){
  if(blank(a.dangerEligibleSite)&&a.conditions?.originalCap!=='original115'){bonus.dangerEligibleSite=input.site;assumptions.push('危老面積暫按全基地符合條件估算；原建築基地範圍待查，可在危老面積欄修改。');}
  if(blank(a.dangerAdjacentSite)&&a.conditions?.originalCap!=='original115'){bonus.dangerAdjacentSite='0';assumptions.push('合併鄰地預設0㎡，本次未另計鄰地規模。');}
  bonus.conditions={...a.conditions};
  if(blank(bonus.conditions.originalCap))bonus.conditions.originalCap='base';
  if(blank(bonus.conditions.quickExtras))bonus.conditions.quickExtras='no';
 }
 return {...input,planningAssumptionNotes:assumptions,regulatoryReview:{...input.regulatoryReview,bonusAssessment:bonus}};
}
