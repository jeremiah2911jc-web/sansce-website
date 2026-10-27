import {parse} from '@babel/parser';
import {developmentServiceCopyEdits} from '../shared/development-service-copy.mjs';

// Presentation strings only. Never change operators, identifiers, inputs or numeric literals.
const edits=[
 ...developmentServiceCopyEdits,
 ['不以填入原容積自動取得該差額','該差額須依原容積適用條件另行檢核'],
 ['不依新申請時程重算或自動取得新獎勵','既有許可案件依原核准內容比較，新獎勵另依申請條件檢核'],
 ['法定樓板與陽台口徑','法定樓板與陽台計算範圍'],
 ['一般建築、農舍、工廠營運等另外申辦，不由變更編定結果自動取得。','一般建築、農舍、工廠營運等，須依各項規定另行申辦。'],
 ['徵收、工程與都市計畫範圍各有口徑','徵收、工程與都市計畫各有不同的範圍'],
 ['來源口徑不同','資料記載的面積範圍不同'],
 ['開發範圍口徑不同','開發範圍不同'],
 ['抵價地分配口徑','抵價地分配計算基準']
];
export function normalizeGeneratedSiteCopy(code){
 const ast=parse(code,{sourceType:'module'}),changes=[];
 function visit(node){
  if(!node||typeof node!=='object')return;
  if(node.type==='TemplateElement'&&node.value.cooked!=null){
   let value=node.value.cooked;for(const [from,to]of edits)value=value.replaceAll(from,to);
   if(value!==node.value.cooked)changes.push({start:node.start,end:node.end,text:value.replaceAll('\\','\\\\').replaceAll('`','\\`').replaceAll('${','\\${')});
   return;
  }
  if(node.type==='StringLiteral'){
   let value=node.value;for(const [from,to]of edits)value=value.replaceAll(from,to);
   if(value!==node.value)changes.push({start:node.start,end:node.end,text:JSON.stringify(value)});
   return;
  }
  for(const [key,value]of Object.entries(node)){
   if(['loc','start','end','extra','comments','tokens'].includes(key))continue;
   if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);
  }
 }
 visit(ast);for(const change of changes.sort((a,b)=>b.start-a.start))code=code.slice(0,change.start)+change.text+code.slice(change.end);
 return code;
}
