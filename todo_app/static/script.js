// static/script.js

// ==== 初期データ ====
let monsterHP = 0;  
let monsterMaxHP = 100;
let isPenaltyActive = false;
let monsterExists = false;

// プレイヤーのステータス
let playerLevel = 1;
let playerExp = 0;
const EXP_TO_LEVEL_UP = 100; 

let todos = []; // 初期化時にLocalStorageからロードするため空に
let historyLog = []; // 履歴データ構造

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form");
const hpBarContainer = document.getElementById("monster-hp-bar");
const monsterNameEl = document.getElementById("monster-name"); 

// プレイヤーのステータス関連要素
const playerLevelDisplay = document.getElementById("player-level-display");
const playerExpDisplay = document.getElementById("player-exp-display");
const playerExpNextDisplay = document.getElementById("player-exp-next-display");
const xpFillEl = document.getElementById("xp-fill");
const historyListEl = document.getElementById("history-list"); // 履歴リスト要素

// ==== データ永続化関数 ====
function saveAllData() {
    localStorage.setItem('monsterHP', monsterHP);
    localStorage.setItem('playerStatus', JSON.stringify({ level: playerLevel, exp: playerExp }));
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('battleHistory', JSON.stringify(historyLog));
}

function loadAllData() {
    //  初回起動判定
    const firstRun = localStorage.getItem('firstRun');

    if (!firstRun) {
        //  初回起動時の初期化
        monsterHP = monsterMaxHP;  // 初回はモンスター満タン
        monsterExists = false;      // まだ画面には表示しない
        todos = [
            { title: "本を読む", attack: 10, expReward: 10, done: false, dueDate: "2025-10-12", expired: false }
        ];
        historyLog = [];
        playerLevel = 1;
        playerExp = 0;

        localStorage.setItem('firstRun', 'done'); // 初回フラグを保存
        saveAllData(); // 初期値を保存
    } else {
        //  前回の状態を復元
        const savedHP = localStorage.getItem('monsterHP');
        monsterHP = savedHP !== null ? parseInt(savedHP) : monsterMaxHP;

        const savedStatus = localStorage.getItem('playerStatus');
        if (savedStatus) {
            const status = JSON.parse(savedStatus);
            playerLevel = status.level;
            playerExp = status.exp;
        }

        const savedTodos = localStorage.getItem('todos');
        todos = savedTodos ? JSON.parse(savedTodos) : [];

        const savedHistory = localStorage.getItem('battleHistory');
        historyLog = savedHistory ? JSON.parse(savedHistory) : [];
    }

    //  モンスター表示判定
    if (monsterHP > 0 && monsterExists) {
        monsterImg.style.display = "block";
    } else {
        monsterImg.style.display = "none";
    }
}


// ==== 描画・ロジック関数 ====

function renderTodos() {
    listEl.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        
        if (todo.done) li.classList.add("done");
        if (todo.expired && !todo.done) li.classList.add("expired");
        
        li.textContent = `${todo.title}（攻:${todo.attack} / 経験値:${todo.expReward} / 期限:${todo.dueDate}）`;
        li.onclick = () => completeTask(index);
        listEl.appendChild(li);
    });
    saveAllData();
}

function updateHPBar() {
    if (!monsterExists) {
        hpBarContainer.style.display = "none"; // バー非表示
        monsterImg.style.display = "none";     // 画像非表示
        monsterNameEl.style.display = "none";  // 名前非表示
    } else {
        hpBarContainer.style.display = "block"; 
        monsterImg.style.display = "block";
        monsterNameEl.style.display = "inline"; // 名前を表示
        const hpPercent = (monsterHP / monsterMaxHP) * 100;
        hpFillEl.style.width = `${hpPercent}%`;
        hpFillEl.style.background = monsterHP <= 0 ? "gray" : "red";
    }
    saveAllData();
}


function updatePlayerStatus() {
    const expPercent = (playerExp / EXP_TO_LEVEL_UP) * 100;
    
    playerLevelDisplay.textContent = `Lv.${playerLevel}`;
    playerExpDisplay.textContent = playerExp;
    playerExpNextDisplay.textContent = EXP_TO_LEVEL_UP;
    xpFillEl.style.width = `${expPercent}%`;
    saveAllData();
}

function renderHistory() {
    historyListEl.innerHTML = "";
    // 最新の履歴から表示するために reverse() を使う
    historyLog.slice().reverse().forEach(log => {
        const li = document.createElement("li");
        li.textContent = `[${log.date}] ${log.type === 'TASK' ? 'クエスト達成' : 'モンスター討伐'}: ${log.details}`;
        historyListEl.appendChild(li);
    });
    saveAllData();
}


function addExp(amount) {
    playerExp += amount;
    
    if (playerExp > EXP_TO_LEVEL_UP) {
        playerExp = EXP_TO_LEVEL_UP;
    }
    
    updatePlayerStatus();
}

function levelUp() {
    playerLevel++;
    playerExp = 0;
    alert(`🎉 レベルアップ！Lv.${playerLevel} になった！`);
    
    // ★履歴記録: モンスター討伐ログ
    historyLog.push({
        date: new Date().toISOString().split('T')[0],
        type: 'MONSTER',
        details: `Lv.${playerLevel - 1} モンスターを討伐！`
    });

    updatePlayerStatus();
    monsterHP = monsterMaxHP; // HPリセット
    updateHPBar();
    renderHistory();
}


function monsterHitAnimation() {
  monsterImg.classList.add("hit");
  setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

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


function completeTask(index) {
  if (todos[index].done || !monsterExists) return;

  const expGained = todos[index].expReward; 
  
  // ★履歴記録: タスク達成ログ
  historyLog.push({
      date: new Date().toISOString().split('T')[0],
      type: 'TASK',
      details: `${todos[index].title} を達成し、${expGained} EXPを獲得。`
  });

  addExp(expGained);

  todos[index].done = true;
  todos[index].expired = false; 
  monsterHP -= todos[index].attack;
  if (monsterHP < 0) monsterHP = 0;

  renderTodos();
  updateHPBar();
  monsterHitAnimation();
  
  checkDeadlines(); 
  renderHistory(); // 履歴リストを更新

  if (monsterHP === 0) {
    setTimeout(() => {
        alert("🎉 モンスターを倒した！");
        levelUp(); 
        createNewMonster();
    }, 300);
  }
}

// ==== モンスター生成関数 ====
function createNewMonster() {
    monsterHP = monsterMaxHP;
    monsterExists = true;
    monsterImg.style.display = "block";

    alert("👾 新しいモンスターが現れた！");
    updateHPBar();
    saveAllData();
}

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
        expReward: expRewardValue,
        done: false,
        dueDate: dueDate,
        expired: false
    };

    todos.push(newTodo);
    renderTodos(); 

    //  モンスターがいなければ生成
    if (!monsterExists) {
        createNewMonster();
    }
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
loadAllData(); // ★最重要: 最初にデータをロードする
renderTodos();
updateHPBar();
updatePlayerStatus(); 
renderHistory(); // 履歴を初期描画
checkDeadlines();

const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");

openSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
});

closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
});
