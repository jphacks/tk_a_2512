// script.js

// ==== 初期データ ====
let monsterHP = 0;      // 初期は0（Todo作成前は非表示）
let monsterMaxHP = 0;

const todos = [];  // 最初は空配列

// ★★★ プレイヤーのステータス ★★★
let playerLevel = 1;       // プレイヤーの現在のレベル
let playerXP = 0;          // プレイヤーの現在の経験値
let xpToNextLevel = 100;   // 次のレベルに必要な経験値
const MONSTER_KILL_XP = 50; // モンスター撃破時に獲得する基本XP
// ★★★ ここまでプレイヤーデータ ★★★

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form");
const monsterSection = document.getElementById("monster-section"); // モンスター表示部分
// ★★★ 追加: プレイヤーのステータス表示要素を取得 ★★★
const playerStatusEl = document.getElementById("player-status"); 


// ==== 関数 (レベルアップ・XP関連) ====

// 経験値獲得とレベルアップのロジックを処理
function gainXP(xpAmount) {
    playerXP += xpAmount;

    while (playerXP >= xpToNextLevel) {
        playerXP -= xpToNextLevel; // 超過分を次のレベルに持ち越し
        levelUp();
    }
    // ★ 経験値が変わったので表示を更新 ★
    updatePlayerStatus(); 
}

// プレイヤーのレベルアップ処理
function levelUp() {
    playerLevel++;
    // 次のレベルに必要なXPを増やす (例: 1.5倍)
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5); 

    alert(`🚀 レベルアップ！プレイヤーはレベル ${playerLevel} になりました！`);
    // ★ レベルが上がったので表示を更新 ★
    updatePlayerStatus(); 
}

// ★★★ 追加: プレイヤーのステータス表示を更新する関数 ★★★
function updatePlayerStatus() {
    if (playerStatusEl) {
        playerStatusEl.innerHTML = `
            <p><strong>レベル:</strong> ${playerLevel}</p>
            <p><strong>経験値 (XP):</strong> ${playerXP} / ${xpToNextLevel}</p>
            <div class="xp-bar-container" style="background: #333; height: 10px; border-radius: 5px;">
                <div class="xp-fill" style="
                    width: ${(playerXP / xpToNextLevel) * 100}%; 
                    height: 100%; 
                    background: limegreen; 
                    border-radius: 5px;
                    transition: width 0.3s;
                "></div>
            </div>
        `;
    }
}
// ★★★ ここまで追加 ★★★


// ==== 関数 (描画・操作) ====

// ToDoリストを画面に描画
function renderTodos() {
    listEl.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        if (todo.done) li.classList.add("done");
        
        li.textContent = `${todo.title}（攻撃力: ${todo.attack}）`; 
        
        li.onclick = () => completeTask(index);
        listEl.appendChild(li);
    });
}

// HPバーを更新
function updateHPBar() {
    if (monsterMaxHP === 0) return;
    const hpPercent = (monsterHP / monsterMaxHP) * 100;
    hpFillEl.style.width = `${hpPercent}%`;
    hpFillEl.style.background = hpPercent <= 0 ? "gray" : "red";
}

// モンスターのヒットアニメーション
function monsterHitAnimation() {
    monsterImg.classList.add("hit");
    setTimeout(() => monsterImg.classList.remove("hit"), 200);
}

// タスク完了処理
function completeTask(index) {
    if (todos[index].done || monsterHP <= 0) return;

    // ★ タスク完了時はXP獲得なし（モンスター撃破時のみ）

    todos[index].done = true;
    monsterHP -= todos[index].attack;
    if (monsterHP < 0) monsterHP = 0;

    renderTodos();
    updateHPBar();
    monsterHitAnimation();

    if (monsterHP === 0) {
        // ★★★ モンスターを倒した時にXPを獲得し、レベルアップを判定 ★★★
        const xpGained = MONSTER_KILL_XP + Math.floor(monsterMaxHP / 2); // 基礎XP + 最大HPの半分をボーナス
        gainXP(xpGained);
        // ★★★ ここまで変更 ★★★

        // 完全にモンスターを倒した際の処理（アラート）
        setTimeout(() => alert(`🎉 モンスターを倒した！${xpGained}XPを獲得！次のクエストへ！`), 300);
    }
}

// 新しいToDoを作成する関数
function addTodo(title, difficulty) {
    let attackValue;
    
    switch(difficulty) {
        case '1': attackValue = 5; break;
        case '2': attackValue = 15; break;
        case '3': attackValue = 30; break;
        default: attackValue = 10;
    }

    const newTodo = { title: title, attack: attackValue, done: false };
    todos.push(newTodo);

    // モンスターHP/最大HPを更新
    monsterHP = todos.reduce((sum, t) => sum + (t.done ? 0 : t.attack), 0);
    monsterMaxHP = todos.reduce((sum, t) => sum + t.attack, 0);

    renderTodos();
    updateHPBar();

    // Todoが1件以上になったらモンスター表示
    if (todos.length > 0) {
        monsterSection.classList.remove("hidden");
    }
}

// フォームの送信イベントリスナー
if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = document.getElementById("todo-title");
        const difficultySelect = document.getElementById("todo-difficulty");

        const title = titleInput.value.trim();
        const difficulty = difficultySelect ? difficultySelect.value : '2';

        if (title) {
            addTodo(title, difficulty);
            titleInput.value = '';
        }
    });
}


// ==== 初期化 ====
renderTodos();
updateHPBar();
// ★★★ 初期表示 ★★★
updatePlayerStatus();