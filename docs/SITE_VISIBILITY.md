# 公開網站暫時隱蔽

公開網站頁面目前由 `vercel.json` 的明確服務 allowlist 與最後一條 catch-all
控制。allowlist 保留桌面 App 授權、系統登入與同步 API、版本資訊和固定安裝檔；
其他路徑交給 `api/public-site-not-found.js` 回傳無品牌的 HTTP 404。

兩份桌面 App 更新 manifest 的下載入口在隱蔽期間直接指向各平台既有固定安裝檔，
避免 App 將使用者帶到已封鎖的公開下載頁。

`public/robots.txt` 同時禁止所有搜尋引擎爬取。404 回應會附加：

- `X-Robots-Tag: noindex, nofollow, noarchive`
- `Cache-Control: no-store, no-cache, max-age=0, must-revalidate`

這項機制不依賴 Vercel Dashboard、環境變數、DNS 或資料庫設定。

## 恢復公開

以本次隱蔽 commit 的完整 hash 執行：

```sh
git revert <temporary-hide-commit>
git push origin main
```

GitHub 連接的 Vercel production deployment 完成後，原網站、SPA fallback 與
公開下載頁會恢復。本次 commit 不刪除網站原始碼、圖片、下載檔、API 或資料。

## 驗證

```sh
npm ci
npm run verify:site-visibility
npm run verify:license-api
npm run build
git diff --check

curl -I https://sansce-website.vercel.app/
curl -I https://sansce-website.vercel.app/missing-path-404-check
curl -I https://sansce-website.vercel.app/sitemap.xml
curl https://sansce-website.vercel.app/robots.txt
```

正式驗收另需確認 allowlist 內的授權 API、系統 API、版本 JSON 與固定安裝檔
仍維持原契約。不得把整個 `/api`、`/downloads` 或 `/update` 目錄加入 allowlist。
