import {useEffect,useRef,useState} from 'react';
import Readable from './Readable.jsx';
import {photoProps} from './photo-refresh.js';

function Copy({body}) {return body.split('\n\n').map((text,i)=><Readable as="p" key={i}>{text}</Readable>);}
function Section({page,index}) {const [title,body]=page.sections[index];return <section id={`section-${index+1}`} className="service-copy-section"><Readable as="h3">{title}</Readable><Copy body={body}/></section>;}
function Photo({name,alt,caption,directory='reaudit-20261021'}){return <figure className="service-evidence-photo"><img loading="lazy" {...photoProps({src:`/images/${directory}/${name}.webp`,srcSet:`/images/${directory}/${name}-960.webp 960w, /images/${directory}/${name}.webp 1536w`,sizes:'(max-width:760px) 100vw, 60vw',width:1536,height:1024,alt})}/><figcaption>{caption}</figcaption></figure>;}
const chapters={
 'urban-renewal':[['委託與成果',[0,1]],['基地與程序',[3,2]],['工作與進度',[4,8]],['合作與分配',[5,6,7,9]],['分工與準備',[10,11]]],
 'dangerous-old-rebuilding':[['資格與共識',[2,3]],['評估工作',[0,1]],['重建安排',[4,5]],['準備資料',[6]]],
 'joint-construction':[['委託範圍',[0,1]],['條件比較',[2,3,4,5]],['提案與文件',[6,7]]],
 'project-management':[['工作與委託',[0,1]],['階段與程序',[2,3]],['交付資料',[4]],['權責與費用',[5,7,6]],['準備文件',[8]]]
};
export function ServicePageNavigation({page}) {
 const items=chapters[page.path.split('/').pop()];
 const [active,setActive]=useState(0);const navigation=useRef(null);
 useEffect(()=>{
  const nav=navigation.current,layout=nav?.closest('.service-reading-layout'),header=document.querySelector('.sx-header');
  if(!nav||!layout)return;
  let frame=0;
  const update=()=>{
   frame=0;
   const headerHeight=header?.getBoundingClientRect().height||0;
   const limit=headerHeight+nav.getBoundingClientRect().height+18;
   const pagePadding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
   layout.style.setProperty('--service-anchor-margin',`${Math.max(0,limit-pagePadding)}px`);
   const readingLine=Math.max(limit,Math.min(limit+160,innerHeight/3));
   let current=0;
   items.forEach((_,i)=>{if(document.getElementById(`service-chapter-${i}`)?.getBoundingClientRect().top<=readingLine+2)current=i;});
   setActive(current);
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const observer=new ResizeObserver(queue);observer.observe(nav,{box:'border-box'});if(header)observer.observe(header,{box:'border-box'});
  update();window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);layout.style.removeProperty('--service-anchor-margin');};
 },[items]);
 return <nav ref={navigation} className="service-task-nav" aria-label="服務重點導覽">{items.map(([label],i)=><a key={label} href={`#service-chapter-${i}`} onClick={()=>setActive(i)} aria-current={active===i?'location':undefined}>{label}</a>)}</nav>;
}

export default function ServicePageBody({page}) {
 const type=page.path.split('/').pop();
 return <div className={'service-edition chapter-edition chapter-'+type}>{chapters[type].map(([title,indices],chapter)=><section className="service-chapter" id={`service-chapter-${chapter}`} key={title} aria-labelledby={`service-chapter-heading-${chapter}`}>
  <header className="service-chapter-identity"><h2 id={`service-chapter-heading-${chapter}`}>{title}</h2></header>
  <div className="service-chapter-content">
   {type==='dangerous-old-rebuilding'&&chapter===1&&<Photo name="records-34" directory="design-audit-20261026" alt="男女顧問分別核對建物照片與記錄基地資料" caption="比對建物現況照片與圖面，確認資格初評需補齊的資料。"/>}
   {type==='joint-construction'&&chapter===1?<div className="contract-review-register"><table><caption>合建提案逐項檢視</caption><thead><tr><th scope="col">核對事項</th><th scope="col">檢視內容與約定</th></tr></thead><tbody>{indices.map(i=><tr id={`section-${i+1}`} key={i}><th scope="row"><Readable as="h3">{page.sections[i][0]}</Readable></th><td><Copy body={page.sections[i][1]}/></td></tr>)}</tbody></table></div>:indices.map(i=><Section page={page} index={i} key={i}/>)}
   {type==='joint-construction'&&chapter===2&&<Photo name="document-review-v3" alt="工作人員並排檢視兩份住宅圖面" caption="不同版本分別留存，提案、圖面與契約的採用條件須相互對照。"/>}
   {type==='project-management'&&chapter===1&&<Photo name="construction-record-v2" alt="現場人員在室內以檢查表核對窗框現況" caption="現場處理情形與待辦事項應有紀錄；施工及監造責任依各專業委託辦理。"/>}
  </div>
 </section>)}</div>;
}
