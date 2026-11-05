import './development-overview.css';
import {DevelopmentModel as LandScene} from './DevelopmentModel.jsx';
export const developmentTools={industrial:{title:"工業土地與廠房開發",family:"建築規劃",description:"依工業區使用管制，試算廠房樓板、容積獎勵與容積移轉。"},land:{title:'土地用途與變更',family:'土地條件',description:'依都市計畫使用分區或非都市土地使用地編定，檢視預定用途及變更條件。'},layout:{title:'透天配置與坪效',family:'建築規劃',description:'依基地條件，建立單棟或聯排配置並比較坪效。'},collective:{title:'集合住宅規劃',family:'建築規劃',description:'試算單棟或分棟樓板、房屋可售面積、戶數與車位。'},readjustment:{title:'市地重劃／區段徵收',family:'整體開發',description:'依重劃或徵收計畫，核對地主分配面積、補償或收購可承接的權利。'}};
export function DevelopmentOverview({onEnter,canOperate=true,caseControls}){
 if(canOperate)return <DirectOverview onEnter={onEnter} caseControls={caseControls}/>;
 return <div className="dev-overview dev-overview-mobile"><section className="dev-hero" aria-labelledby="dev-title"><div className="dev-hero-copy"><p className="dev-kicker">三策開發評估工具</p><h1 id="dev-title">土地開發評估</h1><p className="dev-lead">土地條件、建築坪效<br/>與重劃徵收評估</p><p className="dev-hero-note">檢核土地用途與變更途徑，試算透天、集合住宅的開發面積、戶數與停車需求。<br/>依重劃計畫書或區段徵收計畫書，核對地主分配與收購權利。</p><p className="dev-computer-reminder" role="note"><strong>評估工具請使用電腦操作</strong><span>請以電腦開啟本頁，輸入條件並進行試算。</span></p><a className="dev-service-link" href="/services/development-evaluation">三策開發評估服務</a></div><figure className="dev-hero-figure"><LandScene kind="overview"/></figure></section></div>;
}
function DirectOverview({onEnter,caseControls}){
 const launch=(id)=>{const t=developmentTools[id];return <button type="button" className="studio-launch-button" key={id} onClick={()=>onEnter(id)}><strong>{(id==='industrial'?['工業土地與','廠房開發']:id==='readjustment'?['市地重劃／','區段徵收']:[t.title]).map(text=><span key={text}>{text}</span>)}</strong><small>{t.description}</small></button>;};
 return <div className="dev-overview studio-overview">
  <div className="studio-overview-top"><p className="dev-kicker">三策開發評估工具</p>{caseControls}</div>
  <section className="studio-overview-intro" aria-labelledby="dev-title"><div><h1 id="dev-title">土地開發評估</h1><p className="dev-lead">土地條件、建築坪效與重劃徵收評估</p><p className="dev-hero-note">檢核土地用途與變更途徑，試算透天、集合住宅的開發面積、戶數與停車需求。依重劃計畫書或區段徵收計畫書，核對地主分配與收購權利。</p><a className="dev-service-link" href="#development-evaluation-service">三策開發評估服務</a></div><figure><LandScene kind="overview"/><figcaption>既有與規劃量體、基地與臨路 · 概念示意</figcaption></figure></section>
  <section className="studio-launch" id="dev-directions" aria-labelledby="dev-direction-title"><h2 id="dev-direction-title" tabIndex={-1}>評估項目</h2><div className="studio-launch-groups"><section><h3>土地條件</h3>{launch('land')}</section><section className="studio-building-group"><h3>建築規劃</h3><div>{['industrial','collective','layout'].map(launch)}</div></section><section><h3>整體開發</h3>{launch('readjustment')}</section></div>
  </section>

 </div>;
}
