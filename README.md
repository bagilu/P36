# P36 Arcade v2.1 Fixed View

本版修正：
- SQL 已補上 ViewP36ActiveSignals
- DROP 順序改為先 DROP VIEW 再 DROP TABLE
- 加上索引
- 保留 Signal Conveyor Canvas 版前端

使用順序：
1. 在 Supabase SQL Editor 執行 p36_arcade_schema.sql
2. 將 config.example.js 改名 config.js 並填入 Supabase 資訊（本版前端仍先用本地題庫）
3. 上傳 index.html、style.css、game.js 到 GitHub Pages
