import {useId,useLayoutEffect,useRef,useState} from 'react';

/** Keep the native select and expose a full value only when its text cannot fit. */
export function PublicSelect({children,...props}){
 const ref=useRef(null),hintId=useId();
 const [caption,setCaption]=useState(''),[label,setLabel]=useState('');
 useLayoutEffect(()=>{
  const control=ref.current;
  function measure(){
   const selected=control.options[control.selectedIndex]?.text??'';
   const style=getComputedStyle(control),canvas=document.createElement('canvas'),context=canvas.getContext('2d');
   if(context)context.font=style.font;
   const available=control.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
   const textWidth=context?.measureText(selected).width??0;
   setCaption(textWidth>available+1?selected:'');
   const parent=control.closest('label');
   setLabel((parent?.querySelector('.le-label-text')??parent?.querySelector(':scope > span'))?.textContent?.trim()??'');
  }
  measure();
  const observer=new ResizeObserver(measure);observer.observe(control);
  return()=>observer.disconnect();
 },[props.value,children]);
 return <><select {...props} ref={ref} aria-label={props['aria-label']||label||undefined} aria-describedby={[props['aria-describedby'],caption?hintId:null].filter(Boolean).join(' ')||undefined} title={caption||props.title}>{children}</select>{caption&&<small className="le-selected-caption" id={hintId}>{caption}</small>}</>;
}
