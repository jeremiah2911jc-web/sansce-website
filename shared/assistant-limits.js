export const assistantLimits = Object.freeze({bodyBytes:65536,messageChars:2000,historyItems:20,historyChars:12000,historyItemChars:8000});

// Keep the newest whole messages. The server validates these limits independently.
export function boundedAssistantHistory(messages) {
 const result=[];let chars=0;
 for(const item of messages.slice(-assistantLimits.historyItems).reverse()){
  if(item.content.length>assistantLimits.historyItemChars||chars+item.content.length>assistantLimits.historyChars)break;
  result.unshift({role:item.role,content:item.content});chars+=item.content.length;
 }
 return result;
}
