import {withServiceScope} from './service-scope.js';
import {projectManagementGuide} from './project-management-guide.js';
import {urbanRenewalGuide} from './urban-renewal-guide.js';
import {insightArticles} from './insight-articles.js';
// Shared by the visible pages and static search metadata.
export const knowledgePages = [
 urbanRenewalGuide,
 {path:'/services/dangerous-old-rebuilding',kind:'service',updatedAt:'2026-10-26',seoTitle:'危老重建顧問｜資格評估、地主共識與合作條件｜三策',label:'危老重建評估',title:'危老重建評估：確認適用資格與所有權人意願',description:'三策提供危老重建諮詢，整理建物資格文件、所有權人意願、出資與分配條件，協調後續專業評估；委託前確認工作範圍、交付資料與費用。',lead:'屋齡高、有重建意願，仍須分別確認危老資格、所有權人共識與重建負擔。三策依既有文件辦理危老重建初步評估，整理待補資料、出資與分配條件，協助地主安排後續專業評估及討論。工作範圍、交付資料與費用於委託前議定。',sections:[
 ['建物資格與產權核對','危老條例適用於都市計畫範圍內的合法建築物，且須符合危險認定或結構安全評估等法定條件；具有歷史、文化、藝術及紀念價值而依法指定的建築物排除適用。評估時需要使用執照、謄本及已有的鑑定或認定資料。屋齡高不代表一定符合；現行重建計畫申請期限至2027年5月31日。'],
 ['所有權人同意與合作條件','危老重建需取得計畫範圍內全體土地及合法建築物所有權人同意。初步評估時，要確認所有權人、持分、繼承或其他權利問題，也要了解大家對出資、分配與搬遷的想法。'],
 ['重建規劃、出資與搬遷安排','建築等專業人員確認基地使用限制、建築配置與可申請項目。地主依評估結果討論出資方式、合作對象、工作與搬遷安排。初步估算應說明採用的條件，讓地主知道哪些內容還需要確認。'],
 ['資料彙整與專業協調','整理基地與建物資料、記錄地主疑問、比較危老與都市更新方向，並協助確認建築、財務及其他專業工作的分工。已有合作提案時，逐項對照分配基準、費用負擔、估算前提與執行時程。'],
 ['諮詢準備資料','準備使用執照、謄本、耐震評估或建商提案，並提供所有權人意願及既有會議紀錄。尚未進行鑑定時，可與三策確認評估項目與辦理單位。']
 ],sources:[['都市危險及老舊建築物加速重建條例','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070249'],['新北市危老重建計畫專區','https://www.uro.ntpc.gov.tw/PageService/Dangerous-old']],related:['/insights/building-permit-extension','/services/urban-renewal','/services/joint-construction','/services/project-management']},
 {path:'/services/joint-construction',kind:'service',updatedAt:'2026-10-26',seoTitle:'合建顧問｜建商提案、地主分配與契約條件比較｜三策',label:'合建條件比較',title:'合建顧問：核對分配、費用與契約條件',description:'三策提供合建顧問服務，比較建商提案的地主分配、車位、補款、搬遷及履約條件，整理契約待補事項與回覆紀錄；法律審閱由律師辦理。',lead:'地主收到建商合建提案或契約草案時，分配比例須連同面積、車位、補款與搬遷安排一起比較。三策提供合建條件檢視，整理各版本依據、地主負擔與待補約定，供地主與合作方討論；契約法律效果與修訂內容由律師確認。',sections:[
 ['法定程序與合建合作方式','都市更新與危老重建是不同的法定辦理途徑；合建則涉及地主與合作方的出資、興建及分配約定。採用合建合作方式，仍須確認適用哪一種程序及其同意、申請與審查要求。'],
 ['分配基準與選配條件','分配比例應列明採用土地、建物面積或價值等計算基準，並核對面積範圍、車位分配、樓層位置、選配順序與差額價金。比較提案時，應同時核對計算條件與實際可取得的房地內容。'],
 ['列出地主負擔與搬遷安排','將提案中的稅費、找補、登記、搬遷及租金安排逐項列出，確認由誰負擔、何時支付，以及哪些金額屬於估算。涉及個別稅務與法律問題時，請相應專業人員核對。'],
 ['比較合作對象與履約安排','確認契約由誰簽、誰出資、誰負責興建，以及履約保障的具體內容。若提案提到信託或保證，應進一步了解其範圍、條件與處理程序。'],
 ['提案比較與待補約定','整理各份提案採用的估算條件與差異，把分配、費用、時程、分工及待確認事項放在同一份比較資料中，協助地主向提案者核對並補充約定。契約法律效果與修訂內容，應請律師確認。'],
 ['諮詢文件與版本整理','提供各版本提案、契約草案、分配試算與地主目前的疑問。已簽署文件時，應一併提供，讓後續討論能以既有約定為基礎。']
 ],related:['/insights/joint-construction-lower-floor-allocation','/insights/renewal-distribution','/services/dangerous-old-rebuilding','/services/project-management']},
 projectManagementGuide,
 ...insightArticles
].map(withServiceScope);
export const knowledgeByPath = Object.fromEntries(knowledgePages.map(page=>[page.path,page]));
