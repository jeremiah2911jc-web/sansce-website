// Explicit synthetic legal facts used by regression cases. Never product defaults.
export function confirmSyntheticBonusConditions(i){
 const a=i.regulatoryReview?.bonusAssessment;if(!a)return i;
 Object.assign(a,{date:a.date||'2026-11-02',source:a.source||'合成驗收條件，非實際案件文件',renewalQualification:'yes',dangerQualification:'yes',tdrQualification:'yes',dangerEligibleSite:a.dangerEligibleSite||String(i.site),dangerAdjacentSite:a.dangerAdjacentSite||'0',conditions:{renewalWork:'rebuild',implementation:'rights',overlap:'distinct',overlapSource:'合成不同給予事項與範圍圖',tdrSource:'合成接受基地資格依據',dangerCategory:'1',dangerConsent:'yes',originalCap:'base',quickExtras:'yes',greenMinimum:'none',entries:Object.fromEntries(Object.keys(a.entries||{}).map(k=>[k,'yes'])),...a.conditions}});
 if(i.roadConditions)Object.assign(i.roadConditions,{plannedWidth:i.roadConditions.plannedWidth||'12',openedWidth:i.roadConditions.openedWidth||'12',frontage:i.roadConditions.frontage||'25',connected:'yes',status:'confirmed',source:'合成道路圖說，非實際文件',checkedAt:'2026-10-19'});
 return i;
}
