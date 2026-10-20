import { makeWebAssistantHandler } from '../api/_web-assistant.js';
import { loadEnv } from 'vite';
import { makeContactHandler } from '../api/contact.js';
export function contactPreviewPlugin() {
 const install = server => {
  const env={...loadEnv('development',process.cwd(),''),...process.env};
  server.middlewares.use((req,res,next)=>{
   const route=req.url?.split('?')[0];if(!['/api/contact','/api/website-assistant'].includes(route))return next();
   const address=server.httpServer?.address();
   const port=address && typeof address==='object' ? address.port : null;
   const protocol=server.config.server.https ? 'https' : 'http';
   const allowedHosts=port ? new Set([`127.0.0.1:${port}`,`localhost:${port}`,`[::1]:${port}`]) : new Set();
   const previewOrigin=allowedHosts.has(req.headers.host) ? `${protocol}://${req.headers.host}` : undefined;
   const handler=(route==='/api/website-assistant'?makeWebAssistantHandler:makeContactHandler)({env:{...env,CONTACT_PREVIEW_ORIGIN:previewOrigin}});
   handler(req,res).catch(()=>{if(!res.writableEnded){res.statusCode=500;res.end(JSON.stringify({ok:false,message:'目前無法送出，請稍後重試。'}));}});
  });
 };
 return {name:'contact-local-api',configureServer:install,configurePreviewServer:install};
}
