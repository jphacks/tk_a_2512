// script.js

// ==== 初期データ ====
let monsterHP = 100;  // 初期HP
let monsterMaxHP = 100;
let isPenaltyActive = false;

// ★追加: プレイヤーのステータス
let playerLevel = 1;
let playerExp = 0;
const EXP_TO_LEVEL_UP = 100; // 次のレベルに必要な経験値 (固定値とする)
const EXP_PER_MONSTER = 50; // モンスター討伐時のボーナス経験値

const todos = [
  // ★expRewardを追加
  { title: "本を読む", attack: 10, expReward: 10, done: false, dueDate: "2025-10-12", expired: false },
  { title: "課題を1つ終える", attack: 20, expReward: 30, done: false, dueDate: "2025-10-15", expired: false },
  { title: "部屋を掃除する", attack: 5, expReward: 5, done: false, dueDate: "2025-10-18", expired: false }
];

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form");

// ★追加: プレイヤーのステータス関連要素
const playerLevelDisplay = document.getElementById("player-level-display");
const playerExpDisplay = document.getElementById("player-exp-display");
const playerExpNextDisplay = document.getElementById("player-exp-next-display");
const xpFillEl = document.getElementById("xp-fill");


// ==== 関数 ====

function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    
    if (todo.done) li.classList.add("done");
    if (todo.expired && !todo.done) li.classList.add("expired");
    
    // ★変更: 経験値報酬も表示に追加
    li.textContent = `${todo.title}（攻:${todo.attack} / 経験値:${todo.expReward} / 期限:${todo.dueDate}）`;
    li.onclick = () => completeTask(index);
    listEl.appendChild(li);
  });
}

function updateHPBar() {
  const hpPercent = (monsterHP / monsterMaxHP) * 100;
  hpFillEl.style.width = `${hpPercent}%`;
  hpFillEl.style.background = monsterHP <= 0 ? "gray" : "red";
}

// ★追加: プレイヤーEXP/Lvを更新する関数
function updatePlayerStatus() {
    const expPercent = (playerExp / EXP_TO_LEVEL_UP) * 100;
    
    // HTML要素のテキストと幅を更新
    playerLevelDisplay.textContent = `Lv.${playerLevel}`;
    playerExpDisplay.textContent = playerExp;
    playerExpNextDisplay.textContent = EXP_TO_LEVEL_UP;
    xpFillEl.style.width = `${expPercent}%`;
}

// ★追加: 経験値加算とレベルアップのロジック
function addExp(amount) {
    playerExp += amount;
    
    // レベルアップ判定は completeTask でのみ行うため、ここでは EXP の上限チェックのみ
    if (playerExp > EXP_TO_LEVEL_UP) {
        playerExp = EXP_TO_LEVEL_UP;
    }
    
    updatePlayerStatus();
}

// ★追加: モンスター撃破時のレベルアップ処理
function levelUp() {
    playerLevel++;
    playerExp = 0; // EXPをリセット
    alert(`🎉 レベルアップ！Lv.${playerLevel} になった！`);
    updatePlayerStatus();
    
    // 次のモンスターの準備（HPリセット、新しいモンスターに変更するなど）
    monsterHP = monsterMaxHP;
    updateHPBar();
}


function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

// ... (checkDeadlines, applyPenalty, removePenalty 関数は省略、ロジック変更なし) ...
function checkDeadlines() {
    const today = new Date().toISOString().split('T')[0]; 
    let expiredCount = 0;
    
    todos.forEach(todo => {
        if (!todo.done && todo.dueDate && todo.dueDate < today) {
            todo.expired = true;
            expiredCount++;
        }
    });

    if (expiredCount > 0 && !isPenaltyActive) {
        applyPenalty(expiredCount);
    } else if (expiredCount === 0 && isPenaltyActive) {
        removePenalty();
    }
    
    renderTodos(); 
}

function applyPenalty(count) {
    isPenaltyActive = true;
    monsterHP += count * 20;
    if (monsterHP > monsterMaxHP) monsterHP = monsterMaxHP;
    
    alert(`🚨 警告！未完了のタスク ${count} 件が期限切れです。モンスターのHPが ${count * 20} 回復し、怒り狂っています！`);
    updateHPBar();
    monsterImg.classList.add("penalty-mode");
}

function removePenalty() {
    isPenaltyActive = false;
    alert("✨ 期限切れタスクがなくなりました！モンスターの怒りが静まりました。");
    monsterImg.classList.remove("penalty-mode");
}


// ★変更: completeTask 関数に経験値獲得ロジックを追加
function completeTask(index) {
  if (todos[index].done || monsterHP <= 0) return;

  // 経験値獲得
  const expGained = todos[index].expReward; 
  addExp(expGained); // 経験値を加算

  // モンスターへのダメージ処理
  todos[index].done = true;
  todos[index].expired = false; 
  monsterHP -= todos[index].attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();
  
  checkDeadlines(); 

  if (monsterHP === 0) {
    setTimeout(() => {
        alert("🎉 モンスターを倒した！");
        levelUp(); // ★レベルアップ関数を呼び出し
    }, 300);
  }
}

// ★変更: addTodo 関数に経験値報酬の設定ロジックを追加
function addTodo(title, difficulty, dueDate) {
    let attackValue;
    let expRewardValue; 

    switch(difficulty) {
        case '1':
            attackValue = 5;
            expRewardValue = 10;
            break;
        case '2':
            attackValue = 15;
            expRewardValue = 30;
            break;
        case '3':
            attackValue = 30;
            expRewardValue = 50;
            break;
        default:
            attackValue = 10;
            expRewardValue = 20;
    }

    const newTodo = {
        title: title,
        attack: attackValue,
        expReward: expRewardValue, // ★追加
        done: false,
        dueDate: dueDate,
        expired: false
    };

    todos.push(newTodo);
    renderTodos(); 
}

// フォームの送信イベントリスナー
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const titleInput = document.getElementById("todo-title");
    const difficultySelect = document.getElementById("todo-difficulty");
    const dateInput = document.getElementById("todo-due-date");
    
    const title = titleInput.value.trim();
    const difficulty = difficultySelect.value;
    const dueDate = dateInput.value;
    
    if (title && dueDate) {
        addTodo(title, difficulty, dueDate);
        titleInput.value = ''; 
        dateInput.value = ''; 
        
        checkDeadlines(); 
    }
});


// ==== 初期化 ====
renderTodos();
updateHPBar();
updatePlayerStatus(); // ★追加: プレイヤーのステータスを初期表示
checkDeadlines();