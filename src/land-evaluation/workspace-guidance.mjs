import {taipeiRenewalItems} from './taipei-renewal/model.mjs';
import {planningFields} from './generated/core.mjs';
import {blockingIssueCatalog,bonusIssueLabels} from './blocking-issue-catalog.mjs';
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
const fields=planningFields.map(([key,label,,tab])=>({key,label:fieldLabels[key]||publicText(label),tab,terms:[label,publicText(label),fieldLabels[key]||publicText(label)]}));
export function issueTarget(message,input={}){
 const detail=blockingFieldTarget(message,input);if(detail)return detail;
 const row=message.match(/^(.+?)(適用比例|第二計算量|第三計算量|計算量)(未填|不得)/);
 if(row)return {tab:'base',summary:row[1],label:row[1]+({適用比例:'適用基準容積比例',計算量:'計算量',第二計算量:'第二計算量',第三計算量:'第三計算量'}[row[2]])};
 const exact=specialTargets.find(x=>x.terms.some(t=>message.includes(t)));
 if(exact)return exact;
 const field=fields.filter(x=>x.terms.some(t=>message.includes(t))||new RegExp('(^|[^a-zA-Z])'+x.key+'([^a-zA-Z]|$)').test(message)).sort((a,b)=>Math.max(...b.terms.map(t=>t.length))-Math.max(...a.terms.map(t=>t.length)))[0];
 if(field)return field;
 const catalog=blockingIssueCatalog.flatMap(x=>x.terms.filter(t=>message.includes(publicText(t))).map(term=>({...x,length:term.length}))).sort((a,b)=>b.length-a.length)[0];
 if(catalog)return {...catalog.target,source:catalog.owner};
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

function blockingFieldTarget(message,input){
 for(const item of taipeiRenewalItems){if(message.includes(item.title)){const field=item.fields.find(f=>message.includes(f.label));return {tab:'base',region:'臺北市地方都更獎勵',summary:item.title,...(field?{label:field.label}:{})};}}
 const rules=[
  [/法規檢討資料格式無效/,{tab:'base',invalidOption:true,entries:Object.entries(input.regulatoryReview?.bonusAssessment?.entries??{}).map(([key,value])=>({label:bonusIssueLabels[key]+'目標條件',choice:value.choice})),heading:'獎勵與容移：快速估算／細項評定'}],
  [/既有許可移入容積須/,{tab:'base',summary:'容移取得條件與資格檢核',label:'既有許可移入容積㎡'}],
  [/須填既有容移許可文號/,{tab:'base',summary:'容移取得條件與資格檢核',label:'既有容移許可文號及文件來源'}],
  [/既有許可對照須/,{tab:'base',summary:'容移取得條件與資格檢核',label:'既有許可文件確認'}],
  [/代金比例須|混合方式.*比例/,{tab:'base',summary:'容移取得條件與資格檢核',label:'代金占當次移入容積比例%（非金額比）'}],
  [/代金每容積.*估價須/,{tab:'base',key:'tdrValuationUnitPrice',label:'每容積㎡代金估價'}],
  [/請選擇本案使用分區類型/,{tab:'base',region:'臺北市地方都更獎勵',label:'使用分區類型'}],
  [/請新增30年以上/,{tab:'base',region:'臺北市地方都更獎勵',summary:'促進都市更新（二）'}],
  [/地方綠化與中央綠建築同時申請|通道與沿街人行空間|地方獎勵扣除面積/,{tab:'base',region:'臺北市地方都更獎勵'}],
  [/地方獎勵文件日期/,{tab:'base',region:'臺北市地方都更獎勵',label:'地方獎勵文件日期'}],
  [/文件記載或已核對圖說的地方獎勵|提供都更基金獎勵請填案件/,{tab:'base',region:'臺北市地方都更獎勵',label:'地方獎勵文件名稱與圖說頁次'}],
  [/策略性更新加倍/,{tab:'base',region:'臺北市地方都更獎勵',label:'更新單元面積（㎡）'}],
  [/地下層數超出本網站|地下層數須為|分層配置地下層數/,{tab:'basement',key:'basementFloors',label:'地下層數'}],
  [/地區.*重設|係數.*重設地區|所在地.*一致/,{tab:'base',scope:'editor',label:'評估地區'}],
  [/純住宅設計.*非住宅比例/,{tab:'parking',key:'storePercent',label:'店舖等第一類用途比例'}],
  [/每戶面積/,{tab:'parking',key:'unitPing',label:'每戶地上分攤面積'}],
  [/指定增設車位須為|增設汽車位數.*整數/,{tab:'parking',key:'extraCars',label:'增設汽車位數'}],
  [/實際開闢寬度須/,{tab:'base',label:'實際開闢道路寬度m'}],
  [/同路段基地面寬須/,{tab:'base',label:'同一路段基地面寬m'}],
  [/計畫路寬須|確認路寬須/,{tab:'base',label:'計畫道路寬度m'}],
  [/路寬查證日期/,{tab:'base',label:'路寬查證日期'}],
  [/合法原容積須/,{tab:'base',label:'符合條件的合法原建築容積㎡（全合格原基地才核較高上限）'}],
  [/合格原基地須/,{tab:'base',label:'危老合格原建築基地㎡（須依資料填寫）'}],
  [/合併鄰地須/,{tab:'base',label:'合併鄰接基地㎡'}],
  [/屋突總高度|屋突上限條件資料無效/,{tab:'above',key:'roofHeight',label:'屋突每層高度'}],
  [/屋突投影超出/,{tab:'above',label:'屋突投影條件'}],
  [/屋突用途不符合/,{tab:'above',summary:'屋突用途與登記假設',label:'屋突暫按符合樓梯、昇降機及機械房用途'}],
  [/R2.R3.*昇降機|9m屋突假設不允許/,{tab:'above',summary:'屋突用途與登記假設',label:'昇降機出入口只設於屋頂層，不設R2／R3'}],
  [/普通計容樓板公設比例/,{tab:'basement',summary:'普通計容樓板內的公設分類假設',label:'普通樓板內計容公設比例%'}],
  [/個案獎勵及容移合計上限/,{tab:'basement',summary:'獎勵、容移上限與評點假設',label:'個案獎勵及容移合計上限%（無資料留白）'}],
  [/地下層高無效/,{tab:'basement',label:input.basementDemand?.enabled?'一般方案地下層高（設備另檢查）':'地下室每層高度'}],
  [/柱網與轉彎預留比例無效/,{tab:'basement',label:'柱網及轉彎額外預留 %'}],
  [/規劃開挖率超出個案上限/,{tab:'basement',key:'excavation',label:'規劃開挖率'}],
  [/既有核准獎勵.*日期|獎勵核准日期/,{tab:'base',label:'獎勵核准日期'}],
  [/核准基準容積與獎勵面積/,{tab:'base',label:'核准基準容積㎡'}],
  [/既有核准獎勵與所選重建路徑/,{tab:'base',label:'獎勵核准路徑'}],
  [/既有核准獎勵.*來源/,{tab:'base',label:'獎勵核准文號及來源'}],
  [/地下開挖.*分區|地下開挖適用分區/,{tab:'basement',label:'地下開挖適用分區'}],
  [/較嚴格開挖率.*來源/,{tab:'basement',summary:'個案都市計畫較嚴格規定',label:'較嚴格規定來源'}],
  [/較嚴格開挖率須/,{tab:'basement',summary:'個案都市計畫較嚴格規定',label:'個案較嚴格開挖率上限%'}],
  [/個案開挖率上限及適用法規/,{tab:'basement',label:'個案開挖率上限%'}],
  [/南港.*重建類別|已採都更.*開挖規則/,{tab:'basement',region:'地下需求檢討',label:'地下開挖規則'}],
  [/搜尋範圍須|30層搜尋範圍/,{tab:'basement',summary:'設備、動線與搜尋範圍',label:'地下層數搜尋上限'}],
  [/地面無障礙通路初估/,{tab:'basement',region:'無坡道無障礙檢討',label:'獨立無障礙通路淨寬'}],
  [/地面門廳.*正面積/,{tab:'basement',region:'無坡道無障礙檢討',label:'地面門廳、樓梯與電梯空間及其他用途'}],
  [/地面無法留設|地面無障礙.*上限/,{tab:'basement',region:'無坡道無障礙檢討',label:'地面無障礙配置條件'}],
  [/基地達1500|汽車升降機須|第136條.*等候|搭乘.轉向/,{tab:'basement',summary:'設備、動線與搜尋範圍',region:'小基地替代配置'}],
  [/機械停車層高|機械模組|倉儲式須填/,{tab:'basement',summary:input.basementDemand?.enabled?'設備、動線與搜尋範圍':undefined,region:'小基地替代配置'}],
  [/目前配置無法容納|地下室容量不足|地下室不足規劃|地下一層扣除|固定地下層數.*面積/,{tab:'basement',label:input.basementDemand?.enabled?'地下配置檢討方式':'地下層數',key:input.basementDemand?.enabled?undefined:'basementFloors'}],
  [/機車超過.*400/,{tab:'parking',key:'motoPerUnit',label:'每戶機車需求'}],
 ];
 return rules.find(([pattern])=>pattern.test(message))?.[1];
}
