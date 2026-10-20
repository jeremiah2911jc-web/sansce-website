export function assistantWelcome(now = new Date()) {
 const hour = Number(new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Taipei',hour:'2-digit',hourCycle:'h23'}).format(now));
 const greeting = hour >= 5 && hour < 12 ? '早安' : hour >= 12 && hour < 18 ? '午安' : '晚安';
 return {role:'assistant',content:`${greeting}，我是三策助理。您可以詢問都更、危老、合建的相關問題，或了解三策的顧問服務。`};
}
