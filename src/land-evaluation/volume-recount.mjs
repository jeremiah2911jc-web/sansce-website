// Presentation of the calculator's existing exemptions. No solver inputs are changed.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const nonnegative=x=>Math.max(0,finite(x)?x:0);
const total=(rows,key)=>rows.reduce((sum,row)=>sum+nonnegative(row[key]),0);
export function volumeRecount(result){
 const v=result?.values;if(!v)return null;
 const multi=result.multiBuilding,above=multi?.above||result.floorReview,below=multi?.below||result.regulatory?.volume;
 if(!above||!below)return null;
 const rows=[];
 const add=(id,label,adopted,exempt,reason,field)=>{if(!finite(adopted)||!finite(exempt))return;rows.push({id,label,adopted,exempt:Math.min(adopted,nonnegative(exempt)),counted:nonnegative(adopted-exempt),reason,field});};
 add('equipment','地上機電等共用空間',above.equipment,above.equipmentExempt,'符合用途的部分按全案免計額度分配；超額或用途未符合者計容。','equipment');
 add('lobby','地上梯廳',above.lobby,above.lobbyExempt,'逐層檢討10%，並與陽台合計檢討15%；淨深等資格另核。','lobby');
 add('balcony','陽台',above.balcony,above.balconyExempt,'逐層檢討10%，並與梯廳合計檢討15%；超額部分計容。','balcony');
 if(multi)add('roof','屋突',v.roof,v.roof-nonnegative(v.roofCounted),'按各幢投影、高度及用途檢核；本次未符合免計條件的屋突樓板暫計容。','roof');
 else if(result.roofEnvelopeReview&&!result.roofEnvelopeReview.errors.length)add('roof','屋突',v.roof,v.roof,'依本次投影、高度及用途條件採免計；實際圖說與登記另核。','roof');
 add('car','地下汽車與服務車道',below.carExempt+below.parkingCounted,below.carExempt,'非機械汽車按實設車位每位40㎡上限；機械停車依設備配置空間另核。','basement');
 add('undergroundEquipment','地下設備與梯間',below.pools?.equipmentArea,nonnegative(below.pools?.equipmentArea-below.equipmentCounted),'依合格避難設備、停車免計剩餘額度及全案機電剩餘額度依序檢討。','basement');
 for(const [id,label,pool,counted,reason] of [
  ['motorcycle','地下機車與服務車道',below.motoPool,below.motorcycleCounted,'依本次法定停車適用條件檢討，資格未符合的部分計容。'],
  ['bicycle','地下自行車與服務車道',below.bikePool,below.bicycleCounted,'尚缺免計適用依據時，先列計容；補入適用資料後重新計算。'],
  ['community','地下裝卸等空間',below.communityPool,below.communityCounted,'依本次用途及免計條件檢討。'],
  ['other','地下其他空間',below.spareCounted+below.shelterOnlyExempt,below.spareCounted,'未定用途部分先計容；合格防空避難專用空間依本次檢核另列免計。']
 ])if(finite(pool)&&finite(counted))add(id,label,pool,pool-counted,reason,'basement');
 const aboveCounted=total(rows.filter(row=>row.field!=='basement'),'counted'),belowCounted=below.counted;
 const counted=aboveCounted+belowCounted,ordinaryBudget=v.allowed-counted;
 const floors=(above.floors||[]).map(row=>({label:row.label,area:row.floorArea,equipment:nonnegative(row.equipment-row.equipmentExempt),lobby:nonnegative(row.lobby-row.lobbyExempt),balcony:nonnegative(row.balcony-row.balconyExempt)}));
 return {rows,floors,aboveCounted,belowCounted,counted,ordinaryBudget,allowed:v.allowed,aboveBudget:v.allowed-belowCounted,totalUsed:v.aboveCounted+v.basementCounted,unused:v.unused,equipmentCap:multi?.equipmentCap??v.equipmentCap};
}
export function volumeRecountSections(result,format){
 const review=volumeRecount(result);if(!review)return [];
 return [{title:'反計容積與空間占用',columns:['項目','配置㎡','免計㎡','計入容積㎡','採用原因'],rows:review.rows.map(row=>[row.label,format(row.adopted),format(row.exempt),format(row.counted),row.reason])},
 {title:'反計容積後的可用額度',columns:['項目','面積㎡'],rows:[['允建容積',format(review.allowed)],['地上反計容積',format(review.aboveCounted)],['地下計容',format(review.belowCounted)],['扣除上述面積後的一般樓板容積額度',format(review.ordinaryBudget)],['本次地上與地下計容合計',format(review.totalUsed)],['本次未使用容積（負值為超額）',format(review.unused)]]}];
}
