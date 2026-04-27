# P36 Arcade v2.3 Ultra Slow Start

本版調整：
- 開場速度再放慢
- 一開始約 10 秒才從上方落到底部
- 一開始約 5 秒才出下一題
- 後續逐步加快，最後 10 秒進入 Final Rush

主要參數在 `game.js` 前段：

```js
const STAGE_1_SPAWN_MS = 5000;
const STAGE_1_SPEED = 0.079;

const STAGE_2_SPAWN_MS = 3500;
const STAGE_2_SPEED = 0.12;

const STAGE_3_SPAWN_MS = 2200;
const STAGE_3_SPEED = 0.18;

const STAGE_4_SPAWN_MS = 1500;
const STAGE_4_SPEED = 0.26;
```

其他內容：
- `p36_arcade_schema.sql`：包含 `ViewP36ActiveSignals`
- `index.html`
- `style.css`
- `game.js`
- `config.example.js`
