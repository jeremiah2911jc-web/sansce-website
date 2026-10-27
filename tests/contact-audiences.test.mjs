import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {makeContactHandler} from '../api/contact.js';
const env={NODE_ENV:'production',TURNSTILE_SECRET_KEY:'test-only',RESEND_API_KEY:'test-only',CONTACT_FROM_EMAIL:'test@example.com',CONTACT_TO_EMAIL:'test@example.com'};
const common={requestId:randomUUID(),name:'合成測試',phone:'0912345678',email:'',district:'測試區',location:'合成基地',problem:'合成委託需求',consent:true,website:'',turnstileToken:'test-only'};
const owner={...common,service:'owner',stage:'初步整合中',association:'更新會',willingness:'合成地主意見'};
const development={...common,service:'development',acquisition:'自有土地開發',goal:'合成開發目標'};
async function invoke(body){const sent=[];const handler=makeContactHandler({env,recordSuccess:async()=>{},fetchImpl:async(url,options)=>{if(url.includes('siteverify'))return {ok:true,json:async()=>({success:true,hostname:'www.sanzepm.com.tw',action:'contact'})};sent.push(JSON.parse(options.body));return {ok:true,json:async()=>({id:'test-only'})};}});let result;await handler({method:'POST',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json'},body,socket:{remoteAddress:'test-only'}},{setHeader(){},statusCode:200,end(value){result={status:this.statusCode,body:JSON.parse(value)}}});return {...result,sent};}
test('development inquiry accepts investment inputs without community fields',async()=>{const r=await invoke(development);assert.equal(r.status,200);assert.match(r.sent[0].text,/諮詢服務：開發評估服務/);assert.match(r.sent[0].text,/土地取得或開發方式：自有土地開發/);assert.match(r.sent[0].text,/開發目標：合成開發目標/);assert.doesNotMatch(r.sent[0].text,/地主意願|目前由誰推動|undefined/);});
test('owner inquiry retains its service and community inputs',async()=>{const r=await invoke(owner);assert.equal(r.status,200);assert.match(r.sent[0].text,/諮詢服務：地主與社區服務/);assert.match(r.sent[0].text,/地主意願概況：合成地主意見/);assert.doesNotMatch(r.sent[0].text,/開發目標|取得或開發方式/);});
test('existing owner form submissions remain compatible',async()=>{const {service,...legacy}=owner;assert.equal((await invoke(legacy)).status,200);});
test('wrong service or prototype names cannot select a schema',async()=>{for(const service of ['other','__proto__',{},null]){const r=await invoke({...development,service});assert.equal(r.status,400);assert.equal(r.sent.length,0);}});
test('development inputs are required and constrained',async()=>{for(const patch of [{goal:''},{goal:'x'.repeat(501)},{goal:'bad\u0001input'},{acquisition:'invalid'},{acquisition:''},{problem:''}]){const r=await invoke({...development,...patch});assert.equal(r.status,400);assert.equal(r.sent.length,0);}});
test('changing service cannot bypass its required fields',async()=>{assert.equal((await invoke({...owner,service:'development'})).status,400);assert.equal((await invoke({...development,service:'owner'})).status,400);});
test('inactive service fields never enter the outgoing message',async()=>{const r=await invoke({...development,stage:'初步整合中',association:'更新會',willingness:'INACTIVE_OWNER_TEXT'});assert.equal(r.status,200);assert.doesNotMatch(r.sent[0].text,/INACTIVE_OWNER_TEXT/);});
test('development inquiries retain consent and verification barriers',async()=>{for(const patch of [{consent:false},{turnstileToken:''},{phone:'------'}]){const r=await invoke({...development,...patch});assert.equal(r.status,400);assert.equal(r.sent.length,0);}});
