import {knowledgePages} from './knowledge-pages.js';
const topics={
 '/land-evaluation':'土地開發評估',
 '/insights/joint-construction-lower-floor-allocation':'合建樓層與選屋條件',
 '/insights/transfer-development-rights-allocation':'容積移轉與地主分配',
 '/insights/urban-renewal-ground-floor-shops':'店面價值與分配',
 '/insights/developer-launch-market-recovery':'房市與開發資金',
 '/insights/urban-renewal-far-300':'容積政策與開發效益',
 '/insights/urban-renewal-one-for-one':'居住需求與都更分配',
 '/insights/urban-renewal-selection-disputes':'選屋公平與地主異議',
 '/insights/urban-renewal-consent-plan-changes':'同意書與契約權益',
 '/insights/public-urban-renewal-challenges':'公辦都更與財務分配',
 '/insights/renewal-distribution':'都更分配與費用',
 '/insights/building-permit-extension':'工程時程與履約',
 '/insights/property-transfers-market':'房市數據判讀',
 '/':'認識三策','/insights':'三策觀點總覽','/about':'認識三策',
 '/landowner-comparison':'地主分配試算','/contact':'案件諮詢','/checkup':'案件健檢',
 '/reports':'案件報告入口','/process':'顧問服務流程','/consulting':'都更與合建顧問服務','/programs':'雙北都更專案'
};
export const trafficTopics=Object.fromEntries(knowledgePages.map(p=>[p.path,topics[p.path]||(p.kind==='article'?p.label:'顧問服務')]).concat(Object.entries(topics)));
