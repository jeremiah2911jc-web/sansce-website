// The former historical hash check predates the authorized bonus-law correction.
// Exercise missing/invalid areas, quick/detail caps, date limits, priority and untouched-source adapters.
import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['--test','--test-name-pattern=danger|F2|generated adapters','tests/bonus-eligibility.test.mjs'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exitCode=r.status??1;
