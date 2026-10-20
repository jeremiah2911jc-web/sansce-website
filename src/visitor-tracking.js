import {isTrafficExcluded} from '../public/traffic/exclusion.js';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let fallback;
export function visitorTrackingMetadata() {
 try {
  const owner = isTrafficExcluded();
  if (owner || navigator.webdriver || !['www.sanzepm.com.tw','sanzepm.com.tw'].includes(location.hostname)) return { visitorId: null, excludeFromTraffic: true };
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  try {
   const saved = JSON.parse(localStorage.getItem('sanze-visitor-day') || 'null');
   if (saved?.day === day && uuid.test(saved.id)) return { visitorId: saved.id, excludeFromTraffic: false };
  } catch {}
  if (fallback?.day !== day) fallback = {day, id: crypto.randomUUID()};
  try { localStorage.setItem('sanze-visitor-day', JSON.stringify(fallback));if(JSON.parse(localStorage.getItem('sanze-visitor-day')||'null')?.id!==fallback.id)throw Error('storage'); } catch { return {visitorId:null,excludeFromTraffic:true}; }
  return { visitorId: fallback.id, excludeFromTraffic: false };
 } catch { return { visitorId: null, excludeFromTraffic: false }; }
}
