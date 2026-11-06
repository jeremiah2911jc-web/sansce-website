import {readdirSync,readFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {parse} from '@babel/parser';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
const roots=process.argv.slice(2);if(!roots.length)roots.push('src/land-evaluation');
const implementationNotices=/開啟上次評估|已恢復輸入，請重新檢核|規則已變更|空白不(?:補|當|採|套)|不補零|獎勵不預填|不套預設(?:值|比例)?|切換(?:模式)?保留(?:各模式|兩組原始|原始|輸入)|共用土地資料；/;
const prohibited=/明示|目標假設|追究|混算|真正|從來|口徑|對帳|補款|往往|其實|很多時候|值得注意的是|更重要的是|這也提醒我們|讓我們先思考|值得警醒|值得追問|同樣要回答|有一個更前面的問題|背後還有一個問題|我們很容易問|一個很深的|整理情緒|需要一直記得|算清楚|算得清楚|長出來|不是[^。；\n]{0,80}而是|不在[^。；\n]{0,80}而在|不能只[^。；\n]{0,80}還要|不能據此認定|不能僅因[^。；\n]{0,80}便認為/;
const removedTemplates=/上限路徑|路徑上限|重建獎勵路徑|農舍申請路徑|本次上限路徑採規劃假設|填入規劃預設值|重建獎勵資料來源|規劃目標（資格待查證）|會影響本案用途、途徑或許可的採用前提。|會影響本案權利、分配或後續採用條件。|要先儲存本次評估嗎？/;
let scanned=0,literals=0;const issues=[];
function inspect(file){
 const code=readFileSync(file,'utf8');scanned++;
 code.split('\n').forEach((line,i)=>{if(implementationNotices.test(line))issues.push(`${file}:${i+1}: 操作說明待修訂`);});
 const ast=parse(code,{sourceType:'module',plugins:['jsx']});
 function visit(node,parent){
  if(!node||typeof node!=='object')return;
  const text=node.type==='StringLiteral'||node.type==='JSXText'?node.value:node.type==='TemplateElement'?node.value.cooked:null;
  const replacementKey=/\/(?:approved-copy-edits|public-copy)\.mjs$/.test(file)&&parent?.type==='ArrayExpression'&&parent.elements[0]===node;
  if(text&&/\p{Script=Han}/u.test(text)&&!replacementKey){literals++;const visible=publicText(text);if(prohibited.test(visible)||removedTemplates.test(visible)||/[？]|[\p{Script=Han}]\s*\?/u.test(visible.replace(/https?:\/\/[^\s，。、；）]+/g,'')))issues.push(`${relative(process.cwd(),file)}:${node.loc.start.line}: 公開文字待修訂`);}
  for(const[key,value]of Object.entries(node)){if(['loc','extra','comments','tokens'].includes(key))continue;if(Array.isArray(value))value.forEach(n=>visit(n,node));else if(value&&typeof value==='object')visit(value,node);}
 }visit(ast,null);
}
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())walk(p);else if(/\.(?:tsx?|jsx?|mjs)$/.test(p)&&!/\.test\.|fixtures|preview/i.test(entry.name))inspect(p);}}
roots.forEach(walk);if(issues.length){console.error(issues.join('\n'));process.exit(1);}
console.log(`PASS evaluation copy: ${scanned} files and ${literals} decoded public text fragments; latest prohibited wording, approved templates and implementation notices checked. Manual review remains required.`);
