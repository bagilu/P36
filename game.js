// P36 Arcade v2.4 Supabase Questions + Keyboard
// 題目從 Supabase ViewP36ActiveSignals 載入；失敗時使用本地備用題庫。

let bank = [
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

const fallbackBank = [...bank];

let supabaseClient = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let signals = [];
let score = 0;
let timer = 60;
let running = false;

// ===== 節奏參數 =====
// 第一段：約10秒落到底，約5秒出下一題
const STAGE_1_SPAWN_MS = 5000;
const STAGE_1_SPEED = 0.079;

// 第二段：開始進入遊戲節奏
const STAGE_2_SPAWN_MS = 3500;
const STAGE_2_SPEED = 0.12;

// 第三段：明顯加壓
const STAGE_3_SPAWN_MS = 2200;
const STAGE_3_SPEED = 0.18;

// 最後10秒：Final Rush
const STAGE_4_SPAWN_MS = 1500;
const STAGE_4_SPEED = 0.26;

let spawnMs = STAGE_1_SPAWN_MS;
let speed = STAGE_1_SPEED;
let lastSpawn = 0;
let lastT = 0;

const activeLine = 640;
const activeHeight = 80;
const bottomLimit = 720;

function setDataStatus(text) {
  const el = document.getElementById('dataStatus');
  if (el) el.innerText = text;
}

async function loadSignalsFromSupabase() {
  try {
    if (
      typeof supabase === 'undefined' ||
      typeof SUPABASE_URL === 'undefined' ||
      typeof SUPABASE_ANON_KEY === 'undefined' ||
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      SUPABASE_URL.includes('YOUR-PROJECT')
    ) {
      setDataStatus('題庫：本地備用');
      bank = fallbackBank;
      return;
    }

    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabaseClient
      .from('ViewP36ActiveSignals')
      .select('signal_text, importance_answer, impact_answer')
      .limit(1000);

    if (error) {
      console.error('Supabase load error:', error);
      setDataStatus('題庫：本地備用');
      bank = fallbackBank;
      return;
    }

    if (!data || data.length === 0) {
      setDataStatus('題庫：無資料');
      bank = fallbackBank;
      return;
    }

    bank = data.map(row => [
      row.signal_text,
      row.importance_answer,
      row.impact_answer || 'none'
    ]);

    setDataStatus('題庫：Supabase ' + bank.length + '題');
  } catch (err) {
    console.error('Load signals failed:', err);
    setDataStatus('題庫：本地備用');
    bank = fallbackBank;
  }
}

function makeSignal() {
  if (!bank || bank.length === 0) bank = fallbackBank;

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

  spawnMs = STAGE_1_SPAWN_MS;
  speed = STAGE_1_SPEED;

  document.getElementById('timer').innerText = timer;
  updateScore();

  lastSpawn = performance.now();
  lastT = performance.now();

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
      showStageNotice('STAGE 2 加速期');
    }

    if (timer === 20) {
      spawnMs = STAGE_3_SPAWN_MS;
      speed = STAGE_3_SPEED;
      showStageNotice('STAGE 3 高壓期');
    }

    if (timer === 10) {
      spawnMs = STAGE_4_SPAWN_MS;
      speed = STAGE_4_SPEED;
      showStageNotice('FINAL RUSH!');
    }

    if (timer <= 0) {
      running = false;
      clearInterval(clock);
    }
  }, 1000);
}

function showStageNotice(text) {
  const scoreEl = document.getElementById('score');
  scoreEl.innerText = text + '  Score ' + score;
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

  ctx.strokeStyle = '#ffee55';
  ctx.lineWidth = 5;
  ctx.strokeRect(120, activeLine, 860, activeHeight);

  ctx.font = '24px Arial';
  ctx.fillStyle = '#ffee55';
  ctx.fillText('ACTIVE SIGNAL ZONE', 430, activeLine - 15);

  ctx.font = '22px Arial';
  ctx.fillStyle = '#8ef';

  let stageText = 'STAGE 1 觀察期';
  if (timer <= 40 && timer > 20) stageText = 'STAGE 2 加速期';
  if (timer <= 20 && timer > 10) stageText = 'STAGE 3 高壓期';
  if (timer <= 10) stageText = 'FINAL RUSH';

  ctx.fillText(stageText, 40, 40);

  const a = activeSignal();
  signals.forEach(s => drawCard(s, s === a));

  if (!running && timer <= 0) {
    ctx.font = '64px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER', 360, 360);
  }
}

// 鍵盤操作
document.addEventListener('keydown', function(event) {
  const key = event.key.toLowerCase();

  if (key === 's') {
    judgeImportance('important');
  } else if (key === 'd') {
    judgeImportance('noise');
  } else if (key === 'k') {
    judgeImpact('opportunity');
  } else if (key === 'l') {
    judgeImpact('crisis');
  }
});

// 初始載入
render();
loadSignalsFromSupabase();
