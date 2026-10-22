export const photoSource=name=>name==='site-inspection'?'/images/redesign/site-inspection-v2.jpg':['community-meeting','contract-review','construction-inspection','relocation-home','older-apartment-stair','shop-frontage','family-floor-plan','urban-blocks'].includes(name)?'/images/editorial/'+name+'.webp':'/images/redesign/'+name+'.jpg';
const covers={
 'developer-launch-market-recovery':['/images/redesign/residential-grand-v2.jpg','住宅建築與城市開發環境','/images/editorial/construction-inspection.webp','工地人員檢查建築現況'],
 'urban-renewal-far-300':['/images/editorial/urban-blocks.webp','新舊住宅與街廓的都市環境','/images/redesign/site-inspection-v2.jpg','查看住宅基地與周邊環境'],
 'urban-renewal-one-for-one':['/images/editorial/family-floor-plan.webp','一家人檢視格局圖與現有居住空間','/images/editorial/relocation-home.webp','家人整理搬遷前的書籍與物品'],
 'urban-renewal-consent-plan-changes':['/images/editorial/contract-review.webp','逐項檢閱合作內容的工作','/images/editorial/community-meeting.webp','住戶共同討論基地與重建計畫'],
 'renewal-distribution':['/images/redesign/document-review.jpg','核對重建分配資料與圖面','/images/editorial/family-floor-plan.webp','核對新屋格局與家庭生活需求'],
 'building-permit-extension':['/images/editorial/construction-inspection.webp','工地人員檢查建築現況','/images/redesign/project-management.jpg','專業人員核對工地圖面與施工進度'],
 'property-transfers-market':['/images/renewal-city-vision.jpg','都市住宅與房屋市場環境','/images/editorial/shop-frontage.webp','街區中的住宅出入口與店面']
};
const inlinePhotos={
 '/insights/joint-construction-lower-floor-allocation':{src:'/images/refinement-20261021/low-floor-interior.webp',small:'/images/refinement-20261021/low-floor-interior-960.webp',alt:'低樓層住宅窗外的鄰棟距離與採光',caption:'比較可選樓層時，須連同鄰棟距離、採光與使用需求評估。',afterSection:1},
 '/insights/transfer-development-rights-allocation':{src:'/images/refinement-20261021/tdr-review.webp',small:'/images/refinement-20261021/tdr-review-960.webp',alt:'建築量體模型與成本工作資料',caption:'新增容積的成本與分配約定，須與原有合作條件一併比較。',afterSection:1}
};
export function editorialPage(page){if(page.visual)return inlinePhotos[page.path]?{...page,visual:{...page.visual,inlinePhoto:inlinePhotos[page.path]}}:page;const [src,alt,detail,detailAlt]=covers[page.path.split('/').pop()];return {...page,visual:{hero:{small:src,large:src},alt,detail:{src:detail,alt:detailAlt,width:1536,height:1024},sideTitle:[page.label],navigation:page.sections.map(([title],i)=>[title,'#section-'+(i+1)])}};}
const serviceCover={
 '案件健檢':['document-review','待核對的基地資料與圖面'],
 '服務流程':['community-meeting','住戶討論基地資料與工作安排'],
 '聯絡我們':['consultation','討論案件資料與需要的協助'],
 '都市更新':['site-inspection','查看住宅街區與基地'],
 '危老':['older-apartment-stair','老公寓的樓梯與日常通行環境'],
 '合建':['contract-review','逐項核對合作契約內容'],
 '全案':['construction-inspection','專業人員檢查建築現況']
};
export function serviceImage(label){return Object.entries(serviceCover).find(([key])=>label.includes(key))?.[1]||serviceCover['都市更新'];}
