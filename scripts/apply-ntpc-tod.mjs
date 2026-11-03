import {parse} from '@babel/parser';
export const NTPC_TOD_PATCH_VERSION='ntpc-tod.2026-05-20.v1';
export function applyNtpcTod(code){
 if(code.includes('/* ntpc-tod-hook */'))return code;
 const ast=parse(code,{sourceType:'module'}),fn=name=>ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
 const resolve=fn('resolveBonusLimits');if(!resolve)return code;
 const returned=resolve.body.body.findLast(n=>n.type==='ReturnStatement');
 const original=code.slice(returned.argument.start,returned.argument.end);
 code=code.slice(0,returned.start)+`/* ntpc-tod-hook */
  const resolved=${original};
  const tod=resolveTod(p.ntpcTod,context,resolved,a);
  return tod?{...resolved,tdr:tod.tdr,tod:tod.percent,todReview:tod,notes:[...notes,...tod.notes],errors:[...new Set([...errors,...tod.errors])]}:resolved;`+code.slice(returned.end);
 const replacements=[
 ['rates.renewal + rates.scale + rates.tdr + rates.danger','rates.renewal + rates.scale + rates.tdr + rates.danger + (rates.tod??0)'],
 ['bonus.renewal + bonus.tdr + bonus.scale + bonus.danger','bonus.renewal + bonus.tdr + bonus.scale + bonus.danger + (bonus.tod??0)'],
 ['scale: String(bonus.scale), tdr: String(bonus.tdr)','_resolvedTodPercent:bonus.tod??0, scale: String(bonus.scale), tdr: String(bonus.tdr)'],
 ['n.renewal + n.scale + n.tdr + n.danger','n.renewal + n.scale + n.tdr + n.danger + (Number(i._resolvedTodPercent)||0)'],
 ['const values = { ...v, used: Math.round(chosen.total','const values = { ...v, ...(bonus.todReview?{scaleApplied:bonus.scale,todApplied:bonus.tod}:{}), used: Math.round(chosen.total'],
 ['scaleApplied: detail.bonus.scale, dangerApplied:','scaleApplied: detail.bonus.scale, ...(detail.bonus.todReview?{todApplied:detail.bonus.tod}:{}), dangerApplied:'],
 ];
 for(const [from,to]of replacements){if(!code.includes(from))throw Error('TOD integration anchor missing: '+from);code=from.startsWith('n.renewal')?code.replaceAll(from,to):code.replace(from,to);}
 return 'import {resolveTod} from "../ntpc-tod.mjs";\n'+code;
}
