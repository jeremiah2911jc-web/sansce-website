import test from 'node:test';
import assert from 'node:assert/strict';
import { sealReports, openReports } from '../scripts/private-report-bundle.mjs';

const secret = 'test-only-report-source-secret-at-least-32-characters';
const entries = ['api/_report-records.js', 'api/_report-editorial.js', 'private/reports/CASE_FIXTURE/example.pdf']
  .map(path => ({ path, data: Buffer.from('Synthetic private fixture').toString('base64') }));
test('private source round-trips byte-for-byte without plaintext in the bundle', () => {
  const bytes = sealReports(entries, secret);
  assert.deepEqual(openReports(bytes, secret), entries);
  assert(!bytes.includes(Buffer.from('Synthetic private fixture')));
  assert(!bytes.includes(Buffer.from('CASE_FIXTURE')));
});
test('wrong keys and tampering cannot reveal or restore report content', () => {
  const bytes = sealReports(entries, secret);
  assert.throws(() => openReports(bytes, secret + 'wrong'));
  bytes[bytes.length - 1] ^= 1;
  assert.throws(() => openReports(bytes, secret));
  assert.throws(() => sealReports(entries, 'short'));
});
test('report bundles reject paths outside the protected report files', () => {
  for (const path of ['../.env', 'private/reports/CASE_FIXTURE/../../secret', 'public/report.pdf']) {
    assert.throws(() => sealReports([...entries, { path, data: '' }], secret));
  }
});
