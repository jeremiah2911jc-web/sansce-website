import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { sealReports } from './private-report-bundle.mjs';

const root = resolve(process.argv[2] || process.cwd());
const paths = ['api/_report-records.js', 'api/_report-editorial.js'];
async function collect(dir) {
  for (const entry of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile()) paths.push(path);
    else throw Error('Protected report source must not contain symlinks.');
  }
}
await collect('private/reports');
const entries = [];
for (const path of paths.sort()) entries.push({ path, data: (await readFile(resolve(root, path))).toString('base64') });
await mkdir('sealed', { recursive: true });
await writeFile('sealed/reports.v1.bin', sealReports(entries, process.env.REPORT_SOURCE_ENCRYPTION_KEY));
console.log(`Sealed ${entries.length} protected report files; no plaintext added to the repository.`);
