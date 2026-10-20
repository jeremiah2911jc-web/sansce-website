import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const deployment = process.argv[2];
if (!deployment) throw Error('Provide the exact staged deployment URL.');
const run = promisify(execFile);
const report = { deployment, startedAt: new Date().toISOString(), cases: [] };
const folder = new URL('../docs/website-assistant/qa-20261011/', import.meta.url);
await mkdir(folder, { recursive: true });
async function ask(message, history = [], conversationId = randomUUID()) {
  const file = join(tmpdir(), `sanze-qa-${randomUUID()}.json`);
  await writeFile(file, JSON.stringify({ message, history, path: '/', conversationId, excludeFromTraffic: true }), {mode:0o600});
  const started = Date.now();
  const { stdout } = await run('/opt/homebrew/bin/vercel', ['curl','/api/website-assistant','--deployment',deployment,'--','--silent','--show-error','--max-time','60','--header','Content-Type: application/json','--header','Origin: https://www.sanzepm.com.tw','--request','POST','--data-binary',`@${file}`], {timeout:75000,maxBuffer:1024*1024});
  const data = JSON.parse(stdout.slice(stdout.indexOf('{')));
  const row = {message, answer:data.answer || data.message, ok:typeof data.answer==='string', conversationId, elapsedMs:Date.now()-started};
  report.cases.push(row);
  await writeFile(new URL('live-replay.json',folder),JSON.stringify(report,null,2));
  console.log(`${row.ok?'OK':'FAILED'} ${message} (${Math.round(row.elapsedMs/1000)}s)`);
  assert.equal(row.ok,true,JSON.stringify(row));
  assert.ok(!row.answer.includes(''),'Unrendered citation marker');
  return row.answer;
}
const conversationId=randomUUID(),history=[];
for(const question of ['都市更新報核門檻？','同意比例呢','新北市','一般都更案','新北市的都市更新最小基地面積是多少？','危老呢']){
 const answer=await ask(question,history,conversationId);
 history.push({role:'user',content:question},{role:'assistant',content:answer});
 if(['同意比例呢','新北市','一般都更案'].includes(question))assert.match(answer,/80|五分之四/);
 if(question.includes('最小基地')){assert.match(answer,/1[,]?500|一千五百|1500/);assert.match(answer,/500|五百/);assert.match(answer,/條件|情形|符合/);}
 if(question==='危老呢'){assert.match(answer,/沒有.*最低|無.*最低|未.*最低|不.*最低|沒有.*最小|不設.*最低/);assert.match(answer,/同意|資格|合法/);}
 assert.ok(!/575|580/.test(answer),'Unrequested special scheme');
}
const samples=[
 ['危老滿30年就一定能申請嗎？',/不能|不一定|不代表|不行|不夠|還|仍/],
 ['新北都更剛好80%同意就可以報核嗎？',/超過|不是|不行|不夠|不能/],
 ['台北市一般都更基地最小面積呢？',/2[,]?000|二千|2000/],
 ['危老現在申請期限有沒有延長？',/2027|116/],
 ['你們公司電話？',/2250.?8202/],
 ['新北都更基地500平方公尺就一定能辦嗎？',/不是|不能|不一定|不行/],
 ['土地和合法建物面積都剛好90%同意，可以不用算人數嗎？',/超過.*90|超過.*十分之九/],
 ['更新會怎麼成立？',/6\s*個月|六個月/],
 ['都更協議合建有人不同意怎麼辦？',/權利變換/]
];
for(const [question,pattern] of samples){const answer=await ask(question);assert.match(answer,pattern);if(!question.includes('電話'))assert.match(answer,/https:\/\/.*(?:gov\.tw|gov\.taipei)/);}
report.finishedAt=new Date().toISOString();report.passed=true;
await writeFile(new URL('live-replay.json',folder),JSON.stringify(report,null,2));
console.log('PASS: 6 yesterday turns and 9 boundary/live-source questions answered by the deployed model.');
