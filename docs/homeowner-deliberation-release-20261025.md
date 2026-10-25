# 都更整合文章上架紀錄（2026-10-25）

使用者提供定稿並明確要求上架。依現有文章版型發布，未修改共用樣式與元件。

## 內容與來源

- 標題：都更整合，別把地主的審慎當成障礙。
- 路徑：/insights/urban-renewal-homeowner-deliberation。
- 定稿來源：https://chatgpt.com/space/page_8d81f83a54a88191a06ae8f94b9574f2。
- 保留 24 個正文段落、6 個分節標題及原意。標題標點採使用者訊息版本，來源改為段末數字連結。
- 2026-10-25 查核新北市契約注意事項首頁：權利變換下，未簽私約或未出具同意書仍依法及計畫享有分配及選配權利。
- 查核臺北市選配作業須知第2、7點：公平合理、優先順序載明、依審議內容辦理。
- 查核都市更新條例第52條與權利變換實施辦法第17條：現金補償適用條件及逾期未申請選配的公開抽籤程序；另核對條例第22、23、37條。
- 日期僅設定本篇發布及修改日期，既有文章日期不變。

## 新照片

採內建 imagegen；原圖保存於生成資料夾，網站素材存入 public/images/insights/homeowner-deliberation/。未聲稱為特定真實案件攝影。

### 封面

原圖：/Users/jeremiah/.codex/generated_images/01a16d5a-a3c5-75d0-9d7e-e2439958710c/exec-d44d8d91-8213-4036-b0a6-b31704bdebb1.png

提示：Use case: photorealistic-natural. Asset: landscape 1536x1024 editorial cover photograph for a Taiwanese homeowner-rights article about careful review before signing urban renewal agreements. One Taiwanese woman aged 58, distinctive long oval face, straight shoulder-length dark hair with a single natural silver streak, no glasses, wearing a muted plum linen blouse and dark trousers, seated upright in a comfortable rattan armchair near the window of a lived-in Taiwan apartment. She holds an open document folder at chest level, calmly reading it, awake with both eyes naturally OPEN and pupils visible directed at the lifted document. Three-quarter view at eye level, natural daylight and authentic skin texture, unposed, sensible home furniture and books, no meeting table, no computer, no adviser, no other people. Subject and complete hands kept comfortably within central 60 percent so landscape and mobile crops retain head and hands. Normal sized fingers and correct contact with folder. Paper shows faint generic unreadable layout, no readable text, no labels, no logos. Ground and surfaces dry. Avoid chin resting, cheek resting, hand near face, closed or nearly closed eyes, sleepy expression, cinematic lighting, heavy bokeh, exaggerated wrinkles, artificial skin, signing pose. No text overlay.

### 內文

原圖：/Users/jeremiah/.codex/generated_images/01a16d5a-a3c5-75d0-9d7e-e2439958710c/exec-40582d87-98ab-4e66-aedf-1b6695bf4cc6.png

提示：Use case: photorealistic-natural. Asset: 1536x1024 landscape editorial inside photo for Taiwanese urban-renewal homeowner-rights article, conveying that relocation affects family life. A Taiwanese adult daughter age 32, short asymmetrical pixie hair, round face, wearing teal short sleeve shirt, and her father age 68, thin rectangular face, short white hair, light brown short sleeve shirt, stand a comfortable distance apart beside a wooden bookcase in their modest lived-in apartment. Daughter holds one small closed cardboard moving box securely at waist height with both hands underneath, father has both empty hands naturally relaxed at his sides. They look at each other while discussing, eyes naturally open and directed toward one another; awake, calm thoughtful expressions, not smiling for camera. Two additional closed boxes on dry tiled floor, books still on shelves, ordinary curtains and realistic furniture. No professional adviser, no meeting table, no paperwork, no signing, no laptops. Medium-wide eye-level candid view showing the pair from head to knees, enough room around them for responsive crops; realistic hand anatomy, box contact and scale, natural diffuse daylight, true color, skin texture. Every person distinctly different from a gray-haired couple. No text, logos, watermark, readable labels, chin resting or hand-to-face poses, excessive downcast or closed eyes, cinematic styling, wet floor, impossible furniture.

兩張均已實際開啟檢查。屋主雙眼張開、視線對準文件；家人雙眼方向與對話一致。手指、手腕及手臂連接自然，文件與搬遷箱握持合理，無托腮。家具與乾燥地面合理。與近期文章及固定顧問參考比較，人物不同；本篇無顧問角色。

## 建置與版面

- npm ci --ignore-scripts（鎖定依賴），Vite 6.4.4；SANZE_PUBLIC_PREVIEW=1 npm run build 通過。
- 公開路由、SEO、資產及標題分組檢查通過：33頁、188素材、19篇文章。
- 預覽完整內文1280/1440、平板768、手機360/390/430px已保存畫面；24段、0正文br、0粗體、無水平溢出。
- 列表、地主權益分類、搜尋、首頁文章入口各尺寸畫面存於qa/；未修改共用排版。
- 原生Safari以回應設計模式390px逐頁讀至文末，另核對360/430/1280封面。此為macOS Safari尺寸檢查，不是實體手機驗證。
- qa/為忽略的本機驗收證據。正式部署及Google提交結果另存qa/release-result.json。

