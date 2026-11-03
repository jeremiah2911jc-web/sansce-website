// A text entry documents a source; it cannot establish the truth of that source.
export function meaningfulEvidence(value){
 const text=String(value??'').normalize('NFKC').trim();
 if(!text||/^(?:待確認|待補|未確認|不知道|無|沒有|不詳|測試|test|n\/?a|unknown|null|undefined|tbd)$/i.test(text))return false;
 const letters=text.match(/[\p{L}\p{N}]/gu)??[];
 return letters.length>=4&&/\p{L}/u.test(text)&&!/^(.)\1+$/u.test(letters.join(''));
}
export const evidenceHelp='請填文件名稱、日期或文號，以及適用地號、頁次或條文；例如「使用分區證明，115年11月3日，板橋○○段○號」。僅有文字尚須與原件核對。';
