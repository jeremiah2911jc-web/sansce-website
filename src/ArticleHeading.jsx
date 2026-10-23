import React from 'react';

// Only headings bind words. Paragraphs keep normal CJK browser wrapping.
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-Hant', { granularity: 'word' }) : null;
const terms = /(權利變換計畫|事業計畫|由下往上分|一坪換一坪|可興建量體|都市更新|建築期限|交屋日期|使用執照|權利變換|共同負擔|差額價金|分配比例|土地信託|融資授權|專款專用|工程款|移轉棟數|棟數|都更|合建|房屋|建商|分回|分配|資訊|工程|銀行|融資|信託|施工|拆屋|續建|完工|房子|以前|需要)/g;
export default function ArticleHeading({ as: Tag = 'h2', children, ...props }) {
 const parts = String(children).split(terms).flatMap((part, index) => index % 2 ? [part] : segmenter ? [...segmenter.segment(part)].map(item => item.segment) : [part]);
 return <Tag {...props}>{parts.map((part, index) => (segmenter || new RegExp(terms.source).test(part)) && /[\p{L}\p{N}]/u.test(part) ? <span className="article-heading-word" key={index}>{part}</span> : part)}</Tag>;
}
