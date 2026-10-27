import ArticleHeading from './ArticleHeading.jsx';
import './policy-editorial.css';
import {photoProps,photoSourceProps} from './photo-refresh.js';

export function InsightHero({ page }) {
  if (!page.visual?.hero) return null;
  const { hero, alt } = page.visual;
  return <header className={"sanze-feature-cover wrap" + (page.visual.longTitle ? " feature-cover-long" : "") + (page.visual.compactTitle ? " feature-cover-compact" : "") + (page.visual.storyPhotos ? " feature-shortfall-cover" : "") + (page.visual.approvalCover ? " feature-approval-cover" : "")}><div className="sanze-feature-copy"><span className="feature-eyebrow">SANZE PERSPECTIVES</span><span className="feature-category">{page.label}<i aria-hidden="true" /></span>{page.visual.storyPhotos ? <h1>{page.visual.titleLines.map((line,i)=><ArticleHeading as="span" className="shortfall-title-line" key={i}>{line}</ArticleHeading>)}</h1> : <h1>{(page.visual.titleLines || [page.title]).map((line, i, lines) => i === lines.length - 1 ? <em key={i}><ArticleHeading as="span">{line}</ArticleHeading></em> : <ArticleHeading as="span" key={i}>{line}</ArticleHeading>)}</h1>}<p>{page.visual.deck || page.lead}</p><div className="feature-author"><span aria-hidden="true">三策</span><div>三策專案管理顧問有限公司<small>開發實務・地主權益・合建契約</small></div></div></div><div className="sanze-feature-image"><picture><source {...photoSourceProps({ srcSet: `${hero.small} 768w, ${hero.large} 1536w`, sizes: page.visual.storyPhotos ? "(max-width: 760px) 100vw, 1160px" : "(max-width: 700px) 100vw, 660px" })} /><img fetchpriority="high" decoding="async" {...photoProps({ src: hero.large, alt: alt, style: page.visual.heroPosition ? { objectPosition: page.visual.heroPosition } : undefined, width: "1536", height: "1024" })} /></picture></div></header>;
}

function DetailPhoto({ page }) {
  const detail = page.visual?.detail;
  return detail ? <img loading="lazy" {...photoProps({ src: detail.src, alt: detail.alt, width: detail.width, height: detail.height })} /> : null;
}

export function InsightBody({ page }) {
  if (page.visual.policyEdition) return <PolicyEdition page={page} />;
  return <div className="feature-reading-grid"><div className="feature-reading-main">{page.visual.deck && <p className="feature-original-lead">{page.lead}</p>}{page.sections.map(([title, body], index) => <InsightSection key={index} page={page} title={title} body={body} index={index} />)}</div><aside className="feature-reading-aside"><div className="feature-aside-sticky"><DetailPhoto page={page} /><div className="feature-aside-note"><span>本期焦點</span><p>{page.visual.sideTitle?.map((line, i) => <span key={i} className="feature-side-line">{line}</span>)}</p><nav aria-label="文章閱讀脈絡">{(page.visual.navigation || page.sections.map(([title], i) => [title, '#section-' + (i + 1)])).map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav></div></div></aside></div>;
}

export function InsightSection({ page, title, body, index }) {
  return <section id={'section-' + (index + 1)} className="sanze-feature-section">
    {title && <ArticleHeading>{title}</ArticleHeading>}
    <div className="feature-section-copy">{body.split('\n\n').map((paragraph, j) => <ArticleParagraph key={j} page={page} paragraph={paragraph} />)}<InsightInsert page={page} index={index} />{page.visual.storyComparison?.afterSection === index && <ArticleComparison comparison={page.visual.storyComparison} />}{page.visual.storyPhotos?.filter(photo => photo.afterSection === index).map(photo => <figure className="insight-story-photo" key={photo.src}><picture><source srcSet={`${photo.small} 768w, ${photo.src} 1536w`} sizes="(max-width: 760px) 100vw, 760px"/><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy"/></picture><figcaption>{photo.caption}</figcaption></figure>)}{page.visual.inlinePhoto?.afterSection===index && <figure className="insight-inline-photo"><picture><source srcSet={`${page.visual.inlinePhoto.small} 960w, ${page.visual.inlinePhoto.src} 1536w`} sizes="(max-width:760px) 100vw, 820px"/><img src={page.visual.inlinePhoto.src} width="1536" height="1024" loading="lazy" alt={page.visual.inlinePhoto.alt}/></picture><figcaption>{page.visual.inlinePhoto.caption}</figcaption></figure>}{index === 1 && page.visual.detail && <figure className="feature-mobile-detail"><DetailPhoto page={page} /></figure>}</div>
  </section>;
}

function PolicyEdition({ page }) {
  const { photos, notes } = page.visual.policyEdition;
  return <div className="policy-edition">{page.sections.map(([title, body], index) => <div className="policy-chapter" key={index}>
    <div className="policy-chapter-grid"><InsightSection page={page} title={title} body={body} index={index} />
      {notes[index] && <aside className="policy-margin"><p>{notes[index]}</p></aside>}
    </div>
    {photos.filter(photo => photo.afterSection === index).map(photo => <figure className={'policy-photo policy-photo-' + photo.layout} key={photo.src}>
      <picture><source srcSet={`${photo.small} 768w, ${photo.src} 1536w`} sizes="(max-width:760px) 100vw, 880px" /><img src={photo.src} alt={photo.alt} width="1536" height="1024" loading="lazy" /></picture>
      <figcaption><p>{photo.caption}</p><a href={'#section-' + (index + 2)}>接續閱讀</a></figcaption>
    </figure>)}
  </div>)}</div>;
}

export function ArticleParagraph({ page, paragraph }) {
  const comparison = page.comparisons?.find((item) => item.marker === paragraph);
  if (comparison) return <ArticleComparison comparison={comparison} />;
  if (paragraph === '[比較表]' && page.comparison) return <ArticleComparison comparison={page.comparison} />;
  const emphasis = page.emphasis?.find((text) => paragraph.includes(text));
  if (!emphasis) return <p><ArticleText page={page} text={paragraph} /></p>;
  const [before, after] = paragraph.split(emphasis);
  return <p className={page.visual && !before && !after ? 'insight-pullquote' : undefined}>{before}<strong>{emphasis}</strong>{after}</p>;
}

function ArticleText({ page, text }) {
  return text.split(/(\[\d+\])/g).map((part, index) => {
    const match = part.match(/^\[(\d+)\]$/),source = match && page.sources?.[Number(match[1]) - 1];
    return source ? <sup key={index} className="article-reference"><a href={source[1]} target="_blank" rel="noopener noreferrer" aria-label={source[0]}>{part}</a></sup> : part;
  });
}

function ArticleComparison({ comparison }) {
  return <figure className={'article-comparison' + (comparison.headers.length > 3 || comparison.mobileRows ? ' article-comparison-detailed' : '') + (comparison.afterSection !== undefined ? ' article-shortfall-comparison' : '')}><figcaption>{comparison.caption || '同一評價條件下的方案比較'}</figcaption><p>{comparison.note || '假設數字，僅說明分配關係'}</p><table><thead><tr>{comparison.headers.map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{comparison.rows.map(([label, ...values]) => <tr key={label}><th scope="row">{label}</th>{values.map((value, index) => <td key={index} data-label={comparison.headers[index + 1]}>{value}</td>)}</tr>)}</tbody></table></figure>;
}

function PlanDoor({ x, y, width = 36 }) {
  return <g stroke="#263d4b" strokeWidth="1.4" fill="none">
    <path d={`M${x},${y + 3} V${y - width}`} />
    <path d={`M${x},${y - width} A${width},${width} 0 0 1 ${x + width},${y}`} strokeWidth="1" />
    <circle cx={x} cy={y} r="1.5" fill="#263d4b" stroke="none" />
  </g>;
}

function ShopPlan({ narrow = false }) {
  // One common coordinate scale and street datum; both shops have equal area.
  const x = narrow ? 74 : 90,y = narrow ? 40 : 130,w = narrow ? 160 : 240,h = 310 - y;
  const doorX = narrow ? 130 : 184;
  return <svg viewBox={narrow?"0 0 420 405":"0 100 420 305"} role="img" aria-label={narrow ? '較窄面寬、較深進深的店面，右側為獨立住宅入口' : '較寬面寬、較淺進深的店面'}>
    <rect x={x} y={y} width={w} height={h} fill="#ede9e1" stroke="#263d4b" strokeWidth="4" />
    <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="none" stroke="#8b969c" strokeWidth="0.7" />
    <path d={`M${x + 4},310 H${doorX} M${doorX + 36},310 H${x + w - 4}`} stroke="#aa7659" strokeWidth="3" />
    <rect x={doorX} y="304" width="36" height="10" fill="#f6f3ec" />
    <PlanDoor x={doorX} y={310} />
    <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fontSize="17" fill="#263d4b">店面</text>
    <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fontSize="19" fill="#465761">相同面積</text>
    {narrow && <g><rect x="246" y="40" width="84" height="270" fill="#f1ebe2" stroke="#63737d" strokeWidth="4" /><rect x="250" y="44" width="76" height="262" fill="none" stroke="#b5b6af" strokeWidth="0.7" /><rect x="270" y="304" width="36" height="10" fill="#f6f3ec" /><PlanDoor x={270} y={310} /><text x="288" y="157" textAnchor="middle" fontSize="19" fill="#465761">住宅</text><text x="288" y="177" textAnchor="middle" fontSize="19" fill="#465761">入口</text></g>}
    <g stroke="#647780" strokeWidth="0.8" fill="none">
      <path d={`M${x},326 V347 M${x + w},326 V347 M${x},339 H${x + w}`} />
      <path d={`M${x - 3},343 l6,-8 M${x + w - 3},343 l6,-8`} />
      <path d={`M${x - 12},${y} H${x - 30} M${x - 12},310 H${x - 30} M${x - 23},${y} V310`} />
      <path d={`M${x - 27},${y + 3} l8,-6 M${x - 27},313 l8,-6`} />
    </g>
    <text x={x + w / 2} y="359" textAnchor="middle" fontSize="19" fill="#465761">面寬</text>
    <text x={x - 39} y={y + h / 2} textAnchor="middle" fontSize="19" fill="#465761" transform={`rotate(-90 ${x - 39} ${y + h / 2})`}>進深</text>
    <path d="M44,374 H376" stroke="#aeb7ba" strokeWidth="1" />
    <text x="210" y="397" textAnchor="middle" fontSize="19" fill="#465761">街道</text>
  </svg>;
}

export function InsightInsert({ page, index }) {
  if (page.visual?.insert !== 'shop-frontage' || index !== 2) return null;
  return <figure className="insight-space-study" aria-labelledby="shop-study-title"><div className="space-study-kicker">店面條件觀察</div><h3 id="shop-study-title">同樣分回一樓，<br />商業條件可能不同。</h3><div className="space-study-pair"><div><ShopPlan /><p>配置 A｜面寬較寬</p></div><div><ShopPlan narrow /><p>配置 B｜進深較深</p></div></div><figcaption>同面積、不同面寬與進深的概念示意，非個案設計圖。兩圖採相同比例及臨街基準，住宅入口獨立設置；實際配置仍須依建築圖面評估。</figcaption></figure>;
}

export function ArticleReadingIndex({page}) {
 return <details className="article-reading-index wrap"><summary>本文重點與段落目錄<span aria-hidden="true" /></summary><nav aria-label="本文段落">{page.sections.map(([title],i)=>title ? <a key={i} href={'#section-'+(i+1)}>{title}</a> : null)}</nav></details>;
}
