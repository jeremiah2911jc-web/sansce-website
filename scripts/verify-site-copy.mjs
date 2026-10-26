import {readdirSync,readFileSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prohibitedSiteCopy} from '../shared/public-copy-policy.js';

// Scan all authored site/application/assistant text, including metadata and report labels.
// The policy declaration is the only excluded source: it intentionally names prohibited words.
const root=fileURLToPath(new URL('../',import.meta.url));
const built=process.argv.includes('--built');
const targets=built?['dist','docs/website-assistant/content.json']:['src','shared','api','scripts/build-pages.mjs','index.html','public'];
const textFile=/\.(?:jsx?|mjs|json|html|txt|svg|webmanifest)$/;
const rules=prohibitedSiteCopy.map(([name,pattern])=>[name,new RegExp(pattern,'gu')]);
let count=0;const errors=[];
function inspect(path){
 if(relative(root,path)==='shared/public-copy-policy.js')return;
 const text=readFileSync(path,'utf8').replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g,(_,long,short)=>String.fromCodePoint(parseInt(long||short,16)));count++;
 for(const [rule,re] of rules){
  for(const hit of text.matchAll(re)){
   const line=text.slice(0,hit.index).split('\n').length;
   errors.push(`${relative(root,path)}:${line} ${rule}「${hit[0]}」`);
  }
 }
}
function walk(path){
 if(relative(root,path)==='shared/public-copy-policy.js')return;
 if(textFile.test(path)){inspect(path);return;}
 for(const entry of readdirSync(path,{withFileTypes:true})){
  const next=join(path,entry.name);
  if(entry.isDirectory())walk(next);else if(entry.isFile()&&textFile.test(next))inspect(next);
 }
}
for(const target of targets)walk(resolve(root,target));
if(errors.length){for(const error of errors)console.error(error);console.error(`FAIL: ${errors.length} prohibited expressions in ${built?'built':'source'} site copy.`);process.exitCode=1;}
else console.log(`PASS: ${count} ${built?'built files and assistant knowledge records':'site source files, metadata, report labels and assistant instructions'} checked for prohibited expressions. Manual wording review remains required.`);
