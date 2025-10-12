// static/script.js (問題修正後の完全版)

// ==== 初期データ ====
let monsterHP = 0;  
let monsterMaxHP = 100;
let isPenaltyActive = false;
let monsterExists = false;

// プレイヤーのステータス
let playerLevel = 1;
let playerExp = 0;
const EXP_TO_LEVEL_UP = 100; 

let todos = []; 
let historyLog = []; 

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
const historyListEl = document.getElementById("history-list"); 
const clearHistoryBtn = document.getElementById("clear-history-btn"); 
const sortSelectEl = document.getElementById("sort-select"); 

// ==== データ永続化関数 ====
function saveAllData() {
    localStorage.setItem('monsterHP', monsterHP);
    localStorage.setItem('playerStatus', JSON.stringify({ level: playerLevel, exp: playerExp }));
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('battleHistory', JSON.stringify(historyLog));
}

function loadAllData() {
    const firstRun = localStorage.getItem('firstRun');

    if (!firstRun) {
        monsterHP = monsterMaxHP;  
        monsterExists = false;      
        todos = [
            { title: "本を読む", attack: 10, expReward: 10, done: false, dueDate: "2025-10-12", expired: false }
        ];
        historyLog = [];
        playerLevel = 1;
        playerExp = 0;

        localStorage.setItem('firstRun', 'done'); 
        saveAllData(); 
    } else {
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

    if (monsterHP > 0 && monsterExists) {
        monsterImg.style.display = "block";
    } else {
        monsterImg.style.display = "none";
    }
}


// ==== 描画・ロジック関数 ====

function renderTodos() {
    listEl.innerHTML = "";
    
    let displayTodos = [...todos]; 
    const sortValue = sortSelectEl ? sortSelectEl.value : 'default';

    switch (sortValue) {
        case 'difficulty-asc':
            displayTodos.sort((a, b) => {
                if (a.done !== b.done) {
                    return a.done ? 1 : -1; 
                }
                // ★修正点: attackがnull/undefinedの場合に0として扱う
                const attackA = a.attack || 0;
                const attackB = b.attack || 0;
                return attackA - attackB;
            });
            break;
        case 'difficulty-desc':
            displayTodos.sort((a, b) => {
                if (a.done !== b.done) {
                    return a.done ? 1 : -1;
                }
                // ★修正点: attackがnull/undefinedの場合に0として扱う
                const attackA = a.attack || 0;
                const attackB = b.attack || 0;
                return attackB - attackA;
            });
            break;
        case 'due-date-asc':
            displayTodos.sort((a, b) => {
                if (a.done !== b.done) {
                    return a.done ? 1 : -1;
                }
                // ★修正点: 日付がない場合は無限大 (最も遅い) として扱う
                const dateA = a.dueDate ? new Date(a.dueDate) : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate) : Infinity;
                return dateA - dateB;
            });
            break;
        case 'default':
        default:
            break;
    }

    displayTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        
        if (todo.done) li.classList.add("done");
        if (todo.expired && !todo.done) li.classList.add("expired");
        
        li.textContent = `${todo.title}（攻:${todo.attack} / 経験値:${todo.expReward} / 期限:${todo.dueDate}）`;
        
        const originalIndex = todos.findIndex(t => t === todo);
        li.onclick = () => completeTask(originalIndex);
        
        listEl.appendChild(li);
    });
    saveAllData();
}

function updateHPBar() {
    if (!monsterExists) {
        hpBarContainer.style.display = "none"; 
        monsterImg.style.display = "none";     
        monsterNameEl.style.display = "none";  
    } else {
        hpBarContainer.style.display = "block"; 
        monsterImg.style.display = "block";
        monsterNameEl.style.display = "inline"; 
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
    
    historyLog.push({
        date: new Date().toISOString().split('T')[0],
        type: 'MONSTER',
        details: `Lv.${playerLevel - 1} モンスターを討伐！`
    });

    updatePlayerStatus();
    monsterHP = monsterMaxHP; 
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

    todos[index].done = true;
    todos[index].doneDate = new Date().toISOString(); 
    todos[index].expired = false;

    addExp(expGained);

    monsterHP -= todos[index].attack;
    if (monsterHP < 0) monsterHP = 0;
    
    historyLog.push({
        date: new Date().toISOString().split('T')[0],
        type: 'TASK',
        details: `「${todos[index].title}」を達成し、モンスターに${todos[index].attack}ダメージを与えた！`
    });

    renderTodos();
    updateHPBar();
    monsterHitAnimation();
    
    checkDeadlines(); 
    renderHistory(); 

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

    if (!monsterExists) {
        createNewMonster();
    }
}

function removeOldCompletedTodos() {
    const now = new Date();

    todos = todos.filter(todo => {
        if (todo.done && todo.doneDate) {
            const doneTime = new Date(todo.doneDate);
            const diffHours = (now - doneTime) / 1000 / 60 / 60;
            if (diffHours >= 24) {
                return false; 
            }
        }
        return true;
    });

    renderTodos();
}


function clearHistory() {
    const confirmed = confirm("本当に達成履歴のデータを全て削除してもよろしいですか？この操作は取り消せません。");
    
    if (confirmed) {
        historyLog = []; 
        renderHistory(); 
        saveAllData(); 
        alert("達成履歴を全て削除しました。");
    }
}

const clearAllBtn = document.getElementById("clear-all-btn");

if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        const confirmed = confirm("本当に全データを削除して初期状態に戻しますか？");
        if (!confirmed) return;

        // localStorage から全データ削除
        localStorage.clear();

        // 初期状態にリセット
        monsterHP = monsterMaxHP;
        monsterExists = false;
        todos = [];
        historyLog = [];
        playerLevel = 1;
        playerExp = 0;

        // 描画更新
        renderTodos();
        updateHPBar();
        updatePlayerStatus();
        renderHistory();

        alert("全データを削除して初期状態に戻しました。");
    });
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

// ソート機能のイベントリスナー
if (sortSelectEl) {
    sortSelectEl.addEventListener('change', renderTodos);
}

// 履歴削除ボタンのイベントリスナー
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory);
}


// ==== 初期化 ====
loadAllData(); 
renderTodos();
updateHPBar();
updatePlayerStatus(); 
renderHistory(); 
checkDeadlines();
removeOldCompletedTodos(); 

setInterval(removeOldCompletedTodos, 60 * 60 * 1000);

function syncPlayerStatusAcrossPages() {
    const savedStatus = localStorage.getItem('playerStatus');
    if (savedStatus) {
        const status = JSON.parse(savedStatus);
        playerLevel = status.level;
        playerExp = status.exp;
        updatePlayerStatus();
    }
}
//  1秒ごとに同期
setInterval(syncPlayerStatusAcrossPages, 1000);

const menuBar = document.getElementById("menu-bar");
const openMenuBarBtn = document.getElementById("open-menu-bar");
const closeMenuBarBtn = document.getElementById("close-menu-bar");

openMenuBarBtn.addEventListener("click", () => {
    menuBar.classList.add("open");
});

closeMenuBarBtn.addEventListener("click", () => {
    menuBar.classList.remove("open");
});