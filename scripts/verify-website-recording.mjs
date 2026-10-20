import assert from 'node:assert/strict';
import {makeWebAssistantHandler} from '../api/_web-assistant.js';
const rows=[],updates=[],logs=[];
let providerCalls=0,insertError=false,updateError=false,providerError=false;
const db = {
 from(table) {
  assert.equal(table, 'sanze_website_conversations');
  return {
   async insert(row) {
    rows.push(row);
    return { error: insertError ? {code:'test'} : null };
   },
   update(row) {
    return {
     async eq(key, id) {
      assert.equal(key, 'request_id');
      updates.push({row, id});
      return { error: updateError ? {code:'test'} : null };
     }
    };
   }
  };
 }
};
const handler=makeWebAssistantHandler({env:{OPENAI_API_KEY:'test',LINE_AI_MODEL:'test',WEBSITE_CHAT_RECORDING:'true'},dbFactory:()=>db,log:s=>logs.push(JSON.parse(s)),fetchImpl:async()=>{providerCalls++;return {ok:!providerError,status:503,json:async()=>({output:[{content:[{type:'output_text',text:'測試回覆'}]}],usage:{input_tokens:1,output_tokens:2}})}}});
const conversationId='0ec68a9f-5b54-4d28-a546-2822cba51b9e';
async function call(extra={}){let result;const res={setHeader(){},end(s){result={status:this.statusCode,...JSON.parse(s)}}};await handler({method:'POST',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json'},body:{message:'測試問題',history:[],path:'/consulting',conversationId,...extra}},res);return result;}
assert.equal((await call()).status,200);assert.equal(rows[0].question,'測試問題');assert.equal(rows[0].conversation_id,conversationId);assert.equal(rows[0].status,'pending');assert.equal(updates[0].row.answer,'測試回覆');assert.equal(updates[0].row.status,'ok');assert.equal(updates[0].id,rows[0].request_id);assert.ok(updates[0].row.answered_at);
await call({message:'第二題',history:[{role:'user',content:'測試問題'},{role:'assistant',content:'測試回覆'}]});assert.equal(rows[1].conversation_id,conversationId);assert.notEqual(rows[0].request_id,rows[1].request_id);assert.equal(rows[1].question,'第二題');assert.ok(!('history' in rows[1]));
const visitorId='b7f8bdeb-f4df-4e85-9d78-3a670433878a';
await call({visitorId,excludeFromTraffic:false});assert.equal(rows.at(-1).visitor_id,visitorId);assert.equal(rows.at(-1).is_internal,false);
await call({visitorId,excludeFromTraffic:false});assert.equal(rows.at(-1).visitor_id,visitorId);
await call({visitorId:null,excludeFromTraffic:true});assert.equal(rows.at(-1).visitor_id,null);assert.equal(rows.at(-1).is_internal,true);
const beforeInvalid=providerCalls;assert.equal((await call({visitorId:'invalid'})).status,400);assert.equal((await call({excludeFromTraffic:'false'})).status,400);assert.equal(providerCalls,beforeInvalid);
const previousCalls=providerCalls;insertError=true;assert.equal((await call()).status,503);assert.equal(providerCalls,previousCalls);insertError=false;
providerError=true;assert.equal((await call()).status,503);assert.equal(updates.at(-1).row.status,'failed');providerError=false;
updateError=true;assert.equal((await call()).status,503);updateError=false;
assert.equal((await call({conversationId:'invalid'})).status,400);assert.ok(!JSON.stringify(logs).includes('測試問題'));assert.ok(!JSON.stringify(logs).includes('測試回覆'));
console.log('PASS: question saved before inference, replies/timestamps saved, threads grouped, failures handled, invalid IDs rejected, no transcript in logs.');
