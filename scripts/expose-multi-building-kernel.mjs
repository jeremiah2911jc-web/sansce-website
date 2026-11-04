// Expose existing shared functions without changing their implementations.
export const MULTI_KERNEL_EXPORTS=['reviewAboveGround','reviewRoofEnvelope','reviewEscapeStairs','reviewBasementVolume','resolveBonusLimits','resolveCommonPolicy','resolveExcavationLimit'];
export function exposeMultiBuildingKernel(source){
 const marker='// multi-building shared kernel exports';
 if(source.includes(marker))source=source.slice(0,source.indexOf(marker));
 source=source.trimEnd();
 for(const name of MULTI_KERNEL_EXPORTS)if(!source.includes(`function ${name}(`))throw Error('Missing shared kernel: '+name);
 return source+'\n'+marker+'\nexport { '+MULTI_KERNEL_EXPORTS.join(', ')+' };\n';
}
