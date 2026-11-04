const model=i=>i.assessmentMode==='document'?'document':i.mixedSite?.enabled?'mixed':i.multiBuilding?.enabled?'multi':i.commercialIntensity?.enabled?'commercial':'single';
// Deferred keystrokes may lag behind the current selection. Never give a
// newly selected renderer a result from a different calculation model.
export const previewInput=(current,deferred)=>model(current)===model(deferred)?deferred:current;
