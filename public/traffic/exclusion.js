const key='sanze-traffic-excluded';
const cookie='sanze_traffic_excluded';
export function isTrafficExcluded(){
 let excluded=false;
 try{excluded=localStorage.getItem(key)==='1'||Boolean(localStorage.getItem('sanze-traffic-owner'));}catch{}
 try{excluded=excluded||document.cookie.split(';').some(part=>part.trim()===cookie+'=1');}catch{}
 if(excluded)setTrafficExcluded(true);
 return excluded;
}
export function setTrafficExcluded(enabled){
 try{if(enabled)localStorage.setItem(key,'1');else localStorage.removeItem(key);}catch{}
 try{document.cookie=cookie+'='+(enabled?'1':'')+'; Path=/; Max-Age='+(enabled?31536000:0)+'; SameSite=Lax; Secure'+(['www.sanzepm.com.tw','sanzepm.com.tw'].includes(location.hostname)?'; Domain=sanzepm.com.tw':'');}catch{}
}
