export function positive(value, label, allowZero = false) {
  if (String(value ?? '').trim() === '') throw new Error(`請填寫${label}。`);
  const n = Number(value);
  if (!Number.isFinite(n) || (allowZero ? n < 0 : n <= 0)) throw new Error(`${label}請填${allowZero ? '零或正數' : '大於零的數字'}。`);
  return n;
}
const percent = (value, label) => {
  const n = positive(value, label, true);
  if (n > 100) throw new Error(`${label}不能超過100%。`);
  return n / 100;
};
const finite = values => {
  if (!values.every(n => Number.isFinite(n) && n >= 0)) throw new Error('數字過大或過小，請核對輸入。');
};
export function calculateBase(input) {
  let far, components;
  if (input.basis === 'total') far = positive(input.total, '總容積率') / 100;
  else {
    const base = positive(input.base, '基本容積率') / 100;
    const bonus = positive(input.bonus, '容積獎勵比例', true) / 100;
    const transfer = positive(input.transfer, '容積移轉比例', true) / 100;
    if (input.method === 'old' && bonus > 0.40) throw new Error('危老獎勵超過本工具的一般簡化範圍40%；請核對原容積等特殊條件，不能直接套用。');
    components = {base, bonus:base * bonus, transfer:base * transfer};
    far = components.base + components.bonus + components.transfer;
  }
  const land = positive(input.land, '持分土地面積');
  const coefficient = input.coefficientMode === 'known' ? positive(input.coefficient, '提案採用的銷售係數') : null;
  const coefficientLow = coefficient ?? 1.6, coefficientHigh = coefficient ?? 1.7;
  const low = far * coefficientLow, high = far * coefficientHigh;
  finite([far, low, high, land * high]);
  if (!(far > 0 && low > 0 && high > 0 && land * low > 0)) throw new Error('容積或面積過小，無法換算。');
  return {far, land, low, high, areaLow:land * low, areaHigh:land * high, components, coefficientLow, coefficientHigh, source:'far'};
}

function plannedBase(land, offer) {
  const input = offer.development;
  const siteLand = positive(input.siteLand, '面積表所對應的全基地土地面積');
  if (land > siteLand) throw new Error('持分土地面積不能大於面積表的全基地土地面積。');
  let components, total;
  if (offer.distribution === 'separate') {
    components = {
      base: positive(input.baseArea, '基本容積對應的全案建坪', true),
      bonus: positive(input.bonusArea, '獎勵對應的全案建坪', true),
      transfer: positive(input.transferArea, '移轉對應的全案建坪', true)
    };
    total = components.base + components.bonus + components.transfer;
  } else total = positive(input.saleArea, '全案含公設、車位另計的建坪');
  if (!(total > 0)) throw new Error('全案建坪合計必須大於零。');
  const low = total / siteLand;
  if (!(low > 0 && land * low > 0)) throw new Error('面積或土地比例過小，無法換算，請核對輸入。');
  finite([total, low, land * low]);
  return {land, low, high:low, areaLow:land * low, areaHigh:land * low, source:'area', components, siteLand, totalSaleArea:total};
}

export function calculateOffer(base, offer) {
  const value = positive(offer.value, '分配條件', offer.mode === 'ratio');
  let areaLow, areaHigh, ratioLow, ratioHigh, exchangeLow, exchangeHigh;
  if (offer.mode === 'ratio') {
    const share = percent(value, '面積分配比例');
    ratioLow = ratioHigh = share;
    areaLow = base.areaLow * share; areaHigh = base.areaHigh * share;
    exchangeLow = base.low * share; exchangeHigh = base.high * share;
  } else {
    if (!['area','exchange'].includes(offer.mode)) throw new Error('請選擇分配方式。');
    areaLow = areaHigh = offer.mode === 'area' ? value : value * base.land;
    exchangeLow = exchangeHigh = areaLow / base.land;
    ratioLow = exchangeLow / base.high; ratioHigh = exchangeHigh / base.low;
  }
  if (offer.mode !== 'ratio' && !(areaLow > 0 && exchangeLow > 0)) throw new Error('分配面積過小，無法換算，請核對輸入。');
  finite([areaLow, areaHigh, ratioLow, ratioHigh, exchangeLow, exchangeHigh]);
  return {areaLow, areaHigh, ratioLow, ratioHigh, exchangeLow, exchangeHigh, over:ratioHigh > 1};
}

// Each proposal owns its development and distribution assumptions. A confirmed
// fixed area does not depend on unknown FAR or an estimated sales coefficient.
export function calculateProposal(landInput, offer) {
  const land = positive(landInput, '你的持分土地面積');
  if (!['ratio','area','exchange'].includes(offer.mode)) throw new Error('請選擇提案的分配方式。');
  if (offer.areaBasis !== 'registered') throw new Error('請確認坪數為含公設、車位另計的建坪；室內實坪不能直接比較。');
  if (offer.mode === 'ratio') {
    if (offer.ratioKind !== 'area') throw new Error('請確認比例是「面積比例」。權利價值比例需要估價、共同負擔及選配資料，不能換成這裡的面積比例。');
    if (!['all','separate'].includes(offer.distribution)) throw new Error('請確認基本容積、獎勵與容積移轉如何分配；尚未確認時不推算分回坪數。');
  }
  if (offer.mode !== 'ratio' && !offer.derive) {
    const value = positive(offer.value, offer.mode === 'area' ? '承諾分回建坪' : '每坪土地換回建坪');
    const area = offer.mode === 'area' ? value : value * land;
    if (!(area > 0 && area / land > 0)) throw new Error('分配面積過小，無法換算，請核對輸入。');
    finite([area, area / land]);
    return {land, mode:offer.mode, areaLow:area, areaHigh:area, exchangeLow:area/land, exchangeHigh:area/land, ratioLow:null, ratioHigh:null, over:false, source:'promise', certainty:'提案承諾的面積'};
  }
  if (!offer.development || !['far','area'].includes(offer.development.source)) throw new Error('請選擇這個提案的開發面積資料。');
  const input = offer.development;
  const base = input.source === 'area' ? plannedBase(land, offer) : calculateBase({...input,land});
  let result, shares;
  if (offer.mode === 'ratio' && offer.distribution === 'separate') {
    if (!base.components) throw new Error('分開分配需要基本容積、獎勵與移轉的分項資料；只有總容積率無法拆算。');
    shares = {base:percent(offer.value,'基本容積地主分回比例'),bonus:base.components.bonus > 0 ? percent(offer.bonusShare,'獎勵地主分回比例') : 0,transfer:base.components.transfer > 0 ? percent(offer.transferShare,'移轉地主分回比例') : 0};
    const allocated = Object.entries(shares).reduce((sum,[key,share]) => sum + base.components[key] * share,0);
    const weighted = allocated / (input.source === 'area' ? base.totalSaleArea : base.far);
    result = calculateOffer(base,{mode:'ratio',value:weighted * 100});
  } else result = calculateOffer(base,offer);
  return {...result,land,mode:offer.mode,base,shares,source:base.source,certainty:offer.mode !== 'ratio' ? '提案承諾的面積' : base.source === 'area' ? '依提案面積表換算' : '依容積與係數估算'};
}

export function compareProposals(a,b) {
  if (!a || !b || a.error || b.error) return null;
  // Independent bounds: a difference range must remain valid even when each
  // proposal's final design falls at a different end of its own interval.
  const clean = value => Math.abs(value) < 1e-8 ? 0 : value;
  const min = clean(b.areaLow - a.areaHigh), max = clean(b.areaHigh - a.areaLow);
  finite([a.areaLow,a.areaHigh,b.areaLow,b.areaHigh]);
  if (min === 0 && max === 0) return {kind:'equal',low:0,high:0};
  if (min > 0) return {kind:'b-more',low:min,high:max};
  if (max < 0) return {kind:'a-more',low:-max,high:-min};
  return {kind:'overlap',low:min,high:max};
}
