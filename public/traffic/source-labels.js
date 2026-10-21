// Presentation keys only. Stored source categories and original evidence remain unchanged.
const platforms={google:'Google',bing:'Bing',yahoo:'Yahoo',duckduckgo:'DuckDuckGo',baidu:'百度',facebook:'Facebook',instagram:'Instagram',line:'LINE'};
export const sourceNames={threads_tagged:'連結標記為 Threads',threads_referral:'瀏覽器回報來自 Threads',other_campaign:'連結含其他來源標記',other_referral:'瀏覽器回報來自其他網站',direct_unknown:'來源不明',internal:'站內延續，最初來源不明',unknown:'未記錄來源'};
for(const [key,name] of Object.entries(platforms)){
 sourceNames[key]=name+'（進站方式未區分）';
 sourceNames[key+'_referrer']='瀏覽器回報來自 '+name;
 sourceNames[key+'_tag']='連結標記為 '+name;
}
export function sourceKey(source,basis){return Object.hasOwn(platforms,source)&&['tag','referrer'].includes(basis)?source+'_'+basis:source||'unknown';}
export function sourceLabel(source,basis){return sourceNames[sourceKey(source,basis)]||'未記錄來源';}
export function sourceUnclear(key){return ['unknown','direct_unknown','internal'].includes(key)||Object.hasOwn(platforms,key);}
