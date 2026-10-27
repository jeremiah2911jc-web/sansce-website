import {useEffect,useRef,useState} from 'react';
import {developmentService as service} from '../shared/development-service.js';
import useDevelopmentProse from './useDevelopmentProse.js';
import './development-editorial.css';
const scenarios=[
 {name:'購地評估',title:'把取得價格與開發條件一起試算',text:'依土地價格、交易付款、基地規模與預定產品，計算總投入、銷售收入及預估利潤；比較取得條件改變後，自備款與資金需求的差異。',inputs:'基地資料、交易條件、付款時程、產品與售價依據。',outputs:'取得條件比較、開發收支、各期資金需求及待查事項。'},
 {name:'合建投資',title:'比較分配條件對可售房地與收益的影響',text:'依合作分配、費用負擔與付款條件，試算開發方可售房地、工程及融資支出，分析不同提案對收益與追加資金的影響。',inputs:'基地資料、合建提案、分配約定、費用負擔及銷售條件。',outputs:'合作方案比較、可售房地估算、預估收益與資金缺口。'},
 {name:'自有土地開發',title:'比較自建、出售與不同產品的投入差異',text:'地主自行出資開發時，依土地、產品及銷售目標，分析興建支出、自備款及貸款需求，試算銷售延後或成本增加時的資金負擔。',inputs:'土地權利資料、開發目標、規劃條件與資金限制。',outputs:'產品與開發方案比較、投入資金、預估收益及條件變動分析。'},
];

const purposeHeadings=[
 ['把取得價格','與開發條件一起試算'],
 ['比較分配條件','對可售房地','與收益的影響'],
 ['比較自建、出售','與不同產品的投入差異'],
];
const focusItems=[
 ['取得價格與付款','產品與銷售收入','自備款與資金需求'],
 ['合作分配與費用','開發方可售房地','收益與追加資金'],
 ['自有土地與產品','興建支出與貸款','條件變動後的負擔'],
];
const scopes=[
 {label:'規模與配置',parts:['開發規模','與產品配置'],terms:[['基地條件','土地面積、用途與適用條件'],['配置比較','可建面積、戶數與車位'],['開發影響','可售面積、成本與銷售收入']],result:'比較不同產品配置的面積與收支差異'},
 {label:'收益與分配',parts:['成本收益','與合作分配'],terms:[['取得方式','購地、合建或自有土地'],['投入與收入','土地、營建、銷售及融資費用'],['分配與收益','可售房地與預估開發利潤']],result:'依取得與合作條件，估算開發投入及收益'},
 {label:'融資與現金流',parts:['融資需求','與現金流'],terms:[['支出時程','取得付款與工程支出'],['收入時程','銷售收款與貸款撥付'],['資金需求','各期缺口、自備款與利息']],result:'把各期支出與收入，連同資金需求比較'},
 {label:'方案與報告',parts:['方案比較','與評估報告'],terms:[['比較條件','售價、成本與工期'],['條件變動','售價下降、成本增加與工期延長'],['評估依據','採用資料、估算假設與待查條件']],result:'列出方案差異、收益變化與追加資金'},
];
const preparation=[
 ['基地與權利資料','基地位置、土地面積與權利資料'],
 ['取得與合作條件','購地、合建或自有土地的取得條件'],
 ['產品與開發目標','預定用途、產品配置與開發目標'],
 ['規劃與資金資料','目前規劃、售價、成本及資金資料'],
];
function Heading({as:Tag='h2',parts,...props}){return <Tag {...props}>{parts.map(part=><span className="de-title-phrase" key={part}>{part}</span>)}</Tag>}
function Prose({children,...props}){return <p data-de-prose {...props}>{children}</p>}
function Contact(){return <a className="de-contact" href={service.contact}>洽詢三策</a>}
function tabKeys(e,index,total,choose,prefix){let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%total;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index+total-1)%total;if(e.key==='Home')next=0;if(e.key==='End')next=total-1;if(next!==undefined){e.preventDefault();choose(next);document.getElementById(prefix+next)?.focus();}}
export default function DevelopmentServicePage(){
 const [purpose,setPurpose]=useState(0),[scope,setScope]=useState(0),[active,setActive]=useState(true);const root=useRef(null);const current=scenarios[purpose];
 useDevelopmentProse(root,purpose+':'+scope);
 useEffect(()=>{const update=()=>setActive(!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return <div ref={root} className="development-service-page development-editorial" data-motion-active={active?'true':'false'}>
  <nav className="wrap de-breadcrumb" aria-label="所在位置"><a href="/">首頁</a><span>／</span><span>開發評估服務</span></nav>
  <section className="wrap de-hero" aria-labelledby="development-service-title">
   <div className="de-hero-copy"><p className="de-kicker">{service.name}</p><Heading as="h1" id="development-service-title" parts={service.titlePhrases}/><Prose className="de-lead">{service.paragraphs[0]}</Prose><div className="de-hero-actions"><Contact/><a className="de-text-link" href="#development-purpose">選擇開發目的</a></div></div>
   <figure className="de-hero-image"><img src="/images/development-service-20261028/site-context.webp" srcSet="/images/development-service-20261028/site-context-800.webp 800w, /images/development-service-20261028/site-context.webp 1536w" sizes="(max-width:760px) calc(100vw - 40px), 50vw" width="1536" height="1024" alt="高視角下的住宅街廓、停車空地、道路與河岸綠地" fetchPriority="high"/><figcaption><span>基地條件</span><span>產品配置</span><span>投資與資金</span></figcaption></figure>
  </section>
  <section id="development-purpose" className="de-purpose-band" aria-labelledby="development-purpose-title"><div className="wrap">
   <header className="de-section-heading"><div><p className="de-kicker">取得方式與投資目的</p><Heading id="development-purpose-title" parts={['從取得條件，','算到各期資金需求']}/></div><div className="de-purpose-intro"><Prose>同一基地可依不同取得方式、產品與合作條件分案比較。</Prose><Prose>地主自行出資興建，亦可依開發目的委託本項服務。</Prose></div></header>
   <div className="de-purpose-tabs" role="tablist" aria-label="選擇開發目的">{scenarios.map((item,i)=><button type="button" role="tab" id={'de-purpose-tab-'+i} aria-selected={purpose===i} aria-controls={'de-purpose-panel-'+i} tabIndex={purpose===i?0:-1} onClick={()=>setPurpose(i)} onKeyDown={e=>tabKeys(e,i,3,setPurpose,'de-purpose-tab-')} key={item.name}>{item.name}</button>)}</div>
   <div className="de-purpose-panel" id={'de-purpose-panel-'+purpose} role="tabpanel" aria-labelledby={'de-purpose-tab-'+purpose} tabIndex={0} key={purpose}>
    <div className="de-purpose-story"><Heading as="h3" parts={purposeHeadings[purpose]}/><Prose>{current.text}</Prose><ul className="de-purpose-focus" aria-label="本項分析重點">{focusItems[purpose].map(text=><li key={text}>{text}</li>)}</ul></div>
    <div className="de-purpose-delivery"><div><h4>準備資料</h4><Prose>{current.inputs}</Prose></div><div><h4>依委託可提出</h4><Prose>{current.outputs}</Prose></div><a className="de-text-link" href={service.contact}>洽詢三策</a></div>
   </div>
  </div></section>
  <section id="development-capabilities" className="wrap de-capabilities" aria-labelledby="development-capabilities-title">
   <header className="de-section-heading"><div><p className="de-kicker">委託評估內容</p><Heading id="development-capabilities-title" parts={['規模、收益與資金，','一併比較開發方案']}/></div><div><Prose>{service.paragraphs[1]}</Prose></div></header>
   <div className="de-capability-layout"><div className="de-scope-tabs" role="tablist" aria-label="查閱評估內容" aria-orientation="vertical">{scopes.map((item,i)=><button type="button" role="tab" id={'de-scope-tab-'+i} aria-selected={scope===i} aria-controls={'de-scope-panel-'+i} tabIndex={scope===i?0:-1} onClick={()=>setScope(i)} onKeyDown={e=>tabKeys(e,i,4,setScope,'de-scope-tab-')} key={item.label}><span>{item.label}</span><span className="de-scope-state" aria-hidden="true">{scope===i?'－':'＋'}</span></button>)}</div>
    {scopes.map((view,i)=><div className="de-scope-paper" id={'de-scope-panel-'+i} role="tabpanel" aria-labelledby={'de-scope-tab-'+i} tabIndex={0} hidden={scope!==i} key={i}><div className="de-scope-copy"><Heading as="h3" parts={view.parts}/><Prose>{service.scopes[i][1]}</Prose></div><dl className="de-analysis-relationship" aria-label="分析資料與用途">{view.terms.map(([title,text])=><div key={title}><dt>{title}</dt><dd data-de-prose>{text}</dd></div>)}</dl><p className="de-scope-result" data-de-prose>{view.result}</p></div>)}
   </div>
   <div className="de-audience-note"><span>委託對象與用途</span><Prose>{service.paragraphs[2]}</Prose></div>
  </section>
  <section className="de-commission-band" aria-labelledby="development-commission-title"><div className="wrap de-commission-layout"><div className="de-commission-copy"><p className="de-kicker">委託與評估依據</p><Heading id="development-commission-title" parts={['投資方案有依據，','資金需求有時程']}/><Prose>三策依個案資料完成成本、收益、融資與現金流試算，於委託前議定比較方案、分析期間、報告內容與費用。</Prose><Prose>估算採用的規劃、售價、成本與貸款條件，於評估中分別列明。</Prose><Prose>委託人、分析目的、資料使用與專業分工在承接前確認；建築設計、估價、法律及金融機構核貸，依個案另由相關專業單位辦理。</Prose><Contact/></div>
   <div className="de-preparation"><h3>先備妥基地與投資條件</h3><div>{preparation.map(([title,text])=><details key={title}><summary>{title}<span aria-hidden="true" className="de-disclosure-mark"/></summary><Prose>{text}</Prose></details>)}</div><a className="de-text-link" href="/land-evaluation">使用土地開發評估工具</a><Prose className="de-tool-note">可先檢核用途、建築配置及開發面積，再依個案委託成本與資金分析。</Prose></div>
  </div></section>
  <section className="wrap de-owner-signpost" aria-labelledby="de-owner-title"><div><h2 id="de-owner-title">地主提案比較與社區重建</h2><Prose>收到建商提案、比較分回房地與補款，或需協調地主、更新會及案件進度，可查閱地主與社區服務。</Prose></div><a className="de-text-link" href="/consulting">地主與社區服務</a></section>
 </div>;
}
