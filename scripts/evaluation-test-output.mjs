import assert from 'node:assert/strict';
import {normalizeGeneratedSiteCopy} from './normalize-generated-site-copy.mjs';
import {publicText} from '../src/land-evaluation/public-copy.mjs';
// Only known presentation edits are normalized; all numeric values, gates and object fields are compared.
export function canonicalEvaluationOutput(value){
 if(typeof value==='string')return publicText(JSON.parse(normalizeGeneratedSiteCopy('['+JSON.stringify(value)+']'))[0]);
 if(Array.isArray(value))return value.map(canonicalEvaluationOutput);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,canonicalEvaluationOutput(v)]));
 return value;
}
export function assertEvaluationEqual(actual,expected,message){assert.deepEqual(canonicalEvaluationOutput(actual),canonicalEvaluationOutput(expected),message);}
