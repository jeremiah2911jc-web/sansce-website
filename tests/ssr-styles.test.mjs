import test from 'node:test';
import assert from 'node:assert/strict';
import {extractServerStyles,serverStyleSheet} from '../scripts/ssr-styles.mjs';

test('server declarations survive without style attributes or CSP relaxation',()=>{
 const source='<img alt="圖面" class="photo" style="object-position:50% 45%"/><span style="--phrase-index:2">文字</span>';
 const {html,rules}=extractServerStyles(source);
 assert(!/\sstyle=/.test(html));
 assert.match(html,/class="photo ssr-style-[a-f0-9]+"/);
 assert.match(html,/>文字<\/span>/);
 const css=serverStyleSheet(rules);
 assert.match(css,/object-position:50% 45%/);
 assert.match(css,/--phrase-index:2/);
 assert.equal(rules.size,2);
});

test('identical declarations share one class and unstyled content remains intact',()=>{
 const rules=new Map();
 const one=extractServerStyles('<p style="color:#263d4b">甲</p>',rules).html;
 const two=extractServerStyles('<p style="color:#263d4b">乙</p>',rules).html;
 assert.equal(rules.size,1);
 assert.equal(one.match(/class="([^"]+)"/)[1],two.match(/class="([^"]+)"/)[1]);
 assert.equal(extractServerStyles('<p>自然換行</p>',rules).html,'<p>自然換行</p>');
});
