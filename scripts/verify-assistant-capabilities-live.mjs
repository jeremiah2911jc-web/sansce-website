import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const deployment = process.argv[2];
assert.ok(deployment, 'Provide deployment URL');
const run = promisify(execFile);
const dir = await mkdtemp(join(tmpdir(), 'sanze-capability-qa-'));
const folder = new URL('../docs/website-assistant/qa-20261011/', import.meta.url);
await mkdir(folder, { recursive: true });
const report = { deployment, startedAt: new Date().toISOString(), cases: [] };
const oldPromise = [
  { role: 'user', content: '我想查我的基地容積率' },
  { role: 'assistant', content: '請提供地址或地段、地號；我才能協助判斷。' },
  { role: 'user', content: '我已提供門牌' },
  { role: 'assistant', content: '請提供地段、地號，有地號後才能進一步判斷。' }
];
const cases = [
  ['給你門牌或地號，你能查土地使用分區和容積率嗎？', []],
  ['我已經給了門牌和地號，你到底能不能查？', oldPromise],
  ['板橋住宅區容積率是多少？', []],
  ['我已有官方分區資料，寫法定容積率300%，這個數字是什麼意思？', []]
];
try {
  for (const [message, history] of cases) {
    const file = join(dir, 'request.json');
    await writeFile(file, JSON.stringify({ message, history, path: '/', conversationId: randomUUID(), excludeFromTraffic: true }), { mode: 0o600 });
    const { stdout } = await run('/opt/homebrew/bin/vercel', ['curl', '/api/website-assistant', '--deployment', deployment, '--', '--silent', '--show-error', '--max-time', '60', '--header', 'Content-Type: application/json', '--header', 'Origin: https://www.sanzepm.com.tw', '--request', 'POST', '--data-binary', `@${file}`], { timeout: 75000, maxBuffer: 1024 * 1024 });
    const data = JSON.parse(stdout.slice(stdout.indexOf('{')));
    const answer = data.answer;
    report.cases.push({ message, answer: answer || data.message });
    await writeFile(new URL('capability-live.json', folder), JSON.stringify(report, null, 2));
    assert.equal(typeof answer, 'string');
    assert.ok(!/請不要.*(?:提供|貼)|不要把.*貼/.test(answer), answer);
    assert.ok(!/已(?:通知|轉交|轉接|安排)|稍後.*(?:回覆|聯絡您)|專人.*(?:將|會).*聯絡/.test(answer), answer);
    assert.ok(!/(?:請|可以)(?:先)?提供[^。\n]*(?:門牌|地址|地號)[^。\n]*(?:我才能|我幫|我可以|就能查)/.test(answer), answer);
    if (message.includes('能查') || message.includes('能不能查')) {
      assert.match(answer, /無法|不能|沒有|未接|不具備/);
      assert.match(answer, /專人|真人|人員/);
      assert.match(answer, /https:\/\/(?:lin\.ee\/w8xSeSz|www\.sanzepm\.com\.tw\/contact)/);
    }
    if (history.length) assert.match(answer, /先前|之前|前面|更正|剛才|前兩次|回答錯/);
    if (message.includes('板橋')) assert.ok(!/請提供|請告訴我.*(?:地址|門牌|地號)/.test(answer), answer);
    if (message.includes('300%')) assert.match(answer, /3\s*倍|三倍|3倍/);
    console.log('PASS:', message, '\n' + answer + '\n');
  }
  report.passed = true;
  report.finishedAt = new Date().toISOString();
  await writeFile(new URL('capability-live.json', folder), JSON.stringify(report, null, 2));
} finally {
  await rm(dir, { recursive: true, force: true });
}
