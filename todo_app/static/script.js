// ==== 初期データ ====
let monsterHP = 100;  // 初期HP
let monsterMaxHP = 100;

// ★★★ プレイヤーのステータス追加 ★★★
let playerLevel = 1;       // プレイヤーの現在のレベル
let playerXP = 0;          // プレイヤーの現在の経験値
let xpToNextLevel = 100;   // 次のレベルに必要な経験値
// ★★★ ここまで追加 ★★★

const todos = [
  // 各Todoに経験値報酬 (xpReward) を追加
  { title: "本を読む", attack: 10, done: false, xpReward: 30 },
  { title: "課題を1つ終える", attack: 20, done: false, xpReward: 50 },
  { title: "部屋を掃除する", attack: 5, done: false, xpReward: 10 }
];

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");

// ==== 関数 ====
function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (todo.done) li.classList.add("done");
    
    // XP報酬も表示に含める場合は以下のように変更できます
    li.textContent = `${todo.title}（攻撃力: ${todo.attack} / 経験値: ${todo.xpReward}）`;
    
    li.onclick = () => completeTask(index);
    listEl.appendChild(li);
  });
}

function updateHPBar() {
  const hpPercent = (monsterHP / monsterMaxHP) * 100;
  hpFillEl.style.width = `${hpPercent}%`;
  if (hpPercent <= 0) {
    hpFillEl.style.background = "gray";
  }
}

// ★★★ 経験値獲得とレベルアップの関数を追加 ★★★
function gainXP(xpAmount) {
  playerXP += xpAmount;

  // 経験値が次のレベルに達するまでレベルアップを繰り返す
  while (playerXP >= xpToNextLevel) {
    playerXP -= xpToNextLevel; // 超過分を次のレベルに持ち越し
    levelUp();
  }
  // ★ 今後、経験値バーの更新処理などをここに追加 ★
}

function levelUp() {
  playerLevel++;
  // 次のレベルに必要なXPを増やす (例: 1.5倍)
  xpToNextLevel = Math.floor(xpToNextLevel * 1.5); 

  // レベルアップの通知
  alert(`🚀 レベルアップ！プレイヤーはレベル ${playerLevel} になりました！`);
  
  // (ここに、レベルアップに伴うプレイヤーのステータス上昇処理などを追加できます)
}
// ★★★ ここまで追加 ★★★

function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

function completeTask(index) {
  if (todos[index].done || monsterHP <= 0) return;

  const todo = todos[index]; // Todoデータを取得

  // ★★★ 経験値獲得の処理を追加 ★★★
  gainXP(todo.xpReward);

  todo.done = true;
  monsterHP -= todo.attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();

  if (monsterHP === 0) {
    // モンスター撃破のメッセージを変更
    setTimeout(() => alert("🎉 モンスターを倒した！次の戦いに備えよう！"), 300);
  }
}

// ==== 初期化 ====
renderTodos();
updateHPBar();