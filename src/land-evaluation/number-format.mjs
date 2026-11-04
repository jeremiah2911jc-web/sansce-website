// Display-only normalization. Calculations retain their original precision.
export function formatNumber(value,digits=2,smallValues=false){
 if(typeof value!=='number'||!Number.isFinite(value))return '待確認';
 const n=value<0&&value>-1e-9?0:value,minimum=10**-digits;
 if(smallValues&&n!==0&&Math.abs(n)<minimum)return n>0?'<'+minimum:'>'+(-minimum);
 return n.toLocaleString('zh-TW',{minimumFractionDigits:0,maximumFractionDigits:digits});
}
