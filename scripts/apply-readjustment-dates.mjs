export const READJUSTMENT_DATES_VERSION='readjustment-dates.2026-11-03.v1';
export function applyReadjustmentDates(source){
 if(source.includes('/* readjustment-case-dates */'))return source;
 const old='var dateReady = (date, referenceDate = REVIEWED_AT) => validDate(date) && validDate(referenceDate) && date <= referenceDate && date <= REVIEWED_AT;';
 if(!source.includes(old))throw Error('Readjustment date adapter: expected date gate not found');
 const next=source.replace(old,`/* readjustment-case-dates */
var dateReady = (date, referenceDate = REVIEWED_AT) => validDate(date) && validDate(referenceDate) && date <= referenceDate && date <= new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());`);
 const message=/else if \(date && !dateReady\(date, p\.referenceDate\)\) errors\.push\(label \+ "[^"\n]*"\);/;
 if(!message.test(next))throw Error('Readjustment date adapter: expected date message not found');
 return next.replace(message,'else if (date && !dateReady(date, p.referenceDate)) errors.push(label + "不得晚於評估基準日或今天。");');
}
