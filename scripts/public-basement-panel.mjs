// Website presentation only: do not present a missing calculation as zero or
// put the rule catalogue into a case-evidence input.
export function adaptBasementPanel(source){
 let text=source;
 function replace(from,to){if(!text.includes(from))throw Error('Basement presentation adapter source changed: '+from.slice(0,80));text=text.replace(from,to);}
 replace(' const limit=d.enabled?resolveExcavationLimit({...input,basementDemand:d}):null;',` const hasBase=[input.site,input.coverage].every(v=>String(v??'').trim()!==''&&Number.isFinite(Number(v))&&Number(v)>0)&&Number(input.coverage)<=100;
 const limit=d.enabled&&hasBase?resolveExcavationLimit({...input,basementDemand:d}):null;
 const showLimit=Boolean(hasBase&&limit&&!limit.errors.length&&Number.isFinite(limit.cap));`);
 replace("value={Number.isFinite(limit?.cap)?Number(limit!.cap.toFixed(2)):''}","value={showLimit?Number(limit!.cap.toFixed(2)):''}");
 replace("value={d.taipeiZone&&d.taipeiPlanUnspecified&&Number.isFinite(limit?.cap)?limit!.cap:''}","value={showLimit?limit!.cap:''}");
 replace('<label>法規來源<textarea aria-label="法規來源" readOnly value={NTPC_EXCAVATION_SOURCE}/></label>', '<RuleReference source={hasBase?NTPC_EXCAVATION_SOURCE:undefined}/>');
 replace('<label>法規來源<textarea aria-label="法規來源" readOnly value={TAIPEI_EXCAVATION_SOURCE.split("：https")[0]}/></label>', '<RuleReference source={hasBase?TAIPEI_EXCAVATION_SOURCE:undefined}/>');
 replace('<p><a href={TAIPEI_EXCAVATION_URL} target="_blank" rel="noreferrer">臺北市都審開挖參考規定</a></p>', '');
 replace('<p>依基地面積與建蔽率自動加權：前500㎡加20個百分點，其餘加10個百分點。新市鎮、捷運開發及核准例外，請選擇個案規定。</p>', '{hasBase&&<p>新市鎮、捷運開發及核准例外，請選擇個案規定。</p>}');
 replace('<p>本次開挖率上限{f(limit?.cap??0)}%。', '<p>{showLimit&&<>本次開挖率上限{f(limit!.cap)}%。</>}');
 return "import {RuleReference} from '/src/land-evaluation/RuleReference.jsx';\n"+text;
}
