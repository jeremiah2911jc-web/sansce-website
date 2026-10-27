import {publicText} from './public-copy.mjs';
import {calculateCommercialIntensity,planningAssumptionsTemplate,defaultPlanningInput,calculatePlanning,newSiteRoadConditions} from './generated/core.mjs';
export const ENGINE_BUILD='2026-10-19';
export function createInput(){
 const input=defaultPlanningInput({input:{siteAreaSqm:'',buildingCoverageRatePercent:'',baseFarRatePercent:'',district:'新北市',landIdentifier:'',urbanRenewalBonusRatePercent:'',tdrBonusRatePercent:''}});
 return {...input,roadConditions:newSiteRoadConditions()};
}
export function exampleInput(){const input={...planningAssumptionsTemplate({input:{district:'新北市'}}),roadConditions:newSiteRoadConditions()};return {...input,basementDemand:undefined,site:'2400',coverage:'50',far:'280',renewal:'50',tdr:'25',roadConditions:{...input.roadConditions,roadName:'範例道路',plannedWidth:'12',openedWidth:'12',frontage:'25',connected:'yes',status:'assumed',source:'假設數值，未查證實際基地'}};}
export function checkInput(input){
 if(input.assessmentMode==='document')return [];
 if(input.mixedSite?.enabled)return ['請使用混合分區獨立評估，不套用單一住宅計算。'];
 const commercial=input.commercialIntensity?.enabled?calculateCommercialIntensity(input.commercialIntensity,input.site,input.coverage,true):null;
 const errors=commercial?[...commercial.errors]:[];
 for(const [k,label]of [['site','基地面積'],['coverage','法定建蔽率'],['far','基準容積率']])if(!(k==='far'&&commercial)&&(!input[k]?.trim()||!Number.isFinite(Number(input[k]))||Number(input[k])<=0))errors.push(label+'請填大於0的有效數值。');
 // Bound the public tool's workload before entering the App's iterative solver.
 for(const [k,max,label]of [['site',1000000,'基地面積'],['far',3000,'基準容積率'],['roofFloors',3,'屋突層數'],['basementFloors',30,'地下層數']])if(!(k==='far'&&commercial)&&Number(input[k])>max)errors.push(`${label}超出本網站評估範圍（上限${max}${k==='site'?'㎡':k==='far'?'%':'層'}），請洽詢三策開發評估服務。`);
 if(!Number.isFinite(Number(input.unitPing))||Number(input.unitPing)<=0)errors.push('每戶面積請填大於0的有效數值。');
 return errors;
}
export function evaluate(input){
 const errors=checkInput(input);if(errors.length)return {errors,notes:[],values:null};
 try{const result=calculatePlanning(input);return {...result,errors:result.errors.map(e=>publicText(e).replace("依需求檢討須先填個案開挖率上限及法規／基地資料來源；不自動套60%或80%","請填寫個案開挖率上限及適用法規。"))};}catch{return {errors:['目前條件無法完成計算，請檢查輸入數值。'],notes:[],values:null};}
}
export const format=(n,d=2)=>Number.isFinite(n)?n.toLocaleString('zh-TW',{minimumFractionDigits:0,maximumFractionDigits:d}):'待確認';
