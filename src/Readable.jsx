import React, { Children, cloneElement, isValidElement } from 'react';

// Keep the published copy intact; only group its mobile line-break boundaries.
const mobileTitles = {
  "容積提高到300%，重建效益須連同回饋與成本評估": ["容積提高到300%，重建效益須連同回饋與成本評估"],
  '全案管理：都更與重建的工作，如何分工與推進？': ['全案管理：', '都更與重建的工作，', '如何分工與推進？'],
  "一坪換一坪，仍須核對重建後的居住空間": ["一坪換一坪，仍須核對重建後的居住空間"],
  "都更選屋爭議，應依法處理異議與既有選配結果": ["都更選屋爭議，","應依法處理異議","與既有選配結果"],
  '都更怎麼開始？先看條件、流程與分配。': ['都更怎麼開始？', '先看條件、', '流程與分配。'],
  '協調專業分工，協助案件往前推動。': ['協調專業分工，', '協助案件往前推動。'],
  '您的案子，需要什麼協助？': ['您的案子，', '需要什麼協助？'],
  '了解案子卡在哪裡，討論接下來怎麼做。': ['了解案子卡在哪裡，', '討論接下來怎麼做。'],
  '以信實立本，以專業成事。': ['以信實立本，', '以專業成事。'],
  '想找三策協助，該怎麼開始？': ['想找三策協助，', '該怎麼開始？'],
  '都市更新顧問：評估更新條件與推動方式': ['都市更新顧問：', '評估更新條件', '與推動方式'],
  '危老重建評估：確認適用資格與所有權人意願': ['危老重建評估：', '確認適用資格', '與所有權人意願'],
  '合建顧問：核對分配、費用與契約條件': ['合建顧問：', '核對分配、費用', '與契約條件'],
  '都市更新全案管理：協調分工，追蹤各階段進度': ['都市更新全案管理：', '協調分工，', '追蹤各階段進度'],
  "公辦都更仍須核對財務、共同負擔與地主分配": ["公辦都更仍須核對","財務、共同負擔","與地主分配"],
  "都更同意書簽署後，計畫變更仍須依法處理": ["都更同意書簽署後，計畫變更仍須依法處理"],
  "都更分配須核對面積、價值與費用負擔": ["都更分配須核對面積、價值與費用負擔"],
  "新北建築期限增加兩年，合建交屋仍依契約判斷": ["新北建築期限增加兩年，合建交屋仍依契約判斷"],
  "買賣移轉棟數增加，仍須區分交屋潮與市場成交": ["買賣移轉棟數增加，仍須區分交屋潮與市場成交"],
};
const headingWords = /(一坪換一坪|差額價金|室內面積|房間數|家庭預算|貸款|格局|公開抽籤|重新抽籤|選配原則|權利價值|選配|抽籤|選屋|異議|找補|同意|少數|多數|先看|都更|都市更新|危老重建|全案管理|所有權人|共同負擔|權利變換|分配比例|交屋日期|建築期限|工程交屋|實施者|協調|諮詢|評估|更新|重建|契約|條件|工程|建商|地主|補助|費用|專業|合作|流程|文件|進度|準備|確認|基地|社區|計畫|信任|成本|市府|政府|市場|房屋|銷售|權益|建築|資料|提供|服務|整合|工作|推動|獎勵|代表|協助|需要|分配|管理|方案|幾坪|怎麼算|房市回溫)/g;

function groupText(text, heading) {
  if (!/[\u3400-\u9fff]/u.test(text)) return text;
  // Bind the last three Chinese characters and their punctuation together.
  // This also protects short tails before an intentional desktop <br>.
  const tail = text.match(/\d+(?:\.\d+)?\s*(?:樓|號|坪|年|月|日)[\s\p{P}]*$/u)
    || text.match(/(?:[\u3400-\u9fff][\s\p{P}]*?){2,3}[\s\p{P}]*$/u);
  let end = tail && tail[0].length <= 10 ? tail[0] : '';
  if (heading && end) {
    const boundary = text.length - end.length;
    for (const match of text.matchAll(headingWords)) {
      if (match.index < boundary && match.index + match[0].length > boundary) {
        end = text.slice(match.index);
        break;
      }
    }
  }
  const start = end ? text.slice(0, -end.length) : text;
  const parts = heading ? start.split(headingWords).map((part, i) =>
    i % 2 ? <span className="readable-word" key={i}>{part}</span> : part) : start;
  return <>{parts}{end && <span className="readable-tail">{end}</span>}</>;
}

function groupChildren(children, heading, parentTag) {
  return Children.map(children, child => {
    if (typeof child === 'string') {
      const grouped = groupText(child, heading);
      return parentTag === 'button' ? <span className="readable-label">{grouped}</span> : grouped;
    }
    if (isValidElement(child) && child.props.children !== undefined) {
      return cloneElement(child, {}, groupChildren(child.props.children, heading, child.type));
    }
    return child;
  });
}

export default function Readable({ as: Tag = 'p', children, ...props }) {
  const heading = /^h[1-6]$/.test(Tag);
  const lines = Tag === 'h1' && typeof children === 'string' ? mobileTitles[children] : null;
  return <Tag {...props}>{lines
    ? lines.map((line, i) => <span className="readable-title-line" key={i}>{groupText(line, true)}</span>)
    : groupChildren(children, heading)}</Tag>;
}
