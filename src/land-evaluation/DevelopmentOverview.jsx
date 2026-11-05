import {EvaluationDisclosure} from './EvaluationDisclosure.jsx';
import './development-overview.css';
import {DevelopmentModel as LandScene} from './DevelopmentModel.jsx';
export const developmentTools={industrial:{title:"工業土地與廠房開發",family:"建築規劃",description:"核對工業用途、都更、立體化、容移及配置。"},land:{title:'土地用途與變更',family:'土地條件',description:'核對土地身分、預定用途與變更途徑。'},layout:{title:'透天配置與坪效',family:'建築規劃',description:'依基地條件，建立單棟或聯排配置並比較坪效。'},collective:{title:'集合住宅規劃',family:'建築規劃',description:'檢討開發強度、地上量體、戶數與地下停車配置。'},readjustment:{title:'市地重劃／區段徵收',family:'整體開發',description:'從公告計畫與本案權利，核對地主或收購的評估條件。'}};
const directions={land:{label:'土地用途與變更',lead:'土地用途與變更途徑',text:'依土地現況、使用分區、管制條件與預定用途，檢核現況使用及變更、許可的適用條件。',inputs:'地號與面積、現況使用、使用分區、預定用途',outputs:['逐筆土地的用途條件','候選途徑與必要文件'],action:'開始用途初核'},building:{label:'建築規劃與坪效',lead:'建築配置與面積分析',text:'提供透天、集合住宅與工業土地工具，分析建築量體、樓板面積、戶數、停車配置與坪效。',inputs:'基地面積、建蔽與容積、臨路及配置條件',outputs:['量體與面積構成','配置差異與條件檢核'],action:'開始建築規劃'},readjustment:{label:'市地重劃與區段徵收',lead:'計畫範圍與土地權利分析',text:'涵蓋公辦市地重劃、自辦市地重劃及區段徵收。依地主權益或開發收購主線，檢核公告文件、土地權利與分配條件。',inputs:'公告計畫、納入地號、持分與權利文件',outputs:['公告與修正文件對照','權利、分配面積及承接條件'],action:'開始計畫評估'}};
export function DevelopmentOverview({onEnter,canOperate=true,caseControls}){
 if(canOperate)return <DirectOverview onEnter={onEnter} caseControls={caseControls}/>;
 return <div className="dev-overview dev-overview-mobile"><section className="dev-hero" aria-labelledby="dev-title"><div className="dev-hero-copy"><p className="dev-kicker">三策開發評估工具</p><h1 id="dev-title">土地開發評估</h1><p className="dev-lead">土地條件、建築坪效<br/>與重劃徵收評估</p><p className="dev-hero-note">檢核土地用途與變更途徑，試算透天、集合住宅的開發面積、戶數與停車需求。<br/>整合公告計畫，核對市地重劃與區段徵收的地主分配、收購及權利承接條件。</p><p className="dev-computer-reminder" role="note"><strong>評估工具請使用電腦操作</strong><span>請以電腦開啟本頁，輸入條件並進行試算。</span></p><a className="dev-service-link" href="/services/development-evaluation">三策開發評估服務</a></div><figure className="dev-hero-figure"><LandScene kind="overview"/></figure></section></div>;
}
function DirectOverview({onEnter,caseControls}){
 const launch=(id)=>{const t=developmentTools[id];return <button type="button" className="studio-launch-button" key={id} onClick={()=>onEnter(id)}><strong>{(id==='industrial'?['工業土地與','廠房開發']:id==='readjustment'?['市地重劃／','區段徵收']:[t.title]).map(text=><span key={text}>{text}</span>)}</strong><small>{t.description}</small></button>;};
 return <div className="dev-overview studio-overview">
  <div className="studio-overview-top"><p className="dev-kicker">三策開發評估工具</p>{caseControls}</div>
  <section className="studio-overview-intro" aria-labelledby="dev-title"><div><h1 id="dev-title">土地開發評估</h1><p className="dev-lead">土地條件、建築坪效與重劃徵收評估</p><p className="dev-hero-note">檢核土地用途與變更途徑，試算透天、集合住宅的開發面積、戶數與停車需求。整合公告計畫，核對市地重劃與區段徵收的地主分配、收購及權利承接條件。</p><a className="dev-service-link" href="#development-evaluation-service">三策開發評估服務</a></div><figure><LandScene kind="overview"/><figcaption>既有與規劃量體、基地與臨路 · 概念示意</figcaption></figure></section>
  <section className="studio-launch" id="dev-directions" aria-labelledby="dev-direction-title"><h2 id="dev-direction-title" tabIndex={-1}>評估項目</h2><div className="studio-launch-groups"><section><h3>土地條件</h3>{launch('land')}</section><section className="studio-building-group"><h3>建築規劃</h3><div>{['industrial','collective','layout'].map(launch)}</div></section><section><h3>整體開發</h3>{launch('readjustment')}</section></div>
   <EvaluationDisclosure className="studio-entry-notes"><summary>準備資料與評估成果</summary><div className="studio-entry-columns">{Object.entries(directions).map(([id,d])=><section key={id}><h3>{d.label}</h3><p>{d.text}</p><dl><div><dt>準備資料</dt><dd>{d.inputs}</dd></div><div><dt>評估成果</dt><dd>{d.outputs.join('、')}</dd></div></dl></section>)}</div></EvaluationDisclosure>
  </section>

 </div>;
}
