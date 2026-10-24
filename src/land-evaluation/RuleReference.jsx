/** Static legal references are reading material, separate from case evidence. */
export function RuleReference({source}){
 if(!source)return null;
 const match=source.match(/^(.*?)[：:]\s*(https?:\/\/\S+)$/);
 return <div className="le-rule-reference"><span>法規依據</span><p>{match?<a href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a>:source}</p></div>;
}
