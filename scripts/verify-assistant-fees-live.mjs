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
const dir = await mkdtemp(join(tmpdir(), 'sanze-fee-qa-'));
const folder = new URL('../docs/website-assistant/qa-20261011/', import.meta.url);
await mkdir(folder, { recursive: true });
const report = { deployment, startedAt: new Date().toISOString(), cases: [] };
const conversationId = randomUUID(), history = [];
const questions = [
  '你們的收費標準怎麼計算？',
  '我只有一個地主，想請你們看我自己的文件和合作條件，也能委託嗎？',
  '我們只有幾個核心地主，還沒決定找哪個實施者，可以先委託事前評估嗎？',
  '那只做我個人的顧問，大概要多少錢？'
];
try {
  for (const message of questions) {
    const file = join(dir, 'request.json');
    await writeFile(file, JSON.stringify({ message, history, path: '/', conversationId, excludeFromTraffic: true }), { mode: 0o600 });
    const { stdout } = await run('/opt/homebrew/bin/vercel', ['curl', '/api/website-assistant', '--deployment', deployment, '--', '--silent', '--show-error', '--max-time', '60', '--header', 'Content-Type: application/json', '--header', 'Origin: https://www.sanzepm.com.tw', '--request', 'POST', '--data-binary', `@${file}`], { timeout: 75000, maxBuffer: 1024 * 1024 });
    const data = JSON.parse(stdout.slice(stdout.indexOf('{'))), answer = data.answer;
    report.cases.push({ message, answer: answer || data.message });
    await writeFile(new URL('fees-live.json', folder), JSON.stringify(report, null, 2));
    assert.equal(typeof answer, 'string');
    assert.ok(!/沒有(?:公開)?固定|未公開|沒有.*價目表|免費|\d[\d,]*\s*元|\d+\s*%/.test(answer), answer);
    assert.ok(!/已通知|已安排|已轉交/.test(answer), answer);
    assert.ok(!/(?:不必|不用|不需要)[^。\n]*(?:整案|整個案|全案|全社區)|費用很低|很便宜/.test(answer), answer);
    if (message.includes('收費標準')) {
      assert.match(answer, /工作量|工作項目/);
      assert.match(answer, /個別地主|單一地主|個案顧問|個人/);
      assert.match(answer, /核心地主|幾位地主/);
      assert.match(answer, /前期|事前|推動初期/);
      assert.match(answer, /委託前|委託之前/);
    } else if (message.includes('一個地主')) {
      assert.match(answer, /可以|能|接受/);
      assert.match(answer, /文件|合作條件/);
    } else if (message.includes('核心地主')) {
      assert.match(answer, /可以|能|接受/);
      assert.match(answer, /事前|前期/);
    } else {
      assert.match(answer, /範圍|工作項目|工作量/);
      assert.match(answer, /估算|報價|費用/);
    }
    history.push({ role: 'user', content: message }, { role: 'assistant', content: answer });
    console.log('PASS:', message, '\n' + answer + '\n');
  }
  report.passed = true;
  report.finishedAt = new Date().toISOString();
  await writeFile(new URL('fees-live.json', folder), JSON.stringify(report, null, 2));
} finally {
  await rm(dir, { recursive: true, force: true });
}
