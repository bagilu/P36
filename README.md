# P36 Arcade v2.4 Supabase Questions + Keyboard

本版重點：
- 題目改為從 Supabase `ViewP36ActiveSignals` 讀取
- 若 Supabase 讀取失敗，會使用本地備用題庫
- 保留鍵盤操作：
  - S：重要訊號
  - D：雜訊
  - K：商機
  - L：危機
- 按鈕文字已加入快捷鍵提示
- 保留 v2.3 的慢速開場節奏

使用方式：
1. 在 Supabase 執行 `p36_arcade_schema.sql`
2. 將 `config.example.js` 複製為 `config.js`
3. 填入您的 Supabase URL 與 anon key
4. 上傳所有檔案到 GitHub Pages

注意：
- `config.js` 需要和 `index.html` 放在同一層。
- 如果沒有建立 `config.js`，系統仍可跑，但只會使用本地備用題庫。
