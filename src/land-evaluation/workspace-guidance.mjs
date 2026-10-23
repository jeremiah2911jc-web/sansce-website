// Presentation targets only. Validation and calculations remain in the shared core.
export const requiredBaseFields = [
  {key:'site',label:'基地面積',tab:'base'},
  {key:'coverage',label:'法定建蔽率',tab:'base'},
  {key:'far',label:'基準容積率',tab:'base'},
];

export function missingBaseFields(input){
  return requiredBaseFields.filter(({key})=>!String(input[key]??'').trim()||!Number.isFinite(Number(input[key]))||Number(input[key])<=0);
}

export function issueTarget(message){
  const targets=[
    ...requiredBaseFields,
    {label:'每戶地上分攤面積',tab:'parking',terms:['每戶面積']},
    {label:'屋突層數',tab:'above'},
    {label:'屋突每層高度',tab:'above',terms:['屋突高度','屋突總高度']},
    {label:'計畫道路寬度',tab:'base',terms:['路寬','道路','面寬']},
    {label:'地下層數',tab:'basement'},
    {label:'地下室與必要空間',tab:'basement',terms:['開挖','地下','停車方式','升降機','機坑']},
  ];
  return targets.find(({label,terms=[]})=>[label,...terms].some(term=>message.includes(term)))??null;
}
