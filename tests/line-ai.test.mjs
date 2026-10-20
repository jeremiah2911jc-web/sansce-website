import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifyLineSignature, wantsHuman, wantsAI, taipeiTime, generateLineAnswer} from '../api/_line-ai.js';
test('signature authenticates exact raw bytes',()=>{
 const body=Buffer.from('{"events":[]}');const signature=createHmac('sha256','test-secret').update(body).digest('base64');
 assert.equal(verifyLineSignature(body,signature,'test-secret'),true);
 assert.equal(verifyLineSignature(Buffer.from('{ "events":[]}'),signature,'test-secret'),false);
 assert.equal(verifyLineSignature(body,'bad','test-secret'),false);
 assert.equal(verifyLineSignature(body,signature,''),false);
});
test('human requests pause the assistant',()=>{
 for(const text of ['我要真人回覆','不要機器人','需要正式報價']) assert.equal(wantsHuman(text),true);
 assert.equal(wantsHuman('更新會成立後要做什麼'),false);
});
test('private bounded context and response extraction', async()=>{
 let request;
 const result=await generateLineAnswer({text:'下一步呢？',history:Array.from({length:20},()=>({role:'user',content:'案件'})),first:false,apiKey:'test',model:'test-model',fetchImpl:async(url,opts)=>{request=JSON.parse(opts.body);return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'先確認案件進度。'}]}]})}}});
 assert.equal(request.store,false);assert.equal(request.input.length,11);assert.equal(request.max_output_tokens,800);assert.equal(result.text,'先確認案件進度。');
});
test('errors never become customer response text',async()=>{
 await assert.rejects(generateLineAnswer({text:'你好',apiKey:'test',model:'test',fetchImpl:async()=>({ok:false,status:429})}),/429/);
});

test('resume only matches deliberate commands',()=>{assert.equal(wantsAI('恢復AI'),true);assert.equal(wantsAI('切回 AI'),true);assert.equal(wantsAI('什麼是AI模式？'),false);});
test('Taipei clock crosses UTC day and reaches model context',async()=>{assert.match(taipeiTime(new Date('2026-10-07T17:08:00Z')),/2026.*10.*08.*01:08/);let body;await generateLineAnswer({text:'現在幾點',now:new Date('2026-10-07T11:08:00Z'),apiKey:'test',model:'test',fetchImpl:async(u,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'台灣時間19:08。'}]}]})}}});assert.match(body.instructions,/19:08/);});

test('identity questions and declined handoffs keep AI available',()=>{for(const text of ['你是真人嗎？','你是人工還是AI？','不用轉真人','不需要真人回覆'])assert.equal(wantsHuman(text),false);for(const text of ['真人','請轉真人','我想找專人','希望由真人回覆'])assert.equal(wantsHuman(text),true);});
