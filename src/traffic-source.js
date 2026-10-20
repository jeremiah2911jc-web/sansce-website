// Return only an allowlisted category. Never upload referrer URLs, search terms or UTM text.
const sameSite=h=>['sanzepm.com.tw','www.sanzepm.com.tw'].includes(h);
const domain=(h,d)=>h===d||h.endsWith('.'+d);
export function trafficSource(search='',referrer=''){
 let source='';try{source=new URLSearchParams(search).get('utm_source')?.trim().toLowerCase()||'';}catch{}
 const tags={threads:'threads_tagged',google:'google',bing:'bing',yahoo:'yahoo',duckduckgo:'duckduckgo',baidu:'baidu',facebook:'facebook',instagram:'instagram',line:'line'};
 if(source)return tags[source]||'other_campaign';
 if(!referrer)return 'direct_unknown';
 try{const url=new URL(referrer);if(!['https:','http:'].includes(url.protocol))return 'direct_unknown';const h=url.hostname.toLowerCase();if(sameSite(h))return 'internal';
 if(domain(h,'threads.com')||domain(h,'threads.net'))return 'threads_referral';
 if(['google.com','google.com.tw','google.co.jp','google.co.uk','google.com.hk','google.com.au','google.ca','google.de','google.fr','google.co.in'].some(d=>domain(h,d)))return 'google';
 for(const d of ['bing.com','yahoo.com','duckduckgo.com','baidu.com'])if(domain(h,d))return d.split('.')[0];
 for(const d of ['facebook.com','instagram.com','line.me'])if(domain(h,d))return d==='line.me'?'line':d.split('.')[0];
 return 'other_referral';}catch{return 'direct_unknown';}
}

export function trafficSourceBasis(search='',referrer=''){
 try{if(new URLSearchParams(search).get('utm_source')?.trim())return 'tag';}catch{}
 const source=trafficSource(search,referrer);
 return source==='internal'?'internal':source==='direct_unknown'?'none':'referrer';
}
