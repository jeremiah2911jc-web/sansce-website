import {serviceAudiences} from '../shared/service-audiences.js';
import './service-audiences.css';

export default function HomeServicePaths(){return <section className="audience-paths sx-wrap" aria-labelledby="audience-paths-title"><div className="audience-paths-intro"><p>三策的服務</p><h2 id="audience-paths-title">依委託目的，<br/>選擇服務</h2></div><div className="audience-paths-options">{serviceAudiences.map(service=><article className={'audience-path audience-path-'+service.id} key={service.id}><h3><a href={service.path}>{service.name}</a></h3><p className="audience-path-focus">{service.summary}</p><p>{service.detail}</p><div className="audience-path-actions"><a className="audience-service-link" href={service.path}>查看服務內容</a><a className="audience-tool-link" href={service.tool}>{service.toolLabel}</a></div></article>)}</div></section>}

export function ServiceInquiryLinks({onNavigate}){return <nav className="audience-inquiry-links" aria-label="選擇諮詢服務">{serviceAudiences.map(service=><a key={service.id} href={service.contact} onClick={onNavigate}><strong>{service.name}</strong><span>{service.summary}</span></a>)}</nav>}
