import {readFileSync,writeFileSync,mkdirSync,appendFileSync} from 'node:fs';
import {pricingHash} from '../api/_website-ai-status.js';
import {fetchOfficialDocs,reviewSnapshot} from './lib/website-ai-price-review.mjs';

const snapshotPath=new URL('../docs/website-assistant/pricing.json',import.meta.url);
const output=new URL('../.pricing-maintenance/',import.meta.url);
const statusURL='https://www.sanzepm.com.tw/api/assistant-pricing-status';
const mode=process.argv[2];
const current=()=>JSON.parse(readFileSync(snapshotPath,'utf8'));
const githubOutput=(key,value)=>{if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,key+'='+String(value)+'\n');};
async function status(){
 try{
  const response=await fetch(statusURL,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(10000)});
  return response.ok?await response.json():null;
 }catch{return null;}
}
export function matchesDeployment(actual,expected,now=Date.now()){
 return actual?.status==='ok'&&actual.pricing?.source==='bundled'&&actual.pricing?.sha256===pricingHash(expected)&&actual.pricing?.model===expected.model&&actual.pricing?.version===expected.version&&actual.pricing?.validUntil===expected.validUntil&&Date.parse(actual.pricing.validUntil)>now+14*86400000;
}
async function review(){
 const before=current();
 const result=reviewSnapshot(before,await fetchOfficialDocs(),{force:process.env.FORCE_REVIEW==='true'});
 if(result.changed)writeFileSync(snapshotPath,JSON.stringify(result.pricing,null,2)+'\n');
 const deployed=await status();
 const deployNeeded=result.changed||!matchesDeployment(deployed,result.pricing);
 const report={checkedAt:new Date().toISOString(),changed:result.changed,changedRates:result.changedRates,deployNeeded,model:result.pricing.model,version:result.pricing.version,validUntil:result.pricing.validUntil,sha256:pricingHash(result.pricing)};
 mkdirSync(output,{recursive:true});
 writeFileSync(new URL('review.json',output),JSON.stringify(report,null,2)+'\n');
 githubOutput('changed',result.changed);githubOutput('deploy_needed',deployNeeded);
 console.info(JSON.stringify(report));
}
async function publish(){
 const secret=process.env.WEBSITE_AI_PRICING_DEPLOY_HOOK;
 if(!secret)throw Error('deploy_hook_not_configured');
 const url=new URL(secret);
 if(url.protocol!=='https:'||url.hostname!=='api.vercel.com'||!url.pathname.startsWith('/v1/integrations/deploy/prj_o0YVeOkLtTWi7295JbNKghCOJvds/'))throw Error('unexpected_deploy_hook');
 try{
  const response=await fetch(url,{method:'POST',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('deploy_hook_rejected');
  const result=await response.json();
  console.info(JSON.stringify({event:'pricing_deploy_requested',jobId:result.job?.id||null}));
 }catch{
  // A lost hook response may still have queued the build. Verify the public
  // snapshot before declaring failure, rather than issuing duplicate builds.
  console.warn('Deployment request needs confirmation from the live snapshot.');
 }
}
async function verify(wait){
 const expected=current(),deadline=Date.now()+(wait?10*60000:10000);
 let actual;
 do{
  actual=await status();
  if(matchesDeployment(actual,expected))break;
  if(Date.now()>=deadline)throw Error('production_pricing_not_updated');
  await new Promise(resolve=>setTimeout(resolve,10000));
 }while(true);
 for(const route of ['/','/sitemap.xml','/robots.txt']){
  const response=await fetch('https://www.sanzepm.com.tw'+route,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('production_route_unavailable');
 }
 const report={verifiedAt:new Date().toISOString(),status:'verified',pricing:actual.pricing,assistantEnabled:actual.enabled};
 mkdirSync(output,{recursive:true});writeFileSync(new URL('production.json',output),JSON.stringify(report,null,2)+'\n');
 console.info(JSON.stringify(report));
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 try{
  if(mode==='review')await review();
  else if(mode==='publish')await publish();
  else if(mode==='verify')await verify(true);
  else if(mode==='audit')await verify(false);
  else throw Error('expected_review_publish_verify_or_audit');
 }catch(error){console.error('Assistant pricing maintenance failed: '+error.message);process.exitCode=1;}
}
