export const stages = ['評估更新中','初步整合中','更新會已成立','已送件審查中','已核定／後續推動中','其他／尚待釐清'];
export const promoters = ['更新會','建商／實施者','地主自行推動（尚未成立更新會）','尚未確定','其他'];
export const contactFields = [
 ['name','聯絡人姓名',100,true],['phone','聯絡電話',30,true],['email','電子郵件',100,false],
 ['district','行政區',100,true],['location','基地地址',150,true],['stage','案件階段',40,true],
 ['association','目前由誰推動案件',40,true],['willingness','地主意願概況',500,false],['problem','目前遇到的問題',1500,true]
];
