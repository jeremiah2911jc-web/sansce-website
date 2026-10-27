export const ownerService = {name:'地主與社區服務',path:'/consulting',contact:'/contact?service=owner#service-inquiry'};
export const developerService = {name:'開發評估服務',path:'/services/development-evaluation',contact:'/contact?service=development#service-inquiry'};
export const serviceAudiences = [
 {id:'owner',...ownerService,summary:'分回房地、合作契約與社區重建',detail:'地主與更新會可委託比較分回房地、費用與搬遷條件，協調整合、專業分工及案件進度。',tool:'/landowner-comparison',toolLabel:'地主分配試算'},
 {id:'development',...developerService,summary:'開發收益、投資條件與資金需求',detail:'開發業者、投資人及自行出資開發的地主，可委託試算規模、成本收益與各期資金需求。',tool:'/land-evaluation',toolLabel:'土地開發評估工具'},
];
