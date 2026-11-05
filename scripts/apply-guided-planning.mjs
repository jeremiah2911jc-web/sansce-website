import {parse} from '@babel/parser';
export const GUIDED_PLANNING_PATCH_VERSION='guided-planning.2026-11-03.v1';
export function applyGuidedPlanning(code){
 if(code.includes('/* guided-planning-hook */'))return code.replace('input.planningDefaults ? jsx2("p", {role:"status",children:"本次先依目標條件初估；資格與文件列入結果的待查事項。"}) : summaryIncomplete ?', 'input.planningDefaults ? null : summaryIncomplete ?');
 const ast=parse(code,{sourceType:'module'}),edits=[];
 const fn=name=>ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
 const resolve=fn('resolveExcavationLimit');if(!resolve)return code;
 edits.push({start:resolve.body.start+1,end:resolve.body.start+1,text:`
  /* guided-planning-hook */
  // Unverified Taipei planning reference, never a verified zoning/plan decision.
  if(i.planningDefaults?.version==="planning-defaults.2026-11-03.v1" && i.assessmentMode!=="document" && i.basementDemand?.rule==="taipei_general" && i.basementDemand.taipeiPlanUnspecified===undefined){
    const coverage=Number(i.coverage),maxFloors=Number(i.basementDemand.maxFloors);
    if(coverage>0&&coverage<=100&&Number.isInteger(maxFloors)&&maxFloors>=1&&maxFloors<=30){
      const cap=Math.min(50,coverage+10);
      return {cap,source:"臺北規劃開挖參考值；使用分區及個案都市計畫待確認。",maxFloors,errors:[],notes:["地下開挖暫按"+cap+"%作配置比較（規劃預設值）；使用分區及都市計畫尚未查證，實際上限待核。"]};
    }
  }
`});
 const demand=fn('calculateDemandBasement');
 const noCandidate=demand.body.body.find(n=>n.type==='IfStatement'&&n.test?.type==='UnaryExpression'&&n.test.argument?.name==='selected');
 if(!noCandidate)throw Error('Missing basement search result');
 const original=code.slice(noCandidate.start,noCandidate.end);
 edits.push({start:noCandidate.start,end:noCandidate.end,text:`if(!selected){
    const inputIssues=[...new Set(trials.flatMap(t=>t.errors))].filter(e=>/TOD|住商混用|路寬|查證|來源|待確認|未填|實施方式|獎勵.*條件|容移.*資格/.test(e));
    if(i.planningDefaults?.version==="planning-defaults.2026-11-03.v1"&&inputIssues.length)return {...run({...plain,excavation:String(limit.cap)}),values:null,errors:inputIssues,notes:[...limit.notes]};
    ${original.replace('if (!selected) ','')}
  }`});
 for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);
 return code.replace('summaryIncomplete ? jsx2("p", {role:"status",children:"請完成基地資料、獎勵適用條件與本次採用比例。"})', 'input.planningDefaults ? null : summaryIncomplete ? jsx2("p", {role:"status",children:"請完成基地資料、獎勵適用條件與本次採用比例。"})');
}
