import {encodeValue,decodeValue,inputOnly,parseDraft,serializeDraft,MAX_DRAFT_SIZE} from './local-draft.mjs';
import {createInput} from './model.mjs';
import {newLandAssessment,newLandFact,newLegalInputs,newGroup,newHouse,newFloor,dossierById,localProfile} from './generated/land.mjs';
import {newReadjustmentPlan} from './generated/readjustment.mjs';
export const CASE_FORMAT='sanze.evaluation-inputs',CASE_VERSION=1,MAX_CASE_BYTES=4_000_000;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const fail=label=>{throw Error(label+'格式不完整或不相容；目前輸入尚未替換。');};
function like(value,template,label){
 if(Array.isArray(template)){if(!Array.isArray(value))fail(label);if(template.length)for(const row of value)like(row,template[0],label);return;}
 if(object(template)){if(!object(value))fail(label);for(const [key,t] of Object.entries(template))if(t!==undefined)like(value[key],t,label+'／'+key);return;}
 if(template===undefined)return;
 if(template===null){if(value!==null)fail(label);return;}
 if(typeof value!==typeof template)fail(label);
}
function list(rows,max,label){if(!Array.isArray(rows)||rows.length>max)fail(label);}
function ids(rows,label){const found=new Set();for(const r of rows){if(!r||typeof r.id!=='string'||!r.id||found.has(r.id))fail(label);found.add(r.id);}}
function scalarRows(rows,label){if(rows.some(row=>!object(row)||Object.values(row).some(v=>v!==null&&!['string','number','boolean','undefined'].includes(typeof v)&&!object(v))))fail(label);}
function scalarMap(map,label){if(!object(map))fail(label);for(const row of Object.values(map)){if(!object(row))fail(label);for(const v of Object.values(row))if(v!==null&&!['string','number','boolean','undefined'].includes(typeof v))fail(label);}}
export function validateCaseData(data){
 // Reuse the draft envelope whitelist and lossless value codec before inspecting UI shapes.
 const clean=parseDraft(serializeDraft(data,'validation','validation')).data;
 if(clean['collective.input'])like(clean['collective.input'],createInput(),'集合住宅');
 for(const p of clean['collective.scenarios']||[])like(p.input,createInput(),'集合住宅'+p.code);
 const activeScenario=clean['collective.scenarios']?.find(p=>p.id===clean['collective.active']);if(activeScenario)for(const k of ['input','name','district','tab'])if(!Object.hasOwn(clean,'collective.'+k))clean['collective.'+k]=structuredClone(activeScenario[k]);
 if(clean['collective.district']&&!['新北市','臺北市'].includes(clean['collective.district']))fail('集合住宅地區');
 const land=clean['land.assessment'];
 if(land){like(land,newLandAssessment('schema'),'土地資料');like(land.legalInputs,newLegalInputs(),'土地適用條件');list(land.parcels,100,'土地清冊');ids(land.parcels,'土地識別');for(const p of land.parcels)like(p,newLandFact('unknown'),'逐筆土地');list(land.routePlans,30,'用途途徑');ids(land.routePlans,'途徑識別');
  for(const p of land.routePlans){for(const k of ['id','caseId','parcelId','routeId','name','basisKey','ruleVersion','localNotes','localSource','localDate'])if(typeof p[k]!=='string')fail('途徑'+k);const template=dossierById(p.routeId);if(!template)fail('途徑類型');for(const k of ['checks','exceptions','documents','steps','localChecks'])scalarMap(p[k],'途徑文件');
   // Formula/rule templates are application-owned; files carry only user-entered conditions.
   p.template=structuredClone(template);if(p.localContext){if(!object(p.localContext)||typeof p.localContext.city!=='string'||typeof p.localContext.regime!=='string')fail('地方條件');p.localContext.profile=structuredClone(localProfile(p.localContext.city));}
  }
 }
 const plans=clean['land.plans']||[];list(plans,30,'透天方案');ids(plans.map(p=>p.input),'透天方案識別');
 for(const {input:p} of plans){for(const k of ['id','caseId','name','form','basisKey'])if(typeof p[k]!=='string')fail('透天方案');list(p.groups,100,'土地分組');ids(p.groups,'分組識別');for(const g of p.groups){like(g,newGroup(),'配置分組');list(g.houses,200,'住宅棟別');ids(g.houses,'棟別識別');for(const h of g.houses){like(h,newHouse(),'住宅');list(h.floors,30,'樓層');ids(h.floors,'樓層識別');for(const f of h.floors)like(f,newFloor(),'樓層');}list(g.reservations,200,'戶外設施');ids(g.reservations,'戶外設施識別');for(const r of g.reservations)like(r,{id:'',name:'',kind:'',x:'',y:'',width:'',depth:''},'戶外設施');}}
 const items=clean['readjustment.items']||[];list(items,30,'重劃方案');ids(items.map(p=>p.input),'重劃方案識別');
 for(const {input:p} of items){like(p,newReadjustmentPlan('schema','public'),'重劃方案');if(!['public','private','expropriation'].includes(p.system)||!['owner','acquisition'].includes(p.track))fail('重劃制度主線');scalarMap(p.evidence,'權利文件');scalarMap(p.planChecks,'公告條件');scalarMap(p.parcelRights,'逐筆持分');for(const k of ['rows','blocks'])if(p.statutory[k]!==undefined){list(p.statutory[k],200,'法定分配資料');scalarRows(p.statutory[k],'法定分配資料');}list(p.consentCalculation.rows,500,'同意清單');scalarRows(p.consentCalculation.rows,'同意清單');list(p.mergeCalculation.rows,200,'合併清單');scalarRows(p.mergeCalculation.rows,'合併清單');}
 for(const [key,choices] of Object.entries({'nav.section':['land','layout','collective','readjustment'],'nav.view':['overview','tool'],'nav.track':['owner','acquisition'],'collective.tab':['base','above','parking','basement']}))if(Object.hasOwn(clean,key)&&!choices.includes(clean[key]))fail('操作位置');
 for(const key of ['collective.name','collective.district','collective.active','land.parcelId','land.routeId','land.planId','readjustment.active','readjustment.search','readjustment.scope','readjustment.city','readjustment.system','readjustment.catalogId','readjustment.editionId'])if(Object.hasOwn(clean,key)&&typeof clean[key]!=='string')fail('選案欄位');
 if(Object.hasOwn(clean,'nav.opened')&&typeof clean['nav.opened']!=='boolean')fail('工作區狀態');
 for(const [key,rows] of [['land.parcelId',land?.parcels],['land.routeId',land?.routePlans],['land.planId',plans.map(p=>p.input)],['readjustment.active',items.map(p=>p.input)]])if(clean[key]&&!rows?.some(p=>p.id===clean[key]))clean[key]=rows?.[0]?.id||'';
 return clean;
}
export function caseDataSnapshot(data){
 const copy=structuredClone(inputOnly(data)),active=copy['collective.active'];
 if(copy['collective.scenarios']?.length)copy['collective.scenarios']=copy['collective.scenarios'].map(p=>p.id===active?{...p,...Object.fromEntries(['input','name','district','tab'].filter(k=>Object.hasOwn(copy,'collective.'+k)).map(k=>[k,copy['collective.'+k]]))}:p);
 return copy;
}
export function serializeCase(data,rules,now=new Date().toISOString()){
 const clean=validateCaseData(caseDataSnapshot(data));const text=JSON.stringify({format:CASE_FORMAT,version:CASE_VERSION,createdAt:now,rules,data:encodeValue(clean)});
 if(text.length>MAX_DRAFT_SIZE||new TextEncoder().encode(text).length>MAX_CASE_BYTES)throw Error('案件檔超過大小上限，請減少方案或過長文字後再下載。');return text;
}
export function parseCase(text){
 if(typeof text!=='string'||text.length>MAX_DRAFT_SIZE||new TextEncoder().encode(text).length>MAX_CASE_BYTES)throw Error('案件檔超過大小上限。');
 let e;try{e=JSON.parse(text);}catch{throw Error('檔案不是有效的三策案件檔。');}
 if(e?.format!==CASE_FORMAT||e.version!==CASE_VERSION||typeof e.rules!=='string'||!Number.isFinite(Date.parse(e.createdAt)))throw Error('案件檔格式或版本不相容，請使用本工具下載的案件檔。');
 const raw=decodeValue(e.data);if(!object(raw))fail('案件內容');let data;try{data=validateCaseData(raw);}catch(error){throw Error(/[\u4e00-\u9fff]/.test(error.message)?error.message:'案件檔結構無法辨識；請使用本工具下載的案件檔。');}return {...e,data,counts:caseCounts(data)};
}
export function caseCounts(data){return {parcels:data['land.assessment']?.parcels.length||0,routes:data['land.assessment']?.routePlans.length||0,layout:data['land.plans']?.length||0,collective:data['collective.scenarios']?.length||(data['collective.input']?1:0),owner:(data['readjustment.items']||[]).filter(p=>p.input.track==='owner').length,acquisition:(data['readjustment.items']||[]).filter(p=>p.input.track==='acquisition').length};}
export function caseFilename(now=new Date()){return '三策評估案件-'+new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)+'.sanze.json';}
