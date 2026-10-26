import {normalizeGeneratedSiteCopy} from './normalize-generated-site-copy.mjs';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),app=process.env.SANZE_CASES_SOURCE||'/Users/jeremiah/src/sanze-cases-desktop';
const relative='src/cases/land-readjustment/model.mjs',file=resolve(app,relative);
const {build}=createRequire(resolve(app,'package.json'))('esbuild');
await build({entryPoints:[file],outfile:resolve(root,'src/land-evaluation/generated/readjustment.mjs'),bundle:true,platform:'browser',format:'esm',target:'es2020',legalComments:'none'});
const generated=resolve(root,'src/land-evaluation/generated/readjustment.mjs');
await writeFile(generated,normalizeGeneratedSiteCopy(await readFile(generated,'utf8')));
const files=[relative,'src/cases/land-readjustment/conditions.mjs','src/cases/land-readjustment/statutory.mjs','src/cases/land-readjustment/arithmetic.mjs','src/cases/land-readjustment/catalog.mjs','src/cases/land-readjustment/ntpc-catalog-data.mjs','src/cases/land-readjustment/ntpc-current-review.mjs','src/cases/land-readjustment/ntpc-document-audit.mjs'],bundled=await readFile(resolve(root,'src/land-evaluation/generated/readjustment.mjs'),'utf8');
if(/localStorage|sessionStorage|indexedDB|@tauri|fetch\(/.test(bundled))throw Error('Public-only boundary violated');
const sources=await Promise.all(files.map(async path=>({path,sha256:createHash('sha256').update(await readFile(resolve(app,path))).digest('hex')})));
await writeFile(resolve(root,'src/land-evaluation/generated/readjustment-manifest.json'),JSON.stringify({version:1,scope:'preliminary rights, documents and area conditions only; no financial calculations or case persistence',sourceRoot:app,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),uncommittedSource:true,sources},null,2)+'\n');
console.log('Readjustment preliminary core synchronized from shared App source.');

// The interaction fields share App authority; public page keeps its existing controls.
for(const name of ['ReadjustmentWorkbench.jsx','StatutoryFields.jsx','SupplementaryFields.jsx','ConsentRoster.jsx','readjustment.css']){
 let content=await readFile(resolve(app,'src/cases/land-readjustment',name),'utf8');
 content=content.replace("from './controls.jsx'","from './PublicSelect.jsx'").replace("import {localProfiles as localCatalog} from '../land-local/catalog'","import {localCatalog} from './generated/land.mjs'").replaceAll("from './model.mjs'","from './generated/readjustment.mjs'");
 await writeFile(resolve(root,'src/land-evaluation',name),content);
}
