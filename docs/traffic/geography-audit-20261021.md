# Traffic geography correction — 2026-10-21

The dashboard counts browser-days, not people or residential addresses. Its location inputs are Vercel IP-geolocation labels.

## Confirmed defect and correction

Upstream supplied subdivision TPE with city Banqiao. The previous mapper trusted TPE without checking the township name. 66 stored pageviews (65 attributed to New Taipei under the existing daily first-location rule) and 23 browser-days in the current reporting period were affected. The corrected snapshot has Taipei 73, New Taipei 23, Taichung 3, Taoyuan 3; unknown regional records remain unknown. No saved Xinzhuang or Tucheng labels were present; that does not imply absence of readers physically in those districts.

A shared resolver covers 22 county/city codes and 368 township names in Chinese and English. Exact, unique district names resolve to their county. Same-name districts require an agreeing county code. Conflicting county-level names and subdivision codes remain unidentified. No fuzzy or substring matches are used. Regional grouping follows the resolved county.

Official name source: NLSC township-boundary attribute table TOWN_MOI_1120317.dbf, downloaded 2026-10-21 from https://maps.nlsc.gov.tw/pro/download.jsp (dataset https://data.gov.tw/dataset/7441). Only names and county relationships were extracted; no geometry is used. The administrative name table is not an IP-location accuracy guarantee. Alternate Banqiao/Banciao/Panchiao and Xinzhuang/Sinjhuang aliases are explicit.

## History and storage

`geo_original` preserves original country/county/city/region. `geo_resolution` and `geo_version` record the applied rule. A database trigger normalizes future writes as well as the backfill, protecting against stale clients. Historical rows without evidence remain unknown. Original metadata is not sent to the public dashboard. The migration compares all non-geographic row fields before/after and aborts if anything differs; re-running it is idempotent. Existing RLS and service-role-only access remain intact.

Full database verification before/after: 348 stored pageviews, 135 browser-days, 14,709,973 recorded foreground milliseconds, 282 actions and 2 report opens. Current reporting snapshot: 216 pageviews, 120 browser-days. Geography changes do not add/remove pageviews or alter sources, actions, article paths, timestamps, reports or AI questions.

## Overseas aggregation

Foreign countries use one country bucket, with page/topic/browser-day deduplication performed before aggregation. Original city labels remain private audit evidence. Foreign cities do not appear in visitor facts, country lists, content headings or filters. Taiwan retains county grouping.

## Verification

1,604 JavaScript/PostgreSQL parity cases, including 22 codes, 368 townships, Banqiao/Xinzhuang/Tucheng, ambiguous Hsinchu/Chiayi/Xinyi, contradictory county labels, history preservation, repeat backfill and overseas country/page/topic deduplication. Existing API, exclusion, action and pageview checks plus production build/route/SEO/assets verification pass.

The release also brings the already-approved land-evaluation classification/entry/completion tracking into the GitHub production source so subsequent deployments retain it.
