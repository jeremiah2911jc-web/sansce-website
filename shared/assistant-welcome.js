export function assistantWelcome(now = new Date()) {
 const hour = Number(new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Taipei',hour:'2-digit',hourCycle:'h23'}).format(now));
 const greeting = hour >= 5 && hour < 12 ? '早安' : hour >= 12 && hour < 18 ? '午安' : '晚安';
 return {role:'assistant',content:`${greeting}，我是三策助理。您可以查詢地主與社區的重建提案、分配與契約問題，或了解開發評估的規模、成本收益及資金分析服務。`};
}
