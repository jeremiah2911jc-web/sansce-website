import {useEffect,useState} from 'react';

// Animate the presentation once per result, only when it enters the viewport.
// The final numbers remain in the DOM throughout; no intermediate counts.
export function useResultMotion(signature,enabled=true){
 const [element,setElement]=useState(null),[state,setState]=useState('static');
 useEffect(()=>{
  if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let observer,frame;
  const stop=()=>{observer?.disconnect();cancelAnimationFrame(frame);};
  const start=()=>{
   stop();if(!enabled||preference.matches||!('IntersectionObserver' in window)){setState('static');return;}
   setState('waiting');
   observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();frame=requestAnimationFrame(()=>setState('playing'));}},{threshold:0,rootMargin:'0px 0px -32px 0px'});
   observer.observe(element);
  };
  start();preference.addEventListener('change',start);
  return()=>{stop();preference.removeEventListener('change',start);};
 },[element,signature,enabled]);
 return {ref:setElement,'data-motion':state};
}
export function ResultMotion({signature,children,className=''}){
 const motion=useResultMotion(signature);
 return <div {...motion} className={'result-motion '+className}>{children}</div>;
}
