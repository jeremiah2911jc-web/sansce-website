import {countyNames,countyAliases,townships} from './taiwan-geography-data.js';
export const geographyVersion=1;
const regions={north:['TPE','NWT','KEE','TAO','HSZ','HSQ','ILA'],central:['MIA','TXG','CHA','NAN','YUN'],south:['CYI','CYQ','TNN','KHH','PIF'],east:['HUA','TTT'],islands:['PEN','KIN','LIE']};
export const countyRegion=Object.fromEntries(Object.entries(regions).flatMap(([r,codes])=>codes.map(c=>[c,r])));
// Exact, case-insensitive aliases only. Never substring-match a district or guess from nearby places.
export const normalizeGeoName=value=>String(value||'').normalize('NFC').toLowerCase().replace(/台/g,'臺').replace(/[\s.'’_-]/gu,'');
const counties={},districts={};
function add(map,name,county){const k=normalizeGeoName(name);if(!k)return;map[k]||=[];if(!map[k].includes(county))map[k].push(county);}
for(const [name,code]of Object.entries(countyAliases))add(counties,name,code);
// Bare names identify both a city and a county; retain ambiguity without an agreeing subdivision.
for(const [name,codes]of [['Hsinchu',['HSZ','HSQ']],['新竹',['HSZ','HSQ']],['Chiayi',['CYI','CYQ']],['嘉義',['CYI','CYQ']]])for(const c of codes)add(counties,name,c);
for(const t of townships){for(const name of [t.name,t.name.replace(/[區鄉鎮市]$/u,''),t.en,t.en.replace(/ (District|Township|City)$/i,'')])add(districts,name,t.county);}
// Common transliterations; each remains tied to an official township, not a network's reported county.
for(const [name,code]of [['Banciao','NWT'],['Panchiao','NWT'],['Sinjhuang','NWT'],['Danshui','NWT']])add(districts,name,code);
export const geographyAliases={counties,districts};
export function resolveTrafficGeography(country,rawCounty,rawCity,rawRegion='unknown'){
 const code=String(rawCounty||'').toUpperCase().replace(/^TW-/,'');const known=Object.hasOwn(countyNames,code)?code:null;
 if(country!=='TW')return{county:null,region:country?'overseas':Object.hasOwn(regions,rawRegion)?rawRegion:'unknown',resolution:country?'country_only':'unknown'};
 const key=normalizeGeoName(rawCity),countyCandidates=counties[key],districtCandidates=districts[key];
 const candidates=countyCandidates||districtCandidates;let county=null,resolution;
 if(candidates){
  if(known&&candidates.includes(known)){county=known;resolution='consistent';}
  else if(candidates.length===1&&!countyCandidates){county=candidates[0];resolution=known?'district_corrected':'district_mapped';}
  else if(candidates.length===1&&!known){county=candidates[0];resolution='city_mapped';}
  else resolution=known?'conflict':'ambiguous';
 }else if(known){county=known;resolution='subdivision_only';}
 else resolution='unknown';
 const common=candidates?.map(c=>countyRegion[c]);
 const fallback=common?.length&&common.every(r=>r===common[0])?common[0]:null;
 const legacy=Object.hasOwn(regions,rawRegion)?rawRegion:'taiwan_unknown';
 return{county,region:county?countyRegion[county]:fallback||(resolution==='conflict'?'taiwan_unknown':legacy),resolution};
}
