import {resolveTrafficGeography} from '../shared/traffic-geography.js';
function cityName(raw){
 try{const value=decodeURIComponent(String(raw||'')).normalize('NFC').trim().replace(/\s+/gu,' ');return value&&value.length<=100&&/^[\p{L}\p{M}\p{N} .,'’()\/-]+$/u.test(value)?value:null;}catch{return null;}
}
export function trafficMetadata(headers = {}) {
  // Read only Vercel's IP-derived location headers. Never store IP, coordinates or full UA.
  const countryValue = String(headers['x-vercel-ip-country'] || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryValue) ? countryValue : null;
  const city=country?cityName(headers['x-vercel-ip-city']):null;
  const rawCounty=String(headers['x-vercel-ip-country-region']||'').slice(0,20);
  const geo=resolveTrafficGeography(country,rawCounty,city);
  const ua = String(headers['user-agent'] || '');
  let device = 'unknown';
  if (/ipad|tablet|silk|kindle/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua)) || /macintosh.*mobile/i.test(ua)) device = 'tablet';
  else if (/iphone|ipod|android.*mobile|windows phone|mobi/i.test(ua)) device = 'mobile';
  else if (/windows nt|macintosh|x11|cros/i.test(ua)) device = 'desktop';
  return {geo_country: country, geo_region: geo.region, geo_county: geo.county, geo_city: country&&(country!=='TW'||!['conflict','ambiguous'].includes(geo.resolution))?city:null, geo_original:{country,county:rawCounty||null,city,region:geo.region}, device_type: device};
}
