import {useEffect,useRef,useState} from 'react';

export function useAssistantVerification(open){
 const container=useRef(null),widget=useRef(null),token=useRef('');
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(!open)return;
  token.current='';setReady(false);setError('');
  let disposed=false;const timer=setTimeout(()=>{if(!disposed&&!token.current)failed();},25000);
  const failed=()=>{if(!disposed){token.current='';setReady(false);setError('安全驗證暫時無法完成，請重試。');}};
  const render=()=>{
   if(disposed||!container.current||widget.current!==null)return;
   const sitekey=import.meta.env.VITE_TURNSTILE_SITE_KEY;
   if(!sitekey){failed();return;}
   try{widget.current=window.turnstile.render(container.current,{sitekey,action:'website_assistant',theme:'light',size:'flexible',appearance:'interaction-only',
    callback:value=>{if(!disposed){token.current=value;setReady(true);setError('');}},
    'expired-callback':()=>{if(!disposed){token.current='';setReady(false);}},
    'error-callback':failed,'timeout-callback':failed});}catch{failed();}
  };
  let script=document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
  if(window.turnstile)render();else{
   if(!script){script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;document.head.appendChild(script);}
   script.addEventListener('load',render);script.addEventListener('error',failed);
  }
  return()=>{disposed=true;clearTimeout(timer);script?.removeEventListener('load',render);script?.removeEventListener('error',failed);if(widget.current!==null&&window.turnstile)window.turnstile.remove(widget.current);widget.current=null;token.current='';setReady(false);};
 },[open,attempt]);
 // Each consumed token gets a fresh widget and timeout; never reuse a completed challenge.
 function reset(){token.current='';setReady(false);setError('');setAttempt(n=>n+1);}
 function retry(){if(!window.turnstile)document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')?.remove();reset();}
 return {container,token,ready,error,reset,retry};
}
