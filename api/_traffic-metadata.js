// ISO 3166-2 subdivision codes from Vercel's IP geolocation headers.
const countyCodes={TPE:'臺北市',NWT:'新北市',TAO:'桃園市',TXG:'臺中市',TNN:'臺南市',KHH:'高雄市',KEE:'基隆市',HSZ:'新竹市',CYI:'嘉義市',HSQ:'新竹縣',MIA:'苗栗縣',CHA:'彰化縣',NAN:'南投縣',YUN:'雲林縣',CYQ:'嘉義縣',PIF:'屏東縣',ILA:'宜蘭縣',HUA:'花蓮縣',TTT:'臺東縣',PEN:'澎湖縣',KIN:'金門縣',LIE:'連江縣'};
const countyCityNames={taipei:'TPE',taipeicity:'TPE',newtaipei:'NWT',newtaipeicity:'NWT',taoyuan:'TAO',taoyuancity:'TAO',taichung:'TXG',taichungcity:'TXG',tainan:'TNN',tainancity:'TNN',kaohsiung:'KHH',kaohsiungcity:'KHH',keelung:'KEE',keelungcity:'KEE',hsinchucity:'HSZ',hsinchucounty:'HSQ',chiayicity:'CYI',chiayicounty:'CYQ',miaoli:'MIA',miaolicounty:'MIA',changhua:'CHA',changhuacounty:'CHA',nantou:'NAN',nantoucounty:'NAN',yunlin:'YUN',yunlincounty:'YUN',pingtung:'PIF',pingtungcounty:'PIF',yilan:'ILA',yilancounty:'ILA',hualien:'HUA',hualiencounty:'HUA',taitung:'TTT',taitungcounty:'TTT',penghu:'PEN',penghucounty:'PEN',kinmen:'KIN',kinmencounty:'KIN',lienchiang:'LIE',lienchiangcounty:'LIE',matsu:'LIE'};
function countyFromCity(raw){let city='';try{city=decodeURIComponent(String(raw||'')).toLowerCase().replace(/[\s_-]/g,'').replace(/台/g,'臺');}catch{return null;}return countyCityNames[city]||Object.keys(countyCodes).find(k=>countyCodes[k]===city)||null;}
const regionCodes = {
  north: ['TPE', 'NWT', 'KEE', 'TAO', 'HSZ', 'HSQ', 'ILA'],
  central: ['MIA', 'TXG', 'CHA', 'NAN', 'YUN'],
  south: ['CYI', 'CYQ', 'TNN', 'KHH', 'PIF'],
  east: ['HUA', 'TTT'],
  islands: ['PEN', 'KIN', 'LIE'],
};
const cities = {
  north: ['taipei', 'newtaipei', 'keelung', 'taoyuan', 'hsinchu', 'yilan', '台北', '臺北', '新北', '基隆', '桃園', '新竹', '宜蘭'],
  central: ['miaoli', 'taichung', 'changhua', 'nantou', 'yunlin', '苗栗', '台中', '臺中', '彰化', '南投', '雲林'],
  south: ['chiayi', 'tainan', 'kaohsiung', 'pingtung', '嘉義', '台南', '臺南', '高雄', '屏東'],
  east: ['hualien', 'taitung', '花蓮', '台東', '臺東'],
  islands: ['penghu', 'kinmen', 'lienchiang', 'matsu', '澎湖', '金門', '連江', '馬祖'],
};
function cityName(raw){
 try{const value=decodeURIComponent(String(raw||'')).normalize('NFC').trim().replace(/\s+/gu,' ');return value&&value.length<=100&&/^[\p{L}\p{M}\p{N} .,'’()\/-]+$/u.test(value)?value:null;}catch{return null;}
}
export function trafficMetadata(headers = {}) {
  // Read only Vercel's IP-derived location headers. Never store IP, coordinates or full UA.
  const countryValue = String(headers['x-vercel-ip-country'] || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryValue) ? countryValue : null;
  let county=null;
  let region = country === 'TW' ? 'taiwan_unknown' : country ? 'overseas' : 'unknown';
  if (country === 'TW') {
    const code = String(headers['x-vercel-ip-country-region'] || '').toUpperCase().replace(/^TW-/, '');
    county=Object.hasOwn(countyCodes,code)?code:countyFromCity(headers['x-vercel-ip-city']);
    const mapped = Object.keys(regionCodes).find(key => regionCodes[key].includes(code));
    if (mapped) region = mapped;
    else {
      let city = '';
      try { city = decodeURIComponent(String(headers['x-vercel-ip-city'] || '')).toLowerCase().replace(/[\s_-]/g, '').replace(/(city|county|縣|市)$/u, ''); } catch {}
      region = Object.keys(cities).find(key => cities[key].includes(city)) || 'taiwan_unknown';
    }
  }
  const ua = String(headers['user-agent'] || '');
  let device = 'unknown';
  if (/ipad|tablet|silk|kindle/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua)) || /macintosh.*mobile/i.test(ua)) device = 'tablet';
  else if (/iphone|ipod|android.*mobile|windows phone|mobi/i.test(ua)) device = 'mobile';
  else if (/windows nt|macintosh|x11|cros/i.test(ua)) device = 'desktop';
  return {geo_country: country, geo_region: region, geo_county: county, geo_city: country?cityName(headers['x-vercel-ip-city']):null, device_type: device};
}
