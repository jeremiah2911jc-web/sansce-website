import {useEffect,useState} from 'react';

// Keep the fixed 44px entry away from visible labels and disclosure controls.
// The container stays fixed; only the closed launcher changes its vertical slot.
export default function useAssistantClearance(trigger,open){
 const [offset,setOffset]=useState(0);
 useEffect(()=>{
  if(open)return;
  let frame=0;
  const update=()=>{
   frame=0;const button=trigger.current;if(!button||document.activeElement===button)return;
   if(innerWidth>760){setOffset(0);return;}
   const base=button.parentElement.getBoundingClientRect(),blocks=[];
   const add=r=>{if(r.width&&r.height&&r.right>base.left-6&&r.left<base.right+6&&r.bottom>90&&r.top<base.bottom+6)blocks.push(r);};
   for(const el of document.querySelectorAll('main a,main button,main summary,main input,main select,main textarea,footer a,footer button,footer summary')){
    if(el.closest('.website-assistant')||!el.getClientRects().length)continue;
    if(/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)){add(el.getBoundingClientRect());continue;}
    const range=document.createRange();range.selectNodeContents(el);for(const r of range.getClientRects())add(r);
   }
   const header=document.querySelector('.sx-header')?.getBoundingClientRect().bottom||80;
   let chosen=0,best=Infinity;
   for(let move=0;move<=280&&base.top-move>header+12;move+=56){
    const top=base.top-move,bottom=top+44;let score=0;
    for(const r of blocks)score+=Math.max(0,Math.min(bottom+5,r.bottom)-Math.max(top-5,r.top));
    if(score<best){best=score;chosen=move;}if(score===0)break;
   }
   setOffset(chosen);
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  queue();window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);document.addEventListener('click',queue);document.addEventListener('toggle',queue,true);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);document.removeEventListener('click',queue);document.removeEventListener('toggle',queue,true);};
 },[trigger,open]);
 return offset;
}
