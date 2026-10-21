import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import{randomUUID}from'node:crypto';
import{trafficLinkAction,validTrafficAction}from'../shared/traffic-actions.js';import{trafficTopics}from'../shared/traffic-content.js';import{makeTrafficHandler}from'../api/_site-traffic.js';
assert.equal(trafficTopics['/land-evaluation'],'土地開發評估');
assert.deepEqual(trafficLinkAction('/land-evaluation?private=secret','https://www.sanzepm.com.tw/'),{action:'tool_entry',target:'/land-evaluation'});
assert.equal(trafficLinkAction('https://evil.com/land-evaluation','https://www.sanzepm.com.tw/'),null);
assert(!validTrafficAction('land_evaluation_complete','secret'));
const source=fs.readFileSync('src/land-evaluation/LandEvaluation.jsx','utf8');
const fn=source.slice(source.indexOf('function calculate()'),source.indexOf('function replace('));
let events=[],result={errors:['invalid'],values:null};const ctx={evaluate:()=>result,input:{},name:'',district:'新北市',serialized:'{}',structuredClone,trackInteraction:(...a)=>events.push(a),setIssues(){},setSubmitted(){},requestAnimationFrame(){}};
vm.runInNewContext(fn+';calculate()',ctx);assert.equal(events.length,0);
result={errors:[],values:{}};vm.runInNewContext('calculate();calculate()',ctx);assert.deepEqual(events,[['land_evaluation_complete','result'],['land_evaluation_complete','result']]);
let writes=0;const handler=makeTrafficHandler({dbFactory:()=>({rpc:async()=>{writes++;return{data:true}}})});
async function send(path,action,target){const r={setHeader(){},end(){}};await handler({method:'POST',headers:{origin:'https://www.sanzepm.com.tw','content-type':'application/json','user-agent':'Safari'},body:{type:'action',eventId:randomUUID(),pageEventId:randomUUID(),visitorId:randomUUID(),path,action,target}},r);return r.statusCode;}
assert.equal(await send('/','land_evaluation_complete','result'),400);assert.equal(writes,0);
assert.equal(await send('/land-evaluation','land_evaluation_complete','result'),200);
assert.equal(await send('/','tool_entry','/land-evaluation'),200);assert.equal(writes,2);
const dashboard=fs.readFileSync('dist/traffic/dashboard.js','utf8');assert(dashboard.includes('點擊土地開發評估入口（不代表完成計算）'));assert(dashboard.includes('成功產出一次計算結果'));assert(dashboard.includes('不等於不同使用者或不同案件'));
console.log('PASS land tracking: valid result only, repeat calculations counted, fixed destinations, origin page validation, content category and dashboard distinction.');
