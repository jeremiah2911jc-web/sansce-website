export const OFFICIAL_LINK_REVIEW='2026-10-23';
export const nationalQueries=[
 {id:'cadastre',title:'國土測繪圖資服務雲',purpose:'地號與地籍位置',url:'https://maps.nlsc.gov.tw/',authority:'內政部國土測繪中心',note:'先核對地段、地號與相對位置；實際界址仍須正式資料及鑑界。'},
 {id:'transcript',title:'全國地政電子謄本系統',purpose:'登記面積與權利文件',url:'https://ep.land.nat.gov.tw/',authority:'全國地政電子謄本系統',note:'依官方流程申領及核對登記內容；登入、申請與費用由使用者在官方網站處理。'},
 {id:'zoning',title:'全國土地使用分區資料查詢系統',purpose:'使用分區與使用地類別初查',url:'https://luz.nlma.gov.tw/web/',authority:'國土管理署城鄉發展分署',note:'圖台作初查；查詢結果與最新公告、證明或登記資料逐項核對。'},
];
export const planDirectory={id:'directory',title:'各縣市都市計畫查詢目錄',purpose:'地方計畫書圖與公告入口',url:'https://ngis.nlma.gov.tw/TCDPageD2.aspx',authority:'國土管理署城鄉發展分署',note:'進入官方目錄後選擇所在地；各縣市服務與更新時間不同，請核對所在地最新公告。'};
const cityQueries={
 '新北市':{id:'ntpc',title:'新北市城鄉資訊查詢平台',purpose:'新北市分區與都市計畫書圖',url:'https://urban.planning.ntpc.gov.tw/NtpcURInfo/Map.aspx',authority:'新北市政府城鄉發展局',note:'核對分區、計畫書圖、公告版本及適用地號；以正式文件確認個案適用條件。'},
 '臺北市':{id:'taipei',title:'臺北市土地使用分區查詢',purpose:'臺北市使用分區',url:'https://zonemap.udd.gov.taipei/',authority:'臺北市政府都市發展局',note:'查得分區後，仍需核對適用主要／細部計畫、管制及證明文件。'}
};
export function officialQueries(city){return [...nationalQueries,cityQueries[city]||{...planDirectory,purpose:city?city+'都市計畫書圖入口':'所在地都市計畫書圖入口'}];}
