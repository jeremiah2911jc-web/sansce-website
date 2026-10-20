import {Children,useLayoutEffect,useRef,useState} from 'react';

/** Presentation adapter for original App labels; it does not change values or handlers. */
export function FieldLabel({children}){
 const parts=Children.toArray(children);
 if(parts.some(p=>typeof p!=='string'&&typeof p!=='number'))return <span className="le-label-text">{children}</span>;
 const raw=parts.join(''),match=raw.match(/(元[／/]㎡|元[／/]坪|坪[／/]戶|位[／/]戶|㎡|m|%|坪|位|元)([（(].*[）)])?$/);
 const caption=match?raw.slice(0,match.index)+(match[2]??''):raw;
 return <span className="le-label-text" data-unit={match?.[1]??''} data-label={raw}>{caption}</span>;
}

export function PublicNumber(props){
 const ref=useRef(null),[unit,setUnit]=useState(''),[label,setLabel]=useState('');
 useLayoutEffect(()=>{
  const caption=ref.current?.closest('label')?.querySelector('.le-label-text');
  setUnit(caption?.dataset.unit??'');setLabel(caption?.dataset.label??caption?.textContent??'');
 });
 const input=<input {...props} ref={ref} aria-label={props['aria-label']||label||undefined}/>;
 return unit?<span className="le-number">{input}<span>{unit}</span></span>:input;
}
