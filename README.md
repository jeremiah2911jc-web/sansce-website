# 三策專案管理顧問網站

這是可直接部署到 Vercel 的 Vite + React + Tailwind 專案。

## 本機啟動

```bash
npm install
npm run dev
```

## 建置

```bash
npm install
npm run build
```

## Vercel 部署

1. 把整個資料夾上傳到 GitHub，或匯入到 Vercel。
2. Framework Preset 選 Vite。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。

Logo 已放在 `public/logo.png`。

## 桌面 App 測試版下載

公開下載頁位於 `/downloads`。下載頁會透過 `/api/desktop-download` 將使用者輸入的下載密碼送到 Vercel serverless API 驗證；密碼必須設定在 Vercel Environment Variables：

```bash
DESKTOP_DOWNLOAD_PASSWORD=
```

請勿將實際密碼寫入前端程式碼、public JSON、HTML、README 或任何會被打包進 client bundle 的檔案。

目前下載檔仍放在 `public/downloads/`。這代表 server-side 密碼 gate 只保護官網下載流程，不能防止已知檔名或已分享 URL 的直連下載；若要做到正式檔案層級控管，下一階段應改用 R2 / S3 等私有儲存，並由 server-side API 驗證後發短效 signed URL。

版本檢查 manifest 位於：

- `public/update/windows-test-latest.json`
- `public/update/macos-test-latest.json`
