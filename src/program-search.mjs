export function programStatus(s) {
  const status = s.status || '';
  if (/已.{0,12}(截止|額滿|用罄|停止受理)|名額已滿|原.*受理期.*屆滿|本次.*截止/.test(status)) return 'closed';
  if (/待公告|待確認|須確認|未確認|另行確認/.test(status)) return 'confirm';
  if (/受理至|受理期間|收件至|報核期限|申請至|提案至|提案公告.*至/.test(status)) return 'announced';
  return 'system';
}
export const programStatusLabels={all:'全部受理狀態',announced:'已列受理期限',closed:'已截止、額滿或原期屆滿',confirm:'受理或經費須確認',system:'制度與程序條件'};
export function matchesProgram(s, query, status='all') {
 const text=JSON.stringify(s).normalize('NFKC').toLowerCase();
 return query.trim().normalize('NFKC').toLowerCase().split(/\s+/).every(term=>text.includes(term)) && (status==='all'||programStatus(s)===status);
}
