import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {makeTrafficHandler} from '../api/_site-traffic.js';

const key='traffic-regression-fixture';
const hash=createHash('sha256').update(key).digest('hex');
// Public CI omits the encrypted reports. Include both supported shapes here so
// adding a case-document report cannot silently break the traffic snapshot.
const reportRecords={
 LEGACY:{id:'LEGACY',title:'Legacy short title',editorial:{title:'Legacy editorial title'}},
 DOCUMENT:{id:'DOCUMENT',layout:'case-document',title:'Document report title',sections:[]},
 UNTITLED:{id:'UNTITLED',layout:'case-document'}
};
const snapshot={snapshotVersion:2,today:'2026-10-27',updatedAt:'2026-10-27T14:00:00Z',todayViews:3,todayVisitors:2,weekViews:3,totalViews:3,totalVisitorDays:2,todayAiQuestions:0,todayAiVisitors:0,weekAiQuestions:0,todayAiAnswered:0,todayAiFailed:0,aiPages:[],daily:[],pages:[],reportReadings:{cases:[{reportId:'DOCUMENT',totalVisits:2,uniqueVisitors:1,returningVisitors:1,todayVisits:2,rows:[]}]}};
async function request(data=snapshot,token=key){
 const handler=makeTrafficHandler({env:{SITE_TRAFFIC_KEY_HASH:hash},reportRecords,dbFactory:()=>({rpc:async()=>({data})})});
 const response={setHeader(){},end(value){this.body=JSON.parse(value);}};
 await handler({method:'GET',headers:{authorization:'Bearer '+token}},response);
 return response;
}
test('full traffic snapshot supports legacy and case-document reports without losing reading counts',async()=>{
 const response=await request();
 assert.equal(response.statusCode,200);
 assert.equal(response.body.todayViews,3);
 const [legacy,document,untitled]=response.body.reportReadings.cases;
 assert.equal(legacy.title,'Legacy editorial title');
 assert.equal(legacy.totalVisits,0);
 assert.equal(document.title,'Document report title');
 assert.equal(document.totalVisits,2);
 assert.equal(document.uniqueVisitors,1);
 assert.equal(untitled.title,'UNTITLED');
 assert.ok(!JSON.stringify(response.body).includes('sections'));
});
test('traffic still rejects invalid access and incomplete snapshots',async()=>{
 assert.equal((await request(snapshot,'wrong')).statusCode,401);
 assert.equal((await request(null)).statusCode,503);
 assert.equal((await request({...snapshot,snapshotVersion:1})).statusCode,503);
});

const dashboard=readFileSync(new URL('../public/traffic/dashboard.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function browser(){
 const elements=new Map(),saved=new Map();
 function element(){return {hidden:false,disabled:false,value:'',textContent:'',children:[],listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},querySelectorAll(){return [];},setAttribute(){}};}
 const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
 get('dashboard').hidden=true;get('refresh').hidden=true;
 let next={status:503};
 const context={document:{hidden:false,getElementById:get,createElement:element,addEventListener(){}},localStorage:{getItem:id=>saved.get(id)||null,setItem:(id,value)=>saved.set(id,value),removeItem:id=>saved.delete(id)},location:{hash:''},URLSearchParams,AbortSignal,setInterval(){},isTrafficExcluded:()=>true,setTrafficExcluded(){},sourceNames:{},sourceLabel:()=>'',sourceUnclear:()=>false,fetch:async url=>{
  if(url.includes('view=online'))return {ok:true,json:async()=>({count:0,checkedAt:'2026-10-27T14:00:00Z'})};
  if(next instanceof Error)throw next;
  return {ok:next.status===200,status:next.status,json:async()=>next.data};
 }};
 runInNewContext(dashboard,context);
 return {get,saved,respond:value=>{next=value;},async open(){get('key').value=key;get('auth').listeners.submit({preventDefault(){}});await this.flush();},async flush(){for(let i=0;i<20;i++)await Promise.resolve();},async refresh(){get('refresh').listeners.click();await this.flush();}};
}
test('initial failure offers the visible open button and can recover on retry',async()=>{
 const page=browser();await page.open();
 assert.equal(page.get('dashboard').hidden,true);
 assert.match(page.get('status').textContent,/再按「開啟看板」/);
 assert.ok(!page.get('status').textContent.includes('更新數據'));
 assert.equal(page.get('key').value,key);
 page.respond({status:200,data:snapshot});await page.open();
 assert.equal(page.get('login').hidden,true);
 assert.equal(page.get('dashboard').hidden,false);
 assert.equal(page.get('refresh').hidden,false);
 assert.equal(page.get('views').textContent,'3');
 assert.equal(page.get('key').value,'');
 assert.equal(page.saved.get('sanze-traffic-owner'),key);
 page.respond({status:503});await page.refresh();
 assert.match(page.get('status').textContent,/再按「更新數據」。目前保留上次成功取得的資料/);
 assert.equal(page.get('dashboard').hidden,false);
 assert.equal(page.get('views').textContent,'3');
});
test('invalid access keeps its explanation after locking the dashboard',async()=>{
 const page=browser();page.respond({status:401});await page.open();
 assert.equal(page.get('status').textContent,'查看碼不正確，請重新輸入。');
 assert.equal(page.get('login').hidden,false);
 assert.equal(page.get('dashboard').hidden,true);
 assert.equal(page.saved.has('sanze-traffic-owner'),false);
});
test('timeout and network failures offer the visible retry action',async()=>{
 for(const [name,message] of [['TimeoutError','更新等候逾時'],['TypeError','請檢查網路']]){
  const page=browser(),error=new Error('fixture');error.name=name;page.respond(error);await page.open();
  assert.ok(page.get('status').textContent.includes(message));
  assert.match(page.get('status').textContent,/「開啟看板」/);
  assert.equal(page.get('refresh').disabled,false);
 }
});
