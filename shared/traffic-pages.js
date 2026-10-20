export const trafficPage = path => path?.startsWith('/insights/') ? '/insights' : path;
export function trafficPageGroups(rows = [], field) {
 const counts = new Map();
 for (const row of rows) {
  const path = trafficPage(row.path);
  counts.set(path, (counts.get(path) || 0) + Number(row[field] || 0));
 }
 return [...counts].map(([path, count]) => ({path, [field]:count})).sort((a,b)=>b[field]-a[field]||a.path.localeCompare(b.path));
}
