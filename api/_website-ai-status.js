import {createHash} from 'node:crypto';
import {readPricing} from './_website-ai-cost.js';

export const pricingHash=p=>createHash('sha256').update(JSON.stringify(p)).digest('hex');
// Public read-only deployment proof. No inference, database writes or secrets.
export function makeAssistantPricingStatus({env=process.env,now=Date.now}={}){
 return (req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');res.statusCode=405;return res.end(JSON.stringify({status:'method_not_allowed'}));}
  try{
   const p=readPricing(env,now());
   res.statusCode=200;
   res.end(JSON.stringify({status:'ok',pricing:{model:p.model,version:p.version,validUntil:p.validUntil,sha256:pricingHash(p),source:env.WEBSITE_AI_PRICING_SOURCE==='bundled'?'bundled':'environment'},enabled:env.WEBSITE_AI_ENABLED==='true'}));
  }catch{res.statusCode=503;res.end(JSON.stringify({status:'pricing_unavailable'}));}
 };
}
export default makeAssistantPricingStatus();
