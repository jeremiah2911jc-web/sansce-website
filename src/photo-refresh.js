import mapping from './photo-refresh-map.json';

let activePage='/';
export function setPhotoPage(path){activePage=path||'/';}
const canonical=src=>typeof src==='string'?src.replace('-768.webp','-1536.webp').replace('-small.webp','.webp'):src;
export function photoEntry(src,slot=''){
 if(typeof src!=='string')return null;
 const page=typeof window==='undefined'?activePage:window.location.pathname.replace(/\/$/,'')||'/';
 return mapping[page]?.[`${canonical(src)}|${slot}`]||mapping[page]?.[`${canonical(src)}|`];
}
export function photoUrl(src,path=activePage,slot=''){
 return mapping[path]?.[`${canonical(src)}|${slot}`]?.src||mapping[path]?.[`${canonical(src)}|`]?.src||src;
}
export function photoProps(props){
 const entry=photoEntry(props.src,props.slot);
 const {slot,...original}=props;
 if(!entry)return original;
 return {...original,src:entry.src,srcSet:`${entry.small} 960w, ${entry.src} ${entry.width}w`,sizes:props.sizes||'(max-width: 760px) 100vw, 70vw',alt:entry.alt,width:entry.width,height:entry.height,style:{...props.style,objectPosition:entry.position||'50% 45%'},'data-photo-id':entry.id};
}
export function photoSourceProps(props){
 const first=props.srcSet?.trim().split(/\s+/)[0];
 const entry=photoEntry(first,props.slot);
 if(!entry)return props;
 return {srcSet:`${entry.small} 960w, ${entry.src} ${entry.width}w`,sizes:props.sizes||'(max-width: 760px) 100vw, 70vw'};
}
