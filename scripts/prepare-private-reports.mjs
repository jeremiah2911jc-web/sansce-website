import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { restoreReports } from './private-report-bundle.mjs';

const root = process.cwd();
if (process.env.REPORT_SOURCE_ENCRYPTION_KEY) {
  const count = await restoreReports(root, process.env.REPORT_SOURCE_ENCRYPTION_KEY);
  console.log(`Restored ${count} protected report files for the server build.`);
} else if (process.env.VERCEL_ENV === 'preview' || process.env.SANZE_PUBLIC_PREVIEW === '1') {
  // Preview has no production report credentials. Keep imports buildable without
  // copying real reports or changing the existing fail-closed API behavior.
  await mkdir(resolve(root, 'api'), { recursive: true });
  await writeFile(resolve(root, 'api/_report-records.js'), 'export const reports = {};\nexport const readerReport = report => report;\n');
  await writeFile(resolve(root, 'api/_report-editorial.js'), 'export const editorial = {};\n');
  console.log('Public preview: protected report content omitted.');
} else {
  throw Error('Missing REPORT_SOURCE_ENCRYPTION_KEY. Production builds must restore the protected reports. Use SANZE_PUBLIC_PREVIEW=1 for a public-only local preview.');
}
