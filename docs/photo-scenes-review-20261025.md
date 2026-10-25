# 照片替換預覽 2026-10-25

狀態：使用者於2026-10-25明確要求上架，兩張候選已獲本輪發布授權；正式站驗收另記發布證據。

## 候選與淘汰

使用內建 imagegen，固定男顧問依核准虛構角色參考生成。沒有使用真實案件照片。

- 危老初評原量門圖：情節與資格、產權初評不相符，移除。
- 初次新圖：使用者指出男主角眼神與後門異常，淘汰。
- 新危老候選：顧問與屋主在窗邊以建物照片和圖面討論；背景為窗、牆與書架。放大核對雙眼視線、手指、手腕、資料夾接觸點及背景幾何。
- 家庭第一候選：人物雖自然，但桌機文字覆蓋會遮擋孩子，淘汰該構圖。
- 新家庭候選：祖母、母親坐著對談，孩子另坐矮椅看向母親；各自姿勢、視線與手部動作有區別。放大核對臉部、手部、書本、椅子與桌面關係。
- 手機第一裁切：會切掉孩子，淘汰；改為920×1024人物群組裁切，另設手機置中位置。

## 保存位置

相對網站根目錄的候選成品：

- `public/images/photo-scenes-20261025/eligibility-records.webp`
- `public/images/photo-scenes-20261025/eligibility-records-960.webp`
- `public/images/photo-scenes-20261025/family-discussion.webp`
- `public/images/photo-scenes-20261025/family-discussion-960.webp`
- `public/images/photo-scenes-20261025/family-discussion-mobile.webp`

原圖、完整提示與檢查截圖保存在網站上一層 `photo-scenes-preview-20261025/`：`prompts.json` 保存每次提示；選用 `eligibility-v2`、`family-v2`。原圖為 `eligibility-v2-original.png`、`family-v2-original.png`。淘汰圖保留作比對，不放入公開資產。

## 驗證

預覽建置成功。Chromium與WebKit檢查兩頁320、360、375、390、412、430、768、1280、1440與844×390橫向尺寸，共40組；結果存於同資料夾的 `results.json`。檢查圖片來源、載入、手機專用裁切、主要人臉不被文字覆蓋及水平溢出。另實看手機390及桌機版照片。

原生Safari桌機實看兩頁；截圖 `native-safari-eligibility.png`、`native-safari-home.png`。手機尺寸為瀏覽器模擬，未宣稱實體iPhone驗收。

網址、標題正文、canonical及結構未改；僅照片、圖說與第二主題標題語意換行。本輪已獲使用者上架授權，發布後執行正式站檢查。
