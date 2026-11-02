import {planningFields} from './generated/core.mjs';
import {publicText} from './public-copy.mjs';
// Presentation targets only. Validation and calculations remain in the shared core.
export const requiredBaseFields = [
  {key:'site',label:'基地面積',tab:'base'},
  {key:'coverage',label:'法定建蔽率',tab:'base'},
  {key:'far',label:'基準容積率',tab:'base'},
];
export function missingBaseFields(input){
  return requiredBaseFields.filter(({key})=>!String(input[key]??'').trim()||!Number.isFinite(Number(input[key]))||Number(input[key])<=0);
}
const fieldLabels={
 renewal:'都更快速目標%',danger:'危老快速目標%',tdr:'容移快速目標%',
 unitPing:'每戶地上分攤面積',storePercent:'店舖等第一類用途比例',motoPerUnit:'每戶機車需求',
 roofHeight:'屋突每層高度',balcony:'陽台占各層樓板比例',basementSalePercent:'地下設備梯間計入房屋公設',
 basementFloors:'地下層數',excavationCap:'個案開挖率上限',carPerUnit:'市場汽車需求',
 reserve:'地下設備梯間預留比例',extraCars:'增設汽車位數',
};
const specialTargets=[
 {key:'basementReservePercent',label:'地下設備梯間預留比例',tab:'basement',terms:['地下預留比例']},
 {label:'危老合格原建築基地㎡（須依資料填寫）',tab:'base',terms:['危老原合格基地面積及鄰地面積']},
 {label:'機電免計適用條件',tab:'above',terms:['直通樓梯','安全梯','機電免計']},
 {label:'預計報核／申請日期',tab:'base',terms:['報核日期','申請日期','申請期限']},
];
const fields=planningFields.map(([key,label,,tab])=>({key,label:fieldLabels[key]||publicText(label),tab,terms:[label,publicText(label)]}));
export function issueTarget(message){
 const exact=specialTargets.find(x=>x.terms.some(t=>message.includes(t)));
 if(exact)return exact;
 const field=fields.filter(x=>x.terms.some(t=>message.includes(t))||new RegExp('(^|[^a-zA-Z])'+x.key+'([^a-zA-Z]|$)').test(message)).sort((a,b)=>Math.max(...b.terms.map(t=>t.length))-Math.max(...a.terms.map(t=>t.length)))[0];
 if(field)return field;
 const groups=[
  {tab:'base',heading:'基地與開發強度',terms:['基地','建蔽','容積率']},
  {tab:'base',heading:'獎勵與容移：快速估算／細項評定',terms:['都更','危老','容移','獎勵','送出','接受基地','代金']},
  {tab:'base',label:'計畫道路寬度m',terms:['路寬','道路','面寬']},
  {tab:'above',heading:'地上配置與屋突',terms:['屋突','屋頂','地上','陽台','梯廳','登記']},
  {tab:'parking',heading:'戶數與停車需求',terms:['戶數','每戶','店舖','汽車需求','機車需求','增設車位']},
  {tab:'basement',heading:'地下室與必要空間',terms:['地下','開挖','停車','車位','機械','設備','升降機','機坑','必要空間','車道','無障礙']},
 ];
 return groups.find(x=>x.terms.some(t=>message.includes(t)))??{tab:'base',heading:'基地與開發強度'};
}
