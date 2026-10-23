import {encodeValue} from './local-draft.mjs';
import {displayNumber,collectiveDelivery} from './delivery-model.mjs';
export const SCENARIO_LIMIT=3;
export const collectiveSignature=({input,name='',district=''})=>JSON.stringify(encodeValue({input,name,district}));
export function freshScenarioResult(plan,snapshot){return Boolean(snapshot?.result?.values&&snapshot.signature===collectiveSignature(plan));}
export function nextScenarioCode(plans){return ['A','B','C'].find(code=>!plans.some(plan=>plan.code===code))??null;}
export function createScenario(source,code,id){return {id,code,title:code==='A'?'原始配置':'替代配置 '+code,input:structuredClone(source.input),name:source.name||'',district:source.district||'新北市',tab:source.tab||'base'};}
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export const comparisonMetrics=[
 {label:'房屋可售面積',unit:'坪',value:s=>s.result.values.salePing},
 {label:'房屋專有估計',unit:'坪',value:s=>{const v=s.result.values;return finite(v.sale)&&finite(v.common)?(v.sale-v.common)*.3025:null;},note:'房屋可售減房屋公設，依登記假設估計；非建物測量成果。'},
 {label:'公設比（估算）',unit:'%',value:s=>s.result.values.commonRatio},
 {label:'推估地上樓層',unit:'層',value:s=>s.result.values.equivalentFloors},
 {label:'規劃戶數',unit:'戶',value:s=>s.result.values.units},
 {label:'每戶地上分攤',unit:'坪／戶',value:s=>Number(s.input.unitPing),note:'含地上公設與陽台，不含屋突及地下室。'},
 {label:'汽車位合計',unit:'位',value:s=>s.result.values.cars},
 {label:'平面車位',unit:'位',value:s=>s.result.parking?.values?.flatCars},
 {label:'機械車位',unit:'位',value:s=>s.result.parking?.values?.mechanicalCars},
 {label:'車戶比',unit:'位／戶',value:s=>s.result.values.units>0?s.result.values.cars/s.result.values.units:null},
 {label:'地下層數',unit:'層',value:s=>s.result.values.floors},
 {label:'最大必要地下樓板',unit:'㎡',value:s=>s.result.basementDemandReview?.actualMaxPlate??null,note:'需求搜尋時的最大必要樓板；固定模式請核對本案開挖設定。'},
 {label:'地下總樓板',unit:'㎡',value:s=>s.result.values.basement},
 {label:'地下反計容積',unit:'㎡',value:s=>s.result.values.basementCounted},
 {label:'未使用容積',unit:'㎡',value:s=>s.result.values.unused}
];
export function baseConditionsMatch(a,b){return JSON.stringify(encodeValue([a.district,...['site','coverage','far','roadConditions'].map(k=>a.input[k])]))===JSON.stringify(encodeValue([b.district,...['site','coverage','far','roadConditions'].map(k=>b.input[k])]));}
const fields=[['site','基地面積','㎡'],['coverage','法定建蔽率','%'],['far','基準容積率','%'],['renewal','都更目標','%'],['tdr','容移目標','%'],['danger','危老目標','%'],['scale','規模獎勵目標','%'],['coverageUse','建築面積使用','%'],['volumeUse','容積使用','%'],['unitPing','每戶地上分攤','坪／戶'],['balcony','陽台比例','%'],['roofFloors','屋突層數','層'],['roofHeight','屋突每層高度','m'],['storePercent','店鋪配置比例','%'],['motoPerUnit','機車規劃需求','位／戶'],['extraCars','額外汽車位','位'],['excavation','固定開挖率','%'],['excavationCap','個案開挖率上限','%'],['basementFloors','固定地下層數','層'],['basementSalePercent','地下設備梯間登記分攤','%']];
const groups={roadConditions:'道路條件與查證',parkingDesign:'停車方式與個案配置',basementDemand:'地下需求搜尋條件',quantityReserve:'量體與必要空間預留',areaReview:'逐層面積及登記',regulatoryReview:'獎勵、容移及法規設定'};
const inputText=(v,unit='')=>v===''||v===null||v===undefined?'未填／待確認':String(v)+(unit?' '+unit:'');
export function scenarioDifferences(base,other){
 const rows=[];if(base.district!==other.district)rows.push(['評估地區',base.district,other.district]);
 for(const [key,label,unit] of fields)if(!Object.is(base.input[key],other.input[key]))rows.push([label,inputText(base.input[key],unit),inputText(other.input[key],unit)]);
 for(const [key,label] of Object.entries(groups))if(JSON.stringify(encodeValue(base.input[key]))!==JSON.stringify(encodeValue(other.input[key])))rows.push([label,'基準案設定','本案另有調整，詳各案設定與摘要']);
 for(const [key,label] of [['stair','機電免計條件'],['lobbyDepth','梯廳淨深條件'],['elevator','電梯通達屋頂'],['basementMode','地下層數模式'],['parkingRule','停車規則']])if(base.input[key]!==other.input[key])rows.push([label,'基準案條件','本案條件不同，詳各案設定']);
 return rows;
}
export function comparisonObservations(base,other,snapshots){
 const a=snapshots[base.id],b=snapshots[other.id];if(!freshScenarioResult(base,a)||!freshScenarioResult(other,b))return ['兩案完成本次計算後，顯示數值變化。'];
 const av=a.result.values,bv=b.result.values,notes=[];
 if(!baseConditionsMatch(base,other))notes.push('基地、強度或道路條件不同；請按各案條件判讀，不能只看面積大小。');
 for(const [key,label,unit] of [['units','規劃戶數','戶'],['cars','汽車位','位'],['floors','地下層數','層'],['salePing','房屋可售面積','坪']])if(av[key]!==bv[key])notes.push(`${label}由${displayNumber(av[key])}${unit}變為${displayNumber(bv[key])}${unit}。`);
 if(bv.floors!==av.floors&&(bv.cars!==av.cars||JSON.stringify(encodeValue(base.input.parkingDesign))!==JSON.stringify(encodeValue(other.input.parkingDesign))))notes.push('地下層數與車位／停車配置一併變動，請合併核對搜尋明細及開挖條件；此處不將差異歸因於單一因素。');
 return notes.length?notes:['目前主要結果相同，仍請核對採用條件及待查事項。'];
}
export function comparisonDelivery(plans,snapshots){
 if(plans.length<2||plans.some(p=>!freshScenarioResult(p,snapshots[p.id])))return null;
 const first=collectiveDelivery(snapshots[plans[0].id]),summaries=plans.map(p=>collectiveDelivery(snapshots[p.id]));
 return {...first,kind:'集合住宅方案比較',title:'集合住宅方案比較',createdAt:new Date().toISOString(),status:'替代方案分別試算；適用資格與圖說另核',metrics:plans.map(p=>[`${p.code} · ${p.title} 可售`,snapshots[p.id].result.values.salePing,'坪']),conditions:[['比較基準',`${plans[0].code} · ${plans[0].title}`],['基地條件',plans.every(p=>baseConditionsMatch(plans[0],p))?'三項基地強度與道路填報條件一致':'基地、強度或道路條件有差異，詳各案輸入'],['結果口徑','各案獨立，不相加、不評定投資優劣'],['計算時間',plans.map(p=>`${p.code}：${new Date(snapshots[p.id].calculatedAt).toLocaleString('zh-TW')}`).join('；')]],charts:[{title:'房屋可售面積對照',unit:'坪',note:'各方案獨立，使用同一既有計算核心。',rows:plans.map(p=>[`${p.code} · ${p.title}`,snapshots[p.id].result.values.salePing])},{title:'地下總樓板對照',unit:'㎡',note:'呈現地下開發規模；不是工程成本或施工可行性結論。',rows:plans.map(p=>[`${p.code} · ${p.title}`,snapshots[p.id].result.values.basement])}],inputs:[...comparisonMetrics.map(m=>[m.label,plans.map(p=>`${p.code}：${displayNumber(m.value(snapshots[p.id]))}${m.unit}`).join('；')]),...plans.flatMap((p,i)=>[[`${p.code} · ${p.title}`,'以下為本案採用輸入'],...summaries[i].inputs.map(([l,v])=>[`${p.code}／${l}`,v])]),...plans.slice(1).flatMap(p=>scenarioDifferences(plans[0],p).map(([label,a,b])=>[`${plans[0].code} 與 ${p.code}／${label}`,`${a}；${p.code}採${b}`]))],issues:plans.flatMap((p,i)=>summaries[i].issues.map(t=>`${p.code}：${t}`)),assumptions:plans.flatMap((p,i)=>summaries[i].assumptions.map(t=>`${p.code}：${t}`)),sources:[...new Set(summaries.flatMap(s=>s.sources))]};
}
