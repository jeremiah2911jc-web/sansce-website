import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeContactHandler } from '../api/contact.js';
const env={NODE_ENV:'production',TURNSTILE_SECRET_KEY:'test-secret',RESEND_API_KEY:'test-only',CONTACT_FROM_EMAIL:'test@example.com',CONTACT_TO_EMAIL:'owner@example.com'};
const body={requestId:randomUUID(),name:'測試聯絡人',phone:'0912345678',email:'test@example.com',district:'板橋區',location:'測試社區',stage:'已送件審查中',association:'建商／實施者',willingness:'部分同意',problem:'需要協調分工',consent:true,website:'',turnstileToken:'test-token'};
const calls=[];const verified={ok:true,json:async()=>({success:true,hostname:'www.sanzepm.com.tw',action:'contact'})};const fetchImpl=async(url,opts)=>{if(url.includes('siteverify'))return verified;calls.push({url,opts});return {ok:true,json:async()=>({id:'provider-id'})}};
function invoke(handler,patch={},headers={}) {return new Promise(async(resolve,reject)=>{const req={method:'POST',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json',...headers},body:{...body,...patch},socket:{remoteAddress:'127.0.0.1'}};const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(v){resolve({status:this.statusCode,data:JSON.parse(v),headers:this.headers})}};try{await handler(req,res)}catch(e){reject(e)}})}
const h=makeContactHandler({env,fetchImpl});
assert.equal((await invoke(h)).status,200);const first=calls[0];const mail=JSON.parse(first.opts.body);assert.equal(mail.to[0],'owner@example.com');assert.equal(mail.reply_to,body.email);assert(mail.text.includes('目前由誰推動案件：建商／實施者'));assert(!mail.text.includes('undefined'));
assert.equal((await invoke(h)).status,200);assert.equal(first.opts.headers['Idempotency-Key'],calls[1].opts.headers['Idempotency-Key']);
await invoke(h,{problem:'不同內容'});assert.notEqual(first.opts.headers['Idempotency-Key'],calls[2].opts.headers['Idempotency-Key']);
for(const patch of [{name:' '},{consent:false},{email:'bad\r\nBcc: hidden@example.com'},{association:'invalid'},{stage:'invalid'},{problem:'x'.repeat(1501)},{website:'bot'},{requestId:'invalid'},{phone:'------'}])assert.equal((await invoke(h,patch)).status,400);
assert.equal((await invoke(h,{}, {origin:'https://evil.example'})).status,403);
assert.equal((await invoke(h,{}, {'content-type':'text/plain'})).status,415);
assert.equal((await invoke(makeContactHandler({env:{},fetchImpl}),{}, {origin:'https://www.sanzepm.com.tw'})).status,503);
assert.equal((await invoke(makeContactHandler({env,fetchImpl:async(url)=>url.includes('siteverify')?verified:({ok:false,json:async()=>({error:'private provider error'})})}))).status,502);
assert.equal((await invoke(makeContactHandler({env,fetchImpl:async(url)=>{if(url.includes('siteverify'))return verified;throw new Error('timeout')}}))).status,502);
assert.equal((await invoke(makeContactHandler({env,fetchImpl:async(url)=>url.includes('siteverify')?verified:({ok:true,json:async()=>({})})}))).status,502);
const rate=makeContactHandler({env,fetchImpl});for(let i=0;i<5;i++)assert.equal((await invoke(rate)).status,200);assert.equal((await invoke(rate)).status,429);
assert.equal(calls.length,8); // Invalid and failed requests never invoke the success transport.
let mails=0;
for(const result of [{success:false},{success:true,hostname:'evil.example',action:'contact'},{success:true,hostname:'www.sanzepm.com.tw',action:'login'}]){
 const handler=makeContactHandler({env,fetchImpl:async(url)=>{if(url.includes('siteverify'))return {ok:true,json:async()=>result};mails++;return {ok:true,json:async()=>({id:'mail'})};}});
 assert.equal((await invoke(handler)).status,400);
}
assert.equal(mails,0);
assert.equal((await invoke(makeContactHandler({env,fetchImpl}),{turnstileToken:''})).status,400);
assert.equal((await invoke(makeContactHandler({env,fetchImpl:async()=>{throw new Error('timeout')}}))).status,503);
assert.equal((await invoke(makeContactHandler({env:{...env,TURNSTILE_SECRET_KEY:''},fetchImpl}))).status,503);
console.log('PASS: validation, consent, origin, mail fields, idempotency, missing config, provider errors, timeout, rate limiting. No email sent.');
