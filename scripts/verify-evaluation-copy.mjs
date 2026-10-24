import {readdirSync,readFileSync} from 'node:fs';
import {join,relative} from 'node:path';
const roots=process.argv.slice(2);if(!roots.length)roots.push('src');
const forbidden=/開啟上次評估|已恢復輸入，請重新檢核|已恢復輸入，請重新檢核|規則已變更|空白不(?:補|當|採|套)|不補零|獎勵不預填|不套預設(?:值|比例)?|切換(?:模式)?保留(?:各模式|兩組原始|原始|輸入)|共用土地資料；/;
let scanned=0;const issues=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory()){walk(p);continue;}if(!/\.(?:tsx?|jsx?|mjs)$/.test(p)||/\.test\.|fixtures|preview/i.test(item.name))continue;scanned++;readFileSync(p,'utf8').split('\n').forEach((s,i)=>{const m=s.match(forbidden);if(m)issues.push(`${relative(process.cwd(),p)}:${i+1}: ${m[0]}`);});}}
roots.forEach(walk);if(issues.length){console.error(issues.join('\n'));process.exit(1);}console.log(`PASS evaluation copy: ${scanned} source files; no prohibited implementation notices. Visual review of restore, change, error and import states is also required.`);
