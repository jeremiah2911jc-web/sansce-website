# 三策 App 授權 API Phase 2 設定說明

本文件記錄 Phase 2 授權後端基礎。此階段只建立 Supabase schema、Vercel API endpoints、server-side token 簽章與 App API client contract；尚未正式強制 App 啟動授權。

## 需要的 Vercel 環境變數

以下變數只設定在 Vercel server-side environment，不得放進前端 source、Vite public env、公開文件或 App repo。

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LICENSE_TOKEN_SECRET=
LICENSE_KEY_PEPPER=
```

- `SUPABASE_SERVICE_ROLE_KEY` 只供 Vercel API routes 使用。
- `LICENSE_TOKEN_SECRET` 用於 server-signed license token。
- `LICENSE_KEY_PEPPER` 用於授權碼與裝置指紋 hash。
- App 不可持有 service role key、token secret 或 pepper。

## Supabase migration

Migration 檔案：

```text
supabase/migrations/20260619_license_schema.sql
```

執行前請先人工 review，再於 Supabase SQL Editor 或正式 migration 流程套用。此 migration 會建立：

- `licenses`
- `license_devices`
- `license_events`

資料表只保存授權碼 hash 與裝置指紋 hash，不保存明文授權碼或明文裝置識別。資料表已啟用 RLS；目前 App 授權 API 由 server-side service role 存取，不開放前端直接查詢。

## 建立 license 的原則

1. 管理者產生授權碼後，只能把 hash 寫入 `licenses.license_key_hash`。
2. hash 必須與 API 使用同一套 `LICENSE_KEY_PEPPER` 與 normalization 規則。
3. 不要把明文授權碼寫入 DB、migration、seed、log 或 repo。
4. `max_devices` 控制可啟用裝置數。
5. `enabled_features` 保留為 JSON，用於後續方案權限。

Phase 2 尚未提供管理後台。建立 license 可以先用受控 server-side script 或人工 SQL，但必須先在可信環境算出 hash。

## API endpoints

### `POST /api/license/activate`

用途：首次啟用授權碼並綁定目前裝置。

輸入：

```json
{
  "licenseKey": "使用者輸入的授權碼",
  "deviceFingerprint": "App 端產生的低敏裝置指紋",
  "deviceName": "使用者可辨識裝置名稱",
  "platform": "macos",
  "appVersion": "0.1.1",
  "build": "abcdef0"
}
```

成功會回傳 `licenseToken`、授權狀態、方案、到期日與可用功能。

### `POST /api/license/verify`

用途：驗證既有 `licenseToken` 與目前裝置是否仍有效。

輸入：

```json
{
  "licenseToken": "server-signed-token",
  "deviceFingerprint": "App 端產生的低敏裝置指紋",
  "appVersion": "0.1.1",
  "build": "abcdef0"
}
```

成功會回傳 `online_authorized`；過期、撤銷、裝置停用會回傳對應狀態。

### `POST /api/license/deactivate-device`

用途：停用目前裝置，釋放授權裝置數。

輸入：

```json
{
  "licenseToken": "server-signed-token",
  "deviceFingerprint": "App 端產生的低敏裝置指紋"
}
```

## 安全限制

- 授權碼不明文保存。
- 裝置指紋不明文保存。
- service role key 只放 Vercel server-side env。
- App 不可持有 service role key、`LICENSE_TOKEN_SECRET` 或 `LICENSE_KEY_PEPPER`。
- API 啟用失敗不可洩漏授權碼是否存在。
- API raw error 不直接回給使用者。
- Phase 2 不操作 production Supabase，不建立真實 license。

## Phase 2 與 Phase 3 邊界

Phase 2 完成：

- 授權資料表 SQL。
- Vercel API routes。
- Server-side hash 與 token 簽章 helper。
- App API client 與 device identity helper。
- Source-level verification。

Phase 3 才會做：

- App 啟動時正式呼叫 `/api/license/verify`。
- 授權啟用 UI 表單。
- 本機保存 server-signed token。
- 真正切換 `online_authorized` / `offline_limited` / 未授權 gate。
- 管理端建立與撤銷 license。
