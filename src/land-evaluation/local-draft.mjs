export const DRAFT_KEY='sanze:evaluation:local-draft:v1';
export const DRAFT_SCHEMA=1;
export const MAX_DRAFT_SIZE=3_000_000;
const permitted=new Set(['nav.section','nav.view','nav.opened','nav.track','collective.input','collective.name','collective.district','collective.tab','collective.scenarios','collective.active','land.assessment','land.parcelId','land.routeId','land.plans','land.planId','readjustment.items','readjustment.active','readjustment.search','readjustment.scope','readjustment.city','readjustment.system','readjustment.catalogId','readjustment.editionId']);

// Encode the value tree explicitly: native JSON silently changes NaN to zero-like
// null and drops undefined. Neither change is acceptable for planning inputs.
export function encodeValue(value){
 if(value===undefined)return ['undefined'];
 if(typeof value==='number'&&!Number.isFinite(value))return ['number',String(value)];
 if(Array.isArray(value))return ['array',value.map(encodeValue)];
 if(value&&typeof value==='object')return ['object',Object.entries(value).map(([k,v])=>[k,encodeValue(v)])];
 return ['value',value];
}
export function decodeValue(tree,depth=0,budget={nodes:0}){
 if(depth>70||++budget.nodes>150000||!Array.isArray(tree))throw Error('暫存資料結構無效。');
 const [type,value]=tree;
 if(type==='undefined'&&tree.length===1)return undefined;
 if(type==='number'&&['NaN','Infinity','-Infinity'].includes(value))return Number(value);
 if(type==='value'&&(value===null||['string','boolean','number'].includes(typeof value)))return value;
 if(type==='array'&&Array.isArray(value))return value.map(x=>decodeValue(x,depth+1,budget));
 if(type==='object'&&Array.isArray(value)){
  const result={};for(const pair of value){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||['__proto__','prototype','constructor'].includes(pair[0]))throw Error('暫存欄位無效。');result[pair[0]]=decodeValue(pair[1],depth+1,budget);}return result;
 }
 throw Error('暫存資料無法辨識。');
}
export function inputOnly(data){
 const copy=Object.fromEntries(Object.entries(data).filter(([key])=>permitted.has(key)));
 for(const key of ['land.plans','readjustment.items'])if(copy[key])copy[key]=copy[key].map(item=>({input:item.input,history:[]}));
 if(copy['collective.scenarios'])copy['collective.scenarios']=copy['collective.scenarios'].map(({id,code,title,input,name,district,tab})=>({id,code,title,input,name,district,tab}));
 return copy;
}
export function serializeDraft(data,rules,revision,savedAt=new Date().toISOString()){
 const text=JSON.stringify({schema:DRAFT_SCHEMA,rules,revision,savedAt,data:encodeValue(inputOnly(data))});
 if(text.length>MAX_DRAFT_SIZE)throw Error('暫存內容超過本機容量範圍，原暫存仍保留。');return text;
}
export function parseDraft(text){
 if(typeof text!=='string'||text.length>MAX_DRAFT_SIZE)throw Error('暫存資料大小無效。');
 const e=JSON.parse(text);if(e.schema!==DRAFT_SCHEMA||typeof e.rules!=='string'||typeof e.revision!=='string'||!Number.isFinite(Date.parse(e.savedAt)))throw Error('暫存格式或日期無法辨識。');
 const data=decodeValue(e.data);if(!data||Array.isArray(data)||typeof data!=='object'||Object.keys(data).some(k=>!permitted.has(k)))throw Error('暫存欄位不相容。');
 for(const key of ['land.plans','readjustment.items'])if(data[key]&&(!Array.isArray(data[key])||data[key].length>30||data[key].some(x=>!x?.input||typeof x.input!=='object')))throw Error('暫存方案無效。');
 if(data['collective.scenarios']){const plans=data['collective.scenarios'];if(!Array.isArray(plans)||plans.length>3||plans.some(p=>!p||typeof p.id!=='string'||!['A','B','C'].includes(p.code)||typeof p.title!=='string'||typeof p.name!=='string'||!['新北市','臺北市'].includes(p.district)||!p.input?.quantityReserve||!p.input?.roadConditions||!p.input?.parkingDesign)||new Set(plans.map(p=>p.id)).size!==plans.length||new Set(plans.map(p=>p.code)).size!==plans.length)throw Error('集合住宅方案無效。');if(plans.length&&!plans.some(p=>p.id===data['collective.active']))throw Error('目前集合住宅方案無效。');}
 if(data['land.assessment']&&(!Array.isArray(data['land.assessment'].parcels)||data['land.assessment'].parcels.length>100))throw Error('土地清冊無效。');
 if(data['collective.input']&&(!data['collective.input'].quantityReserve||!data['collective.input'].roadConditions||!data['collective.input'].parkingDesign))throw Error('集合住宅欄位不完整。');
 return {...e,data:inputOnly(data)};
}
export function comparable(key,value){
 if(key==='land.assessment'&&value){const {caseId,updatedAt,...rest}=value;return JSON.stringify(encodeValue(rest));}
 return JSON.stringify(encodeValue(value));
}
export const contentKey=key=>['collective.input','collective.name','collective.district','collective.scenarios','land.assessment','land.plans','readjustment.items'].includes(key);

// Only replace an existing draft after validating the complete next envelope.
// Callers retain their in-memory input if the browser rejects either operation.
export function persistDraft(storage,previousRaw,data,hasContent,rules,revision){
 if(storage.getItem(DRAFT_KEY)!==previousRaw){const error=Error('另一個分頁已更新暫存。');error.code='DRAFT_CONFLICT';throw error;}
 if(!hasContent){storage.removeItem(DRAFT_KEY);return {raw:null,savedAt:''};}
 const raw=serializeDraft(data,rules,revision);storage.setItem(DRAFT_KEY,raw);return {raw,savedAt:JSON.parse(raw).savedAt};
}
