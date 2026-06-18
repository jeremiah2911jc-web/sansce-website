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

公開下載頁位於 `/downloads`，下載檔放在 `public/downloads/`。

版本檢查 manifest 位於：

- `public/update/windows-test-latest.json`
- `public/update/macos-test-latest.json`
