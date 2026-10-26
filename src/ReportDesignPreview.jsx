import CaseReport from './CaseReport.jsx';
const photo={asset:'design-sample.jpg',previewSrc:'/images/redesign/site-inspection-v2.jpg',caption:'版面示例・基地環境，非實際委託案件',alt:'檢視住宅基地的工作情境',width:1536,height:1024};
const report={id:'DESIGN-PREVIEW',assumptions:'本頁所有文字與數字僅供版面測試。未填入任何實際案件資訊，不構成估價、財務分析或委託成果。',parkingNote:'本例未設定車位收入。',financialTables:[],editorial:{edition:'三策・報告版面示例',title:'基地條件與合作評估',subtitle:'設計預覽・非實際案件',opening:'從基地現況、合作文件到後續安排，讓資料與判斷有清楚的閱讀順序。此頁使用虛構內容，展示報告閱讀介面。',hero:photo,chapters:[
{id:'overview',number:'01',title:'基地與案件概況',lead:'先確認現有資料，整理待確認的條件。',paragraphs:['本版面展示報告的內文、圖說與表格層級。基地位置、面積、分配條件與費用均須回到實際文件查證。'],tables:[{caption:'表1｜資料盤點示例',headers:['資料項目','狀態'],rows:[['土地與建物資料','待提供'],['合作提案與委託範圍','待核對'],['審查及會議紀錄','待整理']]}]},
{id:'documents',number:'02',title:'合作條件與資料核對',lead:'讓不同提案具有可比較的基準。',paragraphs:['核對面積計算範圍、車位安排、搬遷與交屋條件，再整理合作方式的差異。此處為排版示例，沒有採用真實提案內容。'],photos:[{...photo,asset:'document-sample.jpg',previewSrc:'/images/redesign/document-review.jpg',caption:'圖面與資料核對・非案件文件'}]},
{id:'schedule',number:'03',title:'工作分工與後續安排',lead:'記錄問題、參與人員與後續工作。',paragraphs:['每一項待辦工作，應確認負責窗口、所需文件與預計回覆時間。']},
{id:'finance',number:'04',title:'財務試算與比較',lead:'先確認共同假設，再進行方案比較。',paragraphs:['本預覽不載入實際案件數據。正式試算須列明計算依據、假設條件及仍待確認事項。']},
{id:'status',number:'05',title:'目前狀態與待確認事項',lead:'將已確認資訊與待辦事項分別記錄。',paragraphs:['本頁為設計展示，所有狀態均為示例。']},
{id:'claims',number:'',title:'權利與合作文件',paragraphs:['合作對象、權利狀態及既有文件須由實際案件資料確認。本段僅供報告文字層級檢視。'],tables:[]}
],appendix:[],permitAppendix:[],directions:[['確認基地','資料尚待補充','取得必要圖資','核對資料範圍'],['比較合作','已有初步提案','確認比較基準','整理差異與問題']],deliverables:[['資料盤點','目前持有文件','列出待補項目'],['會議安排','問題清單','確認參與窗口']],assessment:{title:'三策綜合評估',paragraphs:['此處展示綜合意見的版面。正式報告應說明判斷依據、未確認事項，以及可安排的後續工作。'],final:'本頁為排版示例，非案件評估意見。'},previewOrder:['整理實際文件與基地資料。','核對不同提案的比較基準。','確認工作範圍、負責窗口與時程。']}};
export default function ReportDesignPreview(){return <><aside className="report-preview-notice wrap"><strong>報告版面示例</strong><p>虛構內容・僅供設計審閱。實際案件報告仍須授權登入。</p><a href="/preview">返回全站預覽目錄</a></aside><CaseReport report={report} onLogout={()=>{location.href='/preview'}} message="此頁為本機設計預覽，未登入任何實際案件。" preview/></>}
