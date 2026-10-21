// Presentation keys only. Stored source categories and original evidence remain unchanged.
const platforms={google:'Google',bing:'Bing',yahoo:'Yahoo',duckduckgo:'DuckDuckGo',baidu:'百度',facebook:'Facebook',instagram:'Instagram',line:'LINE'};
export const sourceNames={threads_tagged:'網址註明來自 Threads',threads_referral:'瀏覽器回報來自 Threads',other_campaign:'網址註明的來源無法辨認',other_referral:'來自其他網站（未保存網站名稱）',direct_unknown:'無法知道從哪裡進站',internal:'接續站內瀏覽，最初來源不明',unknown:'當時沒有記錄來源'};
for(const [key,name] of Object.entries(platforms)){
 sourceNames[key]=name+'（無法確認怎麼進站）';
 sourceNames[key+'_referrer']='瀏覽器回報來自 '+name;
 sourceNames[key+'_tag']='網址註明來自 '+name;
}
export function sourceKey(source,basis){return Object.hasOwn(platforms,source)&&['tag','referrer'].includes(basis)?source+'_'+basis:source||'unknown';}
export function sourceLabel(source,basis){return sourceNames[sourceKey(source,basis)]||'當時沒有記錄來源';}
export function sourceUnclear(key){return (!key||['unknown','direct_unknown','internal','other_campaign','other_referral'].includes(key))||Object.hasOwn(platforms,key);}
export function sourceExplanation(source,basis){
 if(source==='other_campaign')return '網址有填寫來源名稱，但不在系統可辨認的名單中；原始名稱沒有保存，無法知道填的是哪個來源。';
 if(source==='other_referral')return '瀏覽器有提供其他網站的來源資訊，但系統只保留「其他網站」分類，沒有保存網站名稱。';
 if(source==='direct_unknown')return '瀏覽器沒有提供可用的來源資訊。直接輸入網址、從訊息點入或隱私設定等情況都可能如此，不能判定是哪一種。';
 if(source==='internal')return '今天第一筆紀錄是從站內頁面接續瀏覽，或是頁面開著跨過午夜；最初從哪裡進站沒有記錄。';
 if(!source||source==='unknown')return '當時沒有保存來源資料，無法事後還原。';
 if(basis==='tag'||source==='threads_tagged')return '網址上註明了平台名稱；網址可能被轉傳，不能當成已確認從該平台點入。';
 if(basis==='referrer'||source==='threads_referral')return '瀏覽器提供了來源網站資訊；不會知道訪客的搜尋關鍵字或是哪篇貼文。';
 return '這筆紀錄只留下平台名稱，沒有保存判定依據，無法確認是從該平台點入，還是網址上註明了該平台。';
}
