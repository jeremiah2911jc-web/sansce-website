import {developmentService as service} from '../shared/development-service.js';
import './development-service.css';

function ServiceTitle({as:Tag,id}) {
  return <Tag id={id}>{service.titlePhrases.map(phrase=><span className="ds-title-phrase" key={phrase}>{phrase}</span>)}</Tag>;
}

export function DevelopmentServiceContact() {
  return <a className="ds-contact" href={service.contact} target="_blank" rel="noopener noreferrer">洽詢三策</a>;
}

export function DevelopmentServiceEntry() {
  return <section className="ds-entry" aria-labelledby="home-development-service-title">
    <div className="ds-entry-heading"><p>三策開發評估服務</p><ServiceTitle as="h3" id="home-development-service-title"/></div>
    <div className="ds-entry-body"><p>{service.paragraphs[2]}</p><ul aria-label="開發評估服務項目"><li>開發規模與產品配置</li><li>成本收益與地主分配</li><li>融資需求與現金流</li></ul><div className="ds-actions"><DevelopmentServiceContact/><a className="ds-detail" href={service.path}>查看服務內容</a></div></div>
  </section>;
}

export default function DevelopmentService({className=''}) {
  return <section id="development-evaluation-service" className={'ds-service '+className} aria-labelledby="development-service-title">
    <div className="ds-service-copy"><p className="ds-kicker">{service.name}</p><ServiceTitle as="h2" id="development-service-title"/><div className="ds-service-prose">{service.paragraphs.map(text=><p key={text}>{text}</p>)}</div><div className="ds-actions"><DevelopmentServiceContact/></div></div>
    <div className="ds-service-scope"><p className="ds-scope-label">委託評估內容</p><dl>{service.scopes.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl></div>
  </section>;
}
