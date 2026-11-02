// Display document names while retaining the complete, unchanged HTTP(S) destination.
export function sourceReferences(value,known=[]){
 const raw=String(value??''),matches=[...raw.matchAll(/https?:\/\/[^\s<>"'「」『』（）。，；]+/g)];
 if(!matches.length)return [{label:raw}];
 const parts=[];let from=0;
 for(const [index,match]of matches.entries()){
  const url=match[0],prefix=raw.slice(from,match.index).replace(/^[\s：:／/·；]+|[\s：:／/·；]+$/gu,'').trim(),reference=known.find(x=>x.url===url);
  let valid=false;try{const parsed=new URL(url);valid=['https:','http:'].includes(parsed.protocol)&&!!parsed.hostname;}catch{}
  if(!valid){parts.push({label:raw.slice(from,match.index+url.length)});from=match.index+url.length;continue;}
  const label=reference?.title||prefix||('資料連結'+(matches.length>1?' '+(index+1):''));
  if(index)parts.push({label:'；'});
  parts.push({label,url});from=match.index+url.length;
 }
 if(from<raw.length)parts.push({label:raw.slice(from)});
 return parts;
}
