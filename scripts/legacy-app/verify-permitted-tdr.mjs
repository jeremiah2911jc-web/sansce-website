import assert from 'node:assert/strict';
import {build,legacyPlanningInput} from './build-reference.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'sanze-permitted-tdr-'));
try {
 await build({stdin:{contents:"export * from './src/lib/planning/tdrApplication';export * from './src/lib/planning/regulatoryReview';export * from './src/lib/planning/bonusAssessment';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:join(dir,'core.mjs')});
 const m=await import(join(dir,'core.mjs'));
 const ctx={site:471,far:225,district:'臺北市南港區'};
 const ordinary=m.newTdrApplication('taipei');
 assert.equal(m.reviewTdrApplication(ordinary,ctx,19.9,30).appliedSqm,0);
 const approved={...ordinary,quantityBasis:'permitted',permittedSqm:'211.93',permittedSource:'合成既有許可文件測試',stage:'permitted'};
 assert(m.isTdrApplication(approved));
 const result=m.reviewTdrApplication(approved,ctx,19.9,30);
 assert.deepEqual(result.errors,[]);assert(Math.abs(result.appliedSqm-210.89025)<1e-8);
 assert.equal(m.reviewTdrApplication(approved,ctx,30,30).appliedSqm,211.93);
 for(const patch of [{permittedSource:''},{permittedSqm:''},{permittedSqm:'-1'},{permittedSqm:'NaN'},{stage:'planning'}]){
  const blocked=m.reviewTdrApplication({...approved,...patch},ctx,19.9,30);
  assert(blocked.errors.length);assert.equal(blocked.appliedSqm,0);
 }
 assert.equal(m.reviewTdrApplication({...approved,city:'ntpc'},ctx,19.9,30).appliedSqm,0);
 assert.equal(m.reviewTdrApplication({...ordinary,quantityBasis:'target'},ctx,19.9,30).appliedSqm,0);
 assert(!m.isTdrApplication({...approved,permittedSqm:211.93}));
 console.log('PASS existing-permit TDR: explicit source/stage/quota required, no ordinary-eligibility exemption, no source stacking, quota cap and city isolation');
} finally {rmSync(dir,{recursive:true,force:true});}
