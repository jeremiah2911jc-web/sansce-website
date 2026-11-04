import {publicText} from './public-copy.mjs';

function displayRow(label,value){
 const name=publicText(label),text=publicText(value).replace(/（規劃預設值）$/,'').trim();
 const fields={
  '土管／規模獎勵目標':['其他容積獎勵','依土地使用管制或基地規模申請的獎勵。'],
  '都更獎勵目標（以基準容積為計算基礎）':['預計都更獎勵','以基準容積計算，申請資格另查證。'],
  '容積移轉目標':['預計容積移轉','以基準容積計算，移入資格另查證。'],
  '危老獎勵目標':['預計危老獎勵','以基準容積計算，申請資格另查證。'],
  '法定建築面積使用比例':['建築面積使用比例','規劃建築面積占法定建築面積的比例。'],
  '允建容積使用比例':['容積使用比例','本次使用的容積占允建容積的比例。'],
  '屋突單層投影比例':['屋突投影比例','屋突投影面積占規劃建築面積的比例。'],
  '規劃屋突每層高度':['屋突每層高度',''],
  '機車位規劃需求':['每戶機車位數',''],
  '地下非停車空間可登記分攤比例':['地下設備與梯間列入公設的比例','符合登記條件的地下設備與梯間，列入房屋公設的比例。'],
  '地下設備梯間預留比例':['地下設備與梯間預留比例','占地下樓板面積的比例。'],
  '一般方案地下層高':['地下室每層高度',''],
  '柱網及轉彎額外預留':['停車空間預留比例','供柱位與車輛轉彎使用。'],
 };
 if(name.startsWith('每戶地上分攤面積'))return {name:'每戶面積',note:'含地上公設與陽台；屋突及地下室另列。',value:text};
 if(name==='陽台配置比例')return {name:'陽台面積比例',note:'占各層樓板面積的比例。',value:text.replace('%各層樓板','%')};
 if(name==='店舖等第一類用途配置比例')return {name:'店舖等用途比例',note:'占地上樓板面積的比例；停車用途分類另依地區規定。',value:text.replace('%地上樓板','%')};
 const [title,note]=fields[name]||[name,''];
 return {name:title,note,value:text};
}

export function PlanningDefaultValues({rows}){
 return <div className="le-default-values"><p className="le-default-values-note">以下數值供初步試算，請依基地現況與預計的建築、戶數及停車配置調整。</p>{rows.length?<table className="le-default-values-table"><thead><tr><th scope="col">試算項目</th><th scope="col">本次數值</th></tr></thead><tbody>{rows.map(([label,value])=>{const row=displayRow(label,value);return <tr key={label}><th scope="row">{row.name}{row.note&&<small>{row.note}</small>}</th><td>{row.value}</td></tr>;})}</tbody></table>:<p>目前沒有採用預設值的欄位。</p>}</div>;
}
