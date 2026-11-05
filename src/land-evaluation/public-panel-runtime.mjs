import {jsx as reactJsx,jsxs as reactJsxs,Fragment} from 'react/jsx-runtime';
import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import {publicText} from './public-copy.mjs';
export {Fragment};

// Clean text at the rendering boundary, including messages returned by the frozen core.
// Values, events, IDs, options and calculation objects are passed through unchanged.
export function displayChildren(value){
 if(typeof value==='string')return publicText(value);
 if(Array.isArray(value))return value.map(displayChildren);
 return value;
}
const propsForDisplay=props=>{if(!props)return props;const visible={...props};if(Object.hasOwn(props,'children'))visible.children=displayChildren(props.children);for(const key of ['aria-label','title','placeholder'])if(typeof visible[key]==='string')visible[key]=publicText(visible[key]);return visible;};
export const jsx=(type,props,key)=>reactJsx(type==='details'?EvaluationDisclosure:type,propsForDisplay(props),key);
export const jsxs=(type,props,key)=>Array.isArray(props?.children)?reactJsxs(type==='details'?EvaluationDisclosure:type,propsForDisplay(props),key):reactJsx(type==='details'?EvaluationDisclosure:type,propsForDisplay(props),key);

const number=value=>Number.isFinite(value)?value.toLocaleString('zh-TW',{maximumFractionDigits:2}):'待確認';
const unique=values=>[...new Set(values.filter(Boolean).map(publicText))];
const repeatedTdrNote=/^新北：一般案件依量體評定|^臺北第2-1、4條：|^道路寬度未填|^基地道路資料尚屬待確認|^實際開闢寬度、同路段基地面寬及道路連通資料待補/;
export function TdrResult({review:r,application:t,ready}){
 if(!ready)return jsx('p',{children:'填入基地面積與基準容積率後，顯示容移採計量及資格檢核。'});
 const issues=unique([...r.errors,...r.gaps,...r.notes.filter(value=>!repeatedTdrNote.test(value))]);
 const rows=[['本次採計移入容積',number(r.appliedSqm)+'㎡'],['採計比例／本次上限',number(r.appliedPercent)+'%／'+number(r.capPercent)+'%']];
 if(t.method!=='unselected'&&t.quantityBasis!=='permitted')rows.push(['送出地／代金配置量',number(r.actualLand)+'㎡／'+number(r.actualCash)+'㎡']);
 return jsxs('section',{'aria-label':'容移試算與待補資料',children:[jsx('h4',{children:'容移試算結果'}),jsx('table',{children:jsx('tbody',{children:rows.map(([label,value])=>jsxs('tr',{children:[jsx('th',{children:label}),jsx('td',{children:value})]},label))})}),r.senders.length>0&&jsx('ul',{children:r.senders.map(sender=>jsx('li',{children:[sender.parcel||'地號待填','：',number(sender.volume),'㎡；',unique(sender.issues).join('；')]},sender.id))}),issues.length>0&&jsx('ul',{children:issues.map(value=>jsx('li',{children:value},value))})]});
}
