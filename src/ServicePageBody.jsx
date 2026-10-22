import Readable from './Readable.jsx';
import {photoProps} from './photo-refresh.js';

function Copy({body}) {return body.split('\n\n').map((text,i)=><Readable as="p" key={i}>{text}</Readable>);}
function Section({page,index,className=''}) {const [title,body]=page.sections[index];return <section id={`section-${index+1}`} className={'service-copy-section '+className}><Readable as="h2">{title}</Readable><Copy body={body}/></section>;}
function Photo({name,alt,caption}){return <figure className="service-evidence-photo"><img loading="lazy" {...photoProps({src:`/images/reaudit-20261021/${name}.webp`,srcSet:`/images/reaudit-20261021/${name}-960.webp 960w, /images/reaudit-20261021/${name}.webp 1536w`,sizes:'(max-width:760px) 100vw, 50vw',width:1536,height:1024,alt})}/><figcaption>{caption}</figcaption></figure>;}
const menus={
 'urban-renewal':[[0,'委託與成果'],[3,'基地及程序'],[4,'各階段工作'],[11,'諮詢資料']],
 'dangerous-old-rebuilding':[[2,'資格與產權'],[3,'全體同意'],[4,'規劃與出資'],[6,'準備資料']],
 'joint-construction':[[0,'審閱範圍'],[3,'分配條件'],[5,'履約安排'],[7,'契約與方案版本']],
 'project-management':[[0,'委託範圍'],[2,'階段管理'],[4,'交付資料'],[5,'各方權責']]
};
export function ServicePageNavigation({page}) {return <nav className="service-task-nav" aria-label="服務重點導覽">{menus[page.path.split('/').pop()].map(([i,label])=><a key={i} href={`#section-${i+1}`}>{label}</a>)}</nav>;}
export default function ServicePageBody({page}) {
 const type=page.path.split('/').pop();
 if(type==='urban-renewal')return <div className="service-edition urban-edition">
  <div className="urban-commission"><Section page={page} index={0}/><Section page={page} index={1}/></div>
  <div className="urban-base"><Section page={page} index={3}/><Section page={page} index={2}/></div>
  <Section page={page} index={4} className="urban-work-phases"/>
  <div className="urban-rights"><Section page={page} index={5}/><Section page={page} index={6}/></div>
  <Section page={page} index={7}/><Section page={page} index={8}/><Section page={page} index={9}/>
  <div className="urban-responsibility"><Section page={page} index={10}/><Section page={page} index={11}/></div>
 </div>;
 if(type==='dangerous-old-rebuilding')return <div className="service-edition eligibility-edition">
  <div className="eligibility-record"><Section page={page} index={2}/><Section page={page} index={3}/></div>
  <div className="eligibility-visit"><Photo name="doorway-measure-v2" alt="現場人員以捲尺核對住宅門框內側的淨寬" caption="現況尺寸可供規劃參考；危老資格仍依建物、產權與安全評估文件核對。"/><div><Section page={page} index={0}/><Section page={page} index={1}/></div></div>
  <Section page={page} index={4}/><Section page={page} index={5}/><Section page={page} index={6} className="eligibility-preparation"/>
 </div>;
 if(type==='joint-construction')return <div className="service-edition contract-edition">
  <Section page={page} index={0}/><Section page={page} index={1}/>
  <div className="contract-review-register"><table><caption>合建提案逐項檢視</caption><thead><tr><th scope="col">核對事項</th><th scope="col">檢視內容與約定</th></tr></thead><tbody>{[2,3,4,5].map(i=><tr id={`section-${i+1}`} key={i}><th scope="row"><Readable as="h2">{page.sections[i][0]}</Readable></th><td><Copy body={page.sections[i][1]}/></td></tr>)}</tbody></table></div>
  <Section page={page} index={6}/><div className="contract-version"><Section page={page} index={7}/><Photo name="document-review-v3" alt="工作人員並排檢視兩份住宅圖面" caption="不同版本分別留存，提案、圖面與契約的採用條件須相互對照。"/></div>
 </div>;
 return <div className="service-edition management-edition"><Section page={page} index={0}/><Section page={page} index={1}/>
  <div className="management-record"><Section page={page} index={2} className="management-phases"/><Photo name="construction-record-v2" alt="現場人員在室內以檢查表核對窗框現況" caption="現場處理情形與待辦事項應有紀錄；施工及監造責任依各專業委託辦理。"/></div>
  <Section page={page} index={3} className="management-commission"/><Section page={page} index={4}/>
  <div className="management-boundaries"><Section page={page} index={5}/><Section page={page} index={7}/></div>
  <Section page={page} index={6}/><Section page={page} index={8}/>
 </div>;
}
