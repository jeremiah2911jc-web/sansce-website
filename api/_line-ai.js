import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
const instructions = readFileSync(new URL('../docs/line-assistant/instructions.txt', import.meta.url), 'utf8');
export function verifyLineSignature(body, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  const supplied = Buffer.from(signature, 'base64');
  return supplied.length === expected.length && timingSafeEqual(expected, supplied);
}
export function wantsAI(text) {
  return /^(?:恢復\s*AI|切回\s*AI|轉回\s*AI|AI模式|恢復助理)[。！!\s]*$/i.test(text.trim());
}
export function taipeiTime(now = new Date()) {
  return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
}
export function wantsHuman(text) {
  const value = text.trim();
  if (/^(?:真人|人工|專人|轉接)[。！!\s]*$/.test(value)) return true;
  if (/(?:不用|不需要|不要)(?:轉|切換|找|請)?(?:真人|人工|專人)/.test(value)) return false;
  return /(?:(?:我要|我想|需要|希望|請|幫我|想找|轉給|切換|轉接|找個).{0,10}(?:真人|人工|專人)|(?:真人|人工|專人)(?:回覆|回應|接手|服務)|不要.*(?:AI|機器人)|停止.*(?:AI|機器人)|正式報價|審查.*(?:契約|文件))/i.test(value);
}
export async function generateLineAnswer({ text, history = [], first = true, fetchImpl = fetch, apiKey = process.env.OPENAI_API_KEY, model = process.env.LINE_AI_MODEL, now = new Date() }) {
  if (!apiKey || !model) throw new Error('AI configuration unavailable');
  const input = history.slice(-10).filter(m => ['user','assistant'].includes(m.role)).map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
  input.push({ role: 'user', content: text.slice(0,2000) });
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, instructions: instructions + '\n系統提供的目前台灣日期時間（Asia/Taipei）：' + taipeiTime(now) + '。日期時間問題直接依此回答；客戶所在地未知時明示這是台灣時間。' + (first ? '\n這是本次對話的首次回覆。' : '\n本次對話已介紹過 AI 身分，不要重複自我介紹。'), input, store: false, max_output_tokens: 800 }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`AI request failed (${response.status})`);
  const data = await response.json();
  const answer = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
  if (!answer) throw new Error('AI response empty');
  return { text: answer.slice(0,4500), usage: data.usage };
}
