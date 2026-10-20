import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateBase,calculateOffer} from '../src/landowner-calculation.mjs';
const parts={basis:'parts',base:'225',bonus:'50',transfer:'30',land:'20'};
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
test('百分比採基準容積母數；不相加百分點，不逐項連乘',()=>{const b=calculateBase(parts);near(b.far,4.05);near(b.areaLow,129.6);near(b.areaHigh,137.7)});
test('總容積模式不重複加獎勵或移轉',()=>{const b=calculateBase({...parts,basis:'total',total:'405'});near(b.far,4.05)});
test('分回50坪與一坪換2.5坪結果相同；反推區間順序正確',()=>{const b=calculateBase(parts),a=calculateOffer(b,{mode:'area',value:'50'}),q=calculateOffer(b,{mode:'exchange',value:'2.5'});assert.deepEqual(a,q);near(a.ratioLow,50/137.7);near(a.ratioHigh,50/129.6);assert.ok(a.ratioLow<a.ratioHigh)});
test('六成在兩個情境分別正反算一致',()=>{const b=calculateBase(parts),r=calculateOffer(b,{mode:'ratio',value:'60'});near(r.areaLow,77.76);near(r.areaHigh,82.62);near(r.areaLow/b.areaLow,.6);near(r.areaHigh/b.areaHigh,.6)});
test('土地增加一倍：坪數加倍，比例不變',()=>{const a=calculateOffer(calculateBase(parts),{mode:'exchange',value:'2.5'}),b=calculateOffer(calculateBase({...parts,land:'40'}),{mode:'exchange',value:'2.5'});near(b.areaLow,2*a.areaLow);near(b.ratioLow,a.ratioLow)});
test('缺漏不視為零；零獎勵可以計算',()=>{assert.throws(()=>calculateBase({...parts,bonus:''}));near(calculateBase({...parts,bonus:'0',transfer:'0'}).far,2.25)});
test('拒絕無效、負數、零土地、超100%輸入比例',()=>{for(const land of ['0','-1','NaN','Infinity',''])assert.throws(()=>calculateBase({...parts,land}));assert.throws(()=>calculateOffer(calculateBase(parts),{mode:'ratio',value:'101'}));assert.throws(()=>calculateOffer(calculateBase(parts),{mode:'area',value:'-1'}))});
test('反推超100%保留原值，提示核對，不截斷',()=>{const r=calculateOffer(calculateBase(parts),{mode:'area',value:'150'});assert.ok(r.over);assert.ok(r.ratioHigh>1)});
test('混合說法使用各自情境比較，不交叉取端點',()=>{const b=calculateBase(parts),a=calculateOffer(b,{mode:'area',value:'50'}),r=calculateOffer(b,{mode:'ratio',value:'60'});near(r.areaLow-a.areaLow,27.76);near(r.areaHigh-a.areaHigh,32.62)});

test('危老分項模式不接受50%，特殊原容積不套一般獎勵公式',()=>{assert.throws(()=>calculateBase({...parts,method:'old'}),/簡化範圍40/);near(calculateBase({...parts,method:'old',bonus:'40'}).far,3.825);near(calculateBase({...parts,method:'old',bonus:'30'}).far,3.6)});
test('四十種土地與容積組合：三種輸入正反算一致',()=>{for(let i=1;i<=40;i++){const b=calculateBase({basis:'total',total:100+i*7.5,land:i*1.37});const p=(10+i)/100;for(const k of [1.6,1.7]){const h=b.land*b.far*k*p,q=h/b.land;const a=calculateOffer(b,{mode:'area',value:h}),e=calculateOffer(b,{mode:'exchange',value:q});near(a.areaLow,e.areaLow);near(a.ratioLow,e.ratioLow);near(a.ratioHigh,e.ratioHigh);near(k===1.6?a.ratioHigh:a.ratioLow,p)}}});

test('獨立提案：60%無移轉，分回少於55%含移轉；差額採獨立端點',async()=>{
 const {calculateProposal,compareProposals}=await import('../src/landowner-calculation.mjs');
 const proposal=(value,transfer)=>({mode:'ratio',value,areaBasis:'registered',ratioKind:'area',distribution:'all',development:{source:'far',basis:'parts',method:'urban',base:'225',bonus:'50',transfer}});
 const a=calculateProposal('20',proposal('60','0')),b=calculateProposal('20',proposal('55','30'));
 near(a.areaLow,64.8);near(a.areaHigh,68.85);near(b.areaLow,71.28);near(b.areaHigh,75.735);
 const c=compareProposals(a,b);assert.equal(c.kind,'b-more');near(c.low,2.43);near(c.high,10.935);
});
const fixed={mode:'area',value:'50',areaBasis:'registered',derive:false};
const split={mode:'ratio',value:'60',areaBasis:'registered',ratioKind:'area',distribution:'separate',bonusShare:'60',transferShare:'0',development:{source:'far',basis:'parts',method:'urban',base:'225',bonus:'50',transfer:'30'}};
test('承諾坪數與一坪換回量：容積未提供仍可直接比較',async()=>{
 const {calculateProposal,compareProposals}=await import('../src/landowner-calculation.mjs');
 const a=calculateProposal('20',fixed),b=calculateProposal('20',{...fixed,mode:'exchange',value:'2.8'});
 near(a.areaLow,50);near(a.exchangeLow,2.5);assert.equal(a.ratioLow,null);near(b.areaLow,56);
 assert.deepEqual(compareProposals(a,b),{kind:'b-more',low:6,high:6});
});
test('移轉全歸建商：不把移轉面積再乘地主六成',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');const r=calculateProposal('20',split);
 near(r.areaLow,64.8);near(r.areaHigh,68.85);near(r.ratioLow,.5);near(r.base.areaLow,129.6);
});
test('三部分獨立比例：基本60%、獎勵50%、移轉20%',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');const r=calculateProposal('20',{...split,bonusShare:'50',transferShare:'20'});
 near(r.areaLow,65.52);near(r.areaHigh,69.615);
});
test('不確定、空白與明確零比例必須區分',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 for(const patch of [{distribution:''},{distribution:'unknown'},{bonusShare:''},{transferShare:''},{ratioKind:'value'},{areaBasis:'interior'}])assert.throws(()=>calculateProposal('20',{...split,...patch}));
 assert.equal(calculateProposal('20',{...split,value:'0',bonusShare:'0',transferShare:'0'}).areaLow,0);
 const r=calculateProposal('20',{...split,bonusShare:'',transferShare:'',development:{...split.development,bonus:'0',transfer:'0'}});near(r.areaLow,43.2);
});
test('只有總容積不能拆成三種比例，統一分配則可採總容積',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');const o={...split,development:{source:'far',basis:'total',total:'405'}};
 assert.throws(()=>calculateProposal('20',o),/分項/);near(calculateProposal('20',{...o,distribution:'all'}).areaLow,77.76);
});
test('已有全案面積表：依土地占比計算，不再乘容積或銷售係數',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 const r=calculateProposal('20',{...split,distribution:'all',development:{source:'area',siteLand:'200',saleArea:'1300'}});
 near(r.areaLow,78);near(r.areaHigh,78);assert.equal(r.base.source,'area');
 assert.throws(()=>calculateProposal('201',{...split,distribution:'all',development:{source:'area',siteLand:'200',saleArea:'1300'}}));
});
test('面積表分項分配：720基本、360獎勵、220移轉，移轉歸建商',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 const r=calculateProposal('20',{...split,development:{source:'area',siteLand:'200',baseArea:'720',bonusArea:'360',transferArea:'220'}});
 near(r.areaLow,64.8);near(r.areaHigh,64.8);near(r.base.areaLow,130);
 assert.throws(()=>calculateProposal('20',{...split,development:{source:'area',siteLand:'200',baseArea:'720',bonusArea:'360',transferArea:''}}));
});
test('各案可用提案係數，無固定1.6～1.7硬套',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 const r=calculateProposal('20',{...split,development:{...split.development,coefficientMode:'known',coefficient:'1.5'}});near(r.areaLow,60.75);near(r.areaHigh,60.75);
 assert.throws(()=>calculateProposal('20',{...split,development:{...split.development,coefficientMode:'known',coefficient:''}}));
});
test('估算區間重疊時，不判斷確定贏家；待確認案不做排名',async()=>{
 const {calculateProposal,compareProposals}=await import('../src/landowner-calculation.mjs');
 const r=calculateProposal('20',split),f=calculateProposal('20',{...fixed,value:'66'});
 assert.equal(compareProposals(r,f).kind,'overlap');assert.equal(compareProposals(r,{error:'待確認'}),null);
 assert.deepEqual(compareProposals(f,f),{kind:'equal',low:0,high:0});
});
test('固定面積可選擇反推比例，使用該案資料',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 const r=calculateProposal('20',{...fixed,derive:true,development:{source:'far',basis:'total',total:'405'}});
 near(r.areaLow,50);near(r.ratioLow,50/137.7);near(r.ratioHigh,50/129.6);
});

test('三組網站情境範例：資料與顯示的預期結果一致',async()=>{
 const {landownerExamples}=await import('../src/landowner-examples.mjs');
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 const expected={fixed:[50,50,56,56],development:[64.8,68.85,71.28,75.735],separate:[64.8,68.85,77.76,82.62]};
 for(const e of landownerExamples){const a=calculateProposal(e.land,e.a),b=calculateProposal(e.land,e.b);[a.areaLow,a.areaHigh,b.areaLow,b.areaHigh].forEach((v,i)=>near(v,expected[e.id][i]));}
});


test('估算範圍只在端點相接時，保留可能相同，不說多零坪',async()=>{
 const {compareProposals}=await import('../src/landowner-calculation.mjs');
 assert.deepEqual(compareProposals({areaLow:50,areaHigh:50},{areaLow:50,areaHigh:55}),{kind:'overlap',low:0,high:5});
 assert.deepEqual(compareProposals({areaLow:50,areaHigh:55},{areaLow:50,areaHigh:50}),{kind:'overlap',low:-5,high:0});
 assert.deepEqual(compareProposals({areaLow:50,areaHigh:50},{areaLow:50+1e-12,areaHigh:50+1e-12}),{kind:'equal',low:0,high:0});
});
test('極小輸入造成數字下溢時，不能回報零坪結果',async()=>{
 const {calculateProposal}=await import('../src/landowner-calculation.mjs');
 assert.throws(()=>calculateProposal('1e-200',{...fixed,mode:'exchange',value:'1e-200'}),/過小/);
 assert.throws(()=>calculateProposal('20',{...split,distribution:'all',development:{source:'area',siteLand:'1e200',saleArea:'1e-200'}}),/過小/);
});
