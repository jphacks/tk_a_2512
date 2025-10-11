// ==== 初期データ ====
let monsterHP = 0;  // 初期は0（Todo作成前は非表示）
let monsterMaxHP = 0;

const todos = [];  // 最初は空配列

// ==== 要素取得 ====
const listEl = document.getElementById("todo-list");
const hpFillEl = document.getElementById("monster-hp-fill");
const monsterImg = document.getElementById("monster");
const todoForm = document.getElementById("todo-form");
const monsterSection = document.getElementById("monster-section"); // モンスター表示部分

// ==== 関数 ====

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
    if (monsterMaxHP === 0) return; // Todo作成前は何もしない
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

    todos[index].done = true;
    monsterHP -= todos[index].attack;
    if (monsterHP < 0) monsterHP = 0;

    renderTodos();
    updateHPBar();
    monsterHitAnimation();

    if (monsterHP === 0) {
        setTimeout(() => alert("🎉 モンスターを倒した！次のクエストへ！"), 300);
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

    // モンスターHPを全Todoの合計攻撃力にする
    monsterHP = todos.reduce((sum, t) => sum + t.attack, 0);
    monsterMaxHP = monsterHP;

    renderTodos();
    updateHPBar();

    // Todoが1件以上になったらモンスター表示
    if (todos.length === 1) {
        monsterSection.classList.remove("hidden");
    }
}

// フォームの送信イベントリスナー
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); // ページ再読み込み防止

    const titleInput = document.getElementById("todo-title");
    const difficultySelect = document.getElementById("todo-difficulty");

    const title = titleInput.value.trim();
    const difficulty = difficultySelect.value;

    if (title) {
        addTodo(title, difficulty);
        titleInput.value = '';
    }
});

// ==== 初期化 ====
renderTodos();
updateHPBar();
