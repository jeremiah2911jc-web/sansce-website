import {isTrafficExcluded,setTrafficExcluded} from './exclusion.js';
const $=id=>document.getElementById(id);let token='',busy=false,latestData=null;const storage='sanze-traffic-owner';try{token=localStorage.getItem(storage)||'';}catch{}const fragment=new URLSearchParams(location.hash.slice(1));if(fragment.has('key')){token=fragment.get('key');history.replaceState(null,'',location.pathname);}if(fragment.get('exclude')==='1'){setTrafficExcluded(true);history.replaceState(null,'',location.pathname);}isTrafficExcluded();
const number=n=>Number(n).toLocaleString('zh-TW');const names={"/reports":"案件報告登入入口","/landowner-comparison":"地主分配試算與比較","/":"首頁","/checkup":"案件健檢","/consulting":"都市更新顧問","/process":"服務流程","/programs":"雙北都更專案","/insights":"三策觀點","/about":"關於三策","/contact":"聯絡我們","/services/urban-renewal":"都市更新顧問：基地評估、地主整合與推動程序","/services/dangerous-old-rebuilding":"危老重建評估：確認適用資格與所有權人意願","/services/joint-construction":"合建顧問：核對分配、費用與契約條件","/services/project-management":"全案管理：專業團隊協調、文件與進度追蹤","/insights/renewal-distribution":"都更談分配，地主需要的是看得懂的答案","/insights/building-permit-extension":"建照期限延長，地主的交屋安排怎麼辦？","/insights/property-transfers-market":"房屋移轉量增加，能說房市回溫了嗎？"};
const retiredNames={"/insights/urban-renewal-vs-dangerous-old":"都更與危老重建怎麼選？先看這四個條件（舊文章）","/insights/joint-construction-terms":"合建分配比例怎麼比較？簽約前問清楚五件事（舊文章）","/insights/renewal-association":"更新會成立後要做什麼？先把資料、分工與會議安排好（舊文章）"};
function pageRows(data){const counts=new Map();for(const p of data.pages){const path=p.path.startsWith('/insights/')?'/insights':p.path;counts.set(path,(counts.get(path)||0)+Number(p.views));}return [...new Set([...Object.keys(names).filter(path=>!path.startsWith('/insights/')),...counts.keys()])].map(path=>({path,name:names[path]||path,views:counts.get(path)||0})).sort((a,b)=>b.views-a.views||a.path.localeCompare(b.path));}
function lock(){token='';try{localStorage.removeItem(storage);}catch{}$('login').hidden=false;$('dashboard').hidden=true;$('refresh').hidden=true;$('status').textContent='看板已鎖定';}
async function refresh(){if(!token||busy||document.hidden)return;busy=true;const requestedToken=token;$('refresh').disabled=true;$('status').textContent='更新中…';try{const res=await fetch('/api/site-traffic',{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(15000)});if(res.status===401){lock();throw Error('查看碼不正確，請重新輸入。');}if(!res.ok)throw Error('暫時無法取得資料，請稍後按「更新數據」。');const data=await res.json();if(token!==requestedToken)return;latestData=data;renderQuality();renderDistributions();renderVisitorArrivals();renderAudience();renderReportReadings();$('total-views').textContent=number(data.totalViews);$('total-visitors').textContent=number(data.totalVisitorDays);try{localStorage.setItem(storage,token);}catch{}setTrafficExcluded(true);renderExclusion();$('login').hidden=true;$('dashboard').hidden=false;$('refresh').hidden=false;$('key').value='';$('visitors').textContent=number(data.todayVisitors);$('views').textContent=number(data.todayViews);$('week').textContent=number(data.weekViews);$('ai-questions').textContent=number(data.todayAiQuestions);$('ai-visitors').textContent=number(data.todayAiVisitors);$('ai-week').textContent=number(data.weekAiQuestions);$('ai-answers').textContent='已回覆 '+number(data.todayAiAnswered)+' 題 · 回覆失敗 '+number(data.todayAiFailed)+' 題 · 待完成／狀態未確認 '+number(data.todayAiPending??Math.max(0,data.todayAiQuestions-data.todayAiAnswered-data.todayAiFailed))+' 題';$('ai-answers').replaceChildren(semanticText('已回覆 '+number(data.todayAiAnswered)+' 題','neutral'),semanticText('回覆失敗 '+number(data.todayAiFailed)+' 題',data.todayAiFailed>0?'unknown':'neutral'),semanticText('待完成／狀態未確認 '+number(data.todayAiPending??Math.max(0,data.todayAiQuestions-data.todayAiAnswered-data.todayAiFailed))+' 題',(data.todayAiPending??Math.max(0,data.todayAiQuestions-data.todayAiAnswered-data.todayAiFailed))>0?'unknown':'neutral'));$('ai-visitor-note').textContent=data.todayAiUnlinkedQuestions?'已識別訪客；另有 '+number(data.todayAiUnlinkedQuestions)+' 次提問未識別訪客':'同一天、同一瀏覽器提問多次計一位';$('ai-note').textContent=data.todayAiUnlinkedQuestions?'今日有 '+number(data.todayAiUnlinkedQuestions)+' 次提問未識別訪客（包含功能啟用前與可能的測試紀錄），已計入提問次數，但未計入提問訪客數。':'提問訪客依每日瀏覽器識別計算；已登入看板的瀏覽器與自動測試不計入。';$('ai-pages').replaceChildren();for(const p of data.aiPages){const li=document.createElement('li');const title=document.createElement('span');title.textContent=names[p.path]||retiredNames[p.path]||p.path;const count=document.createElement('b');count.textContent=number(p.questions)+' 次';li.append(title,count);$('ai-pages').append(li);}if(!data.aiPages.length){const li=document.createElement('li');li.textContent='這段期間尚無提問紀錄。';$('ai-pages').append(li);}$('yesterday').textContent='昨日 '+number(data.yesterdayViews)+' 次';$('chart').replaceChildren();const max=Math.max(1,...data.daily.map(d=>d.views));for(const d of data.daily){const cell=document.createElement('div');cell.className='day';const count=document.createElement('b');const startDay=data.startedAt?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.startedAt)):null;count.textContent=startDay&&d.day<startDay?'未統計':number(d.views);if(d.day===startDay)cell.title='開始統計當日，僅含啟用後紀錄';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 60 150');svg.setAttribute('aria-hidden','true');const rect=document.createElementNS(svg.namespaceURI,'rect');const h=d.views?Math.max(4,140*d.views/max):2;for(const [k,v]of Object.entries({x:10,y:150-h,width:40,height:h,rx:6}))rect.setAttribute(k,v);svg.append(rect);const label=document.createElement('span');label.textContent=d.day.slice(5).replace('-','/');cell.title=(startDay&&d.day<startDay)?d.day+'：尚未開始統計':d.day+'：'+d.views+' 次瀏覽、'+d.visitors+' 個瀏覽器識別'+(d.day===startDay?'（啟用當日，非完整一天）':'');cell.append(count,svg,label);$('chart').append(cell);}$('pages').replaceChildren();const rows=pageRows(data);for(const [i,p]of rows.entries()){const li=document.createElement('li');const title=document.createElement('a');title.href=p.path;title.target='_blank';title.rel='noopener';title.textContent=String(i+1).padStart(2,'0')+'　'+p.name;const value=document.createElement('span');value.className='page-count';const count=document.createElement('b');count.textContent=number(p.views)+' 次';const share=document.createElement('small');share.textContent=(data.weekViews?100*p.views/data.weekViews:0).toFixed(1)+'%';value.append(count,share);li.append(title,value);$('pages').append(li);}$('started').textContent=data.startedAt?'本輪開始統計：'+new Date(data.startedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})+'（台灣時間）':'已啟用，等待第一筆瀏覽紀錄。';$('status').textContent=data.today+' · 更新於 '+new Date(data.updatedAt).toLocaleTimeString('zh-TW',{timeZone:'Asia/Taipei'})+' · 每分鐘自動更新';}catch(error){if(token!==requestedToken)return;$('status').textContent=error.message+'（若畫面已有數據，為上次更新結果。）';}finally{busy=false;$('refresh').disabled=false;}}

const regionNames={TPE:'臺北市',NWT:'新北市',TAO:'桃園市',TXG:'臺中市',TNN:'臺南市',KHH:'高雄市',KEE:'基隆市',HSZ:'新竹市',CYI:'嘉義市',HSQ:'新竹縣',MIA:'苗栗縣',CHA:'彰化縣',NAN:'南投縣',YUN:'雲林縣',CYQ:'嘉義縣',PIF:'屏東縣',ILA:'宜蘭縣',HUA:'花蓮縣',TTT:'臺東縣',PEN:'澎湖縣',KIN:'金門縣',LIE:'連江縣',north_unknown:'北部・縣市未辨識',central_unknown:'中部・縣市未辨識',south_unknown:'南部・縣市未辨識',east_unknown:'東部・縣市未辨識',islands_unknown:'離島・縣市未辨識',overseas:'海外',taiwan_unknown:'臺灣・縣市未辨識',unknown:'未識別來源'};
function locationName(key){
 if(typeof key==='string'&&/^country:[A-Z]{2}$/.test(key)){
  const code=key.slice(8);try{const name=new Intl.DisplayNames(['zh-Hant'],{type:'region'}).of(code);return name&&name!==code?name:'國家／地區代碼：'+code;}catch{return '國家／地區代碼：'+code;}
 }
 return key==='overseas'?'海外・國家／地區未辨識':regionNames[key]||'地區未辨識';
}
const deviceNames={mobile:'手機',desktop:'電腦',tablet:'平板',unknown:'未識別裝置'};
const sourceNames={threads_tagged:'Threads・專用連結',threads_referral:'Threads・來源辨識',google:'Google（標記或來源）',bing:'Bing（標記或來源）',yahoo:'Yahoo（標記或來源）',duckduckgo:'DuckDuckGo（標記或來源）',baidu:'百度（標記或來源）',facebook:'Facebook（標記或來源）',instagram:'Instagram（標記或來源）',line:'LINE（標記或來源）',other_campaign:'其他標記連結',other_referral:'其他網站',direct_unknown:'來源不明',internal:'站內延續／外部來源不明',unknown:'未記錄來源'};
function renderDistributions(){
 if(!latestData)return;
 const period=$('distribution-period').value;
 const data=latestData.visitorDistributions;
 const available=data?.metric==='visitor_days';
 const unit=period==='today'?' 位':' 人次';
 for(const [id,labels,rows] of [['regions',regionNames,data?.locationPeriods?.[period]||data?.countyPeriods?.[period]||[]],['devices',deviceNames,data?.devicePeriods?.[period]||[]],['sources',sourceNames,data?.sourcePeriods?.[period]||[]]]){
  const counts=new Map(rows.map(r=>[r.key,Number(r.visitors)]));const total=rows.reduce((sum,r)=>sum+Number(r.visitors),0);$(id).replaceChildren();
  const entries=id==='regions'?[...counts].filter(([,n])=>n>0).map(([key])=>[key,locationName(key)]).sort((a,b)=>counts.get(b[0])-counts.get(a[0])||a[1].localeCompare(b[1],'zh-TW')):id==='sources'?[...counts.keys()].map(key=>[key,labels[key]||'未識別來源分類']).filter(([key])=>(counts.get(key)||0)>0).sort((a,b)=>counts.get(b[0])-counts.get(a[0])||a[1].localeCompare(b[1],'zh-TW')):Object.entries(labels);
  if(!entries.length){const li=document.createElement('li');li.textContent=available?'尚無訪客紀錄':id==='sources'?'暫時無法取得進站來源':'暫時無法取得縣市分類';$(id).append(li);}
  for(const [key,name] of entries){
   const li=document.createElement('li');const title=document.createElement('span');title.textContent=name;
   const value=document.createElement('span');value.className='page-count';const count=document.createElement('b');const visitors=counts.get(key)||0;count.textContent=available?number(visitors)+unit:'—';
   const share=document.createElement('small');share.textContent=available?(total?100*visitors/total:0).toFixed(1)+'%':'—';value.append(count,share);if(id==='sources')title.className='semantic-label '+(['unknown','direct_unknown','internal'].includes(key)?'tone-unknown':'tone-source');li.append(title,value);$(id).append(li);
  }
 }
 const total=(data?.locationPeriods?.[period]||data?.countyPeriods?.[period]||[]).reduce((sum,r)=>sum+Number(r.visitors),0);
 $('distribution-note').textContent=available?({today:'今日',week:'近七天',total:'累計'}[period]+'共 '+number(total)+unit+(period==='today'?'訪客。同一瀏覽器瀏覽多頁只計一位。':'訪客；每日訪客數加總，同一瀏覽器跨日回訪會再次計入。')):'暫時無法取得訪客分類，請稍後更新數據。';
 renderCountryCities(period);
 $('metadata-note').textContent=latestData.metadataStartedAt?'縣市已依城市名稱對照重整；不明與衝突資料不強行歸類。國外按國家合併。地區與裝置首次有紀錄：'+new Date(latestData.metadataStartedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})+' 開始；舊紀錄只有區域，無法補算縣市；沒有縣市資料時保留區域並標示未辨識。':'地區與裝置分類已啟用，等待新的訪客紀錄；舊紀錄只有區域，無法補算縣市；沒有縣市資料時保留區域並標示未辨識。';
}
$('distribution-period').addEventListener('change',renderDistributions);

$('auth').addEventListener('submit',e=>{e.preventDefault();token=$('key').value.trim();refresh();});$('refresh').addEventListener('click',refresh);$('logout').addEventListener('click',lock);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(refresh,60000);if(token)refresh();

function formatStay(ms){
 if(ms===null||ms===undefined||!Number.isFinite(ms)||ms<0)return '尚未取得停留時間';
 if(ms===0)return '尚未取得停留時間';
 const seconds=Math.floor(ms/1000);if(seconds<1)return '未滿1秒';
 const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;
 return (h?h+'小時 ':'')+(m?m+'分 ':'')+(s?s+'秒':'');
}
function renderVisitorArrivals(){
 const data=latestData?.visitorArrivals, list=$('visitor-arrivals');const expanded=new Set([...list.querySelectorAll('details[open]')].map(el=>el.id));list.replaceChildren();
 if(!data){$('arrivals-note').textContent='進站時間暫時無法取得，請稍後更新。';return;}
 $('arrivals-note').textContent=data.rows.length?'今日 '+number(data.total)+' 位訪客'+(data.total>data.rows.length?'，顯示最近 '+number(data.rows.length)+' 位':'')+'。':'今天尚無訪客進站紀錄。';
 const time=stamp=>new Date(stamp).toLocaleTimeString('zh-TW',{timeZone:'Asia/Taipei',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
 for(const row of data.rows){
  const card=document.createElement('article');card.className='visitor-arrival';card.id='visitor-'+String(row.visitorNumber).padStart(2,'0');
  const title=document.createElement('h3');title.textContent='訪客 '+String(row.visitorNumber).padStart(2,'0');
  const details=document.createElement('dl');
  for(const [label,value,stamp] of [['當日首次來源',sourceNames[row.trafficSource]||'未記錄來源',null],['首次開啟頁面',names[row.entryPath||row.pages?.[0]?.path]||retiredNames[row.entryPath||row.pages?.[0]?.path]||row.entryPath||row.pages?.[0]?.path||'未取得',null],['裝置（估計）',deviceNames[row.deviceType]||'未識別裝置',null],['國家／地區（估計）',countryName(row.geoCountry||(row.locationKey?.startsWith('country:')?row.locationKey.slice(8):regionNames[row.locationKey]&&row.locationKey!=='overseas'&&row.locationKey!=='unknown'?'TW':null)),null],['城市／縣市（估計）',cityLabel({country:row.geoCountry,county:row.geoCounty,city:row.geoCity,region:row.geoRegion}),null],['首次頁面紀錄',time(row.firstSeen),row.firstSeen],['最後開啟頁面',time(row.lastSeen),row.lastSeen],['最後收到操作',row.lastActionAt?time(row.lastActionAt):'尚無操作回報',row.lastActionAt],['已記錄停留時間（估計）',formatStay(row.visibleMs)+(Number(row.durationTrackedViews)>0&&Number(row.durationTrackedViews)<Number(row.views)?'（部分瀏覽未取得停留時間）':''),null],['瀏覽次數',number(row.views)+' 次',null]]){
   const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;if(label==='當日首次來源')group.className='visitor-entry-source';if(label.includes('（估計）')&&label!=='已記錄停留時間（估計）')group.className='visitor-location';
   if(stamp){const t=document.createElement('time');t.dateTime=stamp;t.textContent=value;dd.append(t);}else dd.textContent=value;
   if(label==='當日首次來源')dd.className='data-badge '+(['direct_unknown','internal','unknown'].includes(row.trafficSource)||!row.trafficSource?'tone-unknown':'tone-source');
   if(label==='已記錄停留時間（估計）')dd.className='data-badge '+(!(Number(row.visibleMs)>0)||Number(row.durationTrackedViews)<Number(row.views)?'tone-unknown':'tone-stay');
   if(label==='瀏覽次數')dd.className='data-badge tone-views';
   group.append(dt,dd);details.append(group);
  }
  const heading=document.createElement('div');heading.className='visitor-arrival-heading';heading.append(title,details);card.append(heading);
  const evidence=document.createElement('p');evidence.className='visitor-evidence page-note';
  evidence.textContent=(row.sourceBasis==='tag'?'來源依連結標記分類；標記可能被轉傳，不代表已證實從該平台點入。':row.sourceBasis==='referrer'?'來源依瀏覽器提供的來源網站分類，未使用連結標記判定。':row.trafficSource==='direct_unknown'?'未取得外部來源資訊；不能確認是直接輸入、社群或訊息連結。':row.trafficSource==='internal'?'首筆紀錄來自站內頁面或跨日延續；原本外部來源未知。':row.trafficSource==='threads_tagged'?'連結帶有 Threads 標記；連結可能被轉傳，不等於已證實從 Threads 點入。':row.trafficSource==='threads_referral'?'瀏覽器提供的來源網站為 Threads。':row.trafficSource==='unknown'||!row.trafficSource?'此筆未保存來源，不能事後還原。':'分類依連結標記或瀏覽器提供的來源；不代表已確認身分或搜尋關鍵字。')+' 同一編號只代表當日同一瀏覽器識別，不保證是一位真人。';
  const disclosure=document.createElement('details');disclosure.className='visitor-disclosure';disclosure.id=card.id+'-details';disclosure.open=expanded.has(disclosure.id);const summary=document.createElement('summary');summary.textContent='瀏覽頁面與操作明細（'+number(row.pages?.length||0)+' 頁）';disclosure.append(summary);const detailBody=document.createElement('div');detailBody.className='visitor-detail-body';disclosure.append(detailBody);detailBody.append(evidence);
  const pages=document.createElement('div');pages.className='visitor-pages';const caption=document.createElement('h4');caption.textContent='瀏覽頁面';pages.append(caption);
  const items=document.createElement('ol');
  for(const page of row.pages||[]){const item=document.createElement('li'),label=document.createElement('span'),count=document.createElement('b');label.textContent=names[page.path]||retiredNames[page.path]||page.path;count.textContent=number(page.views)+' 次';item.append(label,count);items.append(item);}
  if(!items.children.length){const item=document.createElement('li');item.textContent='尚無頁面明細';items.append(item);}
  pages.append(items);detailBody.append(pages);
  const journey=document.createElement('div');journey.className='visitor-journey';
  const journeyTitle=document.createElement('h4');journeyTitle.textContent='進站後的操作';journey.append(journeyTitle);
  const note=document.createElement('p');note.className='page-note';
  note.textContent=row.timeline===undefined?'操作紀錄暫時無法取得。':!row.interactionTrackedViews?'這些頁面未啟用操作追蹤，只能列出已收到的開啟頁面；不能推定沒有操作。':Number(row.interactionTrackedViews)<Number(row.views)?'僅部分頁面啟用操作追蹤；缺漏的操作無法補算。':'依伺服器收到紀錄的時間排列；網路延遲可能改變先後。捲動表示頁面位置；點擊聯絡不代表已通話、傳訊或送出諮詢。土地開發評估入口點擊與成功產出結果分別記錄；重算再次產出結果會再記一次，不等於不同使用者或不同案件。啟用前未記錄的操作無法補算。新版服務切換、試算、助理開啟與聯絡面板操作自新版追蹤啟用後才記錄；舊資料不能補算。諮詢成功代表寄送服務已接受，不代表收件人已閱讀。';journey.append(note);
  const steps=document.createElement('ol');steps.className='visitor-timeline';steps.setAttribute?.('aria-label','訪客操作時間順序');
  for(const step of row.timeline||[]){
   const item=document.createElement('li'),at=document.createElement('time'),body=document.createElement('div'),label=document.createElement('b'),page=document.createElement('span');at.dateTime=step.at;at.textContent=time(step.at);
   const interactionLabels={tool_entry:{'/land-evaluation':'點擊土地開發評估入口（不代表完成計算）'},land_evaluation_complete:{result:'土地開發評估：成功產出一次計算結果'},service_select:{site:'切換服務：基地評估',contract:'切換服務：合建條件',checkup:'切換服務：案件健檢',management:'切換服務：全案管理'},stage_select:{integration:'查看階段：正在整合地主',association:'查看階段：更新會已成立',submitted:'查看階段：案件已經送件',blocked:'查看階段：推動遇到困難',feasibility:'查看需求：評估可行性',cooperation:'查看需求：整合與合作',progress:'查看需求：追蹤案件進度'},calculator_example:{fixed:'帶入範例：已知分回面積',development:'帶入範例：容積與比例不同',separate:'帶入範例：分項約定比例'},calculator_complete:{single:'試算完成：單一提案',comparison:'試算完成：兩案比較'},assistant_open:{launcher:'開啟三策助理',calculator:'在試算頁開啟三策助理'},assistant_question:{send:'送出助理提問（回覆結果另見 AI 統計）'},contact_open:{rail:'開啟聯絡面板',mobile:'從手機底列開啟聯絡面板'},contact_success:{accepted:'諮詢送出成功（伺服器確認寄送）'}};
   const destination=names[step.target]||retiredNames[step.target]||step.target;
   label.textContent=step.action==='pageview'?'開啟'+destination:step.action==='scroll'?'捲動位置達 '+step.target+'%':step.action==='service_click'?'點擊服務：'+destination:step.action==='checkup_click'?'點擊案件健檢':step.action==='contact_click'?({'/contact':'點擊聯絡／預約諮詢','line':'點擊 LINE 聯絡','phone':'點擊撥打電話','email':'點擊電子郵件'}[step.target]||'點擊聯絡'):(interactionLabels[step.action]?.[step.target]||'操作');
   if(step.action!=='pageview'){page.textContent='所在頁面：'+(names[step.path]||retiredNames[step.path]||step.path);body.append(label,page);}else body.append(label);
   item.className='action-'+(['contact_click','contact_open','contact_success'].includes(step.action)?'contact':['tool_entry','land_evaluation_complete','service_click','checkup_click','service_select','stage_select','calculator_example','calculator_complete','assistant_open','assistant_question'].includes(step.action)?'service':step.action==='scroll'?'scroll':'page');item.append(at,body);steps.append(item);
  }
  journey.append(steps);
  if(Number(row.timelineTotal)>(row.timeline||[]).length){const more=document.createElement('p');more.className='page-note';more.textContent='共 '+number(row.timelineTotal)+' 筆，顯示最早 '+number(row.timeline.length)+' 筆。';journey.append(more);}
  detailBody.append(journey);card.append(disclosure);list.append(card);
 }
}

function renderExclusion(){const excluded=isTrafficExcluded();$('exclusion-status').textContent=excluded?'本瀏覽器已排除流量統計':'本瀏覽器尚未排除流量統計';$('exclude-browser').hidden=excluded;$('exclusion-help').textContent=excluded?'使用這個瀏覽器測試網站與 AI 助理，不計入流量。鎖定看板後仍有效；清除網站資料或使用其他瀏覽器時，請重新啟用。':'點擊啟用後，使用這個瀏覽器測試網站就不會計入流量。手機請用平常測試網站的瀏覽器開啟下方連結。';}
$('exclude-browser').addEventListener('click',()=>{setTrafficExcluded(true);renderExclusion();});renderExclusion();

function renderReportReadings(){
 const host=$('report-readings');host.replaceChildren();
 const data=latestData?.reportReadings;
 if(!data){const note=document.createElement('p');note.className='page-note';note.textContent='案件閱讀紀錄暫時無法取得，請稍後更新。';host.append(note);return;}
 const rows=data.cases;
 const stamp=v=>new Date(v).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
 const devices={mobile:'手機',desktop:'電腦',tablet:'平板',unknown:'未辨識裝置'};
 for(const c of rows){
  const title=document.createElement('h3');title.textContent=c.reportId+(c.title?'｜'+c.title:'');host.append(title);
  const metrics=document.createElement('div');metrics.className='metrics report-reading-metrics';
  for(const [label,value] of [['累計瀏覽器識別',c.uniqueVisitors],['累計進入次數',c.totalVisits],['重複開啟的瀏覽器',c.returningVisitors],['今日進入次數',c.todayVisits]]){
   const card=document.createElement('article'),p=document.createElement('p'),b=document.createElement('strong');p.textContent=label;b.textContent=number(value);card.className=label.includes('進入次數')?'metric-views':'metric-neutral';card.append(p,b);metrics.append(card);
  }host.append(metrics);
  const visitors=document.createElement('div');visitors.className='report-reading-visitors';
  const heading=document.createElement('h4');heading.textContent='個別訪客與進入明細';visitors.append(heading);
  function entryTable(entries,total){
   const scroll=document.createElement('div');scroll.className='report-entry-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','每次進入紀錄，可左右捲動');
   const table=document.createElement('table'),thead=document.createElement('thead'),header=document.createElement('tr'),tbody=document.createElement('tbody');
   for(const label of ['進入次序','日期','進入時間','瀏覽裝置']){const th=document.createElement('th');th.scope='col';th.textContent=label;header.append(th);}thead.append(header);
   for(const [index,e] of entries.entries()){
    const tr=document.createElement('tr');
    const date=new Date(e.at),day=date.toLocaleDateString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}),time=date.toLocaleTimeString('zh-TW',{timeZone:'Asia/Taipei',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
    for(const value of ['第 '+number(total-index)+' 次',day,time,devices[e.device]||devices.unknown]){const td=document.createElement('td');td.textContent=value;tr.append(td);}tbody.append(tr);
   }
   if(!entries.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='尚無進入紀錄';td.className='report-entry-empty';tr.append(td);tbody.append(tr);}
   table.append(thead,tbody);scroll.append(table);return scroll;
  }
  for(const v of c.rows){
   const item=document.createElement('article');item.className='report-reading-visitor';
   const title=document.createElement('h5');title.textContent='訪客 '+String(v.visitorNumber).padStart(2,'0');
   const count=document.createElement('span');count.className='report-visitor-count';count.textContent='累計進入 '+number(v.visits)+' 次';
   const top=document.createElement('div');top.className='report-visitor-heading';top.append(title,count);
   const info=document.createElement('p');info.className='page-note';info.textContent='首次：'+stamp(v.firstSeen)+'　最近：'+stamp(v.lastSeen);
   const device=document.createElement('p');device.className='report-visitor-device';device.textContent='最近一次瀏覽裝置：'+(devices[v.entries[0]?.device]||devices.unknown);
   item.append(top,device,info,entryTable(v.entries,v.visits));
   if(v.visits>v.entries.length){const note=document.createElement('p');note.className='page-note';note.textContent='列出最近 '+v.entries.length+' 次進入；累計次數包含全部紀錄。';item.append(note);}
   visitors.append(item);
  }
  if(!c.rows.length){const note=document.createElement('p');note.className='page-note';note.textContent='目前尚無報告開啟紀錄。有訪客開啟報告後，會逐位列出每次進入的日期、時間與瀏覽裝置（手機、平板或電腦）。';visitors.append(note,entryTable([],0));}
  if(c.uniqueVisitors>c.rows.length){const note=document.createElement('p');note.className='page-note';note.textContent='列出最近閱讀的 '+c.rows.length+' 位訪客；累計數包含全部訪客。';visitors.append(note);}
  host.append(visitors);
 }
}

function countryName(code){
 if(!code)return '國家／地區未辨識';
 try{return new Intl.DisplayNames(['zh-Hant'],{type:'region'}).of(code)||code;}catch{return code;}
}
function cityLabel(row){
 if(row.country&&row.country!=='TW')return '僅按國家統計';
 if(row.county&&regionNames[row.county])return regionNames[row.county];
 if(row.city)return row.city;
 const fallback=regionNames[(row.region||'')+'_unknown'];
 return fallback||'城市未辨識';
}
function geographyLabel(row){return row.country&&row.country!=='TW'?countryName(row.country):countryName(row.country)+'／'+cityLabel(row);}
function audienceRows(period){return latestData?.audienceContent?.periods?.[period]||[];}
function renderCountryCities(period){
 const countries=$('countries');countries.replaceChildren();
 const data=latestData?.audienceContent;
 if(!data){const li=document.createElement('li');li.textContent='國家與城市統計暫時無法取得';countries.append(li);return;}
 const rows=data.countryPeriods[period]||[],total=rows.reduce((n,r)=>n+Number(r.visitors),0);
 for(const row of rows){const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('span');label.textContent=countryName(row.country);value.textContent=number(row.visitors)+(period==='today'?' 位':' 人次')+' · '+(total?row.visitors/total*100:0).toFixed(1)+'%';value.className='geo-count';li.append(label,value);countries.append(li);}
 if(!rows.length){const li=document.createElement('li');li.textContent='尚無訪客紀錄';countries.append(li);}
 const host=$('regions');host.replaceChildren();
 for(const row of audienceRows(period)){const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=geographyLabel(row);value.textContent=number(row.visitors)+(period==='today'?' 位':' 人次');li.append(label,value);host.append(li);}
}
function fillAudienceSelect(id,items,fallback){
 const select=$(id),previous=select.value;select.replaceChildren();
 for(const [value,label] of [["all",fallback],...items]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
 select.value=items.some(([value])=>value===previous)?previous:'all';
}
function semanticText(text,tone){const span=document.createElement('span');span.className='semantic-label tone-'+tone;span.textContent=text;return span;}
function audienceFacts(row,unit){return [semanticText(number(row.visitors)+unit+'訪客','neutral'),semanticText(number(row.views)+' 次瀏覽','views'),semanticText(Number(row.visibleMs)>0?'已記錄停留時間 '+formatStay(row.visibleMs):'尚未取得停留時間',Number(row.visibleMs)>0?'stay':'unknown'),...(row.durationViews>0&&row.durationViews<row.views?[semanticText('部分瀏覽未取得停留時間','unknown')]:[])];}
function renderAudience(){
 const host=$('audience-content');host.replaceChildren();
 const data=latestData?.audienceContent;
 if(!data){$('audience-summary').textContent='地區閱讀統計暫時無法取得，請稍後更新數據。';return;}
 const period=$('audience-period').value,all=audienceRows(period),unit=period==='today'?' 位':' 人次';
 fillAudienceSelect('audience-country',[...new Set(all.map(r=>r.country||'unknown'))].map(code=>[code,countryName(code==='unknown'?null:code)]),'全部國家／地區');
 const country=$('audience-country').value,countryRows=all.filter(r=>country==='all'||(r.country||'unknown')===country);
 fillAudienceSelect('audience-city',countryRows.filter(r=>r.country==='TW').map(r=>[r.key,geographyLabel(r)]),'全部台灣縣市');
 $('audience-city').disabled=country!=='all'&&country!=='TW';
 const selected=$('audience-city').value,rows=countryRows.filter(r=>selected==='all'||r.key===selected);
 const visitors=rows.reduce((n,r)=>n+Number(r.visitors),0),views=rows.reduce((n,r)=>n+Number(r.views),0);
 $('audience-summary').textContent=({today:'今日',week:'近七天',total:'累計'}[period])+' · '+number(visitors)+unit+'訪客 · '+number(views)+' 次瀏覽 · '+rows.length+' 個地區';
 for(const row of rows){
  const card=document.createElement('article');card.className='audience-location';
  const heading=document.createElement('h3');heading.textContent=geographyLabel(row);
  const metrics=document.createElement('p');metrics.className='audience-metrics';metrics.textContent=number(row.visitors)+unit+'訪客 · '+number(row.views)+' 次瀏覽 · 已記錄停留時間 '+formatStay(row.visibleMs)+(row.durationViews>0&&row.durationViews<row.views?'（部分瀏覽未取得停留時間）':'');
  const topics=document.createElement('p');topics.className='audience-topics';topics.textContent='瀏覽內容分類：'+(row.topics||[]).slice(0,4).map(t=>t.name+' '+number(t.visitors)+unit).join('；');
  metrics.replaceChildren(...audienceFacts(row,unit));card.append(heading,metrics,topics);
  const list=document.createElement('ol');list.className='audience-pages';
  for(const page of row.pages||[]){
   const li=document.createElement('li'),copy=document.createElement('div'),a=document.createElement('a'),stats=document.createElement('p'),activity=document.createElement('p');
   a.href=page.path;a.target='_blank';a.rel='noopener';a.textContent=names[page.path]||retiredNames[page.path]||page.path;
   stats.textContent=page.topic+' · '+number(page.visitors)+unit+'訪客 · '+number(page.views)+' 次瀏覽 · 已記錄停留時間 '+formatStay(page.visibleMs)+(page.durationViews>0&&page.durationViews<page.views?'（部分瀏覽未取得停留時間）':'');
   activity.textContent=page.actionViews?(page.maxScroll?'最高記錄捲動 '+page.maxScroll+'%':'尚無捲動紀錄')+' · 捲動至 75% 以上 '+number(page.deepViews)+' 次瀏覽 · 已記錄服務／健檢點擊 '+number(page.serviceClicks)+' 次 · 已記錄聯絡點擊 '+number(page.contactClicks)+' 次'+(page.actionViews<page.views?'（部分頁面有操作紀錄）':''):'未啟用操作追蹤，無法判定';
   stats.className='audience-page-stats';stats.replaceChildren(semanticText(page.topic,'source'),...audienceFacts(page,unit));activity.className='audience-page-stats';if(page.actionViews){activity.replaceChildren(semanticText((page.maxScroll?'最高記錄捲動 '+page.maxScroll+'%':'尚無捲動紀錄')+' · 捲動至75%以上 '+number(page.deepViews)+' 次瀏覽','neutral'),semanticText('已記錄服務／健檢點擊 '+number(page.serviceClicks)+' 次','source'),semanticText('已記錄聯絡點擊 '+number(page.contactClicks)+' 次',page.contactClicks>0?'contact':'neutral'));if(page.actionViews<page.views)activity.append(semanticText('部分頁面有操作紀錄','unknown'));}else activity.classList.add('missing-data');copy.append(a,stats,activity);li.append(copy);list.append(li);
  }
  card.append(list);host.append(card);
 }
 if(!rows.length){const p=document.createElement('p');p.className='page-note';p.textContent='這段期間尚無符合條件的訪客紀錄。';host.append(p);}
 $('audience-data-note').textContent=data.cityStartedAt?'城市資料自 '+new Date(data.cityStartedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})+' 起有紀錄；既有台灣縣市保留。':'城市記錄已啟用，等待新進站紀錄；既有台灣縣市保留，海外舊紀錄缺少城市時顯示「城市未辨識」。';
}
for(const id of ['audience-period','audience-country','audience-city'])$(id).addEventListener('change',renderAudience);

function renderQuality(){
 const host=$('quality-details');if(!host)return;host.replaceChildren();
 const d=latestData,rows=d.visitorArrivals?.rows;
 const add=text=>{const p=document.createElement('p');p.textContent=text;host.append(p);};
 add(d.snapshotVersion===2?'各區塊使用同一次資料快照。':'尚未使用同一次資料快照；區塊間可能存在更新時間差，暫勿交叉推算比例。');
 const unavailable=[['訪客明細',d.visitorArrivals],['來源與裝置',d.visitorDistributions],['地區內容',d.audienceContent],['報告開啟',d.reportReadings]].filter(([,value])=>!value).map(([name])=>name);
 if(unavailable.length)add('暫時缺少：'+unavailable.join('、')+'。缺少資料不代表零。');
 if(rows){
  const shown=rows.reduce((n,r)=>n+Number(r.views),0),reported=rows.reduce((n,r)=>n+Number(r.durationTrackedViews||0),0);
  add('今日已列出 '+number(rows.length)+' 個瀏覽器識別、'+number(shown)+' 次頁面紀錄；其中 '+number(reported)+' 次有停留時間紀錄。'+(rows.length<d.visitorArrivals.total?'清單已截斷，覆蓋數僅限已列出部分。':''));
  if(d.visitorArrivals.total!==d.todayVisitors||(rows.length===d.visitorArrivals.total&&shown!==d.todayViews))add('注意：訪客明細與上方總數不一致；請更新後再判讀。');
 }
 add('未辨識的自動程式、網路或隱私工具可能影響紀錄；不能把全部紀錄當成真人、把地區當成所在地，或把停留當成專心閱讀。');
}
