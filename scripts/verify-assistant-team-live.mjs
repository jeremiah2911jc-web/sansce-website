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
const dir = await mkdtemp(join(tmpdir(), 'sanze-team-qa-'));
const folder = new URL('../docs/website-assistant/qa-20261011/', import.meta.url);
await mkdir(folder, { recursive: true });
const report = { deployment, startedAt: new Date().toISOString(), cases: [] };
const conversationId = randomUUID(), history = [];
const questions = [
  '你們有哪些專業團隊？公司可以協助哪些事？',
  '如果地主有銀行融資的問題，你們熟悉嗎？可以協助處理嗎？',
  '那營造方面也有實務經驗嗎？'
];
try {
  for (const message of questions) {
    const file = join(dir, 'request.json');
    await writeFile(file, JSON.stringify({ message, history, path: '/', conversationId, excludeFromTraffic: true }), { mode: 0o600 });
    const { stdout } = await run('/opt/homebrew/bin/vercel', ['curl', '/api/website-assistant', '--deployment', deployment, '--', '--silent', '--show-error', '--max-time', '60', '--header', 'Content-Type: application/json', '--header', 'Origin: https://www.sanzepm.com.tw', '--request', 'POST', '--data-binary', `@${file}`], { timeout: 75000, maxBuffer: 1024 * 1024 });
    const data = JSON.parse(stdout.slice(stdout.indexOf('{'))), answer = data.answer;
    report.cases.push({ message, answer: answer || data.message });
    await writeFile(new URL('team-live.json', folder), JSON.stringify(report, null, 2));
    assert.equal(typeof answer, 'string');
    assert.ok(!/網站(?:沒有|未)|無法替公司背書|不能編造|目前提供的.*(?:沒有|未)|已通知|已轉交/.test(answer), answer);
    assert.ok(!/成立(?:已有|滿)?十年|公司(?:已有|擁有)十年|每位.*十年|多起成功案例/.test(answer), answer);
    assert.ok(!/尚無|尚未.*(?:完|案)|沒有.*(?:完|案例|實績)|無以三策/.test(answer), answer);
    assert.ok(!/保證(?:核貸|放款)|一定(?:核貸|放款)|全部.*(?:員工|專任)/.test(answer), answer);
    if (message.includes('專業團隊')) {
      for (const pattern of [/建築師/, /估價師/, /代書|地政士/, /土木技師/, /融資/, /營造/]) assert.match(answer, pattern);
    } else if (message.includes('融資')) {
      assert.match(answer, /熟悉|了解/);
      assert.match(answer, /協助/);
    } else {
      assert.match(answer, /營造/);
      assert.match(answer, /經驗|實務/);
      assert.match(answer, /有|累積|具備|具有/);
    }
    history.push({ role: 'user', content: message }, { role: 'assistant', content: answer });
    console.log('PASS:', message, '\n' + answer + '\n');
  }
  report.passed = true;
  report.finishedAt = new Date().toISOString();
  await writeFile(new URL('team-live.json', folder), JSON.stringify(report, null, 2));
} finally {
  await rm(dir, { recursive: true, force: true });
}
