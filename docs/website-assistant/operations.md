# 網站助理費用與防濫用

2026-10-24 使用者授權整合、測試後上架；僅網站聊天助理，LINE 與 OpenAI 帳戶其他程式費用不列入此帳本。

## 固定限制

每日以臺北時間累計最高 USD 3，單次預留也不得超過 USD 3。每日 100 次、每月 2,000 次；每 IP 每分鐘 3 次、每日 30 次，每對話每日 20 次，全站每分鐘 20 次。全站最多 4 個有效工作、每 IP 與對話各 1 個；剩餘費用不足以容納預留時會更早拒絕。輸出最多 2,000 tokens，最多 1 次內建工具呼叫。訪客不能調整模型、額度或服務等級。

每次先完成 Turnstile（hostname 與 website_assistant action 均須吻合），再以資料庫交易鎖統一預留。Vercel 提供的 x-real-ip 經專用 HMAC 後才存入帳本，不用訪客可任意重設的 visitorId 作費用身分。只接受正式網站 Origin；訊息 2,000 字、歷史最近 20 筆／12,000 字、單筆歷史 8,000 字、JSON 64 KiB。

## 結算

價格單位為 microUSD；1,000,000 microUSD = USD 1。正式價格快照見 pricing.json，依 OpenAI 官方 Standard 價格、長上下文、快取讀取及 30m／12h 寫入分別計費；推理 tokens 已包含於 output_tokens，不重複相加。只為 search action 加搜尋工具費。回傳模型與 service_tier 必須符合快照。伺服器固定 implicit／30m 快取；舊回傳若只有 cache_write_tokens 總量，可按已固定的 30m 寫入費結算。有期限明細時仍逐項計算並核對總和。

依當前官方價格、完整模型上下文、最多兩輪模型計算、最大 4,000 輸出與一次搜尋計算保守預留；回覆後按實際 usage 結算並立即釋回餘額。因此不是每題收取 USD 3，也不是每天只能提問一次。價格快照到期或缺失、資料庫或驗證故障時暫停付費呼叫。

未開始的工作可取消並歸還預留；過期未開始工作由下一次 admission 安全取消。已開始後逾時或費用不明的工作保留預留，即使跨日也不自動釋回。實際費用若超過保守預留，保留實際數字並立即關閉資料庫開關；上游價格或計費規則變更仍需重新審查，這不是 OpenAI 帳戶層級的硬性預付上限。

結算資料庫失敗時，website_ai_settlement_pending 會記錄 request_id、response_id、微美元、normalized usage 與 pricing_version，不記錄問題、回答、IP 或金鑰。經營者核對該紀錄與供應商用量後，才可以 service_role 重試 sanze_website_ai_finish；相同結算可重試，金額衝突會被拒絕。未知費用不可直接當成零或刪除。只可清除已結算／取消且超過 40 日的終態資料，未結算紀錄須保留。

## 環境與維護

Production：WEB_AI_MODEL=gpt-6-luna、WEBSITE_AI_ENABLED=true、WEBSITE_AI_PRICING_SOURCE=bundled，唯一正式價格來源為Git追蹤的pricing.json、WEBSITE_AI_IP_HASH_SECRET 為至少 32 字元私密值。沿用現有 OPENAI_API_KEY、SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY、TURNSTILE_SECRET_KEY、VITE_TURNSTILE_SITE_KEY。不得把服務金鑰放入 VITE 變數。Preview 預設關閉付費功能。

快照有效期限以 pricing.json 與 /api/assistant-pricing-status 的正式回傳為準。GitHub Actions每日09:30（Asia/Taipei）在雲端查核官方來源，費率變動或剩餘14天內自動更新，通過測試後提交main，透過綁定main的Vercel Deploy Hook建立正式版。正式部署須回傳完全相同的快照SHA256、模型、版本與有效期限，並通過公開HTTP檢查。不得自動信任訪客價格，也不得未查核就延長期限。若要立即停用，不必重部署，將 sanze_website_ai_settings.enabled 設為 false；已開始的請求仍會結算。

盤查查詢：

```sql
select * from public.sanze_website_ai_settings;
select state, count(*), sum(actual_microusd) as actual_microusd,
 sum(case when actual_microusd is null then reserved_microusd else 0 end) as pending_microusd
from public.sanze_website_ai_requests
where created_at >= date_trunc('day', now() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei'
   or actual_microusd is null
group by state;
```

驗證：npm run verify:assistant-guard、npm run verify:assistant-sql，以及既有聊天紀錄、專業知識、地主填寫引導、聯絡表單測試與完整公開頁 build。資料庫函式採 invoker、空 search_path；RLS 開啟且 anon/authenticated 沒有表格或 RPC 權限，僅 service_role 具明確授權。


## 雲端排程與部署驗證（2026-10-24 使用者授權）

正式流程：.github/workflows/assistant-pricing.yml。每日排程及手動workflow_dispatch均使用GitHub雲端runner，不需要本機開著。唯一寫入檔為docs/website-assistant/pricing.json；候選版本須先通過費用、SQL、維護流程、既有回歸與公開頁建置。提交前確認main沒有被其他工作更新；發現競爭則停止，不覆蓋他人修改。

腳本從OpenAI官方Markdown交叉核對Standard表、模型表、長上下文門檻、快取期限與搜尋費。價格沒變且期限仍超過14天時不延長快照；需要更新時記錄來源SHA256與查核時間，再延長30天。解析失敗、來源不一致、未支援計費或預留超過USD3時停止更新。失敗會將GitHub Actions標記失敗並保留工作紀錄，由GitHub既有通知設定發出失敗通知；每日下一次會重新檢查。

GitHub Secrets僅保存WEBSITE_AI_PRICING_DEPLOY_HOOK，這個URL只能觸發三策正式main的建置。不得把Vercel帳戶token、OpenAI金鑰、Supabase服務金鑰或報告解密金鑰移入此workflow。正式建置由Vercel使用既有私密環境還原受保護報告。雲端流程不需要LLM推論或額外OpenAI用量。

/api/assistant-pricing-status僅提供不含金鑰的公開部署證明，不執行模型、不讀寫帳本。公開JSON的source必須為bundled，SHA256、version及validUntil須與候選檔一致，不能只看HTTP200就認定更新成功。若前次推送成功但部署失敗，下次排程會發現正式快照不符並重試部署，即使Git檔案已更新也不會略過。每次查核與部署證據以Actions artifact保留90天。

Production的舊WEBSITE_AI_PRICING_JSON在切換完成後移除，避免環境舊值蓋過新快照。此變數僅保留為既有測試或手動環境模式相容介面。tests/fixtures/website-ai-pricing.json為固定計費測試資料，不會作為正式價格來源。原本需本機開著的heartbeat在雲端實測成功後停用，避免兩套維護重疊。
