# 三策專案管理顧問網站

正式站：[www.sanzepm.com.tw](https://www.sanzepm.com.tw/)

`main` 與正式站使用同一份原始碼。先開分支、通過檢查，再合併到 `main`；Vercel 會自動建置與部署。不要再從與 GitHub 不同步的資料夾直接發布。

## 本機公開頁預覽

```sh
npm ci
SANZE_PUBLIC_PREVIEW=1 npm run prepare:private
npm run dev
```

公開預覽不含受保護的案件報告。原有報告登入在缺少正式憑證時仍拒絕存取。

## 建置與部署檢查

```sh
SANZE_PUBLIC_PREVIEW=1 npm run build
node --test tests/landowner-calculation.test.mjs tests/line-ai.test.mjs tests/line-timeout.test.mjs tests/line-webhook.test.mjs tests/private-report-bundle.test.mjs
```

建置會同時檢查公開路由、SEO、sitemap 及引用資產。首頁或公開專頁被誤設成 404 時必須建置失敗，不能取代正式站。`vercel.json` 是正式設定；`vercel.paused.json` 僅保存歷史暫停設定，不可用於正常發布。

## 受保護的案件報告

報告原文與附件以 AES-256-GCM 加密保存在 `sealed/reports.v1.bin`。Vercel Production 透過敏感環境變數 `REPORT_SOURCE_ENCRYPTION_KEY` 在建置時還原伺服器檔案；金鑰不會進入前端或 Git。正式建置缺少金鑰時直接失敗。

這個金鑰只負責部署封裝，不取代或修改既有的 `REPORT_ACCESS_HASHES`、`REPORT_SESSION_SECRET`、Cookie、RLS 或登入規則。Preview 不取得正式報告或正式金鑰。

有權更新案件報告的人員，應先在本機安全地載入封裝金鑰，再執行：

```sh
node scripts/seal-private-reports.mjs /path/to/private-source
```

原始資料夾須包含 `api/_report-records.js`、`api/_report-editorial.js` 與 `private/reports/`。只提交更新後的加密封裝；不得提交明文、金鑰或 `.env`。輪替封裝金鑰時必須一併重新封裝。

首次同步以 2026-10-20 正式站為基準，重建出的 29 份主要 HTML 與正式發布檔案完全一致，並保留先前已合併的授權資料表明確 GRANT 修正。
