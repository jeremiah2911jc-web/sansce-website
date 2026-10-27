import {useEffect,useLayoutEffect} from 'react';

const useBrowserLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;

// Normal CJK text flow remains intact. At most two text ems are reserved at
// the reading edge when a short final line contains only one CJK character.
export default function useDevelopmentProse(root,revision){
 useBrowserLayoutEffect(()=>{
  const node=root.current;if(!node)return;let frame=0,lastWidth=-1,disposed=false;
  const lastLineCount=element=>{
   let walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),text,lastTop=-Infinity,count=0,lines=0;
   while(text=walker.nextNode())for(let i=0;i<text.length;i++){
    if(!/[\u3400-\u9fff]/u.test(text.data[i]))continue;
    const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);const box=range.getBoundingClientRect();if(!box.width)continue;
    if(box.top>lastTop+2){lastTop=box.top;count=0;lines++;}count++;
   }
   return lines>1?count:0;
  };
  const measure=()=>{
   if(disposed)return;
   for(const element of node.querySelectorAll('[data-de-prose]')){
    if(!element.getClientRects().length)continue;element.style.removeProperty('--de-prose-edge');
    if(lastLineCount(element)!==1)continue;
    const limit=Math.ceil(parseFloat(getComputedStyle(element).fontSize)*2);
    for(let edge=1;edge<=limit;edge++){element.style.setProperty('--de-prose-edge',edge+'px');if(lastLineCount(element)!==1)break;}
   }
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-lastWidth)<.5)return;lastWidth=width;schedule();});
  observer.observe(node);node.addEventListener('toggle',schedule,true);document.fonts?.ready.then(schedule);document.fonts?.addEventListener('loadingdone',schedule);schedule();
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();node.removeEventListener('toggle',schedule,true);document.fonts?.removeEventListener('loadingdone',schedule);};
 },[root,revision]);
}
