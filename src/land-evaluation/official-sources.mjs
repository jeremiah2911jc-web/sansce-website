import {TOD_MAP} from './ntpc-tod.mjs';
export const OFFICIAL_LINK_REVIEW='2026-10-23';
export const nationalQueries=[
 {id:'cadastre',title:'國土測繪圖資服務雲',purpose:'地號與地籍位置',url:'https://maps.nlsc.gov.tw/',authority:'內政部國土測繪中心',note:'先核對地段、地號與相對位置；實際界址仍須正式資料及鑑界。'},
 {id:'transcript',title:'全國地政電子謄本系統',purpose:'登記面積與權利文件',url:'https://ep.land.nat.gov.tw/',authority:'全國地政電子謄本系統',note:'依官方流程申領及核對登記內容；登入、申請與繳費請於官方網站辦理。'},
 {id:'zoning',title:'全國土地使用分區資料查詢系統',purpose:'使用分區與使用地類別初查',url:'https://luz.nlma.gov.tw/web/',authority:'國土管理署城鄉發展分署',note:'圖台作初查；查詢結果與最新公告、證明或登記資料逐項核對。'},
];
export const planDirectory={id:'directory',title:'各縣市都市計畫查詢目錄',purpose:'地方計畫書圖與公告入口',url:'https://ngis.nlma.gov.tw/TCDPageD2.aspx',authority:'國土管理署城鄉發展分署',note:'進入官方目錄後選擇所在地；各縣市服務與更新時間不同，請核對所在地最新公告。'};
const cityQueries={
 '新北市':{id:'ntpc',title:'新北市城鄉資訊查詢平台',purpose:'新北市分區與都市計畫書圖',url:'https://urban.planning.ntpc.gov.tw/NtpcURInfo/Map.aspx',authority:'新北市政府城鄉發展局',note:'核對分區、計畫書圖、公告版本及適用地號；以正式文件確認個案適用條件。'},
 '臺北市':{id:'taipei',title:'臺北市土地使用分區查詢',purpose:'臺北市使用分區',url:'https://zonemap.udd.gov.taipei/',authority:'臺北市政府都市發展局',note:'查得分區後，仍需核對適用主要／細部計畫、管制及證明文件。'}
};
export function officialQueries(city){return [...nationalQueries,cityQueries[city]||{...planDirectory,purpose:city?city+'都市計畫書圖入口':'所在地都市計畫書圖入口'},...(city==='新北市'?[{id:'ntpc-tod',title:'新北TOD適用範圍查詢',purpose:'TOD增額容積適用範圍',url:TOD_MAP,authority:'新北市政府城鄉發展局',note:'圖層設定、土地資訊，勾選TOD原有或擴大適用範圍，再依地址或地號核對基地；申請順序與例外依現行公告計畫確認。'}]:[])];}

const railwayLaw={title:'鐵路兩側禁建限建辦法',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0030022'};
const metroLaw={title:'大眾捷運系統兩側禁建限建辦法',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0120007'};
const aviationLaw={title:'航空限高法規',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0090016'};
export function restrictionQueries(city){
 const rows=[{id:'hsr-limit',title:'高鐵兩側限建範圍查詢',purpose:'高鐵沿線基地與施工限制',url:'https://webgisap.rb.gov.tw/LimitBuilding',authority:'交通部鐵道局',note:'可依地號、地址或高鐵里程定位，套疊限建範圍及公告圖。位於範圍內時，建築、開挖與施工須依適用規定辦理審查；請保留查詢結果及公告圖。',laws:[railwayLaw]}];
 if(city==='新北市')rows.unshift(
  {id:'ntpc-limit',title:'新北市禁限建管制圖申請',purpose:'本案禁限建管制資料',url:'https://limit.ntpc.gov.tw/eccmp/ec_paymentCaseApply.jsp',authority:'新北市政府工務局',note:'進入線上申請的「禁限建管制圖」，依官方流程申請本案圖資；申請及費用依機關規定。取得後核對地號、管制項目與會辦單位。'},
  {id:'ntpc-metro-limit',title:'新北市捷運禁建限建查詢',purpose:'捷運沿線基地與施工限制',url:'https://pz.dorts.ntpc.gov.tw/map',authority:'新北市政府捷運工程局',note:'依捷運路線或站名查詢，核對基地與禁建、限建範圍的位置。涉及範圍邊界或開挖施工時，另依公告圖及主管機關資料核對。',laws:[metroLaw]}
 );
 if(city==='臺北市')rows.unshift({id:'taipei-metro-limit',title:'臺北捷運禁限建公告圖查詢',purpose:'捷運沿線基地與施工限制',url:'https://eng.dorts.gov.taipei/br',authority:'臺北市政府捷運工程局',note:'依捷運路線、車站或地址查詢，再開啟圖幅框內的公告圖。核對基地及地下室與捷運設施的位置，施工及開挖另依規定審查。',laws:[metroLaw]});
 if(city==='臺北市'||city==='新北市')rows.push({id:'aviation-height',title:city==='臺北市'?'臺北市航空限高查詢（松山機場）':'機場航空限高查詢',purpose:'機場周邊建築物與障礙物高度',url:'https://www.caa.gov.tw/article.aspx?a=1281&lang=1',authority:'交通部民用航空局',note:'進入後選適用機場；臺北市選松山機場，依基地位置查詢。核對限建海拔高度、基地地面高程，以及建物、屋突與避雷針等頂端高程；限建海拔高度須扣除地面高程後，才能與地面起算的規劃高度比較。',laws:[aviationLaw]});
 return rows;
}
