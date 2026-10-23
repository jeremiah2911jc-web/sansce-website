export function landFindingTarget(f,parcelId){
 const fields={identity:'土地查證文件、文號、網址及範圍',regime:'土地管制體系',urban:'都市計畫名稱（都計內）',housing:'使用地編定（非都市土地）','ag-scope':'預定用途',community:'全案規劃戶數',sensitive:'道路、環境敏感與其他限制'};
 return fields[f.id]?{module:'land',parcelId,label:fields[f.id]}:null;
}
export function readjustmentFindingTarget(f,p,land,documents){
 const doc=documents.find(d=>d.id===f.id);if(doc)return {label:doc.title+'依據、頁次與適用範圍'};
 const fields={membership:'範圍圖、清冊與地號查證依據','plan-name':'整體開發計畫名稱',stage:'本案辦理階段','本案-share':'評估持分分子','scope-source':'納入範圍與持分依據','burden-method':'分配面積資料方式','expro-method':'分配面積資料方式',buildability:'後續建築條件',target:'預定取得標的','trade-date':'預定取得日期','right-state':'取得時點原土地權利',transfer:'本次權利承接查核',handled:'已處理事項與承擔義務',choice:'本案補償選擇紀錄'};
 if(f.id==='plan-name')return {label:p.planName?.trim()?'辦理單位／主管機關':'整體開發計畫名稱'};
 if(f.id==='scope-area')return p.parcelIds.length?{heading:'地號與納入範圍'}:{label:'本案納入面積（㎡）'};
 if(fields[f.id])return {label:fields[f.id]};
 const included=land.parcels.filter(x=>p.parcelIds.includes(x.id));
 for(const [i,parcel] of included.entries()){
  const prefix='第'+(i+1)+'筆土地';
  if(f.id===parcel.id+'-area')return {module:'land',parcelId:parcel.id,label:'登記面積（㎡）'};
  if(f.id===parcel.id+'-scope')return {label:prefix+'納入面積（㎡）'};
  if(f.id===prefix+'-share')return {label:prefix+'持分分子'};
  if(f.id===parcel.id+'-evidence')return {label:prefix+'納入範圍與持分依據'};
 }
 return null;
}
