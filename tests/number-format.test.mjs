import test from 'node:test';
import assert from 'node:assert/strict';
import {formatNumber} from '../src/land-evaluation/number-format.mjs';
import {displayNumber} from '../src/land-evaluation/delivery-model.mjs';
import {format} from '../src/land-evaluation/model.mjs';
test('floating point residue displays zero without modifying the source number',()=>{
 const n=-4.547473508864641e-13;
 assert.equal(format(n),'0');assert.equal(displayNumber(n),'0');assert.equal(n,-4.547473508864641e-13);
});
test('small nonzero quantities and negative excess stay distinct from zero',()=>{
 for(const n of [.005758051258453634,.001])assert.equal(displayNumber(n),'<0.01');
 assert.equal(displayNumber(-.001),'>-0.01');assert.equal(displayNumber(0),'0');
 assert.equal(formatNumber(.005758051258453634,2,true),displayNumber(.005758051258453634));
});
test('missing quantities remain distinct from zero and normal precision stays unchanged',()=>{
 for(const n of [undefined,null,NaN,Infinity])assert.equal(displayNumber(n),'待確認');
 assert.equal(displayNumber(13735.31),'13,735.31');assert.equal(format(1.484,3),'1.484');
 assert.equal(displayNumber(-.02),'-0.02');
});
