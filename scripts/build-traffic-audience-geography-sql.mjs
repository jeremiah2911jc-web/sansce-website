import fs from 'node:fs';
const source=fs.readFileSync('docs/traffic/analytics-accuracy-schema.sql','utf8');
const fn=source.slice(source.indexOf('CREATE OR REPLACE FUNCTION public.sanze_traffic_audience_content'),source.indexOf('revoke all on function public.sanze_traffic_audience_content')).trim().replace(/;$/, '');
let fixed=fn.replace('), daily_geo as (','), chosen_geo as (').replace('), action_counts as (',`), daily_geo as (
 select visitor_id,day,case when geo->>'country' is not null and geo->>'country'<>'TW'
 then jsonb_build_object('country',geo->>'country','county',null,'city',null,'region','overseas') else geo end geo from chosen_geo
), action_counts as (`);
if(fixed===fn||!fixed.includes('from chosen_geo'))throw Error('Audience function did not match');
fs.writeFileSync('docs/traffic/foreign-country-statistics-schema.sql',`-- Preserve per-browser/day and per-page/topic deduplication before country grouping.\nbegin;\n${fixed};\nrevoke all on function public.sanze_traffic_audience_content(jsonb) from public,anon,authenticated;\ngrant execute on function public.sanze_traffic_audience_content(jsonb) to service_role;\ncommit;\n`);
