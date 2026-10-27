export const stages = ['評估更新中','初步整合中','更新會已成立','已送件審查中','已核定／後續推動中','其他／尚待釐清'];
export const promoters = ['更新會','建商／實施者','地主自行推動（尚未成立更新會）','尚未確定','其他'];
export const contactFields = [
 ['name','聯絡人姓名',100,true],['phone','聯絡電話',30,true],['email','電子郵件',100,false],
 ['district','行政區',100,true],['location','基地地址',150,true],['stage','案件階段',40,true],
 ['association','目前由誰推動案件',40,true],['willingness','地主意願概況',500,false],['problem','目前遇到的問題',1500,true]
];

export const contactServices = {owner:'地主與社區服務',development:'開發評估服務'};
export const acquisitionMethods = ['購地評估','合建洽談','自有土地開發','委託代建／開發管理','其他／尚待確認'];
export const developmentContactFields = [
 ...contactFields.filter(([key])=>['name','phone','email','district','location'].includes(key)),
 ['acquisition','土地取得或開發方式',40,true],['goal','開發目標',500,true],['problem','預計評估項目與委託需求',1500,true]
];
export function contactSchema(service){return service==='development'?developmentContactFields:contactFields;}
