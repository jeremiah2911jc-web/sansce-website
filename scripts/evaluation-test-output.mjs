import assert from 'node:assert/strict';
import {normalizeGeneratedSiteCopy} from './normalize-generated-site-copy.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
// Only known presentation edits are normalized; all numeric values, gates and object fields are compared.
export function canonicalEvaluationOutput(value){
 if(typeof value==='string'&&value.startsWith('勾選條件為規劃目標；資格未知仍可初估'))return '本次獎勵依已填實施方式、申請條件及範圍計算；標章、保證金與完工義務依本案文件及後續審查辦理。';
 if(typeof value==='string')return publicText(JSON.parse(normalizeGeneratedSiteCopy('['+JSON.stringify(value)+']'))[0]);
 if(Array.isArray(value))return value.map(canonicalEvaluationOutput);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,canonicalEvaluationOutput(v)]));
 return value;
}
export function assertEvaluationEqual(actual,expected,message){assert.deepEqual(canonicalEvaluationOutput(actual),canonicalEvaluationOutput(expected),message??'Evaluation parity');}
