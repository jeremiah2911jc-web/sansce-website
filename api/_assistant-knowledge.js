import { readFileSync } from 'node:fs';

const library = JSON.parse(readFileSync(new URL('../docs/website-assistant/professional-knowledge.json', import.meta.url), 'utf8'));
export const officialDomains = ['law.moj.gov.tw', 'uro.ntpc.gov.tw', 'laws.ntpc.gov.tw', 'uro.gov.taipei', 'laws.gov.taipei', 'laws.taipei.gov.tw', 'nlma.gov.tw'];
const companyQuestion = /(?:三策|你們|你公司|貴公司).*(?:電話|地址|聯絡|老闆|負責人|服務|收費|報價|專業團隊|融資|營造|成立|人員|多少人|幾個人|經驗|年資|能力|規模|案例|實績|做過|處理過|顧問|委託)|(?:公司|顧問).*(?:成立|經驗|年資|能力|規模|案例|實績|做過|處理過|多少人|幾個人)|(?:電話|地址|聯絡方式|公司名稱|你是誰)/;
const professionalTerms = /都更|都市更新|危老|重建|合建|權利變換|更新會|報核|同意比例|法規|法條|容積|耐震|基地|事業計畫|事業概要|補助|稅|契約|審查|送件/;
const topicPatterns = [
  ['comparison', /(?:都更|都市更新).*(?:危老).*(?:不同|差|比較)|(?:危老).*(?:都更|都市更新).*(?:不同|差|比較)/],
  ['area', /面積|幾坪|多大|平方公尺|最小基地|最小.*單元/],
  ['consent', /同意|比例|幾成|門檻|報核.*%/],
  ['outline', /概要|報核|送件|程序|流程|事業計畫/],
  ['deadline', /期限|截止|延長|受理|到期/],
  ['qualification', /資格|屋齡|三十年|30\s*年|電梯|評估|耐震|適用|能不能|可不可以/],
  ['bonus', /容積|獎勵|獎金/],
  ['association', /更新會|會員|理事|監事|立案|籌組/],
  ['joint', /合建|權利變換|分回|分配|找補|契約/]
];
const normalize = text => text.replace(/台北/g, '臺北').trim();

// Resolve short follow-ups using visitor turns only; an earlier AI answer must not
// turn an incorrect policy into the next question's retrieval context.
export function resolveQuestion(message, history = []) {
  let state = { mode: 'renewal', city: null, topic: null, professional: false };
  const turns = [...history.filter(m => m.role === 'user').map(m => m.content), message];
  for (const raw of turns) {
    const text = normalize(raw);
    if (companyQuestion.test(text) && !/法規|同意|面積|門檻|容積/.test(text)) {
      state = { mode: 'renewal', city: null, topic: null, professional: false };
      continue;
    }
    const city = /雙北/.test(text) || (/新北/.test(text) && /臺北/.test(text)) ? '雙北' : /新北/.test(text) ? '新北市' : /臺北/.test(text) ? '臺北市' : text.match(/桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|宜蘭|苗栗|彰化|南投|雲林|嘉義|屏東|花蓮|臺東|台東|澎湖|金門|連江/)?.[0] || null;
    let explicitTopic = topicPatterns.find(([, pattern]) => pattern.test(text))?.[0];
    if (/合建|權利變換|分回|找補/.test(text) && !/基地面積|最小基地|單元面積/.test(text)) explicitTopic = 'joint';
    if (/會員大會|更新會.*(?:決議|出席|選舉|改選|開會)/.test(text)) explicitTopic = 'association';
    const shortFollowup = text.length <= 24 && (city || /^(?:一般|普通|那|如果|所以|危老|都更|臺北|新北|同意|比例|多少|幾|可以|不行|是|不是|沒有|已經|未|有|[0-9０-９])/.test(text));
    const professional = professionalTerms.test(text) || Boolean(explicitTopic) || (shortFollowup && state.professional);
    if (!professional) {
      state = { mode: 'renewal', city: null, topic: null, professional: false };
      continue;
    }
    const mode = explicitTopic === 'comparison' ? 'both' : /危老/.test(text) ? 'danger' : /都更|都市更新|一般.*案|普通.*案/.test(text) ? 'renewal' : state.mode;
    state = { city: city || state.city, mode, topic: explicitTopic || (shortFollowup ? state.topic : null), professional };
  }
  return state;
}

export function retrieveProfessionalKnowledge(message, history = [], now = new Date()) {
  const context = resolveQuestion(message, history);
  let cards = [];
  if (context.professional) {
    cards = library.cards.filter(card => {
      if (context.topic === 'comparison') return card.topic === 'comparison';
      if (card.mode !== context.mode && card.mode !== 'both') return false;
      if (context.topic === 'area' && context.mode === 'renewal') return card.topic === 'area' && (!context.city || context.city === '雙北' || card.city === context.city);
      if (context.topic === 'consent') return card.topic === 'consent' || (context.mode === 'renewal' && card.topic === 'outline');
      if (context.topic === 'outline') return ['outline', 'consent'].includes(card.topic);
      return card.topic === context.topic || (context.topic === 'joint' && card.topic === 'consent' && /同意|比例|報核/.test(message));
    });
    if (context.mode === 'danger' && ['area', 'consent', 'qualification'].includes(context.topic)) {
      cards = [...new Map([...cards, ...library.cards.filter(c => c.id === 'danger-qualification')].map(c => [c.id, c])).values()];
    }
  }
  const ageDays = (now - new Date(`${library.verifiedAt}T00:00:00+08:00`)) / 86400000;
  const needsSearch = context.professional && (/最新|目前|現在|今年|現行|仍.*受理|延長|修正|補助|税|稅/.test(message) || cards.length === 0 || ageDays > 14);
  return { context, cards, needsSearch, version: library.version, verifiedAt: library.verifiedAt,
    sources: library.sources.filter(s => cards.some(c => c.sources.includes(s.id))) };
}

export function knowledgeInstructions(result) {
  if (!result.context.professional) return '';
  return `\n本題專業檢索脈絡：${JSON.stringify(result.context)}。脈絡是檢索提示，仍需閱讀完整對話確認，不是訪客已證實的個案事實。\n專業知識版本：${result.version}；官方查核日：${result.verifiedAt}。\n${result.needsSearch ? '本題必須使用官方搜尋查證，辨別現行與歷史版本；若搜尋無法確認，直接説明已知規則及尚未確認的部分。' : '下列官方規則已核對，可直接回答；未涵蓋的細節請用官方搜尋查證。'}\n${result.cards.map(c => `【${c.id}｜${c.articles}】\n${c.text}`).join('\n\n')}\n官方來源（法規版本日期與查核日不同）：\n${result.sources.map(s => `${s.title}｜${s.jurisdiction}｜修正：${s.revision}\n${s.url}`).join('\n')}`;
}

export function formatAssistantOutput(data) {
  const contents = (data.output || []).flatMap(o => o.content || []).filter(c => c.type === 'output_text');
  let answer = contents.map(c => c.text).join('\n').replace(/[^]*/g, '').trim();
  if (!answer) return '';
  const citations = [...new Map(contents.flatMap(c => c.annotations || []).filter(a => a.type === 'url_citation').flatMap(a => {
    try { const url = new URL(a.url); return url.protocol === 'https:' && officialDomains.some(d => url.hostname === d || url.hostname.endsWith(`.${d}`)) ? [[url.href, { url: url.href, title: a.title || '官方資料' }]] : []; } catch { return []; }
  })).values()];
  const missing = citations.filter(c => !answer.includes(c.url));
  if (missing.length) answer += '\n\n官方查證來源：\n' + missing.map(c => `[${c.title.replace(/[\[\]\n]/g, ' ')}](${c.url})`).join('\n');
  return answer;
}
