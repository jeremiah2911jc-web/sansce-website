import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const magic = Buffer.from('SANZE_REPORTS_V1\n');
const allowed = path => ['api/_report-records.js', 'api/_report-editorial.js'].includes(path)
  || /^private\/reports\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(path);
function key(secret) {
  if (!secret || secret.length < 32) throw Error('REPORT_SOURCE_ENCRYPTION_KEY is required to restore the protected report bundle.');
  return Buffer.from(hkdfSync('sha256', secret, 'sanze-report-source-v1', 'build-only-encryption', 32));
}
export function sealReports(entries, secret) {
  for (const entry of entries) if (!allowed(entry.path)) throw Error('Unsupported protected report path.');
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(gzipSync(Buffer.from(JSON.stringify(entries)))), cipher.final()]);
  return Buffer.concat([magic, iv, cipher.getAuthTag(), ciphertext]);
}
export function openReports(bytes, secret) {
  if (!bytes.subarray(0, magic.length).equals(magic)) throw Error('Unsupported protected report bundle.');
  const start = magic.length;
  const decipher = createDecipheriv('aes-256-gcm', key(secret), bytes.subarray(start, start + 12));
  decipher.setAuthTag(bytes.subarray(start + 12, start + 28));
  const plaintext = Buffer.concat([decipher.update(bytes.subarray(start + 28)), decipher.final()]);
  const entries = JSON.parse(gunzipSync(plaintext).toString('utf8'));
  if (!Array.isArray(entries) || !entries.length) throw Error('Empty protected report bundle.');
  const paths = new Set();
  for (const entry of entries) {
    if (!allowed(entry.path) || typeof entry.data !== 'string' || paths.has(entry.path)) throw Error('Invalid protected report entry.');
    paths.add(entry.path);
  }
  for (const path of ['api/_report-records.js', 'api/_report-editorial.js']) {
    if (!paths.has(path)) throw Error('Protected report modules are missing.');
  }
  return entries;
}
export async function restoreReports(root, secret) {
  // Authenticate and validate every entry before writing any plaintext.
  const entries = openReports(await readFile(resolve(root, 'sealed/reports.v1.bin')), secret);
  for (const entry of entries) {
    const target = resolve(root, entry.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(entry.data, 'base64'), { mode: 0o600 });
  }
  return entries.length;
}
