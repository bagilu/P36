// P36 Arcade v2.2 Slow Start Signal Conveyor
// 調整重點：慢速開場、逐步加壓、最後 Final Rush。
// 本版仍先用本地題庫。下一版可改為從 Supabase ViewP36ActiveSignals 讀取。

const bank = [
  ['競爭品牌降價20%', 'important', 'crisis'],
  ['競爭者退出市場', 'important', 'opportunity'],
  ['回購率下降8%', 'important', 'crisis'],
  ['環保商品搜尋量上升', 'important', 'opportunity'],
  ['CEO生日上新聞', 'noise', 'none'],
  ['粉專新增10個按讚', 'noise', 'none'],
  ['港口罷工導致物流停擺', 'important', 'crisis'],
  ['產品開箱影片爆紅', 'important', 'opportunity'],
  ['AI工具降低營運成本', 'important', 'opportunity'],
  ['新技術替代現有產品', 'important', 'crisis']
];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let signals = [];
let score = 0;
let timer = 60;
let running = false;

// ===== 節奏參數：主要調整這裡 =====
// 第一段：慢速開場
const STAGE_1_SPAWN_MS = 1500;
const STAGE_1_SPEED = 0.08;

// 第二段：開始有壓力
const STAGE_2_SPAWN_MS = 1200;
const STAGE_2_SPEED = 0.14;

// 第三段：Final Rush
const STAGE_3_SPAWN_MS = 900;
const STAGE_3_SPEED = 0.22;

let spawnMs = STAGE_1_SPAWN_MS;
let speed = STAGE_1_SPEED;
let lastSpawn = 0;
let lastT = 0;

const activeLine = 640;
const activeHeight = 80;
const bottomLimit = 720;

function makeSignal() {
  const q = bank[Math.floor(Math.random() * bank.length)];
  signals.push({
    text: q[0],
    importance: q[1],
    impact: q[2],
    y: -70,
    state: 'fall',
    flash: 0,
    color: null,
    awaitImpact: false,
    alpha: 1
  });
}

function startGame() {
  signals = [];
  score = 0;
  timer = 60;
  running = true;

  // 慢速開場
  spawnMs = STAGE_1_SPAWN_MS;
  speed = STAGE_1_SPEED;

  document.getElementById('timer').innerText = timer;
  updateScore();

  lastSpawn = performance.now();
  lastT = performance.now();

  // 一開始先產生一題，不要等1.5秒才看到
  makeSignal();

  requestAnimationFrame(loop);

  const clock = setInterval(() => {
    if (!running) {
      clearInterval(clock);
      return;
    }

    timer--;
    document.getElementById('timer').innerText = timer;

    if (timer === 40) {
      spawnMs = STAGE_2_SPAWN_MS;
      speed = STAGE_2_SPEED;
    }

    if (timer === 20) {
      spawnMs = STAGE_3_SPAWN_MS;
      speed = STAGE_3_SPEED;
      showFinalRush();
    }

    if (timer <= 0) {
      running = false;
      clearInterval(clock);
    }
  }, 1000);
}

function showFinalRush() {
  // 簡單提示；後續可改為音效或大型動畫
  const scoreEl = document.getElementById('score');
  scoreEl.innerText = 'FINAL RUSH! Score ' + score;
  setTimeout(updateScore, 1200);
}

function activeSignal() {
  const candidates = signals
    .filter(s => s.state === 'fall' && s.y < activeLine + activeHeight)
    .sort((a, b) => b.y - a.y);

  return candidates[0] || null;
}

function judgeImportance(ans) {
  if (!running) return;

  const a = activeSignal();
  if (!a) return;

  if (ans === a.importance) {
    if (ans === 'noise') {
      markSignal(a, true);
      score += 10;
      updateScore();
    } else {
      a.awaitImpact = true;
      a.color = '#355d8c';
    }
  } else {
    markSignal(a, false);
    score -= 5;
    updateScore();
  }
}

function judgeImpact(ans) {
  if (!running) return;

  const a = activeSignal();
  if (!a || !a.awaitImpact) return;

  if (ans === a.impact) {
    markSignal(a, true);
    score += 10;
  } else {
    markSignal(a, false);
    score -= 5;
  }

  updateScore();
}

function markSignal(signal, ok) {
  signal.state = 'flash';
  signal.flash = 1000;
  signal.color = ok ? '#00ff88' : '#ff3344';
}

function updateScore() {
  document.getElementById('score').innerText = 'Score ' + score;
}

function drawCard(signal, isActive) {
  ctx.save();
  ctx.globalAlpha = signal.alpha;

  const x = 170;
  const w = 760;
  const h = 64;

  ctx.fillStyle = signal.color || (isActive ? '#1f6f8b' : '#163842');
  ctx.fillRect(x, signal.y, w, h);

  ctx.strokeStyle = isActive ? '#fff799' : '#66ffcc';
  ctx.lineWidth = isActive ? 4 : 2;
  ctx.strokeRect(x, signal.y, w, h);

  if (signal.awaitImpact && signal.state === 'fall') {
    ctx.fillStyle = '#fff799';
    ctx.font = '22px Arial';
    ctx.fillText('等待玩家B判斷', x + 560, signal.y + 42);
  }

  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  ctx.fillText(signal.text, x + 30, signal.y + 40);

  ctx.restore();
}

function loop(timestamp) {
  if (!running) {
    render();
    return;
  }

  if (timestamp - lastSpawn > spawnMs) {
    makeSignal();
    lastSpawn = timestamp;
  }

  const dt = timestamp - lastT;
  lastT = timestamp;

  signals.forEach(s => {
    if (s.state === 'fall') {
      s.y += speed * dt;
    }

    if (s.state === 'flash') {
      s.flash -= dt;
      s.alpha = Math.max(0, s.flash / 1000);
      if (s.flash <= 0) {
        s.remove = true;
      }
    }

    if (s.state === 'fall' && s.y > bottomLimit) {
      markSignal(s, false);
    }
  });

  signals = signals.filter(s => !s.remove);

  render();
  requestAnimationFrame(loop);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Active zone
  ctx.strokeStyle = '#ffee55';
  ctx.lineWidth = 5;
  ctx.strokeRect(120, activeLine, 860, activeHeight);

  ctx.font = '24px Arial';
  ctx.fillStyle = '#ffee55';
  ctx.fillText('ACTIVE SIGNAL ZONE', 430, activeLine - 15);

  // Stage label
  ctx.font = '22px Arial';
  ctx.fillStyle = '#8ef';
  let stageText = 'STAGE 1 觀察期';
  if (timer <= 40 && timer > 20) stageText = 'STAGE 2 加速期';
  if (timer <= 20) stageText = 'FINAL RUSH';
  ctx.fillText(stageText, 40, 40);

  const a = activeSignal();
  signals.forEach(s => drawCard(s, s === a));

  if (!running && timer <= 0) {
    ctx.font = '64px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER', 360, 360);
  }
}

render();
