// Explicit test double. Production always uses the database-backed guard.
export const testConversation='0ec68a9f-5b54-4d28-a546-2822cba51b9e';
export const admittedGuard=async()=>({allowed:true,maxOutputTokens:2000,maxToolCalls:1,start:async()=>{},settle:async()=>{},release:async()=>{}});
