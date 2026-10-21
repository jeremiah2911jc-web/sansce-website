import {trafficLinkAction,validTrafficAction} from '../shared/traffic-actions.js';
import {trafficSource,trafficSourceBasis} from './traffic-source.js';
import {visitorTrackingMetadata} from './visitor-tracking.js';
export function trackPageView(){
 if(!['www.sanzepm.com.tw','sanzepm.com.tw'].includes(location.hostname)||/^\/traffic\/?$/.test(location.pathname)||navigator.webdriver)return;
 let visit=null;
 function createVisit(continued=false){
  try{
   const metadata=visitorTrackingMetadata();if(metadata.excludeFromTraffic||!metadata.visitorId)return null;
   return {body:JSON.stringify({eventId:crypto.randomUUID(),visitorId:metadata.visitorId,path:location.pathname.replace(/\/$/,'')||'/',durationTracking:true,actionTracking:true,trafficSource:continued?'internal':trafficSource(location.search,document.referrer),sourceBasis:continued?'internal':trafficSourceBasis(location.search,document.referrer)}),visitorId:metadata.visitorId,visibleMs:0,lastTick:Date.now(),lastReportedMs:0,actions:[],scrollDepth:0,accepted:false,attempts:0,done:false,pending:false,timer:null};
  }catch{return null;}
 }
 async function send(current){
  if(!current||current.done||current.pending||current.attempts>=3||document.visibilityState!=='visible')return;
  if(visitorTrackingMetadata().excludeFromTraffic){current.done=true;return;}
  if(current.timer){clearTimeout(current.timer);current.timer=null;}
  current.pending=true;current.attempts++;
  try{
   const response=await fetch('/api/site-traffic',{method:'POST',headers:{'Content-Type':'application/json'},body:current.body,keepalive:true,signal:AbortSignal.timeout(10000)});
   if(response.ok){const result=await response.json?.();current.done=true;if(result?.ignored)return;current.accepted=true;void reportDuration(current);void flushActions(current);return;}
   if(response.status!==429&&response.status<500){current.done=true;return;}
  }catch{/* Same event ID lets the database deduplicate an uncertain response. */}
  finally{current.pending=false;}
  if(current.attempts<3&&!current.done)current.timer=setTimeout(()=>send(current),current.attempts===1?1000:4000);
 }
 function rollover(){
  if(!visit||document.visibilityState!=='visible')return;
  const metadata=visitorTrackingMetadata();
  if(metadata.excludeFromTraffic||!metadata.visitorId||metadata.visitorId===visit.visitorId)return;
  if(visit.timer)clearTimeout(visit.timer);
  visit=createVisit(true);if(visit){visit.wasVisible=true;void send(visit);}
 }
 function canTrack(current){
  const metadata=visitorTrackingMetadata();
  return current&&document.visibilityState==='visible'&&!metadata.excludeFromTraffic&&metadata.visitorId===current.visitorId;
 }
 async function flushActions(current){
  if(!current?.accepted||current.flushing)return;
  const metadata=visitorTrackingMetadata();if(metadata.excludeFromTraffic||metadata.visitorId!==current.visitorId){current.actions=[];return;}
  current.flushing=true;
  try{
   while(current.actions.length){
    const item=current.actions[0];
    if(visitorTrackingMetadata().excludeFromTraffic){current.actions=[];break;}
    try{const response=await fetch('/api/site-traffic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item),keepalive:true,signal:AbortSignal.timeout(10000)});
     if(response.ok||(response.status<500&&response.status!==429))current.actions.shift();else break;
    }catch{break;}
   }
  }finally{current.flushing=false;}
 }
 function actionEvent(action,target){
  rollover();
  if(!canTrack(visit)||visit.actionCount>=128)return;
  const page=JSON.parse(visit.body);visit.actionCount=(visit.actionCount||0)+1;
  visit.actions.push({type:'action',eventId:crypto.randomUUID(),pageEventId:page.eventId,visitorId:page.visitorId,path:page.path,action,target});
  void flushActions(visit);
 }
 window.addEventListener('sanze:interaction',event=>{
  const {action,target}=event.detail||{};
  if(validTrafficAction(action,target))actionEvent(action,target);
 });
 window.addEventListener('sanze:tracking-context',event=>{
  rollover();
  if(canTrack(visit)&&visit.accepted&&typeof event.detail?.receive==='function'){
   const page=JSON.parse(visit.body);
   event.detail.receive({pageEventId:page.eventId,visitorId:page.visitorId,path:page.path});
  }
 });
 function scrollEvent(){
  rollover();
  if(!canTrack(visit))return;
  const root=document.documentElement,height=Math.max(root.scrollHeight,document.body?.scrollHeight||0),viewport=window.innerHeight||root.clientHeight;
  const offset=Math.max(0,window.scrollY||root.scrollTop||0);
  // Initial viewport is not a scroll. Short pages do not fabricate 100% engagement.
  if(height<=viewport+1||offset<=0)return;
  const depth=Math.min(100,Math.floor(offset/(height-viewport)*100));
  for(const threshold of [25,50,75,100])if(depth>=threshold&&threshold>visit.scrollDepth){actionEvent('scroll',String(threshold));visit.scrollDepth=threshold;}
 }
 window.addEventListener('scroll',scrollEvent,{passive:true});
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button>0)return;
  const link=event.target?.closest?.('a[href]');if(!link)return;
  const action=trafficLinkAction(link.getAttribute('href'),location.href);if(action)actionEvent(action.action,action.target);
 });
 function accrue(current){
  if(!current)return;
  const now=Date.now(),elapsed=now-current.lastTick;current.lastTick=now;
  const metadata=visitorTrackingMetadata();
  // Count foreground time only; a suspended device's long timer gap is not reading time.
  if(current.wasVisible && !metadata.excludeFromTraffic && metadata.visitorId===current.visitorId && elapsed>=0 && elapsed<=45000)current.visibleMs=Math.min(43200000,current.visibleMs+elapsed);
  current.wasVisible=document.visibilityState==='visible'&&!metadata.excludeFromTraffic&&metadata.visitorId===current.visitorId;
 }
 async function reportDuration(current){
  if(!current?.accepted)return;
  const metadata=visitorTrackingMetadata();if(metadata.excludeFromTraffic||metadata.visitorId!==current.visitorId)return;
  const visibleMs=Math.floor(current.visibleMs);
  const presence=location.pathname.replace(/\/$/,'')==='/land-evaluation' && typeof window.matchMedia==='function' && window.matchMedia('(min-width: 800px) and (hover: hover) and (pointer: fine)').matches;
  const isVisible=document.visibilityState==='visible'&&current.wasVisible===true;
  if(visibleMs<=current.lastReportedMs&&(!presence||(!isVisible&&current.lastPresenceVisible===false)))return;
  const body={...JSON.parse(current.body),type:'duration',visibleMs,...(presence?{isVisible,reportSequence:current.reportSequence=(current.reportSequence||0)+1}:{})};
  try{const response=await fetch('/api/site-traffic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true,signal:AbortSignal.timeout(10000)});if(response.ok){current.lastReportedMs=Math.max(current.lastReportedMs,visibleMs);if(presence&&body.reportSequence===(current.reportSequence||0))current.lastPresenceVisible=isVisible;}}catch{/* The next heartbeat resends the cumulative total; the server takes its maximum. */}
 }
 function record(continued=false){
  rollover();
  accrue(visit);
  if(document.visibilityState!=='visible'){void reportDuration(visit);return;}
  if(!visit){visit=createVisit(continued);if(visit)visit.wasVisible=true;}
  void send(visit);
  if(visit?.accepted&&location.pathname.replace(/\/$/,'')==='/land-evaluation')void reportDuration(visit);
 }
 globalThis.setInterval?.(()=>{rollover();accrue(visit);void send(visit);void reportDuration(visit);void flushActions(visit);},15000);
 window.addEventListener('pagehide',()=>{accrue(visit);if(visit)visit.wasVisible=false;void reportDuration(visit);void flushActions(visit);});
 record();document.addEventListener('visibilitychange',()=>record());window.addEventListener('online',()=>record());
 window.addEventListener('pageshow',event=>{if(!event.persisted)return;if(visit?.timer)clearTimeout(visit.timer);visit=null;record(true);});
}
