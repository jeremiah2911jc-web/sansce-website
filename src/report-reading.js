import {isTrafficExcluded} from '../public/traffic/exclusion.js';
export function trackReportReading(initialId){
 if(!['www.sanzepm.com.tw','sanzepm.com.tw'].includes(location.hostname)||navigator.webdriver||isTrafficExcluded())return;
 let eventId=initialId,attempts=0,pending=false,done=false,timer;
 async function send(){
  if(done||pending||attempts>=3||document.visibilityState!=='visible')return;
  if(isTrafficExcluded()){done=true;return;}
  pending=true;attempts++;
  try{const r=await fetch('/api/reports',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'read',eventId}),keepalive:true,signal:AbortSignal.timeout(10000)});if(r.ok||(r.status<500&&r.status!==429))done=true;}catch{}
  finally{pending=false;}
  if(!done&&attempts<3)timer=setTimeout(send,attempts===1?1000:4000);
 }
 const record=()=>{void send();};
 const restored=e=>{if(!e.persisted)return;clearTimeout(timer);eventId=crypto.randomUUID();attempts=0;done=false;record();};
 record();document.addEventListener('visibilitychange',record);window.addEventListener('online',record);window.addEventListener('pageshow',restored);
 return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',record);window.removeEventListener('online',record);window.removeEventListener('pageshow',restored);done=true;};
}
