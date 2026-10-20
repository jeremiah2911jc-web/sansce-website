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
const dir = await mkdtemp(join(tmpdir(), 'sanze-company-qa-'));
const folder = new URL('../docs/website-assistant/qa-20261011/', import.meta.url);
await mkdir(folder, { recursive: true });
const report = { deployment, startedAt: new Date().toISOString(), cases: [] };
const conversationId = randomUUID(), history = [];
const questions = [
  '你們公司成立多久了有多少人？',
  '那你們的顧問有什麼經驗嗎？',
  '你們有以三策公司名義完成的案件，可以列給我看嗎？',
  '你們公司剛成立又沒有完成案件，我怎麼放心把工作委託給你們？',
  '所以你們成立這家公司的目的，是協助地主自己成立更新會嗎？'
];
try {
  for (const message of questions) {
    const file = join(dir, 'request.json');
    await writeFile(file, JSON.stringify({ message, history, path: '/', conversationId, excludeFromTraffic: true }), { mode: 0o600 });
    const { stdout } = await run('/opt/homebrew/bin/vercel', ['curl', '/api/website-assistant', '--deployment', deployment, '--', '--silent', '--show-error', '--max-time', '60', '--header', 'Content-Type: application/json', '--header', 'Origin: https://www.sanzepm.com.tw', '--request', 'POST', '--data-binary', `@${file}`], { timeout: 75000, maxBuffer: 1024 * 1024 });
    const data = JSON.parse(stdout.slice(stdout.indexOf('{'))), answer = data.answer;
    report.cases.push({ message, answer: answer || data.message });
    await writeFile(new URL('company-live.json', folder), JSON.stringify(report, null, 2));
    assert.equal(typeof answer, 'string');
    assert.ok(!/網站(?:沒有|未)|無法替公司背書|不能編造|目前提供的.*(?:沒有|未)|已通知|已轉交/.test(answer), answer);
    assert.ok(!/成立(?:已有|滿)?十年|公司(?:已有|擁有)十年|每位.*十年|多起成功案例/.test(answer), answer);
    if (message.includes('成立多久')) {
      assert.match(answer, /2026|115/);
      assert.match(answer, /4月16日|4 月 16 日|4\/16/);
      assert.match(answer, /規模|人員|團隊/);
      assert.ok(!/共有\s*\d+|員工\s*\d+|團隊有\s*\d+/.test(answer), answer);
    } else if (message.includes('經驗')) {
      assert.match(answer, /開發|法令|法規|實務/);
      assert.match(answer, /地主/);
      assert.ok(!/尚無|尚未.*(?:完|案)|沒有.*(?:完|案例|實績)|無以三策/.test(answer), answer);
    } else if (message.includes('列給我看')) {
      assert.match(answer, /尚(?:未|無)|還沒有|目前沒有/);
      assert.match(answer, /三策|公司/);
      assert.match(answer, /團隊|顧問/);
    } else if (message.includes('放心')) {
      assert.match(answer, /工作內容|處理方式|經歷|負責人員|分工/);
      assert.ok(!/尚無|尚未.*(?:完|案)|沒有.*(?:完|案例|實績)|無以三策/.test(answer), answer);
    } else {
      assert.match(answer, /更新會/);
      assert.match(answer, /地主|實施者/);
    }
    history.push({ role: 'user', content: message }, { role: 'assistant', content: answer });
    console.log('PASS:', message, '\n' + answer + '\n');
  }
  report.passed = true;
  report.finishedAt = new Date().toISOString();
  await writeFile(new URL('company-live.json', folder), JSON.stringify(report, null, 2));
} finally {
  await rm(dir, { recursive: true, force: true });
}
