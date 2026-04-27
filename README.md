# P36 Arcade v2.2 Slow Start

本版調整：
- 開場速度約比 v2.1 慢 5 倍
- 題目生成頻率改為較從容
- 60–40 秒：觀察期
- 40–20 秒：加速期
- 20–0 秒：Final Rush
- 主要可調參數集中在 `game.js` 前段：

```js
const STAGE_1_SPAWN_MS = 1500;
const STAGE_1_SPEED = 0.08;

const STAGE_2_SPAWN_MS = 1200;
const STAGE_2_SPEED = 0.14;

const STAGE_3_SPAWN_MS = 900;
const STAGE_3_SPEED = 0.22;
```

其他內容：
- `p36_arcade_schema.sql`：包含 `ViewP36ActiveSignals`
- `index.html`
- `style.css`
- `game.js`
- `config.example.js`
